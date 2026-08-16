import { Component, input } from '@angular/core';

@Component({
  selector: 'app-sport-stats',
  standalone: false,
  templateUrl: './sport-stats.html',
  styleUrl: './sport-stats.css',
})
export class SportStats {
  readonly totalSessions = input(0);
  readonly totalPoints = input(0);
  readonly bestSession = input(0);
  readonly currentStreak = input(0);
}
