import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Session, Course, Semester, student } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AcademicService {

  constructor(private api: ApiService) { }

  // =========================================================================
  // SESSION API SERVICES
  // =========================================================================
  async getAllSessions(): Promise<Session[]> {
    const res: any = await this.api.post('/session/getall');
    if (res) {
      return Array.isArray(res) ? res : (res.data || res.result || res.sessions || []);
    }
    return [];
  }

  async addSession(data: { session_name: string; short_name: string; is_active?: number }) {
    return await this.api.post('/session/add', data);
  }

  async updateSession(data: { id: number | string; session_name: string; short_name: string; is_active?: number }) {
    return await this.api.post('/session/update', data);
  }

  async deleteSession(id: number | string) {
    return await this.api.post(`/session/delete/${id}`);
  }

  // =========================================================================
  // COURSE API SERVICES
  // =========================================================================
  async getAllCourses(): Promise<Course[]> {
    const res: any = await this.api.post('/course/getall');
    if (res) {
      return Array.isArray(res) ? res : (res.data || res.result || res.courses || []);
    }
    return [];
  }

  async addCourse(data: { session_id: number | string; course_name: string; short_name: string }) {
    return await this.api.post('/course/add', data);
  }

  async updateCourse(data: { id: number | string; session_id: number | string; course_name: string; short_name: string }) {
    return await this.api.post('/course/update', data);
  }

  async deleteCourse(id: number | string) {
    return await this.api.post(`/course/delete/${id}`);
  }

  // =========================================================================
  // SEMESTER API SERVICES
  // =========================================================================
  async getAllSemesters(): Promise<Semester[]> {
    const res: any = await this.api.post('/semester/getall');
    if (res) {
      return Array.isArray(res) ? res : (res.data || res.result || res.semesters || []);
    }
    return [];
  }

  async addSemester(data: { course_id: number | string; semester_name: string; short_name: string }) {
    return await this.api.post('/semester/add', data);
  }

  async updateSemester(data: { id: number | string; course_id: number | string; semester_name: string; short_name: string }) {
    return await this.api.post('/semester/update', data);
  }

  async deleteSemester(id: number | string) {
    return await this.api.post(`/semester/delete/${id}`);
  }

  // =========================================================================
  // STUDENT API SERVICES
  // =========================================================================
  async getAllStudents(): Promise<student[]> {
    const res: any = await this.api.post('/student/getall');
    if (res) {
      return Array.isArray(res) ? res : (res.data || res.result || res.students || []);
    }
    return [];
  }

  async addStudent(studentData: student) {
    return await this.api.post('/student/quick_add', studentData);
  }

  async updateStudent(studentData: student) {
    return await this.api.post('/student/update', studentData);
  }
}
