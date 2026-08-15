import { Component, computed, input } from '@angular/core';

import { ActivityDto } from '../../../core/models/activity.model';
import { dayKey } from '../day-key';

interface DayBar {
  label: string;
  points: number;
  pct: number;
  isToday: boolean;
}

@Component({
  selector: 'app-weekly-chart',
  standalone: false,
  templateUrl: './weekly-chart.html',
  styleUrl: './weekly-chart.css',
})
export class WeeklyChart {
  readonly activities = input<ActivityDto[]>([]);

  protected readonly weeklyBars = computed<DayBar[]>(() => {
    const totalsByDay = new Map<string, number>();
    for (const activity of this.activities()) {
      const date = new Date(activity.datetime);
      date.setHours(0, 0, 0, 0);
      const key = dayKey(date);
      totalsByDay.set(key, (totalsByDay.get(key) ?? 0) + activity.points);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rawDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return {
        date,
        points: totalsByDay.get(dayKey(date)) ?? 0,
      };
    });

    const max = Math.max(...rawDays.map((d) => d.points), 1);

    return rawDays.map((d) => ({
      label: d.date.toLocaleDateString(undefined, { weekday: 'short' }),
      points: d.points,
      pct: (d.points / max) * 100,
      isToday: dayKey(d.date) === dayKey(today),
    }));
  });
}
