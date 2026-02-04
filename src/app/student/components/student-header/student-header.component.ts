import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-header',
  templateUrl: './student-header.component.html',
  styleUrls: ['./student-header.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, FormsModule, CommonModule],
})
export class StudentHeaderComponent  implements OnInit {

  isLoggedIn = false;
  notificationCount = 3;

  constructor(
    private router: Router
  ) {
    this.checkLogin();
   }

  ngOnInit() {}

   checkLogin() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
  }

  logout() {
    localStorage.clear();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }

}
