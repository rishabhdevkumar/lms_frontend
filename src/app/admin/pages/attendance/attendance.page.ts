import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from "../../components/header/header.component";

export interface AttendanceRecord {
  id: number;
  codeOrRoll: string;
  name: string;
  email: string;
  departmentOrCourse: string;
  subMeta: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  timeIn: string;
  timeOut: string;
  avatarBg: string;
  type: 'Student' | 'Faculty';
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class AttendancePage implements OnInit {

  activeTab: 'student' | 'faculty' = 'student';
  selectedDate: string = '2026-07-25';
  searchText: string = '';
  statusFilter: string = 'All';

  isFilterModalOpen: boolean = false;

  filterOptions = {
    dept: 'All',
    subMeta: 'All',
    status: 'All',
    date: '2026-07-25'
  };

  appliedFilters = {
    dept: 'All',
    subMeta: 'All',
    status: 'All',
    date: '2026-07-25'
  };

  // STUDENT ATTENDANCE DATASET
  studentAttendance: AttendanceRecord[] = [
    {
      id: 1,
      codeOrRoll: '101',
      name: 'Vikramaditya Roy',
      email: 'vikram.roy@lms-edu.com',
      departmentOrCourse: 'B.Tech Computer Science',
      subMeta: 'Semester 4',
      status: 'Present',
      timeIn: '09:05 AM',
      timeOut: '04:30 PM',
      avatarBg: '#059669',
      type: 'Student'
    },
    {
      id: 2,
      codeOrRoll: '102',
      name: 'Ananya Deshmukh',
      email: 'ananya.d@lms-edu.com',
      departmentOrCourse: 'B.Sc Data Science & AI',
      subMeta: 'Semester 2',
      status: 'Present',
      timeIn: '09:12 AM',
      timeOut: '04:25 PM',
      avatarBg: '#2563eb',
      type: 'Student'
    },
    {
      id: 3,
      codeOrRoll: '103',
      name: 'Rohan Verma',
      email: 'rohan.v@lms-edu.com',
      departmentOrCourse: 'B.Tech Information Tech',
      subMeta: 'Semester 6',
      status: 'Absent',
      timeIn: '--:--',
      timeOut: '--:--',
      avatarBg: '#ef4444',
      type: 'Student'
    },
    {
      id: 4,
      codeOrRoll: '104',
      name: 'Sneha Kulkarni',
      email: 'sneha.k@lms-edu.com',
      departmentOrCourse: 'M.Tech Software Engg',
      subMeta: 'Semester 2',
      status: 'Late',
      timeIn: '09:45 AM',
      timeOut: '04:30 PM',
      avatarBg: '#d97706',
      type: 'Student'
    },
    {
      id: 5,
      codeOrRoll: '105',
      name: 'Arjun Mehta',
      email: 'arjun.m@lms-edu.com',
      departmentOrCourse: 'B.Tech Computer Science',
      subMeta: 'Semester 4',
      status: 'Leave',
      timeIn: 'Medical Leave',
      timeOut: 'Medical Leave',
      avatarBg: '#7c3aed',
      type: 'Student'
    }
  ];

  facultyAttendance: AttendanceRecord[] = [
    {
      id: 201,
      codeOrRoll: 'FAC-2026-01',
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@lms-edu.com',
      departmentOrCourse: 'Computer Science & Engg',
      subMeta: 'Senior Professor',
      status: 'Present',
      timeIn: '08:45 AM',
      timeOut: '05:00 PM',
      avatarBg: '#059669',
      type: 'Faculty'
    },
    {
      id: 202,
      codeOrRoll: 'FAC-2026-02',
      name: 'Dr. Sunita Rao',
      email: 'sunita.rao@lms-edu.com',
      departmentOrCourse: 'Data Science & AI',
      subMeta: 'Associate Professor',
      status: 'Present',
      timeIn: '08:55 AM',
      timeOut: '04:45 PM',
      avatarBg: '#2563eb',
      type: 'Faculty'
    },
    {
      id: 203,
      codeOrRoll: 'FAC-2026-03',
      name: 'Prof. Vikramaditya Roy',
      email: 'vikram.roy@lms-edu.com',
      departmentOrCourse: 'Information Technology',
      subMeta: 'Assistant Professor',
      status: 'Absent',
      timeIn: '--:--',
      timeOut: '--:--',
      avatarBg: '#ef4444',
      type: 'Faculty'
    },
    {
      id: 204,
      codeOrRoll: 'FAC-2026-04',
      name: 'Dr. Meera Deshmukh',
      email: 'meera.deshmukh@lms-edu.com',
      departmentOrCourse: 'Software Engineering',
      subMeta: 'Head of Department',
      status: 'Late',
      timeIn: '09:30 AM',
      timeOut: '05:15 PM',
      avatarBg: '#d97706',
      type: 'Faculty'
    }
  ];

  constructor() { }

  ngOnInit() { }

  selectTab(tab: 'student' | 'faculty') {
    this.activeTab = tab;
    this.searchText = '';
    this.statusFilter = 'All';
    this.resetModalFilters();
  }

  getCurrentList(): AttendanceRecord[] {
    return this.activeTab === 'student' ? this.studentAttendance : this.facultyAttendance;
  }

  getFilteredRecords(): AttendanceRecord[] {
    const list = this.getCurrentList();
    return list.filter(item => {
      const matchesSearch = !this.searchText ||
        item.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item.codeOrRoll.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item.departmentOrCourse.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesPillStatus = this.statusFilter === 'All' || item.status === this.statusFilter;

      const matchesModalDept = this.appliedFilters.dept === 'All' || item.departmentOrCourse.includes(this.appliedFilters.dept);
      const matchesModalSub = this.appliedFilters.subMeta === 'All' || item.subMeta === this.appliedFilters.subMeta;
      const matchesModalStatus = this.appliedFilters.status === 'All' || item.status === this.appliedFilters.status;

      return matchesSearch && matchesPillStatus && matchesModalDept && matchesModalSub && matchesModalStatus;
    });
  }

  getPresentCount(): number {
    return this.getCurrentList().filter(i => i.status === 'Present').length;
  }

  getAbsentCount(): number {
    return this.getCurrentList().filter(i => i.status === 'Absent').length;
  }

  getLateCount(): number {
    return this.getCurrentList().filter(i => i.status === 'Late').length;
  }

  getLeaveCount(): number {
    return this.getCurrentList().filter(i => i.status === 'Leave').length;
  }

  // QUICK MARK STATUS
  markStatus(item: AttendanceRecord, newStatus: 'Present' | 'Absent' | 'Late' | 'Leave') {
    item.status = newStatus;
    if (newStatus === 'Present') {
      item.timeIn = '09:00 AM';
      item.timeOut = '04:30 PM';
    } else if (newStatus === 'Late') {
      item.timeIn = '09:40 AM';
      item.timeOut = '04:30 PM';
    } else if (newStatus === 'Absent') {
      item.timeIn = '--:--';
      item.timeOut = '--:--';
    } else if (newStatus === 'Leave') {
      item.timeIn = 'On Leave';
      item.timeOut = 'On Leave';
    }
  }

  // MODAL ACTIONS
  openFilterModal() {
    this.filterOptions = { ...this.appliedFilters };
    this.isFilterModalOpen = true;
  }

  closeFilterModal() {
    this.isFilterModalOpen = false;
  }

  applyModalFilters() {
    this.appliedFilters = { ...this.filterOptions };
    this.selectedDate = this.filterOptions.date;
    this.isFilterModalOpen = false;
  }

  resetModalFilters() {
    this.filterOptions = {
      dept: 'All',
      subMeta: 'All',
      status: 'All',
      date: this.selectedDate
    };
    this.appliedFilters = { ...this.filterOptions };
  }

  getInitials(name: string): string {
    if (!name) return 'AT';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
