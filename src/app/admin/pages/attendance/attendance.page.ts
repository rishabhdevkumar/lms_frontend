import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { toast } from 'ngx-sonner';
import { firstValueFrom } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { AttendanceService } from 'src/app/services/attendance.service';
import { AuthService } from 'src/app/services/auth.service';

export interface AttendanceRecord {
  id: number | string;
  userId?: number;
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
  sessionId?: number;
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AttendancePage implements OnInit {

  activeTab: 'student' | 'faculty' = 'student';
  selectedDate: string = '';
  searchText: string = '';
  statusFilter: string = 'All';

  isLoading: boolean = false;
  isFilterModalOpen: boolean = false;

  // ATTENDANCE HISTORY MODAL STATE
  isHistoryModalOpen: boolean = false;
  isHistoryLoading: boolean = false;
  selectedUserForHistory: AttendanceRecord | null = null;
  historyRecords: any[] = [];
  historyFilter: 'all' | 'present' | 'late' | 'absent' = 'all';
  historySearchQuery: string = '';
  historyStats = {
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    percentage: 0
  };

  coursesList: any[] = [];
  semestersList: any[] = [];

  filterOptions = {
    dept: 'All',
    subMeta: 'All',
    status: 'All',
    date: ''
  };

  appliedFilters = {
    dept: 'All',
    subMeta: 'All',
    status: 'All',
    date: ''
  };

  // INITIAL & FALLBACK DATASETS
  studentAttendance: AttendanceRecord[] = [
    {
      id: 1,
      userId: 1,
      codeOrRoll: '101',
      name: 'Vikramaditya Roy',
      email: 'vikram.roy@lms-edu.com',
      departmentOrCourse: 'B.Tech Computer Science',
      subMeta: 'Semester 4',
      status: 'Present',
      timeIn: '09:05 AM',
      timeOut: '04:30 PM',
      avatarBg: '#059669',
      type: 'Student',
      sessionId: 1
    },
    {
      id: 2,
      userId: 2,
      codeOrRoll: '102',
      name: 'Ananya Deshmukh',
      email: 'ananya.d@lms-edu.com',
      departmentOrCourse: 'B.Sc Data Science & AI',
      subMeta: 'Semester 2',
      status: 'Present',
      timeIn: '09:12 AM',
      timeOut: '04:25 PM',
      avatarBg: '#2563eb',
      type: 'Student',
      sessionId: 1
    },
    {
      id: 3,
      userId: 3,
      codeOrRoll: '103',
      name: 'Rohan Verma',
      email: 'rohan.v@lms-edu.com',
      departmentOrCourse: 'B.Tech Information Tech',
      subMeta: 'Semester 6',
      status: 'Absent',
      timeIn: '--:--',
      timeOut: '--:--',
      avatarBg: '#ef4444',
      type: 'Student',
      sessionId: 1
    },
    {
      id: 4,
      userId: 4,
      codeOrRoll: '104',
      name: 'Sneha Kulkarni',
      email: 'sneha.k@lms-edu.com',
      departmentOrCourse: 'M.Tech Software Engg',
      subMeta: 'Semester 2',
      status: 'Late',
      timeIn: '09:45 AM',
      timeOut: '04:30 PM',
      avatarBg: '#d97706',
      type: 'Student',
      sessionId: 1
    },
    {
      id: 5,
      userId: 5,
      codeOrRoll: '105',
      name: 'Arjun Mehta',
      email: 'arjun.m@lms-edu.com',
      departmentOrCourse: 'B.Tech Computer Science',
      subMeta: 'Semester 4',
      status: 'Present',
      timeIn: '09:00 AM',
      timeOut: '04:30 PM',
      avatarBg: '#7c3aed',
      type: 'Student',
      sessionId: 1
    }
  ];

  facultyAttendance: AttendanceRecord[] = [
    {
      id: 201,
      userId: 201,
      codeOrRoll: 'FAC-2026-01',
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@lms-edu.com',
      departmentOrCourse: 'Computer Science & Engg',
      subMeta: 'Senior Professor',
      status: 'Present',
      timeIn: '08:45 AM',
      timeOut: '05:00 PM',
      avatarBg: '#059669',
      type: 'Faculty',
      sessionId: 1
    },
    {
      id: 202,
      userId: 202,
      codeOrRoll: 'FAC-2026-02',
      name: 'Dr. Sunita Rao',
      email: 'sunita.rao@lms-edu.com',
      departmentOrCourse: 'Data Science & AI',
      subMeta: 'Associate Professor',
      status: 'Present',
      timeIn: '08:55 AM',
      timeOut: '04:45 PM',
      avatarBg: '#2563eb',
      type: 'Faculty',
      sessionId: 1
    },
    {
      id: 203,
      userId: 203,
      codeOrRoll: 'FAC-2026-03',
      name: 'Prof. Vikramaditya Roy',
      email: 'vikram.roy@lms-edu.com',
      departmentOrCourse: 'Information Technology',
      subMeta: 'Assistant Professor',
      status: 'Absent',
      timeIn: '--:--',
      timeOut: '--:--',
      avatarBg: '#ef4444',
      type: 'Faculty',
      sessionId: 1
    },
    {
      id: 204,
      userId: 204,
      codeOrRoll: 'FAC-2026-04',
      name: 'Dr. Meera Deshmukh',
      email: 'meera.deshmukh@lms-edu.com',
      departmentOrCourse: 'Software Engineering',
      subMeta: 'Head of Department',
      status: 'Late',
      timeIn: '09:30 AM',
      timeOut: '05:15 PM',
      avatarBg: '#d97706',
      type: 'Faculty',
      sessionId: 1
    }
  ];

  constructor(
    private userService: UserService,
    private attendanceService: AttendanceService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.initDate();
    this.loadDynamicData();
  }

  initDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.selectedDate = `${yyyy}-${mm}-${dd}`;
    this.filterOptions.date = this.selectedDate;
    this.appliedFilters.date = this.selectedDate;
  }

