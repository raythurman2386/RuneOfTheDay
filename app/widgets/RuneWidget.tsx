"use no memo";

import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import {
  pickRuneForDate,
  meaningTextForSelection,
  displayNameForSelection,
  type RuneSelection,
} from "../utils/runeSelection";
import { getTodayKey } from "../utils/dateKey";

// Widget colours mirror the app's dark theme (see constants/Colors.ts).
// The widget always renders on a dark background regardless of the app's
// theme setting, so the dark-theme values are the correct match.
const SYMBOL_COLOR = "#D4A857"; // goldBright — dark-theme accent
const REVERSED_SYMBOL_COLOR = "rgba(255, 90, 90, 0.9)"; // dark-theme reversedRune
const NAME_COLOR = "#E6EDF3"; // dark-theme text
const MEANING_COLOR = "#9DA7B3"; // dark-theme icon
const BACKGROUND_COLOR = "#0D1117"; // dark-theme background

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
   * Pre-resolved selection from the shared cache (app + widget parity).
   * When provided, this takes precedence over computing from dateKey/salt
   * so the widget always shows exactly what the app shows. The task handler
   * reads the app's persisted `runeOfTheDay` entry and passes it here.
   */
  selection?: RuneSelection;
  /**
   * Layout variant:
   * - "compact" — rune symbol + name, centered column (2x2, no meaning)
   * - "wide"    — rune symbol + name side-by-side (4x1, no meaning)
   * - "full"    — rune symbol + name + meaning (default; for 3x2 / 4x2)
   */
  variant?: "full" | "compact" | "wide";
}

/**
 * Resolve the rune selection for the widget. Prefer the cached selection
 * passed from the task handler (guarantees app/widget parity); fall back to
 * computing from the date key + salt so the widget still works standalone.
 */
const resolveSelection = (
  dateKey: string | undefined,
  salt: string | undefined,
  selection: RuneSelection | undefined,
): RuneSelection => {
  if (selection) return selection;
  return pickRuneForDate(dateKey ?? getTodayKey(), salt ?? "");
};

/**
 * Android home screen widget showing today's rune.
 *
 * Uses react-native-android-widget primitives — no standard RN components,
 * no hooks. The rune is resolved via the shared `pickRuneForDate` (or a
 * cached selection from the app) so the widget always matches the in-app
 * daily rune. Reversed runes tint the symbol red and append " (Reversed)"
 * to the name, mirroring the app's reversed-rune treatment (Android widget
 * RemoteViews don't support rotation, so colour is the visual cue).
 */
export function RuneWidget({
  dateKey,
  widgetWidth,
  widgetHeight,
  salt,
  selection,
  variant = "full",
}: RuneWidgetProps) {
  const resolved = resolveSelection(dateKey, salt, selection);
  const { rune, isReversed } = resolved;

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

  const meaningText = meaningTextForSelection(resolved);
  const displayName = displayNameForSelection(resolved);

  // Reversed runes: tint the symbol red to signal reversal, matching the
  // app's reversedRune colour. Android widget RemoteViews don't support
  // CSS-style rotation, so the colour change + " (Reversed)" name suffix
  // (added by displayNameForSelection) are the visual cues — consistent
  // with the app's red-tone treatment for reversed runes.
  const symbolColor = isReversed ? REVERSED_SYMBOL_COLOR : SYMBOL_COLOR;

  // Truncate meaning for widget display (avoid text overflow)
  const showMeaning = !isCompact && !isWide;
  const truncatedMeaning =
    showMeaning && meaningText.length > maxMeaningLength
      ? `${meaningText.slice(0, maxMeaningLength - 3)}...`
      : meaningText;

  // Compact layout: centered column with symbol above name.
  if (isCompact) {
    return (
      <FlexWidget
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BACKGROUND_COLOR,
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
            color: symbolColor,
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
            color: NAME_COLOR,
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
          backgroundColor: BACKGROUND_COLOR,
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
              color: symbolColor,
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
              color: NAME_COLOR,
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
        backgroundColor: BACKGROUND_COLOR,
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
            color: symbolColor,
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
            color: NAME_COLOR,
            marginBottom: 4,
          }}
        />
        <TextWidget
          text={truncatedMeaning}
          style={{
            fontSize: meaningSize,
            fontFamily: "Inter",
            color: MEANING_COLOR,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
