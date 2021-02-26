var CustomElement = require("../customElement");

const POLYS = [
  -1, 1,
  1, 1,
  1, -1,
  -1, 1,
  1, -1,
  -1, -1
];

class ShaderBox extends CustomElement {
  constructor() {
    super();
    var gl = this.gl = this.elements.canvas.getContext("webgl");
    this.observer = new IntersectionObserver(this.onIntersection);
    this.observer.observe(this);

    this.visible = false;
    this.raf = null;
    this.program = null;

    var vertex = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex, `
    attribute vec2 coord;
    void main() {
      gl_Position = vec4(coord, 0.0, 1.0);
    }
    `);
    gl.compileShader(vertex);
    gl.vertex = vertex;

    this.requesting = null;

    this.buffer = gl.createBuffer();
  }

  static get boundMethods() {
    return [
      "onIntersection",
      "tick"
    ];
  }

  static get observedAttributes() {
    return [
      "src"
    ]
  }

  static get mirroredProps() {
    return [
      "src"
    ]
  }

  attributeChangedCallback(attr, was, value) {
    switch (attr) {
      case "src":
        if (was == value) return;
        if (this.requesting) {
          this.requesting.abort();
        }
        var options = {};
        if ("AbortController" in window) {
          this.requesting = new AbortController();
          options.signal = this.requesting.signal;
        }
        fetch(value, options).then(async response => {
          this.requesting = null;
          var source = await response.text();
          this.setShader(source);
        }).catch(err => {});
        break;
    }
  }

  setShader(shader) {
    var gl = this.gl;
    var fragment = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragment, shader);
    gl.compileShader(fragment);

    var error = gl.getShaderInfoLog(fragment);
    if (error) {
      console.log(error);
      return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, fragment);
    gl.attachShader(program, gl.vertex);
    gl.linkProgram(program);
    gl.useProgram(program);
    
    // attributes and uniforms
    gl.program = program;
    gl.attributes = {
      coord: 0
    };
    for (var a in gl.attributes) gl.attributes[a] = gl.getAttribLocation(program, a);
    gl.uniforms = {
      u_time: 0,
      u_resolution: 0
    };
    for (var u in gl.uniforms) gl.uniforms[u] = gl.getUniformLocation(program, u);

    if (this.raf) cancelAnimationFrame(this.raf);
    this.tick();
  }

  setUniform(name, ...values) {
    var gl = this.gl;
    if (!gl.uniforms[name]) {
      gl.uniforms[name] = gl.getUniformLocation(gl.program, name);
    }
    var method = `uniform${values.length}f`;
    gl[method](gl.uniforms[name], ...values);
  }

  onIntersection([e]) {
    this.visible = e.isIntersecting;
    if (this.visible) this.tick();
  }

  tick(t) {
    if (!this.visible) return;
    if (this.gl.program) {
      this.render(t);
    }
    this.raf = requestAnimationFrame(this.tick);
  }

  render(t) {
    var { buffer, gl } = this;
    // require setShader() to be called
    if (!gl.program) return;
    var canvas = gl.canvas;
    gl.enableVertexAttribArray(gl.uniforms.coords);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(POLYS), gl.STATIC_DRAW);
    gl.vertexAttribPointer(gl.uniforms.coords, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1f(gl.uniforms.u_time, t + 12581372.5324);
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(gl.uniforms.u_resolution, canvas.width, canvas.height);
    gl.clearColor(0, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, POLYS.length / 2);
  }

  static get template() {
    return require("./_shader-box.html");
  }
}

ShaderBox.define("shader-box");