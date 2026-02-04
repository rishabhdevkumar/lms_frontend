import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./admin/pages/dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'faculty-dashboard',
    loadComponent: () => import('./faculty/pages/faculty-dashboard/faculty-dashboard.page').then( m => m.FacultyDashboardPage)
  },
  {
    path: 'faculty-profile',
    loadComponent: () => import('./faculty/pages/faculty-profile/faculty-profile.page').then( m => m.FacultyProfilePage)
  },
  {
    path: 'student-dashboard',
    loadComponent: () => import('./student/pages/student-dashboard/student-dashboard.page').then( m => m.StudentDashboardPage)
  },
  {
    path: 'student-profile',
    loadComponent: () => import('./student/pages/student-profile/student-profile.page').then( m => m.StudentProfilePage)
  },
];
