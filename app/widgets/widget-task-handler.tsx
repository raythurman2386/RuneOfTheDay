import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RuneWidget } from "./RuneWidget";
import { getUserSalt } from "../utils/userSalt";
import { getTodayKey } from "../utils/dateKey";
import { pickRuneForDate, type RuneSelection } from "../utils/runeSelection";
import { runes } from "../data/runes";

// Each registered widget name maps to a layout variant:
// - "compact" — rune + name, centered column (2x2, no meaning)
// - "wide"    — rune + name side-by-side (4x1, no meaning)
// - "full"    — rune + name + meaning (3x2 / 4x2)
const widgetVariants: Record<string, "compact" | "wide" | "full"> = {
  RuneCompact: "compact",
  Rune: "full",
  RuneWide: "full",
  RuneWide4x1: "wide",
};

// Must match STORAGE_KEY in useRuneOfTheDay.ts — the widget reads the app's
// cached daily rune so the two surfaces always agree.
const RUNE_OF_THE_DAY_KEY = "runeOfTheDay";

interface StoredRuneOfTheDay {
  date: string;
  index: number;
  timestamp: number;
  isReversed?: boolean;
}

/**
 * Resolve the rune selection to display on the widget.
 *
 * Preference order:
 * 1. The app's persisted `runeOfTheDay` entry, **if** its date matches
 *    today's key. This guarantees the widget shows exactly what the app
 *    shows — no midnight/timezone drift window between the two surfaces.
 * 2. Otherwise, compute fresh from today's date key + the per-install salt.
 *    The widget still works if the app has never been opened today, and the
 *    app will sync to this same value on its next interval check (both use
 *    the shared `pickRuneForDate`).
 */
const resolveWidgetSelection = async (salt: string): Promise<RuneSelection> => {
  const todayKey = getTodayKey();
  try {
    const stored = await AsyncStorage.getItem(RUNE_OF_THE_DAY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StoredRuneOfTheDay;
      if (
        parsed?.date === todayKey &&
        typeof parsed.index === "number" &&
        parsed.index >= 0 &&
        parsed.index < runes.length
      ) {
        return {
          index: parsed.index,
          isReversed: parsed.isReversed === true,
          rune: runes[parsed.index],
        };
      }
    }
  } catch (error) {
    console.error("Error reading cached rune for widget:", error);
  }

  return pickRuneForDate(todayKey, salt);
};

/**
 * Handles widget lifecycle events: initial render, updates, clicks.
 *
 * - WIDGET_ADDED: Render the widget with today's rune
 * - WIDGET_UPDATE: Re-render with the current day's rune (called every 30 min)
 * - WIDGET_CLICK: Deep-link into the app's Today screen
 * - WIDGET_DELETED: No-op
 * - WIDGET_RESIZED: Re-render at new dimensions
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const variant = widgetVariants[widgetInfo.widgetName] ?? "full";

  // Load the per-install salt so the widget shows the same rune as the app.
  const salt = await getUserSalt();

  // Resolve the selection from the app's cache (preferred) or compute fresh.
  // Passing the resolved selection to RuneWidget guarantees parity — the
  // widget renders the exact same rune + reversal state as the app.
  const selection = await resolveWidgetSelection(salt);

  // Pass the widget dimensions so the component can scale fonts accordingly
  const renderWithSize = () =>
    props.renderWidget(
      <RuneWidget
        widgetWidth={widgetInfo.width}
        widgetHeight={widgetInfo.height}
        salt={salt}
        selection={selection}
        variant={variant}
      />,
    );

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
      renderWithSize();
      break;

    case "WIDGET_UPDATE":
      renderWithSize();
      break;

    case "WIDGET_RESIZED":
      renderWithSize();
      break;

    case "WIDGET_CLICK":
      // Deep-link to the app's Today tab
      try {
        await Linking.openURL("runeoftheday://");
      } catch (error) {
        console.error("Failed to open app from widget:", error);
      }
      break;

    case "WIDGET_DELETED":
      // Nothing to clean up — no persistent widget state
      break;

    default:
      break;
  }
}
