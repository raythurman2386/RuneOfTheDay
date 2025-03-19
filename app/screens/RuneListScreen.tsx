import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
} from "react-native";
import { runes, Rune } from "../data/runes";
import { useColorTheme } from "../hooks/useColorTheme";
import useHaptics from "../hooks/useHaptics";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RunesStackParamList } from "../components/RunesStackNavigator";

type RuneListNavigationProp = StackNavigationProp<RunesStackParamList, "RuneList">;

const RuneListScreen = () => {
  const { colors } = useColorTheme();
  const { lightFeedback } = useHaptics();
  const navigation = useNavigation<RuneListNavigationProp>();

  const handleRunePress = (rune: Rune) => {
    lightFeedback();
    navigation.navigate("RuneDetails", { rune });
  };

  const renderItem = ({ item }: { item: Rune }) => (
    <Pressable
      style={[
        styles.runeItem,
        { backgroundColor: colors.surface, borderColor: colors.icon },
      ]}
      onPress={() => handleRunePress(item)}
      accessibilityLabel={`View details for ${item.name} rune`}
      accessibilityRole="button"
    >
      <View style={styles.runeContent}>
        <Text style={[styles.symbol, { color: colors.text }]}>
          {item.symbol}
        </Text>
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.pronunciation, { color: colors.icon }]}>
            {item.pronunciation}
          </Text>
          <Text
            style={[styles.meaning, { color: colors.icon }]}
            numberOfLines={2}
          >
            {item.meaning.primaryThemes}
          </Text>
          {item.associations.godsGoddesses &&
            item.associations.godsGoddesses.length > 0 && (
              <Text style={[styles.deity, { color: colors.icon }]}>
                Deities: {item.associations.godsGoddesses.join(", ")}
              </Text>
            )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={runes}
        renderItem={renderItem}
        keyExtractor={(item: Rune) => item.name}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  runeItem: {
    borderRadius: 12,
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
  runeContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  symbol: {
    fontFamily: "ElderFuthark",
    fontSize: 48,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  pronunciation: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 4,
  },
  meaning: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  deity: {
    fontSize: 14,
    fontStyle: "italic",
  },
});

export default RuneListScreen;
