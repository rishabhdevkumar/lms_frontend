import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';

export interface CertificateRecord {
  id: number;
  certId: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  grade: string;
  status: 'Issued' | 'Pending Approval' | 'Revoked';
}

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.page.html',
  styleUrls: ['./certificates.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, HeaderComponent]
})
export class CertificatesPage implements OnInit {

  activeTab: 'all' | 'issued' | 'pending' = 'all';
  searchQuery: string = '';

  certificates: CertificateRecord[] = [
    { id: 1, certId: 'CERT-2026-001', studentName: 'Aarav Sharma', courseName: 'B.Tech Computer Science', issueDate: '15 Jun 2026', grade: 'A+ (94%)', status: 'Issued' },
    { id: 2, certId: 'CERT-2026-002', studentName: 'Priya Patel', courseName: 'B.Sc Data Science & AI', issueDate: '20 Jun 2026', grade: 'O (98%)', status: 'Issued' },
    { id: 3, certId: 'CERT-2026-003', studentName: 'Rohan Verma', courseName: 'B.Tech Information Tech', issueDate: '01 Jul 2026', grade: 'A (87%)', status: 'Pending Approval' },
    { id: 4, certId: 'CERT-2026-004', studentName: 'Ananya Gupta', courseName: 'M.Tech Software Engg', issueDate: '05 Jul 2026', grade: 'A+ (96%)', status: 'Issued' }
  ];

  constructor() { }

  ngOnInit() { }

  getFilteredCertificates(): CertificateRecord[] {
    let list = this.certificates;

    if (this.activeTab !== 'all') {
      const target = this.activeTab === 'issued' ? 'issued' : 'pending';
      list = list.filter(c => c.status.toLowerCase().includes(target));
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(c =>
        c.certId.toLowerCase().includes(q) ||
        c.studentName.toLowerCase().includes(q) ||
        c.courseName.toLowerCase().includes(q)
      );
    }

    return list;
  }

  issueCertificate(item: CertificateRecord) {
    item.status = 'Issued';
    alert(`Certificate "${item.certId}" issued to ${item.studentName}!`);
  }

}
