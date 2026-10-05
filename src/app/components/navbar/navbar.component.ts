import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, AuthModalComponent]
})
export class NavbarComponent implements OnInit {
  isMobileMenuOpen = false;
  isSearchOpen = false;
  
  // Active Navigation Tab (Home is active by default)
  activeTab = 'Home';

  // Auth Modal State
  isAuthModalOpen = false;
  authMode: 'signin' | 'signup' = 'signin';

  constructor() {}

  ngOnInit() {
    // Ensure document body is in Light Mode
    document.body.classList.remove('dark');
    localStorage.removeItem('lms_theme');
  }

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
    this.closeMobileMenu();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
  }

  // AUTH MODAL HANDLERS
  openAuthModal(mode: 'signin' | 'signup' = 'signup') {
    this.authMode = mode;
    this.isAuthModalOpen = true;
    this.closeMobileMenu();
  }

  closeAuthModal() {
    this.isAuthModalOpen = false;
  }
}
