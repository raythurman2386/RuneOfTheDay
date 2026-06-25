const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const seededRandomFromKey = (key: string): number => {
  return (hashString(key) % 1_000_000) / 1_000_000;
};

export const seededIntFromKey = (key: string, max: number): number => {
  if (max <= 0) return 0;
  return hashString(key) % max;
};
