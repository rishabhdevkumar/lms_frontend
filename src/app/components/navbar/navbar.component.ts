import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { AuthService, User, UserRole } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, AuthModalComponent]
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isSearchOpen = false;
  isUserDropdownOpen = false;
  
  // Active Navigation Tab
  activeTab = 'Home';

  // Auth Modal State
  isAuthModalOpen = false;
  authMode: 'signin' | 'signup' = 'signin';

  // Real-time Auth State
  currentUser: User | null = null;
  isLoggedIn: boolean = false;
  userRole: UserRole | null = null;

  private subs = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Ensure document body is in Light Mode
    document.body.classList.remove('dark');
    localStorage.removeItem('lms_theme');

    // Subscribe to real-time auth state
    this.subs.add(
      this.authService.currentUser$.subscribe((user) => {
        this.currentUser = user;
      })
    );

    this.subs.add(
      this.authService.isLoggedIn$.subscribe((loggedIn) => {
        this.isLoggedIn = loggedIn;
      })
    );

    this.subs.add(
      this.authService.userRole$.subscribe((role) => {
        this.userRole = role;
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
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

  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  // AUTH MODAL HANDLERS
  openAuthModal(mode: 'signin' | 'signup' = 'signin') {
    this.authMode = mode;
    this.isAuthModalOpen = true;
    this.closeMobileMenu();
  }

  closeAuthModal() {
    this.isAuthModalOpen = false;
  }

  goToDashboard() {
    this.authService.navigateToDashboard();
    this.isUserDropdownOpen = false;
    this.closeMobileMenu();
  }

  logout() {
    this.isUserDropdownOpen = false;
    this.closeMobileMenu();
    this.authService.logout();
  }
}
