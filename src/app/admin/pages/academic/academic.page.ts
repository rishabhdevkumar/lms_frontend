import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { DefaultService } from 'src/app/api';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-academic',
  templateUrl: './academic.page.html',
  styleUrls: ['./academic.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
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

  // FORM INPUT MODEL
  formData: any = {
    sessionName: '',
    shortName: '',
    courseName: '',
    semesterName: '',
    syllabusTitle: '',
    subjectName: '',
    subjectCode: '',
    chapterName: '',
    chapterNo: '',
    session_id: '',
    course_id: ''
  };

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

  constructor(private defaultService: DefaultService) { }

  ngOnInit() {
    this.loadAllDynamicData();
  }

  async loadAllDynamicData() {
    this.isLoading = true;
    try {
      await Promise.all([
        this.fetchSessions(),
        this.fetchCourses(),
        this.fetchSemesters()
      ]);
    } catch (e) {
      console.error('Error loading academic data:', e);
    } finally {
      this.isLoading = false;
    }
  }

  // FETCH SESSIONS FROM OPENAPI DEFAULT SERVICE
  async fetchSessions() {
    try {
      const res: any = await firstValueFrom(this.defaultService.sessionControllerGetAll());
      const list = Array.isArray(res) ? res : (res?.data || res?.result || res?.sessions || []);
      this.sessionsList = list.map((item: any) => ({
        id: item.id,
        sessionName: item.session_name || item.sessionName,
        shortName: item.short_name || item.shortName || 'AY',
        is_active: item.is_active,
        timestamp: item.timestamp || item.created_at || new Date().toISOString().slice(0, 19).replace('T', ' ')
      }));
    } catch (e) {
      console.error('Error fetching sessions:', e);
    }
  }

  // FETCH COURSES FROM OPENAPI DEFAULT SERVICE
  async fetchCourses() {
    try {
      const res: any = await firstValueFrom(this.defaultService.courseControllerGetAll());
      const list = Array.isArray(res) ? res : (res?.data || res?.result || res?.courses || []);
      this.coursesList = list.map((item: any) => ({
        id: item.id,
        session_id: item.session_id,
        session: this.getSessionName(item.session_id),
        courseName: item.course_name || item.courseName,
        shortName: item.short_name || item.shortName || 'CRS',
        timestamp: item.timestamp || item.created_at || new Date().toISOString().slice(0, 19).replace('T', ' ')
      }));
    } catch (e) {
      console.error('Error fetching courses:', e);
    }
  }

  // FETCH SEMESTERS FROM OPENAPI DEFAULT SERVICE
  async fetchSemesters() {
    try {
      const res: any = await firstValueFrom(this.defaultService.semesterControllerGetAll());
      const list = Array.isArray(res) ? res : (res?.data || res?.result || res?.semesters || []);
      this.semestersList = list.map((item: any) => ({
        id: item.id,
        course_id: item.course_id,
        course: this.getCourseName(item.course_id),
        semesterName: item.semester_name || item.semesterName,
        shortName: item.short_name || item.shortName || 'SEM',
        timestamp: item.timestamp || item.created_at || new Date().toISOString().slice(0, 19).replace('T', ' ')
      }));
    } catch (e) {
      console.error('Error fetching semesters:', e);
    }
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
      return this.syllabiList.filter(s => !query || (s.syllabusTitle && s.syllabusTitle.toLowerCase().includes(query)));
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
    this.isAddEditModalOpen = true;
  }

  // OPEN EDIT MODAL
  openEditModal(item: any) {
    this.modalMode = 'edit';
    this.editingItemId = item.id;
    this.formData = { ...item };
    this.isAddEditModalOpen = true;
  }

  closeModal() {
    this.isAddEditModalOpen = false;
    this.resetFormData();
  }

  resetFormData() {
    this.formData = {
      sessionName: '',
      shortName: '',
      courseName: '',
      semesterName: '',
      syllabusTitle: '',
      subjectName: '',
      subjectCode: '',
      chapterName: '',
      chapterNo: '',
      session_id: this.sessionsList[0]?.id || '',
      course_id: this.coursesList[0]?.id || ''
    };
  }

  // SAVE ITEM VIA OPENAPI GENERATED DEFAULT SERVICE
  async saveItem() {
    this.isSaving = true;

    try {
      if (this.activeTab === 'session') {
        if (!this.formData.sessionName) return;
        
        const payload = {
          session_name: this.formData.sessionName,
          short_name: this.formData.shortName || 'AY',
          is_active: 1
        };

        if (this.modalMode === 'add') {
          await firstValueFrom(this.defaultService.sessionControllerAdd());
        } else {
          await firstValueFrom(this.defaultService.sessionControllerUpdate());
        }
        await this.fetchSessions();

      } else if (this.activeTab === 'course') {
        if (!this.formData.courseName) return;

        const payload = {
          session_id: this.formData.session_id || (this.sessionsList[0]?.id || 1),
          course_name: this.formData.courseName,
          short_name: this.formData.shortName || 'CRS'
        };

        if (this.modalMode === 'add') {
          await firstValueFrom(this.defaultService.courseControllerAdd());
        } else {
          await firstValueFrom(this.defaultService.courseControllerUpdate());
        }
        await this.fetchCourses();

      } else if (this.activeTab === 'semester') {
        if (!this.formData.semesterName) return;

        const payload = {
          course_id: this.formData.course_id || (this.coursesList[0]?.id || 1),
          semester_name: this.formData.semesterName,
          short_name: this.formData.shortName || 'SEM'
        };

        if (this.modalMode === 'add') {
          await firstValueFrom(this.defaultService.semesterControllerAdd());
        } else {
          await firstValueFrom(this.defaultService.semesterControllerUpdate());
        }
        await this.fetchSemesters();
      }
    } catch (e) {
      console.error('Error saving item via DefaultService:', e);
    } finally {
      this.isSaving = false;
      this.closeModal();
    }
  }

  // DELETE ITEM VIA OPENAPI GENERATED DEFAULT SERVICE
  async deleteItem(id: number) {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      if (this.activeTab === 'session') {
        await firstValueFrom(this.defaultService.sessionControllerDelete(String(id)));
        await this.fetchSessions();
      } else if (this.activeTab === 'course') {
        await firstValueFrom(this.defaultService.courseControllerDelete(String(id)));
        await this.fetchCourses();
      } else if (this.activeTab === 'semester') {
        await firstValueFrom(this.defaultService.semesterControllerDelete(String(id)));
        await this.fetchSemesters();
      }
    } catch (e) {
      console.error('Error deleting item via DefaultService:', e);
    }
  }
}
