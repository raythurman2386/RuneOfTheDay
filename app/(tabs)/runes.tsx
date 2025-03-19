import React from "react";
import {
  View,
  FlatList,
  Pressable,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { runes } from "../data/runes";
import { useColorTheme } from "../hooks/useColorTheme";
import useHaptics from "../hooks/useHaptics";
import { router } from "expo-router";
import { Animated } from "react-native";

interface Rune {
  name: string;
  symbol: string;
  pronunciation: string;
  meaning: {
    primaryThemes: string;
  };
  associations: {
    godsGoddesses?: string[];
  };
}

interface RuneItemProps {
  item: Rune;
  index: number;
  onPress: (name: string) => void;
  colors: any;
}

function RuneItem({ item, index, onPress, colors }: RuneItemProps) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, index]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      <Pressable
        style={({ pressed }) => [
          styles.runeItem,
          {
            backgroundColor: colors.surface,
            borderColor: colors.icon,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
        onPress={() => onPress(item.name)}
        accessibilityLabel={`View details for ${item.name} rune`}
        accessibilityRole="button"
      >
        <View style={styles.runeContent}>
          <Text style={[styles.symbol, { color: colors.text }]}>
            {item.symbol}
          </Text>
          <View style={styles.textContainer}>
            <Text style={[styles.name, { color: colors.text }]}>
              {item.name}
            </Text>
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
    </Animated.View>
  );
}

export default function RunesScreen() {
  const { colors } = useColorTheme();
  const { lightFeedback } = useHaptics();

  const handleRunePress = React.useCallback(
    (runeId: string) => {
      lightFeedback();
      router.push({
        pathname: "/rune/[id]",
        params: { id: runeId },
      });
    },
    [lightFeedback],
  );

  const renderItem = React.useCallback(
    ({ item, index }: { item: Rune; index: number }) => (
      <RuneItem
        item={item}
        index={index}
        onPress={handleRunePress}
        colors={colors}
      />
    ),
    [colors, handleRunePress],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={runes}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  runeItem: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  runeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  symbol: {
    fontFamily: "ElderFuthark",
    fontSize: 32,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  pronunciation: {
    fontSize: 14,
  },
  meaning: {
    fontSize: 14,
    marginBottom: 4,
  },
  deity: {
    fontSize: 12,
    opacity: 0.8,
  },
});
