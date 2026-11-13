/** Small, local 3D classroom. No models, textures, tracking, or server rendering. */
type Vec = [number, number, number];
const identity = () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
function multiply(a: Float32Array, b: Float32Array) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++) out[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return out;
}
const normalize = (v: Vec): Vec => {
  const l = Math.hypot(...v);
  return v.map((n) => n / l) as Vec;
};
const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
function camera(aspect: number, teacherOnly = false) {
  const eye: Vec = teacherOnly ? [-1.2, 2.3, 6.8] : [4.5, 3.6, 8.5],
    target: Vec = teacherOnly ? [-1.3, 1.7, 0] : [0, 1.7, 0];
  const z = normalize(eye.map((n, i) => n - target[i]) as Vec),
    x = normalize(cross([0, 1, 0], z)),
    y = cross(z, x);
  const view = new Float32Array([
    x[0],
    y[0],
    z[0],
    0,
    x[1],
    y[1],
    z[1],
    0,
    x[2],
    y[2],
    z[2],
    0,
    -x.reduce((n, v, i) => n + v * eye[i], 0),
    -y.reduce((n, v, i) => n + v * eye[i], 0),
    -z.reduce((n, v, i) => n + v * eye[i], 0),
    1,
  ]);
  const f = 1 / Math.tan((34 * Math.PI) / 360),
    near = 0.1,
    far = 60;
  const projection = new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) / (near - far),
    -1,
    0,
    0,
    (2 * far * near) / (near - far),
    0,
  ]);
  return multiply(projection, view);
}
function sphere() {
  const data: number[] = [];
  const point = (a: number, b: number): Vec => [
    Math.sin(a) * Math.cos(b),
    Math.cos(a),
    Math.sin(a) * Math.sin(b),
  ];
  for (let i = 0; i < 10; i++)
    for (let j = 0; j < 16; j++) {
      const a = (i * Math.PI) / 10,
        b = (j * 2 * Math.PI) / 16,
        c = ((i + 1) * Math.PI) / 10,
        d = ((j + 1) * 2 * Math.PI) / 16;
      for (const p of [
        point(a, b),
        point(c, b),
        point(c, d),
        point(a, b),
        point(c, d),
        point(a, d),
      ])
        data.push(...p, ...p);
    }
  return data;
}
function cube() {
  const data: number[] = [];
  const faces: { n: Vec; p: Vec[] }[] = [
    {
      n: [0, 0, 1],
      p: [
        [-1, -1, 1],
        [1, -1, 1],
        [1, 1, 1],
        [-1, 1, 1],
      ],
    },
    {
      n: [0, 0, -1],
      p: [
        [1, -1, -1],
        [-1, -1, -1],
        [-1, 1, -1],
        [1, 1, -1],
      ],
    },
    {
      n: [1, 0, 0],
      p: [
        [1, -1, 1],
        [1, -1, -1],
        [1, 1, -1],
        [1, 1, 1],
      ],
    },
    {
      n: [-1, 0, 0],
      p: [
        [-1, -1, -1],
        [-1, -1, 1],
        [-1, 1, 1],
        [-1, 1, -1],
      ],
    },
    {
      n: [0, 1, 0],
      p: [
        [-1, 1, 1],
        [1, 1, 1],
        [1, 1, -1],
        [-1, 1, -1],
      ],
    },
    {
      n: [0, -1, 0],
      p: [
        [-1, -1, -1],
        [1, -1, -1],
        [1, -1, 1],
        [-1, -1, 1],
      ],
    },
  ];
  for (const face of faces) for (const i of [0, 1, 2, 0, 2, 3]) data.push(...face.p[i], ...face.n);
  return data;
}
export function createClassroom3D(canvas: HTMLCanvasElement, teacherOnly = false) {
  const gl = canvas.getContext('webgl', {
    antialias: true,
    alpha: false,
    powerPreference: 'low-power',
  });
  if (!gl) return null;
  const shader = (type: number, source: string) => {
    const s = gl.createShader(type);
    if (!s) throw new Error('Shader unavailable');
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      throw new Error('Shader unsupported');
    }
    return s;
  };
  const vertex = shader(
    gl.VERTEX_SHADER,
    'attribute vec3 p;attribute vec3 n;uniform mat4 model;uniform mat4 vp;uniform mat3 normal;varying float light;void main(){light=.57+.43*max(dot(normalize(normal*n),normalize(vec3(2.,5.,7.))),0.);gl_Position=vp*model*vec4(p,1.);}',
  );
  const fragment = shader(
    gl.FRAGMENT_SHADER,
    'precision mediump float;uniform vec3 color;varying float light;void main(){gl_FragColor=vec4(color*light,1.);}',
  );
  const program = gl.createProgram();
  if (!program) throw new Error('WebGL program unavailable');
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error('WebGL linking unavailable');
  const p = gl.getAttribLocation(program, 'p'),
    n = gl.getAttribLocation(program, 'n');
  const uniforms = {
    model: gl.getUniformLocation(program, 'model'),
    vp: gl.getUniformLocation(program, 'vp'),
    normal: gl.getUniformLocation(program, 'normal'),
    color: gl.getUniformLocation(program, 'color'),
  };
  const mesh = (data: number[]) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    return { buffer, count: data.length / 6 };
  };
  const meshes = { sphere: mesh(sphere()), cube: mesh(cube()) };
  const skin: Vec = [1, 0.77, 0.55],
    teal: Vec = [0.08, 0.56, 0.59],
    navy: Vec = [0.12, 0.24, 0.36],
    wood: Vec = [0.83, 0.63, 0.39];
  let disposed = false;
  function draw(time = 0, speaking = false) {
    if (disposed || gl!.isContextLost()) return;
    const width = Math.max(
        1,
        Math.round(canvas.clientWidth * Math.min(devicePixelRatio || 1, 1.5)),
      ),
      height = Math.max(1, Math.round(canvas.clientHeight * Math.min(devicePixelRatio || 1, 1.5)));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl!.viewport(0, 0, width, height);
    gl!.clearColor(0.96, 0.95, 0.88, 1);
    gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);
    gl!.enable(gl!.DEPTH_TEST);
    gl!.useProgram(program);
    gl!.uniformMatrix4fv(uniforms.vp, false, camera(width / height, teacherOnly));
    function object(shape: keyof typeof meshes, pos: Vec, size: Vec, color: Vec, angle = 0) {
      const m = identity(),
        s = Math.sin(angle),
        c = Math.cos(angle);
      m[0] = c * size[0];
      m[1] = s * size[0];
      m[4] = -s * size[1];
      m[5] = c * size[1];
      m[10] = size[2];
      m[12] = pos[0];
      m[13] = pos[1];
      m[14] = pos[2];
      gl!.uniformMatrix4fv(uniforms.model, false, m);
      gl!.uniformMatrix3fv(
        uniforms.normal,
        false,
        new Float32Array([
          c / size[0],
          s / size[0],
          0,
          -s / size[1],
          c / size[1],
          0,
          0,
          0,
          1 / size[2],
        ]),
      );
      gl!.uniform3fv(uniforms.color, color);
      const mesh = meshes[shape];
      gl!.bindBuffer(gl!.ARRAY_BUFFER, mesh.buffer);
      gl!.enableVertexAttribArray(p);
      gl!.enableVertexAttribArray(n);
      gl!.vertexAttribPointer(p, 3, gl!.FLOAT, false, 24, 0);
      gl!.vertexAttribPointer(n, 3, gl!.FLOAT, false, 24, 12);
      gl!.drawArrays(gl!.TRIANGLES, 0, mesh.count);
    }
    object('cube', [0, -0.1, 0], [5, 0.1, 3], [0.91, 0.78, 0.56]);
    object('cube', [0, 2.1, -3], [5, 2.2, 0.08], [0.98, 0.87, 0.76]);
    object('cube', [-5, 2.1, 0], [0.08, 2.2, 3], [0.8, 0.9, 0.93]);
    if (!teacherOnly) {
      object('cube', [1.4, 2.4, -2.85], [2, 1.08, 0.08], wood);
      object('cube', [1.4, 2.4, -2.72], [1.88, 0.96, 0.06], [0.12, 0.39, 0.4]);
      for (let col = 0; col < 3; col++)
        for (let row = 0; row < 2; row++)
          object(
            'sphere',
            [0.6 + col * 0.75, 2.15 + row * 0.5, -2.62],
            [0.13, 0.13, 0.035],
            [1, 0.87, 0.34],
          );
    }
    object('cube', [-3.4, 3.05, -2.82], [0.85, 0.72, 0.1], [1, 0.99, 0.89]);
    object('cube', [-3.4, 3.05, -2.68], [0.73, 0.6, 0.05], [0.48, 0.79, 0.93]);
    object('cube', [-3.4, 3.05, -2.57], [0.04, 0.6, 0.025], [1, 0.99, 0.89]);
    object('cube', [-3.4, 3.05, -2.57], [0.73, 0.04, 0.025], [1, 0.99, 0.89]);
    object('cube', [2.75, 0.95, 1.15], [1.05, 0.09, 0.6], wood);
    for (const x of [2, 3.5])
      for (const z of [0.75, 1.5]) object('cube', [x, 0.43, z], [0.065, 0.43, 0.065], navy);
    object('cube', [2.75, 1.1, 1.15], [0.45, 0.055, 0.34], [0.96, 0.51, 0.25]);
    object('cube', [2.67, 1.21, 1.15], [0.39, 0.05, 0.3], [0.25, 0.65, 0.8]);
    const x = -1.55,
      z = 0.65;
    object('sphere', [x, 0.025, z], [0.7, 0.018, 0.47], [0.62, 0.67, 0.55]);
    for (const side of [-1, 1]) {
      object('sphere', [x + side * 0.23, 0.64, z], [0.17, 0.58, 0.18], navy);
      object('sphere', [x + side * 0.23, 0.12, z + 0.13], [0.22, 0.12, 0.34], [0.11, 0.18, 0.27]);
    }
    object('sphere', [x, 1.66, z], [0.59, 0.72, 0.3], teal);
    object('cube', [x, 1.15, z], [0.45, 0.12, 0.27], teal);
    object('sphere', [x - 0.62, 1.57, z], [0.16, 0.51, 0.16], teal, -0.14);
    object('sphere', [x - 0.68, 1.07, z], [0.14, 0.17, 0.14], skin);
    const wave = speaking ? Math.sin(time * 0.004) * 0.1 : 0;
    object('sphere', [x + 0.59, 1.95, z], [0.15, 0.4, 0.15], teal, -0.9);
    object('sphere', [x + 0.91, 2.23 + wave, z], [0.13, 0.34, 0.13], skin, 0.36);
    object('sphere', [x + 1.02, 2.51 + wave, z], [0.15, 0.16, 0.14], skin);
    object('sphere', [x, 2.3, z], [0.16, 0.2, 0.16], skin);
    object('sphere', [x, 2.73, z], [0.43, 0.48, 0.38], skin);
    object('sphere', [x, 3.02, z - 0.045], [0.45, 0.28, 0.39], navy);
    object('sphere', [x - 0.34, 2.89, z + 0.02], [0.12, 0.3, 0.31], navy);
    for (const side of [-1, 1]) {
      object('sphere', [x + side * 0.14, 2.77, z + 0.36], [0.037, 0.047, 0.025], navy);
      object('sphere', [x + side * 0.24, 2.59, z + 0.33], [0.07, 0.035, 0.018], [0.94, 0.53, 0.4]);
    }
    for (let i = -2; i <= 2; i++)
      object(
        'sphere',
        [x + i * 0.043, 2.52 + i * i * 0.009, z + 0.366],
        [0.031, 0.017, 0.014],
        [0.55, 0.29, 0.22],
      );
  }
  return {
    draw,
    dispose() {
      disposed = true;
      for (const mesh of Object.values(meshes)) gl.deleteBuffer(mesh.buffer);
      gl.deleteProgram(program);
    },
  };
}
