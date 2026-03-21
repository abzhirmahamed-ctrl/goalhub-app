/**
 * Stream Scraper Service
 *
 * Automatically discovers .m3u8 streaming links for live/upcoming football
 * matches by:
 *  1. Parsing IPTV-org M3U playlists (free-to-air channels mapped to leagues)
 *  2. Searching sports-streaming aggregator pages for embedded .m3u8 URLs
 *
 * Results are cached in memory and refreshed every REFRESH_INTERVAL_MS.
 */

export interface StreamLink {
  url: string;
  label: string;
  quality: "HD" | "SD" | "Unknown";
  source: "iptv-org" | "scraper" | "manual";
  isM3U8: boolean;
}

export interface MatchStreams {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  streams: StreamLink[];
  updatedAt: number;
}

// ── In-memory stores ──────────────────────────────────────────────────────────

/** matchId → MatchStreams */
const streamCache = new Map<string, MatchStreams>();

/** channelName (lower) → m3u8 URL — built from IPTV-org playlists */
let iptvIndex = new Map<string, string>();
let iptvBuiltAt = 0;
const IPTV_TTL_MS = 4 * 60 * 60_000; // rebuild IPTV index every 4 h

/** Shared build promise so concurrent calls don't trigger duplicate fetches */
let iptvBuildPromise: Promise<void> | null = null;

export const REFRESH_INTERVAL_MS = 15 * 60_000; // 15 min

// ── League → channel name keywords ───────────────────────────────────────────
// We match channel names from IPTV-org playlists using these keyword lists.

const LEAGUE_CHANNEL_KEYWORDS: Record<string, string[]> = {
  "Champions League": [
    "bt sport ultimate", "cbs sports", "bein sports 1", "bein sports 2",
    "canal+ sport", "sky sport 1", "sky sports football", "mediapro",
    "dazn 1", "rtl nitro", "tf1", "canal+ foot",
  ],
  "Premier League": [
    "sky sports premier league", "sky sports main event", "sky sports football",
    "bt sport 1", "bt sport 2", "nbcsn", "peacock", "sky sports 1",
  ],
  "La Liga": [
    "laliga tv", "bein sports 1", "bein sports en español",
    "dazn laliga", "movistar laliga", "gol", "m+ liga",
  ],
  "Serie A": [
    "sky sport serie a", "sky sport calcio", "dazn 1", "dazn 2",
    "sky calcio 1", "sport italia",
  ],
  "Bundesliga": [
    "sky sport bundesliga 1", "sky sport bundesliga 2",
    "dazn", "sport 1 de", "sat.1 de", "sky bundesliga",
  ],
  "Ligue 1": [
    "canal+ sport", "canal+ foot", "bein sports 1",
    "amazon prime video", "canal+ live 1",
  ],
  "Primeira Liga": [
    "sport tv 1", "sport tv 2", "sport tv+", "eleven sports 1 pt",
  ],
  "Eredivisie": [
    "ziggo sport football", "espn 1 nl", "espn 2 nl", "ziggo sport 1",
  ],
  "Saudi Pro League": [
    "ssc 1", "ssc 2", "ssc sport 1", "rotana sport 1", "rotana sport 2",
  ],
  "Süper Lig": [
    "bein sports 1", "bein sports max 1", "s sport", "s sport 2",
    "tivibu spor", "bein max 1",
  ],
};

// IPTV-org M3U playlists to fetch (country + international)
const IPTV_PLAYLIST_URLS = [
  "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/gb.m3u",
  "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/es.m3u",
  "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/de.m3u",
  "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/it.m3u",
  "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/fr.m3u",
  "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/pt.m3u",
  "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/nl.m3u",
  "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/sa.m3u",
  "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/tr.m3u",
  "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/int.m3u",
  "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/us.m3u",
];

// ── M3U parser ────────────────────────────────────────────────────────────────

