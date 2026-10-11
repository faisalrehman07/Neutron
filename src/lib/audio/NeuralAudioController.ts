import { AssistantState } from '../../types/ai';
import { AudioMetrics, NeuralVisualParameters, VisualSettings } from '../../types/audio';

export class NeuralAudioController {
  public static mapToVisuals(
    metrics: AudioMetrics,
    state: AssistantState,
    settings: VisualSettings
  ): NeuralVisualParameters {
    const intensity = settings.reducedMotion ? 0.3 : settings.animationIntensity;
    const amp = metrics.amplitude * settings.fluidIntensity;
    const low = metrics.low;
    const mid = metrics.mid;
    const high = metrics.high;
    const speech = metrics.speechActivity;

    let baseScale = 1.0;
    let baseFluid = 0.5;
    let baseParticleSpeed = 0.6;
    let baseParticleDensity = settings.particleDensity;
    let baseConnectionOpacity = 0.4;
    let baseTurbulence = 0.3;
    let baseOrbitSpeed = 0.5;
    let baseGlow = 0.6 * settings.glowIntensity;
    let hueShift = 0.0;
    let colorHex = '#00e5ff'; // Cool cyan default

    switch (state) {
      case 'IDLE':
        baseScale = 1.0 + Math.sin(performance.now() * 0.0015) * 0.04;
        baseFluid = 0.25;
        baseParticleSpeed = 0.3;
        baseTurbulence = 0.15;
        baseOrbitSpeed = 0.3;
        baseGlow = 0.45;
        colorHex = '#00d2ff';
        break;

      case 'LISTENING':
        // Contracts slightly inward, fluid becomes receptive
        baseScale = 0.92 + amp * 0.4 + speech * 0.15;
        baseFluid = 0.7 + amp * 1.2 + mid * 0.6;
        baseParticleSpeed = 0.8 + high * 0.8;
        baseConnectionOpacity = 0.65 + speech * 0.35;
        baseTurbulence = 0.4 + low * 0.8;
        baseOrbitSpeed = 0.9;
        baseGlow = 0.8 + amp * 0.5;
        colorHex = '#38bdf8'; // Electric blue
        break;

      case 'PROCESSING':
      case 'THINKING':
        // Complex fluid turbulence, rotational energy
        baseScale = 1.05 + Math.sin(performance.now() * 0.005) * 0.06;
        baseFluid = 0.85;
        baseParticleSpeed = 1.2;
        baseConnectionOpacity = 0.9;
        baseTurbulence = 0.9;
        baseOrbitSpeed = 1.6;
        baseGlow = 0.85;
        hueShift = 0.15;
        colorHex = '#818cf8'; // Violet-cyan
        break;

      case 'SEARCHING':
        // Scanning waves and outward particulate pulses
        baseScale = 1.1 + Math.sin(performance.now() * 0.008) * 0.08;
        baseFluid = 0.95;
        baseParticleSpeed = 1.5;
        baseTurbulence = 0.7;
        baseOrbitSpeed = 1.8;
        baseGlow = 0.9;
        colorHex = '#2dd4bf'; // Turquoise
        break;

      case 'PLANNING':
        baseScale = 1.02;
        baseFluid = 0.6;
        baseParticleSpeed = 0.8;
        baseConnectionOpacity = 0.95;
        baseTurbulence = 0.35;
        baseOrbitSpeed = 0.7;
        baseGlow = 0.75;
        colorHex = '#60a5fa'; // Cool blue
        break;

      case 'EXECUTING':
        baseScale = 1.12 + Math.sin(performance.now() * 0.006) * 0.05;
        baseFluid = 1.0;
        baseParticleSpeed = 1.6;
        baseConnectionOpacity = 0.85;
        baseTurbulence = 0.85;
        baseOrbitSpeed = 1.7;
        baseGlow = 0.95;
        colorHex = '#06b6d4'; // Deep cyan
        break;

      case 'WAITING_FOR_PERMISSION':
      case 'WAITING_FOR_CONFIRMATION':
        // Paused, pulsing warm amber
        baseScale = 1.0 + Math.sin(performance.now() * 0.003) * 0.05;
        baseFluid = 0.4;
        baseParticleSpeed = 0.35;
        baseConnectionOpacity = 0.5;
        baseTurbulence = 0.2;
        baseOrbitSpeed = 0.35;
        baseGlow = 0.8;
        colorHex = '#fbbf24'; // Warm amber
        break;

      case 'SPEAKING':
        // Expands outward with actual Gemini audio
        baseScale = 1.05 + amp * 0.6 + low * 0.35;
        baseFluid = 0.85 + amp * 1.5 + mid * 0.7;
        baseParticleSpeed = 1.1 + amp * 0.9;
        baseConnectionOpacity = 0.8 + amp * 0.4;
        baseTurbulence = 0.5 + low * 0.9;
        baseOrbitSpeed = 1.2 + amp * 0.6;
        baseGlow = 0.85 + amp * 0.6;
        colorHex = '#00f5ff'; // Radiant cyan-white
        break;

      case 'SUCCESS':
        baseScale = 1.2;
        baseFluid = 0.7;
        baseParticleSpeed = 1.3;
        baseConnectionOpacity = 0.9;
        baseTurbulence = 0.3;
        baseOrbitSpeed = 1.2;
        baseGlow = 1.0;
        colorHex = '#10b981'; // Emerald
        break;

      case 'ERROR':
        baseScale = 0.95;
        baseFluid = 0.35;
        baseParticleSpeed = 0.4;
        baseTurbulence = 0.3;
        baseOrbitSpeed = 0.4;
        baseGlow = 0.6;
        colorHex = '#f43f5e'; // Soft rose
        break;

      case 'DISCONNECTED':
        baseScale = 0.88;
        baseFluid = 0.15;
        baseParticleSpeed = 0.15;
        baseConnectionOpacity = 0.2;
        baseTurbulence = 0.05;
        baseOrbitSpeed = 0.1;
        baseGlow = 0.25;
        colorHex = '#64748b'; // Slate
        break;
    }

    return {
      coreScale: baseScale * intensity,
      fluidIntensity: baseFluid * intensity,
      particleSpeed: baseParticleSpeed * intensity,
      particleDensity: baseParticleDensity,
      connectionOpacity: Math.min(1, baseConnectionOpacity),
      turbulence: baseTurbulence * intensity,
      orbitSpeed: baseOrbitSpeed * intensity,
      glowIntensity: baseGlow,
      hueShift,
      colorHex,
    };
  }
}
