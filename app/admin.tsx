import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Icon } from "@/components/Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { AdminStore } from "@/store/AdminStore";
import { useMatches } from "@/hooks/useMatches";
import { useLanguage } from "@/context/LanguageContext";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: result } = useMatches();
  const allMatches = result?.matches ?? [];
  const football = allMatches.filter((m) => m.sport === "Soccer");

  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [streamUrls, setStreamUrls] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const loadUrls = useCallback(async () => {
    setLoading(true);
    const urls = await AdminStore.getStreamUrls();
    setStreamUrls(urls);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (unlocked) loadUrls();
  }, [unlocked, loadUrls]);

  const handleUnlock = async () => {
    const ok = await AdminStore.verifyPassword(password);
    if (ok) {
      setUnlocked(true);
      setError("");
    } else {
      setError(t.adminWrongPassword);
      setPassword("");
    }
  };

  const handleSave = async (matchId: string) => {
    const url = streamUrls[matchId] ?? "";
    await AdminStore.setStreamUrl(matchId, url);
    setSaved((prev) => ({ ...prev, [matchId]: true }));
    queryClient.invalidateQueries({ queryKey: ["matches"] });
    setTimeout(() => setSaved((prev) => ({ ...prev, [matchId]: false })), 2500);
  };

  if (!unlocked) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
        <LinearGradient
          colors={["#020617", "#0f0e2a", "#1e1b4b"]}
          locations={[0, 0.5, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.lockBox}>
          {/* Close */}
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <Icon name="close" size={22} color={Colors.textSecondary} />
          </Pressable>

          <View style={styles.lockIconBox}>
            <Icon name="lock-closed" size={28} color={Colors.accent} />
          </View>
          <Text style={styles.lockTitle}>{t.adminTitle}</Text>
          <Text style={styles.lockSub}>{t.adminSubtitle}</Text>

          <TextInput
            style={styles.input}
            placeholder={t.adminPassword}
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleUnlock}
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            autoFocus
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable style={styles.unlockBtn} onPress={handleUnlock}>
            <Icon name="lock-open-outline" size={16} color="#fff" />
            <Text style={styles.unlockBtnText}>{t.adminUnlock}</Text>
          </Pressable>

          <Text style={styles.hintText}>
            Default password: <Text style={{ color: Colors.accent }}>goalhub2024</Text>
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#020617", "#0f0e2a", "#1e1b4b"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.adminHeader, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Icon name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <View>
          <Text style={styles.adminTitle}>{t.adminTitle}</Text>
          <Text style={styles.adminSub}>{t.adminMatchList}</Text>
        </View>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>ADMIN</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionLabel}>LIVE STREAM URLS</Text>

          {football.map((match) => (
            <View key={match.id} style={styles.matchRow}>
              {/* Match info */}
              <View style={styles.matchRowHeader}>
                <View style={[styles.statusDot, {
                  backgroundColor:
                    match.status === "live" ? Colors.accent
                    : match.status === "upcoming" ? Colors.upcoming
                    : Colors.finished,
                }]} />
                <Text style={styles.matchTitle}>
                  {match.homeTeam} vs {match.awayTeam}
                </Text>
                <View style={styles.leaguePill}>
                  <Text style={styles.leaguePillText}>{match.league}</Text>
                </View>
              </View>

              {/* URL input row */}
              <View style={styles.urlRow}>
                <TextInput
                  style={styles.urlInput}
                  placeholder={t.adminStreamUrl}
                  placeholderTextColor={Colors.textMuted}
                  value={streamUrls[match.id] ?? match.streamUrl ?? ""}
                  onChangeText={(text) =>
                    setStreamUrls((prev) => ({ ...prev, [match.id]: text }))
                  }
                  returnKeyType="done"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                <Pressable
                  style={[styles.saveBtn, saved[match.id] && styles.savedBtn]}
                  onPress={() => handleSave(match.id)}
                >
                  <Text style={styles.saveBtnText}>
                    {saved[match.id] ? t.adminSaved : t.adminSave}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}

          <View style={styles.tipCard}>
            <Icon name="information-circle-outline" size={16} color={Colors.accent} />
            <Text style={styles.tipText}>
              Paste HLS (.m3u8) or direct MP4 URLs. Saved URLs override default streams instantly.
            </Text>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  lockBox: {
    margin: 24,
    padding: 28,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: "center",
    gap: 14,
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    padding: 4,
  },
  lockIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(168,85,247,0.14)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  lockTitle: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
  },
  lockSub: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  unlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
    width: "100%",
    justifyContent: "center",
    marginTop: 4,
  },
  unlockBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  hintText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  adminHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassDivider,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  adminTitle: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
  adminSub: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  adminBadge: {
    marginLeft: "auto",
    backgroundColor: "rgba(168,85,247,0.18)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.35)",
  },
  adminBadgeText: {
    color: Colors.accent,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  matchRow: {
    backgroundColor: Colors.glassBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: 14,
    gap: 10,
  },
  matchRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  matchTitle: {
    color: Colors.text,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  leaguePill: {
    backgroundColor: "rgba(168,85,247,0.10)",
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.20)",
  },
  leaguePillText: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
  },
  urlRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  urlInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  savedBtn: {
    backgroundColor: "#22c55e",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  tipCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(168,85,247,0.07)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.18)",
    marginTop: 8,
    alignItems: "flex-start",
  },
  tipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 18,
  },
});
