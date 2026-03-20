import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GoalHubLogo } from "./GoalHubLogo";

const { width: SCREEN_W } = Dimensions.get("window");
const LOGO_SIZE = Math.min(SCREEN_W * 0.66, 270);

interface SplashAnimationProps {
  onDone: () => void;
}

export function SplashAnimation({ onDone }: SplashAnimationProps) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale  = useRef(new Animated.Value(0.65)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    // Hard timeout: always dismiss after 3.5 s, no matter what
    const guard = setTimeout(finish, 3500);

    Animated.sequence([
      // 1. Fade + scale in (use timing, not spring, for web reliability)
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1, duration: 500, useNativeDriver: false,
        }),
        Animated.timing(logoScale, {
          toValue: 1, duration: 600, useNativeDriver: false,
        }),
      ]),
      // 2. Wordmark + tagline
      Animated.timing(textOpacity, {
        toValue: 1, duration: 400, useNativeDriver: false,
      }),
      // 3. Hold
      Animated.delay(900),
      // 4. Fade out entire splash
      Animated.timing(screenOpacity, {
        toValue: 0, duration: 450, useNativeDriver: false,
      }),
    ]).start(() => {
      clearTimeout(guard);
      finish();
    });

    return () => clearTimeout(guard);
  }, []);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.container, { opacity: screenOpacity }]}
      pointerEvents="none"
    >
      {/* Deep purple background */}
      <LinearGradient
        colors={["#04021a", "#0e0730", "#1a0b4e", "#0a0520"]}
        locations={[0, 0.3, 0.65, 1]}
        start={{ x: 0.25, y: 0 }}
        end={{ x: 0.75, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow behind logo */}
      <View style={styles.glowCenter} />
      <View style={styles.glowTL} />
      <View style={styles.glowBR} />

      {/* Logo + wordmark, centred */}
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <GoalHubLogo size={LOGO_SIZE} />

        <Animated.View style={[styles.textWrap, { opacity: textOpacity }]}>
          <Text style={styles.wordmark}>
            <Text style={styles.wordmarkWhite}>Goal</Text>
            <Text style={styles.wordmarkGold}>Hub</Text>
          </Text>
          <Text style={styles.tagline}>Football · Live · Everywhere</Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  glowCenter: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(120,40,220,0.20)",
    alignSelf: "center",
    top: "30%",
    marginTop: -170,
  },
  glowTL: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(168,85,247,0.09)",
    top: -70,
    left: -70,
  },
  glowBR: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(168,85,247,0.12)",
    bottom: -55,
    right: -55,
  },
  logoWrap: {
    alignItems: "center",
    gap: 22,
  },
  textWrap: {
    alignItems: "center",
    gap: 6,
  },
  wordmark: {
    fontSize: 46,
    letterSpacing: -0.5,
    lineHeight: 54,
  },
  wordmarkWhite: {
    color: "#F5F5F5",
    fontFamily: "Poppins_700Bold",
  },
  wordmarkGold: {
    color: "#F6C740",
    fontFamily: "Poppins_700Bold",
  },
  tagline: {
    color: "rgba(200,185,230,0.72)",
    fontSize: 12,
    fontFamily: "Rajdhani_600SemiBold",
    letterSpacing: 2.8,
    textTransform: "uppercase",
  },
});
