// Chart-segment colours from the Trove v3 palette, keyed by sector.
const SECTOR_COLORS: Record<string, string> = {
  Technology: '#059a83',
  Finance: '#7b79c9',
  Healthcare: '#00b6df',
  Automotive: '#00323d',
  Entertainment: '#f2c891',
};

const FALLBACK_COLOR = '#92a29f';

export function getSectorColor(sector: string): string {
  return SECTOR_COLORS[sector] ?? FALLBACK_COLOR;
}
