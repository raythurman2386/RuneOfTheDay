import { runes, Rune } from "../data/runes";
import { seededIntFromKey, seededRandomFromKey } from "./seededRandom";
import { saltedKey } from "./userSalt";

/**
 * Result of selecting a rune for a given date + salt. Both the in-app hook
 * and the home-screen widget derive their rune from this single function so
 * they can never drift apart via duplicated logic.
 */
export interface RuneSelection {
  index: number;
  isReversed: boolean;
  rune: Rune;
}

/**
 * Deterministically pick a rune (and whether it's reversed) for a given
 * date key and per-install salt. This is the **single source of truth** —
 * the app hook, the notification scheduler, and the widget all call this.
 *
 * @param dateKey  `YYYY-MM-DD` local date key (see `getLocalDateKey`)
 * @param salt     per-install salt from `getUserSalt` (empty string = legacy
 *                 date-only behaviour, used as a graceful fallback)
 */
export const pickRuneForDate = (
  dateKey: string,
  salt: string = "",
): RuneSelection => {
  const key = saltedKey(dateKey, salt);
  const index = seededIntFromKey(key, runes.length);
  const rune = runes[index];

  const hasReversedMeaning = Boolean(
    rune?.meaning?.reversed &&
    typeof rune.meaning.reversed === "string" &&
    rune.meaning.reversed.trim() !== "",
  );
  const reversedRoll = seededRandomFromKey(`${key}:reversed`);
  const isReversed = hasReversedMeaning ? reversedRoll < 0.5 : false;

  return { index, isReversed, rune };
};

/**
 * Resolve the meaning text for a selection, honouring reversal. Shared so
 * the notification body, the widget, and the app screen all render the same
 * text for a given rune.
 */
export const meaningTextForSelection = (selection: RuneSelection): string => {
  const { rune, isReversed } = selection;
  return isReversed && rune.meaning.reversed
    ? rune.meaning.reversed
    : rune.meaning.primaryThemes;
};

/**
 * Display name for a selection, appending " (Reversed)" when reversed.
 */
export const displayNameForSelection = (selection: RuneSelection): string => {
  const { rune, isReversed } = selection;
  return isReversed ? `${rune.name} (Reversed)` : rune.name;
};
