import { render } from "@testing-library/react-native";
import React from "react";
import { RuneWidget } from "../../widgets/RuneWidget";
import { runes } from "../../data/runes";
import {
  seededIntFromKey,
  seededRandomFromKey,
} from "../../utils/seededRandom";
import { getTodayKey } from "../../utils/dateKey";

// Mock the widget primitives as simple RN components.
// require() inside the factory is the standard pattern for jest.mock
// when the mock needs access to RN components.
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

describe("RuneWidget", () => {
  it("renders the widget with today's rune", () => {
    const todayKey = getTodayKey();
    const expectedIndex = seededIntFromKey(todayKey, runes.length);
    const expectedRune = runes[expectedIndex];

    const { getByText } = render(<RuneWidget />);

    expect(getByText(expectedRune.symbol)).toBeTruthy();
    expect(getByText(expectedRune.name)).toBeTruthy();
  });

  it("renders with a custom dateKey", () => {
    const dateKey = "2026-01-01";
    const expectedIndex = seededIntFromKey(dateKey, runes.length);
    const expectedRune = runes[expectedIndex];

    const { getByText } = render(<RuneWidget dateKey={dateKey} />);

    expect(getByText(expectedRune.symbol)).toBeTruthy();
    expect(getByText(expectedRune.name)).toBeTruthy();
  });

  it("shows the primary themes meaning when not reversed", () => {
    const dateKey = "2026-01-01";
    const expectedIndex = seededIntFromKey(dateKey, runes.length);
    const expectedRune = runes[expectedIndex];
    const reversedRoll = seededRandomFromKey(`${dateKey}:reversed`);
    const hasReversed = Boolean(
      expectedRune?.meaning?.reversed &&
      typeof expectedRune.meaning.reversed === "string" &&
      expectedRune.meaning.reversed.trim() !== "",
    );
    const expectReversed = hasReversed && reversedRoll < 0.5;

    const { getByText } = render(<RuneWidget dateKey={dateKey} />);

    if (!expectReversed) {
      // The widget truncates meaning to 80 chars
      const meaning = expectedRune.meaning.primaryThemes;
      const truncated =
        meaning.length > 80 ? `${meaning.slice(0, 77)}...` : meaning;
      expect(getByText(truncated)).toBeTruthy();
    } else {
      expect(getByText(`${expectedRune.name} (Reversed)`)).toBeTruthy();
    }
  });

  it("appends (Reversed) to the name when the rune is reversed", () => {
    // Find a date where the rune has a reversed meaning and rolls reversed
    const runeWithReversed = runes.findIndex(
      (r) => r.meaning.reversed && r.meaning.reversed.trim() !== "",
    );
    expect(runeWithReversed).toBeGreaterThanOrEqual(0);

    // Try multiple dates to find one that rolls reversed for this rune
    let foundReversedDate: string | null = null;
    for (let day = 1; day <= 365; day++) {
      const dateKey = `2026-01-${String(day).padStart(2, "0")}`;
      const index = seededIntFromKey(dateKey, runes.length);
      if (index === runeWithReversed) {
        const roll = seededRandomFromKey(`${dateKey}:reversed`);
        if (roll < 0.5) {
          foundReversedDate = dateKey;
          break;
        }
      }
    }

    if (foundReversedDate) {
      const { getByText } = render(<RuneWidget dateKey={foundReversedDate} />);
      const expectedRune = runes[runeWithReversed];
      expect(getByText(`${expectedRune.name} (Reversed)`)).toBeTruthy();
    }
  });

  it("truncates meaning text longer than 80 characters", () => {
    // Find a rune with a long meaning
    const longMeaningRune = runes.find(
      (r) => r.meaning.primaryThemes.length > 80,
    );

    if (longMeaningRune) {
      // Find a date that maps to this rune
      let dateKey: string | null = null;
      for (let day = 1; day <= 365; day++) {
        const key = `2025-01-${String(day).padStart(2, "0")}`;
        if (
          seededIntFromKey(key, runes.length) === runes.indexOf(longMeaningRune)
        ) {
          dateKey = key;
          break;
        }
      }

      if (dateKey) {
        const { getByText } = render(<RuneWidget dateKey={dateKey} />);
        const truncated = `${longMeaningRune.meaning.primaryThemes.slice(0, 77)}...`;
        expect(getByText(truncated)).toBeTruthy();
      }
    }
  });

  it("sets the accessibility label with the rune name", () => {
    const todayKey = getTodayKey();
    const expectedIndex = seededIntFromKey(todayKey, runes.length);
    const expectedRune = runes[expectedIndex];

    const { getByLabelText } = render(<RuneWidget />);
    expect(getByLabelText(`Daily rune: ${expectedRune.name}`)).toBeTruthy();
  });
});
