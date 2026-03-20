import { Image } from "expo-image";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getTeamLogoUrl } from "@/constants/teamLogos";

interface TeamAvatarProps {
  name: string;
  abbr?: string;
  color: string;
  size?: number;
  logoUrl?: string;
}

function isColorDark(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

export function TeamAvatar({
  name,
  abbr,
  color,
  size = 44,
  logoUrl,
}: TeamAvatarProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  // Resolve logo: explicit prop → global registry → null (show badge)
  const resolvedLogo = logoUrl ?? getTeamLogoUrl(name);

  const displayText = abbr
    ? abbr.slice(0, 3).toUpperCase()
    : name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 3)
        .toUpperCase();

  const fontSize = displayText.length > 2 ? size * 0.28 : size * 0.33;
  const textColor =
    color === "#000000" || color === "#FEBE10" || isColorDark(color)
      ? "#FFFFFF"
      : "#F5F5F5";

  const showLogo = !!resolvedLogo && !logoFailed;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.18,
          backgroundColor: showLogo ? "transparent" : color,
          borderColor: showLogo
            ? "transparent"
            : color === "#000000"
              ? "rgba(255,255,255,0.18)"
              : color + "99",
          borderWidth: showLogo ? 0 : 1.5,
        },
      ]}
    >
      {showLogo ? (
        <Image
          source={{ uri: resolvedLogo }}
          style={{ width: size, height: size }}
          contentFit="contain"
          onError={() => setLogoFailed(true)}
          cachePolicy="memory-disk"
        />
      ) : (
        <>
          <View
            style={[
              styles.shieldGlow,
              { borderRadius: size * 0.18 },
            ]}
          />
          <Text
            style={[
              styles.abbr,
              {
                fontSize,
                color: textColor,
                lineHeight: size * 0.9,
              },
            ]}
          >
            {displayText}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  shieldGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  abbr: {
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.6,
    textAlign: "center",
    zIndex: 1,
  },
});
