export interface DecryptRevealOptions {
  /** Decrypt radius around the cursor in CSS pixels. */
  radius?: number;
  /** Feather of the decrypt edge as a fraction of the radius (0 to 1). */
  softness?: number;
  /** Glyph cell height in CSS pixels (4 to 40). */
  cell?: number;
  /** Width of a glyph cell relative to its height (0.35 to 1.25). */
  aspect?: number;
  /** Characters the cipher is written in. Order does not matter, shapes are matched automatically. */
  charset?: string;
  /** How much glyphs keep the color of the UI beneath them, 0 is monochrome (0 to 1). */
  colored?: number;
  /** Cipher color as any CSS color. Used for monochrome glyphs and the decrypt edge tint. */
  color?: string;
  /** Brightness of the cipher glyphs (0.2 to 3). */
  brightness?: number;
  /** Minimum contrast the cipher keeps against the background, so subtle UI stays readable while encrypted (0 to 1). */
  legibility?: number;
  /** Contrast of the glyph shape matching. Higher picks bolder characters (0.3 to 3). */
  contrast?: number;
  /** Exposure applied to the UI before it is matched to glyphs (0.2 to 3). */
  exposure?: number;
  /** Fraction of idle cipher cells that keep mutating (0 to 1). */
  scramble?: number;
  /** Cipher mutations per second (0 to 30). */
  scrambleSpeed?: number;
  /** Width of the decrypting flicker band as a fraction of the radius (0 to 1). */
  edgeWidth?: number;
  /** How violently characters flicker while they decrypt (0 to 1). */
  edgeFlicker?: number;
  /** Brightness surge of glyphs on the decrypt wavefront (0 to 3). */
  edgeGlow?: number;
  /** How strongly the wavefront tints toward the cipher color (0 to 1). */
  edgeTint?: number;
  /** Chromatic aberration of the revealed UI at the decrypt edge in CSS pixels. */
  aberration?: number;
  /** How much of the real UI shows through the cipher (0 to 1). 0 keeps the page fully encrypted. */
  passthrough?: number;
  /** Contrast against the background above which a cell counts as UI and earns a glyph. */
  threshold?: number;
  /** Color of the backdrop behind the content, as any CSS color. Used to tell UI pixels apart from empty space. */
  background?: string;
  /** Seconds the decrypt circle takes to catch up with the cursor. Higher feels more damped. */
  smoothing?: number;
}

export interface DecryptRevealElements {
  /** Canvas with layoutsubtree that hosts the HTML content. */
  source: HTMLCanvasElement;
  /** The element inside the source canvas that gets captured. */
  content: HTMLElement;
  /** Canvas the WebGL effect renders to. */
  output: HTMLCanvasElement;
}

export interface DecryptRevealInstance {
  /** Update effect options live. */
  setOptions: (options: DecryptRevealOptions) => void;
  /** Re-read canvas size. Call when the element is resized. */
  resize: () => void;
  /** Stop the loop and release all GPU resources. */
  destroy: () => void;
}
