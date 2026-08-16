export type ActivityMetric = 'distance' | 'duration' | 'steps';

export interface SportOption {
  value: string;
  label: string;
  metric: ActivityMetric;
}

// The backend has no "daily_steps" sport of its own: it infers this name when a
// request omits `sport` and includes `steps` (and rejects it if sent explicitly),
// so this value must match the DailyStepsSportName sentinel the API resolves to.
export const DAILY_STEPS_SPORT = 'daily_steps';

// Which sports exist and what metric they use is authoritative from the backend
// (`GET /api/sports`) — see SportService. Nothing below names a specific sport:
// labels are derived from the raw name, and colors are deterministically assigned
// from a fixed validated palette, so a sport added server-side needs no frontend
// change at all.

// Validated categorical palette, fixed order (dataviz skill, references/palette.md).
// Only the first 3 slots are guaranteed pairwise-distinct under CVD simulation when
// every series is visible at once (as in this app's sport-breakdown pie chart); past
// that the ordering itself is what's fixed; some pairs among slots 4-8 lean on the
// legend's text labels (already rendered alongside every wedge) as the required
// relief channel rather than on hue alone.
const CATEGORICAL_PALETTE = [
  '#2a78d6', // 1 blue
  '#eb6834', // 2 orange
  '#1baf7a', // 3 aqua
  '#eda100', // 4 yellow
  '#e87ba4', // 5 magenta
  '#008300', // 6 green
  '#4a3aa7', // 7 violet
  '#e34948', // 8 red
];

export function sportLabel(name: string): string {
  return name
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const DEFAULT_SPORT_COLOR = '#8892a6';

// Assigns each sport a color by its position in a canonical, stably-ordered list
// (GET /api/sports, which the backend returns ordered by id — i.e. insertion order).
// Hashing each name independently was tried first and rejected: with only a
// handful of sports, independent hashes collide far more often than intuition
// suggests (birthday paradox) — even a well-distributed hash (FNV-1a) put 3 of
// this app's 6 seeded sports in the same slot. Positional assignment from a stable
// order guarantees no collisions for up to 8 sports and never repaints an existing
// sport's color as new ones are added, since new sports only ever append.
export function buildSportColorMap(sportNames: readonly string[]): ReadonlyMap<string, string> {
  const map = new Map<string, string>();
  sportNames.forEach((name, index) => {
    map.set(name, CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length]);
  });
  return map;
}

// The backend's metric-type vocabulary ("count") differs from the frontend's, which
// names it after the request field it maps to ("steps") — see CreateActivityRequest.
export function toActivityMetric(metricType: 'distance' | 'duration' | 'count'): ActivityMetric {
  return metricType === 'count' ? 'steps' : metricType;
}
