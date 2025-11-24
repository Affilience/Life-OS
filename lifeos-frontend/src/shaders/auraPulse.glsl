// ONYXOS Aura Pulse Shader
// Radial gradient disc with time-based pulse and streak spokes

varying vec2 vUv;

uniform float u_time;
uniform vec3 u_color;
uniform float u_intensity;
uniform float u_radius;
uniform float u_streakSpokes;

void main() {
  // Center-based radial distance
  vec2 center = vec2(0.5, 0.5);
  float dist = length(vUv - center);

  // Radial gradient with smoothstep falloff
  float radial = 1.0 - smoothstep(0.0, u_radius, dist);

  // Time-based pulse
  float pulse = sin(u_time * 2.0) * 0.5 + 0.5;
  float pulsedIntensity = u_intensity * (0.6 + pulse * 0.4);

  // Streak spokes (radial lines based on streak count)
  float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
  float spokes = 0.0;
  if (u_streakSpokes > 0.0) {
    float spokeCount = floor(u_streakSpokes / 3.0) + 3.0; // 3 base + extras
    float spokePattern = sin(angle * spokeCount + u_time) * 0.5 + 0.5;
    spokes = spokePattern * 0.15 * smoothstep(0.3, 0.6, dist);
  }

  // Combine effects
  float alpha = radial * pulsedIntensity + spokes;
  alpha *= 0.6; // Overall opacity control

  // Soft circular edge
  alpha *= smoothstep(u_radius + 0.1, u_radius, dist);

  gl_FragColor = vec4(u_color, alpha);
}
