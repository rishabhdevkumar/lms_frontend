import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonicModule, IonPopover, MenuController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LanguageService, Language } from 'src/app/services/language.service';
import { AuthService, User } from 'src/app/services/auth.service';
import { AdminSettingsService, SettingsTab } from 'src/app/services/admin-settings.service';
import { Subscription } from 'rxjs';
import { toast } from 'ngx-sonner';

export interface UltimaNotification {
  id: number;
  userName: string;
  userAvatar: string;
  avatarBg: string;
  message: string;
  timeAgo: string;
  read: boolean;
}

export interface SearchResult {
  title: string;
  category: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, FormsModule, CommonModule],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('adminProfilePopover') adminProfilePopover?: IonPopover;

  adminName = 'Dev Kumar';
  adminEmail = 'admin@lms-edu.com';
  adminInitials = 'DK';
  adminRole = 'Admin';
  adminPhone = '+91 98000 11223';
  adminAvatarUrl: string | null = null;
  currentUser: User | null = null;

  notificationsCount = 4;
  showProfileMenu = false;
  isNotificationsOpen = false;
  isSearchOpen = false;
  isSettingsDrawerOpen = false;
  activeTab: SettingsTab = 'profile';
  showDrawerToast = false;
  drawerToastMessage = '';
  isAppsOpen = false;
  isMobileSubBarOpen = false;
  isTermsModalOpen = false;
  isSupportModalOpen = false;
  isLocationModalOpen = false;

  newLocationCountry = 'India';
  newLocationState = '';
  newLocationCity = '';
  newLocationPincode = '';
  locationFormError = '';
  locationsList = [
    { id: 1, country: 'India', state: 'Delhi', city: 'New Delhi', pincode: '110001', isPrimary: true },
    { id: 2, country: 'India', state: 'Maharashtra', city: 'Mumbai', pincode: '400001', isPrimary: false },
    { id: 3, country: 'India', state: 'Karnataka', city: 'Bengaluru', pincode: '560001', isPrimary: false },
  ];

  profilePopoverEvent: any = null;
  notifPopoverEvent: any = null;
  appsPopoverEvent: any = null;

  // Search state
  headerSearchQuery = '';
  allSearchItems: SearchResult[] = [
    { title: 'Analytics Dashboard', category: 'Dashboards', route: '/admin/dashboard', icon: 'grid-outline' },
    { title: 'Users & Student Management', category: 'Management', route: '/admin/add-student', icon: 'people-outline' },
    { title: 'Courses & Academic Programs', category: 'Academic', route: '/admin/academic', icon: 'book-outline' },
    { title: 'Batches & Class Sessions', category: 'Academic', route: '/admin/batches', icon: 'layers-outline' },
    { title: 'Quizzes & Assessments', category: 'Examinations', route: '/admin/quizzes', icon: 'help-circle-outline' },
    { title: 'Attendance Register', category: 'Academic', route: '/admin/attendance', icon: 'calendar-outline' },
    { title: 'Tuition Payments & Ledger', category: 'Finance', route: '/admin/payments', icon: 'wallet-outline' },
    { title: 'Certificates Generator', category: 'Certificates', route: '/admin/certificates', icon: 'ribbon-outline' },
    { title: 'Analytics & Export Reports', category: 'Reports', route: '/admin/reports', icon: 'bar-chart-outline' },
    { title: 'Account Settings & Profile', category: 'System', route: 'settings-drawer', icon: 'settings-outline' },
  ];
  filteredSearchResults: SearchResult[] = [];

  // Notifications List matching Ultima reference image 2
  notificationsList: UltimaNotification[] = [
    {
      id: 1,
      userName: 'Jerome Bell',
      userAvatar: 'JB',
      avatarBg: 'bg-amber',
      message: 'How to write content about your photographs?',
      timeAgo: '42 mins ago',
      read: false
    },
    {
      id: 2,
      userName: 'Cameron Williamson',
      userAvatar: 'CW',
      avatarBg: 'bg-dark',
      message: 'Start a blog to reach your creative peak.',
      timeAgo: '48 mins ago',
      read: false
    },
    {
      id: 3,
      userName: 'Anna Miles',
      userAvatar: 'AM',
      avatarBg: 'bg-rose',
      message: 'Caring is the new marketing.',
      timeAgo: '1 day ago',
      read: false
    },
    {
      id: 4,
      userName: 'Arlene McCoy',
      userAvatar: 'AM',
      avatarBg: 'bg-teal',
      message: 'Starting your traveling blog with Vasco.',
      timeAgo: '4 days ago',
      read: false
    }
  ];

  // Theme Settings Drawer State (Ultima Theme Customizer)
  primaryColors = [
    { name: 'Indigo Ultima', hex: '#30419b' },
    { name: 'Teal', hex: '#009688' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Lime', hex: '#8bc34a' },
    { name: 'Amber Gold', hex: '#f59e0b' },
    { name: 'Orange', hex: '#ff9800' },
    { name: 'Red Crimson', hex: '#f44336' },
    { name: 'Purple Violet', hex: '#9c27b0' },
    { name: 'Pink Rose', hex: '#e91e63' },
    { name: 'Cyan Blue', hex: '#00bcd4' },
  ];
  selectedPrimaryColor = '#30419b';

  surfaceColors = ['#475569', '#64748b', '#94a3b8', '#cbd5e1'];
  selectedSurfaceColor = '#475569';

  colorScheme: 'light' | 'dark' = 'light';
  menuType: 'static' | 'overlay' | 'slim' | 'slim+' | 'reveal' | 'drawer' | 'horizontal' = 'static';
  menuProfile: 'start' | 'end' = 'end';

  // Language state & modal controls
  selectedLanguage: Language = { code: 'en', name: 'English', nativeName: 'English (US)', flag: '🇺🇸', direction: 'ltr' };
  languages: Language[] = [];
  filteredLanguages: Language[] = [];
  searchQuery = '';
  isLanguageModalOpen = false;

  showAddLanguageForm = false;
  newLangName = '';
  newLangNative = '';
  newLangCode = '';
  newLangFlag = '🌐';
  addLanguageError = '';

  toastMessage = '';
  showToast = false;

  private subs = new Subscription();

  constructor(
    private languageService: LanguageService,
    private authService: AuthService,
    private menuCtrl: MenuController,
    public router: Router,
    public settingsService: AdminSettingsService
  ) {}

  ngOnInit() {
    const savedAvatar = localStorage.getItem('lms_admin_avatar');
    if (savedAvatar) {
      this.adminAvatarUrl = savedAvatar;
    }

    this.updateUserInfo(this.authService.currentUserValue);

    this.subs.add(
      this.authService.currentUser$.subscribe((user) => {
        this.updateUserInfo(user);
      })
    );

    this.subs.add(
      this.settingsService.isDrawerOpen$.subscribe((isOpen) => {
        this.isSettingsDrawerOpen = isOpen;
        if (isOpen) {
          this.showProfileMenu = false;
          this.isNotificationsOpen = false;
          this.isSearchOpen = false;
          this.isAppsOpen = false;
        }
      })
    );

    this.subs.add(
      this.settingsService.activeTab$.subscribe((tab) => {
        this.activeTab = tab;
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

    const savedPrimary = localStorage.getItem('ultima_primary_color');
    if (savedPrimary) {
      this.selectPrimaryColor(savedPrimary);
    }
    const savedScheme = localStorage.getItem('ultima_color_scheme') as 'light' | 'dark';
    if (savedScheme) {
      this.setColorScheme(savedScheme);
    }

    this.filterSearchResults();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  async toggleSidebar() {
    try {
      await this.menuCtrl.enable(true, 'admin-menu');
      await this.menuCtrl.enable(true);
      const isOpened = await this.menuCtrl.isOpen('admin-menu');
      if (isOpened) {
        await this.menuCtrl.close('admin-menu');
      } else {
        await this.menuCtrl.open('admin-menu');
      }
    } catch (e) {
      console.log('Sidebar toggle via menuCtrl:', e);
    }

    try {
      const menuEl = (document.querySelector('ion-menu[menu-id="admin-menu"]') ||
                      document.querySelector('ion-menu[menuId="admin-menu"]') ||
                      document.querySelector('ion-menu')) as any;
      if (menuEl) {
        const isOpen = typeof menuEl.isOpen === 'function' ? await menuEl.isOpen() : false;
        if (isOpen) {
          if (typeof menuEl.close === 'function') await menuEl.close();
        } else {
          if (typeof menuEl.open === 'function') {
            await menuEl.open();
          } else if (typeof menuEl.toggle === 'function') {
            await menuEl.toggle();
          }
        }
      }
    } catch (e) {
      console.log('Error toggling menuEl directly:', e);
    }
  }

  toggleMobileSubBar() {
    this.isMobileSubBarOpen = !this.isMobileSubBarOpen;
  }

  toggleAppsMenu(event?: any) {
    if (event) {
      event.stopPropagation();
      this.appsPopoverEvent = event;
    }
    this.isAppsOpen = !this.isAppsOpen;
    if (this.isAppsOpen) {
      this.showProfileMenu = false;
      this.isNotificationsOpen = false;
      this.isSearchOpen = false;
    }
  }

  toggleNotificationsMenu(event?: any) {
    if (event) {
      event.stopPropagation();
      this.notifPopoverEvent = event;
    }
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) {
      this.showProfileMenu = false;
      this.isSearchOpen = false;
      this.isAppsOpen = false;
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
      this.isSearchOpen = false;
      this.isAppsOpen = false;
    }
  }

  toggleSearchOverlay() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      this.headerSearchQuery = '';
      this.filterSearchResults();
      this.showProfileMenu = false;
      this.isNotificationsOpen = false;
      this.isAppsOpen = false;
      setTimeout(() => {
        const input = document.getElementById('header-circle-search-input');
        if (input) input.focus();
      }, 50);
    } else {
      this.headerSearchQuery = '';
    }
  }

  closeHeaderSearch() {
    this.isSearchOpen = false;
    this.headerSearchQuery = '';
  }

  filterSearchResults() {
    if (!this.headerSearchQuery.trim()) {
      this.filteredSearchResults = [...this.allSearchItems];
    } else {
      const q = this.headerSearchQuery.toLowerCase().trim();
      this.filteredSearchResults = this.allSearchItems.filter(
        item => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
      );
    }
  }

  navigateToSearchResult(route: string) {
    this.isSearchOpen = false;
    if (route === 'settings-drawer') {
      this.settingsService.openDrawer('profile');
    } else {
      this.router.navigate([route]);
    }
  }

  toggleSettingsDrawer(tab?: SettingsTab) {
    if (this.isSettingsDrawerOpen && !tab) {
      this.settingsService.closeDrawer();
    } else {
      this.showProfileMenu = false;
      this.isNotificationsOpen = false;
      this.isSearchOpen = false;
      this.isAppsOpen = false;
      this.settingsService.openDrawer(tab || 'profile');
    }
  }

  closeSettingsDrawer() {
    this.settingsService.closeDrawer();
  }

  selectTab(tab: SettingsTab) {
    this.settingsService.setActiveTab(tab);
  }

  triggerDrawerToast(msg: string) {
    this.drawerToastMessage = msg;
    this.showDrawerToast = true;
    toast.success(msg);
    setTimeout(() => {
      this.showDrawerToast = false;
    }, 3500);
  }

  saveProfile() {
    this.settingsService.saveProfile();
    if (this.settingsService.adminProfile.name) {
      this.adminName = this.settingsService.adminProfile.name;
      this.adminInitials = this.getInitials(this.adminName);
    }
    if (this.settingsService.adminProfile.email) {
      this.adminEmail = this.settingsService.adminProfile.email;
    }
    this.triggerDrawerToast('Admin profile details updated successfully!');
  }

  onProfilePhotoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.adminAvatarUrl = e.target.result;
        try {
          localStorage.setItem('lms_admin_avatar', this.adminAvatarUrl as string);
        } catch (err) {}
        this.triggerDrawerToast('Profile photo updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  }

  sendOtp() {
    if (!this.settingsService.emailData.newEmail) {
      toast.error('Invalid Email', {
        description: 'Please enter a valid new email address!'
      });
      return;
    }
    this.settingsService.emailData.otpSent = true;
    this.triggerDrawerToast('OTP Verification Code sent to ' + this.settingsService.emailData.newEmail);
  }

  updateEmail() {
    if (this.settingsService.emailData.newEmail !== this.settingsService.emailData.confirmNewEmail) {
      toast.error('Email Mismatch', {
        description: 'New email and confirmation email do not match!'
      });
      return;
    }
    this.settingsService.adminProfile.email = this.settingsService.emailData.newEmail;
    this.settingsService.emailData.currentEmail = this.settingsService.emailData.newEmail;
    this.settingsService.emailData.newEmail = '';
    this.settingsService.emailData.confirmNewEmail = '';
    this.settingsService.emailData.otpSent = false;
    this.settingsService.saveProfile();
    this.triggerDrawerToast('Primary Admin Email updated successfully!');
  }

  updatePassword() {
    if (!this.settingsService.passwordData.currentPassword || !this.settingsService.passwordData.newPassword) {
      toast.error('Required Fields Missing', {
        description: 'Please fill out all password fields!'
      });
      return;
    }
    if (this.settingsService.passwordData.newPassword !== this.settingsService.passwordData.confirmPassword) {
      toast.error('Password Mismatch', {
        description: 'New password and confirmation password do not match!'
      });
      return;
    }
    this.settingsService.passwordData.currentPassword = '';
    this.settingsService.passwordData.newPassword = '';
    this.settingsService.passwordData.confirmPassword = '';
    this.triggerDrawerToast('Password changed successfully! Security token renewed.');
  }

  triggerBackup() {
    this.settingsService.maintenanceData.lastBackupTime = new Date().toLocaleString('en-GB');
    this.settingsService.saveMaintenance();
    this.triggerDrawerToast('💾 Database snapshot created and backed up successfully!');
  }

  clearCache() {
    this.settingsService.maintenanceData.cacheSize = '0.0 MB';
    this.settingsService.saveMaintenance();
    this.triggerDrawerToast('⚡ System cache and temporary files purged clean!');
  }

  toggleMaintenanceMode() {
    this.settingsService.saveMaintenance();
    const status = this.settingsService.maintenanceData.maintenanceMode ? 'ENABLED' : 'DISABLED';
    this.triggerDrawerToast(`🛠️ System Maintenance Mode is now ${status}`);
  }

  saveOtherSettings() {
    this.settingsService.saveOtherSettings();
    this.triggerDrawerToast('⚙️ System preferences and advanced configurations saved!');
  }

  selectPrimaryColor(colorHex: string) {
    this.selectedPrimaryColor = colorHex;
    document.documentElement.style.setProperty('--ultima-primary', colorHex);
    document.documentElement.style.setProperty('--ultima-header-bg', colorHex);
    localStorage.setItem('ultima_primary_color', colorHex);
  }

  setColorScheme(scheme: 'light' | 'dark' | string) {
    this.colorScheme = scheme as 'light' | 'dark';
    document.body.classList.toggle('dark-theme', scheme === 'dark');
    localStorage.setItem('ultima_color_scheme', scheme);
  }

  setMenuType(type: 'static' | 'overlay' | 'slim' | 'slim+' | 'reveal' | 'drawer' | 'horizontal' | string) {
    this.menuType = type as any;
  }

  setMenuProfile(prof: 'start' | 'end' | string) {
    this.menuProfile = prof as any;
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

  openTermsModal() {
    this.closeAdminProfilePopover();
    this.isTermsModalOpen = true;
  }

  closeTermsModal() {
    this.isTermsModalOpen = false;
  }

  openSupportModal() {
    this.closeAdminProfilePopover();
    this.isSupportModalOpen = true;
  }

  closeSupportModal() {
    this.isSupportModalOpen = false;
  }

  private getInitials(name: string): string {
    if (!name) return 'DK';
    const cleanName = name.trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  }

  private extractNameFromEmail(email: string): string {
    if (!email) return 'Dev Kumar';
    const lower = email.toLowerCase();
    if (lower.includes('dev')) {
      return 'Dev Kumar';
    }
    const namePart = email.split('@')[0];
    const cleaned = namePart.replace(/[0-9]+$/g, '');
    const parts = (cleaned || namePart).split(/[._-]/);
    return parts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private getUserDisplayName(userObj: any): string {
    if (!userObj) return 'Dev Kumar';
    if (typeof userObj === 'string') {
      const cleaned = userObj.replace(/[0-9]+$/g, '');
      return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : userObj;
    }
    let candidate = userObj.name || userObj.fullName || userObj.username || userObj.displayName;
    if (candidate && typeof candidate === 'string' && candidate.trim()) {
      candidate = candidate.trim();
      if (candidate.includes('@')) {
        return this.extractNameFromEmail(candidate);
      }
      return candidate;
    }
    if (userObj.email && typeof userObj.email === 'string') {
      return this.extractNameFromEmail(userObj.email);
    }
    return 'Dev Kumar';
  }

  private updateUserInfo(user: User | null) {
    let resolvedName = '';
    let resolvedEmail = '';
    let resolvedRole = '';
    let resolvedPhone = '';

    if (user) {
      this.currentUser = user;
      resolvedName = this.getUserDisplayName(user);
      resolvedEmail = user.email || '';
      if (user.role) {
        resolvedRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
      }
      if (user.phone) {
        resolvedPhone = user.phone;
      }
    }

    const savedUserStr = localStorage.getItem('lms_auth_user');
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser) {
          if (!resolvedName) resolvedName = this.getUserDisplayName(savedUser);
          if (!resolvedEmail) resolvedEmail = savedUser.email || '';
          if (!resolvedRole && savedUser.role) {
            resolvedRole = savedUser.role.charAt(0).toUpperCase() + savedUser.role.slice(1);
          }
          if (!resolvedPhone) {
            resolvedPhone = savedUser.phone || savedUser.phoneNumber || savedUser.phone_number || savedUser.mobile || '';
          }
        }
      } catch (e) {}
    }

    if (resolvedName) {
      this.adminName = resolvedName;
      this.adminInitials = this.getInitials(resolvedName);
      if (this.settingsService && this.settingsService.adminProfile) {
        this.settingsService.adminProfile.name = resolvedName;
      }
    } else {
      this.adminName = 'Dev Kumar';
      this.adminInitials = 'DK';
    }

    if (resolvedEmail) {
      this.adminEmail = resolvedEmail;
      if (this.settingsService && this.settingsService.adminProfile) {
        this.settingsService.adminProfile.email = resolvedEmail;
      }
    } else {
      this.adminEmail = 'admin@lms-edu.com';
    }

    this.adminRole = resolvedRole || 'Admin';
    if (this.settingsService && this.settingsService.adminProfile) {
      this.settingsService.adminProfile.role = this.adminRole;
    }

    this.adminPhone = resolvedPhone || (this.settingsService?.adminProfile?.phone) || '+91 98000 11223';
    if (this.settingsService && this.settingsService.adminProfile) {
      this.settingsService.adminProfile.phone = this.adminPhone;
    }

    const savedAvatar = localStorage.getItem('lms_admin_avatar');
    if (savedAvatar) {
      this.adminAvatarUrl = savedAvatar;
    }
  }

  openLanguageModal() {
    this.closeAdminProfilePopover();
    this.searchQuery = '';
    this.showAddLanguageForm = false;
    this.addLanguageError = '';
    this.filterLanguages();
    this.isLanguageModalOpen = true;
  }

  closeLanguageModal() {
    this.isLanguageModalOpen = false;
    this.showAddLanguageForm = false;
  }

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

  selectLanguage(lang: Language) {
    this.languageService.setLanguage(lang);
    this.triggerToast(`Language changed to ${lang.name} (${lang.nativeName})`);
    this.closeLanguageModal();
  }

  toggleAddLanguageForm() {
    this.showAddLanguageForm = !this.showAddLanguageForm;
    this.addLanguageError = '';
    this.newLangName = '';
    this.newLangNative = '';
    this.newLangCode = '';
    this.newLangFlag = '🌐';
  }

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

  goToSettings() {
    this.closeAdminProfilePopover();
    this.settingsService.openDrawer('profile');
  }

  openLocationModal() {
    this.isAppsOpen = false;
    this.closeAdminProfilePopover();
    this.locationFormError = '';
    this.isLocationModalOpen = true;
  }

  closeLocationModal() {
    this.isLocationModalOpen = false;
    this.locationFormError = '';
  }

  addLocation() {
    if (!this.newLocationCountry.trim() || !this.newLocationState.trim() || !this.newLocationCity.trim() || !this.newLocationPincode.trim()) {
      this.locationFormError = 'Please fill in Country, State, City, and Pincode.';
      return;
    }

    const newLoc = {
      id: Date.now(),
      country: this.newLocationCountry.trim(),
      state: this.newLocationState.trim(),
      city: this.newLocationCity.trim(),
      pincode: this.newLocationPincode.trim(),
      isPrimary: this.locationsList.length === 0
    };

    this.locationsList.unshift(newLoc);
    this.newLocationState = '';
    this.newLocationCity = '';
    this.newLocationPincode = '';
    this.locationFormError = '';
    this.triggerToast(`Campus location in ${newLoc.city}, ${newLoc.state} added successfully!`);
  }

  deleteLocation(id: number) {
    this.locationsList = this.locationsList.filter(l => l.id !== id);
    this.triggerToast('Location removed.');
  }

  setPrimaryLocation(id: number) {
    this.locationsList.forEach(l => l.isPrimary = (l.id === id));
    this.triggerToast('Primary branch updated.');
  }

  logout() {
    this.closeAdminProfilePopover();
    this.authService.logout();
  }
}
