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

export const SPORT_OPTIONS: SportOption[] = [
  { value: 'running', label: 'Running', metric: 'distance' },
  { value: 'walking', label: 'Walking', metric: 'distance' },
  { value: 'cycling', label: 'Cycling', metric: 'distance' },
  { value: 'gym', label: 'Gym', metric: 'duration' },
  { value: 'swimming', label: 'Swimming', metric: 'duration' },
  { value: DAILY_STEPS_SPORT, label: 'Daily Steps', metric: 'steps' },
];

export const SPORT_COLORS: Record<string, string> = {
  running: '#8b5cf6',
  walking: '#f43f5e',
  cycling: '#fb923c',
  gym: '#2dd4bf',
  swimming: '#60a5fa',
  [DAILY_STEPS_SPORT]: '#f5b301',
};

export const SPORT_LABELS: Record<string, string> = {
  running: 'Running',
  walking: 'Walking',
  cycling: 'Cycling',
  gym: 'Gym',
  swimming: 'Swimming',
  [DAILY_STEPS_SPORT]: 'Daily Steps',
};
