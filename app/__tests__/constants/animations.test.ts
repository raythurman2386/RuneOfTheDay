import { Animated } from "react-native";
import {
  DURATION_QUICK,
  DURATION_STANDARD,
  DURATION_ENTRANCE,
  STAGGER_DELAY_MS,
  easeOut,
  easeInOut,
  popSpring,
  gentleSpring,
  fadeInUp,
  fadeIn,
} from "../../constants/animations";

describe("animation constants", () => {
  describe("durations", () => {
    it("DURATION_QUICK is 150ms", () => {
      expect(DURATION_QUICK).toBe(150);
    });

    it("DURATION_STANDARD is 220ms", () => {
      expect(DURATION_STANDARD).toBe(220);
    });

    it("DURATION_ENTRANCE is 280ms", () => {
      expect(DURATION_ENTRANCE).toBe(280);
    });

    it("STAGGER_DELAY_MS is 35ms", () => {
      expect(STAGGER_DELAY_MS).toBe(35);
    });

    it("durations are ordered quick < standard < entrance", () => {
      expect(DURATION_QUICK).toBeLessThan(DURATION_STANDARD);
      expect(DURATION_STANDARD).toBeLessThan(DURATION_ENTRANCE);
    });
  });

  describe("easing", () => {
    it("easeOut is an easing function", () => {
      expect(easeOut).toBeDefined();
      // Easing functions are functions
      expect(typeof easeOut).toBe("function");
    });

    it("easeInOut is an easing function", () => {
      expect(easeInOut).toBeDefined();
      expect(typeof easeInOut).toBe("function");
    });
  });

  describe("spring configs", () => {
    it("popSpring has correct tension and friction", () => {
      expect(popSpring.tension).toBe(120);
      expect(popSpring.friction).toBe(8);
      expect(popSpring.useNativeDriver).toBe(true);
    });

    it("gentleSpring has correct tension and friction", () => {
      expect(gentleSpring.tension).toBe(50);
      expect(gentleSpring.friction).toBe(7);
      expect(gentleSpring.useNativeDriver).toBe(true);
    });

    it("gentleSpring is less stiff than popSpring", () => {
      expect(gentleSpring.tension).toBeLessThan(popSpring.tension);
    });
  });

  describe("fadeInUp preset", () => {
    it("returns a composite animation", () => {
      const opacity = new Animated.Value(0);
      const translateY = new Animated.Value(12);

      const anim = fadeInUp(opacity, translateY);

      expect(anim).toBeDefined();
      expect(anim.start).toBeDefined();
    });

    it("accepts custom duration and delay", () => {
      const opacity = new Animated.Value(0);
      const translateY = new Animated.Value(12);

      const anim = fadeInUp(opacity, translateY, 500, 100);

      expect(anim).toBeDefined();
    });

    it("uses default duration when not specified", () => {
      const opacity = new Animated.Value(0);
      const translateY = new Animated.Value(12);

      // Should not throw
      expect(() => fadeInUp(opacity, translateY)).not.toThrow();
    });
  });

  describe("fadeIn preset", () => {
    it("returns a timing animation", () => {
      const opacity = new Animated.Value(0);

      const anim = fadeIn(opacity);

      expect(anim).toBeDefined();
      expect(anim.start).toBeDefined();
    });

    it("accepts custom duration and delay", () => {
      const opacity = new Animated.Value(0);

      const anim = fadeIn(opacity, 500, 200);

      expect(anim).toBeDefined();
    });

    it("uses default duration when not specified", () => {
      const opacity = new Animated.Value(0);

      expect(() => fadeIn(opacity)).not.toThrow();
    });
  });
});
