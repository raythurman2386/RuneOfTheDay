import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserSalt, saltedKey } from "../../utils/userSalt";

const SALT_STORAGE_KEY = "userRuneSalt";

// The global jest.setup.js mocks AsyncStorage (with a default export). We
// configure those mock functions here.
const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

describe("userSalt", () => {
  beforeEach(() => {
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    mockGetItem.mockClear();
    mockSetItem.mockClear();
  });

  describe("getUserSalt", () => {
    it("creates and persists a new salt when none exists", async () => {
      mockGetItem.mockResolvedValue(null);

      const salt = await getUserSalt();

      expect(salt).toBeTruthy();
      expect(salt.length).toBe(16);
      expect(mockSetItem).toHaveBeenCalledWith(SALT_STORAGE_KEY, salt);
    });

    it("returns the existing salt without creating a new one", async () => {
      const existing = "deadbeefcafebabe";
      mockGetItem.mockResolvedValue(existing);

      const salt = await getUserSalt();

      expect(salt).toBe(existing);
      expect(mockSetItem).not.toHaveBeenCalled();
    });

    it("returns an empty string and logs when storage fails", async () => {
      mockGetItem.mockRejectedValue(new Error("disk full"));
      const errorSpy = jest.spyOn(console, "error").mockImplementation();

      const salt = await getUserSalt();

      expect(salt).toBe("");
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });

    it("generates different salts across calls when none is persisted", async () => {
      mockGetItem.mockResolvedValue(null);

      const salt1 = await getUserSalt();
      mockGetItem.mockResolvedValue(null);
      const salt2 = await getUserSalt();

      // Math.random makes collisions astronomically unlikely (16 hex chars).
      expect(salt1).not.toBe(salt2);
    });
  });

  describe("saltedKey", () => {
    it("combines the date key and salt with a colon", () => {
      expect(saltedKey("2026-06-27", "abc123")).toBe("2026-06-27:abc123");
    });

    it("returns the date key unchanged when salt is empty", () => {
      expect(saltedKey("2026-06-27", "")).toBe("2026-06-27");
    });

    it("returns the date key unchanged when salt is undefined", () => {
      expect(saltedKey("2026-06-27", undefined as unknown as string)).toBe(
        "2026-06-27",
      );
    });
  });
});
