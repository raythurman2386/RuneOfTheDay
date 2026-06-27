"use no memo";

import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { runes } from "../data/runes";
import { getTodayKey } from "../utils/dateKey";
import { seededIntFromKey, seededRandomFromKey } from "../utils/seededRandom";

interface RuneWidgetProps {
  /** Override the date key (used for preview/testing). Defaults to today. */
  dateKey?: string;
  /** Widget width in dp (from WidgetInfo). Used to scale font sizes. */
  widgetWidth?: number;
}

/**
 * Android home screen widget showing today's rune.
 *
 * Uses react-native-android-widget primitives — no standard RN components,
 * no hooks. The rune is computed deterministically from the date key so the
 * widget always matches the in-app daily rune.
 */
export function RuneWidget({ dateKey, widgetWidth }: RuneWidgetProps) {
  const key = dateKey ?? getTodayKey();
  const index = seededIntFromKey(key, runes.length);
  const rune = runes[index];

  // Scale font sizes based on widget width. A 2x2 widget (~180dp) gets
  // smaller fonts; a 4x2 widget (~320dp+) gets larger fonts with more
  // room for the meaning text.
  const isWide = (widgetWidth ?? 180) >= 280;
  const symbolSize = isWide ? 64 : 56;
  const nameSize = isWide ? 20 : 18;
  const meaningSize = isWide ? 14 : 13;
  const maxMeaningLength = isWide ? 120 : 80;

  const hasReversedMeaning = Boolean(
    rune?.meaning?.reversed &&
    typeof rune.meaning.reversed === "string" &&
    rune.meaning.reversed.trim() !== "",
  );
  const reversedRoll = seededRandomFromKey(`${key}:reversed`);
  const isReversed = hasReversedMeaning ? reversedRoll < 0.5 : false;

  const meaningText =
    isReversed && rune.meaning.reversed
      ? rune.meaning.reversed
      : rune.meaning.primaryThemes;

  // Truncate meaning for widget display (avoid text overflow)
  const truncatedMeaning =
    meaningText.length > maxMeaningLength
      ? `${meaningText.slice(0, maxMeaningLength - 3)}...`
      : meaningText;

  return (
    <FlexWidget
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "#0D1117",
        borderRadius: 16,
        padding: 16,
        width: "match_parent",
        height: "match_parent",
      }}
      accessibilityLabel={`Daily rune: ${rune.name}`}
    >
      {/* Rune symbol column */}
      <FlexWidget
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginRight: 16,
          width: 72,
        }}
      >
        <TextWidget
          text={rune.symbol}
          style={{
            fontFamily: "ElderFuthark",
            fontSize: symbolSize,
            color: "#D4A857",
            textAlign: "center",
          }}
        />
      </FlexWidget>

      {/* Text column */}
      <FlexWidget
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <TextWidget
          text={isReversed ? `${rune.name} (Reversed)` : rune.name}
          style={{
            fontSize: nameSize,
            fontFamily: "Inter",
            fontWeight: "700",
            color: "#E6EDF3",
            marginBottom: 4,
          }}
        />
        <TextWidget
          text={truncatedMeaning}
          style={{
            fontSize: meaningSize,
            fontFamily: "Inter",
            color: "#9DA7B3",
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
