import { AudioMetrics } from '../../types/audio';

type AudioCallback = (metrics: AudioMetrics) => void;

export class AudioAnalyzer {
  private inputAudioCtx: AudioContext | null = null;
  private inputAnalyser: AnalyserNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;

  private outputAnalyser: AnalyserNode | null = null;

  private subscribers: Set<AudioCallback> = new Set();
  private animationFrameId: number | null = null;

  // Smoothing states
  private smoothedAmplitude = 0;
  private smoothedLow = 0;
  private smoothedMid = 0;
  private smoothedHigh = 0;
  private smoothedSpeech = 0;
  private smoothedPitch = 0.5;

  private lastInputTime = 0;
  private lastOutputTime = 0;

  constructor() {}

  public setInputContext(ctx: AudioContext, stream: MediaStream): void {
    try {
      this.inputAudioCtx = ctx;
      if (this.inputSource) {
        try { this.inputSource.disconnect(); } catch {}
      }
      this.inputSource = ctx.createMediaStreamSource(stream);
      this.inputAnalyser = ctx.createAnalyser();
      this.inputAnalyser.fftSize = 512;
      this.inputAnalyser.smoothingTimeConstant = 0.8;
      this.inputSource.connect(this.inputAnalyser);

      this.startLoop();
    } catch (e) {
      console.warn('AudioAnalyzer input setup error:', e);
    }
  }

  public setOutputAnalyser(analyser: AnalyserNode): void {
    this.outputAnalyser = analyser;
    this.startLoop();
  }

