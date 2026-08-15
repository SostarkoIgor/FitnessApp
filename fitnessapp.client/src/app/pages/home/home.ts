import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { ActivityService } from '../../core/services/activity';
import { ActivityDto } from '../../core/models/activity.model';
import { UserDto } from '../../core/models/user.model';
import { UserService } from '../../core/services/user';
import { dayKey } from './day-key';

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

  protected readonly activities = signal<ActivityDto[]>([]);
  protected readonly statsLoading = signal(true);

  protected readonly showLogForm = signal(false);

  protected readonly hasActivities = computed(() => this.activities().length > 0);

  protected readonly currentStreak = computed(() => {
    const days = new Set(this.activities().map((a) => dayKey(new Date(a.datetime))));
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

  ngOnInit() {
    this.loadUser();
  }

  openLogForm() {
    this.showLogForm.set(true);
  }

  closeLogForm() {
    this.showLogForm.set(false);
  }

  onActivityAdded() {
    this.loadUser();
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

    this.activityService.getByUser(userId).subscribe({
      next: (activities) => {
        this.activities.set(activities);
        this.statsLoading.set(false);
      },
      error: () => {
        this.statsLoading.set(false);
      },
    });
  }
}
