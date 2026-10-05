import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FacultyHeaderComponent } from '../../components/faculty-header/faculty-header.component';

@Component({
  selector: 'app-faculty-attendance',
  templateUrl: './faculty-attendance.page.html',
  styleUrls: ['./faculty-attendance.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, FacultyHeaderComponent]
})
export class FacultyAttendancePage implements OnInit {
  selectedCourse: string = 'CS-402';
  selectedDate: string = '2026-08-05';
  selectedSession: string = 'Morning (09:00 AM)';

  students = [
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

  setStatus(student: any, status: string) {
    student.status = status;
  }

  markAllPresent() {
    this.students.forEach(s => s.status = 'Present');
  }

  get presentCount() {
    return this.students.filter(s => s.status === 'Present').length;
  }

  get absentCount() {
    return this.students.filter(s => s.status === 'Absent').length;
  }

  get lateCount() {
    return this.students.filter(s => s.status === 'Late').length;
  }

  get percentage() {
    return Math.round((this.presentCount / this.students.length) * 100);
  }

  submitAttendance() {
    alert(`Attendance submitted for ${this.selectedCourse} on ${this.selectedDate}! Present: ${this.presentCount}, Absent: ${this.absentCount}`);
  }
}
