import { Component, input, output } from '@angular/core';

import { UserDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-summary-banner',
  standalone: false,
  templateUrl: './summary-banner.html',
  styleUrl: './summary-banner.css',
})
export class SummaryBanner {
  readonly user = input.required<UserDto>();
  readonly streak = input(0);

  readonly logActivity = output<void>();
  readonly viewActivities = output<void>();
}
