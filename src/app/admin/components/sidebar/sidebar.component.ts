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

  adminName = 'Dr. Rajeshwardat Sharma';
  adminInitials = 'AD';
  adminRole = 'Super Administrator';

  private subs = new Subscription();

  constructor(
    private authService: AuthService,
    private menuCtrl: MenuController,
    private router: Router,
    private settingsService: AdminSettingsService
  ) {}

  ngOnInit() {
    this.updateMenuSide();
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
    if (!name) return 'RD';
    const cleanName = name.trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  }

  private updateUserInfo(user: User | null) {
    if (user) {
      const u = user as any;
      let resolvedName = user.name || u.fullName || u.username || u.displayName;
      if (resolvedName && resolvedName.toLowerCase().includes('rishabh')) {
        resolvedName = 'Rishabh Dev Kumar';
      } else if (!resolvedName && user.email) {
        resolvedName = 'Rishabh Dev Kumar';
      }
      this.adminName = resolvedName || 'Rishabh Dev Kumar';
      this.adminInitials = this.getInitials(this.adminName);
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
