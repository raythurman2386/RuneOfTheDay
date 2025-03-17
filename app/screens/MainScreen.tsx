import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { useRuneOfTheDay } from "../hooks/useRuneOfTheDay";
import { useColorTheme } from "../hooks/useColorTheme";

const MainScreen = () => {
  const rune = useRuneOfTheDay();
  const { colors } = useColorTheme();
  const { height } = useWindowDimensions();

  if (!rune) {
    return (
      <View
        testID="main-container"
        style={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.loading, { color: colors.text }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View
      testID="main-container"
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Rune of the Day
        </Text>
      </View>

      <View style={[styles.runeContainer, { height: height * 0.5 }]}>
        <Text style={[styles.symbol, { color: colors.text }]}>
          {rune.symbol}
        </Text>
        <Text style={[styles.name, { color: colors.text }]}>
          {rune.name}
        </Text>
      </View>

      <View style={styles.meaningContainer}>
        <Text style={[styles.meaning, { color: colors.icon }]}>
          {rune.meaning}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  meaningContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  loading: {
    fontSize: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  symbol: {
    fontFamily: "ElderFuthark",
    fontSize: 120,
    marginBottom: 20,
  },
  name: {
    fontSize: 36,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  meaning: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: "center",
  },
});

export default MainScreen;
