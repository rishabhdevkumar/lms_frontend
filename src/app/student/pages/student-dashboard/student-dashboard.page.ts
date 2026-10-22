import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { AuthService, User } from '../../../services/auth.service';
import { PaymentService } from '../../../services/payment.service';
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

export interface StudentPaymentOrder {
  id: number;
  orderNumber: string;
  gatewayOrderId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
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

  showPaymentHistoryModal: boolean = false;
  paymentOrders: StudentPaymentOrder[] = [];
  isLoadingPayments: boolean = false;

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

  courseMap: Record<number, string> = {
    1: 'Full-Stack Web Development Mastery (Angular & Node.js)',
    2: 'Python for Data Science, AI & Machine Learning Specialization',
    3: 'UI/UX Design Systems, Figma & Modern Product Interface Design',
    4: 'Data Structures, Algorithms & System Design Interview Bootcamp',
    5: 'Cloud Architecture & DevOps with AWS, Docker & Kubernetes',
    6: 'Financial Analysis, Corporate Valuation & Financial Modeling 2026',
    100: 'Pro Scholar Masterclass Membership',
  };

  constructor(
    private authService: AuthService,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    this.subs.add(
      this.authService.currentUser$.subscribe((user) => {
        this.currentUser = user;
        if (user && user.id) {
          this.loadStudentPaymentsAndEnrollments();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  loadStudentPaymentsAndEnrollments() {
    if (!this.currentUser || !this.currentUser.id) return;
    const numericUserId = parseInt(String(this.currentUser.id).replace(/\D/g, ''), 10) || 1;

    // Load active enrollments
    this.paymentService.getUserEnrollments(numericUserId).subscribe({
      next: (enrollments) => {
        if (Array.isArray(enrollments) && enrollments.length > 0) {
          const paidEnrollments = enrollments.filter(
            (e: any) => e.payment_status === 'paid' || e.payment_status === 'Completed'
          );
          if (paidEnrollments.length > 0) {
            this.enrolledCount = paidEnrollments.length;
          }
        }
      },
      error: (err) => console.warn('[StudentDashboard] Error loading enrollments:', err),
    });

    // Load payment orders
    this.isLoadingPayments = true;
    this.paymentService.getUserOrders(numericUserId).subscribe({
      next: (orders) => {
        this.isLoadingPayments = false;
        if (Array.isArray(orders)) {
          this.paymentOrders = orders.map((o: any, idx: number) => {
            const courseId = Number(o.course_id || o.courseId || 1);
            const dateStr = o.created_at || new Date().toISOString();
            return {
              id: o.id || idx + 1,
              orderNumber: o.order_number || `ORD-${String(o.id || idx + 1).padStart(6, '0')}`,
              gatewayOrderId: o.gateway_order_id || 'N/A',
              courseTitle: this.courseMap[courseId] || `Enrolled Course #${courseId}`,
              amount: Number(o.amount || 0),
              currency: o.currency || 'INR',
              status: String(o.status || 'paid').toLowerCase(),
              createdAt: new Date(dateStr).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }),
            };
          });
        }
      },
      error: (err) => {
        this.isLoadingPayments = false;
        console.warn('[StudentDashboard] Error loading orders:', err);
      },
    });
  }

  getStudentName(): string {
    return this.currentUser?.name || 'Student';
  }

  openPaymentHistory() {
    this.showPaymentHistoryModal = true;
    this.loadStudentPaymentsAndEnrollments();
  }

  closePaymentHistory() {
    this.showPaymentHistoryModal = false;
  }
}
