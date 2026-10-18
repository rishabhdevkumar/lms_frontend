import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, MenuController } from '@ionic/angular';
import { AuthService, User } from 'src/app/services/auth.service';
import { AdminSettingsService } from 'src/app/services/admin-settings.service';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, FormsModule, CommonModule, HeaderComponent],
})
export class SidebarComponent implements OnInit, OnDestroy {
  menuSide: 'start' | 'end' = 'start';

  adminName = 'Dev Kumar';
  adminEmail = 'admin@lms-edu.com';
  adminInitials = 'DK';
  adminRole = 'Admin';
  adminAvatarUrl: string | null = null;

  private subs = new Subscription();

  constructor(
    private authService: AuthService,
    private menuCtrl: MenuController,
    private router: Router,
    private settingsService: AdminSettingsService
  ) {}

  ngOnInit() {
    this.updateMenuSide();
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
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateMenuSide();
  }

  updateMenuSide() {
    this.menuSide = window.innerWidth < 1024 ? 'end' : 'start';
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

    if (user) {
      resolvedName = this.getUserDisplayName(user);
      resolvedEmail = user.email || '';
      if (user.role) {
        resolvedRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
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
        }
      } catch (e) {}
    }

    if (!resolvedName && this.settingsService?.adminProfile?.name) {
      resolvedName = this.settingsService.adminProfile.name;
    }
    if (!resolvedEmail && this.settingsService?.adminProfile?.email) {
      resolvedEmail = this.settingsService.adminProfile.email;
    }

    this.adminName = resolvedName || 'Dev Kumar';
    this.adminEmail = resolvedEmail || 'admin@lms-edu.com';
    this.adminRole = resolvedRole || 'Admin';
    this.adminInitials = this.getInitials(this.adminName);

    const savedAvatar = localStorage.getItem('lms_admin_avatar');
    if (savedAvatar) {
      this.adminAvatarUrl = savedAvatar;
    }
  }

  async closeSidebar() {
    try {
      await this.menuCtrl.enable(true, 'admin-menu');
      await this.menuCtrl.close('admin-menu');
      await this.menuCtrl.close();
    } catch (e) {
      console.log('Error closing menuCtrl:', e);
    }

    try {
      const menuEl = (document.querySelector('ion-menu[menu-id="admin-menu"]') ||
                      document.querySelector('ion-menu[menuId="admin-menu"]') ||
                      document.querySelector('ion-menu')) as any;
      if (menuEl && typeof menuEl.close === 'function') {
        await menuEl.close();
      }
    } catch (e) {
      console.log('Error closing menuEl:', e);
    }
  }

  async onContentClick() {
    await this.closeSidebar();
  }

  goToAccountSetting() {
    this.closeSidebar();
    this.settingsService.openDrawer('profile');
  }

  logout() {
    this.closeSidebar();
    this.authService.logout();
  }
}
