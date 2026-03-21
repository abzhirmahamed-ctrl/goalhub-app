import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Icon } from "@/components/Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { GlowBackground } from "@/components/GlowBackground";
import { GoalHubLogo } from "@/components/GoalHubLogo";
import { MatchCard } from "@/components/MatchCard";
import { FilterChip } from "@/components/FilterChip";
import { LiveBadge } from "@/components/LiveBadge";
import { type Match, type MatchStatus } from "@/data/matches";
import { useMatches, type ApiSource } from "@/hooks/useMatches";
import { useLanguage } from "@/context/LanguageContext";
import { useQueryClient } from "@tanstack/react-query";

// ── The 9 target leagues ──────────────────────────────────────────────────────
const LEAGUE_FILTERS = [
  { id: "all",             label: "All",       flag: "🌍" },
  { id: "Champions League", label: "UCL",      flag: "🏆" },
  { id: "Premier League",   label: "England",  flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "La Liga",          label: "Spain",    flag: "🇪🇸" },
  { id: "Serie A",          label: "Italy",    flag: "🇮🇹" },
  { id: "Bundesliga",       label: "Germany",  flag: "🇩🇪" },
  { id: "Ligue 1",          label: "France",   flag: "🇫🇷" },
  { id: "Primeira Liga",    label: "Portugal", flag: "🇵🇹" },
  { id: "Eredivisie",       label: "Neth.",    flag: "🇳🇱" },
  { id: "Saudi Pro League", label: "Saudi",    flag: "🇸🇦" },
  { id: "Süper Lig",        label: "Turkey",   flag: "🇹🇷" },
] as const;

type LeagueId = typeof LEAGUE_FILTERS[number]["id"];

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

type Section = {
  title: string;
  logo: string | null;
  data: Match[];
};

function groupByLeague(matches: Match[]): Section[] {
  const map = new Map<string, Section>();
  for (const match of matches) {
    if (!map.has(match.league)) {
      map.set(match.league, { title: match.league, logo: match.leagueLogo ?? null, data: [] });
    }
    map.get(match.league)!.data.push(match);
  }
  return Array.from(map.values()).sort((a, b) =>
    (LEAGUE_PRIORITY[a.title] ?? 999) - (LEAGUE_PRIORITY[b.title] ?? 999)
  );
}

function LeagueSectionHeader({ title, logo }: { title: string; logo: string | null }) {
  const isUrl = typeof logo === "string" && logo.startsWith("http");
  return (
    <View style={sectionStyles.header}>
      {isUrl ? (
        <Image source={{ uri: logo }} style={sectionStyles.logo} resizeMode="contain" />
      ) : (
        <Text style={sectionStyles.logoEmoji}>{logo ?? "⚽"}</Text>
      )}
      <Text style={sectionStyles.title}>{title}</Text>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(168,85,247,0.15)",
    backgroundColor: Colors.bgDeep,
  },
  logo: { width: 20, height: 20 },
  logoEmoji: { fontSize: 16 },
  title: {
    color: Colors.text,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});

