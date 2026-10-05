/**
 * Alpho RoverX - Cockpit Synthesized Audio Engine (Web Audio API)
 * Impeccable Craft Edition:
 * - Physical modeling (contact transient noise + CNC aluminum body resonance)
 * - Master Dynamics Compressor & warm-shelving bus
 * - Spatial stereo stage (subtle panned acoustic cues)
 * - Anti-fatigue organic micro-jitter (humanized micro-switch variance)
 * - Zero external assets, zero latency, pure client-side synthesis.
 */

class CockpitAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private warmFilter: BiquadFilterNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rover_sound_muted");
      this.isMuted = saved === "true";
    }
  }

  private initCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // 1. Studio-grade Master Dynamics Compressor
        // Prevents clipping, glues concurrent micro-sounds, delivers tight transients
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(16, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.12, this.ctx.currentTime);

        // 2. Warm Analog High-Shelf Filter
        // Softens digital harshness (>12kHz) for a weighty, luxury physical feel
        this.warmFilter = this.ctx.createBiquadFilter();
        this.warmFilter.type = "highshelf";
        this.warmFilter.frequency.setValueAtTime(11500, this.ctx.currentTime);
        this.warmFilter.gain.setValueAtTime(-2.0, this.ctx.currentTime);

        // 3. Master Gain Node
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

        // Route: Node -> Compressor -> WarmFilter -> MasterGain -> Destination
        this.compressor.connect(this.warmFilter);
        this.warmFilter.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        // Pre-generate 50ms of pink-weighted contact noise for micro-switch mechanical clicks
        this.noiseBuffer = this.generateMechanicalNoiseBuffer(this.ctx);
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    return this.ctx;
  }

  /**
   * Pre-generates realistic mechanical switch contact friction noise
   */
  private generateMechanicalNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = Math.floor(ctx.sampleRate * 0.05); // 50ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter approximation
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      const pink = b0 + b1 + b2 + white * 0.5362;
      data[i] = pink * 0.11;
    }
    return buffer;
  }

  /**
   * Helper: Connect an audio node to the master bus with optional stereo positioning
   */
  private connectToBus(ctx: AudioContext, sourceNode: AudioNode, pan: number = 0) {
    if (!this.compressor) return;

    if (pan !== 0 && typeof ctx.createStereoPanner === "function") {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), ctx.currentTime);
      sourceNode.connect(panner);
      panner.connect(this.compressor);
    } else {
      sourceNode.connect(this.compressor);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("rover_sound_muted", String(this.isMuted));
    }
    if (!this.isMuted) {
      this.playTactileClick(1.0, 0);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * 1. Tactile Precision CNC Micro-Switch Click
   * Synthesizes 3 distinct physical layers:
   * Layer A: High-frequency contact transient (mechanical snick)
   * Layer B: Damped aluminum body resonance (chassis cavity ring)
   * Layer C: Anti-fatigue micro-jitter (humanized organic variance)
   */
  public playTactileClick(pitchMultiplier: number = 1.0, pan: number = 0.0) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    // Humanized organic jitter: ±2% pitch variation to eliminate fatigue
    const jitter = 1 + (Math.random() - 0.5) * 0.04;
    const basePitch = pitchMultiplier * jitter;

    // --- Layer A: Metal Contact Transient ---
    if (this.noiseBuffer) {
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(3800 * basePitch, t);
      noiseFilter.Q.setValueAtTime(3.5, t);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.065, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.014);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      this.connectToBus(ctx, noiseGain, pan);

      noiseSource.start(t);
      noiseSource.stop(t + 0.016);
    }

    // --- Layer B: Precision Spring Leaf Snap ---
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = "triangle";
    snapOsc.frequency.setValueAtTime(2600 * basePitch, t);
    snapOsc.frequency.exponentialRampToValueAtTime(620, t + 0.016);

    snapGain.gain.setValueAtTime(0.09, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.016);

    snapOsc.connect(snapGain);
    this.connectToBus(ctx, snapGain, pan);
    snapOsc.start(t);
    snapOsc.stop(t + 0.018);

    // --- Layer C: Aluminum Chassis Damped Resonance ---
    const bodyOsc = ctx.createOscillator();
    const bodyFilter = ctx.createBiquadFilter();
    const bodyGain = ctx.createGain();

    bodyOsc.type = "sine";
    bodyOsc.frequency.setValueAtTime(1250 * basePitch, t);
    bodyOsc.frequency.exponentialRampToValueAtTime(180, t + 0.026);

    bodyFilter.type = "lowpass";
    bodyFilter.frequency.setValueAtTime(2200, t);

    bodyGain.gain.setValueAtTime(0.14, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.026);

    bodyOsc.connect(bodyFilter);
    bodyFilter.connect(bodyGain);
    this.connectToBus(ctx, bodyGain, pan);

    bodyOsc.start(t);
    bodyOsc.stop(t + 0.028);
  }

  /**
   * 2. Magnetic Detent / Stepper Wheel Notch
   * Weighted, satisfying magnetic notch for speed slider adjustment.
   */
  public playSliderNotch(frequency: number = 1200, pan: number = -0.3) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    const jitter = 1 + (Math.random() - 0.5) * 0.03;
    const tunedFreq = frequency * jitter;

    // Magnetic flux snap
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(tunedFreq, t);
    osc.frequency.exponentialRampToValueAtTime(tunedFreq * 0.28, t + 0.018);

    gain.gain.setValueAtTime(0.095, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);

    // Warm body damping filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, t);

    osc.connect(filter);
    filter.connect(gain);
    this.connectToBus(ctx, gain, pan);

    osc.start(t);
    osc.stop(t + 0.02);
  }

  /**
   * 3. Directional D-Pad Actuation Click (Spatial Audio)
   * Inflects pitch and stereo position based on direction.
   */
  public playDpadActuate(direction: "up" | "down" | "left" | "right") {
    const config = {
      up: { pitch: 1.18, pan: 0.0 },
      down: { pitch: 0.88, pan: 0.0 },
      left: { pitch: 0.96, pan: -0.35 },
      right: { pitch: 1.06, pan: 0.35 },
    };
    const c = config[direction] || { pitch: 1.0, pan: 0.0 };
    this.playTactileClick(c.pitch, c.pan);
  }

  /**
   * 4. Industrial Heavy Emergency STOP Breaker
   * Dual-stage industrial solenoid release + heavy chassis inertia thump + harmonic alert.
   */
  public playEmergencyStop() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Stage 1: Sub-bass Chassis Shockwave (Sub-60Hz)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(140, t);
    subOsc.frequency.exponentialRampToValueAtTime(36, t + 0.16);

    subGain.gain.setValueAtTime(0.38, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    subOsc.connect(subGain);
    this.connectToBus(ctx, subGain, 0);
    subOsc.start(t);
    subOsc.stop(t + 0.17);

    // Stage 2: Heavy Mechanical Breaker Latch Crack
    const latchOsc = ctx.createOscillator();
    const latchGain = ctx.createGain();
    latchOsc.type = "triangle";
    latchOsc.frequency.setValueAtTime(950, t);
    latchOsc.frequency.exponentialRampToValueAtTime(150, t + 0.05);

    latchGain.gain.setValueAtTime(0.24, t);
    latchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    latchOsc.connect(latchGain);
    this.connectToBus(ctx, latchGain, 0);
    latchOsc.start(t);
    latchOsc.stop(t + 0.06);

    // Stage 3: Aerospace Dual-Tone Harmonic Pip (Crystal Alert)
    const pipOsc = ctx.createOscillator();
    const pipGain = ctx.createGain();
    pipOsc.type = "sine";
    pipOsc.frequency.setValueAtTime(587.33, t + 0.045); // D5
    pipOsc.frequency.exponentialRampToValueAtTime(440, t + 0.19); // A4

    pipGain.gain.setValueAtTime(0.14, t + 0.045);
    pipGain.gain.exponentialRampToValueAtTime(0.001, t + 0.19);

    pipOsc.connect(pipGain);
    this.connectToBus(ctx, pipGain, 0);
    pipOsc.start(t + 0.045);
    pipOsc.stop(t + 0.2);
  }

  /**
   * 5. Mechanical Dual-Curtain Optical Shutter
   * Realistic mirrorless / aerospace focal plane optical curtain mechanics.
   */
  public playCameraShutter() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Curtain 1: Solenoid release & aperture stop (t)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(2400, t);
    osc1.frequency.exponentialRampToValueAtTime(500, t + 0.016);

    gain1.gain.setValueAtTime(0.18, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.016);

    osc1.connect(gain1);
    this.connectToBus(ctx, gain1, 0.05);
    osc1.start(t);
    osc1.stop(t + 0.02);

    // Curtain 2: High-speed mechanical brake latch (t + 42ms)
    const t2 = t + 0.042;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1750, t2);
    osc2.frequency.exponentialRampToValueAtTime(320, t2 + 0.022);

    gain2.gain.setValueAtTime(0.2, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.022);

    osc2.connect(gain2);
    this.connectToBus(ctx, gain2, -0.05);
    osc2.start(t2);
    osc2.stop(t2 + 0.026);
  }

  /**
   * 6. Neural AI Insight Chime (Harmonic Series)
   * Pristine crystalline aerospace chord with smooth shimmering decay.
   */
  public playAiChime() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    // E Major 9th crystalline overtone series: E5, B5, F#6, G#6
    const notes = [659.25, 987.77, 1479.98, 1661.22];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = t + idx * 0.038;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      // Delicate ethereal attack and long exponential decay
      gain.gain.setValueAtTime(0.065, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.55);

      osc.connect(gain);
      // Subtle stereo spread across chord voices
      const voicePan = (idx - 1.5) * 0.25;
      this.connectToBus(ctx, gain, voicePan);

      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  }

  /**
   * 7. Resonant Vehicle Horn Pulse
   */
  public playHornSignal() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    [340, 420].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(850, t);

      osc.connect(filter);
      filter.connect(gain);
      this.connectToBus(ctx, gain, 0.3);

      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  /**
   * 8. Airy Hover Tick (Ultra-quiet micro-interaction)
   */
  public playSoftHover(pan: number = 0.0) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(2800, t);
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.007);

    gain.gain.setValueAtTime(0.015, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.007);

    osc.connect(gain);
    this.connectToBus(ctx, gain, pan);

    osc.start(t);
    osc.stop(t + 0.009);
  }
}

export const cockpitAudio = new CockpitAudioEngine();

