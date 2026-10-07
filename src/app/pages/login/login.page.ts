import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService, UserRole } from '../../services/auth.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-login-page',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent]
})
export class LoginPage implements OnInit {
  authMode: 'signin' | 'signup' = 'signin';
  userRole: UserRole = 'student';

  email: string = '';
  password: string = '';
  fullName: string = '';
  confirmPassword: string = '';
  rememberMe: boolean = false;
  agreeTerms: boolean = false;

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Determine mode from route path or query params
    const currentPath = this.router.url;
    if (currentPath.includes('signup')) {
      this.authMode = 'signup';
    }

    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'signup') {
        this.authMode = 'signup';
      } else if (params['mode'] === 'signin') {
        this.authMode = 'signin';
      }

      if (params['role'] && ['student', 'faculty', 'admin'].includes(params['role'])) {
        this.userRole = params['role'] as UserRole;
      }
    });

    // If user is already logged in, redirect to dashboard
    if (this.authService.isLoggedInValue) {
      this.authService.navigateToDashboard();
    }
  }

  setAuthMode(mode: 'signin' | 'signup') {
    this.authMode = mode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  setUserRole(role: UserRole) {
    this.userRole = role;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    const cleanEmail = this.email ? this.email.trim() : '';
    const cleanPassword = this.password ? this.password.trim() : '';
    const cleanName = this.fullName ? this.fullName.trim() : '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    if (!cleanPassword || cleanPassword.length < 4) {
      this.errorMessage = 'Password must be at least 4 characters long.';
      return;
    }

    if (this.authMode === 'signup') {
      if (!cleanName || cleanName.length < 2) {
        this.errorMessage = 'Please enter your full name.';
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match.';
        return;
      }
      if (!this.agreeTerms) {
        this.errorMessage = 'You must agree to the Terms of Service & Privacy Policy.';
        return;
      }
    }

    this.isLoading = true;

    const roleToPass: UserRole = cleanEmail.toLowerCase().includes('admin') ? 'admin' : (this.userRole || 'student');

    if (this.authMode === 'signin') {
      this.authService.login(cleanEmail, cleanPassword, roleToPass).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.successMessage = res.message;
            setTimeout(() => {
              this.authService.navigateToDashboard(res.user?.role);
            }, 500);
          } else {
            this.errorMessage = res.message || 'Authentication failed.';
          }
        },
        error: (err) => {
          this.isLoading = false;
          const backendError = err?.error?.message || err?.statusText || err?.message || 'Authentication failed. Check credentials or connection.';
          this.errorMessage = Array.isArray(backendError) ? backendError.join(', ') : backendError;
        }
      });
    } else {
      this.authService.signup(cleanName, cleanEmail, cleanPassword, roleToPass).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.successMessage = res.message;
            setTimeout(() => {
              this.authService.navigateToDashboard(res.user?.role);
            }, 500);
          } else {
            this.errorMessage = res.message || 'Registration failed.';
          }
        },
        error: (err) => {
          this.isLoading = false;
          const backendError = err?.error?.message || err?.statusText || err?.message || 'Sign up failed. Please check your inputs or connection.';
          this.errorMessage = Array.isArray(backendError) ? backendError.join(', ') : backendError;
        }
      });
    }
  }
}
