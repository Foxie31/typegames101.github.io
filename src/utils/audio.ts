/**
 * Web Audio API procedural sound synthesizer.
 * Generates all sound effects directly in-browser with zero external audio assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public volume: number = 0.8;
  public scareVolume: number = 1.0;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public unlock() {
    this.initCtx();
  }

  public playKey(isCorrect: boolean) {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const now = ctx.currentTime;
      if (isCorrect) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.04);
        gain.gain.setValueAtTime(0.08 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.08);
        gain.gain.setValueAtTime(0.12 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Audio context error ignore
    }
  }

  public playWordDestroyed(isSpecial: boolean = false) {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;

      // Laser sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isSpecial ? 1200 : 880, now);
      osc.frequency.exponentialRampToValueAtTime(isSpecial ? 350 : 220, now + 0.18);

      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);

      // Spark noise burst
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isSpecial ? 3200 : 2000, now);
      filter.Q.setValueAtTime(3, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15 * this.volume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.13);
    } catch {
      // ignore
    }
  }

  public playDamage() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;

      // Low impact boom
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

      gain.gain.setValueAtTime(0.35 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);

      // Harsh friction noise
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.linearRampToValueAtTime(100, now + 0.25);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25 * this.volume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.26);
    } catch {
      // ignore
    }
  }

  public playLevelUp() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const freqs = [440, 554.37, 659.25, 880]; // A major chord
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.07);
        gain.gain.setValueAtTime(0.12 * this.volume, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.36);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Terrifying jumpscare acoustic shock:
   * Detuned discordant shrieking cluster + harsh screech white noise + massive 40Hz sub-bass shockwave
   */
  public playJumpScare() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const vol = this.volume * this.scareVolume;

      // 1. Sub-bass visceral punch
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(90, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.7);
      subGain.gain.setValueAtTime(0.6 * vol, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 1.3);

      // 2. Screaming dissonant multi-tone cluster (Horror tritone & detunes)
      const freqs = [920, 980, 1340, 1420, 2150, 2900];
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sawtooth';

        // Add rapid frequency modulation / vibrato for panic scream feel
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(35 + Math.random() * 20, now);
        lfoGain.gain.setValueAtTime(60, now);
        lfo.connect(osc.frequency);
        lfo.start(now);
        lfo.stop(now + 1.8);

        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq * 1.3, now + 0.2);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 1.6);

        oscGain.gain.setValueAtTime(0.22 * vol, now);
        oscGain.gain.linearRampToValueAtTime(0.28 * vol, now + 0.1);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.9);
      });

      // 3. Harsh distorted white noise roar
      const bufferSize = ctx.sampleRate * 1.6;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.linearRampToValueAtTime(1400, now + 0.8);
      filter.Q.setValueAtTime(1.8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35 * vol, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 1.6);
    } catch {
      // ignore
    }
  }

  /**
   * Heartbeat sound effect for aftershock
   */
  public playHeartbeat() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;

      // Lub-dub
      [0, 0.12].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 0 ? 68 : 52, now + offset);
        osc.frequency.exponentialRampToValueAtTime(35, now + offset + 0.16);

        gain.gain.setValueAtTime(0.3 * this.volume, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.2);
      });
    } catch {
      // ignore
    }
  }
}

export const sound = new SoundEngine();
