import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';
import { SubjectService } from 'src/app/services/subject.service';
import { ChapterService } from 'src/app/services/chapter.service';
import { SyllabusService, SyllabusPayload } from 'src/app/services/syllabus.service';

@Component({
  selector: 'app-academic',
  templateUrl: './academic.page.html',
  styleUrls: ['./academic.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AcademicPage implements OnInit {
  
  // ACTIVE TAB SELECTION
  activeTab = 'session';
  searchText = '';
  isLoading = false;
  isSaving = false;

  // MODAL STATES
  isAddEditModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  editingItemId: number | null = null;

  // PDF UPLOAD STATE & VALIDATION
  selectedPdfFile: File | null = null;
  pdfUploadError = '';
  pdfPreviewUrl: string | null = null;
  isDraggingPdf = false;

  // PDF VIEWER MODAL STATE
  isPdfViewerModalOpen = false;
  activePdfItem: any = null;
  pdfViewerLoading = false;
  pdfViewerError = '';
  currentPdfRawUrl: string | null = null;
  currentPdfSafeUrl: SafeResourceUrl | null = null;

  // FORM INPUT MODEL
  formData: any = {
    id: null,
    sessionName: '',
    shortName: '',
    courseName: '',
    semesterName: '',
    syllabusTitle: '',
    syllabus_name: '',
    syllabus: '',
    syllabus_pdf: '',
    subjectName: '',
    subjectCode: '',
    chapterName: '',
    chapterNo: '',
    session_id: '',
    course_id: '',
    semester_id: '',
    subject_id: ''
  };

  formErrors: { [key: string]: string } = {};

  // 1. SESSIONS LIST
  sessionsList: any[] = [];

  // 2. COURSES LIST
  coursesList: any[] = [];

  // 3. SEMESTERS LIST
  semestersList: any[] = [];

  // 4. SYLLABUS LIST
  syllabiList: any[] = [];

  // 5. SUBJECTS LIST
  subjectsList: any[] = [];

  // 6. CHAPTERS LIST
  chaptersList: any[] = [];

  private baseUrl = environment.api_url || 'http://localhost:3001';

  constructor(
    private http: HttpClient,
    private subjectService: SubjectService,
    private chapterService: ChapterService,
    private syllabusService: SyllabusService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.loadAllDynamicData();
  }

  async loadAllDynamicData() {
    this.isLoading = true;
    try {
      await Promise.all([
        this.fetchSessions(),
        this.fetchCourses(),
        this.fetchSemesters(),
        this.fetchSyllabi(),
        this.fetchSubjects(),
        this.fetchChapters()
      ]);
    } catch (e) {
      console.error('Error loading academic data:', e);
    } finally {
      this.isLoading = false;
    }
  }

  // 1. FETCH SESSIONS
  async fetchSessions() {
    try {
      const res: any = await firstValueFrom(this.http.post(`${this.baseUrl}/session/getall`, {}));
      const list = Array.isArray(res) ? res : (res?.data || res?.result || res?.sessions || []);
      if (list && list.length > 0) {
        this.sessionsList = list.map((item: any) => ({
          id: item.id,
          sessionName: item.session_name || item.sessionName || item.name,
          shortName: item.short_name || item.shortName || 'AY',
          is_active: item.is_active ?? 1,
          timestamp: item.timestamp || item.created_at || new Date().toISOString().slice(0, 10)
        }));
      } else if (this.sessionsList.length === 0) {
        this.sessionsList = [
          { id: 1, sessionName: '2024-2025 Academic Year', shortName: 'AY2024-25', is_active: 1, timestamp: '2024-08-01' },
          { id: 2, sessionName: '2025-2026 Academic Year', shortName: 'AY2025-26', is_active: 1, timestamp: '2025-08-01' }
        ];
      }
    } catch (e) {
      console.warn('Backend /session/getall fallback:', e);
      if (this.sessionsList.length === 0) {
        this.sessionsList = [
          { id: 1, sessionName: '2024-2025 Academic Year', shortName: 'AY2024-25', is_active: 1, timestamp: '2024-08-01' },
          { id: 2, sessionName: '2025-2026 Academic Year', shortName: 'AY2025-26', is_active: 1, timestamp: '2025-08-01' }
        ];
      }
    }
  }

  // 2. FETCH COURSES
  async fetchCourses() {
    try {
      const res: any = await firstValueFrom(this.http.post(`${this.baseUrl}/course/getall`, {}));
      const list = Array.isArray(res) ? res : (res?.data || res?.result || res?.courses || []);
      if (list && list.length > 0) {
        this.coursesList = list.map((item: any) => ({
          id: item.id,
          session_id: item.session_id,
          session: this.getSessionName(item.session_id),
          courseName: item.course_name || item.courseName || item.title,
          shortName: item.short_name || item.shortName || 'CRS',
          timestamp: item.timestamp || item.created_at || new Date().toISOString().slice(0, 10)
        }));
      } else if (this.coursesList.length === 0) {
        this.coursesList = [
          { id: 1, session_id: 1, session: '2024-2025 Academic Year', courseName: 'B.Tech Computer Science', shortName: 'B.TECH CSE', timestamp: '2024-08-10' },
          { id: 2, session_id: 1, session: '2024-2025 Academic Year', courseName: 'B.Sc Data Science & AI', shortName: 'BSC DS&AI', timestamp: '2024-08-12' },
          { id: 3, session_id: 2, session: '2025-2026 Academic Year', courseName: 'M.Tech Software Engineering', shortName: 'M.TECH SE', timestamp: '2025-08-01' }
        ];
      }
    } catch (e) {
      console.warn('Backend /course/getall fallback:', e);
      if (this.coursesList.length === 0) {
        this.coursesList = [
          { id: 1, session_id: 1, session: '2024-2025 Academic Year', courseName: 'B.Tech Computer Science', shortName: 'B.TECH CSE', timestamp: '2024-08-10' },
          { id: 2, session_id: 1, session: '2024-2025 Academic Year', courseName: 'B.Sc Data Science & AI', shortName: 'BSC DS&AI', timestamp: '2024-08-12' }
        ];
      }
    }
  }

  // 3. FETCH SEMESTERS
  async fetchSemesters() {
    try {
      const res: any = await firstValueFrom(this.http.post(`${this.baseUrl}/semester/getall`, {}));
      const list = Array.isArray(res) ? res : (res?.data || res?.result || res?.semesters || []);
      if (list && list.length > 0) {
        this.semestersList = list.map((item: any) => ({
          id: item.id,
          course_id: item.course_id,
          session: this.getSessionName(item.session_id),
          course: this.getCourseName(item.course_id),
          semesterName: item.semester_name || item.semesterName || item.name,
          shortName: item.short_name || item.shortName || 'SEM',
          timestamp: item.timestamp || item.created_at || new Date().toISOString().slice(0, 10)
        }));
      } else if (this.semestersList.length === 0) {
        this.semestersList = [
          { id: 1, course_id: 1, session: '2024-2025 Academic Year', course: 'B.Tech Computer Science', semesterName: 'Semester 1', shortName: 'SEM-1', timestamp: '2024-08-15' },
          { id: 2, course_id: 1, session: '2024-2025 Academic Year', course: 'B.Tech Computer Science', semesterName: 'Semester 2', shortName: 'SEM-2', timestamp: '2024-08-15' },
          { id: 3, course_id: 2, session: '2024-2025 Academic Year', course: 'B.Sc Data Science & AI', semesterName: 'Semester 1', shortName: 'SEM-1', timestamp: '2024-08-20' }
        ];
      }
    } catch (e) {
      console.warn('Backend /semester/getall fallback:', e);
      if (this.semestersList.length === 0) {
        this.semestersList = [
          { id: 1, course_id: 1, session: '2024-2025 Academic Year', course: 'B.Tech Computer Science', semesterName: 'Semester 1', shortName: 'SEM-1', timestamp: '2024-08-15' },
          { id: 2, course_id: 1, session: '2024-2025 Academic Year', course: 'B.Tech Computer Science', semesterName: 'Semester 2', shortName: 'SEM-2', timestamp: '2024-08-15' }
        ];
      }
    }
  }

  // 4. FETCH SYLLABI
  async fetchSyllabi() {
    try {
      const list = await firstValueFrom(this.syllabusService.getAllSyllabi());
      if (Array.isArray(list) && list.length > 0) {
        this.syllabiList = list.map((item: any) => ({
          id: item.id,
          course_id: item.course_id,
          semester_id: item.semester_id,
          session: this.getSessionName(item.session_id || this.getCourseSessionId(item.course_id)),
          course: item.course_name || this.getCourseName(item.course_id),
          semester: item.semester_name || this.getSemesterName(item.semester_id),
          syllabus_name: item.syllabus_name || item.syllabus_title || item.title || item.syllabusTitle || '',
          syllabus: item.syllabus || '',
          syllabus_pdf: item.syllabus_pdf || '',
          is_active: item.is_active !== undefined ? Number(item.is_active) : 1,
          syllabusTitle: item.syllabus_name || item.syllabus_title || item.title || item.syllabusTitle || '',
          timestamp: item.timestamp || item.created_at || new Date().toISOString().slice(0, 10)
        }));
      } else {
        this.syllabiList = [];
      }
    } catch (e) {
      console.warn('Backend /syllabus/getall error:', e);
      this.syllabiList = [];
    }
  }

  // 5. FETCH SUBJECTS
  async fetchSubjects() {
    try {
      const list = await firstValueFrom(this.subjectService.getAllSubjects());
      if (list && list.length > 0) {
        this.subjectsList = list.map((item: any) => ({
          id: item.id,
          course_id: item.course_id,
          semester_id: item.semester_id,
          session: this.getSessionName(item.session_id || this.getCourseSessionId(item.course_id)),
          course: this.getCourseName(item.course_id),
          semester: this.getSemesterName(item.semester_id),
          subjectName: item.subject_name || item.subjectName || item.name,
          subjectCode: item.subject_code || item.subjectCode || item.code || '',
          shortName: item.short_name || item.shortName || '',
          timestamp: item.timestamp || item.created_at || new Date().toISOString().slice(0, 10)
        }));
      } else {
        this.subjectsList = [];
      }
    } catch (e) {
      console.warn('Backend subjects fetch error:', e);
    }
  }

  // 6. FETCH CHAPTERS
  async fetchChapters() {
    try {
      const list = await firstValueFrom(this.chapterService.getAllChapters());
      if (list && list.length > 0) {
        this.chaptersList = list.map((item: any, idx: number) => {
          const matchedSub = this.subjectsList.find(s => Number(s.id) === Number(item.subject_id));
          const courseId = item.course_id || matchedSub?.course_id;
          const semesterId = item.semester_id || matchedSub?.semester_id;
          return {
            id: item.id,
            subject_id: item.subject_id,
            course_id: courseId,
            semester_id: semesterId,
            session: this.getSessionName(item.session_id || this.getCourseSessionId(courseId)),
            course: this.getCourseName(courseId),
            semester: this.getSemesterName(semesterId),
            subject: this.getSubjectName(item.subject_id),
            chapterNo: item.chapter_no || item.chapterNo || String(idx + 1),
            chapterName: item.chapter_name || item.chapterName || item.title,
            shortName: item.short_name || item.shortName || '',
            timestamp: item.timestamp || item.created_at || new Date().toISOString().slice(0, 10)
          };
        });
      } else {
        this.chaptersList = [];
      }
    } catch (e) {
      console.warn('Backend chapters fetch error:', e);
    }
  }

  getCourseSessionId(courseId: any): any {
    const found = this.coursesList.find(c => Number(c.id) === Number(courseId));
    return found?.session_id || null;
  }

  // LOOKUP HELPERS
  getSessionName(sessionId: any): string {
    const found = this.sessionsList.find(s => Number(s.id) === Number(sessionId));
    return found ? found.sessionName : 'Session';
  }

  getCourseName(courseId: any): string {
    const found = this.coursesList.find(c => Number(c.id) === Number(courseId));
    return found ? (found.courseName || found.shortName) : 'Course';
  }

  getSemesterName(semesterId: any): string {
    const found = this.semestersList.find(s => Number(s.id) === Number(semesterId));
    return found ? (found.semesterName || found.shortName) : 'Semester';
  }

  getSubjectName(subjectId: any): string {
    const found = this.subjectsList.find(s => Number(s.id) === Number(subjectId));
    return found ? (found.subjectName || found.subjectCode) : 'Subject';
  }

  // SWITCH TABS
  selectTab(tab: string) {
    this.activeTab = tab;
    this.searchText = '';
  }

  // GET FILTERED ITEMS BASED ON SEARCH
  getFilteredItems(): any[] {
    const query = this.searchText.toLowerCase().trim();
    if (this.activeTab === 'session') {
      return this.sessionsList.filter(s => !query || (s.sessionName && s.sessionName.toLowerCase().includes(query)) || (s.shortName && s.shortName.toLowerCase().includes(query)));
    } else if (this.activeTab === 'course') {
      return this.coursesList.filter(c => !query || (c.courseName && c.courseName.toLowerCase().includes(query)) || (c.shortName && c.shortName.toLowerCase().includes(query)));
    } else if (this.activeTab === 'semester') {
      return this.semestersList.filter(s => !query || (s.semesterName && s.semesterName.toLowerCase().includes(query)) || (s.course && s.course.toLowerCase().includes(query)));
    } else if (this.activeTab === 'syllabus') {
      return this.syllabiList.filter(s =>
        !query ||
        (s.syllabus_name && s.syllabus_name.toLowerCase().includes(query)) ||
        (s.syllabus && s.syllabus.toLowerCase().includes(query)) ||
        (s.syllabusTitle && s.syllabusTitle.toLowerCase().includes(query)) ||
        (s.course && s.course.toLowerCase().includes(query)) ||
        (s.semester && s.semester.toLowerCase().includes(query))
      );
    } else if (this.activeTab === 'subject') {
      return this.subjectsList.filter(s => !query || (s.subjectName && s.subjectName.toLowerCase().includes(query)) || (s.subjectCode && s.subjectCode.toLowerCase().includes(query)));
    } else if (this.activeTab === 'chapter') {
      return this.chaptersList.filter(c => !query || (c.chapterName && c.chapterName.toLowerCase().includes(query)));
    }
    return [];
  }

  // OPEN ADD MODAL
  openAddModal() {
    this.modalMode = 'add';
    this.editingItemId = null;
    this.resetFormData();
    this.clearPdfUploadState();
    this.formErrors = {};
    if (this.activeTab === 'syllabus') {
      this.fetchCourses();
      this.fetchSemesters();
    }
    this.isAddEditModalOpen = true;
  }

  // OPEN EDIT MODAL
  openEditModal(item: any) {
    this.modalMode = 'edit';
    this.editingItemId = item.id;
    this.formData = {
      ...item,
      id: item.id,
      session_id: item.session_id || '',
      course_id: item.course_id !== undefined && item.course_id !== null ? item.course_id : '',
      semester_id: item.semester_id !== undefined && item.semester_id !== null ? item.semester_id : '',
      subject_id: item.subject_id || '',
      subjectName: item.subjectName || item.subject_name || '',
      subjectCode: item.subjectCode || item.subject_code || '',
      shortName: item.shortName || item.short_name || '',
      chapterName: item.chapterName || item.chapter_name || '',
      chapterNo: item.chapterNo || item.chapter_no || '',
      syllabus_name: item.syllabus_name || item.syllabusTitle || item.title || '',
      syllabus: item.syllabus || '',
      syllabus_pdf: item.syllabus_pdf || '',
      syllabusTitle: item.syllabus_name || item.syllabusTitle || item.title || '',
      semesterName: item.semesterName || '',
      courseName: item.courseName || '',
      sessionName: item.sessionName || ''
    };
    this.clearPdfUploadState();
    this.formErrors = {};
    this.isAddEditModalOpen = true;
  }

  closeModal() {
    this.isAddEditModalOpen = false;
    this.clearPdfUploadState();
    this.formErrors = {};
    this.resetFormData();
  }

  resetFormData() {
    this.formData = {
      id: null,
      sessionName: '',
      shortName: '',
      courseName: '',
      semesterName: '',
      syllabusTitle: '',
      syllabus_name: '',
      syllabus: '',
      syllabus_pdf: '',
      subjectName: '',
      subjectCode: '',
      chapterName: '',
      chapterNo: '',
      session_id: '',
      course_id: '',
      semester_id: '',
      subject_id: ''
    };
    this.clearPdfUploadState();
    this.formErrors = {};
  }

  // PDF UPLOAD & VALIDATION HANDLERS
  onPdfFileSelected(event: any) {
    const file = event?.target?.files?.[0];
    if (file) {
      this.handlePdfFile(file);
    }
  }

  onPdfDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingPdf = true;
  }

  onPdfDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingPdf = false;
  }

  onPdfDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingPdf = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handlePdfFile(event.dataTransfer.files[0]);
    }
  }

  handlePdfFile(file: File) {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      this.pdfUploadError = 'Only PDF documents (.pdf) are allowed.';
      this.formErrors['syllabus_pdf'] = this.pdfUploadError;
      this.selectedPdfFile = null;
      this.formData.syllabus_pdf = '';
      return;
    }

    // 10 MB maximum size validation
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      this.pdfUploadError = `PDF file size exceeds 10 MB limit (${sizeMb} MB).`;
      this.formErrors['syllabus_pdf'] = this.pdfUploadError;
      this.selectedPdfFile = null;
      return;
    }

    if (file.name.length > 250) {
      this.pdfUploadError = 'File name is too long (maximum 250 characters).';
      this.formErrors['syllabus_pdf'] = this.pdfUploadError;
      this.selectedPdfFile = null;
      return;
    }

    // File passed all validations
    this.pdfUploadError = '';
    delete this.formErrors['syllabus_pdf'];
    this.selectedPdfFile = file;
    this.formData.syllabus_pdf = file.name;

    if (this.pdfPreviewUrl) {
      URL.revokeObjectURL(this.pdfPreviewUrl);
    }
    this.pdfPreviewUrl = URL.createObjectURL(file);
    // Cache immediately in local IndexedDB storage
    this.savePdfToStorage(file.name, file);
  }

  // INDEXEDDB STORAGE HELPERS FOR PERSISTENT PDF VIEWING
  private openPdfDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject('IndexedDB is not supported');
      }
      const request = window.indexedDB.open('lms_syllabus_db', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('syllabus_pdfs')) {
          db.createObjectStore('syllabus_pdfs');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async savePdfToStorage(key: string, file: Blob): Promise<void> {
    if (!key || !file) return;
    try {
      const db = await this.openPdfDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('syllabus_pdfs', 'readwrite');
        const store = tx.objectStore('syllabus_pdfs');
        store.put(file, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('IndexedDB savePdfToStorage error:', e);
    }
  }

  async getPdfFromStorage(key: string): Promise<Blob | null> {
    if (!key) return null;
    try {
      const db = await this.openPdfDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('syllabus_pdfs', 'readonly');
        const store = tx.objectStore('syllabus_pdfs');
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('IndexedDB getPdfFromStorage error:', e);
      return null;
    }
  }

  removeSelectedPdf() {
    this.clearPdfUploadState();
    this.formData.syllabus_pdf = '';
  }

  clearPdfUploadState() {
    if (this.pdfPreviewUrl) {
      URL.revokeObjectURL(this.pdfPreviewUrl);
      this.pdfPreviewUrl = null;
    }
    this.selectedPdfFile = null;
    this.pdfUploadError = '';
    this.isDraggingPdf = false;
    if (this.formErrors['syllabus_pdf']) {
      delete this.formErrors['syllabus_pdf'];
    }
  }

  formatFileSize(bytes?: number): string {
    if (!bytes || isNaN(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  getPdfDisplayName(pathOrName?: string): string {
    if (!pathOrName) return 'Syllabus.pdf';
    const clean = pathOrName.split(/[\\/]/).pop() || pathOrName;
    return clean;
  }

  // OPEN INTERACTIVE PDF VIEWER MODAL
  async openPdfViewerModal(item?: any) {
    const currentItem = item ? { ...item } : {
      syllabus_name: this.formData.syllabus_name || 'Syllabus Document',
      course: this.getCourseName(this.formData.course_id),
      semester: this.getSemesterName(this.formData.semester_id),
      syllabus_pdf: this.formData.syllabus_pdf,
      syllabus: this.formData.syllabus
    };

    this.activePdfItem = currentItem;
    this.isPdfViewerModalOpen = true;
    this.pdfViewerLoading = true;
    this.pdfViewerError = '';
    this.currentPdfRawUrl = null;
    this.currentPdfSafeUrl = null;

    const pdfRef = currentItem.syllabus_pdf;

    // 1. If currently selected file in memory matches
    if (this.selectedPdfFile && (!pdfRef || pdfRef === this.selectedPdfFile.name || pdfRef === this.formData.syllabus_pdf)) {
      if (!this.pdfPreviewUrl) {
        this.pdfPreviewUrl = URL.createObjectURL(this.selectedPdfFile);
      }
      this.currentPdfRawUrl = this.pdfPreviewUrl;
      this.currentPdfSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfPreviewUrl);
      this.pdfViewerLoading = false;
      return;
    }

    // 2. Check IndexedDB by filename or syllabus id
    if (pdfRef) {
      const cachedBlob = await this.getPdfFromStorage(pdfRef);
      if (cachedBlob) {
        const blobUrl = URL.createObjectURL(cachedBlob);
        this.currentPdfRawUrl = blobUrl;
        this.currentPdfSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
        this.pdfViewerLoading = false;
        return;
      }
      if (currentItem.id) {
        const cachedById = await this.getPdfFromStorage(String(currentItem.id));
        if (cachedById) {
          const blobUrl = URL.createObjectURL(cachedById);
          this.currentPdfRawUrl = blobUrl;
          this.currentPdfSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
          this.pdfViewerLoading = false;
          return;
        }
      }
    }

    // 3. Direct external URL or Blob or Data URI
    if (pdfRef && (pdfRef.startsWith('http://') || pdfRef.startsWith('https://') || pdfRef.startsWith('blob:') || pdfRef.startsWith('data:'))) {
      this.currentPdfRawUrl = pdfRef;
      this.currentPdfSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfRef);
      this.pdfViewerLoading = false;
      return;
    }

    // 4. Try backend URL
    if (pdfRef) {
      const backendUrl = `${this.baseUrl}/${pdfRef}`;
      try {
        const resp = await fetch(backendUrl, { method: 'HEAD' });
        if (resp.ok) {
          this.currentPdfRawUrl = backendUrl;
          this.currentPdfSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(backendUrl);
          this.pdfViewerLoading = false;
          return;
        }
      } catch (e) {
        // file not served on backend
      }
    }

    // 5. Binary not in storage or server; prompt user to select from device
    this.pdfViewerLoading = false;
  }

  closePdfViewerModal() {
    this.isPdfViewerModalOpen = false;
    this.activePdfItem = null;
    this.currentPdfSafeUrl = null;
    this.currentPdfRawUrl = null;
    this.pdfViewerLoading = false;
  }

  async onAttachPdfToActiveItem(event: any) {
    const file = event.target?.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please choose a valid PDF (.pdf) file.');
      return;
    }

    // Cache in IndexedDB by file name and syllabus id
    await this.savePdfToStorage(file.name, file);
    if (this.activePdfItem?.syllabus_pdf) {
      await this.savePdfToStorage(this.activePdfItem.syllabus_pdf, file);
    }
    if (this.activePdfItem?.id) {
      await this.savePdfToStorage(String(this.activePdfItem.id), file);
    }

    const blobUrl = URL.createObjectURL(file);
    this.currentPdfRawUrl = blobUrl;
    this.currentPdfSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    this.pdfViewerLoading = false;
  }

  downloadPdfFile(item?: any) {
    const rawUrl = this.currentPdfRawUrl;
    const filename = this.getPdfDisplayName(item?.syllabus_pdf || this.activePdfItem?.syllabus_pdf || 'Syllabus.pdf');
    if (rawUrl) {
      const a = document.createElement('a');
      a.href = rawUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    const target = item?.syllabus_pdf || this.activePdfItem?.syllabus_pdf || '';
    if (target) {
      window.open(`${this.baseUrl}/${target}`, '_blank');
    }
  }

  openPdfInNewTab() {
    if (this.currentPdfRawUrl) {
      window.open(this.currentPdfRawUrl, '_blank');
    } else if (this.activePdfItem?.syllabus_pdf) {
      window.open(`${this.baseUrl}/${this.activePdfItem.syllabus_pdf}`, '_blank');
    }
  }

  viewOrDownloadPdf(pdfRef?: string) {
    const matched = this.syllabiList.find(s => s.syllabus_pdf === pdfRef);
    if (matched) {
      this.openPdfViewerModal(matched);
      return;
    }
    this.openPdfViewerModal({ syllabus_pdf: pdfRef });
  }

  getFilteredSemestersForCourse(courseId?: any): any[] {
    if (!courseId) return [];
    const cid = Number(courseId);
    return this.semestersList.filter(s => Number(s.course_id) === cid);
  }

  onCourseChangeForSyllabus() {
    this.formData.semester_id = '';
  }

  // VALIDATE FORM BEFORE SAVE
  validateForm(): boolean {
    this.formErrors = {};
    if (this.activeTab === 'session') {
      if (!this.formData.sessionName || !this.formData.sessionName.trim()) {
        this.formErrors['sessionName'] = 'Session name is required';
      }
      if (!this.formData.shortName || !this.formData.shortName.trim()) {
        this.formErrors['shortName'] = 'Short name is required';
      }
    } else if (this.activeTab === 'course') {
      if (!this.formData.courseName || !this.formData.courseName.trim()) {
        this.formErrors['courseName'] = 'Course name is required';
      }
      if (!this.formData.shortName || !this.formData.shortName.trim()) {
        this.formErrors['shortName'] = 'Course short name is required';
      }
    } else if (this.activeTab === 'semester') {
      if (!this.formData.semesterName || !this.formData.semesterName.trim()) {
        this.formErrors['semesterName'] = 'Semester name is required';
      }
    } else if (this.activeTab === 'syllabus') {
      if (!this.formData.course_id) {
        this.formErrors['course_id'] = 'Course selection is required';
      }
      if (!this.formData.semester_id) {
        this.formErrors['semester_id'] = 'Semester selection is required';
      }
      const sName = (this.formData.syllabus_name || this.formData.syllabusTitle || '').trim();
      if (!sName) {
        this.formErrors['syllabus_name'] = 'Syllabus name is required';
      } else if (sName.length < 3) {
        this.formErrors['syllabus_name'] = 'Syllabus name must be at least 3 characters';
      } else if (sName.length > 100) {
        this.formErrors['syllabus_name'] = 'Syllabus name must not exceed 100 characters';
      }

      if (!this.formData.syllabus || !this.formData.syllabus.trim()) {
        this.formErrors['syllabus'] = 'Syllabus content / outline is required';
      }

      if (this.pdfUploadError) {
        this.formErrors['syllabus_pdf'] = this.pdfUploadError;
      }
    } else if (this.activeTab === 'subject') {
      if (!this.formData.subjectName || !this.formData.subjectName.trim()) {
        this.formErrors['subjectName'] = 'Subject name is required';
      }
      if (!this.formData.subjectCode || !this.formData.subjectCode.trim()) {
        this.formErrors['subjectCode'] = 'Subject code is required';
      }
    } else if (this.activeTab === 'chapter') {
      if (!this.formData.chapterNo || !String(this.formData.chapterNo).trim()) {
        this.formErrors['chapterNo'] = 'Chapter number is required';
      }
      if (!this.formData.chapterName || !this.formData.chapterName.trim()) {
        this.formErrors['chapterName'] = 'Chapter title is required';
      }
    }
    return Object.keys(this.formErrors).length === 0;
  }

  // SAVE ITEM (REAL TIME BACKEND POST API WITH REACTIVE FALLBACK)
  async saveItem() {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;

    try {
      if (this.activeTab === 'session') {
        const payload = {
          id: this.editingItemId || undefined,
          session_name: this.formData.sessionName,
          short_name: this.formData.shortName || 'AY',
          is_active: 1
        };

        const endpoint = this.modalMode === 'add' ? `${this.baseUrl}/session/add` : `${this.baseUrl}/session/update`;
        try {
          await firstValueFrom(this.http.post(endpoint, payload));
        } catch (err) {
          console.warn('Session API save error, performing local update:', err);
        }

        if (this.modalMode === 'add') {
          const newId = this.sessionsList.length ? Math.max(...this.sessionsList.map(s => s.id)) + 1 : 1;
          this.sessionsList.unshift({
            id: newId,
            sessionName: payload.session_name,
            shortName: payload.short_name,
            is_active: 1,
            timestamp: new Date().toISOString().slice(0, 10)
          });
        } else {
          const idx = this.sessionsList.findIndex(s => s.id === this.editingItemId);
          if (idx !== -1) {
            this.sessionsList[idx] = {
              ...this.sessionsList[idx],
              sessionName: payload.session_name,
              shortName: payload.short_name
            };
          }
        }

      } else if (this.activeTab === 'course') {
        const selectedSessionId = Number(this.formData.session_id) || (this.sessionsList[0]?.id || 1);
        const payload = {
          id: this.editingItemId || undefined,
          session_id: selectedSessionId,
          course_name: this.formData.courseName,
          short_name: this.formData.shortName || 'CRS'
        };

        const endpoint = this.modalMode === 'add' ? `${this.baseUrl}/course/add` : `${this.baseUrl}/course/update`;
        try {
          await firstValueFrom(this.http.post(endpoint, payload));
        } catch (err) {
          console.warn('Course API save error, performing local update:', err);
        }

        if (this.modalMode === 'add') {
          const newId = this.coursesList.length ? Math.max(...this.coursesList.map(c => c.id)) + 1 : 1;
          this.coursesList.unshift({
            id: newId,
            session_id: selectedSessionId,
            session: this.getSessionName(selectedSessionId),
            courseName: payload.course_name,
            shortName: payload.short_name,
            timestamp: new Date().toISOString().slice(0, 10)
          });
        } else {
          const idx = this.coursesList.findIndex(c => c.id === this.editingItemId);
          if (idx !== -1) {
            this.coursesList[idx] = {
              ...this.coursesList[idx],
              session_id: selectedSessionId,
              session: this.getSessionName(selectedSessionId),
              courseName: payload.course_name,
              shortName: payload.short_name
            };
          }
        }

      } else if (this.activeTab === 'semester') {
        const selectedCourseId = Number(this.formData.course_id) || (this.coursesList[0]?.id || 1);
        const selectedCourse = this.coursesList.find(c => Number(c.id) === selectedCourseId);
        const payload = {
          id: this.editingItemId || undefined,
          course_id: selectedCourseId,
          semester_name: this.formData.semesterName,
          short_name: this.formData.shortName || 'SEM'
        };

        const endpoint = this.modalMode === 'add' ? `${this.baseUrl}/semester/add` : `${this.baseUrl}/semester/update`;
        try {
          await firstValueFrom(this.http.post(endpoint, payload));
        } catch (err) {
          console.warn('Semester API save error, performing local update:', err);
        }

        if (this.modalMode === 'add') {
          const newId = this.semestersList.length ? Math.max(...this.semestersList.map(s => s.id)) + 1 : 1;
          this.semestersList.unshift({
            id: newId,
            course_id: selectedCourseId,
            session: selectedCourse?.session || 'Session',
            course: this.getCourseName(selectedCourseId),
            semesterName: payload.semester_name,
            shortName: payload.short_name,
            timestamp: new Date().toISOString().slice(0, 10)
          });
        } else {
          const idx = this.semestersList.findIndex(s => s.id === this.editingItemId);
          if (idx !== -1) {
            this.semestersList[idx] = {
              ...this.semestersList[idx],
              course_id: selectedCourseId,
              session: selectedCourse?.session || 'Session',
              course: this.getCourseName(selectedCourseId),
              semesterName: payload.semester_name,
              shortName: payload.short_name
            };
          }
        }

      } else if (this.activeTab === 'syllabus') {
        const selectedCourseId = Number(this.formData.course_id) || (this.coursesList[0]?.id || 1);
        const selectedSemId = Number(this.formData.semester_id) || (this.semestersList[0]?.id || 1);
        const selectedCourse = this.coursesList.find(c => Number(c.id) === selectedCourseId);
        const syllabusName = String(this.formData.syllabus_name || this.formData.syllabusTitle || '').trim();
        const syllabusContent = String(this.formData.syllabus || '').trim();
        const syllabusPdf = this.formData.syllabus_pdf ? String(this.formData.syllabus_pdf).trim() : null;

        if (this.modalMode === 'add') {
          const res = await firstValueFrom(this.syllabusService.addSyllabus({
            course_id: selectedCourseId,
            semester_id: selectedSemId,
            syllabus_name: syllabusName,
            syllabus: syllabusContent,
            syllabus_pdf: syllabusPdf
          }));

          if (res && res.ok === false) {
            alert(res.msg || 'Failed to add syllabus');
            this.isSaving = false;
            return;
          }

          if (this.selectedPdfFile && syllabusPdf) {
            await this.savePdfToStorage(syllabusPdf, this.selectedPdfFile);
          }
        } else {
          const res = await firstValueFrom(this.syllabusService.updateSyllabus({
            id: Number(this.editingItemId),
            course_id: selectedCourseId,
            semester_id: selectedSemId,
            syllabus_name: syllabusName,
            syllabus: syllabusContent,
            syllabus_pdf: syllabusPdf
          }));

          if (res && res.ok === false) {
            alert(res.msg || 'Failed to update syllabus');
            this.isSaving = false;
            return;
          }

          if (this.selectedPdfFile && syllabusPdf) {
            await this.savePdfToStorage(syllabusPdf, this.selectedPdfFile);
            if (this.editingItemId) {
              await this.savePdfToStorage(String(this.editingItemId), this.selectedPdfFile);
            }
          }
        }

        await this.fetchSyllabi();

      } else if (this.activeTab === 'subject') {
        const selectedCourseId = Number(this.formData.course_id) || (this.coursesList[0]?.id || 1);
        const selectedSemId = Number(this.formData.semester_id) || (this.semestersList[0]?.id || 1);
        const subjectName = String(this.formData.subjectName || '').trim();
        const subjectCode = String(this.formData.subjectCode || '').trim();
        const shortName = String(this.formData.shortName || '').trim();

        if (this.modalMode === 'add') {
          const res = await firstValueFrom(this.subjectService.addSubject({
            course_id: selectedCourseId,
            semester_id: selectedSemId,
            subject_name: subjectName,
            subject_code: subjectCode,
            short_name: shortName || undefined
          }));

          if (res && res.ok === false) {
            alert(res.msg || 'Failed to add subject');
            return;
          }
        } else {
          const res = await firstValueFrom(this.subjectService.updateSubject({
            id: Number(this.editingItemId),
            course_id: selectedCourseId,
            semester_id: selectedSemId,
            subject_name: subjectName,
            subject_code: subjectCode,
            short_name: shortName || undefined
          }));

          if (res && res.ok === false) {
            alert(res.msg || 'Failed to update subject');
            return;
          }
        }

        await this.fetchSubjects();

      } else if (this.activeTab === 'chapter') {
        const selectedSubjectId = Number(this.formData.subject_id) || (this.subjectsList[0]?.id || 1);
        const selectedSubject = this.subjectsList.find(s => Number(s.id) === selectedSubjectId);
        const selectedCourseId = Number(this.formData.course_id) || selectedSubject?.course_id || (this.coursesList[0]?.id || 1);
        const selectedSemId = Number(this.formData.semester_id) || selectedSubject?.semester_id || (this.semestersList[0]?.id || 1);
        const chapterName = String(this.formData.chapterName || '').trim();
        const chapterNo = String(this.formData.chapterNo || '').trim();
        const shortName = String(this.formData.shortName || chapterNo || '').trim();

        if (this.modalMode === 'add') {
          const res = await firstValueFrom(this.chapterService.addChapter({
            course_id: selectedCourseId,
            semester_id: selectedSemId,
            subject_id: selectedSubjectId,
            chapter_name: chapterName,
            short_name: shortName || undefined
          }));

          if (res && res.ok === false) {
            alert(res.msg || 'Failed to add chapter');
            return;
          }
        } else {
          const res = await firstValueFrom(this.chapterService.updateChapter({
            id: Number(this.editingItemId),
            course_id: selectedCourseId,
            semester_id: selectedSemId,
            subject_id: selectedSubjectId,
            chapter_name: chapterName,
            short_name: shortName || undefined
          }));

          if (res && res.ok === false) {
            alert(res.msg || 'Failed to update chapter');
            return;
          }
        }

        await this.fetchChapters();
      }

      this.closeModal();
    } catch (e: any) {
      console.error('Error saving academic item:', e);
      alert(e?.message || 'Server error occurred while saving.');
    } finally {
      this.isSaving = false;
    }
  }

  // DELETE ITEM
  async deleteItem(id: number) {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      if (this.activeTab === 'syllabus') {
        const res = await firstValueFrom(this.syllabusService.deleteSyllabus(id));
        if (res && res.ok === false) {
          alert(res.msg || 'Failed to delete syllabus');
        }
        await this.fetchSyllabi();
        return;
      } else if (this.activeTab === 'subject') {
        const res = await firstValueFrom(this.subjectService.deleteSubject(id));
        if (res && res.ok === false) {
          alert(res.msg || 'Failed to delete subject');
        }
        await this.fetchSubjects();
        return;
      } else if (this.activeTab === 'chapter') {
        const res = await firstValueFrom(this.chapterService.deleteChapter(id));
        if (res && res.ok === false) {
          alert(res.msg || 'Failed to delete chapter');
        }
        await this.fetchChapters();
        return;
      }

      const endpoint = `${this.baseUrl}/${this.activeTab}/delete/${id}`;
      try {
        await firstValueFrom(this.http.post(endpoint, {}));
      } catch (err) {
        console.warn(`Delete API failed for ${this.activeTab}/${id}, removing locally:`, err);
      }

      if (this.activeTab === 'session') {
        this.sessionsList = this.sessionsList.filter(s => s.id !== id);
      } else if (this.activeTab === 'course') {
        this.coursesList = this.coursesList.filter(c => c.id !== id);
      } else if (this.activeTab === 'semester') {
        this.semestersList = this.semestersList.filter(s => s.id !== id);
      } else if (this.activeTab === 'syllabus') {
        this.syllabiList = this.syllabiList.filter(s => s.id !== id);
      }
    } catch (e) {
      console.error('Error deleting academic item:', e);
    }
  }
}
