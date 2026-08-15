import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { LeaderboardEntryDto } from '../../core/models/user.model';
import { UserService } from '../../core/services/user';

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
  protected readonly error = signal(false);
  protected readonly currentUserId = this.userService.getStoredUserId();

  protected readonly top3 = computed(() => this.entries().slice(0, 3));
  protected readonly rest = computed(() => this.entries().slice(3));

  ngOnInit() {
    this.userService.getLeaderboard().subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}