// ── League filter chip ────────────────────────────────────────────────────────
function LeagueChip({
  flag,
  label,
  active,
  onPress,
}: {
  flag: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[leagueChipStyles.chip, active && leagueChipStyles.chipActive]}
    >
      <Text style={leagueChipStyles.flag}>{flag}</Text>
      <Text style={[leagueChipStyles.label, active && leagueChipStyles.labelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const leagueChipStyles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.15)",
  },
  chipActive: {
    backgroundColor: "rgba(168,85,247,0.18)",
    borderColor: Colors.accent,
  },
  flag: {
    fontSize: 13,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  labelActive: {
    color: Colors.accent,
  },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function MatchesScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: result, isRefetching, isFetching } = useMatches();

  const allMatches = result?.matches ?? [];
  const apiSource: ApiSource = result?.source ?? "loading";

  const footballMatches = useMemo(
    () => allMatches.filter((m) => m.sport === "Soccer"),
    [allMatches]
  );

  const [statusFilter, setStatusFilter] = useState<"all" | MatchStatus>("all");
  const [leagueFilter, setLeagueFilter] = useState<LeagueId>("all");

  const STATUS_FILTERS: { label: string; value: "all" | MatchStatus }[] = [
    { label: t.all,      value: "all" },
    { label: t.live,     value: "live" },
    { label: t.finished, value: "finished" },
  ];

  const liveCount = useMemo(
    () => footballMatches.filter((m) => m.status === "live").length,
    [footballMatches]
  );

  // Filter the available league chips to only those that have matches
  const availableLeagues = useMemo(() => {
    const leaguesWithMatches = new Set(footballMatches.map((m) => m.league));
    return LEAGUE_FILTERS.filter(
      (f) => f.id === "all" || leaguesWithMatches.has(f.id)
    );
  }, [footballMatches]);

  const filtered = useMemo(() => {
    return footballMatches.filter((m) => {
      const statusOk = statusFilter === "all" || m.status === statusFilter;
      const leagueOk = leagueFilter === "all" || m.league === leagueFilter;
      return statusOk && leagueOk;
    });
  }, [footballMatches, statusFilter, leagueFilter]);

  const sections = useMemo(() => groupByLeague(filtered), [filtered]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["matches"] });
  };

  const topPadding = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const isLoading = apiSource === "loading" && isFetching;

  const ListHeader = (
    <View style={styles.header}>
      {/* Brand row */}
      <View style={styles.brandRow}>
        <View style={styles.logoBox}>
          <GoalHubLogo size={36} />
        </View>
        <View style={styles.brandTextBlock}>
          <Text style={styles.brandName}>
            <Text style={styles.brandNameWhite}>Goal</Text>
            <Text style={styles.brandNamePurple}>Hub</Text>
          </Text>
          <Text style={styles.brandTagline}>{t.appTagline}</Text>
        </View>
        {liveCount > 0 && (
          <View style={styles.livePill}>
            <LiveBadge />
            <Text style={styles.livePillText}>
              {liveCount} {t.liveCountSuffix}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Status filter */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <FilterChip
            key={f.value}
            label={f.label}
            active={statusFilter === f.value}
            onPress={() => setStatusFilter(f.value)}
          />
        ))}
      </View>

      {/* League filter — horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.leagueRow}
      >
        {availableLeagues.map((league) => (
          <LeagueChip
            key={league.id}
            flag={league.flag}
            label={league.label}
            active={leagueFilter === league.id}
            onPress={() => setLeagueFilter(league.id as LeagueId)}
          />
        ))}
      </ScrollView>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <GlowBackground />
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Fetching live matches…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GlowBackground />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: topPadding },
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
          />
        }
        ListHeaderComponent={ListHeader}
        renderSectionHeader={({ section }) => (
          <LeagueSectionHeader title={section.title} logo={section.logo} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="soccer" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{t.noMatchesFound}</Text>
            <Text style={styles.emptyText}>{t.tryDifferentFilter}</Text>
          </View>
        }
        renderItem={({ item }) => <MatchCard match={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  header: {
    gap: 12,
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 16,
    paddingBottom: 4,
  },
  logoBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "rgba(168,85,247,0.10)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTextBlock: {
    flex: 1,
  },
  brandName: {
    fontSize: 24,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  brandNameWhite: {
    color: Colors.text,
    fontFamily: "Poppins_700Bold",
  },
  brandNamePurple: {
    color: Colors.accent,
    fontFamily: "Poppins_700Bold",
  },
  brandTagline: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
    letterSpacing: 0.3,
  },
  livePill: {
    alignItems: "flex-end",
    gap: 4,
  },
  livePillText: {
    color: Colors.accent,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(168,85,247,0.12)",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  leagueRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 2,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingTop: 80,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
