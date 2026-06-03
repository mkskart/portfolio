// Web Audio API sound effects — no external assets

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", gain = 0.2) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Silently fail if audio not supported
  }
}

export function playDealSound() {
  playTone(440, 0.08, "triangle", 0.15);
  setTimeout(() => playTone(550, 0.08, "triangle", 0.1), 60);
}

export function playFoldSound() {
  playTone(200, 0.2, "sawtooth", 0.08);
}

export function playChipSound() {
  playTone(800, 0.06, "triangle", 0.12);
  setTimeout(() => playTone(900, 0.06, "triangle", 0.1), 40);
}

export function playWinSound() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, "sine", 0.18), i * 120);
  });
}

export function playCheckSound() {
  playTone(600, 0.05, "square", 0.06);
}
