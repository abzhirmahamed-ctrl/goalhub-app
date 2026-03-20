import React, { useMemo } from "react";
import {
  Platform,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Icon } from "@/components/Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { GlowBackground } from "@/components/GlowBackground";
import { MatchCard } from "@/components/MatchCard";
import { useMatches } from "@/hooks/useMatches";
import { useLanguage } from "@/context/LanguageContext";

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { data: result } = useMatches();
  const allMatches = result?.matches ?? [];

  const footballMatches = allMatches.filter((m) => m.sport === "Soccer");

  const sections = useMemo(() => {
    const groups: Record<string, typeof footballMatches> = {};
    for (const match of footballMatches) {
      if (!groups[match.date]) groups[match.date] = [];
      groups[match.date].push(match);
    }
    const dateLabels: Record<string, string> = {
      Yesterday: t.yesterday,
      Today: t.today,
      Tomorrow: t.tomorrow,
    };
    const order = ["Yesterday", "Today", "Tomorrow"];
    return order
      .filter((d) => groups[d])
      .map((date) => ({ title: dateLabels[date] ?? date, data: groups[date] }));
  }, [footballMatches, t]);

  const topPadding =
    Platform.OS === "web" ? insets.top + 67 : insets.top + 12;

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
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <View style={styles.titleRow}>
              <Icon name="soccer" size={22} color={Colors.accent} />
              <Text style={styles.title}>
                <Text style={styles.titleWhite}>{t.schedule}</Text>
              </Text>
            </View>
            <Text style={styles.subtitle}>{t.fixturesSubtitle}</Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionLine} />
            <View style={styles.sectionCount}>
              <Text style={styles.sectionCountText}>{section.data.length}</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => <MatchCard match={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="soccer" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{t.noFixtures}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  pageHeader: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
  },
  titleWhite: {
    color: Colors.text,
    fontFamily: "Poppins_700Bold",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    marginTop: 6,
  },
  sectionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(168,85,247,0.15)",
  },
  sectionCount: {
    backgroundColor: "rgba(168,85,247,0.12)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.22)",
  },
  sectionCountText: {
    color: Colors.accent,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
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
});
