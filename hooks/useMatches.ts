import { useQuery } from "@tanstack/react-query";
import { Match, MATCHES } from "@/data/matches";
import { AdminStore } from "@/store/AdminStore";

// ── API Server (primary — when domain is configured) ──────────────────────────
const API_BASE = process.env["EXPO_PUBLIC_DOMAIN"]
  ? `https://${process.env["EXPO_PUBLIC_DOMAIN"]}/api`
  : null;

// ── football-data.org (direct — for APK when server not available) ────────────
const FD_KEY = process.env["EXPO_PUBLIC_FD_API_KEY"] ?? null;
const FD_BASE = "https://api.football-data.org/v4";

// ── TheSportsDB (free, no key required) ───────────────────────────────────────
const TSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";

export type ApiSource =
  | "api"
  | "fallback_api"
  | "fd_direct"
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

// ── Shared constants ──────────────────────────────────────────────────────────

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
  "Ligue 1":          10,
  "Eredivisie":       11,
};

function getSomaliaDateStr(offsetDays = 0): string {
  const EAT_OFFSET = 3 * 60 * 60 * 1000;
  const d = new Date(Date.now() + EAT_OFFSET + offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
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

function sortMatches(matches: Match[]): Match[] {
  const statusOrder = { live: 0, upcoming: 1, finished: 2 };
  return matches.sort((a, b) => {
    const sA = statusOrder[a.status];
    const sB = statusOrder[b.status];
    if (sA !== sB) return sA - sB;
    return (LEAGUE_PRIORITY[a.league] ?? 999) - (LEAGUE_PRIORITY[b.league] ?? 999);
  });
}

// ── football-data.org direct ──────────────────────────────────────────────────

const FD_COMPETITION_NAMES: Record<string, string> = {
  CL:  "Champions League",
  PL:  "Premier League",
  EL:  "Europa League",
  PD:  "La Liga",
  SA:  "Serie A",
  BL1: "Bundesliga",
  FL1: "Ligue 1",
  PPL: "Primeira Liga",
  DED: "Eredivisie",
};

function mapFdStatus(s: string): "live" | "upcoming" | "finished" {
  const LIVE = ["IN_PLAY", "PAUSED", "HALFTIME", "EXTRA_TIME", "PENALTY_SHOOTOUT"];
  const FINISHED = ["FINISHED", "AWARDED"];
  if (LIVE.includes(s)) return "live";
  if (FINISHED.includes(s)) return "finished";
  return "upcoming";
}

async function fetchFromFootballDataDirect(
  adminUrls: Record<string, string>
): Promise<Match[]> {
  if (!FD_KEY) throw new Error("No FD key");

  const dateFrom = getSomaliaDateStr(-1);
  const dateTo = getSomaliaDateStr(1);

  const resp = await fetch(
    `${FD_BASE}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
    { headers: { "X-Auth-Token": FD_KEY }, cache: "no-store" }
  );

  if (!resp.ok) throw new Error(`football-data.org ${resp.status}`);

  const json = await resp.json();
  const raw: any[] = json?.matches ?? [];

  return raw
    .filter((m) => FD_COMPETITION_NAMES[m.competition?.code])
    .map((m): Match => {
      const status = mapFdStatus(m.status ?? "SCHEDULED");
      const utcDate: string = m.utcDate ?? new Date().toISOString();
      const startTime = new Date(utcDate).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      });

      let homeScore: number | null = null;
      let awayScore: number | null = null;
      if (status === "live") {
        const ftHome = m.score?.fullTime?.home;
        homeScore = ftHome !== null && ftHome !== undefined
          ? ftHome : (m.score?.halfTime?.home ?? null);
        awayScore = ftHome !== null && ftHome !== undefined
          ? (m.score?.fullTime?.away ?? null) : (m.score?.halfTime?.away ?? null);
      } else if (status === "finished") {
        homeScore = m.score?.fullTime?.home ?? null;
        awayScore = m.score?.fullTime?.away ?? null;
      }

      const id = `fd-${m.id}`;
      const homeName: string = m.homeTeam?.name ?? "Home";
      const awayName: string = m.awayTeam?.name ?? "Away";

      return {
        id,
        sport: "Soccer",
        league: FD_COMPETITION_NAMES[m.competition?.code] ?? m.competition?.name ?? "Football",
        leagueLogo: m.competition?.emblem ?? "",
        homeTeam: homeName,
        homeAbbr: m.homeTeam?.tla ?? homeName.slice(0, 3).toUpperCase(),
        awayTeam: awayName,
        awayAbbr: m.awayTeam?.tla ?? awayName.slice(0, 3).toUpperCase(),
        homeScore,
        awayScore,
        status,
        minute: status === "live" && m.minute != null ? Number(m.minute) : undefined,
        startTime,
        date: formatDisplayDate(utcDate.slice(0, 10)),
        venue: m.venue ?? "TBD",
        streamUrl: adminUrls[id],
        homeColor: "#6B7280",
        awayColor: "#6B7280",
        homeLogo: m.homeTeam?.crest ?? null,
        awayLogo: m.awayTeam?.crest ?? null,
      };
    });
}

// ── TheSportsDB (free, no auth) ───────────────────────────────────────────────

function mapTsdbStatus(s: string | null | undefined): "live" | "upcoming" | "finished" {
  if (!s) return "upcoming";
  const up = s.toUpperCase();
  if (["1H", "2H", "ET", "BT", "HT", "LIVE", "IN PLAY", "SUSP", "INT"].some((m) => up.includes(m))) return "live";
  if (["MATCH FINISHED", "FT", "AET", "PEN", "AP", "FINISHED", "AOT"].some((m) => up.includes(m))) return "finished";
  return "upcoming";
}

function makeAbbr(name: string): string {
  const cleaned = name
    .replace(/\b(FC|SC|CF|AC|AS|RC|SD|CD|SL|UD|RCD|CA|CP|FK|SK|NK)\b/gi, "")
    .replace(/\b(United|City|Athletic|Atletico|Real|Club|Sporting|Dynamo|Dinamo)\b/gi, "")
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0] + (words[2]?.[0] ?? words[1][1] ?? "")).toUpperCase();
  return cleaned.slice(0, 3).toUpperCase() || name.slice(0, 3).toUpperCase();
}

async function fetchFromTheSportsDB(
  adminUrls: Record<string, string>
): Promise<Match[]> {
  const days = [getSomaliaDateStr(-1), getSomaliaDateStr(0), getSomaliaDateStr(1)];
  const eventMap = new Map<string, any>();

  await Promise.allSettled(
    days.map(async (day) => {
      try {
        const res = await fetch(`${TSDB_BASE}/eventsday.php?d=${day}&s=Soccer`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        for (const ev of json?.events ?? []) {
          if (ev.idEvent) eventMap.set(ev.idEvent, { ...ev, _day: day });
        }
      } catch {}
    })
  );

  if (eventMap.size === 0) return [];

  return Array.from(eventMap.values()).map((ev): Match => {
    const dateStr: string = ev.dateEvent ?? ev._day ?? getSomaliaDateStr(0);
    const id = `tsdb_${ev.idEvent}`;
    return {
      id,
      sport: "Soccer",
      league: ev.strLeague ?? "Football",
      leagueLogo: ev.strLeagueBadge ?? ev.strLeagueIconThumb ?? "",
      homeTeam: ev.strHomeTeam ?? "Home",
      homeAbbr: makeAbbr(ev.strHomeTeam ?? "HME"),
      awayTeam: ev.strAwayTeam ?? "Away",
      awayAbbr: makeAbbr(ev.strAwayTeam ?? "AWY"),
      homeScore: ev.intHomeScore != null && ev.intHomeScore !== "" ? Number(ev.intHomeScore) : null,
      awayScore: ev.intAwayScore != null && ev.intAwayScore !== "" ? Number(ev.intAwayScore) : null,
      status: mapTsdbStatus(ev.strStatus),
      minute: ev.intTimer ? Number(ev.intTimer) : undefined,
      startTime: (ev.strTime ?? "TBD").slice(0, 5),
      date: formatDisplayDate(dateStr),
      venue: ev.strVenue ?? "",
      streamUrl: adminUrls[id],
      homeColor: "#6B7280",
      awayColor: "#6B7280",
      homeLogo: ev.strHomeTeamBadge ?? null,
      awayLogo: ev.strAwayTeamBadge ?? null,
    };
  });
}

// ── Mock fallback ─────────────────────────────────────────────────────────────

function sortedMockMatches(adminUrls: Record<string, string>): Match[] {
  const statusOrder = { live: 0, upcoming: 1, finished: 2 };
  return MATCHES.map((m) => ({
    ...m,
    streamUrl: adminUrls[m.id] || m.streamUrl || undefined,
  })).sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
}

// ── Main fetch ────────────────────────────────────────────────────────────────

async function fetchMatches(): Promise<MatchesResult> {
  const adminUrls = await AdminStore.getStreamUrls();

  // 1. API server (when domain is configured — dev + deployed builds)
  if (API_BASE) {
    try {
      const apiRes = await fetch(`${API_BASE}/matches`, { cache: "no-store" }).then((r) => r.json());
      const raw: any[] = apiRes?.matches ?? [];
      if (raw.length > 0) {
        const matches = sortMatches(
          raw.map((m: any) => ({ ...m, streamUrl: adminUrls[m.id] || m.streamUrl || undefined })) as Match[]
        );
        return { matches, source: apiRes?.source ?? "api" };
      }
    } catch {}
  }

  // 2. football-data.org direct (when EXPO_PUBLIC_FD_API_KEY is set in EAS)
  if (FD_KEY) {
    try {
      const fdMatches = await fetchFromFootballDataDirect(adminUrls);
      if (fdMatches.length > 0) {
        return { matches: sortMatches(fdMatches), source: "fd_direct" };
      }
    } catch (err) {
      console.warn("football-data.org direct failed:", err);
    }
  }

  // 3. TheSportsDB (free, no key)
  try {
    const tsdbMatches = await fetchFromTheSportsDB(adminUrls);
    if (tsdbMatches.length > 0) {
      return { matches: sortMatches(tsdbMatches), source: "tsdb" };
    }
  } catch (err) {
    console.warn("TheSportsDB failed:", err);
  }

  // 4. Mock data (final fallback)
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
