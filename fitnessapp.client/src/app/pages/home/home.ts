import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { ActivityService } from '../../core/services/activity';
import { UserDto } from '../../core/models/user.model';
import { UserService } from '../../core/services/user';

type ActivityMetric = 'distance' | 'duration' | 'steps';

interface SportOption {
  value: string;
  label: string;
  metric: ActivityMetric;
}

const SPORT_OPTIONS: SportOption[] = [
  { value: 'running', label: '🏃 Running', metric: 'distance' },
  { value: 'walking', label: '🚶 Walking', metric: 'distance' },
  { value: 'cycling', label: '🚴 Cycling', metric: 'distance' },
  { value: 'gym', label: '🏋️ Gym', metric: 'duration' },
  { value: 'swimming', label: '🏊 Swimming', metric: 'duration' },
  { value: 'steps', label: '👣 Daily Steps', metric: 'steps' },
];

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly userService = inject(UserService);
  private readonly activityService = inject(ActivityService);
  private readonly fb = inject(FormBuilder);

  protected readonly user = signal<UserDto | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected readonly sportOptions = SPORT_OPTIONS;
  protected readonly selectedMetric = signal<ActivityMetric>('distance');
  protected readonly submittingActivity = signal(false);
  protected readonly activityErrors = signal<string[]>([]);
  protected readonly activitySuccess = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    sport: ['running', Validators.required],
    datetime: [this.nowLocal(), Validators.required],
    distance: this.fb.control<number | null>(null),
    duration: [''],
    steps: this.fb.control<number | null>(null),
  });

  ngOnInit() {
    this.form.controls.sport.valueChanges.subscribe((sport) => this.applyMetricValidators(sport));
    this.applyMetricValidators(this.form.controls.sport.value);

    this.loadUser();
  }

  submitActivity() {
    const userId = this.userService.getStoredUserId();
    if (this.form.invalid || this.submittingActivity() || !userId) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const metric = this.selectedMetric();

    this.submittingActivity.set(true);
    this.activityErrors.set([]);

    this.activityService
      .create({
        userId,
        datetime: new Date(raw.datetime).toISOString(),
        sport: raw.sport === 'steps' ? undefined : raw.sport,
        distance: metric === 'distance' ? Number(raw.distance) : undefined,
        duration: metric === 'duration' ? raw.duration : undefined,
        steps: metric === 'steps' ? Number(raw.steps) : undefined,
      })
      .subscribe({
        next: () => {
          this.submittingActivity.set(false);
          this.activitySuccess.set(true);
          this.form.reset({
            sport: raw.sport,
            datetime: this.nowLocal(),
            distance: null,
            duration: '',
            steps: null,
          });
          this.loadUser();
          setTimeout(() => this.activitySuccess.set(false), 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.submittingActivity.set(false);
          this.activityErrors.set(err.error?.errors ?? ['Could not add activity. Please try again.']);
        },
      });
  }

  private loadUser() {
    const userId = this.userService.getStoredUserId();
    if (!userId) {
      this.loading.set(false);
      this.error.set(true);
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
  }

  private applyMetricValidators(sport: string) {
    const metric = SPORT_OPTIONS.find((option) => option.value === sport)?.metric ?? 'distance';
    this.selectedMetric.set(metric);

    const { distance, duration, steps } = this.form.controls;
    distance.clearValidators();
    duration.clearValidators();
    steps.clearValidators();

    if (metric === 'distance') {
      distance.setValidators([Validators.required, Validators.min(0.01)]);
    } else if (metric === 'duration') {
      duration.setValidators([Validators.required, Validators.pattern(/^\d+:[0-5]\d$/)]);
    } else {
      steps.setValidators([Validators.required, Validators.min(1)]);
    }

    distance.updateValueAndValidity({ emitEvent: false });
    duration.updateValueAndValidity({ emitEvent: false });
    steps.updateValueAndValidity({ emitEvent: false });
  }

  private nowLocal(): string {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }
}
