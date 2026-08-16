import { Component, computed, input } from '@angular/core';

import { ActivityDto } from '../../../core/models/activity.model';
import { sportLabel } from '../sport-display';

interface RecentActivityRow {
  id: string;
  label: string;
  datetime: string;
  points: number;
}

@Component({
  selector: 'app-recent-activities',
  standalone: false,
  templateUrl: './recent-activities.html',
  styleUrl: './recent-activities.css',
})
export class RecentActivities {
  readonly recent = input<ActivityDto[]>([]);

  protected readonly recentActivities = computed<RecentActivityRow[]>(() =>
    this.recent().map((activity) => ({
      id: activity.id,
      label: sportLabel(activity.sport),
      datetime: activity.datetime,
      points: activity.points,
    })),
  );
}
