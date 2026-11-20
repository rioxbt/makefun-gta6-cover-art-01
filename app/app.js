// Vice Cover Studio — a caption and any photo, into cover art in the poster style, offline.
// The editor wires the page to the renderer: photos in, panels picked and positioned, a layout, a
// colour grade, a post size, then a PNG out. `?shot=` renders a fixed scene for a screenshot.
import { renderCover, panelAt } from './cover.js';
import { SIZES, LAYOUTS, LAYOUT_ORDER, panelCount, layoutRects } from './layouts.js';
import { GRADES, GRADE_ORDER } from './grades.js';

const SAMPLE_PHOTOS = ['./samples/boulevard.jpg', './samples/pier.jpg'];
const MAX_PANELS = 6;

const state = {
  title: 'Neon Shore',
  sub: 'Leilani Vega',
  layout: 'poster',
  grade: 'vice',
  w: 1080,
  h: 1080,
  photos: [],
  panels: Array.from({ length: MAX_PANELS }, () => ({ photo: null, zoom: 1, ox: 0, oy: 0 })),
  sel: 0,
};

const el = (id) => document.getElementById(id);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Loads an image from a URL, resolving once it can be drawn. */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Gives every empty panel of the current layout a photo, round-robin over the ones loaded; a
    second pass over the photos is re-cropped, so repeated panels do not read as copies. */
function fillPanels() {
  const n = panelCount(state.layout);
  if (state.photos.length) {
    for (let i = 0; i < n; i++) {
      if (state.panels[i].photo) continue;
      const photo = state.photos[i % state.photos.length];
      const panel = state.panels[i];
      panel.photo = photo;
      if (i >= state.photos.length) {
        panel.ox = i % 2 ? -0.42 : 0.42;
        panel.oy = i % 3 === 0 ? 0.24 : -0.18;
        panel.zoom = 1.22;
      }
    }
  }
  if (state.sel >= n) state.sel = 0;
}

/** Redraws the preview cover at the chosen post size. */
function redraw() {
  const canvas = el('cover');
  const editing = !document.body.classList.contains('shot-cover');
  canvas.width = state.w;
  canvas.height = state.h;
  renderCover(canvas, state, { editing });
  if (editing) fitCanvasToStage(canvas);
  el('status').textContent = `Cover ${state.w} × ${state.h} · ${LAYOUTS[state.layout].label} · ${GRADES[state.grade].label} · ${state.photos.length} photo${state.photos.length === 1 ? '' : 's'} · panel ${state.sel + 1}/${panelCount(state.layout)}`;
  renderThumbs();
}

/** Sizes the preview to the stage while keeping the cover's aspect ratio. */
function fitCanvasToStage(canvas) {
  const stage = el('stage');
  const boxW = Math.max(120, stage.clientWidth - 48);
  const boxH = Math.max(120, stage.clientHeight - 88);
  const scale = Math.min(boxW / state.w, boxH / state.h);
  canvas.style.width = `${Math.round(state.w * scale)}px`;
  canvas.style.height = `${Math.round(state.h * scale)}px`;
}

/** The photo strip: click a thumbnail to place it in the selected panel. */
function renderThumbs() {
  const strip = el('thumbs');
  strip.textContent = '';
  const active = state.panels[state.sel] ? state.panels[state.sel].photo : null;
  state.photos.forEach((photo) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thumb';
    if (photo === active) button.classList.add('on');
    button.title = 'Place this photo in the selected panel';
    const thumb = document.createElement('canvas');
    thumb.width = 58;
    thumb.height = 58;
    const ctx = thumb.getContext('2d');
    const scale = Math.max(58 / photo.naturalWidth, 58 / photo.naturalHeight);
    const dw = photo.naturalWidth * scale;
    const dh = photo.naturalHeight * scale;
    ctx.drawImage(photo, (58 - dw) / 2, (58 - dh) / 2, dw, dh);
    button.appendChild(thumb);
    button.addEventListener('click', () => {
      state.panels[state.sel].photo = photo;
      redraw();
    });
    strip.appendChild(button);
  });
}

/** Rebuilds the layout, grade and size chips so the chosen one reads as chosen. */
function syncChips() {
  buildChips(el('layouts'), LAYOUT_ORDER.map((k) => [k, LAYOUTS[k].label]), state.layout, (k) => {
    state.layout = k;
    fillPanels();
    redraw();
    syncChips();
  });
  buildChips(el('grades'), GRADE_ORDER.map((k) => [k, GRADES[k].label]), state.grade, (k) => {
    state.grade = k;
    redraw();
    syncChips();
  });
  buildChips(el('sizes'), SIZES.map((s) => [`${s.w}x${s.h}`, s.label]), `${state.w}x${state.h}`, (key) => {
    const size = SIZES.find((s) => `${s.w}x${s.h}` === key);
    state.w = size.w;
    state.h = size.h;
    redraw();
    syncChips();
  });
}

