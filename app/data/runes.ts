export interface Rune {
  symbol: string;
  name: string;
  pronunciation: string;
  letterSound: string;
  translation: string;
  meaning: {
    primaryThemes: string;
    additionalMeanings: string;
    reversed: string | null;
  };
  historicalContext: string;
  associations: {
    godsGoddesses: string[];
    plants?: string[];
    stones?: string[];
    rituals?: string[];
  };
  otherDetails: {
    keywords: string[];
    magicalUses: string[];
    astrologicalAssociations: string[];
    elements: string[];
    associatedColors: string[];
    miscCorrespondences: string[];
  };
}

import runesData from "./runes.json";
export const runes: Rune[] = runesData;
