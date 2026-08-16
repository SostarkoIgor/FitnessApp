import { Component, computed, input, signal } from '@angular/core';

import { ActivityDto } from '../../../core/models/activity.model';
import { SPORT_LABELS } from '../sport-metadata';

interface SportChoice {
  value: string;
  label: string;
}

@Component({
  selector: 'app-sport-detail',
  standalone: false,
  templateUrl: './sport-detail.html',
  styleUrl: './sport-detail.css',
})
export class SportDetail {
  readonly activities = input<ActivityDto[]>([]);

  protected readonly selectedSport = signal<string | null>(null);

  protected readonly sportChoices = computed<SportChoice[]>(() => {
    const totals = new Map<string, number>();
    for (const activity of this.activities()) {
      totals.set(activity.sport, (totals.get(activity.sport) ?? 0) + 1);
    }

    return [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([sport]) => ({ value: sport, label: SPORT_LABELS[sport] ?? sport }));
  });

  protected readonly activeSport = computed(
    () => this.selectedSport() ?? this.sportChoices()[0]?.value ?? null,
  );

  protected readonly filteredActivities = computed(() => {
    const sport = this.activeSport();
    return sport ? this.activities().filter((activity) => activity.sport === sport) : [];
  });

  selectSport(sport: string) {
    this.selectedSport.set(sport);
  }
}
