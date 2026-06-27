import { render } from "@testing-library/react-native";
import React from "react";
import { RuneWidget } from "../../widgets/RuneWidget";
import { runes } from "../../data/runes";
import {
  seededIntFromKey,
  seededRandomFromKey,
} from "../../utils/seededRandom";
import { getTodayKey } from "../../utils/dateKey";
import { saltedKey } from "../../utils/userSalt";

const TEST_SALT = "abcdef0123456789";

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
    const salted = saltedKey(todayKey, TEST_SALT);
    const expectedIndex = seededIntFromKey(salted, runes.length);
    const expectedRune = runes[expectedIndex];

    // Mirror the widget's reversal logic so the expected name matches what's
    // actually rendered (the widget appends " (Reversed)" when reversed).
    const reversedRoll = seededRandomFromKey(`${salted}:reversed`);
    const hasReversedMeaning = Boolean(
      expectedRune?.meaning?.reversed &&
      typeof expectedRune.meaning.reversed === "string" &&
      expectedRune.meaning.reversed.trim() !== "",
    );
    const isReversed = hasReversedMeaning ? reversedRoll < 0.5 : false;
    const expectedName = isReversed
      ? `${expectedRune.name} (Reversed)`
      : expectedRune.name;

    const { getByText } = render(
      <RuneWidget salt={TEST_SALT} widgetWidth={320} widgetHeight={180} />,
    );

    expect(getByText(expectedRune.symbol)).toBeTruthy();
    expect(getByText(expectedName)).toBeTruthy();
  });

  it("renders with a custom dateKey", () => {
    const dateKey = "2026-01-01";
    const salted = saltedKey(dateKey, TEST_SALT);
    const expectedIndex = seededIntFromKey(salted, runes.length);
    const expectedRune = runes[expectedIndex];
    const reversedRoll = seededRandomFromKey(`${salted}:reversed`);
    const hasReversed = Boolean(
      expectedRune?.meaning?.reversed &&
      typeof expectedRune.meaning.reversed === "string" &&
      expectedRune.meaning.reversed.trim() !== "",
    );
    const isReversed = hasReversed && reversedRoll < 0.5;
    const expectedName = isReversed
      ? `${expectedRune.name} (Reversed)`
      : expectedRune.name;

    const { getByText } = render(
      <RuneWidget
        dateKey={dateKey}
        salt={TEST_SALT}
        widgetWidth={320}
        widgetHeight={180}
      />,
    );

    expect(getByText(expectedRune.symbol)).toBeTruthy();
    expect(getByText(expectedName)).toBeTruthy();
  });

  it("shows the primary themes meaning when not reversed", () => {
    const dateKey = "2026-01-01";
    const salted = saltedKey(dateKey, TEST_SALT);
    const expectedIndex = seededIntFromKey(salted, runes.length);
    const expectedRune = runes[expectedIndex];
    const reversedRoll = seededRandomFromKey(`${salted}:reversed`);
    const hasReversed = Boolean(
      expectedRune?.meaning?.reversed &&
      typeof expectedRune.meaning.reversed === "string" &&
      expectedRune.meaning.reversed.trim() !== "",
    );
    const expectReversed = hasReversed && reversedRoll < 0.5;

    const { getByText } = render(
      <RuneWidget
        dateKey={dateKey}
        salt={TEST_SALT}
        widgetWidth={320}
        widgetHeight={180}
      />,
    );

    if (!expectReversed) {
      // The widget truncates meaning based on widgetWidth: maxLen =
      // Math.round(widgetWidth * 0.42). With widgetWidth=320 that's 134.
      const meaning = expectedRune.meaning.primaryThemes;
      const maxLen = Math.round(320 * 0.42);
      const truncated =
        meaning.length > maxLen
          ? `${meaning.slice(0, maxLen - 3)}...`
          : meaning;
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
      const salted = saltedKey(dateKey, TEST_SALT);
      const index = seededIntFromKey(salted, runes.length);
      if (index === runeWithReversed) {
        const roll = seededRandomFromKey(`${salted}:reversed`);
        if (roll < 0.5) {
          foundReversedDate = dateKey;
          break;
        }
      }
    }

    if (foundReversedDate) {
      const { getByText } = render(
        <RuneWidget
          dateKey={foundReversedDate}
          salt={TEST_SALT}
          widgetWidth={320}
          widgetHeight={180}
        />,
      );
      const expectedRune = runes[runeWithReversed];
      expect(getByText(`${expectedRune.name} (Reversed)`)).toBeTruthy();
    }
  });

  it("truncates meaning text longer than the widget can fit", () => {
    // Find a rune with a long meaning
    const longMeaningRune = runes.find(
      (r) => r.meaning.primaryThemes.length > 80,
    );

    if (longMeaningRune) {
      // Use explicit dimensions so the truncation length is predictable.
      // maxMeaningLength = Math.round(widgetWidth * 0.42).
      const widgetWidth = 320;
      const widgetHeight = 180;
      const maxMeaningLength = Math.round(widgetWidth * 0.42);

      // Find a date that maps to this rune AND doesn't roll reversed, so the
      // long primary-themes text is what gets rendered and truncated.
      let dateKey: string | null = null;
      for (let day = 1; day <= 365; day++) {
        const key = `2025-01-${String(day).padStart(2, "0")}`;
        const salted = saltedKey(key, TEST_SALT);
        if (
          seededIntFromKey(salted, runes.length) ===
          runes.indexOf(longMeaningRune)
        ) {
          const hasReversed = Boolean(
            longMeaningRune.meaning.reversed &&
            longMeaningRune.meaning.reversed.trim() !== "",
          );
          const roll = seededRandomFromKey(`${salted}:reversed`);
          const isReversed = hasReversed && roll < 0.5;
          if (!isReversed) {
            dateKey = key;
            break;
          }
        }
      }

      if (dateKey) {
        const { getByText } = render(
          <RuneWidget
            dateKey={dateKey}
            salt={TEST_SALT}
            widgetWidth={widgetWidth}
            widgetHeight={widgetHeight}
          />,
        );
        const truncated = `${longMeaningRune.meaning.primaryThemes.slice(
          0,
          maxMeaningLength - 3,
        )}...`;
        expect(getByText(truncated)).toBeTruthy();
      }
    }
  });

  it("sets the accessibility label with the rune name", () => {
    const todayKey = getTodayKey();
    const salted = saltedKey(todayKey, TEST_SALT);
    const expectedIndex = seededIntFromKey(salted, runes.length);
    const expectedRune = runes[expectedIndex];

    const { getByLabelText } = render(
      <RuneWidget salt={TEST_SALT} widgetWidth={320} widgetHeight={180} />,
    );
    expect(getByLabelText(`Daily rune: ${expectedRune.name}`)).toBeTruthy();
  });

  it("produces a different rune for a different salt on the same date", () => {
    const dateKey = "2026-06-27";
    const saltA = "aaaaaaaaaaaaaaaa";
    const saltB = "bbbbbbbbbbbbbbbb";
    const indexA = seededIntFromKey(saltedKey(dateKey, saltA), runes.length);
    const indexB = seededIntFromKey(saltedKey(dateKey, saltB), runes.length);

    // Only meaningful if the two salts actually select different runes.
    if (indexA !== indexB) {
      const { getByLabelText } = render(
        <RuneWidget
          dateKey={dateKey}
          salt={saltA}
          widgetWidth={320}
          widgetHeight={180}
        />,
      );
      expect(getByLabelText(`Daily rune: ${runes[indexA].name}`)).toBeTruthy();

      const { getByLabelText: getByLabelText2 } = render(
        <RuneWidget
          dateKey={dateKey}
          salt={saltB}
          widgetWidth={320}
          widgetHeight={180}
        />,
      );
      expect(getByLabelText2(`Daily rune: ${runes[indexB].name}`)).toBeTruthy();
    }
  });

  it("compact variant renders the symbol and name but not the meaning", () => {
    const dateKey = "2026-01-01";
    const salted = saltedKey(dateKey, TEST_SALT);
    const expectedIndex = seededIntFromKey(salted, runes.length);
    const expectedRune = runes[expectedIndex];
    const reversedRoll = seededRandomFromKey(`${salted}:reversed`);
    const hasReversed = Boolean(
      expectedRune?.meaning?.reversed &&
      typeof expectedRune.meaning.reversed === "string" &&
      expectedRune.meaning.reversed.trim() !== "",
    );
    const isReversed = hasReversed && reversedRoll < 0.5;
    const expectedName = isReversed
      ? `${expectedRune.name} (Reversed)`
      : expectedRune.name;

    const { getByText, queryByText } = render(
      <RuneWidget
        dateKey={dateKey}
        salt={TEST_SALT}
        variant="compact"
        widgetWidth={140}
        widgetHeight={140}
      />,
    );

    expect(getByText(expectedRune.symbol)).toBeTruthy();
    expect(getByText(expectedName)).toBeTruthy();

    // The compact variant must not render the meaning text.
    const meaning = isReversed
      ? (expectedRune.meaning.reversed ?? "")
      : expectedRune.meaning.primaryThemes;
    if (meaning) {
      expect(queryByText(meaning)).toBeNull();
    }
  });

  it("compact variant scales fonts based on the widget dimensions", () => {
    const dateKey = "2026-01-01";
    const salted = saltedKey(dateKey, TEST_SALT);
    const expectedIndex = seededIntFromKey(salted, runes.length);
    const expectedRune = runes[expectedIndex];

    // A larger compact widget should produce a larger symbol font.
    const { getByText: getSmall } = render(
      <RuneWidget
        dateKey={dateKey}
        salt={TEST_SALT}
        variant="compact"
        widgetWidth={140}
        widgetHeight={140}
      />,
    );
    const smallSymbol = getSmall(expectedRune.symbol);
    const smallSymbolSize = (smallSymbol.props.style as any).fontSize;

    const { getByText: getLarge } = render(
      <RuneWidget
        dateKey={dateKey}
        salt={TEST_SALT}
        variant="compact"
        widgetWidth={300}
        widgetHeight={300}
      />,
    );
    const largeSymbol = getLarge(expectedRune.symbol);
    const largeSymbolSize = (largeSymbol.props.style as any).fontSize;

    expect(largeSymbolSize).toBeGreaterThan(smallSymbolSize);
  });

  it("wide variant renders the symbol and name but not the meaning", () => {
    const dateKey = "2026-01-01";
    const salted = saltedKey(dateKey, TEST_SALT);
    const expectedIndex = seededIntFromKey(salted, runes.length);
    const expectedRune = runes[expectedIndex];
    const reversedRoll = seededRandomFromKey(`${salted}:reversed`);
    const hasReversed = Boolean(
      expectedRune?.meaning?.reversed &&
      typeof expectedRune.meaning.reversed === "string" &&
      expectedRune.meaning.reversed.trim() !== "",
    );
    const isReversed = hasReversed && reversedRoll < 0.5;
    const expectedName = isReversed
      ? `${expectedRune.name} (Reversed)`
      : expectedRune.name;

    const { getByText, queryByText } = render(
      <RuneWidget
        dateKey={dateKey}
        salt={TEST_SALT}
        variant="wide"
        widgetWidth={320}
        widgetHeight={80}
      />,
    );

    expect(getByText(expectedRune.symbol)).toBeTruthy();
    expect(getByText(expectedName)).toBeTruthy();

    // The wide variant must not render the meaning text.
    const meaning = isReversed
      ? (expectedRune.meaning.reversed ?? "")
      : expectedRune.meaning.primaryThemes;
    if (meaning) {
      expect(queryByText(meaning)).toBeNull();
    }
  });

  it("full variant scales the symbol based on height, not width", () => {
    const dateKey = "2026-01-01";
    const salted = saltedKey(dateKey, TEST_SALT);
    const expectedIndex = seededIntFromKey(salted, runes.length);
    const expectedRune = runes[expectedIndex];

    // Same height, very different width — symbol size should be the same
    // because it's height-bounded. This prevents over-tall symbols on wide
    // widgets placed on large phones.
    const { getByText: getNarrow } = render(
      <RuneWidget
        dateKey={dateKey}
        salt={TEST_SALT}
        variant="full"
        widgetWidth={220}
        widgetHeight={180}
      />,
    );
    const narrowSymbol = getNarrow(expectedRune.symbol);
    const narrowSize = (narrowSymbol.props.style as any).fontSize;

    const { getByText: getWide } = render(
      <RuneWidget
        dateKey={dateKey}
        salt={TEST_SALT}
        variant="full"
        widgetWidth={400}
        widgetHeight={180}
      />,
    );
    const wideSymbol = getWide(expectedRune.symbol);
    const wideSize = (wideSymbol.props.style as any).fontSize;

    expect(wideSize).toBe(narrowSize);
  });
});
