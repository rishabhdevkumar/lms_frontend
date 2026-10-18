import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class ReportsPage implements OnInit {

  selectedMonth = 'Oct';
  
  months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

  reportItems = [
    { title: 'Student report', category: 'Academic & Enrollment', size: '2.4 MB', type: 'PDF / CSV', key: 'student' },
    { title: 'Course report', category: 'Curriculum & Completion', size: '1.8 MB', type: 'PDF / CSV', key: 'course' },
    { title: 'Payment report', category: 'Transactions & Refunds', size: '3.1 MB', type: 'PDF / CSV', key: 'payment' },
    { title: 'Attendance report', category: 'Student & Faculty Logs', size: '4.2 MB', type: 'PDF / CSV', key: 'attendance' }
  ];

  downloadingState: { [key: string]: boolean } = {};

  constructor() { }

  ngOnInit() { }

  downloadReport(key: string, title: string) {
    this.downloadingState[key] = true;
    setTimeout(() => {
      this.downloadingState[key] = false;
      toast.success('Report Downloaded', {
        description: `"${title}" has been downloaded successfully.`
      });
    }, 1200);
  }

}
