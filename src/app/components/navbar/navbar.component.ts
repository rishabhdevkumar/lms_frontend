import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService, Language } from 'src/app/services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isDarkMode = false;
  isSearchOpen = false;
  
  // Active Navigation Tab (Home is active by default)
  activeTab = 'Home';

  // Language Dropdown options
  isLangDropdownOpen = false;
  selectedLang: Language | null = null;
  languages: Language[] = [];

  private subs = new Subscription();

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    // PERSIST GLOBAL DARK MODE ACROSS ALL PAGES
    const savedTheme = localStorage.getItem('lms_theme');
    if (savedTheme === 'dark' || document.body.classList.contains('dark')) {
      this.isDarkMode = true;
      document.body.classList.add('dark');
    }

    this.subs.add(
      this.languageService.currentLanguage$.subscribe(lang => {
        this.selectedLang = lang;
      })
    );

    this.subs.add(
      this.languageService.languages$.subscribe(langs => {
        this.languages = langs;
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

  selectLanguage(lang: Language) {
    this.languageService.setLanguage(lang);
    this.isLangDropdownOpen = false;
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
  }
}
