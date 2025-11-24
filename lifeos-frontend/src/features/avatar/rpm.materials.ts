/**
 * RPM Holographic Materials
 * Shader materials adapted for Ready Player Me avatars
 */

import * as THREE from 'three';

// Vertex shader for holographic surface
const holoVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment shader for holographic surface
const holoFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  uniform float u_time;
  uniform vec3 u_seasonColor;
  uniform vec3 u_accent;
  uniform float u_xpPulse;
  uniform float u_levelPulse;
  uniform float u_mood;

  // Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);

    // Scanlines - modulated by mood
    float scanline = sin(vViewPosition.y * 20.0 + u_time * 2.0) * 0.5 + 0.5;
    float scanlineIntensity = mix(0.1, 0.25, u_mood / 2.0);
    scanline = mix(1.0, scanline, scanlineIntensity);

    // Noise - calm mood reduces noise
    vec2 noiseCoord = vUv * 3.0 + u_time * 0.1;
    float noise = snoise(noiseCoord) * 0.5 + 0.5;
    float noiseIntensity = mix(0.15, 0.05, u_mood == 0.0 ? 1.0 : 0.0);
    noise = mix(1.0, noise, noiseIntensity);

    // Base holographic color
    vec3 rimColor = mix(u_seasonColor, u_accent, 0.6);
    vec3 baseColor = mix(vec3(0.05, 0.05, 0.08), rimColor, fresnel * 0.8);

    // XP ripple effect
    float ripple = sin(length(vUv - 0.5) * 10.0 - u_time * 5.0) * 0.5 + 0.5;
    float xpEffect = u_xpPulse * ripple * 0.3;

    // Level glow effect
    float levelGlow = u_levelPulse * 0.5;
    float innerGlow = pow(fresnel, 2.0) * 0.3;

    // Combine effects
    vec3 finalColor = baseColor;
    finalColor *= scanline * noise;
    finalColor += rimColor * (fresnel * 0.4 + xpEffect + levelGlow);
    finalColor += u_accent * innerGlow;

    finalColor = clamp(finalColor, 0.0, 1.2);

    float alpha = mix(0.7, 0.95, fresnel);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Aura vertex shader
const auraVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Aura fragment shader
const auraFragmentShader = `
  varying vec2 vUv;

  uniform float u_time;
  uniform vec3 u_color;
  uniform float u_intensity;
  uniform float u_radius;
  uniform float u_streakSpokes;

  void main() {
    vec2 center = vec2(0.5, 0.5);
    float dist = length(vUv - center);

    // Radial gradient
    float radial = 1.0 - smoothstep(0.0, u_radius, dist);

    // Pulsing animation
    float pulse = sin(u_time * 2.0) * 0.5 + 0.5;
    float pulsedIntensity = u_intensity * (0.6 + pulse * 0.4);

    // Streak spokes (for high streak days)
    float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
    float spokes = 0.0;
    if (u_streakSpokes > 0.0) {
      float spokeCount = floor(u_streakSpokes / 3.0) + 3.0;
      float spokePattern = sin(angle * spokeCount + u_time) * 0.5 + 0.5;
      spokes = spokePattern * 0.15 * smoothstep(0.3, 0.6, dist);
    }

    // Combine effects
    float alpha = radial * pulsedIntensity + spokes;
    alpha *= 0.6;
    alpha *= smoothstep(u_radius + 0.1, u_radius, dist);

    gl_FragColor = vec4(u_color, alpha);
  }
`;

/**
 * Create holographic surface material for avatar mesh
 */
export function createHoloSurfaceMaterial(
  seasonColor: string = '#7A5CFF',
  accent: string = '#7A5CFF'
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: holoVertexShader,
    fragmentShader: holoFragmentShader,
    uniforms: {
      u_time: { value: 0 },
      u_seasonColor: { value: new THREE.Color(seasonColor) },
      u_accent: { value: new THREE.Color(accent) },
      u_xpPulse: { value: 0 },
      u_levelPulse: { value: 0 },
      u_mood: { value: 0 }, // 0 = calm, 1 = focused, 2 = stressed
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

/**
 * Create aura material for background plane
 */
export function createAuraMaterial(
  color: string = '#7A5CFF',
  intensity: number = 0.8
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: auraVertexShader,
    fragmentShader: auraFragmentShader,
    uniforms: {
      u_time: { value: 0 },
      u_color: { value: new THREE.Color(color) },
      u_intensity: { value: intensity },
      u_radius: { value: 0.45 },
      u_streakSpokes: { value: 0 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

/**
 * Apply holographic material to all meshes in a GLB model
 */
export function applyHoloMaterialToModel(
  model: THREE.Group | THREE.Object3D,
  material: THREE.ShaderMaterial
): void {
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = material;
      child.castShadow = false;
      child.receiveShadow = false;
    }
  });
}

/**
 * Update shader uniforms for animation
 */
export function updateMaterialUniforms(
  material: THREE.ShaderMaterial,
  updates: {
    time?: number;
    xpPulse?: number;
    levelPulse?: number;
    mood?: number;
    seasonColor?: string;
  }
): void {
  if (updates.time !== undefined) {
    material.uniforms.u_time.value = updates.time;
  }
  if (updates.xpPulse !== undefined) {
    material.uniforms.u_xpPulse.value = updates.xpPulse;
  }
  if (updates.levelPulse !== undefined) {
    material.uniforms.u_levelPulse.value = updates.levelPulse;
  }
  if (updates.mood !== undefined) {
    material.uniforms.u_mood.value = updates.mood;
  }
  if (updates.seasonColor !== undefined) {
    material.uniforms.u_seasonColor.value = new THREE.Color(updates.seasonColor);
  }
}
