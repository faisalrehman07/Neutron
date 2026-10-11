import * as THREE from 'three';

export const fluidVertexShader = `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uLow;
  uniform float uMid;
  uniform float uHigh;
  uniform float uTurbulence;
  uniform float uScale;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  // Simplex 3D noise
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Multi-frequency organic fluid displacement
    float timeSpeed = uTime * 0.7;
    vec3 noisePos = position * 0.85 + vec3(timeSpeed * 0.2, timeSpeed * 0.15, timeSpeed * 0.1);
    
    // Low frequency broad slow movement
    float nLow = snoise(noisePos * 0.7) * (0.15 + uLow * 0.45);
    
    // Mid frequency neural turbulence
    float nMid = snoise(noisePos * 1.8 + vec3(0.0, timeSpeed * 0.4, 0.0)) * (0.08 + uMid * 0.35 * uTurbulence);
    
    // High frequency ripples & vocal energy
    float nHigh = snoise(noisePos * 3.5 + vec3(timeSpeed * 0.8)) * (0.04 + uHigh * 0.25);

    float totalDisp = (nLow + nMid + nHigh) * (1.0 + uAmplitude * 1.4);
    vDisplacement = totalDisp;

    vec3 newPos = position + normal * (totalDisp * 0.45);
    newPos *= uScale;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

export const fluidFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uGlow;
  uniform float uOpacity;
  uniform float uAmplitude;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  void main() {
    // Rim Fresnel glow calculation
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.2);

    // Dynamic color gradient from inner core to outer fluid edge
    vec3 deepColor = vec3(0.02, 0.08, 0.18);
    vec3 primaryColor = uColor;
    vec3 brightColor = mix(primaryColor, vec3(0.9, 0.98, 1.0), 0.6);

    float dispNorm = clamp(vDisplacement * 2.0 + 0.4, 0.0, 1.0);
    vec3 baseColor = mix(deepColor, primaryColor, dispNorm);
    vec3 finalColor = mix(baseColor, brightColor, fresnel * uGlow);

    float alpha = clamp((0.35 + fresnel * 0.65 + uAmplitude * 0.25) * uOpacity, 0.0, 0.95);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export function createFluidMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: fluidVertexShader,
    fragmentShader: fluidFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uAmplitude: { value: 0 },
      uLow: { value: 0 },
      uMid: { value: 0 },
      uHigh: { value: 0 },
      uTurbulence: { value: 0.5 },
      uScale: { value: 1.0 },
      uColor: { value: new THREE.Color('#00e5ff') },
      uGlow: { value: 0.8 },
      uOpacity: { value: 0.85 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}
