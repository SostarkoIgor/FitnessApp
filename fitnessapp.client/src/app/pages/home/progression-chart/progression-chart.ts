import { Component, computed, input } from '@angular/core';

import { DailyPointsDto } from '../../../core/models/activity.model';
import { parseDateOnly } from '../day-key';

const CHART_WIDTH = 280;
const CHART_HEIGHT = 120;
const CHART_PADDING = 8;

interface ProgressionPoint {
  date: string;
  cumulative: number;
}

interface ProgressionLabel {
  pct: number;
  text: string;
}

@Component({
  selector: 'app-progression-chart',
  standalone: false,
  templateUrl: './progression-chart.html',
  styleUrl: './progression-chart.css',
})
export class ProgressionChart {
  readonly dailyPoints = input<DailyPointsDto[]>([]);

  protected readonly progression = computed<ProgressionPoint[]>(() => {
    let cumulative = 0;
    return this.dailyPoints().map((day) => {
      cumulative += day.points;
      return { date: day.date, cumulative };
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

    const format = (isoDate: string) =>
      parseDateOnly(isoDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    if (points.length === 1) {
      return [{ pct: 50, text: format(points[0].date) }];
    }

    const indices =
      points.length <= 3
        ? points.map((_, i) => i)
        : [0, Math.floor((points.length - 1) / 2), points.length - 1];

    return indices.map((i) => ({
      pct: (i / (points.length - 1)) * 100,
      text: format(points[i].date),
    }));
  });
}
