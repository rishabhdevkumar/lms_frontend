import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FacultyLayoutService {
  // Sidebar collapsed (shrunk) state: default is true (icon-only mode)
  private isCollapsedSubject = new BehaviorSubject<boolean>(true);
  isCollapsed$ = this.isCollapsedSubject.asObservable();

  // Mobile drawer open state
  private isMobileOpenSubject = new BehaviorSubject<boolean>(false);
  isMobileOpen$ = this.isMobileOpenSubject.asObservable();

  // Dynamic page title in top header
  private pageTitleSubject = new BehaviorSubject<string>('Faculty Dashboard');
  pageTitle$ = this.pageTitleSubject.asObservable();

  private routeTitleMap: { [key: string]: string } = {
    '/faculty/dashboard': 'Faculty Dashboard',
    '/faculty/classes': 'My Classes & Timetable',
    '/faculty/assignments': 'Assignments & Grading',
    '/faculty/attendance': 'Student Attendance',
    '/faculty/course-material': 'Upload & Course Material',
    '/faculty/doubts': 'Student Doubts & Q&A Forum',
    '/faculty/profile': 'Faculty Profile & Settings'
  };

  constructor(private router: Router) {

    // Auto-update page title on route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      const matchedKey = Object.keys(this.routeTitleMap).find(k => url.startsWith(k));
      if (matchedKey) {
        this.pageTitleSubject.next(this.routeTitleMap[matchedKey]);
      }
      // On mobile, close sidebar on navigation
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        this.isMobileOpenSubject.next(false);
      }
    });
  }

  get isCollapsed(): boolean {
    return this.isCollapsedSubject.value;
  }

  get isMobileOpen(): boolean {
    return this.isMobileOpenSubject.value;
  }

  toggleSidebar() {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.isMobileOpenSubject.next(!this.isMobileOpenSubject.value);
    } else {
      this.isCollapsedSubject.next(!this.isCollapsedSubject.value);
    }
  }

  expandSidebar() {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.isMobileOpenSubject.next(true);
    } else {
      this.isCollapsedSubject.next(false);
    }
  }

  shrinkSidebar() {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.isMobileOpenSubject.next(false);
    } else {
      this.isCollapsedSubject.next(true);
    }
  }

  setCollapsed(collapsed: boolean) {
    this.isCollapsedSubject.next(collapsed);
  }

  closeMobile() {
    this.isMobileOpenSubject.next(false);
  }

  setPageTitle(title: string) {
    this.pageTitleSubject.next(title);
  }
}
