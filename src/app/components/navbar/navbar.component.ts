import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { IonicModule, IonPopover } from '@ionic/angular';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { AuthService, User, UserRole } from '../../services/auth.service';
import { Subscription, filter } from 'rxjs';

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

    // Sync active tab with current router URL
    this.updateActiveTabFromUrl(this.router.url);

    this.subs.add(
      this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        this.updateActiveTabFromUrl(event.urlAfterRedirects || event.url);
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

  onHomeClick() {
    this.setActiveTab('Home');
    const content = document.querySelector('ion-content');
    if (content && typeof (content as any).scrollToTop === 'function') {
      (content as any).scrollToTop(400);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  scrollToContact(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.setActiveTab('Contact Us');
    this.closeMobileMenu();

    if (!this.router.url.includes('/home') && this.router.url !== '/') {
      this.router.navigate(['/home']).then(() => {
        setTimeout(() => {
          this.scrollToFooter();
        }, 150);
      });
    } else {
      this.scrollToFooter();
    }
  }

  private scrollToFooter() {
    const footer = document.getElementById('contact-footer') || document.querySelector('app-footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private updateActiveTabFromUrl(url: string) {
    if (!url) return;
    if (url.includes('/courses')) {
      if (this.activeTab !== 'Practice Tests') {
        this.activeTab = 'Courses';
      }
    } else if (url.includes('/live-classes')) {
      this.activeTab = 'Live Classes';
    } else if (url.includes('/pricing')) {
      this.activeTab = 'Pricing / Plans';
    } else if (url.includes('/home') || url === '/' || url === '') {
      if (this.activeTab !== 'Contact Us') {
        this.activeTab = 'Home';
      }
    }
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

