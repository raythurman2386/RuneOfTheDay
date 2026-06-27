import {
  getLocalDateKey,
  getTodayKey,
  isSameLocalDay,
} from "../../utils/dateKey";

describe("dateKey utilities", () => {
  describe("getLocalDateKey", () => {
    it("formats a date correctly with zero-padded month and day", () => {
      const date = new Date(2026, 0, 5); // Jan 5
      expect(getLocalDateKey(date)).toBe("2026-01-05");
    });

    it("formats a date with double-digit month and day", () => {
      const date = new Date(2026, 11, 25); // Dec 25
      expect(getLocalDateKey(date)).toBe("2026-12-25");
    });

    it("handles January 1st correctly", () => {
      const date = new Date(2026, 0, 1);
      expect(getLocalDateKey(date)).toBe("2026-01-01");
    });

    it("handles December 31st correctly", () => {
      const date = new Date(2026, 11, 31);
      expect(getLocalDateKey(date)).toBe("2026-12-31");
    });

    it("handles February 29th on a leap year", () => {
      const date = new Date(2024, 1, 29);
      expect(getLocalDateKey(date)).toBe("2024-02-29");
    });
  });

  describe("getTodayKey", () => {
    it("returns a string in YYYY-MM-DD format", () => {
      const key = getTodayKey();
      expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("matches getLocalDateKey for the current date", () => {
      const now = new Date();
      expect(getTodayKey()).toBe(getLocalDateKey(now));
    });
  });

  describe("isSameLocalDay", () => {
    it("returns true for the same date", () => {
      const a = new Date(2026, 5, 26, 10, 0);
      const b = new Date(2026, 5, 26, 23, 59);
      expect(isSameLocalDay(a, b)).toBe(true);
    });

    it("returns false for different dates", () => {
      const a = new Date(2026, 5, 26, 0, 0);
      const b = new Date(2026, 5, 27, 0, 0);
      expect(isSameLocalDay(a, b)).toBe(false);
    });

    it("returns false for different months", () => {
      const a = new Date(2026, 5, 30);
      const b = new Date(2026, 6, 1);
      expect(isSameLocalDay(a, b)).toBe(false);
    });

    it("returns false for different years", () => {
      const a = new Date(2026, 11, 31);
      const b = new Date(2027, 0, 1);
      expect(isSameLocalDay(a, b)).toBe(false);
    });

    it("returns true for the exact same moment", () => {
      const a = new Date(2026, 5, 26, 12, 0);
      const b = new Date(2026, 5, 26, 12, 0);
      expect(isSameLocalDay(a, b)).toBe(true);
    });
  });
});
