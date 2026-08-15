import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserService } from '../services/user';

export const authGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.getStoredUserId()) {
    return true;
  }

  return router.createUrlTree(['/register']);
};

export const guestGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (!userService.getStoredUserId()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
