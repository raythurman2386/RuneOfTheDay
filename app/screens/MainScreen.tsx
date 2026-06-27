import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  ScrollView,
  Platform,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useRuneOfTheDay from "../hooks/useRuneOfTheDay";
import { useColorTheme } from "../hooks/useColorTheme";
import useHaptics from "../hooks/useHaptics";
import { DURATION_ENTRANCE, easeOut } from "../constants/animations";

const MainScreen = () => {
  const { rune, isReversed } = useRuneOfTheDay();
  const { colors } = useColorTheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { successFeedback, mediumFeedback } = useHaptics();
  const successFeedbackRef = useRef(successFeedback);

  // Entrance animation — gentle fade + scale when the rune appears.
  const [runeOpacity] = useState(new Animated.Value(0));
  const [runeScale] = useState(new Animated.Value(0.85));

  useEffect(() => {
    successFeedbackRef.current = successFeedback;
  }, [successFeedback]);

  useEffect(() => {
    if (rune) {
      successFeedbackRef.current();
      // Animate the rune in — fade + gentle scale spring.
      Animated.parallel([
        Animated.timing(runeOpacity, {
          toValue: 1,
          duration: DURATION_ENTRANCE,
          easing: easeOut,
          useNativeDriver: true,
        }),
        Animated.spring(runeScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset when rune becomes null (e.g., day change)
      runeOpacity.setValue(0);
      runeScale.setValue(0.85);
    }
  }, [rune, runeOpacity, runeScale]);

  if (!rune) {
    return (
      <View
        testID="main-container"
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.loading, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      testID="main-container"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + 30 },
      ]}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.accent }]}>
          Rune of the Day
        </Text>
      </View>

      <Animated.View
        style={[
          styles.runeContainer,
          {
            minHeight: height * 0.3,
            opacity: runeOpacity,
            transform: [{ scale: runeScale }],
          },
        ]}
      >
        <Pressable onPress={() => mediumFeedback()}>
          <Text
            style={[
              styles.symbol,
              {
                color: isReversed ? colors.reversedRune : colors.accent,
                transform: isReversed ? [{ rotate: "180deg" }] : undefined,
              },
            ]}
          >
            {rune.symbol}
          </Text>
          <Text style={[styles.name, { color: colors.text }]}>{rune.name}</Text>
          <Text style={[styles.pronunciation, { color: colors.icon }]}>
            {rune.pronunciation}
          </Text>
        </Pressable>
      </Animated.View>

      <View style={styles.meaningContainer}>
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.accent }]}>
            {isReversed && rune.meaning.reversed
              ? "Reversed Meaning"
              : "Primary Meaning"}
          </Text>
          <Text style={[styles.meaning, { color: colors.icon }]}>
            {isReversed && rune.meaning.reversed
              ? rune.meaning.reversed
              : rune.meaning.primaryThemes}
          </Text>
        </View>

        {rune.associations.godsGoddesses &&
          rune.associations.godsGoddesses.length > 0 && (
            <View
              style={[
                styles.section,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.accent }]}>
                Associated Deities
              </Text>
              <Text style={[styles.deity, { color: colors.icon }]}>
                {rune.associations.godsGoddesses.join(", ")}
              </Text>
            </View>
          )}

        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.accent }]}>
            Translation
          </Text>
          <Text style={[styles.translation, { color: colors.icon }]}>
            {rune.translation}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
    paddingTop: 20,
  },
  runeContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  meaningContainer: {
    paddingHorizontal: 16,
  },
  loading: {
    fontSize: 18,
  },
  title: {
    fontWeight: "bold",
    fontSize: 28,
    textTransform: "uppercase",
    letterSpacing: 3,
  },
  symbol: {
    fontFamily: "ElderFuthark",
    fontSize: 120,
    marginBottom: 16,
    textShadowColor: "rgba(212, 168, 87, 0.25)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  name: {
    fontSize: 36,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
  },
  pronunciation: {
    fontSize: 18,
    fontStyle: "italic",
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  meaning: {
    fontSize: 18,
    lineHeight: 28,
  },
  deity: {
    fontSize: 18,
    lineHeight: 28,
  },
  translation: {
    fontSize: 18,
    lineHeight: 28,
    fontStyle: "italic",
  },
});

export default MainScreen;
