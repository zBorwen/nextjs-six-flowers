export const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
  }
};

export const HapticPatterns = {
  soft: 5,
  medium: 10,
  heavy: 20,
  success: [10, 30, 10], 
  error: [50, 10, 50, 10, 50],
  turnStart: [20, 50, 20]
};
