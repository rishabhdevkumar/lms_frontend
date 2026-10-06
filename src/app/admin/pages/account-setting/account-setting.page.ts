import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.page.html',
  styleUrls: ['./account-setting.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, HeaderComponent]
})
export class AccountSettingPage implements OnInit {

  activeTab: 'profile' | 'email' | 'password' | 'maintenance' | 'other' = 'profile';
  
  toastMessage = '';
  showSavedToast = false;

  // 1. ADMIN PROFILE DETAILS
  adminProfile = {
    name: 'Dr. Rajeshwardat Sharma',
    email: 'admin@lms-edu.com',
    recoveryEmail: 'admin.recovery@lms-edu.com',
    phone: '+91 98000 11223',
    role: 'Super Administrator',
    department: 'Central Academic & Tech Control Office',
    employeeId: 'ADM-2026-99',
    bio: 'Overseeing institutional academic operations, curriculum setups, faculty allocation, system security, and student administration.'
  };

  // 2. CHANGE EMAIL MODEL
  emailData = {
    currentEmail: 'admin@lms-edu.com',
    newEmail: '',
    confirmNewEmail: '',
    otpCode: '',
    otpSent: false
  };

  // 3. CHANGE PASSWORD MODEL
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    enable2FA: true,
    logoutOtherDevices: true
  };

  // 4. SOFTWARE MAINTENANCE MODEL
  maintenanceData = {
    maintenanceMode: false,
    maintenanceMessage: 'System is currently undergoing scheduled upgrade. Please check back shortly.',
    lastBackupTime: '25 Jul 2026, 04:30 AM',
    dbSize: '248.5 MB',
    cacheSize: '18.2 MB',
    softwareVersion: 'v3.8.5 Enterprise Build',
    autoDailyBackup: true,
    logRetentionDays: '30 Days'
  };

  // 5. OTHER ADVANCED SETTINGS
  otherSettings = {
    institutionName: 'LearnSphere University',
    academicSession: '2025-2026',
    maxFileUploadMB: 50,
    sessionTimeout: '30 Minutes',
    apiKey: 'sk_live_lms_994827401928374',
    emailBroadcasts: true,
    activityLogging: true
  };

  constructor() { }

  ngOnInit() { }

  selectTab(tab: 'profile' | 'email' | 'password' | 'maintenance' | 'other') {
    this.activeTab = tab;
  }

  triggerToast(msg: string) {
    this.toastMessage = msg;
    this.showSavedToast = true;
    setTimeout(() => {
      this.showSavedToast = false;
    }, 3500);
  }

  saveProfile() {
    this.triggerToast('✅ Admin profile details updated successfully!');
  }

  sendOtp() {
    if (!this.emailData.newEmail) {
      alert('Please enter a valid new email address!');
      return;
    }
    this.emailData.otpSent = true;
    this.triggerToast('📧 OTP Verification Code sent to ' + this.emailData.newEmail);
  }

  updateEmail() {
    if (this.emailData.newEmail !== this.emailData.confirmNewEmail) {
      alert('New email and confirmation email do not match!');
      return;
    }
    this.adminProfile.email = this.emailData.newEmail;
    this.emailData.currentEmail = this.emailData.newEmail;
    this.emailData.newEmail = '';
    this.emailData.confirmNewEmail = '';
    this.emailData.otpSent = false;
    this.triggerToast('✅ Primary Admin Email updated successfully!');
  }

  updatePassword() {
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword) {
      alert('Please fill out all password fields!');
      return;
    }
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      alert('New password and confirmation password do not match!');
      return;
    }
    this.passwordData.currentPassword = '';
    this.passwordData.newPassword = '';
    this.passwordData.confirmPassword = '';
    this.triggerToast('🔒 Password changed successfully! Security token renewed.');
  }

  triggerBackup() {
    this.maintenanceData.lastBackupTime = new Date().toLocaleString('en-GB');
    this.triggerToast('💾 Database snapshot created and backed up successfully!');
  }

  clearCache() {
    this.maintenanceData.cacheSize = '0.0 MB';
    this.triggerToast('⚡ System cache and temporary files purged clean!');
  }

  toggleMaintenanceMode() {
    const status = this.maintenanceData.maintenanceMode ? 'ENABLED' : 'DISABLED';
    this.triggerToast(`🛠️ System Maintenance Mode is now ${status}`);
  }

  saveOtherSettings() {
    this.triggerToast('⚙️ System preferences and advanced configurations saved!');
  }
}
