"use no memo";

import React from "react";
import {
  FlexWidget,
  TextWidget,
  IconWidget,
} from "react-native-android-widget";
import { runes } from "../data/runes";
import { getTodayKey } from "../utils/dateKey";
import { seededIntFromKey, seededRandomFromKey } from "../utils/seededRandom";

interface RuneWidgetProps {
  /** Override the date key (used for preview/testing). Defaults to today. */
  dateKey?: string;
}

/**
 * Android home screen widget showing today's rune.
 *
 * Uses react-native-android-widget primitives — no standard RN components,
 * no hooks. The rune is computed deterministically from the date key so the
 * widget always matches the in-app daily rune.
 */
export function RuneWidget({ dateKey }: RuneWidgetProps) {
  const key = dateKey ?? getTodayKey();
  const index = seededIntFromKey(key, runes.length);
  const rune = runes[index];

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
    meaningText.length > 80 ? `${meaningText.slice(0, 77)}...` : meaningText;

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
            fontSize: 56,
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
            fontSize: 18,
            fontFamily: "Inter",
            fontWeight: "700",
            color: "#E6EDF3",
            marginBottom: 4,
          }}
        />
        <TextWidget
          text={truncatedMeaning}
          style={{
            fontSize: 13,
            fontFamily: "Inter",
            color: "#9DA7B3",
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
