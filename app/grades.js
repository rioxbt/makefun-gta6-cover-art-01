// The colour grades: one palette per look, applied to the sunset backdrop, the panels' photos and
// the lettering band, so the whole cover reads as one graded poster.
// Each grade carries: sky (the backdrop gradient), sun and glow (the disc), accent and sub (neon
// lettering), band and title (the caption bar), filter (the canvas filter the photos take) and
// tints (the gradient washes laid over every panel).

export const GRADE_ORDER = ['vice', 'sunset', 'neon', 'dusk', 'gold', 'noir'];

export const GRADES = {
  vice: {
    label: 'Vice',
    sky: ['#150a33', '#8c1470', '#ff5f6d'],
    sun: '#ffd9a0',
    glow: 'rgba(255,96,190,0.55)',
    accent: '#25e8ff',
    sub: '#ffe36e',
    band: ['#3a1050', '#0e0518'],
    title: ['#fff3b0', '#ff9ad2', '#b45cff'],
    filter: 'saturate(1.18) contrast(1.08) brightness(1.03)',
    tints: [
      { from: 'rgba(255,0,140,0.55)', to: 'rgba(0,220,255,0.35)', blend: 'screen', alpha: 0.30 },
      { from: 'rgba(255,170,60,0)', to: 'rgba(120,10,60,0.85)', blend: 'soft-light', alpha: 0.55 },
    ],
  },
  sunset: {
    label: 'Sunset',
    sky: ['#241033', '#b3372b', '#ffa23a'],
    sun: '#fff0c4',
    glow: 'rgba(255,150,60,0.50)',
    accent: '#ff8a3d',
    sub: '#ffd9a0',
    band: ['#2b1030', '#0c0412'],
    title: ['#fff0b8', '#ffb35c', '#ff5f6d'],
    filter: 'saturate(1.15) contrast(1.07) brightness(1.02)',
    tints: [
      { from: 'rgba(255,190,90,0.45)', to: 'rgba(255,60,120,0.30)', blend: 'screen', alpha: 0.28 },
      { from: 'rgba(255,210,140,0)', to: 'rgba(90,20,10,0.80)', blend: 'soft-light', alpha: 0.55 },
    ],
  },
  neon: {
    label: 'Neon',
    sky: ['#040a24', '#12276b', '#12d9d0'],
    sun: '#ccfff5',
    glow: 'rgba(30,240,220,0.45)',
    accent: '#ff3ea5',
    sub: '#7ef9ff',
    band: ['#05102e', '#01030e'],
    title: ['#e9fff8', '#57f0ff', '#ff49b1'],
    filter: 'saturate(1.25) contrast(1.12) brightness(1.02)',
    tints: [
      { from: 'rgba(0,255,220,0.45)', to: 'rgba(255,0,160,0.38)', blend: 'screen', alpha: 0.30 },
      { from: 'rgba(0,220,255,0)', to: 'rgba(0,10,50,0.85)', blend: 'soft-light', alpha: 0.50 },
    ],
  },
  dusk: {
    label: 'Dusk',
    sky: ['#080b21', '#1d2a5e', '#5468b4'],
    sun: '#dfe8ff',
    glow: 'rgba(140,180,255,0.40)',
    accent: '#8fb7ff',
    sub: '#d7e6ff',
    band: ['#0a1030', '#02040f'],
    title: ['#eef3ff', '#9fc0ff', '#6f7dff'],
    filter: 'saturate(1.05) contrast(1.10) brightness(0.98)',
    tints: [
      { from: 'rgba(90,140,255,0.40)', to: 'rgba(20,10,80,0.40)', blend: 'screen', alpha: 0.26 },
      { from: 'rgba(180,210,255,0)', to: 'rgba(4,6,30,0.82)', blend: 'soft-light', alpha: 0.52 },
    ],
  },
  gold: {
    label: 'Gold',
    sky: ['#1e1206', '#7a4210', '#ffc46b'],
    sun: '#fff3cf',
    glow: 'rgba(255,190,90,0.50)',
    accent: '#ffb437',
    sub: '#ffe6ad',
    band: ['#241405', '#0b0502'],
    title: ['#fff6d6', '#ffcc72', '#ff8a3d'],
    filter: 'saturate(1.12) contrast(1.06) brightness(1.02)',
    tints: [
      { from: 'rgba(255,200,110,0.42)', to: 'rgba(160,80,10,0.30)', blend: 'screen', alpha: 0.26 },
      { from: 'rgba(255,220,150,0)', to: 'rgba(70,35,5,0.82)', blend: 'soft-light', alpha: 0.52 },
    ],
  },
  noir: {
    label: 'Noir',
    sky: ['#0a0a10', '#26262f', '#7c7c88'],
    sun: '#f2f2f6',
    glow: 'rgba(220,220,240,0.35)',
    accent: '#e6e6f0',
    sub: '#f0f0f6',
    band: ['#101018', '#04040a'],
    title: ['#ffffff', '#d8d8e4', '#9aa0b4'],
    filter: 'grayscale(0.92) contrast(1.18) brightness(1.02)',
    tints: [
      { from: 'rgba(220,220,235,0.30)', to: 'rgba(20,20,30,0.35)', blend: 'screen', alpha: 0.20 },
      { from: 'rgba(255,255,255,0)', to: 'rgba(0,0,0,0.80)', blend: 'soft-light', alpha: 0.50 },
    ],
  },
};
