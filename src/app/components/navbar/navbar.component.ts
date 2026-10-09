import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IonicModule, IonPopover } from '@ionic/angular';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { AuthService, User, UserRole } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, AuthModalComponent, IonicModule]
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild('userPopover') userPopover?: IonPopover;

  isMobileMenuOpen = false;
  isSearchOpen = false;
  isUserDropdownOpen = false;
  userPopoverEvent: any = null;

  activeTab = 'Home';

  // Auth Modal State
  isAuthModalOpen = false;
  authMode: 'signin' | 'signup' = 'signin';

  // Real-time Auth State
  currentUser: User | null = null;
  isLoggedIn: boolean = false;
  userRole: UserRole | null = null;

  private subs = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

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

  toggleUserDropdown(event?: any) {
    if (event) {
      event.stopPropagation();
      const targetEl = event.currentTarget || event.target;
      this.userPopoverEvent = {
        ...event,
        target: targetEl,
        composedPath: () => [targetEl]
      };
    }
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  closeUserPopover() {
    this.isUserDropdownOpen = false;
    if (this.userPopover) {
      this.userPopover.dismiss();
    }
  }

  getUserDisplayName(): string {
    const userObj = this.currentUser;
    if (!userObj) {
      const saved = localStorage.getItem('lms_auth_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return this.formatName(parsed.name || parsed.email);
        } catch (e) { }
      }
      return 'Rishabh Dev Kumar';
    }

    let candidate = userObj.name || userObj.email || '';
    return this.formatName(candidate);
  }

  private formatName(candidate: string): string {
    if (!candidate) return 'Rishabh Dev Kumar';
    const lower = candidate.toLowerCase();
    if (lower.includes('rishabh')) {
      return 'Rishabh Dev Kumar';
    }
    if (candidate.includes('@')) {
      const namePart = candidate.split('@')[0];
      const cleaned = namePart.replace(/[0-9]+$/g, '');
      const parts = (cleaned || namePart).split(/[._-]/);
      return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }
    if (/^[a-zA-Z]+[0-9]+$/.test(candidate)) {
      const cleaned = candidate.replace(/[0-9]+$/g, '');
      if (cleaned) {
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      }
    }
    return candidate;
  }

  get userInitials(): string {
    const name = this.getUserDisplayName();
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 1).toUpperCase();
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
    this.closeUserPopover();
    this.closeMobileMenu();
  }

  goToProfile() {
    this.closeUserPopover();
    this.closeMobileMenu();
    if (this.userRole === 'admin') {
      this.router.navigate(['/admin/account-setting']);
    } else if (this.userRole === 'faculty') {
      this.router.navigate(['/faculty/profile']);
    } else {
      this.router.navigate(['/student-dashboard']);
    }
  }

  openNotifications() {
    this.closeUserPopover();
    this.closeMobileMenu();
    if (this.userRole === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (this.userRole === 'faculty') {
      this.router.navigate(['/faculty/dashboard']);
    } else {
      this.router.navigate(['/student-dashboard']);
    }
  }

  goToSettings() {
    this.closeUserPopover();
    this.closeMobileMenu();
    if (this.userRole === 'admin') {
      this.router.navigate(['/admin/account-setting']);
    } else if (this.userRole === 'faculty') {
      this.router.navigate(['/faculty/profile']);
    } else {
      this.router.navigate(['/student-dashboard']);
    }
  }

  logout() {
    this.closeUserPopover();
    this.closeMobileMenu();
    this.authService.logout();
  }
}

