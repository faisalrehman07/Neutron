import * as THREE from 'three';

export const rainbowSphereVertexShader = `
  attribute float aRandom;
  attribute float aSize;

  uniform float uTime;
  uniform float uAmplitude;
  uniform float uLow;
  uniform float uMid;
  uniform float uHigh;
  uniform float uSpeech;
  uniform float uScale;
  uniform float uSphereRadius;
  uniform float uRotationAngle;

  varying vec3 vPosition;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vRandom;

  // Simplex 3D noise
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // Exact Spectral Rainbow Function matching reference image:
  // Red/Orange (left) -> Yellow -> Vivid Emerald Green (center) -> Cyan -> Cobalt Blue / Violet (right)
  vec3 getRainbowColor(float t) {
    vec3 cRed    = vec3(0.96, 0.18, 0.08); // Intense Red
    vec3 cOrange = vec3(0.98, 0.44, 0.04); // Vibrant Orange
    vec3 cYellow = vec3(0.94, 0.88, 0.06); // Pure Golden Yellow
    vec3 cGreen  = vec3(0.08, 0.94, 0.28); // Saturated Emerald Green
    vec3 cCyan   = vec3(0.04, 0.82, 0.94); // Electric Cyan
    vec3 cBlue   = vec3(0.12, 0.36, 0.98); // Cobalt Blue
    vec3 cViolet = vec3(0.38, 0.12, 0.96); // Royal Violet

    if (t < 0.15) return mix(cRed, cOrange, t / 0.15);
    if (t < 0.32) return mix(cOrange, cYellow, (t - 0.15) / 0.17);
    if (t < 0.50) return mix(cYellow, cGreen, (t - 0.32) / 0.18);
    if (t < 0.68) return mix(cGreen, cCyan, (t - 0.50) / 0.18);
    if (t < 0.85) return mix(cCyan, cBlue, (t - 0.68) / 0.17);
    return mix(cBlue, cViolet, (t - 0.85) / 0.15);
  }

  void main() {
    vRandom = aRandom;

    // Base position
    vec3 pos = position;

    // Organic audio wave displacement
    vec3 normDir = normalize(pos);
    float noiseFreq = 1.8;
    float timeSpeed = uTime * 0.8;
    float n1 = snoise(pos * noiseFreq + vec3(0.0, timeSpeed * 0.4, timeSpeed * 0.2));
    float n2 = snoise(pos * (noiseFreq * 2.2) + vec3(timeSpeed * 0.6));

    // Acoustic displacement based on low/mid/high audio bands
    float waveDisp = (n1 * 0.06 + n2 * 0.03) * (1.0 + uAmplitude * 2.2);
    waveDisp += sin(pos.y * 8.0 + uTime * 3.0) * uLow * 0.08;
    waveDisp += n2 * uHigh * 0.05;

    pos += normDir * waveDisp;
    pos *= uScale;

    // Spherical coordinate color mapping based on horizontal position in screen space
    // pos.x ranges from -uSphereRadius to +uSphereRadius
    float normX = clamp((pos.x / (uSphereRadius * uScale)) * 0.5 + 0.5, 0.0, 1.0);
    
    // Add subtle organic color waviness reacting to sound
    normX = clamp(normX + (n1 * 0.04 * (1.0 + uAmplitude)), 0.0, 1.0);

    vec3 baseColor = getRainbowColor(normX);

    // Frontal lighting & depth attenuation
    // Points closer to camera (z > 0) are brighter; points on the back are dimmer
    float zFactor = clamp((pos.z / (uSphereRadius * uScale)) * 0.5 + 0.5, 0.2, 1.0);
    
    // Edge rim glow calculation
    float rim = 1.0 - abs(dot(normDir, vec3(0.0, 0.0, 1.0)));
    rim = pow(clamp(rim, 0.0, 1.0), 1.6);

    vColor = baseColor * (0.65 + zFactor * 0.55 + rim * 0.35);
    vPosition = pos;

    // Alpha: front particles opaque, back particles slightly transparent
    vAlpha = clamp(0.55 + zFactor * 0.45, 0.3, 1.0);

    // Dynamic point size (with perspective division)
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float baseSize = aSize * (16.0 + uAmplitude * 12.0 + uSpeech * 6.0);
    gl_PointSize = baseSize * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const rainbowSphereFragmentShader = `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uGlow;

  varying vec3 vPosition;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vRandom;

  void main() {
    // Exact circular point sprite mask with soft glittering halo
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    // Sharp pinpoint core + soft glowing edge
    float core = smoothstep(0.5, 0.08, dist);
    float halo = smoothstep(0.5, 0.0, dist) * 0.6;

    // Individual particle shimmering twinkle
    float twinkle = sin(uTime * 4.0 + vRandom * 62.83) * 0.25 + 0.85;
    twinkle += sin(uTime * 12.0 + vRandom * 120.0) * (uAmplitude * 0.4);

    vec3 finalColor = vColor * (core * 1.5 + halo * 0.8) * twinkle;

    gl_FragColor = vec4(finalColor, (core + halo) * vAlpha);
  }
`;

export function createRainbowSphereMaterial(radius: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: rainbowSphereVertexShader,
    fragmentShader: rainbowSphereFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uAmplitude: { value: 0 },
      uLow: { value: 0 },
      uMid: { value: 0 },
      uHigh: { value: 0 },
      uSpeech: { value: 0 },
      uScale: { value: 1.0 },
      uSphereRadius: { value: radius },
      uRotationAngle: { value: 0 },
      uGlow: { value: 1.0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}
