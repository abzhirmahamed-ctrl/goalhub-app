import React from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Icon } from "@/components/Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { GlowBackground } from "@/components/GlowBackground";
import { LiveBadge } from "@/components/LiveBadge";
import { TeamAvatar } from "@/components/TeamAvatar";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useMatchById } from "@/hooks/useMatches";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { match } = useMatchById(id ?? "");

  if (!match) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Match not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const topPadding = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 20;

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  const statRows = [
    { label: "Venue", value: match.venue },
    { label: "League", value: match.league },
    { label: "Sport", value: match.sport },
    { label: "Date", value: match.date },
    { label: "Kick-off", value: match.startTime },
  ];

  return (
    <View style={styles.container}>
      <GlowBackground />

      <View style={[styles.navBar, { paddingTop: topPadding }]}>
        <Pressable onPress={() => router.back()} style={styles.navBackBtn}>
          <Icon name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>{match.league}</Text>
        <View style={styles.navRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
      >
        {match.streamUrl ? (
          <VideoPlayer
            streamUrl={match.streamUrl}
            isLive={isLive}
            minute={match.minute}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            homeScore={match.homeScore}
            awayScore={match.awayScore}
          />
        ) : (
          <View style={styles.noStreamBanner}>
            <Icon name="tv-outline" size={28} color={Colors.textMuted} />
            <Text style={styles.noStreamText}>No stream available</Text>
          </View>
        )}

        <View style={styles.scoreSection}>
          <View style={styles.teamsRow}>
            <View style={styles.teamCol}>
              <TeamAvatar name={match.homeTeam} color={match.homeColor} logoUrl={match.homeLogo ?? undefined} size={64} />
              <Text style={styles.teamName}>{match.homeTeam}</Text>
            </View>

            <View style={styles.centerBlock}>
              {match.homeScore !== null ? (
                <Text style={[styles.bigScore, isLive && styles.bigScoreLive]}>
                  {match.homeScore} – {match.awayScore}
                </Text>
              ) : (
                <Text style={styles.vsText}>VS</Text>
              )}
              {isLive ? (
                <LiveBadge minute={match.minute} />
              ) : isFinished ? (
                <Text style={styles.ftLabel}>Full Time</Text>
              ) : (
                <Text style={styles.kickoffLabel}>{match.startTime}</Text>
              )}
            </View>

            <View style={styles.teamCol}>
              <TeamAvatar name={match.awayTeam} color={match.awayColor} logoUrl={match.awayLogo ?? undefined} size={64} />
              <Text style={styles.teamName}>{match.awayTeam}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Match Info</Text>
          {statRows.map((row, i) => (
            <View
              key={row.label}
              style={[
                styles.statRow,
                i < statRows.length - 1 && styles.statRowBorder,
              ]}
            >
              <Text style={styles.statLabel}>{row.label}</Text>
              <Text style={styles.statValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  navBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.navyMid,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  navRight: {
    width: 40,
  },
  noStreamBanner: {
    width: SCREEN_WIDTH,
    height: (SCREEN_WIDTH * 9) / 16,
    backgroundColor: "#050A18",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  noStreamText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  scoreSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  teamsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamCol: {
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  teamName: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  centerBlock: {
    alignItems: "center",
    gap: 10,
    minWidth: 100,
  },
  bigScore: {
    color: Colors.text,
    fontSize: 36,
    fontFamily: "Inter_700Bold",
  },
  bigScoreLive: {
    color: Colors.accent,
  },
  vsText: {
    color: Colors.textMuted,
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
  },
  ftLabel: {
    color: Colors.finished,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  kickoffLabel: {
    color: Colors.upcoming,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  detailsCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.navyCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailsTitle: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
  },
  statRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  statValue: {
    color: Colors.text,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  notFound: {
    flex: 1,
    backgroundColor: Colors.navy,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  notFoundText: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  backBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backBtnText: {
    color: "#000",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
