import { Component, computed, input } from '@angular/core';

import { ActivityDto } from '../../../core/models/activity.model';
import { dayKey } from '../day-key';

@Component({
  selector: 'app-sport-stats',
  standalone: false,
  templateUrl: './sport-stats.html',
  styleUrl: './sport-stats.css',
})
export class SportStats {
  readonly activities = input<ActivityDto[]>([]);

  protected readonly totalSessions = computed(() => this.activities().length);

  protected readonly totalPoints = computed(() =>
    this.activities().reduce((sum, activity) => sum + activity.points, 0),
  );

  protected readonly bestSession = computed(() =>
    this.activities().reduce((best, activity) => Math.max(best, activity.points), 0),
  );

  protected readonly currentStreak = computed(() => {
    const days = new Set(this.activities().map((activity) => dayKey(new Date(activity.datetime))));
    if (days.size === 0) {
      return 0;
    }

    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    if (!days.has(dayKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }

    let streak = 0;
    while (days.has(dayKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  });
}
