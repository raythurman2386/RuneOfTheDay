import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Per-install salt that makes each user's daily rune unique. Without it the
 * rune is seeded purely by the calendar date, so every device on Earth gets
 * the same rune on the same day. Mixing this salt into the seed key gives each
 * install its own independent daily permutation while keeping selection
 * deterministic *for that install* (so the same rune shows in-app, in the
 * notification, and on the home-screen widget).
 */

const SALT_STORAGE_KEY = "userRuneSalt";

/**
 * Generate a random hex salt. Uses `Math.random` for broad compatibility —
 * this only runs once per install (the result is persisted), so the weaker
 * PRNG is acceptable. Returns a 16-character hex string.
 */
const generateSalt = (): string =>
  Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");

/**
 * Get the persisted per-install salt, creating and storing one on first call.
 * Returns an empty string if storage is unavailable so callers degrade
 * gracefully to the legacy date-only behaviour.
 */
export const getUserSalt = async (): Promise<string> => {
  try {
    const existing = await AsyncStorage.getItem(SALT_STORAGE_KEY);
    if (existing) {
      return existing;
    }
    const salt = generateSalt();
    await AsyncStorage.setItem(SALT_STORAGE_KEY, salt);
    return salt;
  } catch (error) {
    console.error("Error reading/creating user salt:", error);
    return "";
  }
};

/**
 * Combine a date key with a salt into a single seed key. Keeping this in one
 * place ensures the in-app hook, the notification scheduler, and the widget
 * all derive the same rune for a given install + day.
 */
export const saltedKey = (dateKey: string, salt: string): string =>
  salt ? `${dateKey}:${salt}` : dateKey;
