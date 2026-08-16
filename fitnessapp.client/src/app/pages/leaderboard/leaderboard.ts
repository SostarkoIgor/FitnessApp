import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { LeaderboardEntryDto } from '../../core/models/user.model';
import { UserService } from '../../core/services/user';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-leaderboard',
  standalone: false,
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css',
})
export class Leaderboard implements OnInit {
  private readonly userService = inject(UserService);

  protected readonly entries = signal<LeaderboardEntryDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadingMore = signal(false);
  protected readonly error = signal(false);
  protected readonly hasMore = signal(false);
  protected readonly currentUserId = this.userService.getStoredUserId();

  protected readonly myPosition = signal<LeaderboardEntryDto[]>([]);

  protected readonly top3 = computed(() => this.entries().slice(0, 3));
  protected readonly rest = computed(() => this.entries().slice(3));

  protected readonly showMyPosition = computed(
    () => this.myPosition().length > 0 && !this.entries().some((e) => e.userId === this.currentUserId),
  );

  ngOnInit() {
    this.loadPage(0);

    if (this.currentUserId) {
      this.userService.getLeaderboardAroundUser(this.currentUserId).subscribe({
        next: (entries) => this.myPosition.set(entries),
        error: () => this.myPosition.set([]),
      });
    }
  }

  loadMore() {
    if (!this.hasMore() || this.loadingMore()) {
      return;
    }
    this.loadPage(this.entries().length);
  }

  private loadPage(offset: number) {
    const loadingSignal = offset === 0 ? this.loading : this.loadingMore;
    loadingSignal.set(true);

    this.userService.getLeaderboard(offset, PAGE_SIZE).subscribe({
      next: (page) => {
        this.entries.set(offset === 0 ? page.entries : [...this.entries(), ...page.entries]);
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
