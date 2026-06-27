import React from "react";
import { widgetTaskHandler } from "../../widgets/widget-task-handler";

// Mock the widget primitives
jest.mock("react-native-android-widget", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require("react-native");
  return {
    FlexWidget: ({ children }: any) => <View>{children}</View>,
    TextWidget: ({ text }: any) => <Text>{text}</Text>,
    IconWidget: ({ icon }: any) => <Text>{icon}</Text>,
  };
});

// Mock Linking separately — can't mock all of react-native
// because requireActual pulls in native TurboModules
const mockOpenURL = jest.fn(() => Promise.resolve());
jest.mock("react-native/Libraries/Linking/Linking", () => ({
  openURL: mockOpenURL,
  default: {
    openURL: mockOpenURL,
  },
}));

const mockRenderWidget = jest.fn();

const makeProps = (action: string, widgetName: string = "Rune") => ({
  widgetAction: action,
  widgetInfo: {
    widgetName,
    width: 180,
    height: 180,
  },
  renderWidget: mockRenderWidget,
});

describe("widgetTaskHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOpenURL.mockResolvedValue(undefined);
  });

  it("renders the widget on WIDGET_ADDED", async () => {
    await widgetTaskHandler(makeProps("WIDGET_ADDED") as any);
    expect(mockRenderWidget).toHaveBeenCalledTimes(1);
  });

  it("renders the widget on WIDGET_UPDATE", async () => {
    await widgetTaskHandler(makeProps("WIDGET_UPDATE") as any);
    expect(mockRenderWidget).toHaveBeenCalledTimes(1);
  });

  it("renders the widget on WIDGET_RESIZED", async () => {
    await widgetTaskHandler(makeProps("WIDGET_RESIZED") as any);
    expect(mockRenderWidget).toHaveBeenCalledTimes(1);
  });

  it("opens the app via deep link on WIDGET_CLICK", async () => {
    await widgetTaskHandler(makeProps("WIDGET_CLICK") as any);
    expect(mockOpenURL).toHaveBeenCalledWith("runeoftheday://");
  });

  it("does not render on WIDGET_DELETED", async () => {
    await widgetTaskHandler(makeProps("WIDGET_DELETED") as any);
    expect(mockRenderWidget).not.toHaveBeenCalled();
  });

  it("does not render on unknown action", async () => {
    await widgetTaskHandler(makeProps("UNKNOWN") as any);
    expect(mockRenderWidget).not.toHaveBeenCalled();
  });

  it("handles Linking.openURL rejection gracefully", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockOpenURL.mockRejectedValue(new Error("No handler"));

    await widgetTaskHandler(makeProps("WIDGET_CLICK") as any);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to open app from widget:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});
