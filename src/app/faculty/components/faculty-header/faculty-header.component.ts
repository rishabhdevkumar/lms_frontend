import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LanguageService, Language } from 'src/app/services/language.service';
import { AuthService, User } from 'src/app/services/auth.service';
import { FacultyLayoutService } from '../../services/faculty-layout.service';
import { Subscription } from 'rxjs';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-faculty-header',
  templateUrl: './faculty-header.component.html',
  styleUrls: ['./faculty-header.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, FormsModule, CommonModule],
})
export class FacultyHeaderComponent implements OnInit, OnDestroy {
  @Input() pageTitle: string = '';

  displayTitle: string = 'Faculty Dashboard';
  facultyName = 'Dr. Sarah Jenkins';
  facultyInitials = 'SJ';
  notificationsCount = 4;
  showProfileMenu = false;
  showSettingsMenu = false;
  settingsPopoverEvent: any = null;
  profilePopoverEvent: any = null;
  currentUser: User | null = null;

  // Additional settings modals
  isAppearanceModalOpen = false;
  isSecurityModalOpen = false;
  isBackupModalOpen = false;
  selectedTheme = 'light';

  // Language state & modal controls
  selectedLanguage!: Language;
  languages: Language[] = [];
  filteredLanguages: Language[] = [];
  searchQuery: string = '';
  isLanguageModalOpen: boolean = false;

  // Notifications modal state
  isNotificationsModalOpen: boolean = false;
  notifications = [
    { id: 1, title: 'New Student Doubt Posted', desc: 'Aarav Sharma asked a question in CS-402', time: '10 mins ago', type: 'doubt', read: false },
    { id: 2, title: 'Assignment Submission', desc: '12 new submissions received for CS-501 Project', time: '1 hour ago', type: 'assignment', read: false },
    { id: 3, title: 'Class Timetable Alert', desc: 'Tomorrow\'s CS-302 lecture rescheduled to Room 104', time: '3 hours ago', type: 'alert', read: false },
    { id: 4, title: 'Department Meeting', desc: 'Faculty Sync meeting scheduled at 4:00 PM today', time: '5 hours ago', type: 'meeting', read: true }
  ];

  // Toast state
  toastMessage: string = '';
  showToast: boolean = false;
  isCollapsed: boolean = false;

  private subs = new Subscription();

  constructor(
    private languageService: LanguageService,
    private authService: AuthService,
    public layoutService: FacultyLayoutService,
    private router: Router
  ) {}

  ngOnInit() {
    this.displayTitle = this.pageTitle || 'Faculty Dashboard';

    this.subs.add(
      this.layoutService.isCollapsed$.subscribe((collapsed) => {
        this.isCollapsed = collapsed;
      })
    );

    this.subs.add(
      this.layoutService.pageTitle$.subscribe((title) => {
        if (!this.pageTitle) {
          this.displayTitle = title;
        }
      })
    );

    this.subs.add(
      this.authService.currentUser$.subscribe((user) => {
        this.currentUser = user;
        if (user) {
          this.facultyName = user.name || 'Faculty Member';
          this.facultyInitials = user.name ? user.name.slice(0, 2).toUpperCase() : 'FC';
        }
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

  toggleSidebar() {
    this.layoutService.toggleSidebar();
  }

  expandSidebar() {
    this.layoutService.expandSidebar();
  }

  shrinkSidebar() {
    this.layoutService.shrinkSidebar();
  }

  onLogoClick() {
    if (this.isCollapsed) {
      this.layoutService.expandSidebar();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  openLanguageModal() {
    this.showProfileMenu = false;
    this.searchQuery = '';
    this.filterLanguages();
    this.isLanguageModalOpen = true;
  }

  closeLanguageModal() {
    this.isLanguageModalOpen = false;
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

  triggerToast(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    toast.info(msg);
    setTimeout(() => {
      this.showToast = false;
    }, 3200);
  }

  openNotificationsModal() {
    this.isNotificationsModalOpen = true;
  }

  closeNotificationsModal() {
    this.isNotificationsModalOpen = false;
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notificationsCount = 0;
  }

  toggleSettingsMenu(event?: any) {
    if (event) {
      event.stopPropagation();
      this.settingsPopoverEvent = event;
    }
    this.showSettingsMenu = !this.showSettingsMenu;
    if (this.showSettingsMenu) {
      this.showProfileMenu = false;
    }
  }

  closeSettingsMenu() {
    this.showSettingsMenu = false;
  }

  onSettingClick(key: string) {
    this.closeSettingsMenu();

    switch (key) {
      case 'account':
        this.router.navigate(['/faculty/profile']);
        break;
      case 'language':
        this.openLanguageModal();
        break;
      case 'appearance':
        this.isAppearanceModalOpen = true;
        break;
      case 'security':
        this.isSecurityModalOpen = true;
        break;
      case 'backup':
        this.isBackupModalOpen = true;
        break;
      case 'notifications':
        this.openNotificationsModal();
        break;
      default:
        break;
    }
  }

  setTheme(theme: string) {
    this.selectedTheme = theme;
    this.isAppearanceModalOpen = false;
    this.triggerToast(`Appearance theme updated to: ${theme.toUpperCase()}`);
  }

  toggleProfileMenu(event?: any) {
    if (event) {
      event.stopPropagation();
      this.profilePopoverEvent = event;
    }
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      this.showSettingsMenu = false;
    }
  }

  logout() {
    this.showProfileMenu = false;
    this.authService.logout();
  }
}
