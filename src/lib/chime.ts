let context: AudioContext | null = null;

/** Must run inside a user gesture (iOS), e.g. when the visualization starts. */
export function primeAudio(): void {
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
  } catch {
    context = null;
  }
}

/** A soft two-tone bell, generated (no audio files). */
export function playChime(): void {
  if (!context) return;
  const start = context.currentTime + 0.05;
  [660, 990].forEach((frequency, i) => {
    const oscillator = context!.createOscillator();
    const gain = context!.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.12 / (i + 1), start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 2.4);
    oscillator.connect(gain).connect(context!.destination);
    oscillator.start(start);
    oscillator.stop(start + 2.5);
  });
}

export function vibrate(): void {
  try {
    navigator.vibrate?.([90, 70, 90]);
  } catch {
    // Not supported (iOS) – the chime is enough.
  }
}
