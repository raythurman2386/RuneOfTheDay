import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import FlipCard from 'react-native-flip-card';
import { runes } from '../data/runes'; // Adjust the path to your runes data

const FlashcardScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const nextRune = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % runes.length);
    setIsFlipped(false); // Reset flip state
  };

  const previousRune = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + runes.length) % runes.length);
    setIsFlipped(false); // Reset flip state
  };

  const currentRune = runes[currentIndex];

  return (
    <View style={styles.container}>
      <FlipCard
        flip={isFlipped}
        friction={6}
        perspective={1000}
        flipHorizontal={true}
        flipVertical={false}
        clickable={true}
        onFlipEnd={() => setIsFlipped(!isFlipped)}
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
        <Button title="Previous" onPress={previousRune} />
        <Button title="Next" onPress={nextRune} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  card: {
    width: 300,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
  },
  symbol: {
    fontFamily: 'ElderFuthark', // Use your custom rune font
    fontSize: 100,
    color: '#fff',
  },
  name: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 10,
  },
  meaning: {
    fontSize: 18,
    color: '#ccc',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginTop: 20,
  },
});

export default FlashcardScreen;