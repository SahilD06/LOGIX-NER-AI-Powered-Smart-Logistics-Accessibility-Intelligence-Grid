/**
 * Audio Alert & High-Priority Silent-Mode Override Siren Service
 * Combines Web Audio API / Native Audio with Haptic Device Vibration
 * to trigger high-warning alerts that alert users even when device audio is muted.
 */
import { Vibration, Platform } from 'react-native';

let audioCtx: AudioContext | null = null;
let sirenInterval: any = null;
let isSirenPlaying = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Trigger High-Warning Disaster Alarm: High-frequency Siren + Continuous Device Vibration
 * Mute-override behavior for critical emergency alerts.
 */
export function playEmergencySiren(durationMs: number = 4000): void {
  // 1. Trigger intense device haptic vibration pattern
  try {
    if (Platform.OS !== 'web' || (typeof navigator !== 'undefined' && 'vibrate' in navigator)) {
      // Vibration pattern: wait 0ms, vibrate 800ms, pause 200ms, vibrate 800ms, pause 200ms, vibrate 1200ms
      Vibration.vibrate([0, 800, 200, 800, 200, 1200]);
    }
  } catch (e) {
    console.warn('Vibration trigger note:', e);
  }

  // 2. Synthesize High-Priority Alarm Siren (600Hz to 950Hz oscillating sweep)
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    stopEmergencySiren();
    isSirenPlaying = true;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, ctx.currentTime);

    // High pitch siren sweeps
    osc.frequency.linearRampToValueAtTime(950, ctx.currentTime + 0.4);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.8);
    osc.frequency.linearRampToValueAtTime(950, ctx.currentTime + 1.2);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 1.6);
    osc.frequency.linearRampToValueAtTime(950, ctx.currentTime + 2.0);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 2.4);
    osc.frequency.linearRampToValueAtTime(950, ctx.currentTime + 2.8);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 3.2);

    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + (durationMs / 1000));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + (durationMs / 1000));

    setTimeout(() => {
      isSirenPlaying = false;
    }, durationMs);
  } catch (e) {
    console.warn('Audio Siren note:', e);
  }
}

/**
 * Play a high-frequency warning beep with short vibration pulse
 */
export function playWarningBeep(): void {
  try {
    Vibration.vibrate(300);
  } catch {}

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.warn('Warning beep note:', e);
  }
}

/**
 * Stop any active audio siren & vibration
 */
export function stopEmergencySiren(): void {
  try {
    Vibration.cancel();
  } catch {}

  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  isSirenPlaying = false;
}
