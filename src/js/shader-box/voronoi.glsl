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

// given a "cell" onscreen, where is its associated voronoi point?
vec2 cellPoint(vec2 cell) {
  float r = random(cell);
  return vec2(
    (sin(u_time * .0005 * r) + 1.0) / 2.0,
    (cos(u_time * .002 * r) + 1.0) / 2.0
  ) * .5;
}

// given a cell, what color should we assign?
vec3 cellColor(vec2 cell) {
  float r = random(cell);
  float s = sin(u_time / 4513.0) / 2.0 + .5;
  return hsv2rgb(vec3(
    sin(u_time / 7947.0),
    r * .3 + .3 * s,
    r * .6 + .3
  ));
}

void main() {
  float cell_count = 36.0;
  vec3 low = vec3(0.0, 0.4, 0.2);
  vec3 high = vec3(0.0, 0.8, 0.6);
  vec2 coord = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  coord.x *= aspect;
  
  // here we split the screen into cell_count rows and columns  
  vec2 cell_coord = coord * cell_count;
  vec2 cell = floor(cell_coord);
  vec2 inner = fract(cell_coord);
  vec2 point = cellPoint(cell);
  // find the two closest points
  // all pixels are "won" by the closest point
  // then we'll use that to apply a color
  // using the next-closest, we can create boundary effects
  float closest = 3.0;
  float next = 3.0;
  vec2 winner = cell;
  for (float i = -1.0; i <= 1.0; i += 1.0) {
    for (float j = -1.0; j <= 1.0; j += 1.0) {
      float d = distance(inner, cellPoint(cell + vec2(i, j)) + vec2(i, j));
      if (d < closest) {
        next = closest;
        winner = cell + vec2(i, j);
        closest = d;
      }
    }
  }
  // normalize the distance so that the boundary of the poly is always 0.5
  float shade = closest / (closest + next);
  // apply a sharp step if we want a boundary
  float wall = 1.0 - step(shade, .42);
  vec3 pigment = cellColor(winner);
  // gl_FragColor = vec4(mix(pigment, vec3(0.0), wall), 1.0);
  // flat-shaded variant:
  gl_FragColor = vec4(pigment, 1.0);
}
