import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FacultyHeaderComponent } from '../../components/faculty-header/faculty-header.component';

@Component({
  selector: 'app-faculty-profile',
  templateUrl: './faculty-profile.page.html',
  styleUrls: ['./faculty-profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, FacultyHeaderComponent]
})
export class FacultyProfilePage implements OnInit {
  facultyData = {
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@lms-edu.com',
    phone: '+91 98765 11223',
    department: 'Computer Science & Engineering',
    designation: 'Senior Professor',
    employeeId: 'FAC-2026-088',
    officeRoom: 'Block B - Room 402',
    officeHours: 'Mon & Wed: 03:00 PM - 05:00 PM',
    bio: 'Specializing in Web Engineering, Cloud Architecture, and Distributed Microservices with 12+ years of teaching experience.'
  };

  notificationPrefs = {
    emailAlerts: true,
    doubtNotifications: true,
    submissionAlerts: true,
    smsAlerts: false
  };

  constructor() { }

  ngOnInit() { }

  saveProfile() {
    alert('Faculty profile settings updated successfully!');
  }
}
