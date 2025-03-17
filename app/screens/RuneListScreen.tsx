import React from "react";
import { FlatList, Text, View, StyleSheet, Pressable } from "react-native";
import { runes } from "../data/runes";
import { useColorTheme } from "../hooks/useColorTheme";

interface Rune {
  symbol: string;
  name: string;
  meaning: string;
}

const RuneListScreen = () => {
  const theme = useColorTheme();
  const isDark = theme === "dark";

  const renderItem = ({ item }: { item: Rune }) => (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: isDark ? "#111" : "#f5f5f5",
          marginHorizontal: pressed ? 12 : 16,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.symbolContainer}>
          <Text style={[styles.symbol, { color: isDark ? "#fff" : "#000" }]}>
            {item.symbol}
          </Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: isDark ? "#fff" : "#000" }]}>
            {item.name}
          </Text>
          <Text
            style={[styles.meaning, { color: isDark ? "#999" : "#666" }]}
            numberOfLines={2}
          >
            {item.meaning}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <FlatList
      data={runes}
      keyExtractor={(item) => item.name}
      renderItem={renderItem}
      style={[styles.list, { backgroundColor: isDark ? "#000" : "#fff" }]}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  item: {
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  symbolContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  symbol: {
    fontFamily: "ElderFuthark",
    fontSize: 40,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  meaning: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default RuneListScreen;
