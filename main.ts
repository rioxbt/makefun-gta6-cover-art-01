// Vice Cover Studio — the gta6-cover-art-01 entry program (Node 22, standard library only).
//
// The app is the app/ folder beside this file: plain static files a desktop browser opens offline
// (app/index.html and its ES modules, no library and no network request). This program hands it in:
// it copies app/ and screenshots/ from this repository to /output and writes /output/dossier.json
// with the vendored make.fun library, which is the summary the judge reads.
//
// Run it, and serve the app locally, with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # hands the entry in, prints the totals
//   node serve.ts                                         # app/ on http://localhost:8080
//
// MAKEFUN_OUTPUT_DIR stands in for /output outside the grader's container.

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps (reference/gate.json). Only text_max_bytes shapes the dossier's bytes; the
// rest are passed so buildDossier refuses here what the scorer would refuse there.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

/** The file count and the byte total of every regular file under dir, in all. */
function walk(dir: string): { files: string[]; bytes: number } {
  const files: string[] = [];
  let bytes = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const inner = walk(full);
      files.push(...inner.files);
      bytes += inner.bytes;
    } else if (entry.isFile()) {
      files.push(full);
      bytes += statSync(full).size;
    }
  }
  return { files, bytes };
}

/** The width and height in an image file's header, or null when it is no whole PNG or JPEG. */
function imageSize(buf: Buffer): { w: number; h: number } | null {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i += 1; continue; }
      const marker = buf[i + 1];
      const size = buf.readUInt16BE(i + 2);
      // SOF0 to SOF3 carry the frame's height and width; the rest of the header is skipped by its length.
      if (marker >= 0xc0 && marker <= 0xc3) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      i += 2 + Math.max(2, size);
    }
  }
  return null;
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

const dossier = buildDossier(out, CAPS);
writeFileSync(join(out, 'dossier.json'), dossier);

// A last look at the copies, in the terms the gate uses, so a broken hand-in is loud here.
const appTree = walk(join(out, 'app'));
const shots = readdirSync(join(out, 'screenshots'))
  .filter((name) => !name.startsWith('.'))
  .map((name) => ({ name, bytes: statSync(join(out, 'screenshots', name)).size }));

const problems: string[] = [];
if (shots.length < 3 || shots.length > CAPS.screenshots.max) {
  problems.push(`screenshots: ${shots.length}, the gate wants 3 or 4`);
}
for (const shot of shots) {
  const file = join(out, 'screenshots', shot.name);
  if (shot.bytes > CAPS.screenshots.max_bytes) problems.push(`${shot.name}: ${shot.bytes} bytes, over ${CAPS.screenshots.max_bytes}`);
  const size = imageSize(readFileSync(file));
  if (!size) problems.push(`${shot.name}: not a whole PNG or JPEG`);
  else if (Math.max(size.w, size.h) > 1280 || Math.min(size.w, size.h) < 480) problems.push(`${shot.name}: ${size.w} x ${size.h}, outside 1280 by 480`);
}
if (appTree.files.length > CAPS.app_max_files || appTree.bytes > CAPS.app_max_bytes) {
  problems.push(`app/: ${appTree.files.length} files, ${appTree.bytes} bytes, over the gate's caps`);
}

console.log(`app: ${appTree.files.length} files, ${appTree.bytes} bytes`);
console.log(`screenshots: ${shots.length} (${shots.map((s) => `${s.name} ${s.bytes}`).join(', ')})`);
console.log(`dossier.json: ${dossier.length} bytes`);
console.log(`output: ${appTree.bytes + shots.reduce((sum, s) => sum + s.bytes, 0) + dossier.length} bytes`);
if (problems.length) {
  for (const problem of problems) console.error(`gate: ${problem}`);
  process.exit(1);
}
