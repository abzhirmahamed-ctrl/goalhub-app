// Goolka TV — Deep Midnight Blue / Dark Indigo + Vibrant Purple palette
const accent = "#a855f7";       // Vibrant Purple
const accentDim = "#9333ea";    // Deeper Purple
const accentGlow = "rgba(168,85,247,0.22)";

export default {
  // Core brand
  accent,
  accentDim,
  accentGlow,

  // Backgrounds
  bgDeep: "#020617",        // Deep Midnight Blue
  bgIndigo: "#1e1b4b",      // Dark Indigo
  bgMid: "#0f0e2a",

  // Glass card
  glassBg: "rgba(255,255,255,0.055)",
  glassBgHover: "rgba(255,255,255,0.09)",
  glassBorder: "rgba(168,85,247,0.18)",       // Purple tint on borders
  glassBorderLive: "rgba(168,85,247,0.45)",   // Stronger purple for live
  glassDivider: "rgba(255,255,255,0.07)",

  // Glows (purple theme)
  glowPurple: "rgba(168,85,247,0.12)",
  glowPurpleStrong: "rgba(168,85,247,0.20)",
  glowIndigo: "rgba(99,102,241,0.10)",

  // Status
  live: "#a855f7",                             // Purple LIVE badge
  liveGlow: "rgba(168,85,247,0.25)",
  upcoming: "#F59E0B",
  finished: "#6B7280",

  // Typography (White-Smoke base)
  text: "#F5F5F5",
  textSecondary: "#A5B4C8",
  textMuted: "#5A6A80",

  // Misc
  border: "rgba(168,85,247,0.12)",

  // Legacy compat
  navy: "#020617",
  navyLight: "#0f0e2a",
  navyMid: "rgba(255,255,255,0.06)",
  navyCard: "rgba(255,255,255,0.055)",
  cardShadow: "rgba(0,0,0,0.5)",

  light: {
    text: "#F5F5F5",
    background: "#020617",
    tint: accent,
    tabIconDefault: "#4A5568",
    tabIconSelected: accent,
  },
};
