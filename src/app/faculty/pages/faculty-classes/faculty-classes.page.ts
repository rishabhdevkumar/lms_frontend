import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { toast } from 'ngx-sonner';
@Component({
  selector: 'app-faculty-classes',
  templateUrl: './faculty-classes.page.html',
  styleUrls: ['./faculty-classes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class FacultyClassesPage implements OnInit {
  selectedSegment: string = 'schedule';
  searchQuery: string = '';

  assignedCourses = [
    {
      code: 'CS-402',
      name: 'Advanced Web Engineering',
      department: 'Computer Science & Engineering',
      credits: 4,
      students: 48,
      days: 'Mon, Wed, Fri (09:00 AM)',
      room: 'Lab 304',
      syllabusProgress: 65,
      status: 'Active'
    },
    {
      code: 'CS-501',
      name: 'Cloud Native Microservices',
      department: 'Computer Science & Engineering',
      credits: 4,
      students: 64,
      days: 'Tue, Thu (11:15 AM)',
      room: 'Auditorium B',
      syllabusProgress: 45,
      status: 'Active'
    },
    {
      code: 'DS-302',
      name: 'Data Analytics & Visualization',
      department: 'Data Science & AI',
      credits: 3,
      students: 38,
      days: 'Mon, Thu (02:00 PM)',
      room: 'Lab 102',
      syllabusProgress: 80,
      status: 'Active'
    },
    {
      code: 'SE-601',
      name: 'Software Architecture & Patterns',
      department: 'Software Engineering',
      credits: 4,
      students: 90,
      days: 'Wed, Fri (03:30 PM)',
      room: 'Hall A',
      syllabusProgress: 30,
      status: 'Active'
    }
  ];

  courseSearchQuery: string = '';
  selectedDayFilter: string = 'all';

  filterDays = [
    { label: 'All Days', value: 'all' },
    { label: 'Monday', value: 'monday' },
    { label: 'Tuesday', value: 'tuesday' },
    { label: 'Wednesday', value: 'wednesday' },
    { label: 'Thursday', value: 'thursday' },
    { label: 'Friday', value: 'friday' }
  ];

  weeklyTimetable = [
    { day: 'Monday', time: '09:00 AM - 10:30 AM', course: 'CS-402', title: 'Advanced Web Engineering', room: 'Lab 304' },
    { day: 'Monday', time: '02:00 PM - 03:30 PM', course: 'DS-302', title: 'Data Analytics & Visualization', room: 'Lab 102' },
    { day: 'Tuesday', time: '11:15 AM - 12:45 PM', course: 'CS-501', title: 'Cloud Native Microservices', room: 'Auditorium B' },
    { day: 'Wednesday', time: '09:00 AM - 10:30 AM', course: 'CS-402', title: 'Advanced Web Engineering', room: 'Lab 304' },
    { day: 'Wednesday', time: '03:30 PM - 05:00 PM', course: 'SE-601', title: 'Software Architecture & Patterns', room: 'Hall A' },
    { day: 'Thursday', time: '11:15 AM - 12:45 PM', course: 'CS-501', title: 'Cloud Native Microservices', room: 'Auditorium B' },
    { day: 'Thursday', time: '02:00 PM - 03:30 PM', course: 'DS-302', title: 'Data Analytics & Visualization', room: 'Lab 102' },
    { day: 'Friday', time: '09:00 AM - 10:30 AM', course: 'CS-402', title: 'Advanced Web Engineering', room: 'Lab 304' },
    { day: 'Friday', time: '03:30 PM - 05:00 PM', course: 'SE-601', title: 'Software Architecture & Patterns', room: 'Hall A' }
  ];

  isAddNoteModalOpen = false;
  selectedCourseForNote: any = null;
  classNoteText = '';

  constructor() {}

  ngOnInit() {}

  get filteredTimetable() {
    if (this.selectedDayFilter === 'all') {
      return this.weeklyTimetable;
    }
    return this.weeklyTimetable.filter(
      (item) => item.day.toLowerCase() === this.selectedDayFilter.toLowerCase()
    );
  }

  getCountForDay(dayValue: string): number {
    if (dayValue === 'all') {
      return this.weeklyTimetable.length;
    }
    return this.weeklyTimetable.filter(
      (item) => item.day.toLowerCase() === dayValue.toLowerCase()
    ).length;
  }

  getDayClass(day: string): string {
    return 'day-' + day.toLowerCase();
  }

  startVirtualClass(item: any) {
    toast.info(`Starting Virtual Class: ${item.course}`, {
      description: `${item.title} • Venue: ${item.room} • ${item.time}`
    });
  }

  get filteredAssignedCourses() {
    if (!this.courseSearchQuery || !this.courseSearchQuery.trim()) {
      return this.assignedCourses;
    }
    const q = this.courseSearchQuery.toLowerCase().trim();
    return this.assignedCourses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q)
    );
  }

  getCourseThemeClass(code: string): string {
    const map: { [key: string]: string } = {
      'CS-402': 'theme-royal-blue',
      'CS-501': 'theme-cyan-blue',
      'DS-302': 'theme-emerald-green',
      'SE-601': 'theme-violet-purple'
    };
    return map[code] || 'theme-royal-blue';
  }

  getProgressBadgeClass(progress: number): string {
    if (progress >= 75) return 'progress-high';
    if (progress >= 45) return 'progress-mid';
    return 'progress-low';
  }

  openAddNoteModal(course: any) {
    this.selectedCourseForNote = course;
    this.classNoteText = '';
    this.isAddNoteModalOpen = true;
  }

  closeAddNoteModal() {
    this.isAddNoteModalOpen = false;
    this.selectedCourseForNote = null;
  }

  submitClassNote() {
    if (!this.classNoteText) return;
    toast.success(`Announcement Broadcasted`, {
      description: `Announcement posted for ${this.selectedCourseForNote.code} to enrolled students.`
    });
    this.closeAddNoteModal();
  }
}
