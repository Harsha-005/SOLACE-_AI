// Web Audio API helper for organic mindfulness chimes and ambient soundscapes

class SoundscapeManager {
  private ctx: AudioContext | null = null;
  private ambientSourceNodes: { [key: string]: AudioNode[] } = {};
  private masterGain: GainNode | null = null;
  private currentAmbient: string = 'none';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft singing bowl / meditation bell chime for breath phase transitions
  public playPhaseChime(frequency: number = 432, duration: number = 1.8) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Organic sine with rich harmonic overtones
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      // Envelope: soft attack, gentle decay
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Audio chime note error:', e);
    }
  }

  // Play gentle completion sound
  public playCompletionChime() {
    this.playPhaseChime(528, 2.5);
    setTimeout(() => this.playPhaseChime(660, 2.8), 200);
    setTimeout(() => this.playPhaseChime(792, 3.2), 450);
  }

  // Set ambient sound volume
  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  // Stop ambient sound
  public stopAmbient() {
    Object.values(this.ambientSourceNodes).forEach(nodes => {
      nodes.forEach(node => {
        try {
          if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
            (node as AudioScheduledSourceNode).stop();
          }
          node.disconnect();
        } catch {
          // Ignore
        }
      });
    });
    this.ambientSourceNodes = {};
    this.currentAmbient = 'none';
  }

  // Play generative ambient soundscapes
  public playAmbient(type: 'rain' | 'stream' | 'crickets' | 'drone' | 'none') {
    this.stopAmbient();
    this.currentAmbient = type;

    if (type === 'none') return;

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const nodes: AudioNode[] = [];

    if (type === 'drone') {
      // Warm meditative drone in 432Hz harmonic series
      const freqs = [108, 162, 216, 432];
      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.1 + idx * 0.05, this.ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        lfo.connect(lfoGain.gain);

        gain.gain.setValueAtTime(0.035 / (idx + 1), this.ctx.currentTime);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        lfo.start();
        nodes.push(osc, gain, lfo, lfoGain);
      });
    } else if (type === 'rain') {
      // Pink/Brown noise rain filter
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.12;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      whiteNoise.start();
      nodes.push(whiteNoise, filter, gain);
    } else if (type === 'stream') {
      // Gentle running stream with modulated bandpass
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start();
      nodes.push(noise, filter, gain);
    } else if (type === 'crickets') {
      // Twilight night crickets - high rhythmic sine pulses
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(4500, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.type = 'square';
      lfo.frequency.setValueAtTime(14, this.ctx.currentTime);

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.012, this.ctx.currentTime);

      lfo.connect(gain.gain);
      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      lfo.start();
      nodes.push(osc, gain, lfo, lfoGain);
    }

    this.ambientSourceNodes[type] = nodes;
  }

  public getCurrentAmbient() {
    return this.currentAmbient;
  }
}

export const soundscape = new SoundscapeManager();
