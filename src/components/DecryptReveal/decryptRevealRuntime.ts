import {
  DECRYPT_REVEAL_CELL_FRAGMENT_SHADER,
  DECRYPT_REVEAL_MAIN_FRAGMENT_SHADER,
  DECRYPT_REVEAL_VERTEX_SHADER,
} from '../../glsl';
import type {
  DecryptRevealElements,
  DecryptRevealInstance,
  DecryptRevealOptions,
} from './types';

const PRINTABLE_ASCII = Array.from({ length: 95 }, (_, i) =>
  String.fromCharCode(32 + i),
).join('');

const DEFAULTS: Required<DecryptRevealOptions> = {
  radius: 400,
  softness: 0.5,
  cell: 10,
  aspect: 0.75,
  charset: PRINTABLE_ASCII,
  colored: 1,
  color: '#4ade80',
  brightness: 1,
  legibility: 1,
  contrast: 1,
  exposure: 1,
  scramble: 0.1,
  scrambleSpeed: 6,
  edgeWidth: 0.2,
  edgeFlicker: 1,
  edgeGlow: 2,
  edgeTint: 0.75,
  aberration: 10,
  passthrough: 0.15,
  threshold: 0.025,
  background: '#000000',
  smoothing: 0.2,
};

const ATLAS_CELL = 64;
const ATLAS_PAD = 8;
const MAX_GLYPHS = 255;

const INNER_CIRCLES: Array<[number, number]> = [
  [0.28, 0.26],
  [0.72, 0.14],
  [0.28, 0.56],
  [0.72, 0.44],
  [0.28, 0.86],
  [0.72, 0.74],
];

type PaintableCanvas = HTMLCanvasElement & {
  onpaint?: (() => void) | null;
  requestPaint?: () => void;
};

type ElementImageContext = CanvasRenderingContext2D & {
  drawElementImage?: (element: Element, x: number, y: number) => void;
};

let colorProbe: CanvasRenderingContext2D | null = null;

function parseColor(input: string): [number, number, number] {
  if (typeof document === 'undefined') return [0, 0, 0];
  if (!colorProbe) {
    const probe = document.createElement('canvas');
    probe.width = 1;
    probe.height = 1;
    colorProbe = probe.getContext('2d', { willReadFrequently: true });
  }
  if (!colorProbe) return [0, 0, 0];
  colorProbe.fillStyle = '#000000';
  colorProbe.fillStyle = input;
  colorProbe.clearRect(0, 0, 1, 1);
  colorProbe.fillRect(0, 0, 1, 1);
  const data = colorProbe.getImageData(0, 0, 1, 1).data;
  return [data[0] / 255, data[1] / 255, data[2] / 255];
}

function buildGlyphList(charset: string) {
  const seen = new Set<string>([' ']);
  const glyphs = [' '];
  for (const ch of charset) {
    if (glyphs.length >= MAX_GLYPHS) break;
    if (ch === '\n' || ch === '\r' || ch === '\t' || seen.has(ch)) continue;
    seen.add(ch);
    glyphs.push(ch);
  }
  return glyphs;
}

function glyphShapes(
  image: ImageData,
  cols: number,
  cellW: number,
  cellH: number,
  count: number,
) {
  const vectors = new Float32Array(count * 6);
  const radius = cellH * 0.26;
  const padW = cellW + ATLAS_PAD * 2;
  const padH = cellH + ATLAS_PAD * 2;
  for (let g = 0; g < count; g++) {
    const originX = (g % cols) * padW + ATLAS_PAD;
    const originY = Math.floor(g / cols) * padH + ATLAS_PAD;
    for (let c = 0; c < 6; c++) {
      const cx = INNER_CIRCLES[c][0] * cellW;
      const cy = INNER_CIRCLES[c][1] * cellH;
      let sum = 0;
      let total = 0;
      for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
        for (
          let x = Math.floor(cx - radius);
          x <= Math.ceil(cx + radius);
          x++
        ) {
          const dx = x + 0.5 - cx;
          const dy = y + 0.5 - cy;
          if (dx * dx + dy * dy > radius * radius) continue;
          total += 1;
          if (
            x < -ATLAS_PAD ||
            y < -ATLAS_PAD ||
            x >= cellW + ATLAS_PAD ||
            y >= cellH + ATLAS_PAD
          )
            continue;
          sum +=
            image.data[((originY + y) * image.width + originX + x) * 4 + 3];
        }
      }
      vectors[g * 6 + c] = total ? sum / (total * 255) : 0;
    }
  }
  for (let c = 0; c < 6; c++) {
    let peak = 0;
    for (let g = 0; g < count; g++) {
      peak = Math.max(peak, vectors[g * 6 + c]);
    }
    if (peak > 0) {
      for (let g = 0; g < count; g++) vectors[g * 6 + c] /= peak;
    }
  }
  return vectors;
}

