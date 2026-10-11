import { globalAudioAnalyzer } from './AudioAnalyzer';

export class AudioPlayer {
  private audioCtx: AudioContext | null = null;
  private outputAnalyser: AnalyserNode | null = null;
  private nextPlayTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isPlaying = false;

  constructor() {}

  private initContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: 24000 });
      this.outputAnalyser = this.audioCtx.createAnalyser();
      this.outputAnalyser.fftSize = 512;
      this.outputAnalyser.smoothingTimeConstant = 0.8;

      this.outputAnalyser.connect(this.audioCtx.destination);
      globalAudioAnalyzer.setOutputAnalyser(this.outputAnalyser);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Resumes or initializes AudioContext upon user gesture
   */
  public async unlock(): Promise<void> {
    const ctx = this.initContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  /**
   * Enqueues base64 PCM 16-bit little-endian audio chunk from Gemini Live
   */
  public playPcmChunk(base64Audio: string): void {
    try {
      const ctx = this.initContext();
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert 16-bit PCM little-endian to Float32
      const numSamples = Math.floor(len / 2);
      const float32Array = new Float32Array(numSamples);
      const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

      for (let i = 0; i < numSamples; i++) {
        const int16 = dataView.getInt16(i * 2, true);
        float32Array[i] = int16 / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, numSamples, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      if (this.outputAnalyser) {
        source.connect(this.outputAnalyser);
      } else {
        source.connect(ctx.destination);
      }

      const currentTime = ctx.currentTime;
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime;
      }

      source.start(this.nextPlayTime);
      this.isPlaying = true;

      const duration = audioBuffer.duration;
      this.nextPlayTime += duration;

      this.activeSources.push(source);
      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx > -1) {
          this.activeSources.splice(idx, 1);
        }
        if (this.activeSources.length === 0) {
          this.isPlaying = false;
        }
      };
    } catch (err) {
      console.error('AudioPlayer playPcmChunk error:', err);
    }
  }

  /**
   * Interrupts and halts all ongoing and scheduled playback immediately (barge-in)
   */
  public interrupt(): void {
    for (const src of this.activeSources) {
      try {
        src.stop();
        src.disconnect();
      } catch {}
    }
    this.activeSources = [];
    this.isPlaying = false;
    if (this.audioCtx) {
      this.nextPlayTime = this.audioCtx.currentTime;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const globalAudioPlayer = new AudioPlayer();
