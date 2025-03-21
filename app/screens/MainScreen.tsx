import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  ScrollView,
} from "react-native";
import { useRuneOfTheDay } from "../hooks/useRuneOfTheDay";
import { useColorTheme } from "../hooks/useColorTheme";
import useHaptics from "../hooks/useHaptics";

const MainScreen = () => {
  const { rune, isReversed } = useRuneOfTheDay();
  const { colors } = useColorTheme();
  const { height } = useWindowDimensions();
  const { successFeedback, mediumFeedback } = useHaptics();

  useEffect(() => {
    if (rune) {
      successFeedback();
    }
  }, [rune]);

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
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Rune of the Day
        </Text>
      </View>

      <Pressable
        style={[styles.runeContainer, { minHeight: height * 0.3 }]}
        onPress={() => mediumFeedback()}
      >
        <Text
          style={[
            styles.symbol,
            { 
              color: isReversed ? colors.reversedRune : colors.text,
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

      <View style={styles.meaningContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {isReversed && rune.meaning.reversed ? "Reversed Meaning" : "Primary Meaning"}
        </Text>
        <Text style={[styles.meaning, { color: colors.icon }]}>
          {isReversed && rune.meaning.reversed ? rune.meaning.reversed : rune.meaning.primaryThemes}
        </Text>

        {rune.associations.godsGoddesses &&
          rune.associations.godsGoddesses.length > 0 && (
            <>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text, marginTop: 16 },
                ]}
              >
                Associated Deities
              </Text>
              <Text style={[styles.deity, { color: colors.icon }]}>
                {rune.associations.godsGoddesses.join(", ")}
              </Text>
            </>
          )}

        <Text
          style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}
        >
          Translation
        </Text>
        <Text style={[styles.translation, { color: colors.icon }]}>
          {rune.translation}
        </Text>
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
    paddingBottom: 30,
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
    flex: 1,
    paddingHorizontal: 30,
  },
  loading: {
    fontSize: 18,
  },
  title: {
    fontWeight: "bold",
    fontSize: 28,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  symbol: {
    fontFamily: "ElderFuthark",
    fontSize: 120,
    marginBottom: 16,
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
