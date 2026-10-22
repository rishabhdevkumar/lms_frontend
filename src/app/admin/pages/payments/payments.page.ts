import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PaymentService } from '../../../services/payment.service';
import { toast } from 'ngx-sonner';

export interface PaymentTransaction {
  id: number;
  txnId: string;
  studentName: string;
  courseName: string;
  amount: number;
  paymentMethod: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Refunded';
}

@Component({
  selector: 'app-payments',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class PaymentsPage implements OnInit {

  activeTab: 'all' | 'completed' | 'pending' | 'refunded' = 'all';
  searchQuery: string = '';
  isLoading: boolean = false;

  defaultTransactions: PaymentTransaction[] = [
    { id: 101, txnId: 'TXN-998201', studentName: 'Aarav Sharma', courseName: 'B.Tech Computer Science', amount: 1200, paymentMethod: 'Razorpay (Card)', date: '12 Jan 2026', status: 'Completed' },
    { id: 102, txnId: 'TXN-998202', studentName: 'Priya Patel', courseName: 'B.Sc Data Science & AI', amount: 1400, paymentMethod: 'Razorpay (UPI)', date: '18 Feb 2026', status: 'Completed' },
    { id: 103, txnId: 'TXN-998203', studentName: 'Rohan Verma', courseName: 'B.Tech Information Tech', amount: 450, paymentMethod: 'Razorpay (NetBanking)', date: '02 Mar 2026', status: 'Pending' },
    { id: 104, txnId: 'TXN-998204', studentName: 'Ananya Gupta', courseName: 'M.Tech Software Engg', amount: 1400, paymentMethod: 'Razorpay (UPI)', date: '10 Mar 2026', status: 'Completed' },
    { id: 105, txnId: 'TXN-998205', studentName: 'Vikramaditya Roy', courseName: 'B.Tech Computer Science', amount: 350, paymentMethod: 'Razorpay (Wallet)', date: '04 Apr 2026', status: 'Refunded' }
  ];

  transactions: PaymentTransaction[] = [];

  // Course title mapping helper
  courseMap: Record<number, string> = {
    1: 'Full-Stack Web Development Mastery',
    2: 'Python for Data Science, AI & ML',
    3: 'UI/UX Design Systems & Figma',
    4: 'Data Structures & Algorithms Bootcamp',
    5: 'Cloud Architecture & DevOps with AWS',
    6: 'Financial Analysis & Valuation 2026',
    100: 'Pro Scholar Subscription Tier',
  };

  constructor(private paymentService: PaymentService) { }

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.isLoading = true;
    this.paymentService.getAllEnrollments().subscribe({
      next: (enrollments: any[]) => {
        this.isLoading = false;
        if (Array.isArray(enrollments) && enrollments.length > 0) {
          const liveItems: PaymentTransaction[] = enrollments.map((e: any, index: number) => {
            const rawStatus = String(e.payment_status || 'pending').toLowerCase();
            let status: 'Completed' | 'Pending' | 'Refunded' = 'Pending';
            if (rawStatus === 'paid' || rawStatus === 'completed') status = 'Completed';
            else if (rawStatus === 'refunded') status = 'Refunded';

            const courseId = Number(e.course_id || e.courseId || 1);
            const courseName = this.courseMap[courseId] || `Program Course #${courseId}`;
            const studentId = e.users_id || e.user_id || e.student_id || 1;
            const dateStr = e.enrolled_at || e.created_at || new Date().toISOString();
            const formattedDate = new Date(dateStr).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });

            return {
              id: e.id || index + 1,
              txnId: `RZP-${String(e.id || index + 1).padStart(6, '0')}`,
              studentName: e.user_name || e.student_name || `Student (ID: ${studentId})`,
              courseName: courseName,
              amount: e.amount ? Number(e.amount) : (status === 'Completed' ? 1200 : 450),
              paymentMethod: 'Razorpay (Live Gateway)',
              date: formattedDate,
              status: status,
            };
          });

          this.transactions = liveItems;
        } else {
          // If no database records found, fallback to default seed transactions
          this.transactions = [...this.defaultTransactions];
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.warn('[PaymentsPage] Failed to load live enrollments, using seed data:', err);
        this.transactions = [...this.defaultTransactions];
      }
    });
  }

  getFilteredTransactions(): PaymentTransaction[] {
    let list = this.transactions;

    if (this.activeTab !== 'all') {
      const target = this.activeTab.toLowerCase();
      list = list.filter(t => t.status.toLowerCase() === target);
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(t =>
        t.txnId.toLowerCase().includes(q) ||
        t.studentName.toLowerCase().includes(q) ||
        t.courseName.toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q)
      );
    }

    return list;
  }

  getTotalRevenue(): number {
    return this.transactions
      .filter(t => t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getPendingAmount(): number {
    return this.transactions
      .filter(t => t.status === 'Pending')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getRefundedAmount(): number {
    return this.transactions
      .filter(t => t.status === 'Refunded')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  exportFinancialLedger() {
    const list = this.getFilteredTransactions();
    if (list.length === 0) {
      toast.info('No Transactions', { description: 'No transactions to export for the current filter.' });
      return;
    }

    const headers = ['Transaction ID', 'Student Name', 'Course Program', 'Amount (INR)', 'Payment Method', 'Date', 'Status'];
    const rows = list.map(t => [
      `"${t.txnId}"`,
      `"${t.studentName.replace(/"/g, '""')}"`,
      `"${t.courseName.replace(/"/g, '""')}"`,
      t.amount,
      `"${t.paymentMethod}"`,
      `"${t.date}"`,
      `"${t.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LearnSphere_Financial_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Ledger Exported', { description: 'Financial transactions ledger downloaded as CSV.' });
  }

  refreshTransactions() {
    toast.info('Refreshing...', { description: 'Fetching latest payments and enrollments from server.' });
    this.loadTransactions();
  }

}
