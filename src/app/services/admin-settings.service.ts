import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AdminProfile {
  name: string;
  email: string;
  recoveryEmail: string;
  phone: string;
  role: string;
  department: string;
  employeeId: string;
  bio: string;
}

export interface MaintenanceData {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  lastBackupTime: string;
  dbSize: string;
  cacheSize: string;
  softwareVersion: string;
  autoDailyBackup: boolean;
  logRetentionDays: string;
}

export interface OtherSettings {
  institutionName: string;
  academicSession: string;
  maxFileUploadMB: number;
  sessionTimeout: string;
  apiKey: string;
  emailBroadcasts: boolean;
  activityLogging: boolean;
}

export type SettingsTab = 'profile' | 'email' | 'password' | 'maintenance' | 'other' | 'theme';

@Injectable({
  providedIn: 'root'
})
export class AdminSettingsService {

  private isDrawerOpenSubject = new BehaviorSubject<boolean>(false);
  isDrawerOpen$ = this.isDrawerOpenSubject.asObservable();

  private activeTabSubject = new BehaviorSubject<SettingsTab>('profile');
  activeTab$ = this.activeTabSubject.asObservable();

  adminProfile: AdminProfile = {
    name: 'Dr. Rajeshwardat Sharma',
    email: 'admin@lms-edu.com',
    recoveryEmail: 'admin.recovery@lms-edu.com',
    phone: '+91 98000 11223',
    role: 'Super Administrator',
    department: 'Central Academic & Tech Control Office',
    employeeId: 'ADM-2026-99',
    bio: 'Overseeing institutional academic operations, curriculum setups, faculty allocation, system security, and student administration.'
  };

  emailData = {
    currentEmail: 'admin@lms-edu.com',
    newEmail: '',
    confirmNewEmail: '',
    otpCode: '',
    otpSent: false
  };

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    enable2FA: true,
    logoutOtherDevices: true
  };

  maintenanceData: MaintenanceData = {
    maintenanceMode: false,
    maintenanceMessage: 'System is currently undergoing scheduled upgrade. Please check back shortly.',
    lastBackupTime: '25 Jul 2026, 04:30 AM',
    dbSize: '248.5 MB',
    cacheSize: '18.2 MB',
    softwareVersion: 'v3.8.5 Enterprise Build',
    autoDailyBackup: true,
    logRetentionDays: '30 Days'
  };

  otherSettings: OtherSettings = {
    institutionName: 'LearnSphere University',
    academicSession: '2025-2026',
    maxFileUploadMB: 50,
    sessionTimeout: '30 Minutes',
    apiKey: 'sk_live_lms_994827401928374',
    emailBroadcasts: true,
    activityLogging: true
  };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedProfile = localStorage.getItem('lms_admin_profile');
      if (savedProfile) {
        this.adminProfile = { ...this.adminProfile, ...JSON.parse(savedProfile) };
      }
      const savedMaintenance = localStorage.getItem('lms_maintenance_data');
      if (savedMaintenance) {
        this.maintenanceData = { ...this.maintenanceData, ...JSON.parse(savedMaintenance) };
      }
      const savedOther = localStorage.getItem('lms_other_settings');
      if (savedOther) {
        this.otherSettings = { ...this.otherSettings, ...JSON.parse(savedOther) };
      }
    } catch (e) {
      console.warn('Failed to parse settings from storage', e);
    }
  }

  openDrawer(tab?: SettingsTab) {
    if (tab) {
      this.activeTabSubject.next(tab);
    }
    this.isDrawerOpenSubject.next(true);
  }

  closeDrawer() {
    this.isDrawerOpenSubject.next(false);
  }

  toggleDrawer(tab?: SettingsTab) {
    if (tab) {
      this.activeTabSubject.next(tab);
    }
    this.isDrawerOpenSubject.next(!this.isDrawerOpenSubject.value);
  }

  setActiveTab(tab: SettingsTab) {
    this.activeTabSubject.next(tab);
  }

  getActiveTab(): SettingsTab {
    return this.activeTabSubject.value;
  }

  isDrawerOpen(): boolean {
    return this.isDrawerOpenSubject.value;
  }

  saveProfile(): boolean {
    try {
      localStorage.setItem('lms_admin_profile', JSON.stringify(this.adminProfile));
      return true;
    } catch {
      return false;
    }
  }

  saveMaintenance(): boolean {
    try {
      localStorage.setItem('lms_maintenance_data', JSON.stringify(this.maintenanceData));
      return true;
    } catch {
      return false;
    }
  }

  saveOtherSettings(): boolean {
    try {
      localStorage.setItem('lms_other_settings', JSON.stringify(this.otherSettings));
      return true;
    } catch {
      return false;
    }
  }
}
