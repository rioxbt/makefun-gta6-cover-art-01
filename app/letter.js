// Lettering helpers: the caption is drawn one character at a time so the tracking is even, and a
// line is shrunk until it fits the band it is lettered into.

/** The width of `text` in `font` with `tracking` pixels between characters. */
export function measureTracked(ctx, text, font, tracking) {
  ctx.font = font;
  let width = 0;
  for (const ch of text) width += ctx.measureText(ch).width + tracking;
  return text ? width - tracking : 0;
}

/** The largest size, at most maxSize, at which `text` in `family` fits maxWidth with tracking. */
export function fitFontSize(ctx, text, family, maxWidth, maxSize, minSize = 8) {
  let size = maxSize;
  while (size > minSize) {
    const font = `${size}px ${family}, Impact, sans-serif`;
    if (measureTracked(ctx, text, font, size * 0.03) <= maxWidth) return size;
    size -= Math.max(1, size * 0.03);
  }
  return size;
}

/** Draws `text` centred on cx, each character `tracking` apart, filled and stroked where given. */
export function drawTrackedText(ctx, text, cx, baseline, font, tracking, fill, stroke, lineWidth) {
  ctx.font = font;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  let x = cx - measureTracked(ctx, text, font, tracking) / 2;
  for (const ch of text) {
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fillText(ch, x, baseline);
    }
    if (stroke && lineWidth) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = stroke;
      ctx.strokeText(ch, x, baseline);
    }
    x += ctx.measureText(ch).width + tracking;
  }
}
