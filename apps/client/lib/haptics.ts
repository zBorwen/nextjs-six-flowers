export const HapticPatterns = {
    turnStart: [50],
    draw: [20],
    discard: [30],
    error: [50, 50, 50],
    success: [50, 100, 50]
};

export function vibrate(pattern: number[]) {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(pattern);
    }
}
