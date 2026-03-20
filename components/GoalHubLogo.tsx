import React, { useEffect, useRef } from "react";
import { Animated, Image, View } from "react-native";

interface GoalHubLogoProps {
  size?: number;
}

const ROYAL_PURPLE = "#7B2FF7";

export function GoalHubLogo({ size = 88 }: GoalHubLogoProps) {
  const glow  = useRef(new Animated.Value(0.88)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const glowAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(glow,  { toValue: 1,    duration: 2100, useNativeDriver: false }),
        Animated.timing(glow,  { toValue: 0.88, duration: 2100, useNativeDriver: false }),
      ])
    );
    const scaleAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.03, duration: 2300, useNativeDriver: false }),
        Animated.timing(scale, { toValue: 1,    duration: 2300, useNativeDriver: false }),
      ])
    );
    glowAnim.start();
    scaleAnim.start();
    return () => { glowAnim.stop(); scaleAnim.stop(); };
  }, [glow, scale]);

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        opacity: glow,
        transform: [{ scale }],
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: ROYAL_PURPLE,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={require("../assets/images/sports-logo.jpg")}
          style={{ width: size * 1.34, height: size * 1.34 }}
          resizeMode="cover"
        />
      </View>
    </Animated.View>
  );
}
