import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { toast } from 'ngx-sonner';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-faculty-dashboard',
  templateUrl: './faculty-dashboard.page.html',
  styleUrls: ['./faculty-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class FacultyDashboardPage implements OnInit {

  facultyName = 'Faculty Member';

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

  isScheduleModalOpen = false;
  newLecture = {
    course: 'CS-402',
    topic: '',
    date: '',
    time: '',
    room: 'Lab 304'
  };

  constructor(private authService: AuthService) { }

  ngOnInit() {
    const user = this.authService.currentUserValue;
    if (user && user.name) {
      this.facultyName = user.name;
    }

    this.authService.currentUser$.subscribe((u) => {
      if (u && u.name) {
        this.facultyName = u.name;
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  openScheduleModal() {
    this.isScheduleModalOpen = true;
  }

  closeScheduleModal() {
    this.isScheduleModalOpen = false;
  }

  getCourseName(code: string): string {
    const map: Record<string, string> = {
      'CS-402': 'Advanced Web Engineering',
      'CS-501': 'Cloud Native Microservices',
      'DS-302': 'Data Analytics & Visualization'
    };
    return map[code] || 'Special Lecture Session';
  }

  submitScheduleLecture() {
    if (!this.newLecture.topic || !this.newLecture.topic.trim()) {
      toast.error('Topic Required', {
        description: 'Please enter a lecture topic before scheduling.'
      });
      return;
    }

    let formattedTime = 'Upcoming Session';
    if (this.newLecture.time) {
      try {
        const d = new Date(this.newLecture.time);
        formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        formattedTime = 'Scheduled';
      }
    }

    this.todaysClasses.unshift({
      time: formattedTime,
      courseCode: this.newLecture.course,
      courseName: this.getCourseName(this.newLecture.course),
      room: this.newLecture.room || 'Lab 304',
      students: 48,
      status: 'Upcoming',
      statusColor: 'primary'
    });

    toast.success('Live Class Scheduled', {
      description: `"${this.newLecture.topic}" for ${this.newLecture.course} has been scheduled successfully.`
    });
    this.newLecture = { course: 'CS-402', topic: '', date: '', time: '', room: 'Lab 304' };
    this.closeScheduleModal();
  }
}
