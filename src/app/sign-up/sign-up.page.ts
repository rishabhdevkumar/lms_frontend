import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NavbarComponent, FooterComponent]
})
export class SignUpPage implements OnInit {

  authMode: 'signin' | 'signup' = 'signup';
  userRole: 'student' | 'faculty' = 'student';

  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  rememberMe: boolean = false;
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
      console.log('Signing in:', { role: this.userRole, email: this.email });
      alert(`Welcome back! Logged in as ${this.userRole.toUpperCase()}`);
    } else {
      console.log('Signing up:', { role: this.userRole, fullName: this.fullName, email: this.email });
      alert(`Account created successfully as ${this.userRole.toUpperCase()}!`);
    }
  }

}
