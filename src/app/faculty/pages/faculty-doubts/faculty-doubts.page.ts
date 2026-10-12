import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { toast } from 'ngx-sonner';
@Component({
  selector: 'app-faculty-doubts',
  templateUrl: './faculty-doubts.page.html',
  styleUrls: ['./faculty-doubts.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class FacultyDoubtsPage implements OnInit {
  selectedStatus: string = 'unresolved';
  selectedCourse: string = 'all';
  searchQuery: string = '';

  courses = [
    { code: 'all', name: 'All Courses' },
    { code: 'CS-402', name: 'CS-402: Web Engineering' },
    { code: 'CS-501', name: 'CS-501: Microservices' },
    { code: 'DS-302', name: 'DS-302: Data Analytics' }
  ];

  doubtsList = [
    {
      id: 'D-101',
      studentName: 'Aarav Sharma',
      courseCode: 'CS-402',
      questionTitle: 'Difference between Subject and BehaviorSubject in RxJS?',
      questionBody: 'In Angular state management, when should we prefer BehaviorSubject over standard Subject or ReplaySubject?',
      askedDate: '10 mins ago',
      status: 'Unresolved',
      reply: ''
    },
    {
      id: 'D-102',
      studentName: 'Priya Patel',
      courseCode: 'CS-501',
      questionTitle: 'API Gateway Routing Timeout in Kubernetes Cluster',
      questionBody: 'Getting 504 Gateway Timeout error when calling microservice endpoints via Ingress controller.',
      askedDate: '2 hours ago',
      status: 'Unresolved',
      reply: ''
    },
    {
      id: 'D-103',
      studentName: 'Rohan Verma',
      courseCode: 'DS-302',
      questionTitle: 'How to handle missing values in large pandas dataframe?',
      questionBody: 'Should we use mean imputation or forward fill when analyzing time-series sensor data?',
      askedDate: '1 day ago',
      status: 'Resolved',
      reply: 'For time-series data, forward fill (`ffill()`) or linear interpolation is recommended to maintain time sequence integrity.'
    }
  ];

  isReplyModalOpen = false;
  selectedDoubt: any = null;
  replyText = '';

  constructor() { }

  ngOnInit() { }

  get unresolvedCount(): number {
    return this.doubtsList.filter(d => d.status.toLowerCase() === 'unresolved').length;
  }

  get resolvedCount(): number {
    return this.doubtsList.filter(d => d.status.toLowerCase() === 'resolved').length;
  }

  get totalCount(): number {
    return this.doubtsList.length;
  }

  get filteredDoubts() {
    return this.doubtsList.filter(d => {
      const matchStatus = this.selectedStatus === 'all' || d.status.toLowerCase() === this.selectedStatus;
      const matchCourse = this.selectedCourse === 'all' || d.courseCode === this.selectedCourse;
      const query = this.searchQuery.toLowerCase().trim();
      const matchSearch = !query ||
        d.questionTitle.toLowerCase().includes(query) ||
        d.questionBody.toLowerCase().includes(query) ||
        d.studentName.toLowerCase().includes(query);
      return matchStatus && matchCourse && matchSearch;
    });
  }

  getInitials(name: string): string {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  openReplyModal(doubt: any) {
    this.selectedDoubt = doubt;
    this.replyText = doubt.reply || '';
    this.isReplyModalOpen = true;
  }

  closeReplyModal() {
    this.isReplyModalOpen = false;
    this.selectedDoubt = null;
    this.replyText = '';
  }

  submitReply() {
    if (!this.replyText || !this.replyText.trim()) {
      toast.error('Response Required', {
        description: 'Please write an answer before publishing.'
      });
      return;
    }
    if (this.selectedDoubt) {
      this.selectedDoubt.reply = this.replyText.trim();
      this.selectedDoubt.status = 'Resolved';
      toast.success('Response Published', {
        description: `Your answer was successfully shared with ${this.selectedDoubt.studentName}.`
      });
    }
    this.closeReplyModal();
  }

  resetFilters() {
    this.selectedStatus = 'all';
    this.selectedCourse = 'all';
    this.searchQuery = '';
  }
}
