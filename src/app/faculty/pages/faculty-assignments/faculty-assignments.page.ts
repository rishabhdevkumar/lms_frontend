import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { toast } from 'ngx-sonner';

export interface Submission {
  id: string;
  studentName: string;
  rollNo: string;
  courseCode: string;
  assignmentTitle: string;
  submittedDate: string;
  fileAttached: string;
  status: 'Pending' | 'Graded';
  maxScore: number;
  score: number | null;
  feedback: string;
}

@Component({
  selector: 'app-faculty-assignments',
  templateUrl: './faculty-assignments.page.html',
  styleUrls: ['./faculty-assignments.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class FacultyAssignmentsPage implements OnInit {
  selectedCourseFilter: string = 'all';
  selectedStatusFilter: string = 'all';
  searchQuery: string = '';

  courses = [
    { code: 'CS-402', name: 'CS-402: Web Engineering' },
    { code: 'CS-501', name: 'CS-501: Microservices' },
    { code: 'DS-302', name: 'DS-302: Data Analytics' },
    { code: 'SE-601', name: 'SE-601: Software Architecture' }
  ];

  submissionsList: Submission[] = [
    {
      id: 'SUB-101',
      studentName: 'Rahul Mehta',
      rollNo: 'CS-2026-041',
      courseCode: 'CS-402',
      assignmentTitle: 'Lab 4: Angular Directives & Custom Pipes',
      submittedDate: 'Today, 08:30 AM',
      fileAttached: 'lab4_directives_rahul.zip',
      status: 'Pending',
      maxScore: 100,
      score: null,
      feedback: ''
    },
    {
      id: 'SUB-102',
      studentName: 'Sneha Reddy',
      rollNo: 'CS-2026-089',
      courseCode: 'CS-501',
      assignmentTitle: 'Project Milestone 2: Microservices API Setup',
      submittedDate: 'Yesterday, 06:15 PM',
      fileAttached: 'microservices_architecture_sneha.pdf',
      status: 'Pending',
      maxScore: 50,
      score: null,
      feedback: ''
    },
    {
      id: 'SUB-103',
      studentName: 'Vikram Singh',
      rollNo: 'DS-2026-112',
      courseCode: 'DS-302',
      assignmentTitle: 'Assignment 3: Data Cleaning & Pandas Script',
      submittedDate: '24 Jul, 04:00 PM',
      fileAttached: 'pandas_data_cleaning_vikram.ipynb',
      status: 'Pending',
      maxScore: 100,
      score: null,
      feedback: ''
    },
    {
      id: 'SUB-104',
      studentName: 'Ananya Gupta',
      rollNo: 'SE-2026-015',
      courseCode: 'CS-402',
      assignmentTitle: 'Lab 3: RxJS Observables State Pattern',
      submittedDate: '20 Jul, 02:10 PM',
      fileAttached: 'rxjs_pattern_ananya.zip',
      status: 'Graded',
      maxScore: 100,
      score: 95,
      feedback: 'Excellent clean implementation and modular RxJS pipe operators!'
    }
  ];

  // Grade Modal State
  isGradeModalOpen = false;
  selectedSubmission: Submission | null = null;
  gradeInputScore: number | null = null;
  gradeFeedback: string = '';

  // Create Assignment Modal State
  isCreateAssignmentModalOpen = false;
  newAssignment = {
    course: 'CS-402',
    title: '',
    description: '',
    dueDate: '',
    maxMarks: 100
  };

  constructor() {}

  ngOnInit() {}

  get totalSubmissionsCount(): number {
    return this.submissionsList.length;
  }

  get pendingSubmissionsCount(): number {
    return this.submissionsList.filter(s => s.status === 'Pending').length;
  }

  get gradedSubmissionsCount(): number {
    return this.submissionsList.filter(s => s.status === 'Graded').length;
  }

  get filteredSubmissions(): Submission[] {
    return this.submissionsList.filter(s => {
      const matchCourse = this.selectedCourseFilter === 'all' || s.courseCode === this.selectedCourseFilter;
      const matchStatus = 
        this.selectedStatusFilter === 'all' || 
        s.status.toLowerCase() === this.selectedStatusFilter.toLowerCase();
      
      const q = this.searchQuery.toLowerCase().trim();
      const matchSearch = 
        !q ||
        s.studentName.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.assignmentTitle.toLowerCase().includes(q);

      return matchCourse && matchStatus && matchSearch;
    });
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()!.toUpperCase() : 'FILE';
  }

  openGradeModal(sub: Submission) {
    this.selectedSubmission = sub;
    this.gradeInputScore = sub.score;
    this.gradeFeedback = sub.feedback || '';
    this.isGradeModalOpen = true;
  }

  closeGradeModal() {
    this.isGradeModalOpen = false;
    this.selectedSubmission = null;
  }

  submitGrade() {
    if (this.gradeInputScore === null || this.gradeInputScore < 0) {
      toast.error('Invalid Score', {
        description: 'Please enter a valid numeric score.'
      });
      return;
    }
    if (this.selectedSubmission) {
      this.selectedSubmission.score = this.gradeInputScore;
      this.selectedSubmission.feedback = this.gradeFeedback;
      this.selectedSubmission.status = 'Graded';
      toast.success('Grade Published', {
        description: `${this.selectedSubmission.studentName}: ${this.gradeInputScore}/${this.selectedSubmission.maxScore}`
      });
    }
    this.closeGradeModal();
  }

  openCreateAssignmentModal() {
    this.isCreateAssignmentModalOpen = true;
  }

  closeCreateAssignmentModal() {
    this.isCreateAssignmentModalOpen = false;
  }

  submitCreateAssignment() {
    if (!this.newAssignment.title || !this.newAssignment.title.trim()) {
      toast.error('Title Required', {
        description: 'Please enter an assignment title.'
      });
      return;
    }
    toast.success('Assignment Created', {
      description: `"${this.newAssignment.title}" created for ${this.newAssignment.course}.`
    });
    this.newAssignment = { course: 'CS-402', title: '', description: '', dueDate: '', maxMarks: 100 };
    this.closeCreateAssignmentModal();
  }

  downloadFile(filename: string) {
    toast.info('Downloading File', {
      description: `Downloading ${filename}...`
    });
  }
}
