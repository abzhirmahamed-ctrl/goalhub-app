import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "@/constants/colors";
import { Icon } from "./Icons";
import { LiveBadge } from "./LiveBadge";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16;

// ─── Network quality detection ───────────────────────────────────────────────

type Quality = "HD" | "SD" | "detecting";

/**
 * Measures current connection quality.
 * - Web: reads navigator.connection.effectiveType
 * - All platforms: times a small payload fetch as a fallback
 */
async function measureQuality(): Promise<Quality> {
  if (Platform.OS === "web" && typeof navigator !== "undefined") {
    const conn = (navigator as any).connection;
    if (conn) {
      const eff: string = conn.effectiveType ?? "4g";
      if (eff === "4g" || eff === "3g") return "HD";
      return "SD";
    }
  }

  // Timing-based fallback: fetch ~5 KB and time it
  try {
    const start = Date.now();
    await fetch(
      "https://www.gstatic.com/generate_204",
      { method: "HEAD", cache: "no-store" }
    );
    const ms = Date.now() - start;
    return ms < 300 ? "HD" : "SD";
  } catch {
    return "HD";
  }
}

function useAutoQuality(): { quality: Quality } {
  const [quality, setQuality] = useState<Quality>("detecting");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const q = await measureQuality();
      if (!cancelled) setQuality(q);
    };

    run();

    // Re-check every 10 s
    const interval = setInterval(run, 10_000);

    // Also re-check when the web connection type changes
    if (Platform.OS === "web") {
      const conn = (navigator as any).connection;
      if (conn) conn.addEventListener("change", run);
      return () => {
        cancelled = true;
        clearInterval(interval);
        conn?.removeEventListener("change", run);
      };
    }

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { quality };
}

// ─── Glassmorphism spinner ────────────────────────────────────────────────────

function GlassSpinner() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={spinner.wrapper}>
      <View style={spinner.glassCircle}>
        <Animated.View style={[spinner.arc, { transform: [{ rotate }] }]} />
        <View style={spinner.innerDot} />
      </View>
    </View>
  );
}

const spinner = StyleSheet.create({
  wrapper: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  glassCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  arc: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: "transparent",
    borderTopColor: Colors.accent,
    borderRightColor: Colors.accent + "55",
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    opacity: 0.9,
  },
});

// ─── Quality badge ────────────────────────────────────────────────────────────

function QualityBadge({ quality }: { quality: Quality }) {
  if (quality === "detecting") return null;
  const isHD = quality === "HD";
  return (
    <View
      style={[
        badge.container,
        isHD ? badge.hd : badge.sd,
      ]}
    >
      <Text style={badge.text}>{quality}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  container: {
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
  },
  hd: {
    backgroundColor: "rgba(0,230,118,0.15)",
    borderColor: "rgba(0,230,118,0.40)",
  },
  sd: {
    backgroundColor: "rgba(245,158,11,0.15)",
    borderColor: "rgba(245,158,11,0.40)",
  },
  text: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
});

// ─── Main VideoPlayer ─────────────────────────────────────────────────────────

interface VideoPlayerProps {
  streamUrl: string;
  isLive?: boolean;
  minute?: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
}

export function VideoPlayer({
  streamUrl,
  isLive,
  minute,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlOpacity = useRef(new Animated.Value(1)).current;
  const videoRef = useRef<any>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { quality } = useAutoQuality();

  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = setTimeout(() => {
        Animated.timing(controlOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setShowControls(false));
      }, 3000);
    }
  }, [playing, controlOpacity]);

  const handleTap = () => {
    if (!showControls) {
      setShowControls(true);
      Animated.timing(controlOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => resetHideTimer());
    } else {
      resetHideTimer();
    }
  };

  const handlePlayPause = () => {
    const next = !playing;
    setPlaying(next);
    if (next) {
      setLoading(true);
      setTimeout(() => setLoading(false), 1200);
      resetHideTimer();
      videoRef.current?.playAsync?.();
    } else {
      videoRef.current?.pauseAsync?.();
    }
  };

  // Web player
  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <video
          ref={videoRef as any}
          src={streamUrl}
          style={{
            width: SCREEN_WIDTH,
            height: VIDEO_HEIGHT,
            objectFit: "cover",
            display: "block",
          } as any}
          controls
          playsInline
        />
        <View style={styles.scoreOverlay} pointerEvents="none">
          {isLive && <LiveBadge minute={minute} />}
          {homeScore !== null && (
            <View style={styles.scoreChip}>
              <Text style={styles.scoreChipText}>
                {homeScore} – {awayScore}
              </Text>
            </View>
          )}
          <QualityBadge quality={quality} />
        </View>
      </View>
    );
  }

  // Native player
  return (
    <View style={styles.container}>
      <Pressable onPress={handleTap} style={styles.pressable}>
        {/* Placeholder / video surface */}
        <View style={styles.videoPlaceholder}>
          <Icon name="tv-outline" size={42} color="rgba(255,255,255,0.15)" />
        </View>

        {/* Controls overlay */}
        <Animated.View
          style={[
            styles.overlay,
            { opacity: showControls ? controlOpacity : 0 },
          ]}
        >
          {/* Top bar */}
          <View style={styles.topBar}>
            {isLive && <LiveBadge minute={minute} />}
            {homeScore !== null && (
              <View style={styles.scoreChip}>
                <Text style={styles.scoreChipText}>
                  {homeScore} – {awayScore}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }} />
            <QualityBadge quality={quality} />
          </View>

          {/* Centre — spinner or play/pause */}
          {loading ? (
            <GlassSpinner />
          ) : (
            <Pressable onPress={handlePlayPause} style={styles.playBtn}>
              <Icon
                name={playing ? "pause" : "play"}
                size={36}
                color="#fff"
              />
            </Pressable>
          )}

          {/* Bottom bar */}
          <View style={styles.bottomBar}>
            <Pressable
              onPress={() => setMuted(!muted)}
              style={styles.ctrlBtn}
            >
              <Icon
                name={muted ? "volume-mute" : "volume-medium"}
                size={20}
                color="#fff"
              />
            </Pressable>
            <Pressable style={styles.ctrlBtn}>
              <Icon name="expand" size={20} color="#fff" />
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: "#050A1A",
  },
  pressable: {
    flex: 1,
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#050A1A",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,6,23,0.45)",
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
  },
  scoreChip: {
    backgroundColor: "rgba(2,6,23,0.70)",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  scoreChipText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  playBtn: {
    alignSelf: "center",
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },
  ctrlBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  // Web overlay
  scoreOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
