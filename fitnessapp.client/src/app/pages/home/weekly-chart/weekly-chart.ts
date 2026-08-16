import { Component, computed, input } from '@angular/core';

import { DailyPointsDto } from '../../../core/models/activity.model';
import { dateOnlyKey, parseDateOnly } from '../day-key';

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
  readonly last7Days = input<DailyPointsDto[]>([]);

  protected readonly weeklyBars = computed<DayBar[]>(() => {
    const days = this.last7Days();
    const today = dateOnlyKey(new Date());
    const max = Math.max(...days.map((d) => d.points), 1);

    return days.map((d) => ({
      label: parseDateOnly(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
      points: d.points,
      pct: (d.points / max) * 100,
      isToday: d.date === today,
    }));
  });
}
