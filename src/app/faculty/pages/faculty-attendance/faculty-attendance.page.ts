import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { toast } from 'ngx-sonner';

interface Student {
  rollNo: string;
  name: string;
  status: 'Present' | 'Absent' | 'Late';
}

interface CourseOption {
  code: string;
  name: string;
  department: string;
  room: string;
}

@Component({
  selector: 'app-faculty-attendance',
  templateUrl: './faculty-attendance.page.html',
  styleUrls: ['./faculty-attendance.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class FacultyAttendancePage implements OnInit {
  selectedCourse: string = 'CS-402';
  selectedDate: string = '2026-08-05';
  selectedSession: string = 'Morning (09:00 AM - 10:30 AM)';
  searchQuery: string = '';
  activeFilter: 'all' | 'Present' | 'Absent' | 'Late' = 'all';

  isSubmitting: boolean = false;
  showSuccessToast: boolean = false;
  toastMessage: string = '';

  courses: CourseOption[] = [
    { code: 'CS-402', name: 'CS-402: Web Engineering', department: 'Computer Science', room: 'Lab 304' },
    { code: 'CS-501', name: 'CS-501: Microservices', department: 'Cloud Computing', room: 'Auditorium B' },
    { code: 'DS-302', name: 'DS-302: Data Analytics', department: 'Data Science', room: 'Lab 102' },
    { code: 'SE-601', name: 'SE-601: Software Architecture', department: 'Software Eng.', room: 'Hall A' }
  ];

  sessions: string[] = [
    'Morning (09:00 AM - 10:30 AM)',
    'Midday (11:15 AM - 12:45 PM)',
    'Afternoon Lab (02:00 PM - 03:30 PM)',
    'Evening Tutorial (03:30 PM - 05:00 PM)'
  ];

  students: Student[] = [
    { rollNo: 'CS-2026-001', name: 'Aarav Sharma', status: 'Present' },
    { rollNo: 'CS-2026-002', name: 'Aditi Rao', status: 'Present' },
    { rollNo: 'CS-2026-003', name: 'Bhavya Jain', status: 'Absent' },
    { rollNo: 'CS-2026-004', name: 'Devansh Roy', status: 'Present' },
    { rollNo: 'CS-2026-005', name: 'Isha Nair', status: 'Late' },
    { rollNo: 'CS-2026-006', name: 'Karan Malhotra', status: 'Present' },
    { rollNo: 'CS-2026-007', name: 'Meera Iyer', status: 'Present' },
    { rollNo: 'CS-2026-008', name: 'Nikhil Saxena', status: 'Absent' },
    { rollNo: 'CS-2026-009', name: 'Pooja Agarwal', status: 'Present' },
    { rollNo: 'CS-2026-010', name: 'Rohan Verma', status: 'Present' }
  ];

  constructor() {}

  ngOnInit() {}

  get currentCourse(): CourseOption {
    return this.courses.find(c => c.code === this.selectedCourse) || this.courses[0];
  }

  setStatus(student: Student, status: 'Present' | 'Absent' | 'Late') {
    student.status = status;
  }

  markAllPresent() {
    this.students.forEach(s => s.status = 'Present');
    toast.success('All Students Marked Present', {
      description: `All ${this.students.length} students have been set to Present.`
    });
  }

  markAllAbsent() {
    this.students.forEach(s => s.status = 'Absent');
    toast.warning('All Students Marked Absent', {
      description: `All ${this.students.length} students have been set to Absent.`
    });
  }

  resetAttendance() {
    this.students.forEach(s => s.status = 'Present');
    this.searchQuery = '';
    this.activeFilter = 'all';
    toast.info('Attendance Reset', {
      description: 'Attendance list has been reset to default state.'
    });
  }

  get presentCount(): number {
    return this.students.filter(s => s.status === 'Present').length;
  }

  get absentCount(): number {
    return this.students.filter(s => s.status === 'Absent').length;
  }

  get lateCount(): number {
    return this.students.filter(s => s.status === 'Late').length;
  }

  get percentage(): number {
    if (!this.students.length) return 0;
    return Math.round((this.presentCount / this.students.length) * 100);
  }

  Math = Math;

  get presentPercentage(): number {
    return this.students.length ? Math.round((this.presentCount / this.students.length) * 100) : 0;
  }

  get absentPercentage(): number {
    return this.students.length ? Math.round((this.absentCount / this.students.length) * 100) : 0;
  }

  get filteredStudents(): Student[] {
    return this.students.filter(s => {
      const matchesSearch = 
        !this.searchQuery || 
        s.name.toLowerCase().includes(this.searchQuery.toLowerCase().trim()) ||
        s.rollNo.toLowerCase().includes(this.searchQuery.toLowerCase().trim());
      
      const matchesFilter = 
        this.activeFilter === 'all' || 
        s.status === this.activeFilter;

      return matchesSearch && matchesFilter;
    });
  }

  setFilter(filter: 'all' | 'Present' | 'Absent' | 'Late') {
    this.activeFilter = filter;
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  submitAttendance() {
    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      toast.success('Attendance Submitted Successfully', {
        description: `${this.presentCount} Present, ${this.absentCount} Absent, ${this.lateCount} Late.`
      });
    }, 350);
  }

  setQuickDate(type: 'today' | 'yesterday') {
    const d = new Date();
    if (type === 'yesterday') {
      d.setDate(d.getDate() - 1);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    this.selectedDate = `${year}-${month}-${day}`;
  }
}
