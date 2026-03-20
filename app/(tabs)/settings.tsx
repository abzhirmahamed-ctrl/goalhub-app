import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Icon } from "@/components/Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { GlowBackground } from "@/components/GlowBackground";
import { useLanguage } from "@/context/LanguageContext";
import { LangCode } from "@/constants/translations";

const LANGUAGES: { code: LangCode; native: string; english: string; flag: string }[] = [
  { code: "en", native: "English",     english: "English",  flag: "🇬🇧" },
  { code: "so", native: "Af-Soomaali", english: "Somali",   flag: "🇸🇴" },
  { code: "ar", native: "العربية",     english: "Arabic",   flag: "🇸🇦" },
  { code: "es", native: "Español",     english: "Spanish",  flag: "🇪🇸" },
  { code: "fr", native: "Français",    english: "French",   flag: "🇫🇷" },
];

function SectionLabel({ label }: { label: string }) {
  return (
    <View style={styles.sectionLabel}>
      <Text style={styles.sectionLabelText}>{label}</Text>
    </View>
  );
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.glassCard}>{children}</View>;
}

function RowDivider() {
  return <View style={styles.rowDivider} />;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { t, lang, setLang } = useLanguage();

  const [matchAlerts, setMatchAlerts] = useState(true);
  const [goalNotifications, setGoalNotifications] = useState(true);
  const [pushSubscribed, setPushSubscribed] = useState(false);

  const handlePushSubscribe = () => {
    setPushSubscribed((prev) => !prev);
  };

  const handleMatchAlertsToggle = (value: boolean) => {
    setMatchAlerts(value);
  };

  const handleGoalNotificationsToggle = (value: boolean) => {
    setGoalNotifications(value);
  };

  const topPadding = Platform.OS === "web" ? insets.top + 67 : insets.top + 12;

  return (
    <View style={styles.container}>
      <GlowBackground />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPadding, paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page header ── */}
        <View style={styles.pageHeader}>
          <View style={styles.titleRow}>
            <View style={styles.titleIconBox}>
              <Icon name="cog" size={20} color={Colors.accent} />
            </View>
            <Text style={styles.title}>
              <Text style={styles.titleWhite}>{t.settings}</Text>
            </Text>
          </View>
          <Text style={styles.subtitle}>{t.personalise}</Text>
        </View>

        {/* ── NOTIFICATIONS ── */}
        <SectionLabel label={t.notifications} />
        <GlassCard>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBubble, { backgroundColor: "rgba(168,85,247,0.16)" }]}>
                <Icon name="notifications-outline" size={18} color={Colors.accent} />
              </View>
              <View style={styles.rowTextBlock}>
                <Text style={styles.rowTitle}>{t.matchAlerts}</Text>
                <Text style={styles.rowSub}>{t.matchAlertsDesc}</Text>
              </View>
            </View>
            <Switch
              value={matchAlerts}
              onValueChange={handleMatchAlertsToggle}
              trackColor={{ false: "rgba(255,255,255,0.10)", true: "rgba(168,85,247,0.55)" }}
              thumbColor={matchAlerts ? Colors.accent : Colors.textMuted}
              ios_backgroundColor="rgba(255,255,255,0.10)"
            />
          </View>

          <RowDivider />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBubble, { backgroundColor: "rgba(245,158,11,0.14)" }]}>
                <Icon name="soccer" size={18} color={Colors.upcoming} />
              </View>
              <View style={styles.rowTextBlock}>
                <Text style={styles.rowTitle}>{t.goalNotifications}</Text>
                <Text style={styles.rowSub}>{t.goalNotificationsDesc}</Text>
              </View>
            </View>
            <Switch
              value={goalNotifications}
              onValueChange={handleGoalNotificationsToggle}
              trackColor={{ false: "rgba(255,255,255,0.10)", true: "rgba(168,85,247,0.55)" }}
              thumbColor={goalNotifications ? Colors.accent : Colors.textMuted}
              ios_backgroundColor="rgba(255,255,255,0.10)"
            />
          </View>

          <RowDivider />

          {/* Push Notifications subscribe */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBubble, { backgroundColor: pushSubscribed ? "rgba(34,197,94,0.16)" : "rgba(168,85,247,0.12)" }]}>
                <Icon
                  name={pushSubscribed ? "checkmark-circle" : "globe-outline"}
                  size={18}
                  color={pushSubscribed ? "#22c55e" : Colors.accent}
                />
              </View>
              <View style={styles.rowTextBlock}>
                <Text style={styles.rowTitle}>{t.pushNotifications}</Text>
                <Text style={styles.rowSub}>{t.pushNotificationsDesc}</Text>
              </View>
            </View>
            <Pressable
              style={[styles.subscribePill, pushSubscribed && styles.subscribedPill]}
              onPress={handlePushSubscribe}
            >
              <Text style={[styles.subscribePillText, pushSubscribed && styles.subscribedPillText]}>
                {pushSubscribed ? t.subscribed : t.subscribe}
              </Text>
            </Pressable>
          </View>
        </GlassCard>

        {/* ── LANGUAGE ── */}
        <SectionLabel label={t.language} />
        <GlassCard>
          {LANGUAGES.map((language, idx) => (
            <React.Fragment key={language.code}>
              {idx > 0 && <RowDivider />}
              <Pressable
                style={[styles.row, lang === language.code && styles.activeRow]}
                onPress={() => setLang(language.code)}
              >
                <View style={styles.rowLeft}>
                  <View style={[
                    styles.iconBubble,
                    lang === language.code
                      ? { backgroundColor: "rgba(168,85,247,0.20)" }
                      : { backgroundColor: "rgba(255,255,255,0.06)" },
                  ]}>
                    <Text style={styles.flagEmoji}>{language.flag}</Text>
                  </View>
                  <View style={styles.rowTextBlock}>
                    <Text style={[
                      styles.rowTitle,
                      lang === language.code && { color: Colors.accent },
                    ]}>
                      {language.native}
                    </Text>
                    <Text style={styles.rowSub}>{language.english}</Text>
                  </View>
                </View>
                <View style={[
                  styles.radioOuter,
                  lang === language.code && styles.radioOuterActive,
                ]}>
                  {lang === language.code && <View style={styles.radioInner} />}
                </View>
              </Pressable>
            </React.Fragment>
          ))}
        </GlassCard>

        {/* ── THEME ── */}
        <SectionLabel label={t.theme} />
        <GlassCard>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBubble, {
                backgroundColor: "rgba(30,27,75,0.70)",
                borderWidth: 1,
                borderColor: "rgba(168,85,247,0.22)",
              }]}>
                <Icon name="moon" size={18} color={Colors.accent} />
              </View>
              <View style={styles.rowTextBlock}>
                <Text style={styles.rowTitle}>{t.darkMode}</Text>
                <Text style={styles.rowSub}>{t.darkModeDesc}</Text>
              </View>
            </View>
            <View style={styles.lockedBadge}>
              <Text style={styles.lockedText}>{t.defaultLabel}</Text>
            </View>
          </View>

          <RowDivider />

          <View style={styles.themePreviewRow}>
            {["#020617", "#0f0e2a", "#1e1b4b", "#a855f7"].map((col) => (
              <View key={col} style={[styles.colourDot, { backgroundColor: col }]} />
            ))}
            <Text style={styles.themePreviewLabel}>Midnight Blue + Purple</Text>
          </View>
        </GlassCard>

        {/* ── ABOUT ── */}
        <SectionLabel label={t.about} />
        <GlassCard>
          <Pressable
            style={styles.row}
            onLongPress={() => router.push("/admin")}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBubble, { backgroundColor: "rgba(168,85,247,0.14)" }]}>
                <Icon name="soccer" size={18} color={Colors.accent} />
              </View>
              <View style={styles.rowTextBlock}>
                <Text style={styles.rowTitle}>
                  <Text style={{ color: Colors.text }}>Goal</Text>
                  <Text style={{ color: Colors.accent }}>Hub</Text>
                </Text>
                <Text style={styles.rowSub}>{t.footballLiveEverywhere}</Text>
              </View>
            </View>
            <Text style={styles.versionText}>v1.0.0</Text>
          </Pressable>
        </GlassCard>

        <Text style={styles.adminHint}>Long-press the GoalHub logo above to access Admin Panel</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  scroll: {
    paddingHorizontal: 16,
  },
  pageHeader: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  titleIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "rgba(168,85,247,0.14)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.28)",
    alignItems: "center",
    justifyContent: "center",
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
  sectionLabel: {
    marginBottom: 8,
    marginTop: 8,
  },
  sectionLabelText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  glassCard: {
    backgroundColor: Colors.glassBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: 20,
    overflow: "hidden",
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.glassDivider,
    marginLeft: 58,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  activeRow: {
    backgroundColor: "rgba(168,85,247,0.05)",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  flagEmoji: {
    fontSize: 20,
  },
  rowTextBlock: {
    flex: 1,
  },
  rowTitle: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  rowSub: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderColor: Colors.accent,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  subscribePill: {
    backgroundColor: "rgba(168,85,247,0.14)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.35)",
  },
  subscribedPill: {
    backgroundColor: "rgba(34,197,94,0.14)",
    borderColor: "rgba(34,197,94,0.35)",
  },
  subscribePillText: {
    color: Colors.accent,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  subscribedPillText: {
    color: "#22c55e",
  },
  lockedBadge: {
    backgroundColor: "rgba(168,85,247,0.08)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.18)",
  },
  lockedText: {
    color: Colors.accent,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  themePreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  colourDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  themePreviewLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginLeft: 4,
  },
  versionText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  adminHint: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: -10,
    letterSpacing: 0.2,
  },
});
