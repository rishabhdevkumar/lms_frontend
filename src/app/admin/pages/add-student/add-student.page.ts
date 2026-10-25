import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { student, Session, Course, Semester, Country, State, District, City } from 'src/app/interfaces';
import { StudentService, DefaultService } from 'src/app/api';
import { UserService, AdminAddUserDto, AdminUpdateUserDto } from 'src/app/services/user.service';
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
  status: 'Active' | 'Deactive' | 'Pending';
  avatarBg?: string;
  father_name?: string;
  mother_name?: string;
  course_id?: any;
  rawStudent?: any;
}

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.page.html',
  styleUrls: ['./add-student.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddStudentPage implements OnInit {

  searchText = '';
  statusFilter = 'All';
  isSearchOpen = false;

  openSearch() {
    this.isSearchOpen = true;
    setTimeout(() => {
      const el = document.getElementById('student-compact-search-input');
      if (el) el.focus();
    }, 50);
  }

  closeSearch() {
    this.isSearchOpen = false;
    this.searchText = '';
  }

  toggleSearch() {
    if (this.isSearchOpen) {
      this.closeSearch();
    } else {
      this.openSearch();
    }
  }

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

  // SERVER ALERTS & FORM CONTROLS
  serverErrorMessage = '';
  serverSuccessMessage = '';
  showPassword = false;

  // MODAL STATES
  isViewModalOpen = false;
  isAddEditModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  get isEditMode(): boolean {
    return this.modalMode === 'edit';
  }
  newUserRole: 'Student' | 'Faculty' | 'Admin' = 'Student';

  // DYNAMIC MODAL TAB CONTROL
  activeFormTab: 'basic' | 'academic' | 'parent' = 'basic';
  activeViewTab: 'basic' | 'academic' | 'parent' = 'basic';
  completedSteps = { basic: false, academic: false };

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
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadInitialDynamicData();
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'add' || this.router.url.includes('add-user')) {
        this.openAddModal();
      }
    });
  }

  ionViewWillEnter() {
    this.loadInitialDynamicData();
  }

  generateAutoRollNo(role: 'Student' | 'Faculty' | 'Admin'): string {
    const prefix = role === 'Admin' ? 'ADM' : (role === 'Faculty' ? 'FAC' : 'STU');
    let maxNum = 0;

    for (const u of this.usersList) {
      const rollStr = String(u.roll_no || '').trim().toUpperCase();
      if (rollStr.startsWith(prefix)) {
        const afterPrefix = rollStr.slice(prefix.length).replace(/[^0-9]/g, '');
        if (afterPrefix) {
          const num = parseInt(afterPrefix, 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }

    const nextNum = maxNum + 1;
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  }

  setRole(role: 'Student' | 'Faculty' | 'Admin') {
    this.newUserRole = role;
    if (this.modalMode === 'add') {
      this.formData.roll_no = this.generateAutoRollNo(role);
    }
  }

  onRoleChange(newRole: 'Student' | 'Faculty' | 'Admin') {
    this.setRole(newRole);
    if (newRole !== 'Student' && this.activeFormTab === 'academic') {
      this.activeFormTab = 'parent';
    }
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
        this.fetchCities()
      ]);
      await this.fetchUsersFromBackend();
      await this.fetchStudentsList();
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

  toInputDateFormat(val: any): string {
    if (!val) return '';
    const s = String(val).trim();
    if (!s || s === 'null' || s === 'undefined') return '';
    if (s.includes('T')) {
      return s.split('T')[0];
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return s;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      const parts = s.split('/');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
      const parts = s.split('-');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return s;
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
    if (/^\d{4}-\d{2}-\d{2}$/.test(strVal)) {
      const parts = strVal.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
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

  normalizeStatus(val: any, isActiveVal?: any): 'Active' | 'Deactive' | 'Pending' {
    if (isActiveVal === 0 || isActiveVal === '0' || isActiveVal === false) return 'Deactive';
    if (val === null || val === undefined || val === '') return 'Active';
    const s = String(val).trim().toLowerCase();
    if (s === 'pending') return 'Pending';
    if (s.includes('deact') || s.includes('inact') || s.includes('suspend') || s.includes('lock') || val === false || s === '0') {
      return 'Deactive';
    }
    return 'Active';
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
          const inputDob = rawDob ? this.toInputDateFormat(rawDob) : '';

          const rawGender = u.gender || u.sex;
          const formattedGender = rawGender ? String(rawGender).trim() : '';

          const dept = u.department || u.departmentOrCourse || (u.course_id ? this.getCourseName(u.course_id) : (role === 'Student' ? 'Computer Science' : 'Academic Dept'));

          return {
            id: String(u.id || u.staffId || `USR-${idx + 1}`),
            roll_no: String(u.roll_no || u.staffId || u.rollNo || (role === 'Admin' ? `ADM${String(idx + 1).padStart(3, '0')}` : (role === 'Faculty' ? `FAC${String(idx + 1).padStart(3, '0')}` : `STU${String(idx + 1).padStart(3, '0')}`))),
            name: String(u.name || u.fullName || u.email?.split('@')[0] || 'User'),
            email: String(u.email || ''),
            role: role,
            departmentOrCourse: String(dept),
            phone: String(u.phone || ''),
            dob: formattedDob,
            gender: formattedGender,
            status: this.normalizeStatus(u.status, u.is_active),
            avatarBg: avatarBg,
            father_name: u.father_name || '',
            mother_name: u.mother_name || '',
            course_id: u.course_id,
            rawStudent: {
              ...u,
              id: u.id,
              roll_no: u.roll_no,
              name: u.name,
              email: u.email,
              phone: u.phone,
              dob: inputDob,
              gender: formattedGender,
              father_name: u.father_name || '',
              mother_name: u.mother_name || '',
              course_id: u.course_id,
              session_id: u.session_id,
              semester_id: u.semester_id,
              aadhar_n: u.aadhar_no || u.aadhar_n || '',
              board_10th: u.board_10th || '',
              total_marks_10th: u.total_marks_10th,
              percentage_10th: u.percentage_10th,
              board_12th: u.board_12th || '',
              total_marks_12th: u.total_marks_12th,
              percentage_12th: u.percentage_12th,
              blood_group: u.blood_group || '',
              language: u.language || '',
              status: this.normalizeStatus(u.status) === 'Active'
            }
          };
        });

        this.usersList = [...backendUsers];
        this.cdr.detectChanges();
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
              status: this.normalizeStatus(s.status),
              course_id: s.course_id,
              father_name: s.father_name || '',
              mother_name: s.mother_name || '',
              avatarBg: 'av-student',
              rawStudent: s
            };
          });

          studentRecords.forEach(sr => {
            const existingIdx = this.usersList.findIndex(u => (u.email && sr.email && u.email.toLowerCase() === sr.email.toLowerCase()) || (u.id && sr.id && u.id === sr.id));
            if (existingIdx !== -1) {
              const existing = this.usersList[existingIdx];
              this.usersList[existingIdx] = {
                ...existing,
                course_id: sr.course_id || (existing as any).course_id,
                departmentOrCourse: existing.departmentOrCourse || sr.departmentOrCourse,
                phone: existing.phone || sr.phone,
                dob: existing.dob || sr.dob,
                gender: existing.gender || sr.gender,
                father_name: existing.father_name || sr.father_name,
                mother_name: existing.mother_name || sr.mother_name,
                rawStudent: sr.rawStudent || existing.rawStudent
              };
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
    return {
      roll_no: '',
      name: '',
      email: '',
      password: '',
      phone: '',
      dob: '',
      gender: 'Male',
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

  getPendingCount(): number {
    return this.usersList.filter(u => u.status === 'Pending').length;
  }

  getDeactiveCount(): number {
    return this.usersList.filter(u => u.status === 'Deactive').length;
  }

  getAdminCount(): number {
    return this.usersList.filter(u => u.role === 'Admin').length;
  }

  getSuspendedCount(): number {
    return this.usersList.filter(u => u.status === 'Deactive').length;
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
      } else if (this.statusFilter === 'Pending') {
        matchesFilter = u.status === 'Pending';
      } else if (this.statusFilter === 'Deactive' || this.statusFilter === 'Suspended') {
        matchesFilter = u.status === 'Deactive';
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

  async openAddModal() {
    this.modalMode = 'add';
    this.newUserRole = 'Student';
    this.activeFormTab = 'basic';
    this.completedSteps = { basic: false, academic: false };
    this.formErrors = {};
    this.serverErrorMessage = '';
    this.serverSuccessMessage = '';
    this.showPassword = false;
    this.formData = this.createEmptyStudent();
    if (!this.usersList || this.usersList.length === 0) {
      await this.fetchUsersFromBackend();
    }
    this.formData.roll_no = this.generateAutoRollNo('Student');
    this.isAddEditModalOpen = true;
  }

  openEditUserModal(usr: UserRecord) {
    this.modalMode = 'edit';
    this.newUserRole = usr.role;
    this.activeFormTab = 'basic';
    this.completedSteps = { basic: true, academic: true };
    this.formErrors = {};
    this.serverErrorMessage = '';
    this.serverSuccessMessage = '';
    this.showPassword = false;
    this.selectedUser = usr;

    const raw = usr.rawStudent || ({} as any);
    this.formData = {
      ...this.createEmptyStudent(),
      ...raw,
      roll_no: usr.roll_no || raw.roll_no || usr.id,
      name: usr.name || raw.name || '',
      email: usr.email || raw.email || '',
      phone: usr.phone || raw.phone || '',
      gender: usr.gender || raw.gender || 'Male',
      dob: this.toInputDateFormat(raw.dob || usr.dob),
      blood_group: raw.blood_group || '',
      language: raw.language || '',
      session_id: raw.session_id || (usr as any).session_id || '',
      course_id: raw.course_id || usr.course_id || '',
      semester_id: raw.semester_id || (usr as any).semester_id || '',
      aadhar_n: raw.aadhar_no || raw.aadhar_n || (usr as any).aadhar_no || '',
      father_name: usr.father_name || raw.father_name || '',
      mother_name: usr.mother_name || raw.mother_name || '',
      board_10th: raw.board_10th || '',
      total_marks_10th: raw.total_marks_10th,
      percentage_10th: raw.percentage_10th,
      board_12th: raw.board_12th || '',
      total_marks_12th: raw.total_marks_12th,
      percentage_12th: raw.percentage_12th,
      password: ''
    };
    this.isAddEditModalOpen = true;
  }

  closeAddEditModal() {
    this.isAddEditModalOpen = false;
    this.selectedUser = null;
    this.formErrors = {};
    this.serverErrorMessage = '';
    this.serverSuccessMessage = '';
  }

  // SAVE USER
  async saveUser() {
    this.serverErrorMessage = '';
    this.serverSuccessMessage = '';
    this.formErrors = {};

    const name = String(this.formData.name || '').trim();
    const email = String(this.formData.email || '').trim();
    const password = String(this.formData.password || '').trim();
    const phone = String(this.formData.phone || '').trim();

    // 1. Client-Side Validations
    if (!name) {
      this.formErrors['name'] = 'Full Name is required.';
      this.activeFormTab = 'basic';
      return;
    }

    if (!email) {
      this.formErrors['email'] = 'Email Address is required.';
      this.activeFormTab = 'basic';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.formErrors['email'] = 'Please enter a valid email address.';
      this.activeFormTab = 'basic';
      return;
    }

    if (this.modalMode === 'add') {
      if (!password) {
        this.formErrors['password'] = 'Password is required.';
        this.activeFormTab = 'basic';
        return;
      }
      if (password.length < 8) {
        this.formErrors['password'] = 'Password must be at least 8 characters long.';
        this.activeFormTab = 'basic';
        return;
      }
      if (!/^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/.test(password)) {
        this.formErrors['password'] = 'Password must contain at least 1 alphabet, 1 number, and 1 special character.';
        this.activeFormTab = 'basic';
        return;
      }
    } else if (this.modalMode === 'edit' && password) {
      if (password.length < 8 || !/^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/.test(password)) {
        this.formErrors['password'] = 'Password must contain at least 1 alphabet, 1 number, and 1 special character.';
        this.activeFormTab = 'basic';
        return;
      }
    }

    if (!phone) {
      this.formErrors['phone'] = 'Phone number is required.';
      this.activeFormTab = 'basic';
      return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      this.formErrors['phone'] = 'Phone number must contain exactly 10 digits.';
      this.activeFormTab = 'basic';
      return;
    }

    if (this.formData.aadhar_n && String(this.formData.aadhar_n).trim()) {
      const aadhar = String(this.formData.aadhar_n).trim();
      if (!/^[0-9]{12}$/.test(aadhar)) {
        this.formErrors['aadhar_n'] = 'Aadhar number must contain exactly 12 digits.';
        this.activeFormTab = 'parent';
        return;
      }
    }

    this.isSaving = true;

    try {
      if (this.modalMode === 'add') {
        const payload: AdminAddUserDto = {
          roll_no: this.formData.roll_no ? String(this.formData.roll_no).trim() : null,
          name: name,
          email: email,
          password: password,
          language: this.formData.language ? String(this.formData.language).trim() : null,
          phone: phone,
          dob: this.formData.dob ? this.toInputDateFormat(this.formData.dob) : null,
          gender: this.formData.gender ? String(this.formData.gender).trim() : 'Male',
          role: String(this.newUserRole || 'Student').toLowerCase(),
          session_id: this.formData.session_id ? Number(this.formData.session_id) : null,
          course_id: this.formData.course_id ? Number(this.formData.course_id) : null,
          semester_id: this.formData.semester_id ? Number(this.formData.semester_id) : null,
          aadhar_no: this.formData.aadhar_n ? String(this.formData.aadhar_n).trim() : null,
          father_name: this.formData.father_name ? String(this.formData.father_name).trim() : null,
          mother_name: this.formData.mother_name ? String(this.formData.mother_name).trim() : null,
          board_10th: this.formData.board_10th ? String(this.formData.board_10th).trim() : null,
          total_marks_10th: this.formData.total_marks_10th !== undefined && this.formData.total_marks_10th !== null && String(this.formData.total_marks_10th) !== '' ? Number(this.formData.total_marks_10th) : null,
          percentage_10th: this.formData.percentage_10th !== undefined && this.formData.percentage_10th !== null && String(this.formData.percentage_10th) !== '' ? Number(this.formData.percentage_10th) : null,
          board_12th: this.formData.board_12th ? String(this.formData.board_12th).trim() : null,
          total_marks_12th: this.formData.total_marks_12th !== undefined && this.formData.total_marks_12th !== null && String(this.formData.total_marks_12th) !== '' ? Number(this.formData.total_marks_12th) : null,
          percentage_12th: this.formData.percentage_12th !== undefined && this.formData.percentage_12th !== null && String(this.formData.percentage_12th) !== '' ? Number(this.formData.percentage_12th) : null,
        };

        const res: any = await firstValueFrom(this.userService.adminAddUser(payload));

        if (!res || !res.ok) {
          const errText = res?.msg || res?.message || 'Failed to add user.';
          this.serverErrorMessage = errText;
          const lowerMsg = errText.toLowerCase();
          if (lowerMsg.includes('phone')) {
            this.formErrors['phone'] = errText;
            this.activeFormTab = 'basic';
          } else if (lowerMsg.includes('email')) {
            this.formErrors['email'] = errText;
            this.activeFormTab = 'basic';
          } else if (lowerMsg.includes('roll')) {
            this.formErrors['roll_no'] = errText;
            this.activeFormTab = 'basic';
          } else if (lowerMsg.includes('password')) {
            this.formErrors['password'] = errText;
            this.activeFormTab = 'basic';
          } else if (lowerMsg.includes('aadhar')) {
            this.formErrors['aadhar_n'] = errText;
            this.activeFormTab = 'parent';
          }
          this.isSaving = false;
          return;
        }

        // Successfully registered user via backend sp_admin_users_add API
        this.serverSuccessMessage = res?.msg || `${this.newUserRole} added successfully!`;

        // Real-time optimistic insertion for instant UI responsiveness
        const newId = res?.data?.id || (typeof res?.data === 'string' ? JSON.parse(res.data)?.id : null) || `NEW-${Date.now()}`;
        const newRecord: UserRecord = {
          id: String(newId),
          roll_no: payload.roll_no || `STU${newId}`,
          name: payload.name,
          email: payload.email,
          role: this.newUserRole,
          departmentOrCourse: payload.course_id ? this.getCourseName(payload.course_id) : (this.newUserRole === 'Student' ? 'Computer Science' : 'Academic Dept'),
          phone: payload.phone,
          dob: payload.dob ? this.formatDateDisplay(payload.dob) : '',
          gender: payload.gender || 'Male',
          status: 'Active',
          avatarBg: this.newUserRole === 'Admin' ? 'av-admin' : (this.newUserRole === 'Faculty' ? 'av-faculty' : 'av-student'),
          father_name: payload.father_name || '',
          mother_name: payload.mother_name || '',
          course_id: payload.course_id,
          rawStudent: {
            ...this.createEmptyStudent(),
            ...payload,
            id: newId,
            aadhar_n: payload.aadhar_no || ''
          }
        };

        this.usersList = [newRecord, ...this.usersList];
        this.cdr.detectChanges();

        // Background sync to ensure full consistency with backend database
        this.fetchUsersFromBackend();

        setTimeout(() => {
          this.isSaving = false;
          this.closeAddEditModal();
        }, 900);

      } else if (this.modalMode === 'edit' && this.selectedUser) {
        const updatePayload: any = {
          id: Number(this.selectedUser.id) || this.selectedUser.id,
          roll_no: this.formData.roll_no ? String(this.formData.roll_no).trim() : (this.selectedUser.roll_no || null),
          name: name,
          email: email,
          phone: phone,
          role: String(this.newUserRole || this.selectedUser.role || 'Student').toLowerCase(),
          gender: this.formData.gender ? String(this.formData.gender).trim() : (this.selectedUser.gender || 'Male'),
          dob: this.formData.dob ? this.toInputDateFormat(this.formData.dob) : null,
          language: this.formData.language ? String(this.formData.language).trim() : null,
          session_id: this.formData.session_id ? Number(this.formData.session_id) : null,
          course_id: this.formData.course_id ? Number(this.formData.course_id) : null,
          semester_id: this.formData.semester_id ? Number(this.formData.semester_id) : null,
          aadhar_no: this.formData.aadhar_n ? String(this.formData.aadhar_n).trim() : null,
          father_name: this.formData.father_name ? String(this.formData.father_name).trim() : null,
          mother_name: this.formData.mother_name ? String(this.formData.mother_name).trim() : null,
          board_10th: this.formData.board_10th ? String(this.formData.board_10th).trim() : null,
          total_marks_10th: this.formData.total_marks_10th !== undefined && this.formData.total_marks_10th !== null && String(this.formData.total_marks_10th) !== '' ? Number(this.formData.total_marks_10th) : null,
          percentage_10th: this.formData.percentage_10th !== undefined && this.formData.percentage_10th !== null && String(this.formData.percentage_10th) !== '' ? Number(this.formData.percentage_10th) : null,
          board_12th: this.formData.board_12th ? String(this.formData.board_12th).trim() : null,
          total_marks_12th: this.formData.total_marks_12th !== undefined && this.formData.total_marks_12th !== null && String(this.formData.total_marks_12th) !== '' ? Number(this.formData.total_marks_12th) : null,
          percentage_12th: this.formData.percentage_12th !== undefined && this.formData.percentage_12th !== null && String(this.formData.percentage_12th) !== '' ? Number(this.formData.percentage_12th) : null,
          status: this.selectedUser.status === 'Active' ? 'Active' : (this.selectedUser.status === 'Pending' ? 'Pending' : 'Deactive')
        };
        if (password) {
          updatePayload.password = password;
        }

        const updateRes: any = await firstValueFrom(this.userService.updateUser(updatePayload));
        if (!updateRes || !updateRes.ok) {
          const errText = updateRes?.msg || updateRes?.message || 'Failed to update user.';
          this.serverErrorMessage = errText;
          const lowerMsg = errText.toLowerCase();
          if (lowerMsg.includes('phone')) {
            this.formErrors['phone'] = errText;
            this.activeFormTab = 'basic';
          } else if (lowerMsg.includes('email')) {
            this.formErrors['email'] = errText;
            this.activeFormTab = 'basic';
          } else if (lowerMsg.includes('roll')) {
            this.formErrors['roll_no'] = errText;
            this.activeFormTab = 'basic';
          } else if (lowerMsg.includes('password')) {
            this.formErrors['password'] = errText;
            this.activeFormTab = 'basic';
          } else if (lowerMsg.includes('aadhar')) {
            this.formErrors['aadhar_n'] = errText;
            this.activeFormTab = 'parent';
          }
          this.isSaving = false;
          return;
        }

        this.serverSuccessMessage = updateRes?.msg || 'User updated successfully!';

        // Real-time optimistic update for instant UI feedback
        const targetIdx = this.usersList.findIndex(u => u.id === this.selectedUser!.id);
        if (targetIdx !== -1) {
          this.usersList[targetIdx] = {
            ...this.usersList[targetIdx],
            name: updatePayload.name,
            email: updatePayload.email,
            phone: updatePayload.phone,
            role: this.newUserRole,
            gender: updatePayload.gender,
            dob: updatePayload.dob ? this.formatDateDisplay(updatePayload.dob) : '',
            father_name: updatePayload.father_name || '',
            mother_name: updatePayload.mother_name || '',
            course_id: updatePayload.course_id,
            departmentOrCourse: updatePayload.course_id ? this.getCourseName(updatePayload.course_id) : this.usersList[targetIdx].departmentOrCourse,
            rawStudent: {
              ...this.usersList[targetIdx].rawStudent,
              ...updatePayload,
              aadhar_n: updatePayload.aadhar_no || ''
            }
          };
          this.usersList = [...this.usersList];
          this.cdr.detectChanges();
        }

        // Background sync to ensure full consistency with backend database
        this.fetchUsersFromBackend();

        setTimeout(() => {
          this.isSaving = false;
          this.closeAddEditModal();
        }, 900);
      }
    } catch (e: any) {
      console.error('Error saving user:', e);
      this.serverErrorMessage = e?.message || 'Server error occurred while saving user.';
      this.isSaving = false;
    }
  }

  // TOGGLE STATUS
  async toggleUserStatus(usr: UserRecord) {
    if (usr.role === 'Admin' || String(usr.role).toLowerCase() === 'admin') {
      alert('Administrator status cannot be deactivated.');
      return;
    }
    const isCurrentlyActive = usr.status === 'Active';
    const targetStatus: 'Active' | 'Deactive' = isCurrentlyActive ? 'Deactive' : 'Active';
    const targetIsActive = isCurrentlyActive ? 0 : 1;
    const actionText = isCurrentlyActive ? 'deactivate (lock)' : 'activate';

    if (confirm(`Are you sure you want to ${actionText} ${usr.name}?`)) {
      const prevStatus = usr.status;
      usr.status = targetStatus;
      this.cdr.detectChanges();
      try {
        const res: any = await firstValueFrom(this.userService.updateUserStatus(usr.id, targetIsActive));
        if (!res || !res.ok) {
          usr.status = prevStatus;
          this.cdr.detectChanges();
          alert(res?.msg || res?.message || 'Failed to update user status');
          return;
        }
        this.fetchUsersFromBackend();
      } catch (e: any) {
        usr.status = prevStatus;
        this.cdr.detectChanges();
        alert(e?.message || 'Error updating status in backend');
      }
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
    this.goToStep(tab);
  }

  isStepCompleted(step: 'basic' | 'academic' | 'parent'): boolean {
    if (step === 'basic') return this.completedSteps.basic;
    if (step === 'academic') return this.completedSteps.academic;
    return false;
  }

  canAccessStep(step: 'basic' | 'academic' | 'parent'): boolean {
    if (step === 'basic') return true;
    if (step === 'academic') return this.newUserRole === 'Student' && this.completedSteps.basic;
    if (step === 'parent') {
      if (this.newUserRole === 'Student') {
        return this.completedSteps.basic && this.completedSteps.academic;
      }
      return this.completedSteps.basic;
    }
    return false;
  }

  goToNextStep() {
    this.formErrors = {};

    if (this.activeFormTab === 'basic') {
      const name = String(this.formData.name || '').trim();
      const email = String(this.formData.email || '').trim();
      const password = String(this.formData.password || '').trim();
      const phone = String(this.formData.phone || '').trim();

      let hasError = false;
      if (!name) {
        this.formErrors['name'] = 'Full Name is required.';
        hasError = true;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        this.formErrors['email'] = 'Valid email address is required.';
        hasError = true;
      }
      if (this.modalMode === 'add') {
        if (!password || password.length < 8 || !/^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/.test(password)) {
          this.formErrors['password'] = 'Min 8 chars (1 letter, 1 number & 1 special character).';
          hasError = true;
        }
      } else if (this.modalMode === 'edit' && password) {
        if (password.length < 8 || !/^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/.test(password)) {
          this.formErrors['password'] = 'Min 8 chars (1 letter, 1 number & 1 special character).';
          hasError = true;
        }
      }
      if (!phone || !/^[0-9]{10}$/.test(phone)) {
        this.formErrors['phone'] = '10-digit phone number is required.';
        hasError = true;
      }

      if (hasError) {
        this.completedSteps.basic = false;
        return;
      }

      this.completedSteps.basic = true;
      if (this.newUserRole === 'Student') {
        this.activeFormTab = 'academic';
      } else {
        this.activeFormTab = 'parent';
      }
      return;
    }

    if (this.activeFormTab === 'academic') {
      if (!this.completedSteps.basic) {
        this.activeFormTab = 'basic';
        return;
      }
      this.completedSteps.academic = true;
      this.activeFormTab = 'parent';
      return;
    }
  }

  goToPreviousStep() {
    this.formErrors = {};
    if (this.activeFormTab === 'parent') {
      if (this.newUserRole === 'Student') {
        this.activeFormTab = 'academic';
      } else {
        this.activeFormTab = 'basic';
      }
    } else if (this.activeFormTab === 'academic') {
      this.activeFormTab = 'basic';
    }
  }

  goToStep(tab: 'basic' | 'academic' | 'parent') {
    if (tab === 'basic') {
      this.activeFormTab = 'basic';
      return;
    }
    if (tab === 'academic') {
      if (this.newUserRole !== 'Student') return;
      if (!this.completedSteps.basic) {
        this.goToNextStep();
        return;
      }
      this.activeFormTab = 'academic';
      return;
    }
    if (tab === 'parent') {
      if (!this.completedSteps.basic) {
        this.goToNextStep();
        return;
      }
      if (this.newUserRole === 'Student' && !this.completedSteps.academic) {
        this.activeFormTab = 'academic';
        return;
      }
      this.activeFormTab = 'parent';
      return;
    }
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
    if (!this.newPasswordInput || this.newPasswordInput.trim().length < 8) {
      this.changePasswordError = 'Password must be at least 8 characters long.';
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/.test(this.newPasswordInput.trim())) {
      this.changePasswordError = 'Password must contain at least 1 alphabet, 1 number, and 1 special character.';
      return;
    }
    if (this.newPasswordInput !== this.confirmPasswordInput) {
      this.changePasswordError = 'New password and confirmation password do not match.';
      return;
    }

    const targetUser = this.changePasswordUser;
    if (!targetUser) return;

    this.isChangingPassword = true;
    this.changePasswordError = '';

    try {
      const res: any = await firstValueFrom(this.userService.updateUser({
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        phone: targetUser.phone,
        password: this.newPasswordInput.trim()
      }));

      if (!res || !res.ok) {
        this.changePasswordError = res?.msg || 'Failed to update password. Please try again.';
        this.isChangingPassword = false;
        return;
      }

      this.changePasswordSuccess = res?.msg || `Password for ${targetUser.name} updated successfully!`;
      setTimeout(() => {
        this.closeChangePasswordModal();
      }, 1000);
    } catch (e: any) {
      this.changePasswordError = e?.message || 'Failed to update password. Please try again.';
    } finally {
      this.isChangingPassword = false;
    }
  }
}
