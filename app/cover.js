// The cover renderer: draws one cover art poster on a 2D canvas — a procedural Vice-City sunset
// backdrop, the photo panels with their colour grade, the lettering band and the grain.
import { GRADES } from './grades.js';
import { layoutRects } from './layouts.js';
import { fitFontSize, drawTrackedText } from './letter.js';

/** Paints the whole cover for `state` onto `canvas` and returns the layout it used. */
export function renderCover(canvas, state, opts = {}) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const layout = layoutRects(state.layout, w, h);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  drawSunsetScene(ctx, w, h, state.grade, layout.skyTop, layout.title.y);
  layout.panels.forEach((rect, i) => {
    drawPanel(ctx, rect, state.panels[i] ?? null, state.grade, Boolean(opts.editing) && i === state.sel);
  });
  drawTitleBand(ctx, layout.title, state, w, h);
  drawGrain(ctx, w, h);
  drawVignette(ctx, w, h);
  return layout;
}

/** The panel a point in cover pixels falls in, or -1. The last panel drawn wins. */
export function panelAt(layout, x, y) {
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const r = layout.panels[i];
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return -1;
}

/** The backdrop: graded sky, a striped sun, a skyline and palms, all drawn, none of it borrowed.
    It is drawn into the strip between the panels' lowest edge (skyTop) and the caption band
    (horizonY), so the sunset stands clear of the photos and meets the lettering with no seam. */
function drawSunsetScene(ctx, w, h, gradeName, skyTop, horizonY) {
  const g = GRADES[gradeName] ?? GRADES.vice;
  const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
  sky.addColorStop(0, g.sky[0]);
  sky.addColorStop(0.5, g.sky[1]);
  sky.addColorStop(0.82, g.sky[2]);
  sky.addColorStop(1, g.sun);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizonY);
  ctx.fillStyle = '#05020a';
  ctx.fillRect(0, horizonY, w, h - horizonY);

  const strip = Math.max(h * 0.05, horizonY - skyTop);
  const sx = w * 0.7;
  const sy = skyTop + strip * 0.52;
  const r = strip * 0.42;
  const glow = ctx.createRadialGradient(sx, sy, r * 0.4, sx, sy, r * 3.4);
  glow.addColorStop(0, g.glow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, skyTop - strip, w, strip * 3);

  ctx.save();
  ctx.beginPath();
  ctx.arc(sx, sy, r, 0, Math.PI * 2);
  ctx.fillStyle = g.sun;
  ctx.fill();
  ctx.clip();
  ctx.fillStyle = g.sky[1];
  for (let i = 0; i < 3; i++) ctx.fillRect(sx - r, sy + r * (0.34 + i * 0.24), r * 2, r * 0.10);
  ctx.restore();

  ctx.fillStyle = 'rgba(6,2,12,0.88)';
  let bx = 0;
  let seed = 7;
  while (bx < w) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const bw = w * (0.03 + (seed / 2147483648) * 0.05);
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const bh = strip * (0.14 + (seed / 2147483648) * 0.30);
    ctx.fillRect(bx, horizonY - bh, bw, bh + 2);
    bx += bw * 1.25;
  }
  drawPalm(ctx, w * 0.045, horizonY + 1, strip * 0.94);
  drawPalm(ctx, w * 0.115, horizonY + 1, strip * 0.74);
  drawPalm(ctx, w * 0.945, horizonY + 1, strip * 0.84);
}

/** One palm silhouette: a curved trunk with drooping fronds. */
function drawPalm(ctx, x, baseY, height) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.fillStyle = 'rgba(3,1,8,0.92)';
  ctx.beginPath();
  ctx.moveTo(-height * 0.022, 0);
  ctx.quadraticCurveTo(height * 0.02, -height * 0.5, height * 0.05, -height);
  ctx.lineTo(height * 0.075, -height);
  ctx.quadraticCurveTo(height * 0.05, -height * 0.5, height * 0.022, 0);
  ctx.closePath();
  ctx.fill();
  const fronds = 9;
  for (let i = 0; i < fronds; i++) {
    const a = -Math.PI + (i / (fronds - 1)) * Math.PI;
    const len = height * 0.44 * (0.72 + 0.28 * Math.cos(a));
    ctx.save();
    ctx.translate(height * 0.062, -height);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.5, -len * 0.3, len, -len * 0.05);
    ctx.quadraticCurveTo(len * 0.5, len * 0.12, 0, 0);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/** One photo panel: the photo cropped in, the grade's washes, and a border (neon when selected). */
