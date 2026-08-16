import { Component, computed, effect, inject, input, signal } from '@angular/core';

import { ActivityStatsDto } from '../../../core/models/activity.model';
import { ActivityService } from '../../../core/services/activity';
import { UserService } from '../../../core/services/user';

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
  private readonly activityService = inject(ActivityService);
  private readonly userService = inject(UserService);

  readonly sportChoices = input<SportChoice[]>([]);
  readonly refreshToken = input(0);

  protected readonly selectedSport = signal<string | null>(null);

  protected readonly activeSport = computed(
    () => this.selectedSport() ?? this.sportChoices()[0]?.value ?? null,
  );

  protected readonly stats = signal<ActivityStatsDto | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);

  constructor() {
    effect(() => {
      const sport = this.activeSport();
      this.refreshToken();
      this.loadStats(sport);
    });
  }

  selectSport(sport: string) {
    this.selectedSport.set(sport);
  }

  private loadStats(sport: string | null) {
    const userId = this.userService.getStoredUserId();
    if (!sport || !userId) {
      this.stats.set(null);
      return;
    }

    this.loading.set(true);
    this.error.set(false);

    this.activityService.getStats(userId, sport).subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}