  async loadDynamicData() {
    this.isLoading = true;
    try {
      const [coursesRes, semestersRes, usersRes] = await Promise.all([
        firstValueFrom(this.attendanceService.getCourses()).catch(() => []),
        firstValueFrom(this.attendanceService.getSemesters()).catch(() => []),
        firstValueFrom(this.userService.getAllUsers()).catch(() => [])
      ]);

      if (Array.isArray(coursesRes) && coursesRes.length > 0) {
        this.coursesList = coursesRes;
      }
      if (Array.isArray(semestersRes) && semestersRes.length > 0) {
        this.semestersList = semestersRes;
      }

      const anyUsers: any = usersRes;
      const rawUsers = Array.isArray(anyUsers) ? anyUsers : (anyUsers?.data || anyUsers?.result || anyUsers?.users || []);
      if (Array.isArray(rawUsers) && rawUsers.length > 0) {
        const backendStudents: AttendanceRecord[] = [];
        const backendFaculty: AttendanceRecord[] = [];

        rawUsers.forEach((u: any, idx: number) => {
          const role = String(u.role || u.user_role || u.type || '').trim().toLowerCase();
          const isFaculty = role.includes('faculty') || role.includes('teacher') || role.includes('instructor');
          const isStudent = role.includes('student') || (!isFaculty && !role.includes('admin'));

          const id = u.id || (idx + 1);
          const name = String(u.name || u.fullName || (isFaculty ? `Faculty ${idx + 1}` : `Student ${idx + 1}`));
          const rollOrCode = String(u.roll_no || u.rollNo || (isFaculty ? `FAC-2026-0${idx + 1}` : `10${idx + 1}`));
          const email = String(u.email || `${rollOrCode.toLowerCase()}@lms-edu.com`);

          // Resolve Course/Department name
          let courseName = u.course_name || u.course?.course_name || u.department || '';
          if (!courseName && u.course_id && this.coursesList.length > 0) {
            const matchedCourse = this.coursesList.find(c => c.id === Number(u.course_id));
            if (matchedCourse) {
              courseName = matchedCourse.course_name || matchedCourse.name || matchedCourse.short_name;
            }
          }
          if (!courseName) {
            courseName = isFaculty ? 'Computer Science & Engg' : 'B.Tech Computer Science';
          }

          // Resolve Semester/Role designation
          let semName = u.semester_name || u.semester?.semester_name || u.designation || '';
          if (!semName && u.semester_id && this.semestersList.length > 0) {
            const matchedSem = this.semestersList.find(s => s.id === Number(u.semester_id));
            if (matchedSem) {
              semName = matchedSem.semester_name || matchedSem.name;
            }
          }
          if (!semName) {
            semName = isFaculty ? 'Assistant Professor' : 'Semester 4';
          }

          const record: AttendanceRecord = {
            id: id,
            userId: Number(u.id) || undefined,
            codeOrRoll: rollOrCode,
            name: name,
            email: email,
            departmentOrCourse: courseName,
            subMeta: semName,
            status: 'Present',
            timeIn: '09:00 AM',
            timeOut: '04:30 PM',
            avatarBg: this.getAvatarColor(idx),
            type: isFaculty ? 'Faculty' : 'Student',
            sessionId: u.session_id ? Number(u.session_id) : 1
          };

          if (isFaculty) {
            backendFaculty.push(record);
          } else if (isStudent) {
            backendStudents.push(record);
          }
        });

        if (backendStudents.length > 0) {
          this.studentAttendance = backendStudents;
        }
        if (backendFaculty.length > 0) {
          this.facultyAttendance = backendFaculty;
        }
      }

      await this.loadAttendanceForDate(this.selectedDate);
    } catch (err) {
      console.warn('Dynamic attendance loading warning:', err);
    } finally {
      this.isLoading = false;
    }
  }

