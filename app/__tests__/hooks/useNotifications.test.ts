import { renderHook, act } from "@testing-library/react-native";
import * as Notifications from "expo-notifications";
import useNotifications from "../../hooks/useNotifications";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("useNotifications", () => {
  beforeEach(() => {
    (Notifications.setNotificationHandler as jest.Mock).mockImplementation(
      () => undefined,
    );
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
      undefined,
    );
    (
      Notifications.cancelScheduledNotificationAsync as jest.Mock
    ).mockResolvedValue(undefined);
    (
      Notifications.cancelAllScheduledNotificationsAsync as jest.Mock
    ).mockResolvedValue(undefined);
    (
      Notifications.getAllScheduledNotificationsAsync as jest.Mock
    ).mockResolvedValue([]);
    (Notifications.setNotificationChannelAsync as jest.Mock).mockResolvedValue(
      undefined,
    );
    (
      Notifications.addNotificationReceivedListener as jest.Mock
    ).mockReturnValue({
      remove: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("initializes and requests permissions on mount", async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await flushPromises();
    });

    expect(Notifications.setNotificationHandler).toHaveBeenCalled();
    expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    expect(result.current).toHaveProperty("isEnabled");
    expect(result.current).toHaveProperty("requestPermissions");
    expect(result.current).toHaveProperty("scheduleNotification");
    expect(result.current).toHaveProperty("cancelNotification");
    expect(result.current).toHaveProperty("cancelAllNotifications");
  });

  it("isEnabled is true when permissions granted", async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await flushPromises();
    });

    expect(result.current.isEnabled).toBe(true);
  });

  it("isEnabled is false when permissions denied", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await flushPromises();
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("scheduleNotification returns false when permissions not granted", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await flushPromises();
    });

    let scheduleResult: boolean | undefined;
    await act(async () => {
      scheduleResult = await result.current.scheduleNotification(
        "Test Title",
        "Test Body",
        new Date(Date.now() + 3600000),
        "test-id",
        false,
      );
    });

    expect(scheduleResult).toBe(false);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("schedules a one-time notification even when repeatsDaily is requested", async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await flushPromises();
    });

    const triggerDate = new Date();
    triggerDate.setDate(triggerDate.getDate() + 1);
    triggerDate.setHours(6, 0, 0, 0);

    let scheduleResult: boolean | undefined;
    await act(async () => {
      scheduleResult = await result.current.scheduleNotification(
        "Daily Rune",
        "Fehu - Wealth",
        triggerDate,
        "rune-daily",
        true,
      );
    });

    expect(scheduleResult).toBe(true);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock
      .calls[0][0];
    expect(call.content.title).toBe("Daily Rune");
    expect(call.content.body).toBe("Fehu - Wealth");
    // Repeating DAILY triggers freeze content and fall behind; the robust
    // fix always uses a one-time TIME_INTERVAL trigger regardless of the
    // repeatsDaily flag.
    expect(call.trigger.type).toBe("timeInterval");
    expect(call.trigger.repeats).toBe(false);
    expect(call.identifier).toBe("rune-daily");
  });

  it("returns false for a daily notification whose fire date is in the past", async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await flushPromises();
    });

    const pastDate = new Date(Date.now() - 3600000);

    let scheduleResult: boolean | undefined;
    await act(async () => {
      scheduleResult = await result.current.scheduleNotification(
        "Daily Rune",
        "Fehu - Wealth",
        pastDate,
        "rune-daily-past",
        true,
      );
    });

    expect(scheduleResult).toBe(false);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("returns false for one-time notification in the past", async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await flushPromises();
    });

    const pastDate = new Date(Date.now() - 3600000);

    let scheduleResult: boolean | undefined;
    await act(async () => {
      scheduleResult = await result.current.scheduleNotification(
        "Past",
        "Body",
        pastDate,
        "past-id",
        false,
      );
    });

    expect(scheduleResult).toBe(false);
  });

  it("schedules a one-time notification in the future", async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await flushPromises();
    });

    const futureDate = new Date(Date.now() + 7200000);

    let scheduleResult: boolean | undefined;
    await act(async () => {
      scheduleResult = await result.current.scheduleNotification(
        "Future",
        "Body",
        futureDate,
        "future-id",
        false,
      );
    });

    expect(scheduleResult).toBe(true);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock
      .calls[0][0];
    expect(call.trigger.type).toBe("timeInterval");
    expect(call.trigger.repeats).toBe(false);
  });

  it("cancelNotification calls cancelScheduledNotificationAsync", async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      await result.current.cancelNotification("test-id");
    });

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      "test-id",
    );
  });

  it("cancelAllNotifications calls cancelAllScheduledNotificationsAsync", async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      await result.current.cancelAllNotifications();
    });

    expect(
      Notifications.cancelAllScheduledNotificationsAsync,
    ).toHaveBeenCalled();
  });

  it("requestPermissions returns true when granted", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "not-determined",
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await flushPromises();
    });

    let granted: boolean | undefined;
    await act(async () => {
      granted = await result.current.requestPermissions();
    });

    expect(granted).toBe(true);
  });

  it("requestPermissions returns false when denied", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "not-determined",
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await flushPromises();
    });

    let granted: boolean | undefined;
    await act(async () => {
      granted = await result.current.requestPermissions();
    });

    expect(granted).toBe(false);
  });
});
