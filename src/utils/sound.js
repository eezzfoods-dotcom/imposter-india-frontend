// WebAudio-synthesized sound effects — no audio asset files needed.
// Persists mute preference to localStorage like theme.js does.

let ctx = null;

function ac() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function getSoundOn() {
  return localStorage.getItem('ii_sound') !== 'off';
}

export function toggleSound() {
  const next = getSoundOn() ? 'off' : 'on';
  localStorage.setItem('ii_sound', next);
  if (next === 'on') sound('click');
  return next === 'on';
}

// One enveloped oscillator note
function tone(c, { freq = 440, type = 'sine', at = 0, dur = 0.15, vol = 0.18, slideTo = 0 }) {
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export function sound(name) {
  if (!getSoundOn()) return;
  const c = ac();
  if (!c) return;
  try {
    switch (name) {
      case 'click':
        tone(c, { freq: 900, type: 'square', dur: 0.05, vol: 0.06 });
        break;
      case 'reveal': // crew role reveal — bright rising pair
        tone(c, { freq: 523, dur: 0.12, vol: 0.15 });
        tone(c, { freq: 784, at: 0.1, dur: 0.2, vol: 0.15 });
        break;
      case 'imposter': // ominous low slide
        tone(c, { freq: 220, type: 'sawtooth', dur: 0.5, vol: 0.12, slideTo: 110 });
        tone(c, { freq: 165, type: 'sine', at: 0.15, dur: 0.45, vol: 0.1, slideTo: 82 });
        break;
      case 'vote': // firm double thunk
        tone(c, { freq: 330, type: 'triangle', dur: 0.08, vol: 0.18 });
        tone(c, { freq: 262, type: 'triangle', at: 0.09, dur: 0.12, vol: 0.18 });
        break;
      case 'lock': // gavel
        tone(c, { freq: 180, type: 'square', dur: 0.1, vol: 0.16 });
        tone(c, { freq: 120, type: 'square', at: 0.11, dur: 0.16, vol: 0.16 });
        break;
      case 'win': // ascending major arpeggio
        [523, 659, 784, 1047].forEach((f, i) =>
          tone(c, { freq: f, type: 'triangle', at: i * 0.12, dur: i === 3 ? 0.4 : 0.14, vol: 0.16 }));
        break;
      case 'lose': // descending womp
        [392, 330, 262].forEach((f, i) =>
          tone(c, { freq: f, type: 'sawtooth', at: i * 0.16, dur: 0.18, vol: 0.1 }));
        tone(c, { freq: 196, type: 'sawtooth', at: 0.5, dur: 0.5, vol: 0.1, slideTo: 130 });
        break;
      case 'ding': // spinner stop / attention
        tone(c, { freq: 1319, type: 'triangle', dur: 0.3, vol: 0.14 });
        tone(c, { freq: 1760, at: 0.05, dur: 0.35, vol: 0.08 });
        break;
      case 'chat': // soft blip
        tone(c, { freq: 1175, type: 'sine', dur: 0.07, vol: 0.08 });
        break;
      default:
        tone(c, { freq: 660, dur: 0.08, vol: 0.08 });
    }
  } catch (e) { /* audio is best-effort */ }
}

// Spinner ticks that slow down like a real wheel; duration in ms
export function spinTicks(durationMs = 4000) {
  if (!getSoundOn()) return;
  const c = ac();
  if (!c) return;
  try {
    let at = 0;
    let gap = 0.05;
    while (at < durationMs / 1000) {
      tone(c, { freq: 1400, type: 'square', at, dur: 0.018, vol: 0.05 });
      gap *= 1.12;
      at += gap;
    }
  } catch (e) { /* best-effort */ }
}