function clampAspect(aspect: number) {
  return Math.min(Math.max(aspect || DEFAULTS.aspect, 0.35), 1.25);
}

export function supportsHtmlInCanvas(): boolean {
  if (typeof document === 'undefined') return false;
  const probe = document.createElement('canvas') as PaintableCanvas;
  const ctx = probe.getContext('2d') as ElementImageContext | null;
  return Boolean(
    ctx &&
    typeof ctx.drawElementImage === 'function' &&
    typeof probe.requestPaint === 'function',
  );
}

export function createDecryptReveal(
  elements: DecryptRevealElements,
  options: DecryptRevealOptions = {},
): DecryptRevealInstance | null {
  const config = { ...DEFAULTS, ...options };
  const { source, content, output } = elements;

  const gl = output.getContext('webgl2', {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    premultipliedAlpha: false,
  });
  if (!gl || gl.isContextLost()) return null;

  const sourceCtx = source.getContext('2d') as ElementImageContext | null;
  const paintable = source as PaintableCanvas;
  const htmlInCanvas = Boolean(
    sourceCtx &&
    typeof sourceCtx.drawElementImage === 'function' &&
    typeof paintable.requestPaint === 'function',
  );

  let contentDirty = false;
  let cellsDirty = true;
  let wake = () => {};

  if (htmlInCanvas) {
    paintable.onpaint = () => {
      try {
        sourceCtx!.reset();
        sourceCtx!.drawElementImage!(content, 0, 0);
        contentDirty = true;
        wake();
      } catch {}
    };
  }

  function compile(type: number, text: string): WebGLShader {
    const shader = gl!.createShader(type)!;
    gl!.shaderSource(shader, text);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
      console.error(
        'DecryptReveal shader error:',
        gl!.getShaderInfoLog(shader),
      );
    }
    return shader;
  }

  function link(frag: string) {
    const vs = compile(gl!.VERTEX_SHADER, DECRYPT_REVEAL_VERTEX_SHADER);
    const fs = compile(gl!.FRAGMENT_SHADER, frag);
    const program = gl!.createProgram()!;
    gl!.attachShader(program, vs);
    gl!.attachShader(program, fs);
    gl!.linkProgram(program);
    const uniforms: Record<string, WebGLUniformLocation> = {};
    const count = gl!.getProgramParameter(program, gl!.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl!.getActiveUniform(program, i)!;
      uniforms[info.name] = gl!.getUniformLocation(program, info.name)!;
    }
    return { program, vs, fs, uniforms };
  }

  const cellPass = link(DECRYPT_REVEAL_CELL_FRAGMENT_SHADER);
  const mainPass = link(DECRYPT_REVEAL_MAIN_FRAGMENT_SHADER);

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  function makeTexture(filter: number) {
    const texture = gl!.createTexture()!;
    gl!.bindTexture(gl!.TEXTURE_2D, texture);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, filter);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, filter);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    return texture;
  }

  const contentTexture = makeTexture(gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 0]),
  );

  const cellTexture = makeTexture(gl.NEAREST);
  const cellFbo = gl.createFramebuffer()!;
  let cellCols = 0;
  let cellRows = 0;

  const shapeTexture = makeTexture(gl.NEAREST);
  const atlasTexture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_LINEAR,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  let glyphCount = 0;
  let atlasCols = 1;
  let atlasRows = 1;
  let atlasPad: [number, number] = [0, 0];
  let atlasInner: [number, number] = [1, 1];
  let builtCharset = '';
  let builtAspect = 0;

  function rebuildAtlas() {
    const aspect = clampAspect(config.aspect);
    if (builtCharset === config.charset && builtAspect === aspect) return;
    const glyphs = buildGlyphList(config.charset);
    const cellH = ATLAS_CELL;
    const cellW = Math.max(Math.round(cellH * aspect), 8);
    const padW = cellW + ATLAS_PAD * 2;
    const padH = cellH + ATLAS_PAD * 2;
    const cols = Math.ceil(Math.sqrt(glyphs.length));
    const rows = Math.ceil(glyphs.length / cols);
    const surface = document.createElement('canvas');
    surface.width = cols * padW;
    surface.height = rows * padH;
    const ctx = surface.getContext('2d');
    if (!ctx) return;
    builtCharset = config.charset;
    builtAspect = aspect;
    ctx.clearRect(0, 0, surface.width, surface.height);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontPx = Math.floor(Math.min(cellH * 0.92, cellW / 0.58));
    ctx.font = `600 ${fontPx}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    for (let g = 0; g < glyphs.length; g++) {
      ctx.fillText(
        glyphs[g],
        (g % cols) * padW + padW / 2,
        Math.floor(g / cols) * padH + padH / 2,
      );
    }
    const image = ctx.getImageData(0, 0, surface.width, surface.height);
    const vectors = glyphShapes(image, cols, cellW, cellH, glyphs.length);

    gl!.bindTexture(gl!.TEXTURE_2D, atlasTexture);
    gl!.texImage2D(
      gl!.TEXTURE_2D,
      0,
      gl!.RGBA,
      gl!.RGBA,
      gl!.UNSIGNED_BYTE,
      surface,
    );
    gl!.generateMipmap(gl!.TEXTURE_2D);

    gl!.bindTexture(gl!.TEXTURE_2D, shapeTexture);
    gl!.pixelStorei(gl!.UNPACK_ALIGNMENT, 1);
    gl!.texImage2D(
      gl!.TEXTURE_2D,
      0,
      gl!.R32F,
      6,
      glyphs.length,
      0,
      gl!.RED,
      gl!.FLOAT,
      vectors,
    );
    gl!.pixelStorei(gl!.UNPACK_ALIGNMENT, 4);

    glyphCount = glyphs.length;
    atlasCols = cols;
    atlasRows = rows;
    atlasPad = [ATLAS_PAD / padW, ATLAS_PAD / padH];
    atlasInner = [cellW / padW, cellH / padH];
    cellsDirty = true;
  }

  let contentMaxX = 1;

  function cellSizePx(dpr: number): [number, number] {
    const h = Math.min(Math.max(config.cell, 4), 40) * dpr;
    return [h * clampAspect(config.aspect), h];
  }

  function syncCanvasSize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(output.clientWidth * dpr));
    const height = Math.max(1, Math.round(output.clientHeight * dpr));
    if (output.width !== width || output.height !== height) {
      output.width = width;
      output.height = height;
    }
    contentMaxX = Math.min(
      1,
      Math.max(0.05, content.clientWidth / Math.max(output.clientWidth, 1)),
    );
    if (htmlInCanvas) {
      const cssWidth = Math.max(1, Math.round(source.clientWidth));
      const cssHeight = Math.max(1, Math.round(source.clientHeight));
      if (
        source.width !== cssWidth * dpr ||
        source.height !== cssHeight * dpr
      ) {
        source.width = cssWidth * dpr;
        source.height = cssHeight * dpr;
      }
      paintable.requestPaint!();
    }
    cellsDirty = true;
  }

  function syncCellGrid() {
    const dpr = output.width / Math.max(output.clientWidth, 1);
    const [cw, ch] = cellSizePx(dpr);
    const cols = Math.max(Math.ceil(output.width / cw), 1);
    const rows = Math.max(Math.ceil(output.height / ch), 1);
    if (cols === cellCols && rows === cellRows) return;
    cellCols = cols;
    cellRows = rows;
    gl!.bindTexture(gl!.TEXTURE_2D, cellTexture);
    gl!.texImage2D(
      gl!.TEXTURE_2D,
      0,
      gl!.RGBA,
      cols,
      rows,
      0,
      gl!.RGBA,
      gl!.UNSIGNED_BYTE,
      null,
    );
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, cellFbo);
    gl!.framebufferTexture2D(
      gl!.FRAMEBUFFER,
      gl!.COLOR_ATTACHMENT0,
      gl!.TEXTURE_2D,
      cellTexture,
      0,
    );
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    cellsDirty = true;
  }

  const pointer = {
    x: -1e5,
    y: -1e5,
    tx: -1e5,
    ty: -1e5,
    active: 0,
    target: 0,
  };
  let time = 0;
  let bgKey = '';
  let bg: [number, number, number] = [0, 0, 0];
  let colorKey = '';
  let fg: [number, number, number] = [0.29, 0.87, 0.5];

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionQuery.matches;

  rebuildAtlas();
  syncCanvasSize();

  function uploadContent() {
    if (!htmlInCanvas || !contentDirty) return;
    contentDirty = false;
    cellsDirty = true;
    gl!.bindTexture(gl!.TEXTURE_2D, contentTexture);
    gl!.texImage2D(
      gl!.TEXTURE_2D,
      0,
      gl!.RGBA,
      gl!.RGBA,
      gl!.UNSIGNED_BYTE,
      source,
    );
  }

  function renderCells() {
    if (!cellsDirty) return;
    cellsDirty = false;
    const dpr = output.width / Math.max(output.clientWidth, 1);
    const [cw, ch] = cellSizePx(dpr);
    const u = cellPass.uniforms;
    gl!.useProgram(cellPass.program);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, contentTexture);
    gl!.uniform1i(u.uContent, 0);
    gl!.activeTexture(gl!.TEXTURE1);
    gl!.bindTexture(gl!.TEXTURE_2D, shapeTexture);
    gl!.uniform1i(u.uShapes, 1);
    gl!.uniform2f(u.uContentRes, output.width, output.height);
    gl!.uniform2f(u.uCellPx, cw, ch);
    gl!.uniform1i(u.uGlyphCount, glyphCount);
    gl!.uniform1f(u.uContrast, Math.min(Math.max(config.contrast, 0.3), 3));
    gl!.uniform1f(u.uExposure, Math.min(Math.max(config.exposure, 0.2), 3));
    gl!.uniform1f(u.uThreshold, Math.max(config.threshold, 0.005));
    gl!.uniform3f(u.uBg, bg[0], bg[1], bg[2]);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, cellFbo);
    gl!.viewport(0, 0, cellCols, cellRows);
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
  }

  function render() {
    uploadContent();
    if (config.background !== bgKey) {
      bgKey = config.background;
      bg = parseColor(config.background);
      cellsDirty = true;
    }
    if (config.color !== colorKey) {
      colorKey = config.color;
      fg = parseColor(config.color);
    }
    rebuildAtlas();
    syncCellGrid();
    renderCells();

    const w = Math.max(output.clientWidth, 1);
    const h = Math.max(output.clientHeight, 1);
    const dpr = output.width / w;
    const [cw, ch] = cellSizePx(dpr);
    const u = mainPass.uniforms;
    gl!.useProgram(mainPass.program);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, contentTexture);
    gl!.uniform1i(u.uContent, 0);
    gl!.activeTexture(gl!.TEXTURE1);
    gl!.bindTexture(gl!.TEXTURE_2D, cellTexture);
    gl!.uniform1i(u.uCells, 1);
    gl!.activeTexture(gl!.TEXTURE2);
    gl!.bindTexture(gl!.TEXTURE_2D, atlasTexture);
    gl!.uniform1i(u.uAtlas, 2);
    gl!.uniform2f(u.uRes, w, h);
    gl!.uniform1f(u.uDpr, dpr);
    gl!.uniform2f(u.uCellPx, cw, ch);
    gl!.uniform2f(u.uGrid, cellCols, cellRows);
    gl!.uniform2f(u.uAtlasGrid, atlasCols, atlasRows);
    gl!.uniform2f(u.uAtlasPad, atlasPad[0], atlasPad[1]);
    gl!.uniform2f(u.uAtlasInner, atlasInner[0], atlasInner[1]);
    gl!.uniform1i(u.uGlyphCount, glyphCount);
    gl!.uniform2f(u.uPointer, pointer.x, pointer.y);
    gl!.uniform1f(u.uActive, pointer.active);
    gl!.uniform1f(u.uRadius, Math.max(config.radius, 1));
    gl!.uniform1f(u.uSoftness, config.softness);
    gl!.uniform1f(u.uColored, config.colored);
    gl!.uniform3f(u.uColor, fg[0], fg[1], fg[2]);
    gl!.uniform1f(u.uBrightness, Math.min(Math.max(config.brightness, 0.2), 3));
    gl!.uniform1f(u.uLegibility, Math.min(Math.max(config.legibility, 0), 1));
    gl!.uniform1f(u.uScramble, Math.min(Math.max(config.scramble, 0), 1));
    gl!.uniform1f(
      u.uScrambleSpeed,
      Math.min(Math.max(config.scrambleSpeed, 0), 30),
    );
    gl!.uniform1f(u.uEdgeWidth, config.edgeWidth);
    gl!.uniform1f(u.uEdgeFlicker, Math.min(Math.max(config.edgeFlicker, 0), 1));
    gl!.uniform1f(u.uEdgeGlow, Math.min(Math.max(config.edgeGlow, 0), 3));
    gl!.uniform1f(u.uEdgeTint, config.edgeTint);
    gl!.uniform1f(u.uAberration, Math.max(config.aberration, 0));
    gl!.uniform1f(u.uPassthrough, config.passthrough);
    gl!.uniform3f(u.uBg, bg[0], bg[1], bg[2]);
    gl!.uniform1f(u.uTime, time);
    gl!.uniform1f(u.uMaxX, contentMaxX);
    gl!.uniform1f(u.uCrisp, reducedMotion || !htmlInCanvas ? 1 : 0);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    gl!.viewport(0, 0, output.width, output.height);
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
  }

  let raf = 0;
  let lastTime = performance.now();
  let destroyed = false;
  let running = false;
  let visible = true;

  function frame(now: number) {
    if (destroyed) return;
    if (!visible) {
      running = false;
      return;
    }
    const delta = Math.min((now - lastTime) / 1000, 1 / 30);
    lastTime = now;
    time += delta;
    const tau = Math.max(config.smoothing, 1e-4);
    const k = reducedMotion ? 1 : 1 - Math.exp(-delta / tau);
    pointer.x += (pointer.tx - pointer.x) * k;
    pointer.y += (pointer.ty - pointer.y) * k;
    pointer.active += (pointer.target - pointer.active) * k;
    render();
    const settled =
      Math.abs(pointer.tx - pointer.x) < 0.1 &&
      Math.abs(pointer.ty - pointer.y) < 0.1 &&
      Math.abs(pointer.target - pointer.active) < 1e-3;
    const churning =
      (config.scramble > 0 && config.scrambleSpeed > 0) ||
      (pointer.active > 1e-3 && config.edgeFlicker > 0);
    if (
      settled &&
      !contentDirty &&
      (reducedMotion || !htmlInCanvas || !churning)
    ) {
      pointer.x = pointer.tx;
      pointer.y = pointer.ty;
      pointer.active = pointer.target;
      running = false;
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (destroyed || running || !visible) return;
    running = true;
    lastTime = performance.now();
    raf = requestAnimationFrame(frame);
  }

  wake = start;
  start();

  function onMotionChange() {
    reducedMotion = motionQuery.matches;
    start();
  }
  motionQuery.addEventListener('change', onMotionChange);

  const observer = new ResizeObserver(() => {
    syncCanvasSize();
    start();
  });
  observer.observe(output);
  observer.observe(content);

  const intersection = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1]?.isIntersecting ?? true;
    if (visible) start();
  });
  intersection.observe(output);

  const listenTarget = output.parentElement ?? output;

  function onPointerMove(event: PointerEvent) {
    const rect = output.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (pointer.target === 0 && pointer.active < 1e-3) {
      pointer.x = x;
      pointer.y = y;
    }
    pointer.tx = x;
    pointer.ty = y;
    pointer.target = 1;
    start();
  }

  function onPointerLeave() {
    pointer.target = 0;
    start();
  }

  listenTarget.addEventListener('pointermove', onPointerMove);
  listenTarget.addEventListener('pointerleave', onPointerLeave);

  return {
    setOptions(next) {
      let changed = false;
      for (const [key, value] of Object.entries(next)) {
        if (typeof value === 'function') continue;
        if (config[key as keyof typeof config] !== value) {
          changed = true;
          break;
        }
      }
      if (!changed) {
        Object.assign(config, next);
        return;
      }
      const prev = {
        cell: config.cell,
        aspect: config.aspect,
        contrast: config.contrast,
        exposure: config.exposure,
        threshold: config.threshold,
      };
      Object.assign(config, next);
      if (
        config.cell !== prev.cell ||
        config.aspect !== prev.aspect ||
        config.contrast !== prev.contrast ||
        config.exposure !== prev.exposure ||
        config.threshold !== prev.threshold
      ) {
        cellsDirty = true;
      }
      start();
    },
    resize() {
      syncCanvasSize();
      start();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      intersection.disconnect();
      motionQuery.removeEventListener('change', onMotionChange);
      listenTarget.removeEventListener('pointermove', onPointerMove);
      listenTarget.removeEventListener('pointerleave', onPointerLeave);
      gl!.deleteTexture(contentTexture);
      gl!.deleteTexture(cellTexture);
      gl!.deleteTexture(shapeTexture);
      gl!.deleteTexture(atlasTexture);
      gl!.deleteFramebuffer(cellFbo);
      gl!.deleteProgram(cellPass.program);
      gl!.deleteShader(cellPass.vs);
      gl!.deleteShader(cellPass.fs);
      gl!.deleteProgram(mainPass.program);
      gl!.deleteShader(mainPass.vs);
      gl!.deleteShader(mainPass.fs);
      gl!.deleteBuffer(quad);
      if (htmlInCanvas) paintable.onpaint = null;
    },
  };
}
