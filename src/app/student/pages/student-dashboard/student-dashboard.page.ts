import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { AuthService, User } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

export interface EnrolledCourse {
  id: string;
  title: string;
  code: string;
  instructor: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  thumbnail: string;
  badgeColor: string;
}

export interface StudentAssignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: 'Pending' | 'Submitted' | 'Graded';
  score?: string;
}

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.page.html',
  styleUrls: ['./student-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent]
})
export class StudentDashboardPage implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private subs = new Subscription();

  // Metrics Stats
  enrolledCount: number = 4;
  attendancePercentage: number = 94;
  assignmentsPending: number = 2;
  certificatesEarned: number = 3;

  enrolledCourses: EnrolledCourse[] = [
    {
      id: 'c1',
      title: 'Full Stack Web Development with Angular & Node',
      code: 'CS-401',
      instructor: 'Dr. Robert Vance',
      progress: 75,
      lessonsCompleted: 24,
      totalLessons: 32,
      thumbnail: '💻',
      badgeColor: '#047857'
    },
    {
      id: 'c2',
      title: 'Database Management Systems & MySQL',
      code: 'CS-302',
      instructor: 'Prof. Anita Sharma',
      progress: 60,
      lessonsCompleted: 18,
      totalLessons: 30,
      thumbnail: '🗄️',
      badgeColor: '#2563eb'
    },
    {
      id: 'c3',
      title: 'Data Structures & Algorithms in Java',
      code: 'CS-205',
      instructor: 'Dr. Michael Chang',
      progress: 90,
      lessonsCompleted: 36,
      totalLessons: 40,
      thumbnail: '⚡',
      badgeColor: '#7c3aed'
    },
    {
      id: 'c4',
      title: 'Cloud Computing & DevOps Fundamentals',
      code: 'CS-509',
      instructor: 'Eng. Sarah Jenkins',
      progress: 40,
      lessonsCompleted: 12,
      totalLessons: 30,
      thumbnail: '☁️',
      badgeColor: '#d97706'
    }
  ];

  recentAssignments: StudentAssignment[] = [
    {
      id: 'a1',
      title: 'Lab 4: RESTful API Integration & OpenAPI',
      course: 'Full Stack Web Development',
      dueDate: 'Tomorrow, 11:59 PM',
      status: 'Pending'
    },
    {
      id: 'a2',
      title: 'DBMS Project: Stored Procedures & Triggers',
      course: 'Database Management Systems',
      dueDate: 'Oct 12, 2026',
      status: 'Pending'
    },
    {
      id: 'a3',
      title: 'Assignment 2: Binary Search Trees Implementation',
      course: 'Data Structures & Algorithms',
      dueDate: 'Oct 02, 2026',
      status: 'Graded',
      score: '95/100'
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.subs.add(
      this.authService.currentUser$.subscribe((user) => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getStudentName(): string {
    return this.currentUser?.name || 'Student';
  }
}
