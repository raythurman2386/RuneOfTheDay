import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import FlipCard from 'react-native-flip-card';
import { runes } from '../data/runes';

interface Rune {
  symbol: string;
  name: string;
  meaning: string;
}

const FlashcardScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextRune = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % runes.length);
  };

  const previousRune = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + runes.length) % runes.length);
  };

  const currentRune: Rune = runes[currentIndex];
  const progress = `${currentIndex + 1} / ${runes.length}`;

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>{progress}</Text>
      <FlipCard
        key={currentIndex}
        friction={6}
        perspective={1000}
        flipHorizontal={true}
        flipVertical={false}
        clickable={true}
      >
        {/* Front: Rune Symbol */}
        <View style={styles.card}>
          <Text style={styles.symbol}>{currentRune.symbol}</Text>
        </View>
        {/* Back: Rune Name and Meaning */}
        <View style={styles.card}>
          <Text style={styles.name}>{currentRune.name}</Text>
          <Text style={styles.meaning}>{currentRune.meaning}</Text>
        </View>
      </FlipCard>
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={previousRune}
        >
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button} 
          onPress={nextRune}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 20,
  },
  progress: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    fontWeight: '500',
  },
  card: {
    width: 320,
    height: 480,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: {
        boxShadowColor: '#000',
        boxShadowOffset: { width: 0, height: 4 },
        boxShadowOpacity: 0.3,
        boxShadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  symbol: {
    fontFamily: 'ElderFuthark',
    fontSize: 120,
    color: '#fff',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  name: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  meaning: {
    fontSize: 18,
    color: '#e0e0e0',
    textAlign: 'center',
    lineHeight: 24,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 280,
    marginTop: 32,
  },
  button: {
    backgroundColor: '#3d3d3d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default FlashcardScreen;