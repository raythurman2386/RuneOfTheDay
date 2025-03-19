import React from "react";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import RuneListScreen from "../screens/RuneListScreen";
import RuneDetailsScreen from "../screens/RuneDetailsScreen";
import { useColorTheme } from "../hooks/useColorTheme";
import SettingsIcon from "./SettingsIcon";
import { Rune } from "../data/runes";
import { Platform } from "react-native";

export type RunesStackParamList = {
  RuneList: undefined;
  RuneDetails: { rune: Rune };
};

const Stack = createStackNavigator<RunesStackParamList>();

const RunesStackNavigator = () => {
  const { colors } = useColorTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        cardStyle: { backgroundColor: colors.background },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 300,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 300,
            },
          },
        },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        ...Platform.select({
          android: {
            cardOverlayEnabled: true,
          },
        }),
      }}
    >
      <Stack.Screen
        name="RuneList"
        component={RuneListScreen}
        options={{
          title: "Runes",
          headerRight: () => <SettingsIcon color={colors.text} />,
        }}
      />
      <Stack.Screen
        name="RuneDetails"
        component={RuneDetailsScreen}
        options={({ route }) => ({
          title: route.params.rune.name,
          headerBackTitleVisible: false,
        })}
      />
    </Stack.Navigator>
  );
};

export default RunesStackNavigator;
