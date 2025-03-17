import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { runes } from '../data/runes'; // Adjust path to your rune data

const RuneListScreen = () => {
  return (
    <FlatList
      data={runes}
      keyExtractor={(item) => item.name}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meaning}>{item.meaning}</Text>
        </View>
      )}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#000', // Dark background
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333', // Subtle divider
  },
  symbol: {
    fontFamily: 'ElderFuthark',
    fontSize: 40,
    color: '#fff',
  },
  name: {
    fontSize: 20,
    color: '#fff',
    marginTop: 5,
  },
  meaning: {
    fontSize: 16,
    color: '#ccc', // Light gray for contrast
    marginTop: 5,
  },
});

export default RuneListScreen;