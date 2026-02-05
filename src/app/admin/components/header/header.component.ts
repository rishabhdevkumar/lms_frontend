import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, FormsModule, CommonModule],
})
export class HeaderComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  adminName = 'Admin';
  notificationsCount = 3;

  showProfileMenu = false; // toggle for dropdown

  // Notifications click
  openNotifications() {
    console.log('Open notifications');
  }

  // Toggle profile menu
  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  goToProfile() {
    console.log('Go to My Profile');
    this.showProfileMenu = false; // hide menu after click
  }

  goToSettings() {
    console.log('Go to Settings');
    this.showProfileMenu = false;
  }

  logout() {
    console.log('Logout');
    this.showProfileMenu = false;
  }

}
