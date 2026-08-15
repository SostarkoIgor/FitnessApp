import { Component, computed, input } from '@angular/core';

import { ActivityDto } from '../../../core/models/activity.model';
import { SPORT_COLORS, SPORT_LABELS } from '../sport-metadata';

interface SportSegment {
  sport: string;
  label: string;
  points: number;
  pct: number;
  start: number;
  end: number;
  color: string;
}

@Component({
  selector: 'app-sport-breakdown',
  standalone: false,
  templateUrl: './sport-breakdown.html',
  styleUrl: './sport-breakdown.css',
})
export class SportBreakdown {
  readonly activities = input<ActivityDto[]>([]);

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
}
