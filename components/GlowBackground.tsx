import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

export function GlowBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[Colors.bgDeep, Colors.bgMid, Colors.bgIndigo]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Top-left purple glow */}
      <View style={styles.glowTopLeft} />
      {/* Bottom-right purple glow */}
      <View style={styles.glowBottomRight} />
      {/* Centre indigo bloom */}
      <View style={styles.glowCenter} />
    </View>
  );
}

const styles = StyleSheet.create({
  glowTopLeft: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.glowPurple,
    top: -90,
    left: -90,
  },
  glowBottomRight: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Colors.glowPurpleStrong,
    bottom: -80,
    right: -80,
  },
  glowCenter: {
    position: "absolute",
    width: 320,
    height: 220,
    borderRadius: 160,
    backgroundColor: Colors.glowIndigo,
    top: "38%",
    left: "5%",
  },
});
