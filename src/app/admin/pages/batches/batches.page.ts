import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';

export interface BatchItem {
  id: number;
  batchCode: string;
  courseName: string;
  instructorName: string;
  totalStudents: number;
  startDate: string;
  endDate: string;
  timing: string;
  roomNo: string;
  status: 'Active' | 'Upcoming' | 'Completed';
}

@Component({
  selector: 'app-batches',
  templateUrl: './batches.page.html',
  styleUrls: ['./batches.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, HeaderComponent]
})
export class BatchesPage implements OnInit {

  activeTab: 'all' | 'active' | 'upcoming' | 'completed' = 'all';
  searchQuery: string = '';

  isAddModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedBatch: BatchItem | null = null;

  formData: Partial<BatchItem> = {
    batchCode: '',
    courseName: 'B.Tech Computer Science',
    instructorName: 'Dr. Sarah Jenkins',
    totalStudents: 45,
    startDate: '2026-08-01',
    endDate: '2026-12-15',
    timing: '09:00 AM - 11:00 AM',
    roomNo: 'Lab-104',
    status: 'Active'
  };

  batchesList: BatchItem[] = [
    {
      id: 1,
      batchCode: 'CS-2026-A1',
      courseName: 'B.Tech Computer Science',
      instructorName: 'Dr. Sarah Jenkins',
      totalStudents: 48,
      startDate: '15 Jan 2026',
      endDate: '30 Jun 2026',
      timing: '09:00 AM - 11:00 AM',
      roomNo: 'Block B - Room 204',
      status: 'Active'
    },
    {
      id: 2,
      batchCode: 'DS-2026-B2',
      courseName: 'B.Sc Data Science & AI',
      instructorName: 'Dr. Rajesh Kumar',
      totalStudents: 42,
      startDate: '01 Feb 2026',
      endDate: '15 Jul 2026',
      timing: '11:30 AM - 01:30 PM',
      roomNo: 'AI Lab 3',
      status: 'Active'
    },
    {
      id: 3,
      batchCode: 'IT-2026-C1',
      courseName: 'B.Tech Information Tech',
      instructorName: 'Prof. Ananya Gupta',
      totalStudents: 55,
      startDate: '10 Aug 2026',
      endDate: '20 Dec 2026',
      timing: '02:00 PM - 04:00 PM',
      roomNo: 'Block C - Room 102',
      status: 'Upcoming'
    },
    {
      id: 4,
      batchCode: 'SE-2025-A2',
      courseName: 'M.Tech Software Engg',
      instructorName: 'Dr. Vikramaditya Roy',
      totalStudents: 38,
      startDate: '10 Aug 2025',
      endDate: '15 Jan 2026',
      timing: '10:00 AM - 12:00 PM',
      roomNo: 'PG Hall 1',
      status: 'Completed'
    }
  ];

  constructor() { }

  ngOnInit() { }

  getFilteredBatches(): BatchItem[] {
    let list = this.batchesList;

    if (this.activeTab !== 'all') {
      const target = this.activeTab.toLowerCase();
      list = list.filter(b => b.status.toLowerCase() === target);
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(b =>
        b.batchCode.toLowerCase().includes(q) ||
        b.courseName.toLowerCase().includes(q) ||
        b.instructorName.toLowerCase().includes(q) ||
        b.roomNo.toLowerCase().includes(q)
      );
    }

    return list;
  }

  openAddModal() {
    this.modalMode = 'add';
    this.formData = {
      batchCode: `BATCH-2026-0${this.batchesList.length + 1}`,
      courseName: 'B.Tech Computer Science',
      instructorName: 'Dr. Sarah Jenkins',
      totalStudents: 40,
      startDate: '2026-08-01',
      endDate: '2026-12-15',
      timing: '09:00 AM - 11:00 AM',
      roomNo: 'Lab 201',
      status: 'Active'
    };
    this.isAddModalOpen = true;
  }

  openEditModal(item: BatchItem) {
    this.modalMode = 'edit';
    this.selectedBatch = item;
    this.formData = { ...item };
    this.isAddModalOpen = true;
  }

  closeModal() {
    this.isAddModalOpen = false;
    this.selectedBatch = null;
  }

  saveBatch() {
    if (!this.formData.batchCode || !this.formData.courseName) return;

    if (this.modalMode === 'add') {
      const newObj: BatchItem = {
        id: Date.now(),
        batchCode: this.formData.batchCode || 'BATCH-NEW',
        courseName: this.formData.courseName || 'B.Tech CS',
        instructorName: this.formData.instructorName || 'Lead Faculty',
        totalStudents: this.formData.totalStudents || 40,
        startDate: this.formData.startDate || '10 Aug 2026',
        endDate: this.formData.endDate || '20 Dec 2026',
        timing: this.formData.timing || '09:00 AM - 11:00 AM',
        roomNo: this.formData.roomNo || 'Room 101',
        status: (this.formData.status as any) || 'Active'
      };
      this.batchesList.unshift(newObj);
    } else if (this.modalMode === 'edit' && this.selectedBatch) {
      Object.assign(this.selectedBatch, this.formData);
    }

    this.closeModal();
  }

  deleteBatch(id: number) {
    if (confirm('Are you sure you want to delete this batch record?')) {
      this.batchesList = this.batchesList.filter(b => b.id !== id);
    }
  }

}
