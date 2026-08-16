import { Component, computed, input } from '@angular/core';

import { DailyPointsDto } from '../../../core/models/activity.model';
import { parseDateOnly } from '../day-key';
import { sportLabel } from '../sport-display';

@Component({
  selector: 'app-stat-tiles',
  standalone: false,
  templateUrl: './stat-tiles.html',
  styleUrl: './stat-tiles.css',
})
export class StatTiles {
  readonly totalActivities = input(0);
  readonly totalDistance = input(0);
  readonly averagePoints = input(0);
  readonly topSport = input<string | null>(null);
  readonly bestDay = input<DailyPointsDto | null>(null);

  protected readonly topSportLabel = computed(() => {
    const sport = this.topSport();
    return sport ? sportLabel(sport) : null;
  });

  protected readonly bestDayDisplay = computed(() => {
    const best = this.bestDay();
    return best ? { date: parseDateOnly(best.date), points: best.points } : null;
  });
}
