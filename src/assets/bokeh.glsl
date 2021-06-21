precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

// custom uniforms
uniform vec3 u_background;

// generates pseudo-random noise from an x/y value
// Not really random--calling with the same input
// returns the same output
float random(vec2 seed) {
  return fract(sin(dot(seed, vec2(12.9898,78.233))) * 43758.5453123);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float fill(float v, float t) {
  return 1.0 - step(t, v);
}

float stroke(float v, float t, float w) {
  return 1.0 - step(w * .5, abs(v - t));
}

vec2 rotate(vec2 coords, float theta) {
  mat2 m = mat2(cos(theta), -sin(theta), sin(theta), cos(theta));
  return m * coords;
}

float add(float a, float b) {
  return clamp(a + b, 0.0, 1.0);
}

float subtract(float a, float b) {
  return clamp(a - b, 0.0, 1.0);
}

float intersect(float a, float b) {
  return step(2.0, a + b);
}

float difference(float a, float b) {
  return mix(a, 1.0 - a, b);
}

float line(float v, float f) {
  return abs(v - f);
}

float circle(vec2 coords) {
  return length(coords);
}

float blob(vec2 coords, float r, float blur) {
  float c = circle(coords);
  return 1.0 - smoothstep(r - blur, r + blur, c);
}

vec4 merge(vec4 lower, vec4 upper) {
  vec3 hue = mix(lower.rgb, upper.rgb, upper.a);
  float alpha = max(lower.a, upper.a);
  return vec4(hue, alpha);
}

vec3 rgb255(int r, int g, int b) {
  return vec3(float(r) / 255.0, float(g) / 255.0, float(b) / 255.0);
}

void main() {
  vec2 screenspace = (gl_FragCoord.xy / u_resolution.xy);
  vec2 uv = screenspace * 2.0 - 1.0;
  float aspect = u_resolution.x / u_resolution.y;
  uv.y /= aspect;

  vec3 PAINT_A = rgb255(249, 143, 78);
  vec3 PAINT_B = rgb255(196, 122, 205);
  vec3 PAINT_C = rgb255(129, 201, 217);
  vec3 PAINT_D = rgb255(255, 223, 97);
  vec3 PAINT_E = rgb255(117, 228, 58);

  float ALPHA = .5;

  float moment = (u_time + 90000.0) * .0001;
  float co = cos(moment);
  float si = sin(moment);
  float co2 = cos(moment * 1.4);
  float si2 = sin(moment * 1.4);

  vec4 color = vec4(rgb255(250,173,125), 1.0);
  // vec4 color = vec4(u_background, 1.0);

  // gradient fill
  color = mix(color, vec4(rgb255(205, 142, 212), 1.0), length(uv) * co);

  float c = blob(uv + vec2(si2, co * .3), .5, .05);
  color = merge(color, vec4(PAINT_B, ALPHA * c));

  c = blob(uv + vec2(-.8, -.7) + vec2(co * .1, si2 * .4), .3, .05);
  color = merge(color, vec4(PAINT_D, ALPHA * c));

  c = blob(uv + vec2(.6, -.8) + vec2(co * .8, co * .3), .6, .05);
  color = merge(color, vec4(PAINT_E, ALPHA * c));

  c = blob(uv + vec2(.4, -.3) + vec2(si * .2, si * .2), .6, .05);
  color = merge(color, vec4(PAINT_C, ALPHA * c));

  c = blob(uv + vec2(0.8, -.3) + vec2(co, si), .5, .1);
  color = merge(color, vec4(PAINT_A, ALPHA * c));

  c = blob(uv + vec2(si, co), .5, .05);
  color = merge(color, vec4(PAINT_A, ALPHA * c));

  c = blob(uv + vec2(co2 * .1, si), .3, .05);
  color = merge(color, vec4(PAINT_D, ALPHA * c));

  c = blob(uv + vec2(co * .1, co2 * .1), .6, .05);
  color = merge(color, vec4(PAINT_B, ALPHA * c));

  c = blob(uv + vec2(si2 * .6, si2 * .6), .6, .05);
  color = merge(color, vec4(PAINT_E, ALPHA * c));

  c = blob(uv + vec2(co2, si2 * 2.0), .5, .1);
  color = merge(color, vec4(PAINT_C, ALPHA * c));

  vec2 grainRez = u_resolution.xy / vec2(3.0, 5.0);
  vec2 grainCells = floor(uv * grainRez) / grainRez;
  float grainTime = mod(moment, 1000.0);
  float grain = smoothstep(.5, 1.0, random(grainCells * grainTime)) * .05;
  color -= grain;

  gl_FragColor = color;
}
