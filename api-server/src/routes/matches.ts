import { Router } from "express";

const router = Router();

const FD_API_KEY = process.env["FOOTBALL_DATA_API_KEY"];
const FD_BASE = "https://api.football-data.org/v4";

// ── Cache ─────────────────────────────────────────────────────────────────────
const cache: { data: any[] | null; fetchedAt: number } = {
  data: null,
  fetchedAt: 0,
};
const CACHE_TTL_MS = 5 * 60_000;

export function clearMatchesCache() {
  cache.data = null;
  cache.fetchedAt = 0;
}

// ── The 9 target leagues (football-data.org competition codes) ────────────────
const TARGET_COMPETITIONS: Record<string, string> = {
  CL:  "Champions League",   // UEFA Champions League
  PL:  "Premier League",     // England
  PD:  "La Liga",            // Spain
  SA:  "Serie A",            // Italy
  BL1: "Bundesliga",         // Germany
  FL1: "Ligue 1",            // France
  PPL: "Primeira Liga",      // Portugal
  DED: "Eredivisie",         // Netherlands
  SPL: "Saudi Pro League",   // Saudi Arabia (if available on your plan)
  TL:  "Süper Lig",          // Turkey (if available on your plan)
};

const LEAGUE_PRIORITY: Record<string, number> = {
  "Champions League": 1,
  "Premier League":   2,
  "La Liga":          3,
  "Serie A":          4,
  "Bundesliga":       5,
  "Ligue 1":          6,
  "Primeira Liga":    7,
  "Eredivisie":       8,
  "Saudi Pro League": 9,
  "Süper Lig":        9,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSomaliaDateStr(offsetDays = 0): string {
  const EAT_OFFSET = 3 * 60 * 60 * 1000;
  const d = new Date(Date.now() + EAT_OFFSET + offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

function formatDate(utcDate: string): string {
  const today = getSomaliaDateStr(0);
  const yesterday = getSomaliaDateStr(-1);
  const tomorrow = getSomaliaDateStr(1);
  const dateStr = utcDate.slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  if (dateStr === tomorrow) return "Tomorrow";
  return new Date(utcDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function mapFdStatus(status: string): "live" | "upcoming" | "finished" {
  const LIVE = ["IN_PLAY", "PAUSED", "HALFTIME", "EXTRA_TIME", "PENALTY_SHOOTOUT"];
  const FINISHED = ["FINISHED", "AWARDED"];
  if (LIVE.includes(status)) return "live";
  if (FINISHED.includes(status)) return "finished";
  return "upcoming";
}

function transformFdMatch(m: any): any {
  const code: string = m.competition?.code ?? "";
  const leagueName = TARGET_COMPETITIONS[code] ?? m.competition?.name ?? "Football";
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

  const homeName: string = m.homeTeam?.name ?? "Home";
  const awayName: string = m.awayTeam?.name ?? "Away";

  return {
    id: `fd-${m.id}`,
    sport: "Soccer",
    league: leagueName,
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
    date: formatDate(utcDate),
    venue: m.venue ?? "TBD",
    homeColor: "#6B7280",
    awayColor: "#6B7280",
    homeLogo: m.homeTeam?.crest ?? null,
    awayLogo: m.awayTeam?.crest ?? null,
  };
}

async function fetchFromFootballData(): Promise<any[]> {
  if (!FD_API_KEY) throw new Error("No FOOTBALL_DATA_API_KEY set");

  const dateFrom = getSomaliaDateStr(-1);
  const dateTo = getSomaliaDateStr(1);

  const resp = await fetch(
    `${FD_BASE}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
    { headers: { "X-Auth-Token": FD_API_KEY } }
  );

  if (resp.status === 429) throw new Error("RATE_LIMITED");
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`football-data.org ${resp.status}: ${text}`);
  }

  const json = await resp.json();
  const raw: any[] = json?.matches ?? [];

  const matches = raw
    .filter((m) => TARGET_COMPETITIONS[m.competition?.code])
    .map(transformFdMatch);

  console.log(`football-data.org: ${matches.length} matches (${dateFrom} → ${dateTo})`);
  return matches;
}

function sortMatches(matches: any[]): any[] {
  const statusOrder = { live: 0, upcoming: 1, finished: 2 };
  const seenIds = new Set<string>();
  return matches
    .filter((m) => {
      if (seenIds.has(m.id)) return false;
      seenIds.add(m.id);
      return true;
    })
    .sort((a, b) => {
      const sA = statusOrder[a.status as keyof typeof statusOrder] ?? 1;
      const sB = statusOrder[b.status as keyof typeof statusOrder] ?? 1;
      if (sA !== sB) return sA - sB;
      return (LEAGUE_PRIORITY[a.league] ?? 999) - (LEAGUE_PRIORITY[b.league] ?? 999);
    });
}

// ── Route ─────────────────────────────────────────────────────────────────────
router.get("/matches", async (_req, res) => {
  if (cache.data && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    res.json({ matches: cache.data, source: "cache" });
    return;
  }

  let matches: any[] = [];
  let source = "api_empty";

  if (FD_API_KEY) {
    try {
      matches = await fetchFromFootballData();
      if (matches.length > 0) source = "api";
    } catch (err: any) {
      console.error("football-data.org error:", err.message);
    }
  } else {
    console.warn("FOOTBALL_DATA_API_KEY not set — no data available");
  }

  if (matches.length > 0) {
    matches = sortMatches(matches);
    cache.data = matches;
    cache.fetchedAt = Date.now();
    res.json({ matches, source });
    return;
  }

  if (cache.data && cache.data.length > 0) {
    console.warn("API returned 0 matches — serving stale cache");
    res.json({ matches: cache.data, source: "stale_cache" });
    return;
  }

  cache.data = [];
  cache.fetchedAt = Date.now();
  res.json({ matches: [], source: "api_empty" });
});

router.post("/matches/cache/clear", (_req, res) => {
  cache.data = null;
  cache.fetchedAt = 0;
  res.json({ ok: true, message: "Cache cleared" });
});

export default router;
