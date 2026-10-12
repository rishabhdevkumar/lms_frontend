import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { FacultyHeaderComponent } from '../faculty-header/faculty-header.component';
import { FacultyLayoutService } from '../../services/faculty-layout.service';

@Component({
  selector: 'app-faculty-sidebar',
  templateUrl: './faculty-sidebar.component.html',
  styleUrls: ['./faculty-sidebar.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, FormsModule, CommonModule, FacultyHeaderComponent],
})
export class FacultySidebarComponent implements OnInit {
  facultyName = 'Dr. Sarah Jenkins';
  facultyRole = 'Senior Faculty • CS Dept';

  constructor(
    private authService: AuthService,
    public layoutService: FacultyLayoutService
  ) {}

  get isCollapsed(): boolean {
    return this.layoutService.isCollapsed;
  }

  get isMobileOpen(): boolean {
    return this.layoutService.isMobileOpen;
  }

  ngOnInit() {
    const user = this.authService.currentUserValue;
    if (user && user.name) {
      this.facultyName = user.name;
    }
  }

  closeMobile() {
    this.layoutService.closeMobile();
  }

  shrinkSidebar() {
    this.layoutService.shrinkSidebar();
  }

  expandSidebar() {
    this.layoutService.expandSidebar();
  }

  onItemClick() {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.layoutService.closeMobile();
    }
  }

  isMoreSheetOpen = false;

  toggleMoreSheet() {
    this.isMoreSheetOpen = !this.isMoreSheetOpen;
  }

  closeMoreSheet() {
    this.isMoreSheetOpen = false;
  }

  onBottomNavClick() {
    this.isMoreSheetOpen = false;
  }

  logout() {
    this.closeMoreSheet();
    this.authService.logout();
  }
}

