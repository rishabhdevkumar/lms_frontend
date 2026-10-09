import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, MenuController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, FormsModule, CommonModule],
})
export class SidebarComponent implements OnInit {
  menuSide: 'start' | 'end' = 'start';

  constructor(
    private authService: AuthService,
    private menuCtrl: MenuController
  ) {}

  ngOnInit() {
    this.updateMenuSide();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateMenuSide();
  }

  updateMenuSide() {
    // Mobile/tablet (<1024px): drawer on right ('end')
    // Laptop/desktop (>=1024px): split-pane sidebar on left ('start')
    this.menuSide = window.innerWidth < 1024 ? 'end' : 'start';
  }

  async closeSidebar() {
    // 1. Unconditional Ionic MenuController close
    try {
      await this.menuCtrl.enable(true, 'admin-menu');
      await this.menuCtrl.close('admin-menu');
      await this.menuCtrl.close();
    } catch (e) {
      console.log('Error closing menuCtrl:', e);
    }

    // 2. Direct Web Component DOM element close fallback
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

  logout() {
    this.closeSidebar();
    this.authService.logout();
  }
}
