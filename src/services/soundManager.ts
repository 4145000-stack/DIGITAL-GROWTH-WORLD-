// Web Audio API Sound Manager for Agent Personalities, UI Interactions & World Mode Ambient Lo-Fi Synth Soundscape

export type AmbientChordName = 'Fmaj9' | 'Em7' | 'Dm9' | 'Cmaj9';

interface ChordSpec {
  name: AmbientChordName;
  root: number;
  notes: number[];
  melodyPool: number[];
}

const LOFI_CHORDS: ChordSpec[] = [
  {
    name: 'Fmaj9',
    root: 87.31, // F2
    notes: [174.61, 220.0, 261.63, 329.63, 392.0], // F3, A3, C4, E4, G4
    melodyPool: [523.25, 587.33, 659.25, 783.99, 880.0], // C5, D5, E5, G5, A5
  },
  {
    name: 'Em7',
    root: 82.41, // E2
    notes: [164.81, 196.0, 246.94, 293.66, 392.0], // E3, G3, B3, D4, G4
    melodyPool: [493.88, 587.33, 659.25, 783.99, 987.77], // B4, D5, E5, G5, B5
  },
  {
    name: 'Dm9',
    root: 73.42, // D2
    notes: [146.83, 174.61, 220.0, 261.63, 329.63], // D3, F3, A3, C4, E4
    melodyPool: [440.0, 523.25, 587.33, 659.25, 880.0], // A4, C5, D5, E5, A5
  },
  {
    name: 'Cmaj9',
    root: 65.41, // C2
    notes: [130.81, 164.81, 196.0, 246.94, 293.66], // C3, E3, G3, B3, D4
    melodyPool: [392.0, 493.88, 523.25, 587.33, 659.25], // G4, B4, C5, D5, E5
  },
];

