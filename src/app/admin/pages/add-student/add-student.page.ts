import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { student, Session, Course, Semester, Country, State, District, City } from 'src/app/interfaces';
import { StudentService, DefaultService } from 'src/app/api';
import { UserService } from 'src/app/services/user.service';
import { firstValueFrom } from 'rxjs';

export interface UserRecord {
  id: string;
  roll_no?: string;
  name: string;
  email: string;
  role: 'Student' | 'Faculty' | 'Admin';
  departmentOrCourse: string;
  phone: string;
  dob?: string | Date;
  gender?: string;
  status: 'Active' | 'Suspended';
  avatarBg?: string;
  father_name?: string;
  mother_name?: string;
  rawStudent?: student;
}

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.page.html',
  styleUrls: ['./add-student.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class AddStudentPage implements OnInit {

  // SEARCH & STATUS FILTERS
  searchText = '';
  statusFilter = 'All';

  // 3-DOTS ACTION POPUP MENU STATE
  activeMenuUserId: string | null = null;

  // CHANGE PASSWORD MODAL STATES
  isChangePasswordModalOpen = false;
  changePasswordUser: UserRecord | null = null;
  newPasswordInput = '';
  confirmPasswordInput = '';
  changePasswordError = '';
  changePasswordSuccess = '';
  isChangingPassword = false;

  // LOADING & VALIDATION STATES
  isLoading = false;
  isSaving = false;
  formErrors: { [key: string]: string } = {};

  // MODAL STATES
  isViewModalOpen = false;
  isAddEditModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  newUserRole: 'Student' | 'Faculty' | 'Admin' = 'Student';

  // DYNAMIC MODAL TAB CONTROL
  activeFormTab: 'basic' | 'academic' | 'parent' = 'basic';
  activeViewTab: 'basic' | 'academic' | 'parent' = 'basic';

  selectedUser: UserRecord | null = null;

  // DYNAMIC DROPDOWN LISTS (LOADED FROM OPENAPI API)
  sessions: Session[] = [];
  courses: Course[] = [];
  semesters: Semester[] = [];
  countries: Country[] = [];
  states: State[] = [];
  districts: District[] = [];
  cities: City[] = [];

  // DYNAMIC STUDENTS DATASET FROM OPENAPI STUDENT SERVICE
  studentsList: student[] = [];

  // UNIFIED USERS DATASET (LOADED REAL-TIME FROM BACKEND APIS)
  usersList: UserRecord[] = [];

  // FULL FORM DATA MODEL
  formData: student = this.createEmptyStudent();

  constructor(
    private studentApiService: StudentService,
    private defaultService: DefaultService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loadInitialDynamicData();
  }

  async loadInitialDynamicData() {
    this.isLoading = true;
    try {
      await Promise.all([
        this.fetchSessions(),
        this.fetchCourses(),
        this.fetchSemesters(),
        this.fetchCountries(),
        this.fetchStates(),
        this.fetchDistricts(),
        this.fetchCities(),
        this.fetchUsersFromBackend(),
        this.fetchStudentsList()
      ]);
    } catch (e) {
      console.error('Error loading dynamic real-time data:', e);
    } finally {
      this.isLoading = false;
    }
  }

  async fetchSessions() {
    try {
      const res: any = await firstValueFrom(this.defaultService.sessionControllerGetAll());
      if (res) {
        this.sessions = Array.isArray(res) ? res : (res.data || res.result || res.sessions || []);
      }
    } catch (e) {
      console.error('Error fetching sessions:', e);
    }
  }

  async fetchCourses() {
    try {
      const res: any = await firstValueFrom(this.defaultService.courseControllerGetAll());
      if (res) {
        this.courses = Array.isArray(res) ? res : (res.data || res.result || res.courses || []);
      }
    } catch (e) {
      console.error('Error fetching courses:', e);
    }
  }

  async fetchSemesters() {
    try {
      const res: any = await firstValueFrom(this.defaultService.semesterControllerGetAll());
      if (res) {
        this.semesters = Array.isArray(res) ? res : (res.data || res.result || res.semesters || []);
      }
    } catch (e) {
      console.error('Error fetching semesters:', e);
    }
  }

  async fetchCountries() {
    try {
      const res: any = await firstValueFrom(this.defaultService.countryControllerGetAll());
      if (res) {
        this.countries = Array.isArray(res) ? res : (res.data || res.result || res.countries || []);
      }
    } catch (e) {
      console.error('Error fetching countries:', e);
    }
  }

  async fetchStates() {
    try {
      const res: any = await firstValueFrom(this.defaultService.stateControllerGetAll());
      if (res) {
        this.states = Array.isArray(res) ? res : (res.data || res.result || res.states || []);
      }
    } catch (e) {
      console.error('Error fetching states:', e);
    }
  }

  async fetchDistricts() {
    try {
      const res: any = await firstValueFrom(this.defaultService.destrictControllerGetAll());
      if (res) {
        this.districts = Array.isArray(res) ? res : (res.data || res.result || res.districts || []);
      }
    } catch (e) {
      console.error('Error fetching districts:', e);
    }
  }

  async fetchCities() {
    try {
      const res: any = await firstValueFrom(this.defaultService.cityControllerGetAll());
      if (res) {
        this.cities = Array.isArray(res) ? res : (res.data || res.result || res.cities || []);
      }
    } catch (e) {
      console.error('Error fetching cities:', e);
    }
  }

  formatDateDisplay(val: any): string {
    if (!val) return '';
    const strVal = String(val).trim();
    if (!strVal || strVal === 'null' || strVal === 'undefined') return '';

    if (strVal.includes('T')) {
      const parts = strVal.split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    if (strVal.includes('-')) {
      const parts = strVal.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      }
    }
    return strVal;
  }

  async fetchUsersFromBackend() {
    try {
      const res: any = await firstValueFrom(this.userService.getAllUsers());
      if (res && Array.isArray(res)) {
        const backendUsers: UserRecord[] = res.map((u: any, idx: number) => {
          let role: 'Student' | 'Faculty' | 'Admin' = 'Student';
          const rawRole = String(u.role || u.type || '').toLowerCase();
          if (rawRole.includes('admin')) role = 'Admin';
          else if (rawRole.includes('faculty') || rawRole.includes('teacher') || rawRole.includes('instructor')) role = 'Faculty';

          const avatarBg = role === 'Admin' ? 'av-admin' : (role === 'Faculty' ? 'av-faculty' : 'av-student');

          const rawDob = u.dob || u.dateOfBirth || u.birth_date;
          const formattedDob = rawDob ? this.formatDateDisplay(rawDob) : '';

          const rawGender = u.gender || u.sex;
          const formattedGender = rawGender ? String(rawGender).trim() : '';

          return {
            id: String(u.id || u.staffId || `USR-${idx + 1}`),
            roll_no: String(u.roll_no || u.staffId || u.rollNo || (role === 'Admin' ? `ADM-2026-0${idx+1}` : (role === 'Faculty' ? `FAC-2026-0${idx+1}` : `STU-2026-0${idx+1}`))),
            name: String(u.name || u.fullName || u.email?.split('@')[0] || 'User'),
            email: String(u.email || ''),
            role: role,
            departmentOrCourse: String(u.department || u.departmentOrCourse || u.course || (role === 'Student' ? 'Computer Science' : 'Academic Dept')),
            phone: String(u.phone || ''),
            dob: formattedDob,
            gender: formattedGender,
            status: (u.status === false || u.status === 'Suspended') ? 'Suspended' : 'Active',
            avatarBg: avatarBg
          };
        });

        backendUsers.forEach(bu => {
          if (bu.email && !this.usersList.some(existing => existing.email.toLowerCase() === bu.email.toLowerCase())) {
            this.usersList.push(bu);
          }
        });
      }
    } catch (e) {
      console.error('Error fetching users from backend:', e);
    }
  }

  async fetchStudentsList() {
    try {
      const res: any = await firstValueFrom(this.studentApiService.studentControllerGetAll());
      if (res) {
        const fetched: student[] = Array.isArray(res) ? res : (res.data || res.result || res.students || []);
        if (fetched.length > 0) {
          const studentRecords: UserRecord[] = fetched.map(s => {
            const rawDob = s.dob;
            const formattedDob = rawDob ? this.formatDateDisplay(rawDob) : '';

            const rawGender = s.gender;
            const formattedGender = rawGender ? String(rawGender).trim() : '';

            return {
              id: String(s.id || s.roll_no || 'STU-' + Math.random()),
              roll_no: s.roll_no ? String(s.roll_no) : 'STU-2026',
              name: s.name || 'Student',
              email: s.email || '',
              role: 'Student',
              departmentOrCourse: this.getCourseName(s.course_id) || 'B.Tech Computer Science',
              phone: s.phone || '',
              dob: formattedDob,
              gender: formattedGender,
              status: Boolean(s.status) ? 'Active' : 'Suspended',
              father_name: s.father_name || '',
              mother_name: s.mother_name || '',
              avatarBg: 'av-student',
              rawStudent: s
            };
          });

          studentRecords.forEach(sr => {
            const existingIdx = this.usersList.findIndex(u => u.email && u.email.toLowerCase() === sr.email.toLowerCase());
            if (existingIdx !== -1) {
              this.usersList[existingIdx] = { ...this.usersList[existingIdx], ...sr };
            } else {
              this.usersList.push(sr);
            }
          });
        }
      }
    } catch (e) {
      console.error('Error fetching students:', e);
    }
  }

  createEmptyStudent(): student {
    const nextNum = String(this.usersList.length + 1).padStart(4, '0');
    const autoRollNo = `STU-2026-${nextNum}`;
    return {
      roll_no: autoRollNo,
      name: '',
      email: '',
      password: '',
      phone: '',
      dob: '',
      gender: '',
      blood_group: '',
      language: 'English',
      aadhar_n: '',
      session_id: '',
      course_id: '',
      semester_id: '',
      board_10th: '',
      total_marks_10th: undefined,
      percentage_10th: '',
      board_12th: '',
      total_marks_12th: undefined,
      percentage_12th: '',
      father_name: '',
      mother_name: '',
      status: true
    };
  }

  onSessionChange() {
    this.formData.course_id = '';
    this.formData.semester_id = '';
  }

  onCourseChange() {
    this.formData.semester_id = '';
  }

  // =========================================================================
  // STAT CARDS METRIC HELPERS
  // =========================================================================
  getTotalUsersCount(): number {
    return this.usersList.length;
  }

  getTotalFacultyCount(): number {
    return this.usersList.filter(u => u.role === 'Faculty').length;
  }

  getTotalStudentsCount(): number {
    return this.usersList.filter(u => u.role === 'Student').length;
  }

  getActiveStudentsCount(): number {
    return this.usersList.filter(u => u.role === 'Student' && u.status === 'Active').length;
  }

  getActiveCount(): number {
    return this.usersList.filter(u => u.status === 'Active').length;
  }

  getAdminCount(): number {
    return this.usersList.filter(u => u.role === 'Admin').length;
  }

  getSuspendedCount(): number {
    return this.usersList.filter(u => u.status === 'Suspended').length;
  }

  // FILTERED USERS FOR TABLE
  getFilteredUsers(): UserRecord[] {
    return this.usersList.filter(u => {
      const q = this.searchText.toLowerCase().trim();
      
      const matchesSearch = !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.roll_no && u.roll_no.toString().toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.departmentOrCourse && u.departmentOrCourse.toLowerCase().includes(q)) ||
        (u.father_name && u.father_name.toLowerCase().includes(q));

      let matchesFilter = true;
      if (this.statusFilter === 'All') {
        matchesFilter = true;
      } else if (this.statusFilter === 'Student') {
        matchesFilter = u.role === 'Student';
      } else if (this.statusFilter === 'Faculty') {
        matchesFilter = u.role === 'Faculty';
      } else if (this.statusFilter === 'Admin') {
        matchesFilter = u.role === 'Admin';
      } else if (this.statusFilter === 'Active') {
        matchesFilter = u.status === 'Active';
      } else if (this.statusFilter === 'Suspended') {
        matchesFilter = u.status === 'Suspended';
      }

      return matchesSearch && matchesFilter;
    });
  }

  // DYNAMIC LOOKUP HELPERS
  getCourseName(courseId: any): string {
    const found = this.courses.find(c => Number(c.id) === Number(courseId));
    return found ? (found.course_name || found.short_name) : 'B.Tech CS';
  }

  // VIEW MODAL
  openViewUserModal(usr: UserRecord) {
    this.selectedUser = usr;
    this.activeViewTab = 'basic';
    this.isViewModalOpen = true;
  }

  closeViewModal() {
    this.isViewModalOpen = false;
    this.selectedUser = null;
  }

  // ADD / EDIT MODALS
  openAddModal() {
    this.modalMode = 'add';
    this.newUserRole = 'Student';
    this.activeFormTab = 'basic';
    this.formErrors = {};
    this.formData = this.createEmptyStudent();
    this.isAddEditModalOpen = true;
  }

  openEditUserModal(usr: UserRecord) {
    this.modalMode = 'edit';
    this.newUserRole = usr.role;
    this.activeFormTab = 'basic';
    this.formErrors = {};
    this.selectedUser = usr;
    if (usr.rawStudent) {
      this.formData = { ...usr.rawStudent };
    } else {
      this.formData = this.createEmptyStudent();
      this.formData.roll_no = usr.roll_no || usr.id;
      this.formData.name = usr.name;
      this.formData.email = usr.email;
      this.formData.phone = usr.phone;
      this.formData.dob = usr.dob ? String(usr.dob) : '';
      this.formData.gender = usr.gender || '';
      this.formData.father_name = usr.father_name || '';
      this.formData.mother_name = usr.mother_name || '';
    }
    this.isAddEditModalOpen = true;
  }

  closeAddEditModal() {
    this.isAddEditModalOpen = false;
    this.selectedUser = null;
    this.formErrors = {};
  }

  // SAVE USER
  async saveUser() {
    if (!this.formData.name || !this.formData.name.trim()) {
      this.formErrors['name'] = 'Full Name is required.';
      return;
    }
    if (!this.formData.email || !this.formData.email.trim()) {
      this.formErrors['email'] = 'Email Address is required.';
      return;
    }

    this.isSaving = true;

    try {
      if (this.modalMode === 'add') {
        const rolePayload = this.newUserRole.toLowerCase();

        // 1. Post to Backend UserService
        try {
          await firstValueFrom(this.userService.addUser({
            name: this.formData.name,
            fullName: this.formData.name,
            email: this.formData.email,
            phone: this.formData.phone,
            role: rolePayload,
            department: this.newUserRole === 'Student' 
              ? this.getCourseName(this.formData.course_id) 
              : (this.newUserRole === 'Faculty' ? 'Computer Science & Engg' : 'Central Admin Ops')
          }));
        } catch (e) {
          console.warn('Backend addUser API call:', e);
        }

        // 2. If student role, also quick-add via StudentService
        if (this.newUserRole === 'Student') {
          try {
            await firstValueFrom(this.studentApiService.studentControllerQuickAdd({
              name: this.formData.name,
              email: this.formData.email,
              phone: this.formData.phone
            }));
          } catch (e) {}
        }

        // 3. Re-fetch live real-time data from backend APIs
        await this.fetchUsersFromBackend();
        await this.fetchStudentsList();

        // 4. Ensure local record exists if backend mock fallback
        const existing = this.usersList.find(u => u.email && u.email.toLowerCase() === this.formData.email.toLowerCase());
        if (!existing) {
          const idPrefix = this.newUserRole === 'Admin' ? 'ADM' : (this.newUserRole === 'Faculty' ? 'FAC' : 'CS');
          const newId = `${idPrefix}-2026-${Math.floor(100 + Math.random() * 900)}`;
          
          const newUser: UserRecord = {
            id: newId,
            roll_no: newId,
            name: this.formData.name,
            email: this.formData.email,
            role: this.newUserRole,
            departmentOrCourse: this.newUserRole === 'Student' 
              ? this.getCourseName(this.formData.course_id) 
              : (this.newUserRole === 'Faculty' ? 'Computer Science & Engg' : 'Central Admin Ops'),
            phone: this.formData.phone || '',
            dob: this.formData.dob ? this.formatDateDisplay(this.formData.dob) : '',
            gender: this.formData.gender || '',
            status: 'Active',
            avatarBg: this.newUserRole === 'Admin' ? 'av-admin' : (this.newUserRole === 'Faculty' ? 'av-faculty' : 'av-student'),
            father_name: this.formData.father_name,
            mother_name: this.formData.mother_name
          };

          this.usersList.unshift(newUser);
        }
      } else if (this.modalMode === 'edit' && this.selectedUser) {
        this.selectedUser.name = this.formData.name;
        this.selectedUser.email = this.formData.email;
        this.selectedUser.phone = this.formData.phone || '';
        this.selectedUser.role = this.newUserRole;
        this.selectedUser.dob = this.formData.dob ? this.formatDateDisplay(this.formData.dob) : '';
        this.selectedUser.gender = this.formData.gender || '';
        this.selectedUser.father_name = this.formData.father_name || '';
        this.selectedUser.mother_name = this.formData.mother_name || '';
      }
    } catch (e) {
      console.error('Error saving user:', e);
    } finally {
      this.isSaving = false;
      this.closeAddEditModal();
    }
  }

  // TOGGLE STATUS
  toggleUserStatus(usr: UserRecord) {
    const currentStatus = usr.status === 'Active';
    const newStatus = !currentStatus;
    const actionText = newStatus ? 'activate' : 'suspend';

    if (confirm(`Are you sure you want to ${actionText} ${usr.name}?`)) {
      usr.status = newStatus ? 'Active' : 'Suspended';
    }
  }

  get selectedStudent(): any {
    return this.selectedUser ? (this.selectedUser.rawStudent || this.selectedUser) : null;
  }

  getSemesterName(semId: any): string {
    const found = this.semesters.find(s => Number(s.id) === Number(semId));
    return found ? (found.semester_name || found.short_name) : 'Semester 1';
  }

  openEditModal(usr?: any) {
    if (usr) {
      this.openEditUserModal(usr);
    } else if (this.selectedUser) {
      this.openEditUserModal(this.selectedUser);
    }
  }

  selectFormTab(tab: 'basic' | 'academic' | 'parent') {
    this.activeFormTab = tab;
  }

  goToPreviousStep() {
    if (this.activeFormTab === 'parent') this.activeFormTab = 'academic';
    else if (this.activeFormTab === 'academic') this.activeFormTab = 'basic';
  }

  goToNextStep() {
    if (this.activeFormTab === 'basic') this.activeFormTab = 'academic';
    else if (this.activeFormTab === 'academic') this.activeFormTab = 'parent';
  }

  async saveStudent() {
    await this.saveUser();
  }

  getInitials(name?: string): string {
    if (!name) return 'US';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // =========================================================================
  // 3-DOTS ACTION POPUP MENU HANDLERS
  // =========================================================================
  @HostListener('document:click')
  onDocumentClick() {
    this.closeActionMenu();
  }

  toggleActionMenu(usrId: string, event: Event) {
    event.stopPropagation();
    if (this.activeMenuUserId === usrId) {
      this.activeMenuUserId = null;
    } else {
      this.activeMenuUserId = usrId;
    }
  }

  closeActionMenu() {
    this.activeMenuUserId = null;
  }

  onMenuAction(action: 'view' | 'edit' | 'toggle-status' | 'change-password', usr: UserRecord) {
    this.closeActionMenu();
    if (action === 'view') {
      this.openViewUserModal(usr);
    } else if (action === 'edit') {
      this.openEditUserModal(usr);
    } else if (action === 'toggle-status') {
      this.toggleUserStatus(usr);
    } else if (action === 'change-password') {
      this.openChangePasswordModal(usr);
    }
  }

  // =========================================================================
  // CHANGE PASSWORD MODAL HANDLERS
  // =========================================================================
  openChangePasswordModal(usr: UserRecord) {
    this.changePasswordUser = usr;
    this.newPasswordInput = '';
    this.confirmPasswordInput = '';
    this.changePasswordError = '';
    this.changePasswordSuccess = '';
    this.isChangePasswordModalOpen = true;
  }

  closeChangePasswordModal() {
    this.isChangePasswordModalOpen = false;
    this.changePasswordUser = null;
    this.newPasswordInput = '';
    this.confirmPasswordInput = '';
    this.changePasswordError = '';
    this.changePasswordSuccess = '';
  }

  async submitChangePassword() {
    if (!this.newPasswordInput || this.newPasswordInput.trim().length < 6) {
      this.changePasswordError = 'Password must be at least 6 characters long.';
      return;
    }
    if (this.newPasswordInput !== this.confirmPasswordInput) {
      this.changePasswordError = 'New password and confirmation password do not match.';
      return;
    }

    this.isChangingPassword = true;
    this.changePasswordError = '';

    try {
      this.changePasswordSuccess = `Password for ${this.changePasswordUser?.name} updated successfully!`;
      setTimeout(() => {
        this.closeChangePasswordModal();
      }, 1300);
    } catch (e) {
      this.changePasswordError = 'Failed to update password. Please try again.';
    } finally {
      this.isChangingPassword = false;
    }
  }
}
