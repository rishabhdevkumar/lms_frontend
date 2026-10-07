import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-student-header',
  templateUrl: './student-header.component.html',
  styleUrls: ['./student-header.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, FormsModule, CommonModule],
})
export class StudentHeaderComponent implements OnInit, OnDestroy {

  isLoggedIn = true;
  notificationsCount = 3;
  showProfileMenu = false;
  isNotificationsOpen = false;

  studentName = 'Aarav Sharma';
  studentRoll = 'STU-2026-88';
  studentEmail = 'aarav@lms-edu.com';

  currentUser: User | null = null;

  notifications = [
    { id: 1, title: 'New Quiz Assigned', desc: 'CS-101 Mid-term Quiz is now live', time: '15 mins ago', read: false },
    { id: 2, title: 'Assignment Graded', desc: 'Data Science Assignment scored 95/100', time: '2 hours ago', read: false },
    { id: 3, title: 'Class Timetable Update', desc: 'Tomorrow\'s class shifted to Hall 2', time: '1 day ago', read: true }
  ];

  private subs = new Subscription();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.subs.add(
      this.authService.currentUser$.subscribe((user) => {
        this.currentUser = user;
        if (user) {
          this.studentName = user.name || 'Student';
          this.studentRoll = user.rollNo || user.id || 'STU-2026-88';
          this.studentEmail = user.email || '';
          this.isLoggedIn = true;
        } else {
          this.isLoggedIn = false;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) {
      this.showProfileMenu = false;
    }
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      this.isNotificationsOpen = false;
    }
  }

  markAllRead() {
    this.notifications.forEach(n => n.read = true);
    this.notificationsCount = 0;
  }

  logout() {
    this.showProfileMenu = false;
    this.authService.logout();
  }
}
