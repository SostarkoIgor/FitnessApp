import { Component, computed, input } from '@angular/core';

import { ActivityDto } from '../../../core/models/activity.model';
import { dayKey } from '../day-key';
import { SPORT_LABELS } from '../sport-metadata';

interface BestDay {
  date: Date;
  points: number;
}

@Component({
  selector: 'app-stat-tiles',
  standalone: false,
  templateUrl: './stat-tiles.html',
  styleUrl: './stat-tiles.css',
})
export class StatTiles {
  readonly activities = input<ActivityDto[]>([]);

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

  protected readonly topSportLabel = computed(() => {
    const totals = new Map<string, number>();
    for (const activity of this.activities()) {
      totals.set(activity.sport, (totals.get(activity.sport) ?? 0) + activity.points);
    }

    let topSport: string | null = null;
    let topPoints = -1;
    for (const [sport, points] of totals) {
      if (points > topPoints) {
        topSport = sport;
        topPoints = points;
      }
    }

    return topSport ? (SPORT_LABELS[topSport] ?? topSport) : null;
  });

  protected readonly bestDay = computed<BestDay | null>(() => {
    const totals = new Map<string, { date: Date; points: number }>();
    for (const activity of this.activities()) {
      const date = new Date(activity.datetime);
      date.setHours(0, 0, 0, 0);
      const key = dayKey(date);
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
}
