import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { student, Session, Course, Semester, Country, State, District, City } from 'src/app/interfaces';
import { StudentService, DefaultService } from 'src/app/api';
import { firstValueFrom } from 'rxjs';

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

  // LOADING & VALIDATION STATES
  isLoading = false;
  isSaving = false;
  formErrors: { [key: string]: string } = {};

  // MODAL STATES
  isViewModalOpen = false;
  isAddEditModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  
  // DYNAMIC MODAL TAB CONTROL
  activeFormTab: 'basic' | 'academic' | 'parent' = 'basic';
  activeViewTab: 'basic' | 'academic' | 'parent' = 'basic';

  selectedStudent: student | null = null;

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

  // FULL STUDENT FORM DATA
  formData: student = this.createEmptyStudent();

  constructor(
    private studentApiService: StudentService,
    private defaultService: DefaultService
  ) { }

  ngOnInit() {
    this.loadInitialDynamicData();
  }

  // =========================================================================
  // PURE DYNAMIC OPENAPI DATA LOADING
  // =========================================================================
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
        this.fetchStudentsList()
      ]);
    } catch (e) {
      console.error('Error loading dynamic OpenAPI data:', e);
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

  async fetchStudentsList() {
    try {
      const res: any = await firstValueFrom(this.studentApiService.studentControllerGetAll());
      if (res) {
        this.studentsList = Array.isArray(res) ? res : (res.data || res.result || res.students || []);
      }
    } catch (e) {
      console.error('Error fetching students:', e);
    }
  }

  async fetchNextRollNo(): Promise<string> {
    try {
      const res: any = await firstValueFrom(this.studentApiService.studentControllerGetNextRollNo());
      if (res && res.rollNo) return res.rollNo;
    } catch (e) {
      console.error('Error fetching next roll no:', e);
    }
    const count = this.studentsList.length + 1;
    const pad = count < 10 ? `00${count}` : count < 100 ? `0${count}` : `${count}`;
    return `ST-2026-${pad}`;
  }

  createEmptyStudent(): student {
    return {
      roll_no: 'Auto-Generating...',
      name: '',
      email: '',
      password: '',
      phone: '',
      dob: '',
      gender: 'Male',
      blood_group: 'O+',
      session_id: this.sessions[0]?.id || '',
      course_id: this.courses[0]?.id || '',
      semester_id: this.semesters[0]?.id || '',
      father_name: '',
      father_mob_no: '',
      mother_name: '',
      other_mob_no: '',
      status: true
    };
  }

  // =========================================================================
  // STEPPER NAVIGATION & BACKEND VALIDATIONS
  // =========================================================================
  validateCurrentStep(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (this.activeFormTab === 'basic') {
      if (!this.formData.name || !this.formData.name.trim()) {
        this.formErrors['name'] = 'Full Name is required.';
        isValid = false;
      }
      if (!this.formData.email || !this.formData.email.trim() || !this.formData.email.includes('@')) {
        this.formErrors['email'] = 'Valid Email Address is required.';
        isValid = false;
      }
      if (!this.formData.password || !this.formData.password.trim()) {
        this.formErrors['password'] = 'Password is required.';
        isValid = false;
      }
      if (!this.formData.phone || !this.formData.phone.trim()) {
        this.formErrors['phone'] = 'Phone Number is required.';
        isValid = false;
      }
      if (!this.formData.dob) {
        this.formErrors['dob'] = 'Date of Birth is required.';
        isValid = false;
      }
      if (!this.formData.gender) {
        this.formErrors['gender'] = 'Gender selection is required.';
        isValid = false;
      }
      if (!this.formData.blood_group) {
        this.formErrors['blood_group'] = 'Blood group is required.';
        isValid = false;
      }
    } else if (this.activeFormTab === 'academic') {
      if (!this.formData.session_id) {
        this.formErrors['session_id'] = 'Academic Session is required.';
        isValid = false;
      }
      if (!this.formData.course_id) {
        this.formErrors['course_id'] = 'Course Program is required.';
        isValid = false;
      }
      if (!this.formData.semester_id) {
        this.formErrors['semester_id'] = 'Semester selection is required.';
        isValid = false;
      }
    } else if (this.activeFormTab === 'parent') {
      if (!this.formData.father_name || !this.formData.father_name.trim()) {
        this.formErrors['father_name'] = "Father's Name is required.";
        isValid = false;
      }
      if (!this.formData.father_mob_no || !this.formData.father_mob_no.trim()) {
        this.formErrors['father_mob_no'] = "Father's Mobile Number is required.";
        isValid = false;
      }
      if (!this.formData.mother_name || !this.formData.mother_name.trim()) {
        this.formErrors['mother_name'] = "Mother's Name is required.";
        isValid = false;
      }
    }

    return isValid;
  }

  goToNextStep() {
    if (!this.validateCurrentStep()) {
      return;
    }

    if (this.activeFormTab === 'basic') {
      this.activeFormTab = 'academic';
    } else if (this.activeFormTab === 'academic') {
      this.activeFormTab = 'parent';
    }
  }

  goToPreviousStep() {
    if (this.activeFormTab === 'parent') {
      this.activeFormTab = 'academic';
    } else if (this.activeFormTab === 'academic') {
      this.activeFormTab = 'basic';
    }
  }

  selectFormTab(tab: 'basic' | 'academic' | 'parent') {
    if (this.validateCurrentStep()) {
      this.activeFormTab = tab;
    }
  }

  // FILTERED STUDENTS FOR DIRECTORY TABLE
  getFilteredStudents(): student[] {
    return this.studentsList.filter(s => {
      const q = this.searchText.toLowerCase().trim();
      const courseName = this.getCourseName(s.course_id).toLowerCase();
      
      const matchesSearch = !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.roll_no && s.roll_no.toString().toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q)) ||
        (s.father_name && s.father_name.toLowerCase().includes(q)) ||
        courseName.includes(q);

      const statusBool = Boolean(s.status);
      const matchesStatus = this.statusFilter === 'All' ||
        (this.statusFilter === 'Active' && statusBool) ||
        (this.statusFilter === 'Suspended' && !statusBool);

      return matchesSearch && matchesStatus;
    });
  }

  // STAT COUNTERS
  getActiveCount(): number {
    return this.studentsList.filter(s => Boolean(s.status)).length;
  }

  getSuspendedCount(): number {
    return this.studentsList.filter(s => !Boolean(s.status)).length;
  }

  // DYNAMIC LOOKUP HELPERS
  getCourseName(courseId: any): string {
    const found = this.courses.find(c => Number(c.id) === Number(courseId));
    return found ? (found.course_name || found.short_name) : '-';
  }

  getSemesterName(semId: any): string {
    const found = this.semesters.find(s => Number(s.id) === Number(semId));
    return found ? (found.semester_name || found.short_name) : '-';
  }

  // VIEW MODAL
  openViewModal(std: student) {
    this.selectedStudent = std;
    this.activeViewTab = 'basic';
    this.isViewModalOpen = true;
  }

  closeViewModal() {
    this.isViewModalOpen = false;
    this.selectedStudent = null;
  }

  // ADD / EDIT MODALS
  async openAddModal() {
    this.modalMode = 'add';
    this.activeFormTab = 'basic';
    this.formErrors = {};
    this.formData = this.createEmptyStudent();
    
    // Auto-generate Roll No
    const autoRoll = await this.fetchNextRollNo();
    this.formData.roll_no = autoRoll;

    this.isAddEditModalOpen = true;
  }

  openEditModal(std: student) {
    this.modalMode = 'edit';
    this.activeFormTab = 'basic';
    this.formErrors = {};
    this.selectedStudent = std;
    this.formData = { ...std };
    this.isAddEditModalOpen = true;
  }

  closeAddEditModal() {
    this.isAddEditModalOpen = false;
    this.selectedStudent = null;
    this.formErrors = {};
  }

  // SAVE STUDENT TO DATABASE VIA OPENAPI GENERATED STUDENT SERVICE
  async saveStudent() {
    if (!this.validateCurrentStep()) {
      return;
    }

    this.isSaving = true;

    try {
      if (this.modalMode === 'add') {
        const res: any = await firstValueFrom(this.studentApiService.studentControllerQuickAdd({
          name: this.formData.name || '',
          email: this.formData.email || '',
          phone: this.formData.phone
        }));
        console.log('OpenAPI Student Add Response:', res);
      } else if (this.modalMode === 'edit' && this.selectedStudent) {
        const res: any = await firstValueFrom(this.studentApiService.studentControllerUpdate());
        console.log('OpenAPI Student Update Response:', res);
      }

      // Re-fetch dynamic student list from OpenAPI Student Service
      await this.fetchStudentsList();
    } catch (e) {
      console.error('Error saving student via OpenAPI Student API:', e);
    } finally {
      this.isSaving = false;
      this.closeAddEditModal();
    }
  }

  // TOGGLE STATUS VIA OPENAPI API
  async toggleStudentStatus(std: student) {
    const currentStatus = Boolean(std.status);
    const newStatus = !currentStatus;
    const actionText = newStatus ? 'activate' : 'suspend';

    if (confirm(`Are you sure you want to ${actionText} ${std.name}?`)) {
      std.status = newStatus;
      await firstValueFrom(this.studentApiService.studentControllerUpdate());
      await this.fetchStudentsList();
    }
  }

  getInitials(name?: string): string {
    if (!name) return 'ST';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
