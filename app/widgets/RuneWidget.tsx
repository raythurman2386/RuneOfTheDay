"use no memo";

import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { runes } from "../data/runes";
import { getTodayKey } from "../utils/dateKey";
import { seededIntFromKey, seededRandomFromKey } from "../utils/seededRandom";
import { saltedKey } from "../utils/userSalt";

interface RuneWidgetProps {
  /** Override the date key (used for preview/testing). Defaults to today. */
  dateKey?: string;
  /** Widget width in dp (from WidgetInfo). Used to scale font sizes. */
  widgetWidth?: number;
  /** Widget height in dp (from WidgetInfo). Used to scale font sizes. */
  widgetHeight?: number;
  /** Per-install salt so each user gets their own daily rune. */
  salt?: string;
  /**
   * Layout variant:
   * - "compact" — rune symbol + name, centered column (2x2, no meaning)
   * - "wide"    — rune symbol + name side-by-side (4x1, no meaning)
   * - "full"    — rune symbol + name + meaning (default; for 3x2 / 4x2)
   */
  variant?: "full" | "compact" | "wide";
}

/**
 * Android home screen widget showing today's rune.
 *
 * Uses react-native-android-widget primitives — no standard RN components,
 * no hooks. The rune is computed deterministically from the date key so the
 * widget always matches the in-app daily rune.
 */
export function RuneWidget({
  dateKey,
  widgetWidth,
  widgetHeight,
  salt,
  variant = "full",
}: RuneWidgetProps) {
  const key = saltedKey(dateKey ?? getTodayKey(), salt ?? "");
  const index = seededIntFromKey(key, runes.length);
  const rune = runes[index];

  // Scale font sizes based on the widget's actual dimensions. Each axis is
  // scaled independently so text never overflows: the symbol is bounded by
  // height (it's the tallest element), while the meaning text length is
  // bounded by width. This keeps things proportional on both small phones
  // (tight 2x2) and large phones (generous 4x2) without over-sizing.
  const width = widgetWidth ?? 180;
  const height = widgetHeight ?? 180;
  const isCompact = variant === "compact";
  const isWide = variant === "wide";

  // Symbol font: bounded by height so it never overflows vertically. The
  // compact (2x2) variant gets a larger share of height since there's no
  // meaning line below it; the wide (4x1) variant gets a smaller share since
  // it's height-constrained; the full variant sits in between.
  const symbolSize = isCompact
    ? Math.round(height * 0.5)
    : isWide
      ? Math.round(height * 0.65)
      : Math.round(height * 0.42);

  // Name font: also height-bounded, but smaller than the symbol.
  const nameSize = isCompact
    ? Math.round(height * 0.12)
    : isWide
      ? Math.round(height * 0.45)
      : Math.round(height * 0.13);

  // Meaning font + truncation: only for the full variant. Width-bounded.
  const meaningSize = Math.round(height * 0.085);
  const maxMeaningLength = Math.round(width * 0.42);

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
  const showMeaning = !isCompact && !isWide;
  const truncatedMeaning =
    showMeaning && meaningText.length > maxMeaningLength
      ? `${meaningText.slice(0, maxMeaningLength - 3)}...`
      : meaningText;

  const displayName = isReversed ? `${rune.name} (Reversed)` : rune.name;

  // Compact layout: centered column with symbol above name.
  if (isCompact) {
    return (
      <FlexWidget
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0D1117",
          borderRadius: 16,
          padding: 8,
          width: "match_parent",
          height: "match_parent",
        }}
        accessibilityLabel={`Daily rune: ${rune.name}`}
      >
        <TextWidget
          text={rune.symbol}
          style={{
            fontFamily: "ElderFuthark",
            fontSize: symbolSize,
            color: "#D4A857",
            textAlign: "center",
            marginBottom: 4,
          }}
        />
        <TextWidget
          text={displayName}
          style={{
            fontSize: nameSize,
            fontFamily: "Inter",
            fontWeight: "700",
            color: "#E6EDF3",
            textAlign: "center",
          }}
        />
      </FlexWidget>
    );
  }

  // Wide layout (4x1): symbol + name side-by-side, no meaning, minimal
  // vertical padding. The symbol column is height-driven so it fills the
  // short vertical space.
  if (isWide) {
    return (
      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          backgroundColor: "#0D1117",
          borderRadius: 12,
          padding: 8,
          width: "match_parent",
          height: "match_parent",
        }}
        accessibilityLabel={`Daily rune: ${rune.name}`}
      >
        <FlexWidget
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
            width: Math.round(height * 0.8),
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
        <FlexWidget
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <TextWidget
            text={displayName}
            style={{
              fontSize: nameSize,
              fontFamily: "Inter",
              fontWeight: "700",
              color: "#E6EDF3",
            }}
          />
        </FlexWidget>
      </FlexWidget>
    );
  }

  // Full layout: side-by-side symbol + text column with meaning.
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
          width: Math.round(height * 0.45),
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
          text={displayName}
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
