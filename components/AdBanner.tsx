import React, { useRef, useEffect } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

/**
 * AdMob banner placeholder.
 * Replace the inner content with an actual AdMob BannerAd component
 * once AdMob credentials are configured.
 */
export function AdBanner() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer]);

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.65],
  });

  return (
    <Animated.View style={[styles.banner, { opacity: shimmerOpacity }]}>
      <View style={styles.adLabel}>
        <Text style={styles.adLabelText}>Ad</Text>
      </View>
      <Text style={styles.adText}>Advertisement Banner · 320×50</Text>
      <Text style={styles.adHint}>Replace with AdMob BannerAd</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 54,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: "rgba(168,85,247,0.07)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.18)",
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 10,
  },
  adLabel: {
    backgroundColor: "rgba(168,85,247,0.22)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.35)",
  },
  adLabelText: {
    color: Colors.accent,
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  adText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  adHint: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: "Inter_400Regular",
  },
});
