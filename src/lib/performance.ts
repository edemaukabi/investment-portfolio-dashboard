/**
 * The dataset has no price history, so the net-worth chart plots a
 * synthesised series that always lands on the real current value.
 * A seeded generator keeps it stable across renders and reloads.
 */

export type RangeKey = '1D' | '1W' | '1M' | 'ALL';

interface TrendRange {
  key: RangeKey;
  label: string;
  points: number;
  drift: number;
  noise: number;
}

export interface TrendPoint {
  index: number;
  value: number;
}

export const TREND_RANGES: TrendRange[] = [
  { key: '1D', label: 'Today', points: 24, drift: 0.008, noise: 0.004 },
  { key: '1W', label: 'Past week', points: 28, drift: 0.02, noise: 0.008 },
  { key: '1M', label: 'Past month', points: 30, drift: 0.05, noise: 0.014 },
  { key: 'ALL', label: 'All time', points: 48, drift: 0.18, noise: 0.022 },
];

function mulberry32(seed: number): () => number {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildTrendSeries(endValue: number, rangeKey: RangeKey): TrendPoint[] {
  const range = TREND_RANGES.find((r) => r.key === rangeKey) ?? TREND_RANGES[0];
  const random = mulberry32(rangeKey.charCodeAt(0) * 7919 + range.points);

  const startValue = endValue / (1 + range.drift);
  const series: TrendPoint[] = [];

  for (let i = 0; i < range.points; i += 1) {
    const progress = i / (range.points - 1);
    const base = startValue + (endValue - startValue) * progress ** 1.4;
    const noise = (random() - 0.5) * endValue * range.noise;
    series.push({ index: i, value: i === range.points - 1 ? endValue : base + noise });
  }

  return series;
}
