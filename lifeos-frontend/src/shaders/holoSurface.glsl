// ONYXOS Holographic Surface Shader
// Premium biotech aesthetic with fresnel rim, scanlines, and noise

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

uniform float u_time;
uniform vec3 u_seasonColor;
uniform vec3 u_accent;
uniform float u_xpPulse;
uniform float u_levelPulse;
uniform float u_mood;

// Simplex noise for organic texture
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
  // Fresnel effect (Schlick approximation)
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);

  // Scanlines based on view-projected Y
  float scanline = sin(vViewPosition.y * 20.0 + u_time * 2.0) * 0.5 + 0.5;
  float scanlineIntensity = mix(0.1, 0.25, u_mood / 2.0); // stressed increases scanlines
  scanline = mix(1.0, scanline, scanlineIntensity);

  // Low-frequency noise for "living" digital texture
  vec2 noiseCoord = vUv * 3.0 + u_time * 0.1;
  float noise = snoise(noiseCoord) * 0.5 + 0.5;
  float noiseIntensity = mix(0.15, 0.05, u_mood == 0.0 ? 1.0 : 0.0); // calm reduces noise
  noise = mix(1.0, noise, noiseIntensity);

  // Mix season color with accent based on fresnel
  vec3 rimColor = mix(u_seasonColor, u_accent, 0.6);
  vec3 baseColor = mix(vec3(0.05, 0.05, 0.08), rimColor, fresnel * 0.8);

  // XP pulse ripple (travels across surface)
  float ripple = sin(length(vUv - 0.5) * 10.0 - u_time * 5.0) * 0.5 + 0.5;
  float xpEffect = u_xpPulse * ripple * 0.3;

  // Level pulse (overall glow crescendo)
  float levelGlow = u_levelPulse * 0.5;

  // Inner glow (muted)
  float innerGlow = pow(fresnel, 2.0) * 0.3;

  // Combine effects
  vec3 finalColor = baseColor;
  finalColor *= scanline * noise;
  finalColor += rimColor * (fresnel * 0.4 + xpEffect + levelGlow);
  finalColor += u_accent * innerGlow;

  // Clamp to keep it elegant
  finalColor = clamp(finalColor, 0.0, 1.2);

  // Transparency based on fresnel for glass effect
  float alpha = mix(0.7, 0.95, fresnel);

  gl_FragColor = vec4(finalColor, alpha);
}
