import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../../core/services/user';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
  });

  protected readonly submitting = signal(false);
  protected readonly errors = signal<string[]>([]);

  protected readonly idForm = this.fb.nonNullable.group({
    userId: ['', [Validators.required]],
  });

  protected readonly continuing = signal(false);
  protected readonly idError = signal<string | null>(null);

  submit() {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errors.set([]);

    this.userService.register(this.form.getRawValue()).subscribe({
      next: ({ id }) => {
        this.userService.setStoredUserId(id);
        this.router.navigateByUrl('/');
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errors.set(err.error?.errors ?? ['Could not register. Please try again.']);
      },
    });
  }

  continueWithId() {
    if (this.idForm.invalid || this.continuing()) {
      this.idForm.markAllAsTouched();
      return;
    }

    const userId = this.idForm.getRawValue().userId.trim();

    this.continuing.set(true);
    this.idError.set(null);

    this.userService.getById(userId).subscribe({
      next: () => {
        this.userService.setStoredUserId(userId);
        this.router.navigateByUrl('/');
      },
      error: () => {
        this.continuing.set(false);
        this.idError.set('No user found with that ID.');
      },
    });
  }
}
