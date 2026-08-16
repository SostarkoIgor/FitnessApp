import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';

import { ActivityService } from '../../../core/services/activity';
import { SportService } from '../../../core/services/sport';
import { UserService } from '../../../core/services/user';
import { ActivityMetric, DAILY_STEPS_SPORT, SportOption, sportLabel, toActivityMetric } from '../sport-display';

function notInFutureValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  return new Date(control.value) > new Date() ? { futureDate: true } : null;
}

@Component({
  selector: 'app-activity-form',
  standalone: false,
  templateUrl: './activity-form.html',
  styleUrl: './activity-form.css',
})
export class ActivityForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly activityService = inject(ActivityService);
  private readonly sportService = inject(SportService);
  private readonly userService = inject(UserService);

  protected readonly sportOptions = signal<SportOption[]>([]);
  protected readonly sportsLoading = signal(true);
  protected readonly sportsError = signal(false);

  readonly open = input(false);
  readonly closed = output<void>();
  readonly activityAdded = output<void>();

  protected readonly selectedMetric = signal<ActivityMetric>('distance');
  protected readonly submittingActivity = signal(false);
  protected readonly activityErrors = signal<string[]>([]);
  protected readonly activitySuccess = signal(false);

  protected readonly maxDatetime = this.nowLocal();

  protected readonly form = this.fb.nonNullable.group({
    sport: ['', Validators.required],
    datetime: [this.nowLocal(), [Validators.required, notInFutureValidator]],
    distance: this.fb.control<number | null>(null),
    duration: [''],
    steps: this.fb.control<number | null>(null),
  });

  ngOnInit() {
    this.form.controls.sport.valueChanges.subscribe((sport) => this.applyMetricValidators(sport));

    this.sportService.getAll().subscribe({
      next: (sports) => {
        const options = sports.map((sport) => ({
          value: sport.name,
          label: sportLabel(sport.name),
          metric: toActivityMetric(sport.metricType),
        }));
        this.sportOptions.set(options);
        this.sportsLoading.set(false);

        const defaultSport = options[0]?.value ?? '';
        this.form.controls.sport.setValue(defaultSport);
        this.applyMetricValidators(defaultSport);
      },
      error: () => {
        this.sportsLoading.set(false);
        this.sportsError.set(true);
      },
    });
  }

  close() {
    this.closed.emit();
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
        sport: raw.sport === DAILY_STEPS_SPORT ? undefined : raw.sport,
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
          this.activityAdded.emit();
          setTimeout(() => {
            this.activitySuccess.set(false);
            this.closed.emit();
          }, 1400);
        },
        error: (err: HttpErrorResponse) => {
          this.submittingActivity.set(false);
          this.activityErrors.set(err.error?.errors ?? ['Could not add activity. Please try again.']);
        },
      });
  }

  private applyMetricValidators(sport: string) {
    const metric = this.sportOptions().find((option) => option.value === sport)?.metric ?? 'distance';
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
