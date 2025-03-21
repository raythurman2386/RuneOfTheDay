import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import useRuneOfTheDay from "../hooks/useRuneOfTheDay";
import useWidgetStorageService from "../services/WidgetStorageService";
import useColorTheme from "../hooks/useColorTheme";

export const RuneWidget = () => {
  const rune = useRuneOfTheDay();
  const { getRuneData } = useWidgetStorageService();
  const [widgetData, setWidgetData] = useState<any>(null);
  const { colors } = useColorTheme();

  useEffect(() => {
    const loadWidgetData = async () => {
      const data = await getRuneData();
      setWidgetData(data);
    };

    loadWidgetData();
  }, [rune]);

  if (!widgetData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading widget data...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Widget Preview</Text>
      <View style={styles.widgetPreview}>
        <Text style={styles.symbol}>{widgetData.symbol}</Text>
        <Text style={styles.name}>{widgetData.name}</Text>
        <Text style={styles.meaning}>{widgetData.primaryThemes}</Text>
        <Text style={styles.deity}>Deity: {widgetData.deity}</Text>
      </View>
      <Text style={[styles.note, { color: colors.icon }]}>
        This is how your widget will appear on your home screen
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  widgetPreview: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  symbol: {
    fontSize: 40,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  meaning: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 4,
    textAlign: "center",
  },
  deity: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  loadingText: {
    textAlign: "center",
    padding: 20,
  },
  note: {
    marginTop: 12,
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default RuneWidget;
