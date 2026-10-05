import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FacultyHeaderComponent } from '../../components/faculty-header/faculty-header.component';

@Component({
  selector: 'app-faculty-doubts',
  templateUrl: './faculty-doubts.page.html',
  styleUrls: ['./faculty-doubts.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, FacultyHeaderComponent]
})
export class FacultyDoubtsPage implements OnInit {
  selectedStatus: string = 'unresolved';

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

  constructor() {}

  ngOnInit() {}

  get filteredDoubts() {
    if (this.selectedStatus === 'all') return this.doubtsList;
    return this.doubtsList.filter(d => d.status.toLowerCase() === this.selectedStatus);
  }

  openReplyModal(doubt: any) {
    this.selectedDoubt = doubt;
    this.replyText = doubt.reply || '';
    this.isReplyModalOpen = true;
  }

  closeReplyModal() {
    this.isReplyModalOpen = false;
    this.selectedDoubt = null;
  }

  submitReply() {
    if (!this.replyText) return;
    this.selectedDoubt.reply = this.replyText;
    this.selectedDoubt.status = 'Resolved';
    alert(`Reply published to ${this.selectedDoubt.studentName}!`);
    this.closeReplyModal();
  }
}