function buildChips(container, items, current, onPick) {
  container.textContent = '';
  for (const [key, label] of items) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (key === current ? ' on' : '');
    chip.textContent = label;
    chip.addEventListener('click', () => onPick(key));
    container.appendChild(chip);
  }
}

/** Where a pointer event falls in cover pixels. */
function coverPoint(event) {
  const canvas = el('cover');
  const box = canvas.getBoundingClientRect();
  return { x: ((event.clientX - box.left) * state.w) / box.width, y: ((event.clientY - box.top) * state.h) / box.height };
}

/** Wires the controls, the canvas (click to pick a panel, drag to position, scroll to zoom) and export. */
function wireEditor() {
  el('title').addEventListener('input', (e) => {
    state.title = e.target.value;
    redraw();
  });
  el('sub').addEventListener('input', (e) => {
    state.sub = e.target.value;
    redraw();
  });
  el('zoom').addEventListener('input', (e) => {
    state.panels[state.sel].zoom = Number(e.target.value);
    redraw();
  });
  el('files').addEventListener('change', async (e) => {
    for (const file of e.target.files) {
      try {
        state.photos.push(await loadImage(URL.createObjectURL(file)));
      } catch {
        el('status').textContent = `${file.name} could not be read as an image`;
      }
    }
    fillPanels();
    redraw();
  });
  el('fill').addEventListener('click', () => {
    const n = panelCount(state.layout);
    for (let i = 0; i < n; i++) {
      if (state.photos.length) state.panels[i].photo = state.photos[i % state.photos.length];
    }
    redraw();
  });

  const canvas = el('cover');
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    const p = coverPoint(e);
    const i = panelAt(layoutRects(state.layout, state.w, state.h), p.x, p.y);
    if (i < 0) return;
    state.sel = i;
    drag = { x: p.x, y: p.y, panel: state.panels[i] };
    canvas.setPointerCapture(e.pointerId);
    el('zoom').value = String(drag.panel.zoom);
    redraw();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = coverPoint(e);
    const rect = layoutRects(state.layout, state.w, state.h).panels[state.sel];
    drag.panel.ox = clamp(drag.panel.ox + (p.x - drag.x) / (rect.w * 0.5), -2, 2);
    drag.panel.oy = clamp(drag.panel.oy + (p.y - drag.y) / (rect.h * 0.5), -2, 2);
    drag.x = p.x;
    drag.y = p.y;
    redraw();
  });
  canvas.addEventListener('pointerup', () => {
    drag = null;
  });
  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const panel = state.panels[state.sel];
      panel.zoom = clamp(panel.zoom * (e.deltaY > 0 ? 0.94 : 1.06), 0.6, 2.6);
      el('zoom').value = String(panel.zoom);
      redraw();
    },
    { passive: false },
  );

  el('export').addEventListener('click', exportPng);
}

/** Draws the cover without the editor's marks and saves it as a PNG at the chosen size. */
function exportPng() {
  const off = document.createElement('canvas');
  off.width = state.w;
  off.height = state.h;
  renderCover(off, state, { editing: false });
  off.toBlob((blob) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cover-${state.w}x${state.h}.png`;
    link.click();
    URL.revokeObjectURL(link.href);
    el('status').textContent = `Saved cover-${state.w}x${state.h}.png`;
  }, 'image/png');
}

/** A fixed scene for a screenshot: ?shot=cover paints the art alone, ?shot=editor the editor. */
function applyShotParams(query) {
  state.title = query.get('title') ?? state.title;
  state.sub = query.get('sub') ?? state.sub;
  state.layout = query.get('layout') ?? state.layout;
  state.grade = query.get('grade') ?? state.grade;
  state.w = Number(query.get('w') ?? state.w);
  state.h = Number(query.get('h') ?? state.h);
}

/** Waits for the two display faces, and draws anyway if a face cannot be loaded. */
async function fontsReady() {
  try {
    await Promise.allSettled([document.fonts.load('100px Anton'), document.fonts.load('60px Pacifico')]);
    await document.fonts.ready;
  } catch {
    // A missing face is no reason to leave the poster unpainted: the stack falls back.
  }
}

async function boot() {
  wireEditor();
  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  if (shot) {
    document.body.classList.add(shot === 'cover' ? 'shot-cover' : 'shot-editor');
    applyShotParams(query);
  }
  el('title').value = state.title;
  el('sub').value = state.sub;
  el('zoom').value = String(state.panels[state.sel].zoom);
  const samples = await Promise.all(SAMPLE_PHOTOS.map((url) => loadImage(url).catch(() => null)));
  state.photos = samples.filter(Boolean);
  fillPanels();
  await fontsReady();
  syncChips();
  redraw();
  if (shot) requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

boot();
