import React from 'react';
import { Text } from 'react-native';

interface RuneIconProps {
  symbol: string;
  color: string;
  size: number;
}

const RuneIcon = ({ symbol, color, size }: RuneIconProps) => {
  return <Text style={{ fontFamily: 'ElderFuthark', color, fontSize: size }}>{symbol}</Text>;
};

export default RuneIcon;