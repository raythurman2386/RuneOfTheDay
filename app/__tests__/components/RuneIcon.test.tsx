import React from "react";
import { render } from "@testing-library/react-native";
import RuneIcon from "../../components/RuneIcon";

describe("RuneIcon", () => {
  it("renders correctly with the provided props", () => {
    const testProps = {
      symbol: "ᚠ", // Fehu rune symbol
      color: "#FF0000",
      size: 24,
    };

    const { getByText } = render(
      <RuneIcon
        symbol={testProps.symbol}
        color={testProps.color}
        size={testProps.size}
      />,
    );

    // Assert that the rune symbol is displayed with the correct text
    const runeElement = getByText(testProps.symbol);
    expect(runeElement).toBeTruthy();

    // Assert the correct style props are applied
    expect(runeElement.props.style).toEqual({
      fontFamily: "ElderFuthark",
      color: testProps.color,
      fontSize: testProps.size,
    });
  });

  it("changes appearance based on different props", () => {
    const newProps = {
      symbol: "ᚢ", // Uruz rune symbol
      color: "#0000FF",
      size: 32,
    };

    const { getByText } = render(
      <RuneIcon
        symbol={newProps.symbol}
        color={newProps.color}
        size={newProps.size}
      />,
    );

    const runeElement = getByText(newProps.symbol);
    expect(runeElement).toBeTruthy();
    expect(runeElement.props.style).toEqual({
      fontFamily: "ElderFuthark",
      color: newProps.color,
      fontSize: newProps.size,
    });
  });
});
