import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent implements OnInit {
  isMobileMenuOpen = false;
  isDarkMode = false;
  isSearchOpen = false;
  
  // Active Navigation Tab (Home is active by default)
  activeTab = 'Home';

  // Language Dropdown options
  isLangDropdownOpen = false;
  selectedLang = 'English';
  languages = ['English', 'Hindi', 'Spanish', 'French'];

  ngOnInit() {
    // PERSIST GLOBAL DARK MODE ACROSS ALL PAGES
    const savedTheme = localStorage.getItem('lms_theme');
    if (savedTheme === 'dark' || document.body.classList.contains('dark')) {
      this.isDarkMode = true;
      document.body.classList.add('dark');
    }
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
    this.isLangDropdownOpen = false;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('lms_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('lms_theme', 'light');
    }
  }

  toggleLangDropdown() {
    this.isLangDropdownOpen = !this.isLangDropdownOpen;
  }

  selectLanguage(lang: string) {
    this.selectedLang = lang;
    this.isLangDropdownOpen = false;
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
  }
}
