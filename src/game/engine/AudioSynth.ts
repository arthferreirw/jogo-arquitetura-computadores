/**
 * Procedural Web Audio Synth Engine
 * Generates dynamic, punchy game audio with zero external audio assets.
 */

class AudioSynth {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private miningOsc: OscillatorNode | null = null;
  private miningGain: GainNode | null = null;

  constructor() {
    // Read user mute preference from storage
    try {
      const saved = localStorage.getItem('aetheria_audio_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    } catch {
      this.isMuted = false;
    }
  }

  /**
   * Initializes AudioContext upon user gesture
   */
  public init(): void {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.35;
      this.masterGain.connect(this.ctx.destination);
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
    }
    try {
      localStorage.setItem('aetheria_audio_muted', String(this.isMuted));
    } catch {
      // Ignore storage restrictions
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Laser Blaster Shot
   */
  public playLaser(): void {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  /**
   * Player Thruster Dash
   */
  public playDash(): void {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.22);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  /**
   * Mineral Mining Laser Hum (Continuous loop control)
   */
  public setMiningSound(active: boolean): void {
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    if (active) {
      if (!this.miningOsc) {
        const t = this.ctx.currentTime;
        this.miningOsc = this.ctx.createOscillator();
        this.miningGain = this.ctx.createGain();

        this.miningOsc.type = 'sine';
        this.miningOsc.frequency.setValueAtTime(320, t);

        this.miningGain.gain.setValueAtTime(0.01, t);
        this.miningGain.gain.linearRampToValueAtTime(0.12, t + 0.05);

        this.miningOsc.connect(this.miningGain);
        this.miningGain.connect(this.masterGain);
        this.miningOsc.start(t);
      }
    } else {
      if (this.miningOsc && this.miningGain) {
        const t = this.ctx.currentTime;
        this.miningGain.gain.linearRampToValueAtTime(0.001, t + 0.05);
        const osc = this.miningOsc;
        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // Already stopped
          }
        }, 60);
        this.miningOsc = null;
        this.miningGain = null;
      }
    }
  }

  /**
   * Mineral Shard / Resource Collection Chime
   */
  public playCollect(type: 'aether' | 'titanium' | 'plasma'): void {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const freqs = {
      aether: [587.33, 880, 1174.66], // Bright D major crystal
      titanium: [440, 554.37, 659.25], // Solid chord
      plasma: [783.99, 987.77, 1318.51], // High energy sparkle
    };

    const notes = freqs[type] || freqs.aether;
    const note = notes[Math.floor(Math.random() * notes.length)];

    osc.frequency.setValueAtTime(note, t);
    osc.frequency.exponentialRampToValueAtTime(note * 1.5, t + 0.15);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  /**
   * Heavy Impact / Hitstop Thud
   */
  public playHit(): void {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  /**
   * Enemy Telegraph Warning Tone
   */
  public playTelegraphWarning(): void {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(740, t);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Enemy Explosion / Node Rupture
   */
  public playExplosion(): void {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Sub-bass punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 0.35);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  /**
   * Base Core Defensive Shockwave Pulse
   */
  public playCorePulse(): void {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.3);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.6);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.6);
  }

  /**
   * Base Upgrade / Milestone Fanfare
   */
  public playUpgrade(): void {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.25);
    });
  }
}

export const audioSynth = new AudioSynth();
