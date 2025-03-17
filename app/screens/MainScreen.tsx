import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { useRuneOfTheDay } from "../hooks/useRuneOfTheDay";
import { useColorTheme } from "../hooks/useColorTheme";

const MainScreen = () => {
  const rune = useRuneOfTheDay();
  const theme = useColorTheme();
  const isDark = theme === "dark";
  const { height } = useWindowDimensions();

  if (!rune) {
    return (
      <View
        testID="main-container"
        style={[
          styles.container,
          { backgroundColor: isDark ? "#000" : "#fff" },
        ]}
      >
        <Text style={[styles.loading, { color: isDark ? "#fff" : "#000" }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View
      testID="main-container"
      style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
          Rune of the Day
        </Text>
      </View>

      <View style={[styles.runeContainer, { height: height * 0.5 }]}>
        <Text style={[styles.symbol, { color: isDark ? "#fff" : "#000" }]}>
          {rune.symbol}
        </Text>
        <Text style={[styles.name, { color: isDark ? "#fff" : "#000" }]}>
          {rune.name}
        </Text>
      </View>

      <View style={styles.meaningContainer}>
        <Text style={[styles.meaning, { color: isDark ? "#999" : "#666" }]}>
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
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: "center",
  },
  runeContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  meaningContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
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
