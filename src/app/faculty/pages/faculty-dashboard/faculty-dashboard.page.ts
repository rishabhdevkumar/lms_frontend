import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-faculty-dashboard',
  templateUrl: './faculty-dashboard.page.html',
  styleUrls: ['./faculty-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class FacultyDashboardPage implements OnInit {

  todaysClasses = [
    {
      time: '09:00 AM - 10:30 AM',
      courseCode: 'CS-402',
      courseName: 'Advanced Web Engineering',
      room: 'Lab 304 / Online',
      students: 48,
      status: 'Live Now',
      statusColor: 'danger'
    },
    {
      time: '11:15 AM - 12:45 PM',
      courseCode: 'CS-501',
      courseName: 'Cloud Native Microservices',
      room: 'Auditorium B',
      students: 64,
      status: 'Upcoming',
      statusColor: 'primary'
    },
    {
      time: '02:00 PM - 03:30 PM',
      courseCode: 'DS-302',
      courseName: 'Data Analytics & Visualization',
      room: 'Lab 102',
      students: 38,
      status: 'Scheduled',
      statusColor: 'medium'
    }
  ];

  pendingGrading = [
    { student: 'Rahul Mehta', assignment: 'Lab 4: Angular Directives & Services', course: 'CS-402', submittedDate: 'Today, 08:30 AM' },
    { student: 'Sneha Reddy', assignment: 'Project Milestone 2: API Integration', course: 'CS-501', submittedDate: 'Yesterday, 06:15 PM' },
    { student: 'Vikram Singh', assignment: 'Assignment 3: Data Cleaning Script', course: 'DS-302', submittedDate: '24 Jul, 04:00 PM' }
  ];

  constructor() { }

  ngOnInit() { }

}
