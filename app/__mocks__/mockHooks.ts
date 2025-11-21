import { Colors } from "../constants/Colors";

// Helper to safely use jest.fn() - returns jest.fn() in test environment, no-op otherwise
const mockFn = <T extends (...args: any[]) => any>(implementation?: T) =>
  typeof jest !== 'undefined'
    ? jest.fn(implementation)
    : (implementation || (() => { }));

export const mockColors = Colors.light;
export const mockColorTheme = {
  theme: "light" as const,
  colors: mockColors,
};

// Using a dummy function instead of jest.fn() to avoid runtime errors when not in test environment
const noop = () => { };

export const mockHaptics = {
  isSupported: true,
  lightFeedback: typeof jest !== 'undefined' ? jest.fn() : noop,
  mediumFeedback: typeof jest !== 'undefined' ? jest.fn() : noop,
  heavyFeedback: typeof jest !== 'undefined' ? jest.fn() : noop,
  successFeedback: typeof jest !== 'undefined' ? jest.fn() : noop,
  errorFeedback: typeof jest !== 'undefined' ? jest.fn() : noop,
};

export const mockRunesArray = [
  {
    symbol: "ᚠ",
    name: "Fehu",
    pronunciation: "fey-who",
    letterSound: "F",
    translation: "cattle, wealth, money",
    meaning: {
      primaryThemes: "Wealth, prosperity, abundance, reward.",
      additionalMeanings: "Symbolizes new beginnings.",
      reversed: "Loss of wealth or self-esteem.",
    },
    historicalContext:
      "For ancient Germanic peoples, cattle were a form of wealth.",
    associations: {
      godsGoddesses: ["Freyr", "Freya"],
    },
    otherDetails: {
      keywords: ["wealth", "prosperity", "abundance"],
      magicalUses: ["Increase wealth", "Strengthen psychic ability"],
      astrologicalAssociations: [],
      elements: ["Fire"],
      associatedColors: ["Gold", "Green"],
      miscCorrespondences: [],
    },
  },
  {
    symbol: "ᚢ",
    name: "Uruz",
    pronunciation: "oo-rooze",
    letterSound: "U",
    translation: "aurochs, wild ox",
    meaning: {
      primaryThemes: "Strength, vitality, primal power.",
      additionalMeanings: "Healing and recovery.",
      reversed: "Weakness, illness, loss of power.",
    },
    historicalContext: "The aurochs was a powerful wild ox, now extinct.",
    associations: {
      godsGoddesses: ["Thor"],
    },
    otherDetails: {
      keywords: ["strength", "health", "courage"],
      magicalUses: ["Healing", "Physical strength"],
      astrologicalAssociations: [],
      elements: ["Earth"],
      associatedColors: ["Red", "Brown"],
      miscCorrespondences: [],
    },
  },
];

export const mockRune = {
  symbol: "ᚠ",
  name: "Fehu",
  pronunciation: "fey-who",
  letterSound: "F",
  translation: "cattle, wealth, money",
  meaning: {
    primaryThemes: "Wealth, prosperity, abundance, reward.",
    additionalMeanings: "Symbolizes new beginnings.",
    reversed: "Loss of wealth or self-esteem.",
  },
  historicalContext:
    "For ancient Germanic peoples, cattle were a form of wealth.",
  associations: {
    godsGoddesses: ["Freyr", "Freya"],
  },
  otherDetails: {
    keywords: ["wealth", "prosperity", "abundance"],
    magicalUses: ["Increase wealth", "Strengthen psychic ability"],
    astrologicalAssociations: [],
    elements: ["Fire"],
    associatedColors: ["Gold", "Green"],
    miscCorrespondences: [],
  },
};

export const mockRuneOfTheDay = {
  rune: mockRune,
  isReversed: false,
};

export const mockSettings = {
  theme: "light",
  haptics: true,
  setTheme: typeof jest !== 'undefined' ? jest.fn() : noop,
  setHaptics: typeof jest !== 'undefined' ? jest.fn() : noop,
};

export const mockUseSettings = typeof jest !== 'undefined' ? jest.fn(() => mockSettings) : () => mockSettings;
