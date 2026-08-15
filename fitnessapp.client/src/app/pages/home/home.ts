import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { ActivityService } from '../../core/services/activity';
import { ActivityDto } from '../../core/models/activity.model';
import { UserDto } from '../../core/models/user.model';
import { UserService } from '../../core/services/user';

type ActivityMetric = 'distance' | 'duration' | 'steps';

interface SportOption {
  value: string;
  label: string;
  metric: ActivityMetric;
}

const SPORT_OPTIONS: SportOption[] = [
  { value: 'running', label: 'Running', metric: 'distance' },
  { value: 'walking', label: 'Walking', metric: 'distance' },
  { value: 'cycling', label: 'Cycling', metric: 'distance' },
  { value: 'gym', label: 'Gym', metric: 'duration' },
  { value: 'swimming', label: 'Swimming', metric: 'duration' },
  { value: 'steps', label: 'Daily Steps', metric: 'steps' },
];

const SPORT_COLORS: Record<string, string> = {
  running: '#8b5cf6',
  walking: '#f43f5e',
  cycling: '#fb923c',
  gym: '#2dd4bf',
  swimming: '#60a5fa',
  daily_steps: '#f5b301',
};

const SPORT_LABELS: Record<string, string> = {
  running: 'Running',
  walking: 'Walking',
  cycling: 'Cycling',
  gym: 'Gym',
  swimming: 'Swimming',
  daily_steps: 'Daily Steps',
};

const CHART_WIDTH = 280;
const CHART_HEIGHT = 120;
const CHART_PADDING = 8;

interface ProgressionPoint {
  datetime: string;
  cumulative: number;
}

interface ProgressionLabel {
  pct: number;
  text: string;
}

interface SportSegment {
  sport: string;
  label: string;
  points: number;
  pct: number;
  start: number;
  end: number;
  color: string;
}

interface DayBar {
  label: string;
  points: number;
  pct: number;
  isToday: boolean;
}

interface RecentActivityRow {
  id: string;
  label: string;
  datetime: string;
  points: number;
}

interface BestDay {
  date: Date;
  points: number;
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly userService = inject(UserService);
  private readonly activityService = inject(ActivityService);
  private readonly fb = inject(FormBuilder);

  protected readonly user = signal<UserDto | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected readonly activities = signal<ActivityDto[]>([]);
  protected readonly statsLoading = signal(true);

