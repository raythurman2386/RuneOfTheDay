import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, SafeAreaView } from 'react-native';
import * as Font from 'expo-font';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import MainScreen from './screens/MainScreen';
import RuneListScreen from './screens/RuneListScreen';
import FlashcardScreen from './screens/FlashcardScreen';
import RuneIcon from './components/RuneIcon';
import { useColorTheme } from './hooks/useColorTheme';

const Tab = createBottomTabNavigator();

const App = () => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const theme = useColorTheme();

  useEffect(() => {
    const loadFont = async () => {
      await Font.loadAsync({
        ElderFuthark: require('../assets/fonts/rune.ttf'),
      });
      setFontLoaded(true);
    };
    loadFont();
  }, []);

  if (!fontLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: '#000' },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#888',
        }}
      >
        <Tab.Screen
          name="Today"
          component={MainScreen}
          options={{
            tabBarIcon: ({ color, size }) => <RuneIcon symbol="ᚠ" color={color} size={size} />, // Fehu
            tabBarLabel: 'Today',
          }}
        />
        <Tab.Screen
          name="Runes"
          component={RuneListScreen}
          options={{
            tabBarIcon: ({ color, size }) => <RuneIcon symbol="ᚱ" color={color} size={size} />, // Raidho
            tabBarLabel: 'Runes',
          }}
        />
        <Tab.Screen
          name="Learn"
          component={FlashcardScreen}
          options={{
            tabBarIcon: ({ color, size }) => <RuneIcon symbol="ᚴ" color={color} size={size} />, // Hló
            tabBarLabel: 'Learn',
          }}
        />
      </Tab.Navigator>
      </>
  );
};

export default App;