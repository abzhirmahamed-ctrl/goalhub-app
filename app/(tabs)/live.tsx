import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { Icon } from "@/components/Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { GlowBackground } from "@/components/GlowBackground";
import { LiveBadge } from "@/components/LiveBadge";
import { TeamAvatar } from "@/components/TeamAvatar";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useMatches } from "@/hooks/useMatches";
import { useLanguage } from "@/context/LanguageContext";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { Match } from "@/data/matches";

function LiveMatchRow({
  match,
  isSelected,
  onSelect,
}: {
  match: Match;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={onSelect}
        style={[styles.liveRow, isSelected && styles.liveRowSelected]}
      >
        {isSelected && <View style={styles.selectedBar} />}
        <View style={styles.liveRowContent}>
          <View style={styles.rowTeams}>
            <TeamAvatar name={match.homeTeam} color={match.homeColor} size={32} />
            <View style={styles.rowInfo}>
              <Text style={styles.rowTeamText}>
                {match.homeTeam} vs {match.awayTeam}
              </Text>
              <Text style={styles.rowLeague}>{match.league}</Text>
            </View>
          </View>
          <View style={styles.rowRight}>
            {match.homeScore !== null && (
              <Text style={styles.rowScore}>
                {match.homeScore}–{match.awayScore}
              </Text>
            )}
            <LiveBadge minute={match.minute} small />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function LiveScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { data: result } = useMatches();
  const allMatches = result?.matches ?? [];

  const liveMatches = allMatches.filter(
    (m) => m.status === "live" && m.streamUrl && m.sport === "Soccer"
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedMatch =
    liveMatches.find((m) => m.id === selectedId) ?? liveMatches[0];
  const topPadding = Platform.OS === "web" ? insets.top + 67 : insets.top;

  if (liveMatches.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <GlowBackground />
        <View style={styles.noLive}>
          <Icon name="soccer" size={60} color={Colors.textMuted} />
          <Text style={styles.noLiveTitle}>{t.noLiveFootball}</Text>
          <Text style={styles.noLiveText}>{t.checkBackWhen}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <GlowBackground />

      <VideoPlayer
        streamUrl={selectedMatch?.streamUrl ?? ""}
        isLive
        minute={selectedMatch?.minute}
        homeTeam={selectedMatch?.homeTeam ?? ""}
        awayTeam={selectedMatch?.awayTeam ?? ""}
        homeScore={selectedMatch?.homeScore ?? null}
        awayScore={selectedMatch?.awayScore ?? null}
      />

      {/* Score panel */}
      <View style={styles.scorePanel}>
        <View style={styles.scorePanelTeams}>
          <TeamAvatar
            name={selectedMatch?.homeTeam ?? ""}
            color={selectedMatch?.homeColor ?? ""}
            size={42}
          />
          <View style={styles.scorePanelCenter}>
            {selectedMatch?.homeScore !== null ? (
              <Text style={styles.bigScore}>
                {selectedMatch?.homeScore} – {selectedMatch?.awayScore}
              </Text>
            ) : (
              <Text style={styles.bigVs}>VS</Text>
            )}
            <LiveBadge minute={selectedMatch?.minute} />
          </View>
          <TeamAvatar
            name={selectedMatch?.awayTeam ?? ""}
            color={selectedMatch?.awayColor ?? ""}
            size={42}
          />
        </View>
        <Text style={styles.scorePanelName}>
          {selectedMatch?.homeTeam} vs {selectedMatch?.awayTeam}
        </Text>
        <Text style={styles.scorePanelLeague}>
          {selectedMatch?.league} · {selectedMatch?.venue}
        </Text>
      </View>

      {/* List header */}
      <View style={styles.listHeader}>
        <Icon name="soccer" size={13} color={Colors.accent} />
        <Text style={styles.listHeaderText}>{t.liveMatchesLabel}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{liveMatches.length}</Text>
        </View>
      </View>

      <FlatList
        data={liveMatches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <LiveMatchRow
            match={item}
            isSelected={item.id === selectedId}
            onSelect={() => setSelectedId(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  noLive: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  noLiveTitle: {
    color: Colors.text,
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
  },
  noLiveText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  scorePanel: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(168,85,247,0.15)",
    backgroundColor: "rgba(168,85,247,0.04)",
  },
  scorePanelTeams: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  scorePanelCenter: {
    alignItems: "center",
    gap: 6,
  },
  bigScore: {
    color: Colors.text,
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  bigVs: {
    color: Colors.textMuted,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
  },
  scorePanelName: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  scorePanelLeague: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 2,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  listHeaderText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
    flex: 1,
  },
  countBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  liveRow: {
    backgroundColor: Colors.glassBg,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: "hidden",
    flexDirection: "row",
  },
  liveRowSelected: {
    borderColor: Colors.glassBorderLive,
    backgroundColor: "rgba(168,85,247,0.07)",
  },
  selectedBar: {
    width: 3,
    backgroundColor: Colors.accent,
  },
  liveRowContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  rowTeams: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  rowInfo: {
    gap: 2,
    flex: 1,
  },
  rowTeamText: {
    color: Colors.text,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  rowLeague: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  rowRight: {
    alignItems: "flex-end",
    gap: 5,
  },
  rowScore: {
    color: Colors.accent,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
