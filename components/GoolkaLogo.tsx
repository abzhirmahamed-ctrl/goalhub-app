import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface GoolkaLogoProps {
  size?: number;
}

/**
 * Goolka TV brand logo — fluid interconnected dots in Vibrant Purple
 * with a layered neon glow effect.
 */
export function GoolkaLogo({ size = 48 }: GoolkaLogoProps) {
  const pulse = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.85,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const s = size;
  const dot = s * 0.28;        // primary dot diameter
  const dotSm = s * 0.18;      // satellite dot diameter
  const glow1 = s * 1.1;       // outer halo
  const glow2 = s * 0.82;      // mid glow
  const bridge = s * 0.07;     // connector thickness

  return (
    <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>

      {/* ── Outermost ambient halo (pulsing) ── */}
      <Animated.View
        style={[
          styles.halo,
          {
            width: glow1,
            height: glow1,
            borderRadius: glow1 / 2,
            opacity: pulse.interpolate({ inputRange: [0.85, 1], outputRange: [0.08, 0.18] }),
          },
        ]}
      />

      {/* ── Mid glow ── */}
      <Animated.View
        style={[
          styles.halo,
          {
            width: glow2,
            height: glow2,
            borderRadius: glow2 / 2,
            opacity: pulse.interpolate({ inputRange: [0.85, 1], outputRange: [0.14, 0.28] }),
          },
        ]}
      />

      {/* ── Connector: top-dot ↔ bottom-left-dot ── */}
      <View
        style={[
          styles.connector,
          {
            width: bridge,
            height: s * 0.38,
            top: s * 0.14,
            left: s * 0.28,
            transform: [{ rotate: "30deg" }],
          },
        ]}
      />

      {/* ── Connector: top-dot ↔ bottom-right-dot ── */}
      <View
        style={[
          styles.connector,
          {
            width: bridge,
            height: s * 0.38,
            top: s * 0.14,
            right: s * 0.28,
            transform: [{ rotate: "-30deg" }],
          },
        ]}
      />

      {/* ── Connector: bottom horizontal ── */}
      <View
        style={[
          styles.connector,
          {
            width: s * 0.42,
            height: bridge,
            bottom: s * 0.18,
            alignSelf: "center",
          },
        ]}
      />

      {/* ── Top centre dot (primary) ── */}
      <View
        style={[
          styles.dotGlow,
          {
            width: dot * 1.6,
            height: dot * 1.6,
            borderRadius: (dot * 1.6) / 2,
            top: s * 0.04,
            alignSelf: "center",
          },
        ]}
      />
      <View
        style={[
          styles.dot,
          {
            width: dot,
            height: dot,
            borderRadius: dot / 2,
            top: s * 0.04 + dot * 0.3,
            alignSelf: "center",
          },
        ]}
      />

      {/* ── Bottom-left dot ── */}
      <View
        style={[
          styles.dotGlow,
          {
            width: dotSm * 1.7,
            height: dotSm * 1.7,
            borderRadius: (dotSm * 1.7) / 2,
            bottom: s * 0.06,
            left: s * 0.06,
          },
        ]}
      />
      <View
        style={[
          styles.dot,
          {
            width: dotSm,
            height: dotSm,
            borderRadius: dotSm / 2,
            bottom: s * 0.06 + dotSm * 0.35,
            left: s * 0.06 + dotSm * 0.35,
          },
        ]}
      />

      {/* ── Bottom-right dot ── */}
      <View
        style={[
          styles.dotGlow,
          {
            width: dotSm * 1.7,
            height: dotSm * 1.7,
            borderRadius: (dotSm * 1.7) / 2,
            bottom: s * 0.06,
            right: s * 0.06,
          },
        ]}
      />
      <View
        style={[
          styles.dot,
          {
            width: dotSm,
            height: dotSm,
            borderRadius: dotSm / 2,
            bottom: s * 0.06 + dotSm * 0.35,
            right: s * 0.06 + dotSm * 0.35,
          },
        ]}
      />
    </View>
  );
}

const PURPLE = "#a855f7";
const PURPLE_GLOW = "rgba(168,85,247,0.35)";

const styles = StyleSheet.create({
  halo: {
    position: "absolute",
    backgroundColor: PURPLE,
  },
  connector: {
    position: "absolute",
    backgroundColor: "rgba(168,85,247,0.45)",
    borderRadius: 4,
  },
  dotGlow: {
    position: "absolute",
    backgroundColor: PURPLE_GLOW,
  },
  dot: {
    position: "absolute",
    backgroundColor: PURPLE,
  },
});
