import { Router } from "express";
import {
  getCachedStreams,
  getAllCachedStreams,
  addManualStream,
  refreshMatchStreams,
} from "../lib/streamScraper";

const router = Router();

// ── GET /api/streams — all cached stream links ────────────────────────────────
router.get("/streams", (_req, res) => {
  res.json({
    streams: getAllCachedStreams(),
    updatedAt: Date.now(),
  });
});

// ── GET /api/streams/:matchId — streams for one match ────────────────────────
router.get("/streams/:matchId", (req, res) => {
  const { matchId } = req.params;
  if (!matchId) {
    res.status(400).json({ error: "matchId is required" });
    return;
  }

  const cached = getCachedStreams(matchId);
  if (!cached) {
    res.json({ matchId, streams: [], updatedAt: null });
    return;
  }

  // Always return .m3u8 links first
  const sorted = [...cached.streams].sort((a, b) => {
    if (a.isM3U8 && !b.isM3U8) return -1;
    if (!a.isM3U8 && b.isM3U8) return 1;
    return 0;
  });

  res.json({ ...cached, streams: sorted });
});

// ── POST /api/streams/:matchId — add a manual stream link ────────────────────
router.post("/streams/:matchId", (req, res) => {
  const { matchId } = req.params;
  const { homeTeam, awayTeam, league, url, label } = req.body ?? {};

  if (!matchId || !url) {
    res.status(400).json({ error: "matchId and url are required" });
    return;
  }
  if (!url.startsWith("http")) {
    res.status(400).json({ error: "url must be a valid http(s) URL" });
    return;
  }

  addManualStream(
    matchId,
    homeTeam ?? "Home",
    awayTeam ?? "Away",
    league ?? "Football",
    url,
    label ?? "Manual stream"
  );

  res.json({ ok: true, message: "Stream link saved", matchId, url });
});

// ── POST /api/streams/refresh — force re-scrape all matches ──────────────────
router.post("/streams/refresh", async (_req, res) => {
  try {
    const port = process.env["PORT"] ?? "8080";
    const matchesRes = await fetch(`http://localhost:${port}/api/matches`);
    if (!matchesRes.ok) throw new Error("Failed to fetch matches from local API");
    const { matches } = (await matchesRes.json()) as { matches: any[] };

    // Run scrape in background — respond immediately so client isn't blocked
    refreshMatchStreams(matches).catch(console.error);

    res.json({
      ok: true,
      message: `Stream refresh triggered for ${matches.length} matches`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export { refreshMatchStreams };
export default router;
