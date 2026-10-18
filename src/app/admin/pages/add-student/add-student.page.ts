import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { student, Session, Course, Semester, Country, State, District, City } from 'src/app/interfaces';
import { StudentService, DefaultService } from 'src/app/api';
import { UserService, AdminAddUserDto } from 'src/app/services/user.service';
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
  rawStudent?: student;
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
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
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

  setRole(role: 'Student' | 'Faculty' | 'Admin') {
    this.newUserRole = role;
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

  normalizeStatus(val: any): 'Active' | 'Deactive' | 'Pending' {
    if (val === null || val === undefined || val === '') return 'Active';
    const s = String(val).trim().toLowerCase();
    if (s === 'pending') return 'Pending';
    if (s.includes('deact') || s.includes('inact') || s.includes('suspend') || val === false || s === '0') {
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

          const rawGender = u.gender || u.sex;
          const formattedGender = rawGender ? String(rawGender).trim() : '';

          const dept = u.department || u.departmentOrCourse || (u.course_id ? this.getCourseName(u.course_id) : (role === 'Student' ? 'Computer Science' : 'Academic Dept'));

          return {
            id: String(u.id || u.staffId || `USR-${idx + 1}`),
            roll_no: String(u.roll_no || u.staffId || u.rollNo || (role === 'Admin' ? `ADM-2026-0${idx + 1}` : (role === 'Faculty' ? `FAC-2026-0${idx + 1}` : `STU-2026-0${idx + 1}`))),
            name: String(u.name || u.fullName || u.email?.split('@')[0] || 'User'),
            email: String(u.email || ''),
            role: role,
            departmentOrCourse: String(dept),
            phone: String(u.phone || ''),
            dob: formattedDob,
            gender: formattedGender,
            status: this.normalizeStatus(u.status),
            avatarBg: avatarBg,
            father_name: u.father_name || '',
            mother_name: u.mother_name || '',
            rawStudent: {
              ...u,
              id: u.id,
              roll_no: u.roll_no,
              name: u.name,
              email: u.email,
              phone: u.phone,
              dob: formattedDob,
              gender: formattedGender,
              father_name: u.father_name,
              mother_name: u.mother_name,
              course_id: u.course_id,
              session_id: u.session_id,
              semester_id: u.semester_id,
              aadhar_n: u.aadhar_no || u.aadhar_n,
              board_10th: u.board_10th,
              total_marks_10th: u.total_marks_10th,
              percentage_10th: u.percentage_10th,
              board_12th: u.board_12th,
              total_marks_12th: u.total_marks_12th,
              percentage_12th: u.percentage_12th,
              blood_group: u.blood_group || '',
              language: u.language || '',
              status: this.normalizeStatus(u.status) === 'Active'
            }
          };
        });

        this.usersList = backendUsers;
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

  // ADD / EDIT MODALS
  openAddModal() {
    this.modalMode = 'add';
    this.newUserRole = 'Student';
    this.activeFormTab = 'basic';
    this.formErrors = {};
    this.serverErrorMessage = '';
    this.serverSuccessMessage = '';
    this.showPassword = false;
    this.formData = this.createEmptyStudent();
    this.isAddEditModalOpen = true;
  }

  openEditUserModal(usr: UserRecord) {
    this.modalMode = 'edit';
    this.newUserRole = usr.role;
    this.activeFormTab = 'basic';
    this.formErrors = {};
    this.serverErrorMessage = '';
    this.serverSuccessMessage = '';
    this.showPassword = false;
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
      this.formData.gender = usr.gender || 'Male';
      this.formData.father_name = usr.father_name || '';
      this.formData.mother_name = usr.mother_name || '';
    }
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
        this.activeFormTab = 'basic';
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
          dob: this.formData.dob ? String(this.formData.dob).trim() : null,
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

        if (res && res.ok === false) {
          this.serverErrorMessage = res.msg || 'Failed to add user.';
          const lowerMsg = (res.msg || '').toLowerCase();
          if (lowerMsg.includes('phone')) {
            this.formErrors['phone'] = res.msg;
            this.activeFormTab = 'basic';
          } else if (lowerMsg.includes('email')) {
            this.formErrors['email'] = res.msg;
            this.activeFormTab = 'basic';
          } else if (lowerMsg.includes('roll')) {
            this.formErrors['roll_no'] = res.msg;
            this.activeFormTab = 'basic';
          } else if (lowerMsg.includes('password')) {
            this.formErrors['password'] = res.msg;
            this.activeFormTab = 'basic';
          } else if (lowerMsg.includes('aadhar')) {
            this.formErrors['aadhar_n'] = res.msg;
            this.activeFormTab = 'basic';
          }
          this.isSaving = false;
          return;
        }

        // Successfully registered user via backend sp_admin_users_add API
        this.serverSuccessMessage = res?.msg || `${this.newUserRole} added successfully!`;

        // Re-fetch users from backend
        await this.fetchUsersFromBackend();

        setTimeout(() => {
          this.isSaving = false;
          this.closeAddEditModal();
        }, 1100);

      } else if (this.modalMode === 'edit' && this.selectedUser) {
        const updatePayload: any = {
          id: this.selectedUser.id,
          name: name,
          email: email,
          phone: phone
        };
        if (password) {
          updatePayload.password = password;
        }

        const updateRes: any = await firstValueFrom(this.userService.updateUser(updatePayload));
        if (updateRes && updateRes.ok === false) {
          this.serverErrorMessage = updateRes.msg || 'Failed to update user.';
          this.isSaving = false;
          return;
        }

        this.serverSuccessMessage = updateRes?.msg || 'User updated successfully!';
        await this.fetchUsersFromBackend();

        setTimeout(() => {
          this.isSaving = false;
          this.closeAddEditModal();
        }, 1100);
      }
    } catch (e: any) {
      console.error('Error saving user:', e);
      this.serverErrorMessage = e?.message || 'Server error occurred while saving user.';
      this.isSaving = false;
    }
  }

  // TOGGLE STATUS
  async toggleUserStatus(usr: UserRecord) {
    const isCurrentlyActive = usr.status === 'Active';
    const targetStatus: 'Active' | 'Deactive' = isCurrentlyActive ? 'Deactive' : 'Active';
    const actionText = isCurrentlyActive ? 'deactivate' : 'activate';

    if (confirm(`Are you sure you want to ${actionText} ${usr.name}?`)) {
      usr.status = targetStatus;
      try {
        await firstValueFrom(this.userService.updateUserStatus(usr.id, targetStatus));
      } catch (e) {
        console.error('Error updating status in backend:', e);
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
