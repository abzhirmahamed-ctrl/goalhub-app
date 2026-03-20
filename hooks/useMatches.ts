import { useQuery } from "@tanstack/react-query";
import { Match, MATCHES } from "@/data/matches";
import { AdminStore } from "@/store/AdminStore";

const API_BASE = `https://${process.env["EXPO_PUBLIC_DOMAIN"]}/api`;

export type ApiSource =
  | "api"
  | "fallback_api"
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

// Sort mock data: live first, then upcoming, then finished
function sortedMockMatches(adminUrls: Record<string, string>): Match[] {
  const statusOrder = { live: 0, upcoming: 1, finished: 2 };
  return MATCHES.map((m) => ({
    ...m,
    streamUrl: adminUrls[m.id] || m.streamUrl || undefined,
  })).sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
}

async function fetchMatches(): Promise<MatchesResult> {
  const adminUrls = await AdminStore.getStreamUrls();

  try {
    const apiRes = await fetch(`${API_BASE}/matches`, { cache: "no-store" }).then(
      (r) => r.json()
    );

    const raw: any[] = apiRes?.matches ?? [];
    const source: ApiSource = apiRes?.source ?? "error";

    // If the API has real data, use it
    if (raw.length > 0) {
      const matches = raw.map((m: any) => ({
        ...m,
        streamUrl: adminUrls[m.id] || m.streamUrl || undefined,
      })) as Match[];
      return { matches, source };
    }

    // API returned no data (quota exhausted, empty, or error) — fall back to mock
    console.info(`API source "${source}" returned no matches — using mock data`);
    return { matches: sortedMockMatches(adminUrls), source: "mock" };
  } catch (err) {
    // Network error — fall back to mock data so the app always shows something
    console.warn("API fetch failed — falling back to mock data:", err);
    return { matches: sortedMockMatches(adminUrls), source: "mock" };
  }
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
