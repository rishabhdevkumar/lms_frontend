import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AuthModalComponent {
  @Input() isOpen: boolean = false;
  @Input() authMode: 'signin' | 'signup' = 'signin';
  @Output() closed = new EventEmitter<void>();

  userRole: 'student' | 'faculty' = 'student';

  email: string = '';
  password: string = '';
  fullName: string = '';
  confirmPassword: string = '';
  rememberMe: boolean = false;
  agreeTerms: boolean = false;

  setAuthMode(mode: 'signin' | 'signup') {
    this.authMode = mode;
  }

  setUserRole(role: 'student' | 'faculty') {
    this.userRole = role;
  }

  closeModal() {
    this.closed.emit();
  }

  onSubmit() {
    if (this.authMode === 'signin') {
      alert(`Welcome back! Signed in successfully as ${this.userRole}.`);
    } else {
      alert(`Account created successfully as ${this.userRole}!`);
    }
    this.closeModal();
  }
}
