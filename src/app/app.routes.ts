import { Routes } from '@angular/router';
import { SidebarComponent } from './admin/components/sidebar/sidebar.component';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },

  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },

  {
    path: 'sign-up',
    loadComponent: () =>
      import('./sign-up/sign-up.page').then((m) => m.SignUpPage),
  },
  {
    path: 'admin',
    component: SidebarComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/pages/dashboard/dashboard.page').then(
            (m) => m.DashboardPage,
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'faculty-dashboard',
    loadComponent: () =>
      import('./faculty/pages/faculty-dashboard/faculty-dashboard.page').then(
        (m) => m.FacultyDashboardPage,
      ),
  },
  {
    path: 'student-dashboard',
    loadComponent: () =>
      import('./student/pages/student-dashboard/student-dashboard.page').then(
        (m) => m.StudentDashboardPage,
      ),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
