import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import useHaptics from "../hooks/useHaptics";
import { View, Pressable, Text, StyleSheet } from "react-native";
import RuneIcon from "./RuneIcon";

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { lightFeedback } = useHaptics();

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          lightFeedback();

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const label =
          typeof options.tabBarLabel === "string"
            ? options.tabBarLabel
            : route.name;

        const color = isFocused
          ? (options.tabBarActiveTintColor ?? "#000")
          : (options.tabBarInactiveTintColor ?? "#666");

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tab}>
            {options.tabBarIcon?.({
              focused: isFocused,
              color,
              size: 24,
            })}
            <Text style={[styles.label, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
});
