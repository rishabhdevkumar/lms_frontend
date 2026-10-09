import { Routes } from '@angular/router';
import { SidebarComponent } from './admin/components/sidebar/sidebar.component';
import { FacultySidebarComponent } from './faculty/components/faculty-sidebar/faculty-sidebar.component';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'courses',
    loadComponent: () => import('./pages/courses/courses.page').then((m) => m.CoursesPage),
  },
  {
    path: 'live-classes',
    loadComponent: () => import('./pages/live-classes/live-classes.page').then((m) => m.LiveClassesPage),
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing/pricing.page').then((m) => m.PricingPage),
  },



  /* ADMIN PANEL ROUTES */
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
        path: 'add-student',
        loadComponent: () =>
          import('./admin/pages/add-student/add-student.page').then(
            (m) => m.AddStudentPage,
          ),
      },
      {
        path: 'account-setting',
        loadComponent: () =>
          import('./admin/pages/account-setting/account-setting.page').then(
            (m) => m.AccountSettingPage,
          ),
      },
      {
        path: 'academic',
        loadComponent: () =>
          import('./admin/pages/academic/academic.page').then(
            (m) => m.AcademicPage,
          ),
      },
      {
        path: 'batches',
        loadComponent: () =>
          import('./admin/pages/batches/batches.page').then(
            (m) => m.BatchesPage,
          ),
      },
      {
        path: 'quizzes',
        loadComponent: () =>
          import('./admin/pages/quizzes/quizzes.page').then(
            (m) => m.QuizzesPage,
          ),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./admin/pages/payments/payments.page').then(
            (m) => m.PaymentsPage,
          ),
      },
      {
        path: 'certificates',
        loadComponent: () =>
          import('./admin/pages/certificates/certificates.page').then(
            (m) => m.CertificatesPage,
          ),
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('./admin/pages/attendance/attendance.page').then(
            (m) => m.AttendancePage,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./admin/pages/reports/reports.page').then(
            (m) => m.ReportsPage,
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  /* FACULTY PANEL ROUTES */
  {
    path: 'faculty',
    component: FacultySidebarComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./faculty/pages/faculty-dashboard/faculty-dashboard.page').then(
            (m) => m.FacultyDashboardPage,
          ),
      },
      {
        path: 'classes',
        loadComponent: () =>
          import('./faculty/pages/faculty-classes/faculty-classes.page').then(
            (m) => m.FacultyClassesPage,
          ),
      },
      {
        path: 'assignments',
        loadComponent: () =>
          import('./faculty/pages/faculty-assignments/faculty-assignments.page').then(
            (m) => m.FacultyAssignmentsPage,
          ),
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('./faculty/pages/faculty-attendance/faculty-attendance.page').then(
            (m) => m.FacultyAttendancePage,
          ),
      },
      {
        path: 'course-material',
        loadComponent: () =>
          import('./faculty/pages/faculty-material/faculty-material.page').then(
            (m) => m.FacultyMaterialPage,
          ),
      },
      {
        path: 'doubts',
        loadComponent: () =>
          import('./faculty/pages/faculty-doubts/faculty-doubts.page').then(
            (m) => m.FacultyDoubtsPage,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./faculty/pages/faculty-profile/faculty-profile.page').then(
            (m) => m.FacultyProfilePage,
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
    redirectTo: 'faculty/dashboard',
    pathMatch: 'full',
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