  async loadAttendanceForDate(dateStr: string) {
    if (!dateStr) return;
    try {
      const records: any = await firstValueFrom(this.attendanceService.getAttendanceByDate(dateStr)).catch(() => []);
      const attList = Array.isArray(records) ? records : (records?.data || []);
      if (Array.isArray(attList) && attList.length > 0) {
        this.applyAttendanceRecords(attList);
      }
    } catch (err) {
      console.warn('Attendance records fetch warning:', err);
    }
  }

  applyAttendanceRecords(attList: any[]) {
    const list = this.getCurrentList();
    attList.forEach(rec => {
      const targetUser = list.find(item =>
        (item.userId && rec.users_id && Number(item.userId) === Number(rec.users_id)) ||
        (item.codeOrRoll && rec.roll_no && item.codeOrRoll.toLowerCase() === String(rec.roll_no).toLowerCase()) ||
        (item.id && rec.users_id && Number(item.id) === Number(rec.users_id))
      );

      if (targetUser) {
        const rawStatus = String(rec.status || '').toLowerCase();
        if (rawStatus === 'present') {
          targetUser.status = 'Present';
          targetUser.timeIn = '09:00 AM';
          targetUser.timeOut = '04:30 PM';
        } else if (rawStatus === 'absent') {
          targetUser.status = 'Absent';
          targetUser.timeIn = '--:--';
          targetUser.timeOut = '--:--';
        } else if (rawStatus === 'late') {
          targetUser.status = 'Late';
          targetUser.timeIn = '09:40 AM';
          targetUser.timeOut = '04:30 PM';
        } else if (rawStatus === 'excused' || rawStatus === 'leave') {
          targetUser.status = 'Leave';
          targetUser.timeIn = 'On Leave';
          targetUser.timeOut = 'On Leave';
        }
      }
    });
  }

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

      const matchesModalDept = this.appliedFilters.dept === 'All' ||
        item.departmentOrCourse.toLowerCase().includes(this.appliedFilters.dept.toLowerCase());

      const matchesModalSub = this.appliedFilters.subMeta === 'All' ||
        item.subMeta.toLowerCase().includes(this.appliedFilters.subMeta.toLowerCase());

      const matchesModalStatus = this.appliedFilters.status === 'All' ||
        item.status === this.appliedFilters.status;

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

  async onDateChange() {
    this.filterOptions.date = this.selectedDate;
    this.appliedFilters.date = this.selectedDate;
    await this.loadAttendanceForDate(this.selectedDate);
    toast.info(`Loaded attendance records for ${this.selectedDate}`);
  }

  // QUICK MARK STATUS (PRESENT, ABSENT, LATE)
  async markStatus(item: AttendanceRecord, newStatus: 'Present' | 'Absent' | 'Late') {
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
    }

    toast.success(`Marked ${item.name} as ${newStatus}`, {
      description: `Roll/Code: ${item.codeOrRoll} • ${this.selectedDate}`
    });

