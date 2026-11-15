/**
 * ASTROFORGE: Web Audio API Mission Control Sound Effects & Telemetry Synthesizer
 * Zero external audio files required - 100% procedurally synthesized in real time!
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.ambientGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(this.muted ? 0 : 0.05, this.ctx ? this.ctx.currentTime : 0);
    }
    return this.muted;
  }

  playBlip(freq = 880, duration = 0.08, type = 'sine') {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  playTelemetryPing() {
    this.playBlip(1250, 0.05, 'triangle');
  }

  playSuccessChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playBlip(freq, 0.18, 'sine');
      }, i * 90);
    });
  }

  playWarningKlaxon() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    for (let i = 0; i < 2; i++) {
      setTimeout(() => {
        this.playBlip(440, 0.12, 'sawtooth');
      }, i * 160);
    }
  }

  playLaunchRumble(duration = 2.5) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1; // White noise
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(320, this.ctx.currentTime + 1.0);
      filter.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch (e) {
      // Audio fallback
    }
  }

  playCountdownBeep(isFinal = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    this.playBlip(isFinal ? 1760 : 880, isFinal ? 0.28 : 0.09, 'sine');
  }

  playStagingSeparation() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      // 1. Pyrotechnic separation impulse / explosive bolt bang
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);

      // 2. High-pressure gas separation puff
      this.playLaunchRumble(0.45);
    } catch (e) {}
  }

  playFairingJettison() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      // Pneumatic pushers / clamshell separation whoosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.55);
    } catch (e) {}
  }

  playDeploymentServo() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      // Stepper motor / solar array drive mechanism whirr
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(660, this.ctx.currentTime + 0.8);
      osc.frequency.linearRampToValueAtTime(520, this.ctx.currentTime + 1.6);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.7);
    } catch (e) {}
  }

  startAmbientDrone() {
    if (this.muted || this.ambientGain) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(82.4, this.ctx.currentTime); // E

      this.ambientGain.gain.setValueAtTime(0.03, this.ctx.currentTime);

      osc1.connect(this.ambientGain);
      osc2.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
    } catch (e) {
      // Audio fallback
    }
  }
}

export const sound = new SoundEngine();
