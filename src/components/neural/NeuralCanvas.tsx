import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AssistantState } from '../../types/ai';
import { AudioMetrics, VisualSettings } from '../../types/audio';
import { globalAudioAnalyzer } from '../../lib/audio/AudioAnalyzer';
import { createRainbowSphereMaterial } from './RainbowSphereShaders';

interface NeuralCanvasProps {
  state: AssistantState;
  settings: VisualSettings;
  mode?: 'full' | 'mini';
  className?: string;
  onFpsUpdate?: (fps: number) => void;
}

export const NeuralCanvas: React.FC<NeuralCanvasProps> = ({
  state,
  settings,
  mode = 'full',
  className = '',
  onFpsUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const settingsRef = useRef(settings);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 3.5;

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: settings.quality !== 'low',
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    const pixelRatio = Math.min(window.devicePixelRatio, settings.quality === 'high' ? 2 : 1.5);
    renderer.setPixelRatio(pixelRatio);
    container.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // ========================================================
    // RAINBOW GRANULAR STIPPLED SPHERE (Matching Reference Image)
    // ========================================================
    const baseRadius = 1.15;
    
    // Determine particle count based on quality and mode
    const isMini = mode === 'mini';
    const particleCount = isMini
      ? (settings.quality === 'low' ? 12000 : 25000)
      : (settings.quality === 'low' ? 30000 : settings.quality === 'medium' ? 60000 : 90000);

    const positions = new Float32Array(particleCount * 3);
    const randoms = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    // Fibonacci Sphere Distribution with subtle volumetric stippling depth
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Subtle thickness jitter (granular stippled crust)
      const radialJitter = 1.0 + (Math.random() - 0.5) * 0.055;
      const r = baseRadius * radialJitter;

      positions[i * 3] = x * r;
      positions[i * 3 + 1] = y * r;
      positions[i * 3 + 2] = z * r;

      randoms[i] = Math.random();
      // Point size with variety: some micro pinpoints, some slightly larger sparkling granules
      sizes[i] = 0.55 + Math.random() * 0.9;
    }

    const sphereGeo = new THREE.BufferGeometry();
    sphereGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    sphereGeo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    sphereGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const sphereMat = createRainbowSphereMaterial(baseRadius);
    const sphereMesh = new THREE.Points(sphereGeo, sphereMat);
    rootGroup.add(sphereMesh);

    // ========================================================
    // Subtle Inner Dark Core + Outer Atmospheric Corona Glow
    // ========================================================
    const canvasCorona = document.createElement('canvas');
    canvasCorona.width = 256;
    canvasCorona.height = 256;
    const ctxCorona = canvasCorona.getContext('2d')!;
    const grad = ctxCorona.createRadialGradient(128, 128, 90, 128, 128, 128);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.7, 'rgba(34, 197, 94, 0.12)');
    grad.addColorStop(0.85, 'rgba(6, 182, 212, 0.18)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctxCorona.fillStyle = grad;
    ctxCorona.fillRect(0, 0, 256, 256);

    const coronaTexture = new THREE.CanvasTexture(canvasCorona);
    const coronaMat = new THREE.SpriteMaterial({
      map: coronaTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.6,
    });
    const coronaSprite = new THREE.Sprite(coronaMat);
    coronaSprite.scale.set(baseRadius * 2.35, baseRadius * 2.35, 1.0);
    rootGroup.add(coronaSprite);

    // Mouse / Touch Interactivity (Subtle Tilt)
    let targetRotY = 0;
    let targetRotX = 0;
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const nx = (clientX / window.innerWidth) * 2 - 1;
      const ny = -(clientY / window.innerHeight) * 2 + 1;
      targetRotY = nx * 0.25;
      targetRotX = -ny * 0.25;
    };
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationId: number;
    let frameCount = 0;
    let lastFpsTime = performance.now();
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationId = requestAnimationFrame(animate);

      // FPS tracking
      frameCount++;
      if (currentTime - lastFpsTime >= 1000) {
        if (onFpsUpdate) onFpsUpdate(frameCount);
        frameCount = 0;
        lastFpsTime = currentTime;
      }

      const delta = (currentTime - lastTime) * 0.001;
      lastTime = currentTime;

      // Parallax smoothing
      rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.05;
      rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.05;

      // Audio analysis
      const currentMetrics = globalAudioAnalyzer.computeMetrics();
      const st = stateRef.current;
      const sett = settingsRef.current;

      // Base scale and responsiveness calculation
      let targetScale = 1.0;
      let rotSpeed = 0.001;

      if (st === 'LISTENING') {
        targetScale = 0.98 + currentMetrics.amplitude * 0.35 + currentMetrics.speechActivity * 0.15;
        rotSpeed = 0.002;
      } else if (st === 'SPEAKING') {
        targetScale = 1.02 + currentMetrics.amplitude * 0.45;
        rotSpeed = 0.003;
      } else if (st === 'THINKING' || st === 'PROCESSING') {
        targetScale = 1.0 + Math.sin(currentTime * 0.004) * 0.04;
        rotSpeed = 0.008;
      } else if (st === 'SEARCHING' || st === 'EXECUTING') {
        targetScale = 1.04 + Math.sin(currentTime * 0.006) * 0.05;
        rotSpeed = 0.006;
      } else {
        // IDLE
        targetScale = 1.0 + Math.sin(currentTime * 0.0012) * 0.02;
        rotSpeed = 0.0008;
      }

      if (sett.reducedMotion) {
        targetScale = 1.0;
        rotSpeed = 0.0003;
      }

      // Very subtle slow rotation around Y to keep the rainbow orientation steady while particles shimmer
      sphereMesh.rotation.y += rotSpeed;

      // Update shader uniforms
      sphereMat.uniforms.uTime.value = currentTime * 0.001;
      sphereMat.uniforms.uAmplitude.value = currentMetrics.amplitude * sett.fluidIntensity;
      sphereMat.uniforms.uLow.value = currentMetrics.low;
      sphereMat.uniforms.uMid.value = currentMetrics.mid;
      sphereMat.uniforms.uHigh.value = currentMetrics.high;
      sphereMat.uniforms.uSpeech.value = currentMetrics.speechActivity;
      sphereMat.uniforms.uScale.value = targetScale;
      sphereMat.uniforms.uGlow.value = sett.glowIntensity;

      // Corona pulse
      const coronaScale = baseRadius * 2.35 * targetScale * (1.0 + currentMetrics.amplitude * 0.2);
      coronaSprite.scale.set(coronaScale, coronaScale, 1.0);
      coronaMat.opacity = Math.min(0.9, 0.45 + currentMetrics.amplitude * 0.4);

      renderer.render(scene, camera);
    };

    animationId = requestAnimationFrame(animate);

    // Pause rendering when tab hidden
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        lastTime = performance.now();
        animationId = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);

      try {
        renderer.dispose();
        sphereGeo.dispose();
        sphereMat.dispose();
        coronaTexture.dispose();
        coronaMat.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      } catch (e) {
        console.warn('Three.js cleanup error:', e);
      }
    };
  }, [settings.quality]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none pointer-events-auto ${className}`}
    />
  );
};
