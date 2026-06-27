import "expo-router/entry";
import { Platform } from "react-native";
import { registerWidgetTaskHandler } from "react-native-android-widget";
import { widgetTaskHandler } from "./app/widgets/widget-task-handler";

// react-native-android-widget calls AppRegistry.registerHeadlessTask, which
// doesn't exist on web. Guard so the web build doesn't crash on load.
if (Platform.OS !== "web") {
  registerWidgetTaskHandler(widgetTaskHandler);
}
