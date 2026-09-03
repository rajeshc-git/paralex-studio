/**
 * Universal Haptic Engine for Mobile Devices & Desktop Trackpads
 * Features:
 * - Native vibration API (Android / supported mobile devices)
 * - Micro-acoustic subtle haptic tick synthesis (iOS Safari / Mac / Windows / all browsers)
 */

class HapticEngine {
  constructor() {
    this.audioCtx = null;
    this.lastVibrateTime = 0;
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  /**
   * Crisp micro-tick feedback (fired on slider step crossing)
   */
  tick() {
    const now = performance.now();
    // Throttle slightly to prevent audio congestion (min 28ms between ticks)
    if (now - this.lastVibrateTime < 28) return;
    this.lastVibrateTime = now;

    // 1. Hardware Vibration Motor (Android & supported mobile hardware)
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(6);
      } catch (e) {}
    }

    // 2. Micro-Acoustic Haptic Click (iOS Safari & Desktop)
    try {
      this.initAudio();
      if (this.audioCtx && this.audioCtx.state === 'running') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        const t = this.audioCtx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.018);

        gain.gain.setValueAtTime(0.035, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(t);
        osc.stop(t + 0.02);
      }
    } catch (e) {}
  }

  /**
   * Stronger milestone pop (fired on boundaries: min, center 50%, max)
   */
  milestone() {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([10, 30, 10]);
      } catch (e) {}
    }
    this.tick();
  }
}

export const haptics = new HapticEngine();
