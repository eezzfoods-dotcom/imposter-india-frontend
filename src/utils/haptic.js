export function haptic(type = 'light') {
  if (!navigator.vibrate) return;
  const patterns = {
    light:   [10],
    medium:  [30],
    heavy:   [50],
    success: [10, 50, 10],
    error:   [100, 30, 100],
    vote:    [20, 40, 20],
    reveal:  [10, 30, 60, 30, 10],
    win:     [50, 30, 50, 30, 100],
  };
  navigator.vibrate(patterns[type] || [10]);
}