class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private ambientEnabled: boolean = true;
  private ambientVolume: number = 0.35;
  private inWorldMode: boolean = false;
  private isAmbientPlaying: boolean = false;

  // Ambient Web Audio nodes
  private masterAmbientGain: GainNode | null = null;
  private vinylSource: AudioBufferSourceNode | null = null;
  private vinylGain: GainNode | null = null;
  private chordTimer: number | null = null;
  privatechordIndex: number = 0;
  private listeners: Set<() => void> = new Set();
  private unlockBound: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.unlockBound = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        if (this.inWorldMode && this.ambientEnabled && !this.muted && !this.isAmbientPlaying) {
          this.startAmbientLoop();
        }
      };
      window.addEventListener('pointerdown', this.unlockBound, { passive: true });
      window.addEventListener('keydown', this.unlockBound, { passive: true });
    }
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Will resume on next user gesture
      });
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    this.syncAmbientState();
    this.notify();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setAmbientEnabled(enabled: boolean) {
    this.ambientEnabled = enabled;
    this.syncAmbientState();
    this.notify();
  }

  public isAmbientEnabled(): boolean {
    return this.ambientEnabled;
  }

  public setAmbientVolume(volume: number) {
    this.ambientVolume = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.masterAmbientGain && this.isAmbientPlaying) {
      const now = this.ctx.currentTime;
      const targetGain = this.muted || !this.ambientEnabled || !this.inWorldMode
        ? 0.0001
        : Math.max(0.001, this.ambientVolume * 0.28);
      this.masterAmbientGain.gain.cancelScheduledValues(now);
      this.masterAmbientGain.gain.setTargetAtTime(targetGain, now, 0.25);
    }
    this.notify();
  }

  public getAmbientVolume(): number {
    return this.ambientVolume;
  }

  public setWorldMode(isWorld: boolean) {
    if (this.inWorldMode === isWorld) return;
    this.inWorldMode = isWorld;
    this.syncAmbientState();
    this.notify();
  }

  public isWorldModeActive(): boolean {
    return this.inWorldMode;
  }

  public isAmbientActive(): boolean {
    return this.inWorldMode && this.ambientEnabled && !this.muted && this.isAmbientPlaying;
  }

  public getCurrentChordName(): AmbientChordName {
    return LOFI_CHORDS[this.privatechordIndex % LOFI_CHORDS.length].name;
  }

  private syncAmbientState() {
    const shouldPlay = this.inWorldMode && this.ambientEnabled && !this.muted;
    if (shouldPlay) {
      this.startAmbientLoop();
    } else {
      this.stopAmbientLoop();
    }
  }

  private createVinylCrackleBuffer(ctx: AudioContext): AudioBuffer {
    const durationSeconds = 4;
    const sampleRate = ctx.sampleRate;
    const frameCount = sampleRate * durationSeconds;
    const buffer = ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < frameCount; i++) {
      // Warm brown/pink noise base
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 0.35;

      // Occasional subtle vinyl dust pop
      if (Math.random() < 0.00045) {
        data[i] += (Math.random() * 0.45 - 0.22);
      }
    }
    return buffer;
  }

  private startAmbientLoop() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const targetMaster = Math.max(0.001, this.ambientVolume * 0.28);

    if (!this.masterAmbientGain) {
      this.masterAmbientGain = this.ctx.createGain();
      this.masterAmbientGain.gain.setValueAtTime(0.0001, now);
      this.masterAmbientGain.connect(this.ctx.destination);
    }

    // Smooth fade-in to World mode soundscape
    this.masterAmbientGain.gain.cancelScheduledValues(now);
    this.masterAmbientGain.gain.setValueAtTime(
      Math.max(0.0001, this.masterAmbientGain.gain.value),
      now
    );
    this.masterAmbientGain.gain.linearRampToValueAtTime(targetMaster, now + 1.4);

    if (this.isAmbientPlaying) {
      return;
    }

    this.isAmbientPlaying = true;

    // Start warm vinyl/room air bed
    try {
      const crackleBuffer = this.createVinylCrackleBuffer(this.ctx);
      this.vinylSource = this.ctx.createBufferSource();
      this.vinylSource.buffer = crackleBuffer;
      this.vinylSource.loop = true;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1100, now);
      bandpass.Q.setValueAtTime(0.7, now);

      this.vinylGain = this.ctx.createGain();
      this.vinylGain.gain.setValueAtTime(0.045, now);

      this.vinylSource.connect(bandpass);
      bandpass.connect(this.vinylGain);
      this.vinylGain.connect(this.masterAmbientGain);
      this.vinylSource.start(now);
    } catch {
      // Ignore if buffer creation fails
    }

    // Play first lo-fi chord immediately and schedule loop
    this.triggerLoFiChordCycle();
    if (this.chordTimer !== null) {
      window.clearInterval(this.chordTimer);
    }
    this.chordTimer = window.setInterval(() => {
      if (!this.inWorldMode || !this.ambientEnabled || this.muted) {
        this.stopAmbientLoop();
        return;
      }
      this.triggerLoFiChordCycle();
    }, 4500);
  }

  private triggerLoFiChordCycle() {
    if (!this.ctx || !this.masterAmbientGain || !this.isAmbientPlaying) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const chord = LOFI_CHORDS[this.privatechordIndex % LOFI_CHORDS.length];
    this.privatechordIndex = (this.privatechordIndex + 1) % LOFI_CHORDS.length;
    this.notify();

    const chordDuration = 4.8; // Slight overlap for lush crossfade

    // Warm low-pass filter with gentle LFO sweep (classic lo-fi synth warmth)
    const lpFilter = ctx.createBiquadFilter();
    lpFilter.type = 'lowpass';
    lpFilter.frequency.setValueAtTime(380, now);
    lpFilter.frequency.exponentialRampToValueAtTime(640, now + chordDuration * 0.45);
    lpFilter.frequency.exponentialRampToValueAtTime(340, now + chordDuration);
    lpFilter.Q.setValueAtTime(1.15, now);

    const chordBusGain = ctx.createGain();
    chordBusGain.gain.setValueAtTime(0.0001, now);
    chordBusGain.gain.linearRampToValueAtTime(0.42, now + 1.1);
    chordBusGain.gain.setValueAtTime(0.42, now + chordDuration - 1.5);
    chordBusGain.gain.exponentialRampToValueAtTime(0.0001, now + chordDuration);

    lpFilter.connect(chordBusGain);
    chordBusGain.connect(this.masterAmbientGain);

    // Subtle tape pitch warble LFO
    const warbleOsc = ctx.createOscillator();
    const warbleGain = ctx.createGain();
    warbleOsc.type = 'sine';
    warbleOsc.frequency.setValueAtTime(1.8, now); // 1.8Hz slow tape flutter
    warbleGain.gain.setValueAtTime(1.3, now); // +/- 1.3Hz pitch drift
    warbleOsc.connect(warbleGain);
    warbleOsc.start(now);
    warbleOsc.stop(now + chordDuration);

    // Sub-bass warm foundation
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(chord.root, now);
    bassGain.gain.setValueAtTime(0.24, now);
    bassOsc.connect(bassGain);
    bassGain.connect(lpFilter);
    bassOsc.start(now);
    bassOsc.stop(now + chordDuration);

    // Lush detuned Rhodes/Pad voices
    chord.notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      // Slight vintage detune per voice
      const detuneCents = (idx - 2) * 4.5 + (Math.random() * 3 - 1.5);
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detuneCents, now);

      // Connect tape flutter LFO to frequency
      warbleGain.connect(osc.frequency);

      noteGain.gain.setValueAtTime(0.14 / Math.sqrt(chord.notes.length), now);
      osc.connect(noteGain);
      noteGain.connect(lpFilter);

      osc.start(now + idx * 0.035); // Gentle harp/Rhodes strum roll
      osc.stop(now + chordDuration);
    });

    // Soft lo-fi electric piano melodic droplets (2 gentle notes per bar)
    const dropletTimes = [1.1, 2.75];
    dropletTimes.forEach((offset, i) => {
      if (Math.random() < 0.82) {
        const noteFreq =
          chord.melodyPool[(this.privatechordIndex + i * 2) % chord.melodyPool.length];
        const bellOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();
        const bellFilter = ctx.createBiquadFilter();

        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(noteFreq, now + offset);

        bellFilter.type = 'lowpass';
        bellFilter.frequency.setValueAtTime(1100, now + offset);

        bellGain.gain.setValueAtTime(0.0001, now + offset);
        bellGain.gain.linearRampToValueAtTime(0.065, now + offset + 0.06);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 1.45);

        bellOsc.connect(bellFilter);
        bellFilter.connect(bellGain);
        bellGain.connect(this.masterAmbientGain!);

        bellOsc.start(now + offset);
        bellOsc.stop(now + offset + 1.5);
      }
    });
  }

  private stopAmbientLoop() {
    if (this.chordTimer !== null) {
      window.clearInterval(this.chordTimer);
      this.chordTimer = null;
    }

    if (this.ctx && this.masterAmbientGain) {
      const now = this.ctx.currentTime;
      this.masterAmbientGain.gain.cancelScheduledValues(now);
      this.masterAmbientGain.gain.setValueAtTime(
        Math.max(0.0001, this.masterAmbientGain.gain.value),
        now
      );
      this.masterAmbientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    }

    if (this.vinylSource) {
      const src = this.vinylSource;
      this.vinylSource = null;
      setTimeout(() => {
        try {
          src.stop();
          src.disconnect();
        } catch {
          // Ignore already stopped
        }
      }, 650);
    }

    this.isAmbientPlaying = false;
  }

  public playAgentCue(agentId: string) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    switch (agentId) {
      case 'agent_nova':
        // Calm high-tech ping (Sine wave, clear chime)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      case 'agent_pixel':
        // Fast energetic arcade beeps (Square wave)
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(880, now + 0.16); // A5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case 'agent_closer':
        // Confident rich chime (Triangle wave)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
        break;

      case 'agent_orbit':
        // Methodical structured beep (Sawtooth crisp)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(330, now); // E4
        osc.frequency.setValueAtTime(493.88, now + 0.12); // B4
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        break;

      case 'agent_coach':
        // Supportive soothing zen chime (Sine mellow)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392, now); // G4
        osc.frequency.setValueAtTime(523.25, now + 0.2); // C5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;

      default:
        // Generic UI pop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
    }
  }

  public playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const soundManager = new SoundManager();
