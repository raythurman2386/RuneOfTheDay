const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  // `hash |= 0` can yield -2147483648 (INT_MIN), and Math.abs(INT_MIN)
  // overflows back to a negative value, which would produce a negative
  // index downstream. Use bitwise-unsigned to force a non-negative number.
  return hash >>> 0;
};

export const seededRandomFromKey = (key: string): number => {
  return (hashString(key) % 1_000_000) / 1_000_000;
};

export const seededIntFromKey = (key: string, max: number): number => {
  if (max <= 0) return 0;
  // `>>> 0` in hashString guarantees a non-negative dividend, so the modulo
  // is always in [0, max). Keep the defensive `((x % max) + max) % max` in
  // case a caller ever passes a negative hash directly.
  const h = hashString(key);
  return ((h % max) + max) % max;
};
