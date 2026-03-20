import React from "react";
import Svg, {
  Circle,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
} from "react-native-svg";

export type IconName =
  | "soccer"
  | "play-circle-outline"
  | "play-circle"
  | "play"
  | "pause"
  | "calendar"
  | "settings-outline"
  | "cog"
  | "location-outline"
  | "tv-outline"
  | "volume-mute"
  | "volume-medium"
  | "expand"
  | "alert-circle"
  | "x"
  | "close"
  | "lock-closed"
  | "lock-open-outline"
  | "arrow-back"
  | "chevron-back"
  | "information-circle-outline"
  | "notifications-outline"
  | "moon"
  | "checkmark-circle"
  | "globe-outline";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

const SW = 1.5;
const CAP = "round" as const;
const JOIN = "round" as const;

export function Icon({ name, size = 24, color = "#ffffff" }: IconProps) {
  const s = { stroke: color, strokeWidth: SW, strokeLinecap: CAP, strokeLinejoin: JOIN, fill: "none" };

  switch (name) {
    case "soccer":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            fill={color}
            d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm0 2a8 8 0 0 1 8 8 8 8 0 0 1-8 8 8 8 0 0 1-8-8 8 8 0 0 1 8-8zm-1.09 2.06L9.36 9.59 10.91 11.06h2.18l1.55-1.47-1.55-3.53h-2.18zM16.47 6.53l-2.13.84-.95 3.53 1.55 1.47 2.17-.5.92-1.13-1.56-3.53zM7.53 6.53l1.56 3.53 2.17.5 1.55-1.47-.95-3.53-2.13-.84-2.2 1.81zM4.59 13.5l1.47 1.81 2.13-.92.5-2.17-1.55-1.47-2.17.5-.38 2.25zM6.28 17.53l2.5 1.72h2l.5-2.27-1.84-1.2-2.13.92-.53 0.83zM15.22 19.25h2l2.5-1.72-.53-.83-2.13-.92-1.84 1.2.5 2.27zm3.5-5.75-.38-2.25-2.17-.5-1.55 1.47.5 2.17 2.13.92 1.47-1.81z"
          />
        </Svg>
      );

    case "play-circle-outline":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="10" {...s} />
          <Path d="M10 8L16 12L10 16Z" fill={color} stroke="none" />
        </Svg>
      );

    case "play-circle":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="12" fill={color} />
          <Path d="M10 8L17 12L10 16Z" fill="#fff" stroke="none" />
        </Svg>
      );

    case "play":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M5 3L19 12L5 21Z" fill={color} stroke="none" />
        </Svg>
      );

    case "pause":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="6" y="4" width="4" height="16" rx="1" fill={color} />
          <Rect x="14" y="4" width="4" height="16" rx="1" fill={color} />
        </Svg>
      );

    case "calendar":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="3" y="4" width="18" height="18" rx="2" {...s} />
          <Line x1="16" y1="2" x2="16" y2="6" {...s} />
          <Line x1="8" y1="2" x2="8" y2="6" {...s} />
          <Line x1="3" y1="10" x2="21" y2="10" {...s} />
        </Svg>
      );

    case "settings-outline":
    case "cog":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="3" {...s} />
          <Path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
            {...s}
          />
        </Svg>
      );

    case "location-outline":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"
            {...s}
          />
          <Circle cx="12" cy="9" r="2.5" {...s} />
        </Svg>
      );

    case "tv-outline":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="2" y="7" width="20" height="14" rx="2" {...s} />
          <Polyline points="17,2 12,7 7,2" {...s} />
        </Svg>
      );

    case "volume-mute":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polygon points="11,5 6,9 2,9 2,15 6,15 11,19" {...s} />
          <Line x1="23" y1="9" x2="17" y2="15" {...s} />
          <Line x1="17" y1="9" x2="23" y2="15" {...s} />
        </Svg>
      );

    case "volume-medium":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polygon points="11,5 6,9 2,9 2,15 6,15 11,19" {...s} />
          <Path d="M15.54 8.46a5 5 0 0 1 0 7.07" {...s} />
        </Svg>
      );

    case "expand":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polyline points="15,3 21,3 21,9" {...s} />
          <Polyline points="9,21 3,21 3,15" {...s} />
          <Line x1="21" y1="3" x2="14" y2="10" {...s} />
          <Line x1="3" y1="21" x2="10" y2="14" {...s} />
        </Svg>
      );

    case "alert-circle":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="10" {...s} />
          <Line x1="12" y1="8" x2="12" y2="12" {...s} />
          <Line x1="12" y1="16" x2="12.01" y2="16" {...s} />
        </Svg>
      );

    case "x":
    case "close":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Line x1="18" y1="6" x2="6" y2="18" {...s} />
          <Line x1="6" y1="6" x2="18" y2="18" {...s} />
        </Svg>
      );

    case "lock-closed":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="5" y="11" width="14" height="11" rx="2" {...s} />
          <Path d="M7 11V7a5 5 0 0 1 10 0v4" {...s} />
        </Svg>
      );

    case "lock-open-outline":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="3" y="11" width="14" height="11" rx="2" {...s} />
          <Path d="M7 11V7a5 5 0 0 1 9.9-1" {...s} />
        </Svg>
      );

    case "arrow-back":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Line x1="19" y1="12" x2="5" y2="12" {...s} />
          <Polyline points="12,19 5,12 12,5" {...s} />
        </Svg>
      );

    case "chevron-back":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polyline points="15,18 9,12 15,6" {...s} />
        </Svg>
      );

    case "information-circle-outline":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="10" {...s} />
          <Line x1="12" y1="8" x2="12.01" y2="8" strokeWidth={2.5} strokeLinecap="round" stroke={color} />
          <Line x1="12" y1="12" x2="12" y2="16" {...s} />
        </Svg>
      );

    case "notifications-outline":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
            {...s}
          />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" {...s} />
        </Svg>
      );

    case "moon":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            {...s}
          />
        </Svg>
      );

    case "checkmark-circle":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="10" fill={color} />
          <Path d="M8 12L11 15L16 9" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );

    case "globe-outline":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="10" {...s} />
          <Path d="M2 12h20" {...s} />
          <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" {...s} />
        </Svg>
      );

    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={SW} fill="none" />
        </Svg>
      );
  }
}
