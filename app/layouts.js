// The cover layouts and the post sizes, as fractions of the frame so one layout works at every
// size. Each layout is a list of panel rectangles plus the caption band across the foot; the strip
// between the panels' lowest edge and the band is left as sky, so the sunset shows on every layout.

export const SIZES = [
  { w: 1080, h: 1080, label: '1080 × 1080' },
  { w: 1080, h: 1350, label: '1080 × 1350' },
  { w: 1920, h: 1080, label: '1920 × 1080' },
];

export const LAYOUTS = {
  poster: {
    label: 'Poster',
    title: [0, 0.70, 1, 0.30],
    panels: [
      [0.032, 0.04, 0.575, 0.50],
      [0.628, 0.04, 0.34, 0.158],
      [0.628, 0.212, 0.34, 0.158],
      [0.628, 0.384, 0.34, 0.156],
    ],
  },
  trio: {
    label: 'Trio',
    title: [0, 0.66, 1, 0.34],
    panels: [
      [0.032, 0.04, 0.29, 0.50],
      [0.355, 0.04, 0.29, 0.50],
      [0.678, 0.04, 0.29, 0.50],
    ],
  },
  split: {
    label: 'Split',
    title: [0, 0.76, 1, 0.24],
    panels: [
      [0.032, 0.04, 0.56, 0.56],
      [0.618, 0.04, 0.35, 0.27],
      [0.618, 0.33, 0.35, 0.27],
    ],
  },
  grid: {
    label: 'Grid',
    title: [0, 0.72, 1, 0.28],
    panels: [
      [0.032, 0.04, 0.455, 0.27],
      [0.513, 0.04, 0.455, 0.27],
      [0.032, 0.34, 0.455, 0.27],
      [0.513, 0.34, 0.455, 0.27],
    ],
  },
  full: {
    label: 'Full bleed',
    title: [0, 0.72, 1, 0.28],
    panels: [[0, 0, 1, 1]],
  },
};

export const LAYOUT_ORDER = ['poster', 'trio', 'split', 'grid', 'full'];

/** Every panel count a layout uses; the editor keeps this many slots. */
export function panelCount(name) {
  return (LAYOUTS[name] ?? LAYOUTS.poster).panels.length;
}

/** The layout's rectangles in pixels at w × h, with the top of the open sky strip: the lowest
    panel edge, kept at least a tenth of the frame above the caption band. */
export function layoutRects(name, w, h) {
  const spec = LAYOUTS[name] ?? LAYOUTS.poster;
  const rect = ([x, y, rw, rh]) => ({ x: x * w, y: y * h, w: rw * w, h: rh * h });
  const panels = spec.panels.map(rect);
  const title = rect(spec.title);
  const lowest = Math.max(...panels.map((p) => p.y + p.h));
  return { panels, title, skyTop: Math.min(lowest, title.y - h * 0.10) };
}
