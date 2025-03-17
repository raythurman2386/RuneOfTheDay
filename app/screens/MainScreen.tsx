import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRuneOfTheDay } from '../hooks/useRuneOfTheDay';

const MainScreen = () => {
  const rune = useRuneOfTheDay();

  if (!rune) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rune of the Day</Text>
      <Text style={styles.symbol}>{rune.symbol}</Text>
      <Text style={styles.name}>{rune.name}</Text>
      <Text style={styles.meaning}>{rune.meaning}</Text>
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
  loading: {
    fontSize: 18,
    color: '#fff',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  symbol: {
    fontFamily: 'ElderFuthark',
    fontSize: 100,
    color: '#fff',
    marginBottom: 20,
  },
  name: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 10,
  },
  meaning: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default MainScreen;