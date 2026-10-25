import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedInValue) {
    const user = authService.currentUserValue;
    const userStatus = String(user?.status || '').trim().toLowerCase();
    const isActive = user?.is_active;

    if (
      isActive === 0 ||
      isActive === false ||
      Number(isActive) === 0 ||
      userStatus.includes('deact') ||
      userStatus.includes('inact') ||
      userStatus.includes('lock') ||
      (userStatus !== '' && userStatus !== 'active')
    ) {
      authService.logout();
      router.navigate(['/login'], { queryParams: { deactivated: 'true' } });
      return false;
    }
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

    const user = authService.currentUserValue;
    const userStatus = String(user?.status || '').trim().toLowerCase();
    const isActive = user?.is_active;

    if (
      isActive === 0 ||
      isActive === false ||
      Number(isActive) === 0 ||
      userStatus.includes('deact') ||
      userStatus.includes('inact') ||
      userStatus.includes('lock') ||
      (userStatus !== '' && userStatus !== 'active')
    ) {
      authService.logout();
      router.navigate(['/login'], { queryParams: { deactivated: 'true' } });
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
