precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

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

vec3 rgb255(float r, float g, float b) {
  return vec3(r / 255.0, g / 255.0, b / 255.0);
}

void main() {
  vec2 screenspace = (gl_FragCoord.xy / u_resolution.xy);
  vec2 uv = screenspace * 2.0 - 1.0;
  float aspect = u_resolution.x / u_resolution.y;
  uv.y /= aspect;

  vec3 CADET = rgb255(95.0, 158.0, 160.0);
  vec3 OLIVE = rgb255(85.0, 107.0, 47.0);
  vec3 SALMON = rgb255(250.0, 128.0, 114.0);
  vec3 THISTLE = rgb255(216.0, 191.0, 216.0);
  vec3 WHEAT = rgb255(245.0, 222.0, 179.0);

  vec4 color = vec4(0.2, 0.2, 0.2, 1.0);

  float moment = u_time * .0001;
  float co = cos(moment);
  float si = sin(moment);
  float co2 = cos(moment * 1.4);
  float si2 = sin(moment * 1.4);

  float c = blob(uv + vec2(si2, co * .3), .5, .05);
  color = merge(color, vec4(SALMON, .2 * c));

  c = blob(uv + vec2(-.8, -.7) + vec2(co * .1, si2 * .4), .3, .05);
  color = merge(color, vec4(THISTLE, .2 * c));

  c = blob(uv + vec2(.1, .8) + vec2(co * .8, co * .3), .6, .05);
  color = merge(color, vec4(WHEAT, .2 * c));

  c = blob(uv + vec2(.4, -.3) + vec2(si * .2, si * .2), .6, .05);
  color = merge(color, vec4(OLIVE, .2 * c));

  c = blob(uv + vec2(0.8, -.3) + vec2(co, si), .5, .1);
  color = merge(color, vec4(CADET, .2 * c));

  c = blob(uv + vec2(si, co), .5, .05);
  color = merge(color, vec4(SALMON, .2 * c));

  c = blob(uv + vec2(co2 * .1, si), .3, .05);
  color = merge(color, vec4(THISTLE, .2 * c));

  c = blob(uv + vec2(co * .1, co2 * .1), .6, .05);
  color = merge(color, vec4(WHEAT, .2 * c));

  c = blob(uv + vec2(si2 * .6, si2 * .6), .6, .05);
  color = merge(color, vec4(OLIVE, .2 * c));

  c = blob(uv + vec2(co2, si2 * 2.0), .5, .1);
  color = merge(color, vec4(CADET, .2 * c));

  color += random(uv * u_time * .0001) * .1;
  // color = mix(color, vec4(.2, .2, .2, 1.0), .5);

  gl_FragColor = color;
}
