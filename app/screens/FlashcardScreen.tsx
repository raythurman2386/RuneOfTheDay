import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FlipCard from "react-native-flip-card";
import { runes, Rune } from "../data/runes";
import { useColorTheme } from "../hooks/useColorTheme";
import useHaptics from "../hooks/useHaptics";
import { MaterialIcons } from "@expo/vector-icons";
import {
  DURATION_QUICK,
  DURATION_STANDARD,
  easeOut,
  easeInOut,
} from "../constants/animations";

const FlashcardScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const { colors } = useColorTheme();
  const { mediumFeedback, lightFeedback } = useHaptics();
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const cardWidth = useMemo(() => Math.min(width - 48, 320), [width]);
  const cardHeight = useMemo(() => cardWidth * 1.5, [cardWidth]);

  // Clean up pending transition timer on unmount to avoid setState after unmount.
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const animateTransition = (callback: () => void) => {
    // Snappy cross-fade: quick fade out, swap content, fade in + scale pop.
    Animated.sequence([
      // Fade out + slight shrink — fast so the user doesn't wait
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: DURATION_QUICK,
          easing: easeInOut,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.92,
          duration: DURATION_QUICK,
          easing: easeInOut,
          useNativeDriver: true,
        }),
      ]),
      // Fade in + spring back to full scale — the "pop"
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: DURATION_STANDARD,
          easing: easeOut,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    lightFeedback();
    // Swap content at the midpoint (after fade out completes)
    transitionTimerRef.current = setTimeout(callback, DURATION_QUICK);
  };

  const nextRune = () => {
    animateTransition(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % runes.length);
    });
  };

  const previousRune = () => {
    animateTransition(() => {
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + runes.length) % runes.length,
      );
    });
  };

  const currentRune: Rune = runes[currentIndex];
  const progress = `${currentIndex + 1} / ${runes.length}`;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: 24 + insets.top,
          paddingBottom: 24 + insets.bottom,
        },
      ]}
      testID="flashcard-screen"
    >
      <View style={styles.header}>
        <Text
          style={[styles.progress, { color: colors.text }]}
          testID="progress-text"
        >
          {progress}
        </Text>
        <Text style={[styles.hint, { color: colors.icon }]} testID="flip-hint">
          Tap card to flip
        </Text>
      </View>

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          flex: 1,
        }}
      >
        <FlipCard
          key={currentIndex}
          friction={8}
          perspective={2000}
          flipHorizontal={true}
          flipVertical={false}
          clickable={true}
          style={[styles.flipCard, { width: cardWidth, height: cardHeight }]}
          onFlipStart={() => mediumFeedback()}
        >
          {/* Front: Rune Symbol */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            testID="card-front"
          >
            <Text
              style={[
                styles.symbol,
                { color: colors.accent, fontSize: cardWidth * 0.4 },
              ]}
              testID="rune-symbol"
            >
              {currentRune.symbol}
            </Text>
            <Text
              style={[styles.name, { color: colors.text }]}
              testID="rune-name"
            >
              {currentRune.name}
            </Text>
            <Text
              style={[styles.pronunciation, { color: colors.icon }]}
              testID="rune-pronunciation"
            >
              {currentRune.pronunciation}
            </Text>
          </View>

          {/* Back: Rune Name and Meaning */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            testID="card-back"
          >
            <Text
              style={[styles.backTitle, { color: colors.accent }]}
              testID="rune-name-back"
            >
              {currentRune.name}
            </Text>

            <Text
              style={[styles.sectionTitle, { color: colors.text }]}
              testID="meaning-title"
            >
              Meaning
            </Text>
            <Text
              style={[styles.meaning, { color: colors.icon }]}
              testID="rune-meaning"
            >
              {currentRune.meaning.primaryThemes}
            </Text>

            {currentRune.associations.godsGoddesses &&
              currentRune.associations.godsGoddesses.length > 0 && (
                <>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: colors.text, marginTop: 12 },
                    ]}
                    testID="associated-deities-title"
                  >
                    Associated Deities
                  </Text>
                  <Text
                    style={[styles.deity, { color: colors.icon }]}
                    testID="associated-deities"
                  >
                    {currentRune.associations.godsGoddesses.join(", ")}
                  </Text>
                </>
              )}

            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, marginTop: 12 },
              ]}
              testID="translation-title"
            >
              Translation
            </Text>
            <Text
              style={[styles.translation, { color: colors.icon }]}
              testID="rune-translation"
            >
              {currentRune.translation}
            </Text>
          </View>
        </FlipCard>
      </Animated.View>

      <View style={styles.controls}>
        <Pressable
          style={[
            styles.button,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={previousRune}
          testID="prev-button"
        >
          <MaterialIcons name="chevron-left" size={24} color={colors.accent} />
          <Text
            style={[styles.buttonText, { color: colors.text }]}
            testID="prev-button-text"
          >
            Previous
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={nextRune}
          testID="next-button"
        >
          <Text
            style={[styles.buttonText, { color: colors.text }]}
            testID="next-button-text"
          >
            Next
          </Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.accent} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  progress: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    fontWeight: "500",
  },
  flipCard: {
    alignSelf: "center",
  },
  card: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  symbol: {
    fontFamily: "ElderFuthark",
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  pronunciation: {
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
  },
  backTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    width: "100%",
  },
  meaning: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  deity: {
    fontSize: 16,
    textAlign: "center",
  },
  translation: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginTop: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FlashcardScreen;
