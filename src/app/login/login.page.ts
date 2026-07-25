import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from '../components/navbar/navbar.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['../sign-up/sign-up.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NavbarComponent]
})
export class LoginPage implements OnInit {

  authMode: 'signin' | 'signup' = 'signin';
  userRole: 'student' | 'faculty' = 'student';

  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  fullName: string = '';
  confirmPassword: string = '';
  agreeTerms: boolean = false;

  constructor() { }

  ngOnInit() { }

  setAuthMode(mode: 'signin' | 'signup') {
    this.authMode = mode;
  }

  setUserRole(role: 'student' | 'faculty') {
    this.userRole = role;
  }

  onSubmit() {
    if (this.authMode === 'signin') {
      alert(`Welcome back! Signed in successfully.`);
    } else {
      alert(`Account created successfully!`);
    }
  }

}
