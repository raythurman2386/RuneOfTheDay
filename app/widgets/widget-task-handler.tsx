import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { Linking } from "react-native";
import { RuneWidget } from "./RuneWidget";
import { getUserSalt } from "../utils/userSalt";

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

  // Pass the widget dimensions so the component can scale fonts accordingly
  const renderWithSize = () =>
    props.renderWidget(
      <RuneWidget
        widgetWidth={widgetInfo.width}
        widgetHeight={widgetInfo.height}
        salt={salt}
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
