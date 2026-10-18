import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { BatchesService } from '../../../services/batches.service';
import { BatchItemBackend, BatchStudent } from '../../../interfaces';

@Component({
  selector: 'app-batches',
  templateUrl: './batches.page.html',
  styleUrls: ['./batches.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class BatchesPage implements OnInit {

  activeTab: 'all' | 'active' | 'upcoming' | 'completed' = 'all';
  searchQuery: string = '';
  isLoading: boolean = false;
  isSaving: boolean = false;

  // TOAST NOTIFICATION
  toast: { show: boolean; msg: string; type: 'success' | 'error' | 'info' } = {
    show: false,
    msg: '',
    type: 'success'
  };

  // ADD / EDIT MODAL
  isAddModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedBatch: BatchItemBackend | null = null;

  formData: {
    id?: number;
    batch_code: string;
    course_id: number | '';
    users_id: number | '';
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    room: string;
    status: 'active' | 'upcoming' | 'completed' | '';
  } = {
    batch_code: '',
    course_id: '',
    users_id: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    room: '',
    status: ''
  };

  // STUDENTS MANAGEMENT MODAL
  isStudentsModalOpen = false;
  currentBatchForStudents: BatchItemBackend | null = null;
  enrolledStudentsList: BatchStudent[] = [];
  isLoadingStudents = false;
  selectedStudentToEnroll: number | '' = '';
  isEnrolling = false;

  // DYNAMIC DATA FROM BACKEND
  batchesList: BatchItemBackend[] = [];
  coursesList: any[] = [];
  facultyList: any[] = [];
  studentsList: any[] = [];

  constructor(private batchesService: BatchesService) { }

  ngOnInit() {
    this.loadAllData();
  }

  /**
   * Load batches, courses, and users concurrently
   */
  async loadAllData() {
    this.isLoading = true;
    try {
      await Promise.all([
        this.fetchBatches(),
        this.fetchCourses(),
        this.fetchUsers()
      ]);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Fetch all batches
   */
  async fetchBatches() {
    try {
      const data = await firstValueFrom(this.batchesService.getAllBatches());
      const list = data || [];
      // Sort in ascending serial order so BAT001 (1) comes first, then BAT002 (2)
      list.sort((a, b) => {
        const getNum = (code?: string, id?: number) => {
          if (code) {
            const m = code.match(/(\d+)/);
            if (m) return parseInt(m[1], 10);
          }
          return id || 0;
        };
        return getNum(a.batch_code, a.id) - getNum(b.batch_code, b.id);
      });
      this.batchesList = list;
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  }

  /**
   * Fetch courses for dropdown
   */
  async fetchCourses() {
    try {
      const data = await firstValueFrom(this.batchesService.getCourses());
      this.coursesList = data || [];
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  }

  /**
   * Fetch users and split into faculty and students
   */
  async fetchUsers() {
    try {
      const allUsers = await firstValueFrom(this.batchesService.getUsers());
      if (Array.isArray(allUsers)) {
        this.facultyList = allUsers.filter(u => String(u.role).toLowerCase() === 'faculty');
        this.studentsList = allUsers.filter(u => String(u.role).toLowerCase() === 'student');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }

  // COUNTERS FOR STAT CARDS
  getActiveBatchesCount(): number {
    return this.batchesList.filter(b => b.status?.toLowerCase() === 'active').length;
  }

  getUpcomingBatchesCount(): number {
    return this.batchesList.filter(b => b.status?.toLowerCase() === 'upcoming').length;
  }

  getCompletedBatchesCount(): number {
    return this.batchesList.filter(b => b.status?.toLowerCase() === 'completed').length;
  }

  /**
   * Filter batches by tab and search term
   */
  getFilteredBatches(): BatchItemBackend[] {
    let list = this.batchesList;

    if (this.activeTab !== 'all') {
      const target = this.activeTab.toLowerCase();
      list = list.filter(b => (b.status || '').toLowerCase() === target);
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(b =>
        (b.batch_code && b.batch_code.toLowerCase().includes(q)) ||
        (b.course_name && b.course_name.toLowerCase().includes(q)) ||
        (b.instructor_name && b.instructor_name.toLowerCase().includes(q)) ||
        (b.room && b.room.toLowerCase().includes(q))
      );
    }

    return list;
  }

  // TIME FORMATTING (e.g. "10:00:00" -> "10:00 AM")
  formatTiming(startTime?: string, endTime?: string): string {
    if (!startTime && !endTime) return 'Flexible Schedule';

    const formatSingle = (timeStr?: string): string => {
      if (!timeStr) return '';
      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        let hour = parseInt(parts[0], 10);
        const minute = parts[1];
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
        return `${hourStr}:${minute} ${ampm}`;
      }
      return timeStr;
    };

    const s = formatSingle(startTime);
    const e = formatSingle(endTime);

    if (s && e) return `${s} - ${e}`;
    return s || e || 'Flexible Schedule';
  }

  /**
   * Automatically compute the next sequential batch code (e.g. BAT005)
   * Matches the backend stored procedure format: BAT + 3 digits (e.g. BAT001, BAT002...)
   */
  generateNextBatchCode(): string {
    let maxNum = 0;
    if (this.batchesList && this.batchesList.length > 0) {
      for (const b of this.batchesList) {
        if (b.batch_code) {
          const match = b.batch_code.match(/BAT(\d+)/i) || b.batch_code.match(/(\d+)/);
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        }
      }
    }
    const nextNum = maxNum > 0 ? maxNum + 1 : 1;
    return `BAT${String(nextNum).padStart(3, '0')}`;
  }

  // MODAL CONTROLS
  openAddModal() {
    this.modalMode = 'add';
    this.selectedBatch = null;

    const autoCode = this.generateNextBatchCode();

    this.formData = {
      batch_code: autoCode,
      course_id: '',
      users_id: '',
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      room: '',
      status: ''
    };
    this.isAddModalOpen = true;
  }

  openEditModal(item: BatchItemBackend) {
    this.modalMode = 'edit';
    this.selectedBatch = item;

    // Format dates to YYYY-MM-DD for standard html date picker
    const formatDateForInput = (d?: string) => {
      if (!d) return '';
      try {
        return new Date(d).toISOString().slice(0, 10);
      } catch {
        return d.slice(0, 10);
      }
    };

    // Format time to HH:mm for standard html time picker
    const formatTimeForInput = (t?: string) => {
      if (!t) return '';
      const parts = t.split(':');
      if (parts.length >= 2) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
      }
      return t;
    };

    this.formData = {
      id: item.id,
      batch_code: item.batch_code || '',
      course_id: item.course_id || '',
      users_id: item.users_id || '',
      start_date: formatDateForInput(item.start_date),
      end_date: formatDateForInput(item.end_date),
      start_time: formatTimeForInput(item.start_time),
      end_time: formatTimeForInput(item.end_time),
      room: item.room || '',
      status: (item.status as any) || 'active'
    };
    this.isAddModalOpen = true;
  }

  closeModal() {
    this.isAddModalOpen = false;
    this.selectedBatch = null;
  }

  // SAVE BATCH (ADD OR UPDATE)
  async saveBatch() {
    if (!this.formData.course_id) {
      this.showToast('Please select a course program', 'error');
      return;
    }
    if (!this.formData.users_id) {
      this.showToast('Please select an instructor / faculty member', 'error');
      return;
    }

    this.isSaving = true;

    try {
      const formatTimeForBackend = (t: string) => {
        if (!t) return null;
        if (t.length === 5) return `${t}:00`;
        return t;
      };

      if (this.modalMode === 'add') {
        const payload = {
          course_id: Number(this.formData.course_id),
          users_id: Number(this.formData.users_id),
          start_date: this.formData.start_date || null,
          end_date: this.formData.end_date || null,
          start_time: formatTimeForBackend(this.formData.start_time),
          end_time: formatTimeForBackend(this.formData.end_time),
          room: this.formData.room ? this.formData.room.trim() : null,
          status: this.formData.status?.toLowerCase() || 'upcoming'
        };

        const res = await firstValueFrom(this.batchesService.createBatch(payload));
        if (res.ok) {
          this.showToast('Batch created successfully!', 'success');
          await this.fetchBatches();
          this.closeModal();
        } else {
          this.showToast(res.msg || 'Failed to create batch', 'error');
        }

      } else if (this.modalMode === 'edit' && this.selectedBatch) {
        const payload = {
          id: Number(this.selectedBatch.id),
          batch_code: this.formData.batch_code ? this.formData.batch_code.trim() : null,
          course_id: Number(this.formData.course_id),
          users_id: Number(this.formData.users_id),
          start_date: this.formData.start_date || null,
          end_date: this.formData.end_date || null,
          start_time: formatTimeForBackend(this.formData.start_time),
          end_time: formatTimeForBackend(this.formData.end_time),
          room: this.formData.room ? this.formData.room.trim() : null,
          status: this.formData.status?.toLowerCase() || 'active'
        };

        const res = await firstValueFrom(this.batchesService.updateBatch(payload));
        if (res.ok) {
          this.showToast('Batch updated successfully!', 'success');
          await this.fetchBatches();
          this.closeModal();
        } else {
          this.showToast(res.msg || 'Failed to update batch', 'error');
        }
      }
    } catch (e: any) {
      console.error('Error saving batch:', e);
      this.showToast(e?.message || 'Unexpected error occurred', 'error');
    } finally {
      this.isSaving = false;
    }
  }

  // DELETE BATCH
  async deleteBatch(batch: BatchItemBackend) {
    if (batch.enrolled_students_count && batch.enrolled_students_count > 0) {
      alert(`Cannot delete batch "${batch.batch_code}" because ${batch.enrolled_students_count} student(s) are enrolled. Please remove all enrolled students first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete batch "${batch.batch_code}"?`)) {
      return;
    }

    try {
      const res = await firstValueFrom(this.batchesService.deleteBatch(batch.id));
      if (res.ok) {
        this.showToast('Batch deleted successfully!', 'success');
        this.batchesList = this.batchesList.filter(b => b.id !== batch.id);
      } else {
        this.showToast(res.msg || 'Failed to delete batch', 'error');
      }
    } catch (e: any) {
      console.error('Error deleting batch:', e);
      this.showToast('Failed to delete batch. Please check server logs.', 'error');
    }
  }

  // ==========================================
  // ENROLLED STUDENTS MANAGEMENT
  // ==========================================
  async openStudentsModal(batch: BatchItemBackend) {
    this.currentBatchForStudents = batch;
    this.isStudentsModalOpen = true;
    this.selectedStudentToEnroll = '';
    await this.loadEnrolledStudents(batch.id);
  }

  closeStudentsModal() {
    this.isStudentsModalOpen = false;
    this.currentBatchForStudents = null;
    this.enrolledStudentsList = [];
    this.selectedStudentToEnroll = '';
  }

  async loadEnrolledStudents(batchId: number) {
    this.isLoadingStudents = true;
    try {
      const data = await firstValueFrom(this.batchesService.getEnrolledStudents(batchId));
      this.enrolledStudentsList = data || [];
      // Synchronize count in batchesList
      const b = this.batchesList.find(x => x.id === batchId);
      if (b) {
        b.enrolled_students_count = this.enrolledStudentsList.length;
      }
    } catch (err) {
      console.error('Error loading enrolled students:', err);
    } finally {
      this.isLoadingStudents = false;
    }
  }

  // Filter students who are not yet enrolled in this batch
  getAvailableStudentsToEnroll(): any[] {
    if (!this.studentsList) return [];
    const enrolledUserIds = new Set(this.enrolledStudentsList.map(s => Number(s.user_id)));
    return this.studentsList.filter(s => !enrolledUserIds.has(Number(s.id)));
  }

  async enrollStudent() {
    if (!this.selectedStudentToEnroll || !this.currentBatchForStudents) {
      this.showToast('Please select a student to enroll', 'error');
      return;
    }

    this.isEnrolling = true;
    try {
      const res = await firstValueFrom(this.batchesService.enrollStudent(this.currentBatchForStudents.id, Number(this.selectedStudentToEnroll)));
      if (res.ok) {
        this.showToast('Student enrolled successfully!', 'success');
        this.selectedStudentToEnroll = '';
        await this.loadEnrolledStudents(this.currentBatchForStudents.id);
      } else {
        this.showToast(res.msg || 'Failed to enroll student', 'error');
      }
    } catch (err: any) {
      this.showToast(err?.message || 'Error enrolling student', 'error');
    } finally {
      this.isEnrolling = false;
    }
  }

  async removeStudent(student: BatchStudent) {
    if (!this.currentBatchForStudents) return;

    if (!confirm(`Remove "${student.name}" from batch ${this.currentBatchForStudents.batch_code}?`)) {
      return;
    }

    try {
      const res = await firstValueFrom(this.batchesService.removeStudent(this.currentBatchForStudents.id, student.user_id));
      if (res.ok) {
        this.showToast('Student removed from batch', 'info');
        await this.loadEnrolledStudents(this.currentBatchForStudents.id);
      } else {
        this.showToast(res.msg || 'Failed to remove student', 'error');
      }
    } catch (err: any) {
      this.showToast(err?.message || 'Error removing student', 'error');
    }
  }

  // TOAST UTILITY
  showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toast = { show: true, msg, type };
    setTimeout(() => {
      this.toast.show = false;
    }, 3500);
  }
}