  public subscribe(cb: AudioCallback): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  private startLoop(): void {
    if (this.animationFrameId !== null) return;

    const update = () => {
      const metrics = this.computeMetrics();
      for (const cb of this.subscribers) {
        cb(metrics);
      }
      this.animationFrameId = requestAnimationFrame(update);
    };

    this.animationFrameId = requestAnimationFrame(update);
  }

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.inputSource) {
      try { this.inputSource.disconnect(); } catch {}
      this.inputSource = null;
    }
    this.inputAnalyser = null;
    this.outputAnalyser = null;
  }

  public computeMetrics(): AudioMetrics {
    let inputAmp = 0;
    let inputLow = 0;
    let inputMid = 0;
    let inputHigh = 0;
    let inputPitch = 0.5;

    let outputAmp = 0;
    let outputLow = 0;
    let outputMid = 0;
    let outputHigh = 0;

    const now = performance.now();

    // 1. Analyze Mic Input
    if (this.inputAnalyser) {
      const bufferLength = this.inputAnalyser.frequencyBinCount; // 256 bins
      const freqData = new Uint8Array(bufferLength);
      const timeData = new Uint8Array(bufferLength);

      this.inputAnalyser.getByteFrequencyData(freqData);
      this.inputAnalyser.getByteTimeDomainData(timeData);

      // RMS
      let sumSquares = 0;
      let zeroCrossings = 0;
      for (let i = 0; i < bufferLength; i++) {
        const val = (timeData[i] - 128) / 128;
        sumSquares += val * val;
        if (i > 0 && ((timeData[i] >= 128 && timeData[i - 1] < 128) || (timeData[i] < 128 && timeData[i - 1] >= 128))) {
          zeroCrossings++;
        }
      }
      inputAmp = Math.sqrt(sumSquares / bufferLength);

      // Frequency bands (sampleRate / 512 per bin)
      const sampleRate = this.inputAudioCtx?.sampleRate || 16000;
      const binWidth = sampleRate / 512;

      let lowSum = 0, lowCount = 0;
      let midSum = 0, midCount = 0;
      let highSum = 0, highCount = 0;

      for (let i = 0; i < bufferLength; i++) {
        const freq = i * binWidth;
        const normVal = freqData[i] / 255;
        if (freq >= 40 && freq < 250) {
          lowSum += normVal; lowCount++;
        } else if (freq >= 250 && freq < 2200) {
          midSum += normVal; midCount++;
        } else if (freq >= 2200 && freq < 7500) {
          highSum += normVal; highCount++;
        }
      }

      inputLow = lowCount ? lowSum / lowCount : 0;
      inputMid = midCount ? midSum / midCount : 0;
      inputHigh = highCount ? highSum / highCount : 0;

      // Pitch estimate based on zero-crossings
      const zcrPitch = Math.min(1, Math.max(0, (zeroCrossings / bufferLength) * 2.5));
      inputPitch = zcrPitch;

      if (inputAmp > 0.035) {
        this.lastInputTime = now;
      }
    }

    // 2. Analyze Output Audio (Gemini Speaking)
    if (this.outputAnalyser) {
      const bufferLength = this.outputAnalyser.frequencyBinCount;
      const freqData = new Uint8Array(bufferLength);
      const timeData = new Uint8Array(bufferLength);

      this.outputAnalyser.getByteFrequencyData(freqData);
      this.outputAnalyser.getByteTimeDomainData(timeData);

      let sumSquares = 0;
      for (let i = 0; i < bufferLength; i++) {
        const val = (timeData[i] - 128) / 128;
        sumSquares += val * val;
      }
      outputAmp = Math.sqrt(sumSquares / bufferLength);

      let lowSum = 0, lowCount = 0;
      let midSum = 0, midCount = 0;
      let highSum = 0, highCount = 0;

      for (let i = 0; i < bufferLength; i++) {
        const normVal = freqData[i] / 255;
        if (i < 8) {
          lowSum += normVal; lowCount++;
        } else if (i < 40) {
          midSum += normVal; midCount++;
        } else {
          highSum += normVal; highCount++;
        }
      }

      outputLow = lowCount ? lowSum / lowCount : 0;
      outputMid = midCount ? midSum / midCount : 0;
      outputHigh = highCount ? highSum / highCount : 0;

      if (outputAmp > 0.03) {
        this.lastOutputTime = now;
      }
    }

    const isOutputActive = (now - this.lastOutputTime) < 180;
    const isInputActive = !isOutputActive && (now - this.lastInputTime) < 250;

    // Output audio dominates if active, else input audio
    const rawAmp = isOutputActive ? outputAmp * 1.6 : (isInputActive ? inputAmp * 2.2 : 0);
    const rawLow = isOutputActive ? outputLow : inputLow;
    const rawMid = isOutputActive ? outputMid : inputMid;
    const rawHigh = isOutputActive ? outputHigh : inputHigh;
    const rawPitch = inputPitch;

    // Speech activity heuristic (speech concentrated between 250Hz - 3kHz with amplitude)
    const rawSpeech = (rawAmp > 0.04 && rawMid > 0.15) ? Math.min(1, rawMid * 1.8 + rawAmp) : 0;

    // Exponential smoothing
    const smoothFactor = 0.22;
    this.smoothedAmplitude += (Math.min(1, rawAmp) - this.smoothedAmplitude) * smoothFactor;
    this.smoothedLow += (Math.min(1, rawLow) - this.smoothedLow) * smoothFactor;
    this.smoothedMid += (Math.min(1, rawMid) - this.smoothedMid) * smoothFactor;
    this.smoothedHigh += (Math.min(1, rawHigh) - this.smoothedHigh) * smoothFactor;
    this.smoothedSpeech += (rawSpeech - this.smoothedSpeech) * smoothFactor;
    this.smoothedPitch += (rawPitch - this.smoothedPitch) * 0.15;

    return {
      amplitude: Math.max(0, Math.min(1, this.smoothedAmplitude)),
      low: Math.max(0, Math.min(1, this.smoothedLow)),
      mid: Math.max(0, Math.min(1, this.smoothedMid)),
      high: Math.max(0, Math.min(1, this.smoothedHigh)),
      speechActivity: Math.max(0, Math.min(1, this.smoothedSpeech)),
      pitch: Math.max(0, Math.min(1, this.smoothedPitch)),
      isInputSpeaking: isInputActive,
      isOutputSpeaking: isOutputActive,
    };
  }
}

export const globalAudioAnalyzer = new AudioAnalyzer();
