import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction?: 'ltr' | 'rtl';
  isAdded?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'lms_selected_language';
  private readonly ADDED_LANGS_KEY = 'lms_added_languages';

  private defaultLanguages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English (US)', flag: '🇺🇸', direction: 'ltr', isAdded: true },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', direction: 'ltr', isAdded: true },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr', isAdded: true },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr', isAdded: true },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr', isAdded: true },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl', isAdded: true },
    { code: 'zh', name: 'Chinese', nativeName: '中文 (简体)', flag: '🇨🇳', direction: 'ltr', isAdded: true },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', direction: 'ltr', isAdded: true },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', direction: 'ltr', isAdded: true },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', direction: 'ltr', isAdded: true },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', direction: 'ltr', isAdded: true },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', direction: 'ltr', isAdded: true },
  ];

  private languagesSubject = new BehaviorSubject<Language[]>(this.loadLanguages());
  public languages$ = this.languagesSubject.asObservable();

  private currentLanguageSubject = new BehaviorSubject<Language>(this.loadCurrentLanguage());
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor() { }

  private loadLanguages(): Language[] {
    const saved = localStorage.getItem(this.ADDED_LANGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved languages', e);
      }
    }
    return this.defaultLanguages;
  }

  private loadCurrentLanguage(): Language {
    const savedCode = localStorage.getItem(this.STORAGE_KEY);
    const langs = this.loadLanguages();
    if (savedCode) {
      const found = langs.find(l => l.code === savedCode);
      if (found) return found;
    }
    return langs[0];
  }

  getLanguages(): Language[] {
    return this.languagesSubject.value;
  }

  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  setLanguage(lang: Language): void {
    localStorage.setItem(this.STORAGE_KEY, lang.code);
    this.currentLanguageSubject.next(lang);
  }

  addLanguage(newLang: Language): boolean {
    const current = this.languagesSubject.value;
    if (current.some(l => l.code.toLowerCase() === newLang.code.toLowerCase())) {
      return false;
    }
    newLang.isAdded = true;
    const updated = [...current, newLang];
    localStorage.setItem(this.ADDED_LANGS_KEY, JSON.stringify(updated));
    this.languagesSubject.next(updated);
    return true;
  }
}
