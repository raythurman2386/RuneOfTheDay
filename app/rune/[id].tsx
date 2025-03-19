import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
  Animated,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useColorTheme } from "../hooks/useColorTheme";
import { runes } from "../data/runes";

export default function RuneDetailsScreen() {
  // Get the rune ID from the URL params
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Find the rune by name
  const rune = runes.find(r => r.name === id);
  
  const { colors } = useColorTheme();
  const { width } = useWindowDimensions();
  const symbolSize = Math.min(width * 0.4, 180);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  
  useEffect(() => {
    // Start the fade-in animation when the component mounts
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!rune) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Rune not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: rune.name,
          headerTintColor: colors.text,
          headerStyle: {
            backgroundColor: colors.background,
          },
        }} 
      />
      <Animated.ScrollView
        style={[
          styles.container, 
          { 
            backgroundColor: colors.background,
            opacity: fadeAnim,
          }
        ]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={[styles.symbol, { color: colors.text, fontSize: symbolSize }]}>
            {rune.symbol}
          </Text>
          <View style={styles.nameContainer}>
            <Text style={[styles.name, { color: colors.text }]}>{rune.name}</Text>
            <Text style={[styles.pronunciation, { color: colors.icon }]}>
              {rune.pronunciation}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.icon }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Translation
          </Text>
          <Text style={[styles.sectionContent, { color: colors.icon }]}>
            {rune.translation}
          </Text>
          <Text style={[styles.letterSound, { color: colors.icon }]}>
            Letter Sound: {rune.letterSound}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.icon }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Primary Meaning
          </Text>
          <Text style={[styles.sectionContent, { color: colors.icon }]}>
            {rune.meaning.primaryThemes}
          </Text>
        </View>

        {rune.meaning.additionalMeanings && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.icon }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Additional Meanings
            </Text>
            <Text style={[styles.sectionContent, { color: colors.icon }]}>
              {rune.meaning.additionalMeanings}
            </Text>
          </View>
        )}

        {rune.meaning.reversed && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.icon }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Reversed Meaning
            </Text>
            <Text style={[styles.sectionContent, { color: colors.icon }]}>
              {rune.meaning.reversed}
            </Text>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.icon }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Historical Context
          </Text>
          <Text style={[styles.sectionContent, { color: colors.icon }]}>
            {rune.historicalContext}
          </Text>
        </View>

        {rune.associations.godsGoddesses && rune.associations.godsGoddesses.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.icon }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Associated Deities
            </Text>
            <Text style={[styles.sectionContent, { color: colors.icon }]}>
              {rune.associations.godsGoddesses.join(", ")}
            </Text>
          </View>
        )}

        {rune.otherDetails && (
          <>
            {rune.otherDetails.keywords && rune.otherDetails.keywords.length > 0 && (
              <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.icon }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Keywords
                </Text>
                <Text style={[styles.sectionContent, { color: colors.icon }]}>
                  {rune.otherDetails.keywords.join(", ")}
                </Text>
              </View>
            )}

            {rune.otherDetails.magicalUses && rune.otherDetails.magicalUses.length > 0 && (
              <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.icon }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Magical Uses
                </Text>
                <Text style={[styles.sectionContent, { color: colors.icon }]}>
                  {rune.otherDetails.magicalUses.join(", ")}
                </Text>
              </View>
            )}

            {rune.otherDetails.astrologicalAssociations && rune.otherDetails.astrologicalAssociations.length > 0 && (
              <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.icon }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Astrological Associations
                </Text>
                <Text style={[styles.sectionContent, { color: colors.icon }]}>
                  {rune.otherDetails.astrologicalAssociations.join(", ")}
                </Text>
              </View>
            )}

            {rune.otherDetails.elements && rune.otherDetails.elements.length > 0 && (
              <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.icon }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Elements
                </Text>
                <Text style={[styles.sectionContent, { color: colors.icon }]}>
                  {rune.otherDetails.elements.join(", ")}
                </Text>
              </View>
            )}

            {rune.otherDetails.associatedColors && rune.otherDetails.associatedColors.length > 0 && (
              <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.icon }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Associated Colors
                </Text>
                <Text style={[styles.sectionContent, { color: colors.icon }]}>
                  {rune.otherDetails.associatedColors.join(", ")}
                </Text>
              </View>
            )}

            {rune.otherDetails.miscCorrespondences && rune.otherDetails.miscCorrespondences.length > 0 && (
              <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.icon }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Other Correspondences
                </Text>
                <Text style={[styles.sectionContent, { color: colors.icon }]}>
                  {rune.otherDetails.miscCorrespondences.join(", ")}
                </Text>
              </View>
            )}
          </>
        )}
      </Animated.ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  nameContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  symbol: {
    fontFamily: "ElderFuthark",
  },
  name: {
    fontSize: 32,
    fontWeight: "700",
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
    padding: 16,
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
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  letterSound: {
    fontSize: 16,
    fontStyle: "italic",
  },
});
