import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { Linking } from "react-native";
import { RuneWidget } from "./RuneWidget";

const nameToWidget = {
  // Both widget sizes use the same component — it adapts via widgetWidth
  Rune: RuneWidget,
  RuneWide: RuneWidget,
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
  const Widget =
    nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

  // Pass the widget width so the component can scale fonts accordingly
  const renderWithSize = () =>
    props.renderWidget(<Widget widgetWidth={widgetInfo.width} />);

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