function parseM3U(text: string): Array<{ name: string; url: string }> {
  const entries: Array<{ name: string; url: string }> = [];
  const lines = text.split(/\r?\n/);
  let pendingName = "";
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("#EXTINF")) {
      // Extract display name — last comma-separated segment
      const commaIdx = line.lastIndexOf(",");
      pendingName = commaIdx >= 0 ? line.slice(commaIdx + 1).trim() : "";
    } else if (line && !line.startsWith("#") && pendingName) {
      if (line.endsWith(".m3u8") || line.includes(".m3u8?") || line.includes("m3u8")) {
        entries.push({ name: pendingName, url: line });
      }
      pendingName = "";
    } else if (line && !line.startsWith("#")) {
      pendingName = "";
    }
  }
  return entries;
}

// ── Build IPTV index ──────────────────────────────────────────────────────────

async function buildIptvIndex(): Promise<void> {
  if (Date.now() - iptvBuiltAt < IPTV_TTL_MS && iptvIndex.size > 0) return;
  if (iptvBuildPromise) return iptvBuildPromise;

  iptvBuildPromise = (async () => {
    const newIndex = new Map<string, string>();
    let total = 0;

    await Promise.all(
      IPTV_PLAYLIST_URLS.map(async (playlistUrl) => {
        try {
          const res = await fetch(playlistUrl, {
            signal: AbortSignal.timeout(12_000),
            headers: { "User-Agent": "GoalHub/1.0" },
          });
          if (!res.ok) return;
          const text = await res.text();
          const entries = parseM3U(text);
          for (const { name, url: streamUrl } of entries) {
            const key = name.toLowerCase().trim();
            if (!newIndex.has(key)) {
              newIndex.set(key, streamUrl);
              total++;
            }
          }
        } catch {
          // network failure for this playlist — skip silently
        }
      })
    );

    iptvIndex = newIndex;
    iptvBuiltAt = Date.now();
    iptvBuildPromise = null;
    console.log(`[StreamScraper] IPTV index built: ${total} channels`);
  })();

  return iptvBuildPromise;
}

// ── Find IPTV streams for a league ───────────────────────────────────────────

function findIptvStreamsForLeague(league: string): StreamLink[] {
  const keywords = LEAGUE_CHANNEL_KEYWORDS[league] ?? [];
  const results: StreamLink[] = [];
  const seen = new Set<string>();

  for (const keyword of keywords) {
    for (const [channelName, url] of iptvIndex) {
      if (channelName.includes(keyword) && !seen.has(url)) {
        seen.add(url);
        const isHD =
          channelName.includes("hd") ||
          channelName.includes("4k") ||
          channelName.includes("ultra");
        results.push({
          url,
          label: channelName
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          quality: isHD ? "HD" : "SD",
          source: "iptv-org",
          isM3U8: true,
        });
      }
    }
  }

  return results;
}

// ── Regex scraper: scan aggregator pages for .m3u8 links ─────────────────────

const M3U8_REGEX = /https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/gi;

/**
 * Builds a search URL for a streaming aggregator given a match description.
 * We use sites that list streams as plain HTML so we can extract links with regex.
 */
function buildSearchUrls(homeTeam: string, awayTeam: string): string[] {
  const q = encodeURIComponent(`${homeTeam} ${awayTeam} live stream`);
  return [
    `https://www.livescore.com/en/football/`,
    `https://www.soccerstreams100.net/?s=${q}`,
    `https://sporticos.com/en-us/watch/football/`,
  ];
}

async function scrapePageForM3U8(url: string): Promise<string[]> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8_000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const matches = html.match(M3U8_REGEX) ?? [];
    // Deduplicate and filter out obvious tracking/analytics
    return [...new Set(matches)].filter(
      (u) =>
        !u.includes("google") &&
        !u.includes("analytics") &&
        !u.includes("doubleclick")
    );
  } catch {
    return [];
  }
}

// ── Stream validator ──────────────────────────────────────────────────────────

async function isStreamAlive(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5_000),
      headers: { "User-Agent": "GoalHub/1.0" },
    });
    return res.ok || res.status === 405; // 405 = HEAD not allowed but server responded
  } catch {
    return false;
  }
}

// ── Core: get streams for a single match ──────────────────────────────────────

