import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import FlipCard from "react-native-flip-card";
import { runes, Rune } from "../data/runes";
import { useColorTheme } from "../hooks/useColorTheme";
import useHaptics from "../hooks/useHaptics";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.min(width - 48, 320);
const CARD_HEIGHT = CARD_WIDTH * 1.5;

const FlashcardScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const { colors } = useColorTheme();
  const { mediumFeedback, lightFeedback } = useHaptics();

  const animateTransition = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    lightFeedback();
    setTimeout(callback, 200);
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.progress, { color: colors.text }]}>
          {progress}
        </Text>
        <Text style={[styles.hint, { color: colors.icon }]}>
          Tap card to flip
        </Text>
      </View>

      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <FlipCard
          key={currentIndex}
          friction={8}
          perspective={2000}
          flipHorizontal={true}
          flipVertical={false}
          clickable={true}
          style={styles.flipCard}
          onFlipStart={() => mediumFeedback()}
        >
          {/* Front: Rune Symbol */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.icon },
            ]}
          >
            <Text style={[styles.symbol, { color: colors.text }]}>
              {currentRune.symbol}
            </Text>
            <Text style={[styles.name, { color: colors.text }]}>
              {currentRune.name}
            </Text>
            <Text style={[styles.pronunciation, { color: colors.icon }]}>
              {currentRune.pronunciation}
            </Text>
          </View>

          {/* Back: Rune Name and Meaning */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.icon },
            ]}
          >
            <Text style={[styles.backTitle, { color: colors.text }]}>
              {currentRune.name}
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Meaning
            </Text>
            <Text style={[styles.meaning, { color: colors.icon }]}>
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
                  >
                    Associated Deities
                  </Text>
                  <Text style={[styles.deity, { color: colors.icon }]}>
                    {currentRune.associations.godsGoddesses.join(", ")}
                  </Text>
                </>
              )}

            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, marginTop: 12 },
              ]}
            >
              Translation
            </Text>
            <Text style={[styles.translation, { color: colors.icon }]}>
              {currentRune.translation}
            </Text>
          </View>
        </FlipCard>
      </Animated.View>

      <View style={styles.controls}>
        <Pressable
          style={[
            styles.button,
            { backgroundColor: colors.surface, borderColor: colors.icon },
          ]}
          onPress={previousRune}
        >
          <MaterialIcons name="chevron-left" size={24} color={colors.text} />
          <Text style={[styles.buttonText, { color: colors.text }]}>
            Previous
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            { backgroundColor: colors.surface, borderColor: colors.icon },
          ]}
          onPress={nextRune}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Next</Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 24,
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
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
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
    fontSize: CARD_WIDTH * 0.4,
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
