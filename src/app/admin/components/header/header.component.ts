import { Component, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { IonicModule, IonPopover } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LanguageService, Language } from 'src/app/services/language.service';
import { AuthService, User } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, FormsModule, CommonModule],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('adminProfilePopover') adminProfilePopover?: IonPopover;

  adminName = 'Admin';
  adminEmail = 'admin@lms-hub.com';
  adminInitials = 'AD';
  currentUser: User | null = null;

  notificationsCount = 3;
  showProfileMenu = false;
  isNotificationsOpen = false;

  profilePopoverEvent: any = null;
  notifPopoverEvent: any = null;

  notificationsList = [
    { id: 1, title: 'New Student Registration', desc: 'Aarav Sharma enrolled in B.Tech CS', time: '5 mins ago', read: false, type: 'student' },
    { id: 2, title: 'System Maintenance Scheduled', desc: 'Server upgrade at 11:00 PM tonight', time: '1 hour ago', read: false, type: 'system' },
    { id: 3, title: 'Fee Payment Received', desc: '₹45,000 received for Batch CS-2026', time: '3 hours ago', read: false, type: 'payment' }
  ];

  constructor(
    private languageService: LanguageService,
    private authService: AuthService,
    private router: Router
  ) {}

  toggleNotificationsMenu(event?: any) {
    if (event) {
      event.stopPropagation();
      this.notifPopoverEvent = event;
    }
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) {
      this.showProfileMenu = false;
    }
  }

  toggleProfileMenu(event?: any) {
    if (event) {
      event.stopPropagation();
      const targetEl = event.currentTarget || event.target;
      this.profilePopoverEvent = {
        ...event,
        target: targetEl,
        composedPath: () => [targetEl]
      };
    }
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      this.isNotificationsOpen = false;
    }
  }

  closeAdminProfilePopover() {
    this.showProfileMenu = false;
    if (this.adminProfilePopover) {
      this.adminProfilePopover.dismiss();
    }
  }

  markAllNotificationsRead() {
    this.notificationsList.forEach(n => n.read = true);
    this.notificationsCount = 0;
  }

  private getInitials(name: string): string {
    if (!name) return 'AD';
    const cleanName = name.trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  }

  private extractNameFromEmail(email: string): string {
    if (!email) return 'Rishabh Dev Kumar';
    const lower = email.toLowerCase();
    if (lower.includes('rishabh')) {
      return 'Rishabh Dev Kumar';
    }
    const namePart = email.split('@')[0];
    const cleaned = namePart.replace(/[0-9]+$/g, '');
    const parts = (cleaned || namePart).split(/[._-]/);
    return parts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private getUserDisplayName(userObj: any): string {
    if (!userObj) return 'Rishabh Dev Kumar';
    if (typeof userObj === 'string') {
      if (userObj.toLowerCase().includes('rishabh')) return 'Rishabh Dev Kumar';
      const cleaned = userObj.replace(/[0-9]+$/g, '');
      return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : userObj;
    }
    let candidate = userObj.name || userObj.fullName || userObj.username || userObj.displayName;
    if (candidate && typeof candidate === 'string' && candidate.trim()) {
      candidate = candidate.trim();
      if (candidate.toLowerCase().includes('rishabh')) {
        return 'Rishabh Dev Kumar';
      }
      if (candidate.includes('@')) {
        return this.extractNameFromEmail(candidate);
      }
      if (/^[a-zA-Z]+[0-9]+$/.test(candidate)) {
        const cleaned = candidate.replace(/[0-9]+$/g, '');
        if (cleaned) {
          return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        }
      }
      return candidate;
    }
    if (userObj.email && typeof userObj.email === 'string') {
      return this.extractNameFromEmail(userObj.email);
    }
    return 'Rishabh Dev Kumar';
  }

  private updateUserInfo(user: User | null) {
    let resolvedName = '';
    let resolvedEmail = '';

    if (user) {
      this.currentUser = user;
      resolvedName = this.getUserDisplayName(user);
      resolvedEmail = user.email || '';
    }

    if (!resolvedName || !resolvedEmail) {
      const savedUserStr = localStorage.getItem('lms_auth_user');
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser) {
            if (!resolvedName) resolvedName = this.getUserDisplayName(savedUser);
            if (!resolvedEmail) resolvedEmail = savedUser.email || '';
          }
        } catch (e) {}
      }
    }

    if (resolvedName) {
      this.adminName = resolvedName;
      this.adminInitials = this.getInitials(resolvedName);
    } else {
      this.adminName = 'Admin';
      this.adminInitials = 'AD';
    }

    if (resolvedEmail) {
      this.adminEmail = resolvedEmail;
    } else {
      this.adminEmail = 'admin@lms-hub.com';
    }
  }

  // Language state & modal controls
  selectedLanguage: Language = { code: 'en', name: 'English', nativeName: 'English (US)', flag: '🇺🇸', direction: 'ltr' };
  languages: Language[] = [];
  filteredLanguages: Language[] = [];
  searchQuery: string = '';
  isLanguageModalOpen: boolean = false;

  // Add custom language form state
  showAddLanguageForm: boolean = false;
  newLangName: string = '';
  newLangNative: string = '';
  newLangCode: string = '';
  newLangFlag: string = '🌐';
  addLanguageError: string = '';

  // Toast state
  toastMessage: string = '';
  showToast: boolean = false;

  private subs = new Subscription();

  ngOnInit() {
    this.updateUserInfo(this.authService.currentUserValue);

    this.subs.add(
      this.authService.currentUser$.subscribe((user) => {
        this.updateUserInfo(user);
      })
    );

    this.subs.add(
      this.languageService.currentLanguage$.subscribe((lang: Language) => {
        this.selectedLanguage = lang;
      })
    );

    this.subs.add(
      this.languageService.languages$.subscribe((langs: Language[]) => {
        this.languages = langs;
        this.filterLanguages();
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  // Open language selection modal
  openLanguageModal() {
    this.closeAdminProfilePopover();
    this.searchQuery = '';
    this.showAddLanguageForm = false;
    this.addLanguageError = '';
    this.filterLanguages();
    this.isLanguageModalOpen = true;
  }

  // Close language selection modal
  closeLanguageModal() {
    this.isLanguageModalOpen = false;
    this.showAddLanguageForm = false;
  }

  // Filter languages based on search input
  filterLanguages() {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredLanguages = [...this.languages];
    } else {
      const q = this.searchQuery.toLowerCase().trim();
      this.filteredLanguages = this.languages.filter(
        l => l.name.toLowerCase().includes(q) ||
             l.nativeName.toLowerCase().includes(q) ||
             l.code.toLowerCase().includes(q)
      );
    }
  }

  // Select language and show toast
  selectLanguage(lang: Language) {
    this.languageService.setLanguage(lang);
    this.triggerToast(`Language changed to ${lang.name} (${lang.nativeName})`);
    this.closeLanguageModal();
  }

  // Toggle add new language form
  toggleAddLanguageForm() {
    this.showAddLanguageForm = !this.showAddLanguageForm;
    this.addLanguageError = '';
    this.newLangName = '';
    this.newLangNative = '';
    this.newLangCode = '';
    this.newLangFlag = '🌐';
  }

  // Submit new custom language
  submitAddLanguage() {
    if (!this.newLangName || !this.newLangCode) {
      this.addLanguageError = 'Please fill in Language Name and Code.';
      return;
    }

    const success = this.languageService.addLanguage({
      name: this.newLangName.trim(),
      nativeName: this.newLangNative.trim() || this.newLangName.trim(),
      code: this.newLangCode.trim().toLowerCase(),
      flag: this.newLangFlag.trim() || '🌐',
      direction: 'ltr'
    });

    if (success) {
      this.triggerToast(`Added new language: ${this.newLangName}`);
      this.toggleAddLanguageForm();
    } else {
      this.addLanguageError = 'Language with this code already exists!';
    }
  }

  // Helper to show notification toast
  triggerToast(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3200);
  }

  openNotifications() {
    this.closeAdminProfilePopover();
    this.toggleNotificationsMenu();
  }

  goToProfile() {
    this.closeAdminProfilePopover();
    this.router.navigate(['/admin/account-setting']);
  }

  goToSettings() {
    this.closeAdminProfilePopover();
    this.router.navigate(['/admin/academic']);
  }

  logout() {
    this.closeAdminProfilePopover();
    this.authService.logout();
  }
}
