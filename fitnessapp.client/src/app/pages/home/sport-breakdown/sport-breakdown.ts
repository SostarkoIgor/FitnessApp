import { Component, computed, input } from '@angular/core';

import { SportPointsDto } from '../../../core/models/activity.model';
import { DEFAULT_SPORT_COLOR, buildSportColorMap, sportLabel } from '../sport-display';

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
  readonly breakdown = input<SportPointsDto[]>([]);

  // The canonical, stably-ordered sport list (see SportService) — used only to
  // assign each sport a stable color by position, never to filter/order the
  // breakdown itself (that stays driven by `breakdown`'s own points-desc order).
  readonly sportOrder = input<string[]>([]);

  private readonly colorMap = computed(() => buildSportColorMap(this.sportOrder()));

  protected readonly sportBreakdown = computed<SportSegment[]>(() => {
    const entries = this.breakdown();
    const totalPoints = entries.reduce((sum, entry) => sum + entry.points, 0);
    const colorMap = this.colorMap();

    let cursor = 0;
    return entries.map(({ sport, points }) => {
      const pct = totalPoints > 0 ? (points / totalPoints) * 100 : 0;
      const start = cursor;
      cursor += pct;
      return {
        sport,
        label: sportLabel(sport),
        points,
        pct,
        start,
        end: cursor,
        color: colorMap.get(sport) ?? DEFAULT_SPORT_COLOR,
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
