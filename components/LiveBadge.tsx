import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

interface LiveBadgeProps {
  minute?: number;
  small?: boolean;
}

export function LiveBadge({ minute, small }: LiveBadgeProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.25, duration: 750, useNativeDriver: false }),
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: false }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <View style={[styles.container, small && styles.small]}>
      <Animated.View style={[styles.dot, { opacity }]} />
      <Text style={[styles.text, small && styles.smallText]}>
        LIVE{minute ? ` ${minute}'` : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(168,85,247,0.80)",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.45)",
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  text: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  smallText: {
    fontSize: 9,
  },
});
