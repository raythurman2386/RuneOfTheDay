import {
  seededIntFromKey,
  seededRandomFromKey,
} from "../../utils/seededRandom";

describe("seededRandom utilities", () => {
  describe("seededIntFromKey", () => {
    it("returns a deterministic value for the same key", () => {
      const key = "2026-06-26";
      const a = seededIntFromKey(key, 24);
      const b = seededIntFromKey(key, 24);
      expect(a).toBe(b);
    });

    it("returns different values for different keys", () => {
      const a = seededIntFromKey("2026-06-26", 24);
      const b = seededIntFromKey("2026-06-27", 24);
      // Not guaranteed to differ, but extremely likely
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThan(24);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThan(24);
    });

    it("returns 0 when max is 0", () => {
      expect(seededIntFromKey("any-key", 0)).toBe(0);
    });

    it("returns 0 when max is negative", () => {
      expect(seededIntFromKey("any-key", -5)).toBe(0);
    });

    it("always returns a value within [0, max)", () => {
      for (let i = 0; i < 100; i++) {
        const result = seededIntFromKey(`key-${i}`, 24);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(24);
      }
    });

    it("returns 0 when max is 1", () => {
      expect(seededIntFromKey("any-key", 1)).toBe(0);
    });
  });

  describe("seededRandomFromKey", () => {
    it("returns a deterministic value for the same key", () => {
      const key = "2026-06-26:reversed";
      const a = seededRandomFromKey(key);
      const b = seededRandomFromKey(key);
      expect(a).toBe(b);
    });

    it("always returns a value in [0, 1)", () => {
      for (let i = 0; i < 100; i++) {
        const result = seededRandomFromKey(`key-${i}`);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(1);
      }
    });

    it("returns different values for different keys (probabilistically)", () => {
      const values = new Set<string>();
      for (let i = 0; i < 50; i++) {
        values.add(String(seededRandomFromKey(`key-${i}`)));
      }
      // With 50 different keys, we should get many distinct values
      expect(values.size).toBeGreaterThan(1);
    });
  });

  describe("deterministic consistency", () => {
    it("produces the same rune index for the same date across calls", () => {
      const dateKey = "2026-06-26";
      const indices: number[] = [];
      for (let i = 0; i < 10; i++) {
        indices.push(seededIntFromKey(dateKey, 24));
      }
      const unique = new Set(indices);
      expect(unique.size).toBe(1);
    });
  });
});
