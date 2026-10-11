export interface AudioMetrics {
  amplitude: number;       // 0..1 RMS
  low: number;             // 0..1 (20-250Hz energy)
  mid: number;             // 0..1 (250-2000Hz energy)
  high: number;            // 0..1 (2000-8000Hz energy)
  speechActivity: number;  // 0..1 confidence of active vocal speech
  pitch: number;           // 0..1 normalized pitch estimate
  isInputSpeaking: boolean;
  isOutputSpeaking: boolean;
}

export interface NeuralVisualParameters {
  coreScale: number;
  fluidIntensity: number;
  particleSpeed: number;
  particleDensity: number;
  connectionOpacity: number;
  turbulence: number;
  orbitSpeed: number;
  glowIntensity: number;
  hueShift: number;
  colorHex: string;
}

export interface VisualSettings {
  quality: 'auto' | 'high' | 'medium' | 'low';
  animationIntensity: number; // 0.5 to 1.5
  particleDensity: number;    // 0.5 to 1.5
  fluidIntensity: number;     // 0.5 to 1.5
  glowIntensity: number;      // 0.5 to 1.5
  reducedMotion: boolean;
  lowPowerMode: boolean;
}