  protected readonly sportOptions = SPORT_OPTIONS;
  protected readonly selectedMetric = signal<ActivityMetric>('distance');
  protected readonly submittingActivity = signal(false);
  protected readonly activityErrors = signal<string[]>([]);
  protected readonly activitySuccess = signal(false);
  protected readonly showLogForm = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    sport: ['running', Validators.required],
    datetime: [this.nowLocal(), Validators.required],
    distance: this.fb.control<number | null>(null),
    duration: [''],
    steps: this.fb.control<number | null>(null),
  });

  protected readonly totalActivities = computed(() => this.activities().length);

  protected readonly totalDistance = computed(() =>
    this.activities().reduce((sum, activity) => sum + (activity.distance ?? 0), 0),
  );

  protected readonly totalPoints = computed(() =>
    this.activities().reduce((sum, activity) => sum + activity.points, 0),
  );

  protected readonly averagePoints = computed(() => {
    const count = this.totalActivities();
    return count > 0 ? Math.round(this.totalPoints() / count) : 0;
  });

  protected readonly currentStreak = computed(() => {
    const days = new Set(this.activities().map((a) => this.dayKey(new Date(a.datetime))));
    if (days.size === 0) {
      return 0;
    }

    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    if (!days.has(this.dayKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }

    let streak = 0;
    while (days.has(this.dayKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  });

  protected readonly bestDay = computed<BestDay | null>(() => {
    const totals = new Map<string, { date: Date; points: number }>();
    for (const activity of this.activities()) {
      const date = new Date(activity.datetime);
      date.setHours(0, 0, 0, 0);
      const key = this.dayKey(date);
      const existing = totals.get(key);
      totals.set(key, { date, points: (existing?.points ?? 0) + activity.points });
    }

    let best: BestDay | null = null;
    for (const entry of totals.values()) {
      if (!best || entry.points > best.points) {
        best = entry;
      }
    }
    return best;
  });

  protected readonly weeklyBars = computed<DayBar[]>(() => {
    const totalsByDay = new Map<string, number>();
    for (const activity of this.activities()) {
      const date = new Date(activity.datetime);
      date.setHours(0, 0, 0, 0);
      const key = this.dayKey(date);
      totalsByDay.set(key, (totalsByDay.get(key) ?? 0) + activity.points);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rawDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return {
        date,
        points: totalsByDay.get(this.dayKey(date)) ?? 0,
      };
    });

    const max = Math.max(...rawDays.map((d) => d.points), 1);

    return rawDays.map((d) => ({
      label: d.date.toLocaleDateString(undefined, { weekday: 'short' }),
      points: d.points,
      pct: (d.points / max) * 100,
      isToday: this.dayKey(d.date) === this.dayKey(today),
    }));
  });

  protected readonly progression = computed<ProgressionPoint[]>(() => {
    const sorted = [...this.activities()].sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
    );

    let cumulative = 0;
    return sorted.map((activity) => {
      cumulative += activity.points;
      return { datetime: activity.datetime, cumulative };
    });
  });

  protected readonly progressionPath = computed(() => {
    const points = this.progression();
    if (points.length === 0) {
      return '';
    }

    const max = Math.max(...points.map((p) => p.cumulative), 1);
    const stepX = points.length > 1 ? (CHART_WIDTH - CHART_PADDING * 2) / (points.length - 1) : 0;

    return points
      .map((point, index) => {
        const x = CHART_PADDING + index * stepX;
        const y = CHART_HEIGHT - CHART_PADDING - (point.cumulative / max) * (CHART_HEIGHT - CHART_PADDING * 2);
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });

  protected readonly progressionYAxis = computed<string[]>(() => {
    const points = this.progression();
    const max = points.length ? Math.max(...points.map((p) => p.cumulative), 1) : 1;
    return [Math.round(max).toLocaleString(), Math.round(max / 2).toLocaleString(), '0'];
  });

  protected readonly progressionLabels = computed<ProgressionLabel[]>(() => {
    const points = this.progression();
    if (points.length === 0) {
      return [];
    }

    const format = (iso: string) =>
      new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    if (points.length === 1) {
      return [{ pct: 50, text: format(points[0].datetime) }];
    }

    const indices =
      points.length <= 3
        ? points.map((_, i) => i)
        : [0, Math.floor((points.length - 1) / 2), points.length - 1];

    return indices.map((i) => ({
      pct: (i / (points.length - 1)) * 100,
      text: format(points[i].datetime),
    }));
  });

  protected readonly sportBreakdown = computed<SportSegment[]>(() => {
    const totals = new Map<string, number>();
    for (const activity of this.activities()) {
      totals.set(activity.sport, (totals.get(activity.sport) ?? 0) + activity.points);
    }

    const totalPoints = [...totals.values()].reduce((sum, value) => sum + value, 0);

    let cursor = 0;
    return [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([sport, points]) => {
        const pct = totalPoints > 0 ? (points / totalPoints) * 100 : 0;
        const start = cursor;
        cursor += pct;
        return {
          sport,
          label: SPORT_LABELS[sport] ?? sport,
          points,
          pct,
          start,
          end: cursor,
          color: SPORT_COLORS[sport] ?? '#8892a6',
        };
      });
  });

  protected readonly pieBackground = computed(() => {
    const segments = this.sportBreakdown();
    if (segments.length === 0) {
      return 'transparent';
    }

    return `conic-gradient(${segments.map((s) => `${s.color} ${s.start}% ${s.end}%`).join(', ')})`;
  });

  protected readonly recentActivities = computed<RecentActivityRow[]>(() =>
    [...this.activities()]
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
      .slice(0, 6)
      .map((activity) => ({
        id: activity.id,
        label: SPORT_LABELS[activity.sport] ?? activity.sport,
        datetime: activity.datetime,
        points: activity.points,
      })),
  );

  ngOnInit() {
    this.form.controls.sport.valueChanges.subscribe((sport) => this.applyMetricValidators(sport));
    this.applyMetricValidators(this.form.controls.sport.value);

    this.loadUser();
  }

  openLogForm() {
    this.activityErrors.set([]);
    this.activitySuccess.set(false);
    this.showLogForm.set(true);
  }

  closeLogForm() {
    this.showLogForm.set(false);
  }

  submitActivity() {
    const userId = this.userService.getStoredUserId();
    if (this.form.invalid || this.submittingActivity() || !userId) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const metric = this.selectedMetric();

    this.submittingActivity.set(true);
    this.activityErrors.set([]);

    this.activityService
      .create({
        userId,
        datetime: new Date(raw.datetime).toISOString(),
        sport: raw.sport === 'steps' ? undefined : raw.sport,
        distance: metric === 'distance' ? Number(raw.distance) : undefined,
        duration: metric === 'duration' ? raw.duration : undefined,
        steps: metric === 'steps' ? Number(raw.steps) : undefined,
      })
      .subscribe({
        next: () => {
          this.submittingActivity.set(false);
          this.activitySuccess.set(true);
          this.form.reset({
            sport: raw.sport,
            datetime: this.nowLocal(),
            distance: null,
            duration: '',
            steps: null,
          });
          this.loadUser();
          setTimeout(() => {
            this.activitySuccess.set(false);
            this.showLogForm.set(false);
          }, 1400);
        },
        error: (err: HttpErrorResponse) => {
          this.submittingActivity.set(false);
          this.activityErrors.set(err.error?.errors ?? ['Could not add activity. Please try again.']);
        },
      });
  }

  private loadUser() {
    const userId = this.userService.getStoredUserId();
    if (!userId) {
      this.loading.set(false);
      this.error.set(true);
      this.statsLoading.set(false);
      return;
    }

    this.userService.getById(userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });

    this.activityService.getByUser(userId).subscribe({
      next: (activities) => {
        this.activities.set(activities);
        this.statsLoading.set(false);
      },
      error: () => {
        this.statsLoading.set(false);
      },
    });
  }

  private applyMetricValidators(sport: string) {
    const metric = SPORT_OPTIONS.find((option) => option.value === sport)?.metric ?? 'distance';
    this.selectedMetric.set(metric);

    const { distance, duration, steps } = this.form.controls;
    distance.clearValidators();
    duration.clearValidators();
    steps.clearValidators();

    if (metric === 'distance') {
      distance.setValidators([Validators.required, Validators.min(0.01)]);
    } else if (metric === 'duration') {
      duration.setValidators([Validators.required, Validators.pattern(/^\d+:[0-5]\d$/)]);
    } else {
      steps.setValidators([Validators.required, Validators.min(1)]);
    }

    distance.updateValueAndValidity({ emitEvent: false });
    duration.updateValueAndValidity({ emitEvent: false });
    steps.updateValueAndValidity({ emitEvent: false });
  }

  private dayKey(date: Date): string {
    return date.toDateString();
  }

  private nowLocal(): string {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }
}
