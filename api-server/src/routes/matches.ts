import { Router } from "express";

const router = Router();

// ── football-data.org (PRIMARY) ───────────────────────────────────────────────
const FD_API_KEY = process.env["FOOTBALL_DATA_API_KEY"];
const FD_BASE = "https://api.football-data.org/v4";

// ── api-sports.io (SECONDARY fallback) ───────────────────────────────────────
const FOOTBALL_API_KEY = process.env["FOOTBALL_API_KEY"];
const AS_BASE = "https://v3.football.api-sports.io";

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
  const d = new Date(utcDate);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

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

// ── football-data.org ─────────────────────────────────────────────────────────

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
  BSA: "Série A",
  EC:  "Euro 2024",
  WC:  "World Cup",
};

function mapFdStatus(status: string): "live" | "upcoming" | "finished" {
  const LIVE = ["IN_PLAY", "PAUSED", "HALFTIME", "EXTRA_TIME", "PENALTY_SHOOTOUT"];
  const FINISHED = ["FINISHED", "AWARDED"];
  if (LIVE.includes(status)) return "live";
  if (FINISHED.includes(status)) return "finished";
  return "upcoming";
}

function transformFdMatch(m: any): any {
  const code: string = m.competition?.code ?? "";
  const leagueName = FD_COMPETITION_NAMES[code] ?? m.competition?.name ?? "Football";
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
    homeScore = m.score?.halfTime?.home ?? null;
    awayScore = m.score?.halfTime?.away ?? null;
    const ftHome = m.score?.fullTime?.home;
    if (ftHome !== null && ftHome !== undefined) {
      homeScore = ftHome;
      awayScore = m.score?.fullTime?.away ?? null;
    }
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
    .filter((m) => FD_COMPETITION_NAMES[m.competition?.code])
    .map(transformFdMatch);

  console.log(`football-data.org: ${matches.length} matches (${dateFrom} → ${dateTo})`);
  return matches;
}

// ── api-sports.io (secondary) ─────────────────────────────────────────────────

const AS_LEAGUE_IDS = new Set([2, 3, 39, 78, 94, 135, 140, 203, 307]);

const AS_LEAGUE_NAMES: Record<number, string> = {
  2:   "Champions League",
  3:   "Europa League",
  39:  "Premier League",
  78:  "Bundesliga",
  94:  "Primeira Liga",
  135: "Serie A",
  140: "La Liga",
  203: "Süper Lig",
  307: "Saudi Pro League",
};

function mapAsStatus(s: string): "live" | "upcoming" | "finished" {
  if (["1H", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE", "HT"].includes(s)) return "live";
  if (["FT", "AET", "PEN", "AWD", "WO"].includes(s)) return "finished";
  return "upcoming";
}

function transformAsFixture(f: any): any {
  const short: string = f.fixture?.status?.short ?? "NS";
  const status = mapAsStatus(short);
  const utcDate: string = f.fixture?.date ?? new Date().toISOString();
  const startTime = new Date(utcDate).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
  const leagueId: number = f.league?.id ?? 0;
  const leagueName = AS_LEAGUE_NAMES[leagueId] ?? f.league?.name ?? "Football";

  let homeScore: number | null = null;
  let awayScore: number | null = null;
  if (status === "live" || status === "finished") {
    homeScore = f.goals?.home ?? null;
    awayScore = f.goals?.away ?? null;
  }

  const homeName: string = f.teams?.home?.name ?? "Home";
  const awayName: string = f.teams?.away?.name ?? "Away";

  return {
    id: `as-${f.fixture?.id}`,
    sport: "Soccer",
    league: leagueName,
    leagueLogo: f.league?.logo ?? "",
    homeTeam: homeName,
    homeAbbr: homeName.slice(0, 3).toUpperCase(),
    awayTeam: awayName,
    awayAbbr: awayName.slice(0, 3).toUpperCase(),
    homeScore,
    awayScore,
    status,
    minute: status === "live" && f.fixture?.status?.elapsed != null
      ? f.fixture.status.elapsed : undefined,
    startTime,
    date: formatDate(utcDate),
    venue: f.fixture?.venue?.name ?? "TBD",
    homeColor: "#6B7280",
    awayColor: "#6B7280",
    homeLogo: f.teams?.home?.logo ?? null,
    awayLogo: f.teams?.away?.logo ?? null,
  };
}

async function fetchFromApiSports(): Promise<any[]> {
  if (!FOOTBALL_API_KEY) throw new Error("No FOOTBALL_API_KEY set");

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const makeReq = (url: string) =>
    fetch(url, {
      headers: {
        "x-rapidapi-key": FOOTBALL_API_KEY!,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
    }).then((r) => {
      if (r.status === 429) throw new Error("QUOTA_EXHAUSTED");
      if (!r.ok) throw new Error(`api-sports ${r.status}`);
      return r.json();
    });

  const [liveRes, todayRes, tomorrowRes] = await Promise.allSettled([
    makeReq(`${AS_BASE}/fixtures?live=all`),
    makeReq(`${AS_BASE}/fixtures?date=${fmt(now)}&timezone=UTC`),
    makeReq(`${AS_BASE}/fixtures?date=${fmt(tomorrow)}&timezone=UTC`),
  ]);

  const allFixtures: any[] = [];
  for (const r of [liveRes, todayRes, tomorrowRes]) {
    if (r.status === "fulfilled") allFixtures.push(...(r.value?.response ?? []));
  }

  const seenIds = new Set<string>();
  const matches = allFixtures
    .filter((f) => AS_LEAGUE_IDS.has(f.league?.id))
    .map(transformAsFixture)
    .filter((m) => {
      if (seenIds.has(m.id)) return false;
      seenIds.add(m.id);
      return true;
    });

  console.log(`api-sports.io: ${matches.length} matches`);
  return matches;
}

// ── Sort helper ───────────────────────────────────────────────────────────────
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

  // 1. Try football-data.org (primary)
  if (FD_API_KEY) {
    try {
      const fdMatches = await fetchFromFootballData();
      if (fdMatches.length > 0) {
        matches = fdMatches;
        source = "api";
      } else {
        console.warn("football-data.org returned 0 matches");
      }
    } catch (err: any) {
      console.error("football-data.org error:", err.message);
    }
  }

  // 2. Try api-sports.io (secondary)
  if (matches.length === 0 && FOOTBALL_API_KEY) {
    try {
      const asMatches = await fetchFromApiSports();
      if (asMatches.length > 0) {
        matches = asMatches;
        source = "fallback_api";
      }
    } catch (err: any) {
      console.error("api-sports.io error:", err.message);
    }
  }

  if (matches.length > 0) {
    matches = sortMatches(matches);
    cache.data = matches;
    cache.fetchedAt = Date.now();
    res.json({ matches, source });
    return;
  }

  // Serve stale cache as last resort
  if (cache.data && cache.data.length > 0) {
    console.warn("All APIs returned 0 matches — serving stale cache");
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
