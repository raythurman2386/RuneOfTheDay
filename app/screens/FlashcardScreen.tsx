import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import FlipCard from "react-native-flip-card";
import { runes } from "../data/runes";
import { useColorTheme } from "../hooks/useColorTheme";
import { MaterialIcons } from "@expo/vector-icons";

interface Rune {
  symbol: string;
  name: string;
  meaning: string;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.min(width - 48, 320);
const CARD_HEIGHT = CARD_WIDTH * 1.5;

const FlashcardScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const theme = useColorTheme();
  const isDark = theme === "dark";

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
    <View
      style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}
    >
      <View style={styles.header}>
        <Text style={[styles.progress, { color: isDark ? "#fff" : "#000" }]}>
          {progress}
        </Text>
        <Text style={[styles.hint, { color: isDark ? "#666" : "#999" }]}>
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
        >
          {/* Front: Rune Symbol */}
          <View
            style={[
              styles.card,
              { backgroundColor: isDark ? "#111" : "#f5f5f5" },
            ]}
          >
            <Text style={[styles.symbol, { color: isDark ? "#fff" : "#000" }]}>
              {currentRune.symbol}
            </Text>
          </View>

          {/* Back: Rune Name and Meaning */}
          <View
            style={[
              styles.card,
              { backgroundColor: isDark ? "#111" : "#f5f5f5" },
            ]}
          >
            <Text style={[styles.name, { color: isDark ? "#fff" : "#000" }]}>
              {currentRune.name}
            </Text>
            <Text style={[styles.meaning, { color: isDark ? "#999" : "#666" }]}>
              {currentRune.meaning}
            </Text>
          </View>
        </FlipCard>
      </Animated.View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: isDark ? "#222" : "#eee" }]}
          onPress={previousRune}
        >
          <MaterialIcons
            name="chevron-left"
            size={24}
            color={isDark ? "#fff" : "#000"}
          />
          <Text
            style={[styles.buttonText, { color: isDark ? "#fff" : "#000" }]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: isDark ? "#222" : "#eee" }]}
          onPress={nextRune}
        >
          <Text
            style={[styles.buttonText, { color: isDark ? "#fff" : "#000" }]}
          >
            Next
          </Text>
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={isDark ? "#fff" : "#000"}
          />
        </TouchableOpacity>
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
    textShadowColor: "rgba(128,128,128,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 8,
  },
  name: {
    fontSize: 32,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 24,
    textAlign: "center",
  },
  meaning: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 4,
  },
});

export default FlashcardScreen;
