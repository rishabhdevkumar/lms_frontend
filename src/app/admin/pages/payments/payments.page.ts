import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';

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
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, HeaderComponent]
})
export class PaymentsPage implements OnInit {

  activeTab: 'all' | 'completed' | 'pending' | 'refunded' = 'all';
  searchQuery: string = '';

  transactions: PaymentTransaction[] = [
    { id: 1, txnId: 'TXN-998201', studentName: 'Aarav Sharma', courseName: 'B.Tech Computer Science', amount: 1200, paymentMethod: 'Credit Card (Stripe)', date: '12 Jan 2026', status: 'Completed' },
    { id: 2, txnId: 'TXN-998202', studentName: 'Priya Patel', courseName: 'B.Sc Data Science & AI', amount: 1400, paymentMethod: 'UPI / NetBanking', date: '18 Feb 2026', status: 'Completed' },
    { id: 3, txnId: 'TXN-998203', studentName: 'Rohan Verma', courseName: 'B.Tech Information Tech', amount: 450, paymentMethod: 'Debit Card', date: '02 Mar 2026', status: 'Pending' },
    { id: 4, txnId: 'TXN-998204', studentName: 'Ananya Gupta', courseName: 'M.Tech Software Engg', amount: 1400, paymentMethod: 'Wire Transfer', date: '10 Mar 2026', status: 'Completed' },
    { id: 5, txnId: 'TXN-998205', studentName: 'Vikramaditya Roy', courseName: 'B.Tech Computer Science', amount: 350, paymentMethod: 'UPI', date: '04 Apr 2026', status: 'Refunded' }
  ];

  constructor() { }

  ngOnInit() { }

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
        t.courseName.toLowerCase().includes(q)
      );
    }

    return list;
  }

  getTotalRevenue(): number {
    return this.transactions
      .filter(t => t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }

}
