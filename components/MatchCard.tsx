import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Icon } from "./Icons";
import { LiveBadge } from "./LiveBadge";
import { TeamAvatar } from "./TeamAvatar";
import { type Match } from "@/data/matches";
import Colors from "@/constants/colors";

interface MatchCardProps {
  match: Match;
}

// Convert a "HH:MM" UTC time string to Somalia Time (EAT = UTC+3) in 12-hour format
function toSomaliaTime(time24: string): string {
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10) + 3; // UTC+3 (EAT)
  if (hour >= 24) hour -= 24;
  const minute = minuteStr ?? "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${minute} ${ampm}`;
}

export function MatchCard({ match }: MatchCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  const handlePress = () =>
    router.push({ pathname: "/match/[id]", params: { id: match.id } });

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  const watchLabel = isFinished
    ? "Watch Highlights"
    : match.channel
      ? `Watch on beIN SPORTS ${match.channel}`
      : "Watch on beIN SPORTS";

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[styles.card, isLive && styles.liveCard]}
      >
        {/* Live top accent bar */}
        {isLive && <View style={styles.liveAccentBar} />}

        {/* League pill — centered */}
        <View style={styles.leagueRow}>
          <View style={[styles.leaguePill, isLive && styles.leaguePillLive]}>
            <Text style={[styles.leagueText, isLive && styles.leagueTextLive]}>
              {match.league}
            </Text>
          </View>
        </View>

        {/* Teams + Center info */}
        <View style={styles.teamsRow}>
          {/* Home team */}
          <View style={styles.teamBlock}>
            <TeamAvatar
              name={match.homeTeam}
              abbr={match.homeAbbr}
              color={match.homeColor}
              logoUrl={match.homeLogo ?? undefined}
              size={52}
            />
            <Text style={styles.teamName} numberOfLines={2}>
              {match.homeTeam}
            </Text>
          </View>

          {/* Center — time / score */}
          <View style={styles.centerBlock}>
            {isLive ? (
              <>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLive}>{match.homeScore}</Text>
                  <Text style={styles.scoreSep}>–</Text>
                  <Text style={styles.scoreLive}>{match.awayScore}</Text>
                </View>
                <LiveBadge minute={match.minute} small />
              </>
            ) : isFinished ? (
              <>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreFinished}>{match.homeScore}</Text>
                  <Text style={styles.scoreSepFt}>–</Text>
                  <Text style={styles.scoreFinished}>{match.awayScore}</Text>
                </View>
                <View style={styles.ftPill}>
                  <Text style={styles.ftText}>Full Time</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.kickoffTime}>{toSomaliaTime(match.startTime)}</Text>
                <Text style={styles.timeZoneLabel}>Somalia Time</Text>
              </>
            )}
          </View>

          {/* Away team */}
          <View style={[styles.teamBlock, styles.teamBlockRight]}>
            <TeamAvatar
              name={match.awayTeam}
              abbr={match.awayAbbr}
              color={match.awayColor}
              logoUrl={match.awayLogo ?? undefined}
              size={52}
            />
            <Text style={styles.teamName} numberOfLines={2}>
              {match.awayTeam}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Watch button — always active so streaming links can be added via admin */}
        <Pressable style={styles.watchBtn} onPress={handlePress}>
          <Icon name="play-circle" size={16} color={Colors.accent} />
          <Text style={styles.watchBtnText}>{watchLabel}</Text>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    backgroundColor: Colors.glassBg,
    borderRadius: 18,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  liveCard: {
    borderColor: Colors.glassBorderLive,
    borderWidth: 1.5,
  },
  liveAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.accent,
  },

  // League pill
  leagueRow: {
    alignItems: "center",
    marginBottom: 14,
  },
  leaguePill: {
    backgroundColor: "rgba(168,85,247,0.12)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.22)",
  },
  leaguePillLive: {
    backgroundColor: "rgba(168,85,247,0.22)",
    borderColor: Colors.accent,
  },
  leagueText: {
    color: "#C4B5FD",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.4,
  },
  leagueTextLive: {
    color: Colors.accent,
  },

  // Teams row
  teamsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 4,
  },
  teamBlock: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  teamBlockRight: {
    alignItems: "center",
  },
  teamName: {
    color: Colors.text,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    lineHeight: 16,
  },

  // Center block (time or score)
  centerBlock: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minWidth: 80,
  },
  kickoffTime: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  timeZoneLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },

  // Score
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scoreLive: {
    color: Colors.accent,
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    minWidth: 24,
    textAlign: "center",
  },
  scoreFinished: {
    color: Colors.textSecondary,
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    minWidth: 22,
    textAlign: "center",
  },
  scoreSep: {
    color: Colors.accent,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  scoreSepFt: {
    color: Colors.textMuted,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },

  // Full time
  ftPill: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ftText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.glassDivider,
    marginHorizontal: -16,
  },

  // Watch button
  watchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
  },
  watchBtnText: {
    color: Colors.accent,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
