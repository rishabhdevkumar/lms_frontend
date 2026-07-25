import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, HeaderComponent]
})
export class DashboardPage implements OnInit {

  isStudentModalOpen = false;
  selectedStudent: any = null;

  isAddStudentModalOpen = false;
  isAddFacultyModalOpen = false;
  isAddCourseModalOpen = false;

  newStudent = {
    name: '',
    email: '',
    phone: '',
    course: 'B.Tech Computer Science',
    department: 'Computer Science & Engineering',
    semester: 'Semester 1'
  };

  newFaculty = {
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor'
  };

  newCourse = {
    title: '',
    code: '',
    department: 'Computer Science & Engineering',
    credits: 4,
    instructor: 'Dr. Sarah Jenkins'
  };

  studentsList = [
    {
      id: 'CS-2026-041',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@lms-edu.com',
      phone: '+91 98765 43210',
      course: 'B.Tech Computer Science',
      department: 'Computer Science & Engineering',
      semester: 'Semester 4',
      status: 'Active',
      enrollDate: '12 Jan 2026',
      attendance: '94%',
      gpa: '8.9 / 10',
      avatar: 'AS',
      avatarBg: 'av-1',
      feeStatus: 'Paid ($1,200)'
    },
    {
      id: 'DS-2026-089',
      name: 'Priya Patel',
      email: 'priya.patel@lms-edu.com',
      phone: '+91 98123 45678',
      course: 'B.Sc Data Science & AI',
      department: 'Data Science & Artificial Intelligence',
      semester: 'Semester 2',
      status: 'Active',
      enrollDate: '18 Feb 2026',
      attendance: '98%',
      gpa: '9.4 / 10',
      avatar: 'PP',
      avatarBg: 'av-2',
      feeStatus: 'Paid ($1,200)'
    },
    {
      id: 'IT-2026-112',
      name: 'Rohan Verma',
      email: 'rohan.verma@lms-edu.com',
      phone: '+91 97654 32109',
      course: 'B.Tech Information Tech',
      department: 'Information Technology',
      semester: 'Semester 6',
      status: 'Pending Fee',
      enrollDate: '02 Mar 2026',
      attendance: '87%',
      gpa: '8.1 / 10',
      avatar: 'RV',
      avatarBg: 'av-3',
      feeStatus: 'Pending ($450 Due)'
    },
    {
      id: 'SE-2026-015',
      name: 'Ananya Gupta',
      email: 'ananya.gupta@lms-edu.com',
      phone: '+91 99887 76655',
      course: 'M.Tech Software Engg',
      department: 'Software Engineering',
      semester: 'Semester 1',
      status: 'Active',
      enrollDate: '10 Mar 2026',
      attendance: '96%',
      gpa: '9.1 / 10',
      avatar: 'AG',
      avatarBg: 'av-4',
      feeStatus: 'Paid ($1,400)'
    }
  ];

  constructor() { }

  ngOnInit() { }

  // STUDENT VIEW MODAL
  openStudentModal(student: any) {
    this.selectedStudent = student;
    this.isStudentModalOpen = true;
  }

  closeStudentModal() {
    this.isStudentModalOpen = false;
    this.selectedStudent = null;
  }

  // ADD STUDENT MODAL
  openAddStudentModal() {
    this.isAddStudentModalOpen = true;
  }

  closeAddStudentModal() {
    this.isAddStudentModalOpen = false;
  }

  submitAddStudent() {
    if (!this.newStudent.name || !this.newStudent.email) return;
    const newId = `STU-2026-${Math.floor(100 + Math.random() * 900)}`;
    const initials = this.newStudent.name.split(' ').map(n => n[0]).join('').toUpperCase();
    this.studentsList.unshift({
      id: newId,
      name: this.newStudent.name,
      email: this.newStudent.email,
      phone: this.newStudent.phone || '+91 98000 11223',
      course: this.newStudent.course,
      department: this.newStudent.department,
      semester: this.newStudent.semester,
      status: 'Active',
      enrollDate: 'Just Now',
      attendance: '100%',
      gpa: 'N/A',
      avatar: initials || 'ST',
      avatarBg: 'av-1',
      feeStatus: 'Paid ($1,200)'
    });
    this.newStudent = { name: '', email: '', phone: '', course: 'B.Tech Computer Science', department: 'Computer Science & Engineering', semester: 'Semester 1' };
    this.closeAddStudentModal();
  }

  // ADD FACULTY MODAL
  openAddFacultyModal() {
    this.isAddFacultyModalOpen = true;
  }

  closeAddFacultyModal() {
    this.isAddFacultyModalOpen = false;
  }

  submitAddFaculty() {
    alert(`Faculty Member "${this.newFaculty.name}" has been registered successfully!`);
    this.newFaculty = { name: '', email: '', phone: '', department: 'Computer Science & Engineering', designation: 'Assistant Professor' };
    this.closeAddFacultyModal();
  }

  // ADD COURSE MODAL
  openAddCourseModal() {
    this.isAddCourseModalOpen = true;
  }

  closeAddCourseModal() {
    this.isAddCourseModalOpen = false;
  }

  submitAddCourse() {
    alert(`New Course "${this.newCourse.title}" (${this.newCourse.code}) created successfully!`);
    this.newCourse = { title: '', code: '', department: 'Computer Science & Engineering', credits: 4, instructor: 'Dr. Sarah Jenkins' };
    this.closeAddCourseModal();
  }

}
