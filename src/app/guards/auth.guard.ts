import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedInValue) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};

export const roleGuard = (requiredRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedInValue) {
      router.navigate(['/home']);
      return false;
    }

    const currentRole = authService.userRoleValue;
    if (currentRole && requiredRoles.includes(currentRole)) {
      return true;
    }

    // Role does not match, redirect to user's dashboard or home
    authService.navigateToDashboard();
    return false;
  };
};
