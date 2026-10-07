import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-faculty-sidebar',
  templateUrl: './faculty-sidebar.component.html',
  styleUrls: ['./faculty-sidebar.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, FormsModule, CommonModule],
})
export class FacultySidebarComponent implements OnInit {
  facultyName = 'Dr. Sarah Jenkins';
  facultyRole = 'Senior Faculty • CS Dept';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.currentUserValue;
    if (user && user.name) {
      this.facultyName = user.name;
    }
  }

  logout() {
    this.authService.logout();
  }
}