function drawPanel(ctx, rect, panel, gradeName, selected) {
  const g = GRADES[gradeName] ?? GRADES.vice;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.fillStyle = '#0b0413';
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  if (panel && panel.photo) {
    const photo = panel.photo;
    const iw = photo.naturalWidth || photo.width;
    const ih = photo.naturalHeight || photo.height;
    const scale = Math.max(rect.w / iw, rect.h / ih) * (panel.zoom ?? 1);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = rect.x + (rect.w - dw) / 2 + (panel.ox ?? 0) * rect.w * 0.5;
    const dy = rect.y + (rect.h - dh) / 2 + (panel.oy ?? 0) * rect.h * 0.5;
    if ('filter' in ctx) ctx.filter = g.filter;
    ctx.drawImage(photo, dx, dy, dw, dh);
    if ('filter' in ctx) ctx.filter = 'none';
  }
  for (const tint of g.tints) {
    const wash = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    wash.addColorStop(0, tint.from);
    wash.addColorStop(1, tint.to);
    ctx.save();
    ctx.globalCompositeOperation = tint.blend;
    ctx.globalAlpha = tint.alpha;
    ctx.fillStyle = wash;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  }
  ctx.lineWidth = Math.max(2, Math.min(rect.w, rect.h) * 0.012);
  ctx.strokeStyle = selected ? g.accent : 'rgba(255,255,255,0.88)';
  ctx.strokeRect(rect.x + ctx.lineWidth / 2, rect.y + ctx.lineWidth / 2, rect.w - ctx.lineWidth, rect.h - ctx.lineWidth);
  ctx.restore();
}

/** The caption band: the title in poster caps, a script subtitle, a house line and a sun badge. */
function drawTitleBand(ctx, band, state, w, h) {
  const g = GRADES[state.grade] ?? GRADES.vice;
  const fill = ctx.createLinearGradient(band.x, band.y, band.x, band.y + band.h);
  fill.addColorStop(0, g.band[0]);
  fill.addColorStop(1, g.band[1]);
  ctx.fillStyle = fill;
  ctx.fillRect(band.x, band.y, band.w, band.h);

  const horizon = ctx.createLinearGradient(0, band.y, 0, band.y + band.h * 0.55);
  horizon.addColorStop(0, g.glow);
  horizon.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = horizon;
  ctx.fillRect(band.x, band.y, band.w, band.h * 0.55);
  ctx.restore();

  ctx.fillStyle = g.accent;
  ctx.fillRect(band.x, band.y, band.w, Math.max(2, h * 0.005));

  const title = (state.title || '').trim().toUpperCase();
  if (title) {
    const size = fitFontSize(ctx, title, 'Anton', band.w * 0.72, band.h * 0.40, 10);
    const baseline = band.y + band.h * 0.52;
    const grad = ctx.createLinearGradient(0, baseline - size, 0, baseline + size * 0.2);
    grad.addColorStop(0, g.title[0]);
    grad.addColorStop(0.55, g.title[1]);
    grad.addColorStop(1, g.title[2]);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = size * 0.22;
    ctx.shadowOffsetY = size * 0.05;
    drawTrackedText(ctx, title, band.x + band.w * 0.43, baseline, `${size}px Anton, Impact, sans-serif`, size * 0.03, grad, '#0a0410', size * 0.05);
    ctx.restore();
  }

  const sub = (state.sub || '').trim();
  if (sub) {
    const size = band.h * 0.15;
    ctx.save();
    ctx.font = `${size}px Pacifico, cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = g.glow;
    ctx.shadowBlur = size * 0.7;
    ctx.fillStyle = g.sub;
    ctx.fillText(sub, band.x + band.w / 2, band.y + band.h * 0.74);
    ctx.restore();
  }

  const footSize = band.h * 0.055;
  drawTrackedText(ctx, 'A SOUTHLAND STORY', band.x + band.w * 0.5, band.y + band.h * 0.92, `${footSize}px Anton, sans-serif`, band.w * 0.008, 'rgba(255,255,255,0.62)', null, 0);
  drawSunBadge(ctx, band.x + band.w * 0.915, band.y + band.h * 0.34, band.h * 0.15, g);
}

/** A small sun-in-a-disc badge: the poster's own mark, drawn from rays and a disc. */
function drawSunBadge(ctx, cx, cy, r, g) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(8,3,16,0.85)';
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * 0.10);
  ctx.strokeStyle = g.accent;
  ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r * 0.45, cy + Math.sin(a) * r * 0.45);
    ctx.lineTo(cx + Math.cos(a) * r * 0.74, cy + Math.sin(a) * r * 0.74);
    ctx.strokeStyle = g.sun;
    ctx.lineWidth = Math.max(1, r * 0.06);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.34, 0, Math.PI * 2);
  ctx.fillStyle = g.sun;
  ctx.fill();
  ctx.restore();
}

let grain = null;

/** Film grain over the whole cover, tiled from one small noise tile made on demand. */
function drawGrain(ctx, w, h) {
  if (!grain) grain = makeNoiseTile();
  const pattern = ctx.createPattern(grain, 'repeat');
  ctx.save();
  ctx.globalAlpha = 0.055;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function makeNoiseTile() {
  const tile = document.createElement('canvas');
  tile.width = 140;
  tile.height = 140;
  const tctx = tile.getContext('2d');
  const image = tctx.createImageData(tile.width, tile.height);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = 90 + Math.random() * 130;
    image.data[i] = v;
    image.data[i + 1] = v;
    image.data[i + 2] = v;
    image.data[i + 3] = 255;
  }
  tctx.putImageData(image, 0, 0);
  return tile;
}

/** A soft darkening at the edges, so the art reads as a printed poster. */
function drawVignette(ctx, w, h) {
  const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.75);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