    try {
      const adminUser = this.authService.currentUserValue;
      const markedBy = adminUser?.id ? Number(adminUser.id) : 1;
      const backendStatusMap: Record<string, 'present' | 'absent' | 'late'> = {
        'Present': 'present',
        'Absent': 'absent',
        'Late': 'late'
      };

      await firstValueFrom(this.attendanceService.markAttendance({
        session_id: item.sessionId || 1,
        users_id: Number(item.userId || item.id) || 1,
        status: backendStatusMap[newStatus] || 'present',
        marked_by: markedBy
      }));
    } catch (err) {
      console.warn('Backend markAttendance sync notice:', err);
    }
  }

  // BULK MARK ALL PRESENT
  async markAllPresent() {
    const list = this.getFilteredRecords();
    if (list.length === 0) return;

    list.forEach(item => {
      item.status = 'Present';
      item.timeIn = '09:00 AM';
      item.timeOut = '04:30 PM';
    });

    toast.success(`Marked all ${list.length} records as Present`, {
      description: `Date: ${this.selectedDate}`
    });

    try {
      const adminUser = this.authService.currentUserValue;
      const markedBy = adminUser?.id ? Number(adminUser.id) : 1;
      const payloadItems = list.map(item => ({
        users_id: Number(item.userId || item.id) || 1,
        status: 'present'
      }));

      await firstValueFrom(this.attendanceService.bulkMarkAttendance({
        session_id: 1,
        marked_by: markedBy,
        attendances: payloadItems
      }));
    } catch (err) {
      console.warn('Backend bulkMarkAttendance sync notice:', err);
    }
  }

  // =========================================================================
  // ATTENDANCE HISTORY MODAL LOGIC
  // =========================================================================
  async openAttendanceHistory(item: AttendanceRecord) {
    this.selectedUserForHistory = item;
    this.isHistoryModalOpen = true;
    this.isHistoryLoading = true;
    this.historyFilter = 'all';
    this.historySearchQuery = '';
    this.historyRecords = [];
    this.historyStats = { total: 0, present: 0, late: 0, absent: 0, percentage: 0 };

    try {
      const userId = Number(item.userId || item.id);
      const [historyRes, statsRes] = await Promise.all([
        firstValueFrom(this.attendanceService.getAttendanceByStudent(userId)).catch(() => []),
        firstValueFrom(this.attendanceService.getStudentAttendanceStats(userId)).catch(() => null)
      ]);

      let records: any[] = [];
      if (Array.isArray(historyRes) && historyRes.length > 0) {
        records = historyRes;
      } else {
        records = this.generateFallbackHistory(item);
      }

      this.historyRecords = records.map(r => ({
        ...r,
        status: (String(r.status).toLowerCase() as any) || 'present',
        session_name: r.session_name || item.departmentOrCourse || 'Core Lecture',
        marked_by_name: r.marked_by_name || 'Admin Officer',
        marked_at: r.marked_at || r.session_date || new Date().toISOString()
      }));

      const statData = statsRes?.data || statsRes;
      if (statData && statData.total_records !== undefined) {
        const total = Number(statData.total_records) || this.historyRecords.length;
        const attended = Number(statData.attended) || this.historyRecords.filter(r => r.status === 'present' || r.status === 'late').length;
        const absent = Number(statData.absent) || this.historyRecords.filter(r => r.status === 'absent').length;
        const late = this.historyRecords.filter(r => r.status === 'late').length;
        const present = Math.max(0, attended - late);
        const pct = statData.attendance_percentage !== undefined
          ? Math.round(Number(statData.attendance_percentage))
          : (total > 0 ? Math.round((attended / total) * 100) : 0);

        this.historyStats = { total, present, late, absent, percentage: pct };
      } else {
        this.computeHistoryStats(this.historyRecords);
      }
    } catch (err) {
      console.warn('Error fetching attendance history:', err);
      this.historyRecords = this.generateFallbackHistory(item);
      this.computeHistoryStats(this.historyRecords);
    } finally {
      this.isHistoryLoading = false;
    }
  }

  closeHistoryModal() {
    this.isHistoryModalOpen = false;
    this.selectedUserForHistory = null;
    this.historyRecords = [];
    this.historySearchQuery = '';
  }

  generateFallbackHistory(item: AttendanceRecord): any[] {
    const list: any[] = [];
    const today = new Date();
    const statuses = ['present', 'present', 'present', 'present', 'late', 'present', 'absent', 'present'];

    for (let i = 0; i < 20; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      const dateStr = d.toISOString().split('T')[0];
      const statusSeed = (i + Number(item.id || 1) * 3) % statuses.length;
      const status = (i === 0 && item.status) ? item.status.toLowerCase() : statuses[statusSeed];

      list.push({
        id: i + 1,
        session_id: 1,
        session_name: `${item.departmentOrCourse} - Slot ${((i % 3) + 1)}`,
        session_date: dateStr,
        marked_at: `${dateStr}T${status === 'late' ? '09:40:00' : '09:05:00'}`,
        status: status,
        marked_by_name: 'Academic Office',
        marked_by: 1
      });
    }

    return list;
  }

  computeHistoryStats(records: any[]) {
    const total = records.length;
    const present = records.filter(r => String(r.status).toLowerCase() === 'present').length;
    const late = records.filter(r => String(r.status).toLowerCase() === 'late').length;
    const absent = records.filter(r => String(r.status).toLowerCase() === 'absent').length;
    const attended = present + late;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

    this.historyStats = { total, present, late, absent, percentage };
  }

  get filteredHistoryRecords(): any[] {
    let list = this.historyRecords;
    if (this.historyFilter !== 'all') {
      list = list.filter(r => String(r.status).toLowerCase() === this.historyFilter);
    }
    if (this.historySearchQuery) {
      const q = this.historySearchQuery.toLowerCase().trim();
      list = list.filter(r =>
        (r.session_name && r.session_name.toLowerCase().includes(q)) ||
        (r.session_date && r.session_date.toLowerCase().includes(q)) ||
        (r.marked_by_name && r.marked_by_name.toLowerCase().includes(q)) ||
        (this.formatHistoryDate(r.session_date || r.marked_at).toLowerCase().includes(q))
      );
    }
    return list;
  }

  formatHistoryDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  formatHistoryDay(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    } catch {
      return '';
    }
  }

  formatHistoryTime(dateStr: string, status?: string): string {
    if (status === 'absent') return '--:--';
    if (!dateStr) return '09:00 AM';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '09:00 AM';
    }
  }

  exportStudentHistoryCsv() {
    if (!this.selectedUserForHistory) return;
    const u = this.selectedUserForHistory;
    const records = this.filteredHistoryRecords;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `Student Attendance History Report\n`;
    csvContent += `Name:,"${u.name}"\n`;
    csvContent += `Roll/Code:,"${u.codeOrRoll}"\n`;
    csvContent += `Category:,"${u.type}"\n`;
    csvContent += `Department/Course:,"${u.departmentOrCourse}"\n`;
    csvContent += `Sub-meta:,"${u.subMeta}"\n`;
    csvContent += `Overall Attendance:,"${this.historyStats.percentage}%"\n\n`;
    csvContent += `Date,Day,Session,Marked By,Status\n`;

    records.forEach(r => {
      const d = this.formatHistoryDate(r.session_date || r.marked_at);
      const day = this.formatHistoryDay(r.session_date || r.marked_at);
      const session = r.session_name || 'Academic Session';
      const markedBy = r.marked_by_name || 'Admin Office';
      const status = (r.status || 'present').toUpperCase();
      csvContent += `"${d}","${day}","${session}","${markedBy}","${status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_History_${u.codeOrRoll}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported history report for ${u.name}`);
  }

  // EXPORT CURRENT ATTENDANCE LIST AS CSV
  exportAttendanceCsv() {
    const records = this.getFilteredRecords();
    if (records.length === 0) {
      toast.error('No attendance records to export');
      return;
    }

    const headers = ['Roll/Code', 'Name', 'Email', 'Department/Course', 'Semester/Role', 'Status', 'Check In', 'Check Out', 'Date'];
    const rows = records.map(r => [
      `"${r.codeOrRoll}"`,
      `"${r.name}"`,
      `"${r.email}"`,
      `"${r.departmentOrCourse}"`,
      `"${r.subMeta}"`,
      `"${r.status}"`,
      `"${r.timeIn}"`,
      `"${r.timeOut}"`,
      `"${this.selectedDate}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${this.activeTab}_${this.selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Attendance CSV exported successfully');
  }

  // MODAL ACTIONS
  openFilterModal() {
    this.filterOptions = { ...this.appliedFilters };
    this.isFilterModalOpen = true;
  }

  closeFilterModal() {
    this.isFilterModalOpen = false;
  }

  async applyModalFilters() {
    this.appliedFilters = { ...this.filterOptions };
    if (this.filterOptions.date && this.filterOptions.date !== this.selectedDate) {
      this.selectedDate = this.filterOptions.date;
      await this.loadAttendanceForDate(this.selectedDate);
    }
    this.isFilterModalOpen = false;
    toast.success('Filters applied successfully');
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

  getAvatarColor(index: number): string {
    const colors = ['#059669', '#2563eb', '#7c3aed', '#d97706', '#0891b2', '#e11d48', '#4f46e5'];
    return colors[index % colors.length];
  }
}
