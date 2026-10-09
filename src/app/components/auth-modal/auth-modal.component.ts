import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService, UserRole } from '../../services/auth.service';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AuthModalComponent {
  @Input() isOpen: boolean = false;
  @Input() authMode: 'signin' | 'signup' = 'signin';
  @Output() closed = new EventEmitter<void>();

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

  fieldErrors: {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
  } = {};

  constructor(private authService: AuthService) {}

  setAuthMode(mode: 'signin' | 'signup') {
    this.authMode = mode;
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {};
  }

  setUserRole(role: UserRole) {
    this.userRole = role;
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {};
  }

  closeModal() {
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {};
    this.closed.emit();
  }

  clearFieldError(field: keyof typeof this.fieldErrors) {
    if (this.fieldErrors[field]) {
      delete this.fieldErrors[field];
    }
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {};

    const cleanEmail = this.email ? this.email.trim() : '';
    const cleanPassword = this.password ? this.password.trim() : '';
    const cleanName = this.fullName ? this.fullName.trim() : '';

    let hasError = false;

    // Full Name check for Signup
    if (this.authMode === 'signup') {
      if (!cleanName) {
        this.fieldErrors.fullName = 'Full name is required.';
        hasError = true;
      } else if (cleanName.length < 2) {
        this.fieldErrors.fullName = 'Name must be at least 2 characters long.';
        hasError = true;
      }
    }

    // Email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail) {
      this.fieldErrors.email = 'Email address is required.';
      hasError = true;
    } else if (!emailRegex.test(cleanEmail)) {
      this.fieldErrors.email = 'Please enter a valid email address.';
      hasError = true;
    }

    // Password check
    if (!cleanPassword) {
      this.fieldErrors.password = 'Password is required.';
      hasError = true;
    } else if (cleanPassword.length < 4) {
      this.fieldErrors.password = 'Password must be at least 4 characters long.';
      hasError = true;
    }

    // Signup specific checks
    if (this.authMode === 'signup') {
      if (!this.confirmPassword) {
        this.fieldErrors.confirmPassword = 'Confirm password is required.';
        hasError = true;
      } else if (this.password !== this.confirmPassword) {
        this.fieldErrors.confirmPassword = 'Passwords do not match.';
        hasError = true;
      }

      if (!this.agreeTerms) {
        this.fieldErrors.agreeTerms = 'You must agree to the Terms of Service & Privacy Policy.';
        hasError = true;
      }
    }

    if (hasError) {
      return;
    }

    this.isLoading = true;

    const roleToPass: UserRole = (cleanEmail.toLowerCase().includes('admin') || cleanEmail.toLowerCase() === 'rishabh1234@gmail.com') ? 'admin' : 'student';

    if (this.authMode === 'signin') {
      this.authService.login(cleanEmail, cleanPassword, roleToPass).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.successMessage = res.message;
            setTimeout(() => {
              this.closeModal();
              this.authService.navigateToDashboard(res.user?.role);
            }, 400);
          } else {
            this.errorMessage = res.message || 'Authentication failed.';
          }
        },
        error: (err) => {
          this.isLoading = false;
          const backendError = err?.error?.message || err?.statusText || err?.message || 'Authentication failed. Please check backend connection.';
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
              this.closeModal();
              this.authService.navigateToDashboard(res.user?.role);
            }, 400);
          } else {
            this.errorMessage = res.message || 'Registration failed.';
          }
        },
        error: (err) => {
          this.isLoading = false;
          const backendError = err?.error?.message || err?.statusText || err?.message || 'Sign up failed. Please check backend connection.';
          this.errorMessage = Array.isArray(backendError) ? backendError.join(', ') : backendError;
        }
      });
    }
  }
}
