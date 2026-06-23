jest.mock("expo-notifications", () => {
  const mockSubscription = { remove: jest.fn() };
  return {
    requestPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: "granted" }),
    ),
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
    setNotificationHandler: jest.fn(),
    scheduleNotificationAsync: jest.fn(() => Promise.resolve()),
    cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
    cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
    getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
    setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
    addNotificationReceivedListener: jest.fn(() => mockSubscription),
    addNotificationResponseReceivedListener: jest.fn(() => mockSubscription),
    removeNotificationSubscription: jest.fn(),
    AndroidImportance: { HIGH: "high" },
    AndroidNotificationPriority: { HIGH: "high" },
    SchedulableTriggerInputTypes: {
      DAILY: "daily",
      TIME_INTERVAL: "timeInterval",
      CALENDAR: "calendar",
      DATE: "date",
    },
    __esModule: true,
  };
});

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  __esModule: true,
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
  NotificationFeedbackType: {
    Success: "success",
    Error: "error",
    Warning: "warning",
  },
  __esModule: true,
}));

jest.mock("react-native", () => {
  const reactNative = jest.requireActual("react-native");
  reactNative.NativeModules.StatusBarManager = { getHeight: jest.fn() };

  reactNative.Animated.NativeAnimatedHelper = {
    API: {},
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  };

  return reactNative;
});

jest.mock(
  "react-native/Libraries/Utilities/useColorScheme",
  () => ({
    __esModule: true,
    default: jest.fn(() => "light"),
  }),
  { virtual: true },
);

const originalError = console.error;
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};
