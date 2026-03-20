import { useQuery } from "@tanstack/react-query";
import { Match, MATCHES } from "@/data/matches";
import { AdminStore } from "@/store/AdminStore";

const API_BASE = process.env["EXPO_PUBLIC_DOMAIN"]
  ? `https://${process.env["EXPO_PUBLIC_DOMAIN"]}/api`
  : null;

const TSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";

export type ApiSource =
  | "api"
  | "fallback_api"
  | "tsdb"
  | "cache"
  | "stale_cache"
  | "api_empty"
  | "no_key"
  | "error"
  | "loading"
  | "mock";

export type MatchesResult = {
  matches: Match[];
  source: ApiSource;
};

const LEAGUE_PRIORITY: Record<string, number> = {
  "Champions League": 1,
  "Premier League":   2,
  "Europa League":    3,
  "La Liga":          4,
  "Serie A":          5,
  "Bundesliga":       6,
  "Saudi Pro League": 7,
  "Primeira Liga":    8,
  "Süper Lig":        9,
};

function getSomaliaDateStr(offsetDays = 0): string {
  const SOMALIA_OFFSET_MS = 3 * 60 * 60 * 1000;
  const d = new Date(Date.now() + SOMALIA_OFFSET_MS + offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

function mapTsdbStatus(s: string | null | undefined): "live" | "upcoming" | "finished" {
  if (!s) return "upcoming";
  const up = s.toUpperCase();
  const liveMarkers = ["1H", "2H", "ET", "BT", "HT", "LIVE", "IN PLAY", "SUSP", "INT"];
  const finishedMarkers = ["MATCH FINISHED", "FT", "AET", "PEN", "AP", "FINISHED", "AOT"];
  if (liveMarkers.some((m) => up.includes(m))) return "live";
  if (finishedMarkers.some((m) => up.includes(m))) return "finished";
  return "upcoming";
}

function makeAbbr(name: string): string {
  const cleaned = name
    .replace(/\b(FC|SC|CF|AC|AS|RC|SD|CD|SL|UD|RCD|CA|CP|FK|SK|NK)\b/gi, "")
    .replace(/\b(United|City|Athletic|Atletico|Real|Club|Sporting|Dynamo|Dinamo)\b/gi, "")
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0] + (words[2]?.[0] ?? words[1][1] ?? "")).toUpperCase();
  }
  return cleaned.slice(0, 3).toUpperCase() || name.slice(0, 3).toUpperCase();
}

function formatDisplayDate(dateStr: string): string {
  const today = getSomaliaDateStr(0);
  const yesterday = getSomaliaDateStr(-1);
  const tomorrow = getSomaliaDateStr(1);
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  if (dateStr === tomorrow) return "Tomorrow";
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatKickoffTime(timeStr: string | null | undefined): string {
  if (!timeStr) return "TBD";
  return timeStr.slice(0, 5);
}

async function fetchFromTheSportsDB(
  adminUrls: Record<string, string>
): Promise<Match[]> {
  const days = [getSomaliaDateStr(-1), getSomaliaDateStr(0), getSomaliaDateStr(1)];
  const eventMap = new Map<string, any>();

  await Promise.allSettled(
    days.map(async (day) => {
      try {
        const res = await fetch(
          `${TSDB_BASE}/eventsday.php?d=${day}&s=Soccer`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const json = await res.json();
        const events: any[] = json?.events ?? [];
        for (const ev of events) {
          if (ev.idEvent) eventMap.set(ev.idEvent, { ...ev, _day: day });
        }
      } catch {}
    })
  );

  if (eventMap.size === 0) return [];

  const matches: Match[] = [];
  for (const ev of eventMap.values()) {
    const dateStr: string = ev.dateEvent ?? ev._day ?? getSomaliaDateStr(0);
    const status = mapTsdbStatus(ev.strStatus);
    const id = `tsdb_${ev.idEvent}`;

    matches.push({
      id,
      sport: "Soccer",
      league: ev.strLeague ?? "Football",
      leagueLogo: ev.strLeagueBadge ?? ev.strLeagueIconThumb ?? "",
      homeTeam: ev.strHomeTeam ?? "Home",
      homeAbbr: makeAbbr(ev.strHomeTeam ?? "HME"),
      awayTeam: ev.strAwayTeam ?? "Away",
      awayAbbr: makeAbbr(ev.strAwayTeam ?? "AWY"),
      homeScore:
        ev.intHomeScore !== null &&
        ev.intHomeScore !== "" &&
        ev.intHomeScore !== undefined
          ? Number(ev.intHomeScore)
          : null,
      awayScore:
        ev.intAwayScore !== null &&
        ev.intAwayScore !== "" &&
        ev.intAwayScore !== undefined
          ? Number(ev.intAwayScore)
          : null,
      status,
      minute: ev.intTimer ? Number(ev.intTimer) : undefined,
      startTime: formatKickoffTime(ev.strTime),
      date: formatDisplayDate(dateStr),
      venue: ev.strVenue ?? "",
      streamUrl: adminUrls[id],
      homeColor: "#6B7280",
      awayColor: "#6B7280",
      homeLogo: ev.strHomeTeamBadge ?? null,
      awayLogo: ev.strAwayTeamBadge ?? null,
    });
  }

  return matches.sort((a, b) => {
    const statusOrder = { live: 0, upcoming: 1, finished: 2 };
    const sA = statusOrder[a.status];
    const sB = statusOrder[b.status];
    if (sA !== sB) return sA - sB;
    const pA = LEAGUE_PRIORITY[a.league] ?? 999;
    const pB = LEAGUE_PRIORITY[b.league] ?? 999;
    return pA - pB;
  });
}

function sortedMockMatches(adminUrls: Record<string, string>): Match[] {
  const statusOrder = { live: 0, upcoming: 1, finished: 2 };
  return MATCHES.map((m) => ({
    ...m,
    streamUrl: adminUrls[m.id] || m.streamUrl || undefined,
  })).sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
}

async function fetchMatches(): Promise<MatchesResult> {
  const adminUrls = await AdminStore.getStreamUrls();

  if (API_BASE) {
    try {
      const apiRes = await fetch(`${API_BASE}/matches`, {
        cache: "no-store",
      }).then((r) => r.json());
      const raw: any[] = apiRes?.matches ?? [];
      const source: ApiSource = apiRes?.source ?? "error";
      if (raw.length > 0) {
        const matches = raw.map((m: any) => ({
          ...m,
          streamUrl: adminUrls[m.id] || m.streamUrl || undefined,
        })) as Match[];
        return { matches, source };
      }
    } catch {}
  }

  try {
    const tsdbMatches = await fetchFromTheSportsDB(adminUrls);
    if (tsdbMatches.length > 0) {
      return { matches: tsdbMatches, source: "tsdb" };
    }
  } catch (err) {
    console.warn("TheSportsDB fetch failed:", err);
  }

  console.info("All live sources unavailable — using mock data");
  return { matches: sortedMockMatches(adminUrls), source: "mock" };
}

export function useMatches() {
  return useQuery<MatchesResult>({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    refetchInterval: 5 * 60_000,
    staleTime: 4 * 60_000,
    retry: 1,
    placeholderData: { matches: [], source: "loading" },
  });
}

export function useMatchById(id: string) {
  const { data, ...rest } = useMatches();
  return {
    match: data?.matches?.find((m) => m.id === id) ?? null,
    ...rest,
  };
}
