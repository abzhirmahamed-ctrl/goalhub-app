import app from "./app";
import { refreshMatchStreams, REFRESH_INTERVAL_MS } from "./lib/streamScraper";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);

  // Initial stream scrape — runs after a short delay so the matches API
  // is fully warmed up first.
  setTimeout(async () => {
    try {
      const res = await fetch(`http://localhost:${port}/api/matches`);
      if (!res.ok) return;
      const { matches } = (await res.json()) as { matches: any[] };
      console.log(`[StreamScraper] Initial scrape for ${matches.length} matches…`);
      await refreshMatchStreams(matches);
    } catch (err: any) {
      console.warn("[StreamScraper] Initial scrape failed:", err.message);
    }
  }, 8_000);

  // Periodic refresh every 15 minutes
  setInterval(async () => {
    try {
      const res = await fetch(`http://localhost:${port}/api/matches`);
      if (!res.ok) return;
      const { matches } = (await res.json()) as { matches: any[] };
      await refreshMatchStreams(matches);
    } catch (err: any) {
      console.warn("[StreamScraper] Scheduled refresh failed:", err.message);
    }
  }, REFRESH_INTERVAL_MS);
});
