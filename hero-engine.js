(() => {
  'use strict';

  const root = document.querySelector('[data-decision-chassis]');
  if (!root) return;

  const canvas = root.querySelector('[data-chassis-canvas]');
  const replay = root.querySelector('[data-chassis-replay]');
  const announcer = root.querySelector('[data-chassis-announcement]');
  const stages = [...root.querySelectorAll('[data-chassis-stage]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  const lightweight = window.matchMedia('(max-width: 900px)');

  let controller = null;

  function setStage(index, settled = false) {
    stages.forEach((stage, i) => {
      stage.classList.toggle('is-active', !settled && i === index);
      stage.classList.toggle('is-complete', settled || i < index);
    });
  }

  function announce(message) {
    if (announcer) announcer.textContent = message;
  }

  function useFallback() {
    root.dataset.renderer = 'semantic-svg';
    root.classList.add('is-fallback');
    root.classList.remove('is-webgl');

    let timerA;
    let timerB;
    let timerC;

    const play = (shouldAnnounce = true) => {
      clearTimeout(timerA); clearTimeout(timerB); clearTimeout(timerC);
      root.classList.remove('is-running', 'is-settled');
      setStage(0);
      void root.offsetWidth;
      root.classList.add('is-running');
      if (reduceMotion.matches) {
        root.classList.remove('is-running');
        root.classList.add('is-settled');
        setStage(2, true);
        if (shouldAnnounce) announce('Decision Chassis resolved. Standardized signals are aligned into a decision-ready operating frame.');
        return;
      }
      timerA = setTimeout(() => setStage(1), 700);
      timerB = setTimeout(() => setStage(2), 1650);
      timerC = setTimeout(() => {
        root.classList.remove('is-running');
        root.classList.add('is-settled');
        setStage(2, true);
        if (shouldAnnounce) announce('Decision Chassis resolved. Standardized signals are aligned into a decision-ready operating frame.');
      }, 2850);
    };

    replay?.addEventListener('click', () => play(true));
    play(false);
  }

  function shouldUseFallback() {
    return reduceMotion.matches || coarsePointer.matches || lightweight.matches || !canvas || !window.WebGL2RenderingContext;
  }

  if (shouldUseFallback()) {
    useFallback();
    return;
  }

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: true,
    depth: true,
    powerPreference: 'high-performance',
    premultipliedAlpha: false
  });

  if (!gl) {
    useFallback();
    return;
  }

  root.dataset.renderer = 'webgl2';
  root.classList.add('is-webgl');

  const vertexCommon = `
    precision highp float;
    uniform vec2 uViewport;
    uniform float uYaw;
    uniform float uPitch;
    uniform float uScale;

    mat3 rotY(float a){
      float c=cos(a), s=sin(a);
      return mat3(c,0.0,-s, 0.0,1.0,0.0, s,0.0,c);
    }
    mat3 rotX(float a){
      float c=cos(a), s=sin(a);
      return mat3(1.0,0.0,0.0, 0.0,c,s, 0.0,-s,c);
    }
    vec4 project(vec3 p){
      p = rotX(uPitch) * rotY(uYaw) * p;
      p.z -= 7.3;
      float perspective = 2.9 / max(2.8, -p.z);
      float aspect = uViewport.x / max(1.0, uViewport.y);
      return vec4((p.x * perspective / aspect) * uScale, (p.y * perspective) * uScale, (p.z + 7.3) / 10.0, 1.0);
    }
  `;

  const lineVS = `#version 300 es
    ${vertexCommon}
    in vec3 aSegmentStart;
    in vec3 aSegmentEnd;
    in float aEndpoint;
    in float aOrder;
    in vec3 aColor;
    uniform float uProgress;
    out vec3 vColor;
    out float vAlpha;
    void main(){
      float phase = smoothstep(aOrder, min(1.0, aOrder + 0.18), uProgress);
      vec3 p = mix(aSegmentStart, aSegmentEnd, aEndpoint * phase);
      gl_Position = project(p);
      vColor = aColor;
      vAlpha = smoothstep(aOrder - 0.03, aOrder + 0.02, uProgress) * (0.30 + 0.70 * phase);
    }
  `;

  const lineFS = `#version 300 es
    precision highp float;
    in vec3 vColor;
    in float vAlpha;
    out vec4 outColor;
    void main(){ outColor = vec4(vColor, vAlpha); }
  `;

  const particleVS = `#version 300 es
    ${vertexCommon}
    in vec3 aStart;
    in vec3 aTarget;
    in float aDelay;
    in float aSize;
    in vec3 aColor;
    uniform float uProgress;
    uniform float uPulse;
    out vec3 vColor;
    out float vAlpha;
    void main(){
      float t = smoothstep(aDelay, min(1.0, aDelay + 0.42), uProgress);
      t = 1.0 - pow(1.0 - t, 3.0);
      vec3 p = mix(aStart, aTarget, t);
      float pulseBoost = 1.0 - smoothstep(0.0, 0.55, abs(aTarget.x - uPulse));
      gl_Position = project(p);
      gl_PointSize = (aSize + pulseBoost * 5.0) * (0.72 + 0.28 * uScale);
      vColor = mix(aColor, vec3(0.27,0.93,0.86), pulseBoost * 0.75);
      vAlpha = mix(0.22, 0.86, t) + pulseBoost * 0.48;
    }
  `;

  const particleFS = `#version 300 es
    precision highp float;
    in vec3 vColor;
    in float vAlpha;
    out vec4 outColor;
    void main(){
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      float core = 1.0 - smoothstep(0.08, 0.48, d);
      float halo = (1.0 - smoothstep(0.15, 0.5, d)) * 0.42;
      float alpha = (core + halo) * vAlpha;
      if(alpha < 0.015) discard;
      outColor = vec4(vColor, alpha);
    }
  `;

  const pulseVS = `#version 300 es
    ${vertexCommon}
    uniform vec3 uPulsePosition;
    uniform float uPulseOpacity;
    out float vOpacity;
    void main(){
      gl_Position = project(uPulsePosition);
      gl_PointSize = 42.0 * (0.72 + 0.28 * uScale);
      vOpacity = uPulseOpacity;
    }
  `;

  const pulseFS = `#version 300 es
    precision highp float;
    in float vOpacity;
    out vec4 outColor;
    void main(){
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      float core = 1.0 - smoothstep(0.0, 0.13, d);
      float halo = (1.0 - smoothstep(0.08, 0.5, d)) * 0.42;
      float alpha = (core + halo) * vOpacity;
      if(alpha < 0.01) discard;
      outColor = vec4(0.27,0.93,0.86,alpha);
    }
  `;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || 'Unknown shader error';
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  function program(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(p) || 'Unknown link error';
      gl.deleteProgram(p);
      throw new Error(message);
    }
    return p;
  }

  let lineProgram;
  let particleProgram;
  let pulseProgram;
  try {
    lineProgram = program(lineVS, lineFS);
    particleProgram = program(particleVS, particleFS);
    pulseProgram = program(pulseVS, pulseFS);
  } catch (error) {
    console.warn('Decision Chassis renderer unavailable; using semantic SVG fallback.', error);
    useFallback();
    return;
  }

  const C = {
    blue: [0.18, 0.55, 1.0],
    sky: [0.38, 0.72, 1.0],
    cyan: [0.26, 0.88, 0.82],
    violet: [0.47, 0.40, 1.0],
    quiet: [0.23, 0.42, 0.67]
  };

  const segments = [];
  const addSegment = (a, b, color, order) => segments.push({ a, b, color, order });

  // Floor and horizon structure: faint evidence environment.
  [-1.5, -0.75, 0, 0.75, 1.5].forEach((z, i) => addSegment([-3.25, -0.06, z], [3.25, -0.06, z], C.quiet, 0.03 + i * 0.015));
  [-2.4, -1.2, 0, 1.2, 2.4].forEach((x, i) => addSegment([x, -0.06, -1.85], [x, -0.06, 1.85], C.quiet, 0.035 + i * 0.015));

  // Decision Chassis: two longitudinal rails, cross-members, braces, and raised strategy deck.
  addSegment([-2.55, 0, -1.0], [2.55, 0, -1.0], C.blue, 0.18);
  addSegment([-2.55, 0, 1.0], [2.55, 0, 1.0], C.sky, 0.20);
  addSegment([-2.35, 0.08, 0], [2.35, 0.08, 0], C.cyan, 0.24);
  [-1.85, -0.7, 0.65, 1.85].forEach((x, i) => addSegment([x, 0, -1.0], [x, 0, 1.0], i % 2 ? C.sky : C.blue, 0.30 + i * 0.045));
  addSegment([-2.55, 0, -1.0], [-1.85, 0, 1.0], C.violet, 0.37);
  addSegment([-1.85, 0, 1.0], [-0.7, 0, -1.0], C.blue, 0.41);
  addSegment([-0.7, 0, -1.0], [0.65, 0, 1.0], C.cyan, 0.45);
  addSegment([0.65, 0, 1.0], [1.85, 0, -1.0], C.blue, 0.49);
  addSegment([1.85, 0, -1.0], [2.55, 0, 1.0], C.violet, 0.53);

  const upper = [
    [-1.28, 0.76, -0.58], [-1.28, 0.76, 0.58],
    [1.28, 0.76, -0.58], [1.28, 0.76, 0.58]
  ];
  addSegment(upper[0], upper[2], C.sky, 0.58);
  addSegment(upper[1], upper[3], C.cyan, 0.60);
  addSegment(upper[0], upper[1], C.blue, 0.62);
  addSegment(upper[2], upper[3], C.blue, 0.64);
  addSegment([-1.85, 0, -1.0], upper[0], C.violet, 0.66);
  addSegment([-1.85, 0, 1.0], upper[1], C.sky, 0.68);
  addSegment([1.85, 0, -1.0], upper[2], C.sky, 0.70);
  addSegment([1.85, 0, 1.0], upper[3], C.violet, 0.72);
  addSegment([-1.28, 0.76, -0.58], [1.28, 0.76, 0.58], C.cyan, 0.74);
  addSegment([-1.28, 0.76, 0.58], [1.28, 0.76, -0.58], C.cyan, 0.76);

  const lineData = [];
  segments.forEach(({ a, b, color, order }) => {
    lineData.push(...a, ...b, 0, order, ...color);
    lineData.push(...a, ...b, 1, order, ...color);
  });

  const lineStride = 11;
  const lineBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineData), gl.STATIC_DRAW);

  function sampleSegment(segment, t) {
    return [
      segment.a[0] + (segment.b[0] - segment.a[0]) * t,
      segment.a[1] + (segment.b[1] - segment.a[1]) * t,
      segment.a[2] + (segment.b[2] - segment.a[2]) * t
    ];
  }

  // Use chassis segments only for final particle targets; floor is line-only.
  const targetSegments = segments.slice(10);
  const particleData = [];
  const count = 760;
  for (let i = 0; i < count; i++) {
    const segment = targetSegments[i % targetSegments.length];
    const t = ((i * 0.61803398875) % 1);
    const target = sampleSegment(segment, t);
    const jitter = ((i * 17) % 11) / 11 - 0.5;
    target[1] += jitter * 0.025;
    target[2] += ((((i * 29) % 13) / 13) - 0.5) * 0.035;

    // Raw signals begin as a fragmented cloud, biased to the left and above the chassis.
    const start = [
      -3.5 + ((i * 73) % 100) / 100 * 2.0,
      -1.55 + ((i * 47) % 100) / 100 * 3.6,
      -2.35 + ((i * 31) % 100) / 100 * 4.7
    ];
    const delay = 0.04 + ((i * 37) % 100) / 100 * 0.34;
    const size = 2.0 + ((i * 19) % 7) * 0.55;
    const color = i % 7 === 0 ? C.cyan : i % 5 === 0 ? C.violet : i % 3 === 0 ? C.sky : C.blue;
    particleData.push(...start, ...target, delay, size, ...color);
  }

  const particleStride = 12;
  const particleBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particleData), gl.STATIC_DRAW);

  const lineUniforms = {
    viewport: gl.getUniformLocation(lineProgram, 'uViewport'),
    yaw: gl.getUniformLocation(lineProgram, 'uYaw'),
    pitch: gl.getUniformLocation(lineProgram, 'uPitch'),
    scale: gl.getUniformLocation(lineProgram, 'uScale'),
    progress: gl.getUniformLocation(lineProgram, 'uProgress')
  };
  const particleUniforms = {
    viewport: gl.getUniformLocation(particleProgram, 'uViewport'),
    yaw: gl.getUniformLocation(particleProgram, 'uYaw'),
    pitch: gl.getUniformLocation(particleProgram, 'uPitch'),
    scale: gl.getUniformLocation(particleProgram, 'uScale'),
    progress: gl.getUniformLocation(particleProgram, 'uProgress'),
    pulse: gl.getUniformLocation(particleProgram, 'uPulse')
  };
  const pulseUniforms = {
    viewport: gl.getUniformLocation(pulseProgram, 'uViewport'),
    yaw: gl.getUniformLocation(pulseProgram, 'uYaw'),
    pitch: gl.getUniformLocation(pulseProgram, 'uPitch'),
    scale: gl.getUniformLocation(pulseProgram, 'uScale'),
    position: gl.getUniformLocation(pulseProgram, 'uPulsePosition'),
    opacity: gl.getUniformLocation(pulseProgram, 'uPulseOpacity')
  };

  function enableAttribute(programHandle, name, size, stride, offset) {
    const location = gl.getAttribLocation(programHandle, name);
    if (location < 0) return;
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride * 4, offset * 4);
  }

  let width = 1;
  let height = 1;
  let yaw = -0.42;
  let pitch = 0.42;
  let targetYaw = yaw;
  let targetPitch = pitch;
  let progress = 0;
  let pulseX = -2.35;
  let pulseOpacity = 0;
  let startTime = 0;
  let running = false;
  let raf = 0;
  let pointerDirty = false;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(1.75, window.devicePixelRatio || 1);
    width = Math.max(1, Math.round(rect.width * dpr));
    height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    render();
  }

  function setShared(programHandle, uniforms) {
    gl.uniform2f(uniforms.viewport, width, height);
    gl.uniform1f(uniforms.yaw, yaw);
    gl.uniform1f(uniforms.pitch, pitch);
    gl.uniform1f(uniforms.scale, Math.min(1.18, Math.max(0.88, width / 1050)));
  }

  function render() {
    if (!gl || gl.isContextLost()) return;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(false);

    gl.useProgram(lineProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    enableAttribute(lineProgram, 'aSegmentStart', 3, lineStride, 0);
    enableAttribute(lineProgram, 'aSegmentEnd', 3, lineStride, 3);
    enableAttribute(lineProgram, 'aEndpoint', 1, lineStride, 6);
    enableAttribute(lineProgram, 'aOrder', 1, lineStride, 7);
    enableAttribute(lineProgram, 'aColor', 3, lineStride, 8);
    setShared(lineProgram, lineUniforms);
    gl.uniform1f(lineUniforms.progress, progress);
    gl.lineWidth(1);
    gl.drawArrays(gl.LINES, 0, lineData.length / lineStride);

    gl.useProgram(particleProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
    enableAttribute(particleProgram, 'aStart', 3, particleStride, 0);
    enableAttribute(particleProgram, 'aTarget', 3, particleStride, 3);
    enableAttribute(particleProgram, 'aDelay', 1, particleStride, 6);
    enableAttribute(particleProgram, 'aSize', 1, particleStride, 7);
    enableAttribute(particleProgram, 'aColor', 3, particleStride, 8);
    setShared(particleProgram, particleUniforms);
    gl.uniform1f(particleUniforms.progress, progress);
    gl.uniform1f(particleUniforms.pulse, pulseX);
    gl.drawArrays(gl.POINTS, 0, count);

    if (pulseOpacity > 0.001) {
      gl.useProgram(pulseProgram);
      setShared(pulseProgram, pulseUniforms);
      gl.uniform3f(pulseUniforms.position, pulseX, 0.13, 0);
      gl.uniform1f(pulseUniforms.opacity, pulseOpacity);
      gl.drawArrays(gl.POINTS, 0, 1);
    }
  }

  function ease(t) {
    return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 4);
  }

  function animate(now) {
    const elapsed = now - startTime;
    const build = Math.min(1, elapsed / 2200);
    progress = ease(build);

    if (elapsed < 760) setStage(0);
    else if (elapsed < 2200) setStage(1);
    else if (elapsed < 3400) setStage(2);

    const pulseT = Math.min(1, Math.max(0, (elapsed - 2180) / 1050));
    pulseX = -2.35 + 4.7 * ease(pulseT);
    pulseOpacity = pulseT <= 0 ? 0 : pulseT < 0.12 ? pulseT / 0.12 : 1;

    yaw += (targetYaw - yaw) * 0.075;
    pitch += (targetPitch - pitch) * 0.075;
    render();

    if (elapsed < 3450 || Math.abs(targetYaw - yaw) > 0.001 || Math.abs(targetPitch - pitch) > 0.001) {
      raf = requestAnimationFrame(animate);
    } else {
      running = false;
      root.classList.remove('is-running');
      root.classList.add('is-settled');
      setStage(2, true);
      announce('Decision Chassis resolved. Fragmented operating signals are aligned into a decision-ready frame.');
    }
  }

  function play(shouldAnnounce = true) {
    cancelAnimationFrame(raf);
    root.classList.remove('is-settled');
    root.classList.add('is-running');
    progress = 0;
    pulseX = -2.35;
    pulseOpacity = 0;
    startTime = performance.now();
    running = true;
    setStage(0);
    if (shouldAnnounce) announce('Decision Chassis rebuilding: standardizing signals, aligning operating load, and releasing a decision.');
    raf = requestAnimationFrame(animate);
  }

  replay?.addEventListener('click', () => play(true));

  root.addEventListener('pointermove', (event) => {
    if (coarsePointer.matches) return;
    const rect = root.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    targetYaw = -0.42 + nx * 0.14;
    targetPitch = 0.42 - ny * 0.08;
    if (!running && !pointerDirty) {
      pointerDirty = true;
      requestAnimationFrame(() => {
        pointerDirty = false;
        yaw += (targetYaw - yaw) * 0.55;
        pitch += (targetPitch - pitch) * 0.55;
        render();
      });
    }
  });

  root.addEventListener('pointerleave', () => {
    targetYaw = -0.42;
    targetPitch = 0.42;
    if (!running) {
      yaw = targetYaw;
      pitch = targetPitch;
      render();
    }
  });

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    cancelAnimationFrame(raf);
    useFallback();
  }, { once: true });

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();
  play(false);

  controller = { play, resize };
  window.__foundationDecisionChassis = controller;
})();
