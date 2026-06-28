/**
 * Parity regression tests: the app (useRuneOfTheDay) and the home-screen
 * widget (RuneWidget) must derive the *same* rune for the same date + salt.
 *
 * This is the single most valuable test for preventing the "widget and app
 * showed different runes" bug. Both surfaces now route through the shared
 * `pickRuneForDate`, so these tests guard against any future refactor that
 * re-introduces duplicated selection logic.
 */
import { render } from "@testing-library/react-native";
import React from "react";
import { RuneWidget } from "../../widgets/RuneWidget";
import {
  pickRuneForDate,
  displayNameForSelection,
  meaningTextForSelection,
} from "../../utils/runeSelection";
import { getLocalDateKey } from "../../utils/dateKey";

// Mock the widget primitives as simple RN components.
jest.mock("react-native-android-widget", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require("react-native");
  return {
    FlexWidget: ({ children, style, accessibilityLabel }: any) => (
      <View
        testID="flex-widget"
        style={style}
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </View>
    ),
    TextWidget: ({ text, style }: any) => (
      <Text testID="text-widget" style={style}>
        {text}
      </Text>
    ),
    IconWidget: ({ icon, style }: any) => (
      <Text testID="icon-widget" style={style}>
        {icon}
      </Text>
    ),
  };
});

const TEST_SALT = "abcdef0123456789";

describe("app ↔ widget rune parity", () => {
  it("widget renders the same rune the app would pick for today", () => {
    const todayKey = getLocalDateKey(new Date());
    const appSelection = pickRuneForDate(todayKey, TEST_SALT);

    const { getByText } = render(
      <RuneWidget salt={TEST_SALT} widgetWidth={320} widgetHeight={180} />,
    );

    expect(getByText(appSelection.rune.symbol)).toBeTruthy();
    expect(getByText(displayNameForSelection(appSelection))).toBeTruthy();
  });

  it("widget matches the app across a range of dates", () => {
    // Sample dates across a full year + edge dates to catch any day where
    // the duplicated logic could have diverged.
    const dates = [
      "2026-01-01",
      "2026-02-29", // leap day
      "2026-06-27",
      "2026-10-31",
      "2026-12-31",
      "2027-01-01",
    ];

    for (const dateKey of dates) {
      const appSelection = pickRuneForDate(dateKey, TEST_SALT);

      const { getByText, unmount } = render(
        <RuneWidget
          dateKey={dateKey}
          salt={TEST_SALT}
          widgetWidth={320}
          widgetHeight={180}
        />,
      );

      expect(getByText(appSelection.rune.symbol)).toBeTruthy();
      expect(getByText(displayNameForSelection(appSelection))).toBeTruthy();
      unmount();
    }
  });

  it("widget matches the app for multiple salts on the same date", () => {
    const dateKey = "2026-06-27";
    const salts = ["aaaaaaaaaaaaaaaa", "bbbbbbbbbbbbbbbb", TEST_SALT];

    for (const salt of salts) {
      const appSelection = pickRuneForDate(dateKey, salt);

      const { getByText, unmount } = render(
        <RuneWidget
          dateKey={dateKey}
          salt={salt}
          widgetWidth={320}
          widgetHeight={180}
        />,
      );

      expect(getByText(appSelection.rune.symbol)).toBeTruthy();
      expect(getByText(displayNameForSelection(appSelection))).toBeTruthy();
      unmount();
    }
  });

  it("widget renders the reversed meaning text when the app would", () => {
    // Find a date + salt combo that rolls reversed so we can assert the
    // meaning text matches the app's reversed meaning.
    let found: {
      dateKey: string;
      selection: ReturnType<typeof pickRuneForDate>;
    } | null = null;
    for (let day = 1; day <= 365 && !found; day++) {
      const dateKey = `2026-01-${String(day).padStart(2, "0")}`;
      const selection = pickRuneForDate(dateKey, TEST_SALT);
      if (selection.isReversed) {
        found = { dateKey, selection };
      }
    }

    if (!found) return; // no reversed roll in the range — skip

    const { getByText } = render(
      <RuneWidget
        dateKey={found.dateKey}
        salt={TEST_SALT}
        widgetWidth={320}
        widgetHeight={180}
      />,
    );

    const expectedMeaning = meaningTextForSelection(found.selection);
    // The widget truncates meaning to Math.round(widgetWidth * 0.42) chars.
    const maxLen = Math.round(320 * 0.42);
    const truncated =
      expectedMeaning.length > maxLen
        ? `${expectedMeaning.slice(0, maxLen - 3)}...`
        : expectedMeaning;
    expect(getByText(truncated)).toBeTruthy();
  });

  it("widget honours a pre-resolved selection (cache parity path)", () => {
    // Simulate the task handler passing the app's cached selection.
    const dateKey = "2026-06-27";
    const cached = pickRuneForDate(dateKey, TEST_SALT);

    const { getByText } = render(
      <RuneWidget selection={cached} widgetWidth={320} widgetHeight={180} />,
    );

    expect(getByText(cached.rune.symbol)).toBeTruthy();
    expect(getByText(displayNameForSelection(cached))).toBeTruthy();
  });
});

describe("widget reversed-icon rendering", () => {
  it("tints the symbol red when reversed", () => {
    // Find a date that rolls reversed.
    let found: {
      dateKey: string;
      selection: ReturnType<typeof pickRuneForDate>;
    } | null = null;
    for (let day = 1; day <= 365 && !found; day++) {
      const dateKey = `2026-01-${String(day).padStart(2, "0")}`;
      const selection = pickRuneForDate(dateKey, TEST_SALT);
      if (selection.isReversed) {
        found = { dateKey, selection };
      }
    }
    if (!found) return;

    const { getByText } = render(
      <RuneWidget
        dateKey={found.dateKey}
        salt={TEST_SALT}
        widgetWidth={320}
        widgetHeight={180}
      />,
    );

    const symbolEl = getByText(found.selection.rune.symbol);
    const style = symbolEl.props.style as any;
    expect(style.color).toBe("rgba(255, 90, 90, 0.9)");
  });

  it("keeps the gold symbol colour when upright", () => {
    // Find a date that does NOT roll reversed.
    let found: {
      dateKey: string;
      selection: ReturnType<typeof pickRuneForDate>;
    } | null = null;
    for (let day = 1; day <= 365 && !found; day++) {
      const dateKey = `2026-01-${String(day).padStart(2, "0")}`;
      const selection = pickRuneForDate(dateKey, TEST_SALT);
      if (!selection.isReversed) {
        found = { dateKey, selection };
      }
    }
    if (!found) return;

    const { getByText } = render(
      <RuneWidget
        dateKey={found.dateKey}
        salt={TEST_SALT}
        widgetWidth={320}
        widgetHeight={180}
      />,
    );

    const symbolEl = getByText(found.selection.rune.symbol);
    const style = symbolEl.props.style as any;
    expect(style.color).toBe("#D4A857");
  });
});
