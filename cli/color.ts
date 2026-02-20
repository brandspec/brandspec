/**
 * Color utilities for brandspec lint rules.
 * Ported from brandspec-tools SaaS — single source of truth.
 */

/** Parse hex, rgb(), or oklch() color string to [r, g, b] 0-255 */
export function parseColor(color: string): [number, number, number] | null {
  // hex
  const hex = color.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }

  // rgb()
  const rgb = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgb) {
    return [parseInt(rgb[1]), parseInt(rgb[2]), parseInt(rgb[3])];
  }

  // oklch() — Björn Ottosson's OKLab color space
  const oklch = color.match(
    /oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/,
  );
  if (oklch) {
    const L =
      oklch[2] === "%" ? parseFloat(oklch[1]) / 100 : parseFloat(oklch[1]);
    const C = parseFloat(oklch[3]);
    const H = parseFloat(oklch[4]);
    return oklchToSrgb(L, C, H);
  }

  return null;
}

/** Convert oklch (L 0-1, C >= 0, H degrees) to sRGB [r, g, b] 0-255 */
export function oklchToSrgb(
  L: number,
  C: number,
  H: number,
): [number, number, number] {
  // OKLCH → OKLab
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // OKLab → LMS (cube roots)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // LMS → linear sRGB
  const rl = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gl = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  // Linear sRGB → sRGB gamma
  const gamma = (x: number) =>
    x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;

  const clamp = (x: number) =>
    Math.max(0, Math.min(255, Math.round(x * 255)));

  return [clamp(gamma(rl)), clamp(gamma(gl)), clamp(gamma(bl))];
}

/** WCAG relative luminance from sRGB 0-255 values */
export function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** WCAG contrast ratio between two color strings */
export function getContrastRatio(color1: string, color2: string): number {
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);
  if (!c1 || !c2) return 21; // If we can't parse, assume max contrast (safe side)

  const l1 = relativeLuminance(...c1);
  const l2 = relativeLuminance(...c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Find color $value from DTCG token map by name */
export function findColorValue(
  colors: Record<string, unknown>,
  name: string,
): string | null {
  const token = colors[name];
  if (isToken(token)) return token.$value;
  if (typeof token === "object" && token !== null) {
    const nested = token as Record<string, unknown>;
    if (isToken(nested)) return nested.$value;
  }
  return null;
}

function isToken(v: unknown): v is { $value: string } {
  return typeof v === "object" && v !== null && "$value" in v;
}
