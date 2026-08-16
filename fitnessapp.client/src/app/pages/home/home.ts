import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { ActivityService } from '../../core/services/activity';
import { ActivityStatsDto } from '../../core/models/activity.model';
import { UserDto } from '../../core/models/user.model';
import { UserService } from '../../core/services/user';
import { SPORT_LABELS } from './sport-metadata';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly userService = inject(UserService);
  private readonly activityService = inject(ActivityService);

  protected readonly user = signal<UserDto | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected readonly stats = signal<ActivityStatsDto | null>(null);
  protected readonly statsLoading = signal(true);

  protected readonly showLogForm = signal(false);
  protected readonly showAllActivities = signal(false);
  protected readonly refreshToken = signal(0);

  protected readonly hasActivities = computed(() => (this.stats()?.totalActivities ?? 0) > 0);

  protected readonly sportChoices = computed(() =>
    (this.stats()?.sportBreakdown ?? []).map(({ sport }) => ({
      value: sport,
      label: SPORT_LABELS[sport] ?? sport,
    })),
  );

  ngOnInit() {
    this.loadUser();
  }

  openLogForm() {
    this.showLogForm.set(true);
  }

  closeLogForm() {
    this.showLogForm.set(false);
  }

  openAllActivities() {
    this.showAllActivities.set(true);
  }

  closeAllActivities() {
    this.showAllActivities.set(false);
  }

  onActivityAdded() {
    this.loadUser();
    this.refreshToken.update((token) => token + 1);
  }

  private loadUser() {
    const userId = this.userService.getStoredUserId();
    if (!userId) {
      this.loading.set(false);
      this.error.set(true);
      this.statsLoading.set(false);
      return;
    }

    this.userService.getById(userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });

    this.activityService.getStats(userId).subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.statsLoading.set(false);
      },
      error: () => {
        this.statsLoading.set(false);
      },
    });
  }
}
