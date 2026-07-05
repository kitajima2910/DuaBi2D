// ============================================================
// Countries Marble Race — Procedural Sound Manager
// All 13 sounds generated at runtime via Web Audio API.
// Zero external audio files. Standalone AudioContext.
// ============================================================

export type SoundId =
  | 'roll' | 'bounce' | 'boost' | 'eliminate' | 'finish'
  | 'countdown_tick' | 'countdown_go' | 'ui_click' | 'ui_hover'
  | 'music_menu' | 'music_race' | 'music_victory' | 'music_tournament';

export class SoundManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentMusic: { source: AudioBufferSourceNode; gain: GainNode } | null = null;
  private buffers = new Map<SoundId, AudioBuffer>();
  private activeSources = new Map<SoundId, AudioBufferSourceNode[]>();
  private _musicVolume = 0.7;
  private _sfxVolume = 1.0;
  private _initialized = false;

  constructor() {
    // No Phaser dependency - standalone AudioContext
  }

  // ── Initialisation ─────────────────────────────────────────

  /** Create AudioContext + gain nodes. Safe to call multiple times. */
  init(): void {
    if (this._initialized) return;
    this._initialized = true;

    try {
      this.context = new AudioContext();

      // Master gain → destination
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.context.destination);

      // Music gain → master
      this.musicGain = this.context.createGain();
      this.musicGain.gain.value = this._musicVolume;
      this.musicGain.connect(this.masterGain);

      // SFX gain → master
      this.sfxGain = this.context.createGain();
      this.sfxGain.gain.value = this._sfxVolume;
      this.sfxGain.connect(this.masterGain);

      // Resume context if suspended (browser autoplay policy)
      if (this.context.state === 'suspended') {
        this.context.resume().catch(() => {
          // Will be resumed on first user interaction via play()
        });
      }
    } catch (err) {
      console.warn('[SoundManager] AudioContext creation failed:', err);
      this._initialized = false;
    }
  }

  /** Generate all 13 procedural audio buffers. */
  generateAllSounds(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const entries: Array<[SoundId, AudioBuffer]> = [
      ['roll', this.generateRoll(ctx)],
      ['bounce', this.renderTone(440, 0.12, 'sine', 0.25, { start: 440, end: 220 })],
      ['boost', this.renderTone(220, 0.2, 'sine', 0.2, { start: 220, end: 880 })],
      ['eliminate', this.renderTone(200, 0.3, 'sawtooth', 0.3, { start: 200, end: 50 })],
      ['finish', this.generateFinish(ctx)],
      ['countdown_tick', this.renderTone(440, 0.08, 'sine', 0.25)],
      ['countdown_go', this.renderTone(880, 0.3, 'sine', 0.35)],
      ['ui_click', this.renderTone(660, 0.05, 'sine', 0.15)],
      ['ui_hover', this.renderTone(440, 0.03, 'sine', 0.05)],
      ['music_menu', this.generateMenuMusic(ctx)],
      ['music_race', this.generateRaceMusic(ctx)],
      ['music_victory', this.generateVictoryMusic(ctx)],
      ['music_tournament', this.generateTournamentMusic(ctx)],
    ];

    for (const [id, buffer] of entries) {
      this.buffers.set(id, buffer);
    }
  }

  /** Convenience: init + generateAllSounds in one call. */
  preload(): void {
    this.init();
    this.generateAllSounds();
  }

  /** Apply stored volume settings. */
  loadSettings(musicVol: number, sfxVol: number): void {
    this.setMusicVolume(musicVol);
    this.setSFXVolume(sfxVol);
  }

  // ── Public playback API ─────────────────────────────────────

  /**
   * Play a one-shot SFX sound.
   * @param id - Sound identifier
   * @param config - Optional volume override and loop flag
   */
  play(id: SoundId, config?: { volume?: number; loop?: boolean }): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const buffer = this.buffers.get(id);
    if (!buffer) return;

    // Resume context if needed (first user interaction)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => { /* ignore */ });
    }

    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = config?.loop ?? false;

      // Track in activeSources for stop()
      const sources = this.activeSources.get(id) ?? [];
      sources.push(source);
      this.activeSources.set(id, sources);

      // Clean up tracking when sound ends
      source.onended = () => {
        const list = this.activeSources.get(id);
        if (list) {
          const idx = list.indexOf(source);
          if (idx >= 0) list.splice(idx, 1);
          if (list.length === 0) this.activeSources.delete(id);
        }
      };

      // Connect through SFX gain
      source.connect(this.sfxGain!);
      source.start(0);
    } catch (err) {
      console.warn(`[SoundManager] Failed to play "${id}":`, err);
    }
  }

  /** Stop all active instances of a given sound. */
  stop(id: SoundId): void {
    const sources = this.activeSources.get(id);
    if (!sources) return;

    for (const source of sources) {
      try {
        source.stop();
        source.disconnect();
      } catch { /* already stopped */ }
    }
    this.activeSources.delete(id);
  }

  /**
   * Start looping background music.
   * Automatically stops any currently playing music.
   */
  playMusic(id: SoundId): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const buffer = this.buffers.get(id);
    if (!buffer) return;

    // Resume context if needed
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => { /* ignore */ });
    }

    // Stop current music
    this.stopMusic();

    try {
      const musicGain = ctx.createGain();
      musicGain.gain.value = this._musicVolume;
      musicGain.connect(this.musicGain!);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(musicGain);
      source.start(0);

      this.currentMusic = { source, gain: musicGain };
    } catch (err) {
      console.warn(`[SoundManager] Failed to play music "${id}":`, err);
    }
  }

  /** Stop currently playing music. */
  stopMusic(): void {
    if (!this.currentMusic) return;
    try {
      this.currentMusic.source.stop();
      this.currentMusic.source.disconnect();
      this.currentMusic.gain.disconnect();
    } catch { /* ignore */ }
    this.currentMusic = null;
  }

  /** Set music volume (0–1). */
  setMusicVolume(vol: number): void {
    this._musicVolume = vol;
    if (this.currentMusic) {
      this.currentMusic.gain.gain.value = vol;
    }
    if (this.musicGain) {
      this.musicGain.gain.value = vol;
    }
  }

  /** Set SFX volume (0–1). */
  setSFXVolume(vol: number): void {
    this._sfxVolume = vol;
    if (this.sfxGain) {
      this.sfxGain.gain.value = vol;
    }
  }

  /** Get current music volume. */
  getMusicVolume(): number {
    return this._musicVolume;
  }

  /** Get current SFX volume. */
  getSFXVolume(): number {
    return this._sfxVolume;
  }

  /** Full cleanup — stop all sounds, release AudioContext. */
  destroy(): void {
    this.stopMusic();

    // Stop all active SFX
    for (const [id] of this.activeSources) {
      this.stop(id);
    }
    this.activeSources.clear();
    this.buffers.clear();

    if (this.context) {
      this.context.close().catch(() => { /* ignore */ });
      this.context = null;
    }

    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this._initialized = false;
  }

  // ── Context helpers ────────────────────────────────────────

  private getContext(): AudioContext | null {
    if (!this._initialized) {
      this.init();
    }
    return this.context;
  }

  // ── Core sound generator ───────────────────────────────────

  /**
   * Render a tone into an AudioBuffer with optional frequency sweep.
   *
   * @param frequency - Base frequency in Hz
   * @param duration - Duration in seconds
   * @param type - Oscillator waveform type
   * @param volume - Output volume (0–1), default 0.3
   * @param sweep - Optional frequency sweep { start, end }
   * @returns AudioBuffer containing the rendered tone
   */
  private renderTone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume = 0.3,
    sweep?: { start: number; end: number },
  ): AudioBuffer {
    const ctx = this.getContext()!;
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const progress = i / length;
      const currentFreq = sweep
        ? sweep.start + (sweep.end - sweep.start) * progress
        : frequency;
      // Decay envelope
      const env = Math.max(0, 1 - progress * 1.2);
      data[i] = this.oscSample(currentFreq, t, type) * env * volume;
    }

    return buffer;
  }

  // ── Music generators ───────────────────────────────────────

  /** Calm menu theme — C major arpeggio at 80 BPM. */
  private generateMenuMusic(ctx: AudioContext): AudioBuffer {
    const bpm = 80;
    const pattern: Array<{ freq: number; dur: number }> = [
      { freq: 261.63, dur: 1.5 }, // C4
      { freq: 293.66, dur: 0.5 }, // D4
      { freq: 329.63, dur: 1 },   // E4
      { freq: 349.23, dur: 0.5 }, // F4
      { freq: 392.00, dur: 1 },   // G4
      { freq: 349.23, dur: 0.5 }, // F4
      { freq: 329.63, dur: 0.5 }, // E4
      { freq: 293.66, dur: 0.5 }, // D4
      { freq: 261.63, dur: 2 },   // C4
    ];
    return this.generatePattern(ctx, bpm, pattern, 'triangle', 0.12);
  }

  /** Energetic race theme at 120 BPM with bass + melody. */
  private generateRaceMusic(ctx: AudioContext): AudioBuffer {
    const bpm = 120;
    const pattern: Array<{ freq: number; dur: number }> = [
      { freq: 130.81, dur: 1 }, // C3 bass
      { freq: 196.00, dur: 1 }, // G3
      { freq: 164.81, dur: 1 }, // E3
      { freq: 196.00, dur: 1 }, // G3
      { freq: 261.63, dur: 0.5 }, // C4
      { freq: 329.63, dur: 0.5 }, // E4
      { freq: 392.00, dur: 0.5 }, // G4
      { freq: 523.25, dur: 0.5 }, // C5
      { freq: 392.00, dur: 0.5 }, // G4
      { freq: 329.63, dur: 0.5 }, // E4
      { freq: 261.63, dur: 1 },   // C4
      { freq: 220.00, dur: 1 },   // A3
    ];
    // Square wave for punchier race feel
    return this.generatePattern(ctx, bpm, pattern, 'square', 0.08);
  }

  /** Triumphant victory fanfare — 100 BPM, major C. */
  private generateVictoryMusic(ctx: AudioContext): AudioBuffer {
    const bpm = 100;
    const pattern: Array<{ freq: number; dur: number }> = [
      { freq: 261.63, dur: 1 }, // C4
      { freq: 329.63, dur: 1 }, // E4
      { freq: 392.00, dur: 1 }, // G4
      { freq: 523.25, dur: 1 }, // C5
      { freq: 659.25, dur: 1 }, // E5
      { freq: 523.25, dur: 0.5 }, // C5
      { freq: 392.00, dur: 0.5 }, // G4
      { freq: 329.63, dur: 1 },   // E4
      { freq: 261.63, dur: 2 },   // C4 (hold)
    ];
    return this.generatePattern(ctx, bpm, pattern, 'triangle', 0.15);
  }

  /** Tournament theme — G major, dramatic at 110 BPM. */
  private generateTournamentMusic(ctx: AudioContext): AudioBuffer {
    const bpm = 110;
    const pattern: Array<{ freq: number; dur: number }> = [
      { freq: 196.00, dur: 1 }, // G3
      { freq: 246.94, dur: 1 }, // B3
      { freq: 293.66, dur: 1 }, // D4
      { freq: 392.00, dur: 1 }, // G4
      { freq: 493.88, dur: 1 }, // B4
      { freq: 587.33, dur: 1 }, // D5
      { freq: 493.88, dur: 0.5 }, // B4
      { freq: 392.00, dur: 0.5 }, // G4
      { freq: 293.66, dur: 1 },   // D4
      { freq: 246.94, dur: 1 },   // B3
      { freq: 196.00, dur: 2 },   // G3 (hold)
    ];
    return this.generatePattern(ctx, bpm, pattern, 'triangle', 0.15);
  }

  /** Low rumbling noise for marble rolling. */
  private generateRoll(ctx: AudioContext): AudioBuffer {
    const duration = 0.25;
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise: integrated white noise with low-pass characteristic
      lastOut = (lastOut + 0.3 * white) / 1.3;
      const env = 1 - i / length;
      data[i] = lastOut * env * 0.8;
    }
    return buffer;
  }

  /** Multi-note arpeggio for finish sound. */
  private generateFinish(ctx: AudioContext): AudioBuffer {
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    const noteLen = 0.12;
    const totalLen = freqs.length * noteLen;
    const length = Math.floor(ctx.sampleRate * totalLen);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let n = 0; n < freqs.length; n++) {
      const freq = freqs[n]!;
      const offset = Math.floor(ctx.sampleRate * noteLen * n);
      const samples = Math.floor(ctx.sampleRate * noteLen);

      for (let i = 0; i < samples && offset + i < length; i++) {
        const t = i / ctx.sampleRate;
        const env = Math.max(0, 1 - i / samples);
        data[offset + i] = Math.sin(2 * Math.PI * freq * t) * env * 0.25;
      }
    }
    return buffer;
  }

  /** Generate a sequence of notes at a given BPM. */
  private generatePattern(
    ctx: AudioContext,
    bpm: number,
    notes: ReadonlyArray<{ readonly freq: number; readonly dur: number }>,
    type: OscillatorType,
    volume: number,
  ): AudioBuffer {
    const beatDur = 60 / bpm;
    let totalSamples = 0;
    const sampleCounts: number[] = [];

    for (const note of notes) {
      const count = Math.floor(ctx.sampleRate * note.dur * beatDur);
      sampleCounts.push(count);
      totalSamples += count;
    }

    const buffer = ctx.createBuffer(1, totalSamples, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let cursor = 0;

    for (let n = 0; n < notes.length; n++) {
      const freq = notes[n]!.freq;
      const samples = sampleCounts[n]!;

      for (let i = 0; i < samples && cursor + i < totalSamples; i++) {
        const t = i / ctx.sampleRate;
        const progress = i / samples;
        const env = Math.max(0, 1 - progress * 0.3);
        data[cursor + i] = this.oscSample(freq, t, type) * env * volume;
      }
      cursor += samples;
    }

    return buffer;
  }

  // ── Utility ────────────────────────────────────────────────

  /**
   * Generate a single oscillator sample for the given type.
   * Supports sine, square, sawtooth, triangle, and custom types.
   */
  private oscSample(freq: number, t: number, type: OscillatorType): number {
    switch (type) {
      case 'sine':
        return Math.sin(2 * Math.PI * freq * t);
      case 'square':
        return Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1;
      case 'sawtooth':
        return 2 * (freq * t - Math.floor(freq * t + 0.5));
      case 'triangle': {
        const p = 2 * (freq * t - Math.floor(freq * t + 0.5));
        return 2 * Math.abs(p) - 1;
      }
      default:
        return Math.sin(2 * Math.PI * freq * t);
    }
  }
}