async function fetchStreamsForMatch(
  matchId: string,
  homeTeam: string,
  awayTeam: string,
  league: string,
  status: string
): Promise<MatchStreams> {
  const streams: StreamLink[] = [];
  const seen = new Set<string>();

  // 1. IPTV-org channel streams (primary — always run for live/upcoming)
  if (status !== "finished") {
    await buildIptvIndex();
    const iptvLinks = findIptvStreamsForLeague(league);
    for (const link of iptvLinks) {
      if (!seen.has(link.url)) {
        seen.add(link.url);
        streams.push(link);
      }
    }
  }

  // 2. Regex scraper — only for live matches to reduce unnecessary requests
  if (status === "live") {
    const searchUrls = buildSearchUrls(homeTeam, awayTeam);
    const scraped = (
      await Promise.all(searchUrls.map(scrapePageForM3U8))
    ).flat();

    for (const url of scraped) {
      if (!seen.has(url)) {
        seen.add(url);
        streams.push({
          url,
          label: `Auto-detected stream`,
          quality: url.includes("hd") || url.includes("1080") ? "HD" : "Unknown",
          source: "scraper",
          isM3U8: true,
        });
      }
    }
  }

  // Sort: IPTV-org HD first, then IPTV SD, then scraper links
  streams.sort((a, b) => {
    const score = (s: StreamLink) => {
      if (s.source === "iptv-org" && s.quality === "HD") return 0;
      if (s.source === "iptv-org") return 1;
      if (s.source === "scraper") return 2;
      return 3;
    };
    return score(a) - score(b);
  });

  return {
    matchId,
    homeTeam,
    awayTeam,
    league,
    streams,
    updatedAt: Date.now(),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Returns cached streams for a specific match (may be empty if not yet scraped). */
export function getCachedStreams(matchId: string): MatchStreams | null {
  return streamCache.get(matchId) ?? null;
}

/** Returns the entire stream cache as a plain object. */
export function getAllCachedStreams(): Record<string, MatchStreams> {
  const out: Record<string, MatchStreams> = {};
  for (const [id, data] of streamCache) {
    out[id] = data;
  }
  return out;
}

/** Manually inject a stream link (from the Admin Panel). */
export function addManualStream(
  matchId: string,
  homeTeam: string,
  awayTeam: string,
  league: string,
  url: string,
  label = "Manual stream"
): void {
  const existing = streamCache.get(matchId) ?? {
    matchId,
    homeTeam,
    awayTeam,
    league,
    streams: [],
    updatedAt: Date.now(),
  };
  const isM3U8 = url.includes(".m3u8");
  const link: StreamLink = {
    url,
    label,
    quality: url.includes("hd") || url.includes("1080") ? "HD" : "Unknown",
    source: "manual",
    isM3U8,
  };
  // Remove existing manual stream with same URL to avoid duplicates
  existing.streams = existing.streams.filter((s) => s.url !== url);
  // Manual streams go first
  existing.streams.unshift(link);
  existing.updatedAt = Date.now();
  streamCache.set(matchId, existing);
}

/**
 * Refresh streams for a list of matches.
 * Designed to be called on a schedule with the current matches from the football API.
 */
export async function refreshMatchStreams(
  matches: Array<{
    id: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    status: string;
  }>
): Promise<void> {
  // Prioritise live matches, then upcoming, skip finished
  const relevant = matches.filter((m) => m.status !== "finished").slice(0, 30);

  console.log(
    `[StreamScraper] Refreshing streams for ${relevant.length} matches…`
  );

  await Promise.all(
    relevant.map(async (match) => {
      try {
        // Keep existing manual streams — don't overwrite them
        const existing = streamCache.get(match.id);
        const manualStreams =
          existing?.streams.filter((s) => s.source === "manual") ?? [];

        const result = await fetchStreamsForMatch(
          match.id,
          match.homeTeam,
          match.awayTeam,
          match.league,
          match.status
        );

        // Prepend manual streams so they stay on top
        result.streams = [...manualStreams, ...result.streams.filter((s) => s.source !== "manual")];
        streamCache.set(match.id, result);
      } catch (err: any) {
        console.warn(
          `[StreamScraper] Failed for ${match.homeTeam} v ${match.awayTeam}:`,
          err.message
        );
      }
    })
  );

  const total = relevant.reduce(
    (sum, m) => sum + (streamCache.get(m.id)?.streams.length ?? 0),
    0
  );
  console.log(
    `[StreamScraper] Done — ${total} stream links cached across ${relevant.length} matches`
  );
}
