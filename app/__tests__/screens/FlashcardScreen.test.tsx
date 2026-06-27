import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import FlashcardScreen from "../../screens/FlashcardScreen";
import { runes } from "../../data/runes";

jest.mock("../../hooks/useColorTheme", () => ({
  useColorTheme: () => ({
    theme: "light" as const,
    colors: {
      background: "#000000",
      surface: "#111111",
      text: "#ffffff",
      icon: "#888888",
      tint: "#FF231F7C",
      tabIconSelected: "#ffffff",
      tabIconDefault: "#888888",
      reversedRune: "#FF0000",
    },
  }),
}));

jest.mock("../../hooks/useHaptics", () => ({
  __esModule: true,
  default: () => ({
    lightFeedback: jest.fn(),
    mediumFeedback: jest.fn(),
    heavyFeedback: jest.fn(),
    successFeedback: jest.fn(),
    errorFeedback: jest.fn(),
  }),
}));

jest.mock("react-native-flip-card", () => {
  const MockFlipCard = ({ children }: { children: React.ReactNode }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const MockView = require("react-native").View;
    return <MockView testID="flip-card">{children}</MockView>;
  };
  MockFlipCard.displayName = "FlipCard";
  return MockFlipCard;
});

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const MockIcon = ({ name }: { name: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const MockText = require("react-native").Text;
    return <MockText>{name}</MockText>;
  };
  MockIcon.displayName = "MaterialIcons";
  return MockIcon;
});

describe("FlashcardScreen", () => {
  it("renders the flashcard screen container", () => {
    const { getByTestId } = render(<FlashcardScreen />);
    expect(getByTestId("flashcard-screen")).toBeTruthy();
  });

  it("shows progress text starting at 1 / 24", () => {
    const { getByTestId } = render(<FlashcardScreen />);
    expect(getByTestId("progress-text").props.children).toBe(
      `1 / ${runes.length}`,
    );
  });

  it("shows the flip hint text", () => {
    const { getByTestId } = render(<FlashcardScreen />);
    expect(getByTestId("flip-hint").props.children).toBe("Tap card to flip");
  });

  it("renders the first rune symbol on the card front", () => {
    const { getByTestId } = render(<FlashcardScreen />);
    expect(getByTestId("rune-symbol").props.children).toBe(runes[0].symbol);
  });

  it("renders the first rune name on the card front", () => {
    const { getByTestId } = render(<FlashcardScreen />);
    expect(getByTestId("rune-name").props.children).toBe(runes[0].name);
  });

  it("renders the first rune pronunciation on the card front", () => {
    const { getByTestId } = render(<FlashcardScreen />);
    expect(getByTestId("rune-pronunciation").props.children).toBe(
      runes[0].pronunciation,
    );
  });

  it("renders the rune name on the card back", () => {
    const { getByTestId } = render(<FlashcardScreen />);
    expect(getByTestId("rune-name-back").props.children).toBe(runes[0].name);
  });

  it("renders the meaning title on the card back", () => {
    const { getByTestId } = render(<FlashcardScreen />);
    expect(getByTestId("meaning-title").props.children).toBe("Meaning");
  });

  it("renders the primary themes as the meaning text", () => {
    const { getByTestId } = render(<FlashcardScreen />);
    expect(getByTestId("rune-meaning").props.children).toBe(
      runes[0].meaning.primaryThemes,
    );
  });

  it("renders the translation title and text on the card back", () => {
    const { getByTestId } = render(<FlashcardScreen />);
    expect(getByTestId("translation-title").props.children).toBe("Translation");
    expect(getByTestId("rune-translation").props.children).toBe(
      runes[0].translation,
    );
  });

  it("renders associated deities when present", () => {
    const { getByTestId } = render(<FlashcardScreen />);
    expect(getByTestId("associated-deities-title").props.children).toBe(
      "Associated Deities",
    );
    expect(getByTestId("associated-deities").props.children).toBe(
      runes[0].associations.godsGoddesses?.join(", "),
    );
  });

  it("renders Previous and Next buttons", () => {
    const { getByTestId } = render(<FlashcardScreen />);
    expect(getByTestId("prev-button")).toBeTruthy();
    expect(getByTestId("next-button")).toBeTruthy();
    expect(getByTestId("prev-button-text").props.children).toBe("Previous");
    expect(getByTestId("next-button-text").props.children).toBe("Next");
  });

  it("renders the flip card component", () => {
    const { getByTestId } = render(<FlashcardScreen />);
    expect(getByTestId("flip-card")).toBeTruthy();
  });

  it("advances to the next rune when Next is pressed", async () => {
    jest.useFakeTimers();
    const { getByTestId } = render(<FlashcardScreen />);

    // Initially shows rune 0
    expect(getByTestId("rune-name").props.children).toBe(runes[0].name);

    await act(async () => {
      fireEvent.press(getByTestId("next-button"));
      jest.advanceTimersByTime(200);
    });

    expect(getByTestId("rune-name").props.children).toBe(runes[1].name);
    jest.useRealTimers();
  });

  it("wraps around to the last rune when Previous is pressed from the first", async () => {
    jest.useFakeTimers();
    const { getByTestId } = render(<FlashcardScreen />);

    await act(async () => {
      fireEvent.press(getByTestId("prev-button"));
      jest.advanceTimersByTime(200);
    });

    expect(getByTestId("rune-name").props.children).toBe(
      runes[runes.length - 1].name,
    );
    jest.useRealTimers();
  });

  it("wraps around to the first rune when Next is pressed from the last", async () => {
    jest.useFakeTimers();
    const { getByTestId } = render(<FlashcardScreen />);

    // Advance to the last rune
    for (let i = 0; i < runes.length - 1; i++) {
      await act(async () => {
        fireEvent.press(getByTestId("next-button"));
        jest.advanceTimersByTime(200);
      });
    }

    expect(getByTestId("progress-text").props.children).toBe(
      `${runes.length} / ${runes.length}`,
    );

    // Press Next one more time — should wrap to rune 0
    await act(async () => {
      fireEvent.press(getByTestId("next-button"));
      jest.advanceTimersByTime(200);
    });

    expect(getByTestId("progress-text").props.children).toBe(
      `1 / ${runes.length}`,
    );
    jest.useRealTimers();
  });

  it("updates the progress counter when navigating", async () => {
    jest.useFakeTimers();
    const { getByTestId } = render(<FlashcardScreen />);

    expect(getByTestId("progress-text").props.children).toBe(
      `1 / ${runes.length}`,
    );

    await act(async () => {
      fireEvent.press(getByTestId("next-button"));
      jest.advanceTimersByTime(200);
    });

    expect(getByTestId("progress-text").props.children).toBe(
      `2 / ${runes.length}`,
    );
    jest.useRealTimers();
  });
});
