import { Component, effect, inject, input, output, signal } from '@angular/core';

import { ActivityDto } from '../../../core/models/activity.model';
import { ActivityService } from '../../../core/services/activity';
import { UserService } from '../../../core/services/user';
import { SPORT_LABELS } from '../sport-metadata';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-all-activities-modal',
  standalone: false,
  templateUrl: './all-activities-modal.html',
  styleUrl: './all-activities-modal.css',
})
export class AllActivitiesModal {
  private readonly activityService = inject(ActivityService);
  private readonly userService = inject(UserService);

  readonly open = input(false);
  readonly closed = output<void>();

  protected readonly entries = signal<ActivityDto[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly loading = signal(false);
  protected readonly loadingMore = signal(false);
  protected readonly error = signal(false);
  protected readonly hasMore = signal(false);

  protected readonly sportLabels = SPORT_LABELS;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.loadPage(0);
      }
    });
  }

  close() {
    this.closed.emit();
  }

  loadMore() {
    if (!this.hasMore() || this.loadingMore()) {
      return;
    }
    this.loadPage(this.entries().length);
  }

  private loadPage(offset: number) {
    const userId = this.userService.getStoredUserId();
    if (!userId) {
      return;
    }

    const loadingSignal = offset === 0 ? this.loading : this.loadingMore;
    loadingSignal.set(true);

    this.activityService.getByUser(userId, offset, PAGE_SIZE).subscribe({
      next: (page) => {
        this.entries.set(offset === 0 ? page.entries : [...this.entries(), ...page.entries]);
        this.totalCount.set(page.totalCount);
        this.hasMore.set(page.hasMore);
        this.error.set(false);
        loadingSignal.set(false);
      },
      error: () => {
        this.error.set(true);
        loadingSignal.set(false);
      },
    });
  }
}
