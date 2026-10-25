import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SubjectPayload {
  id?: number | string;
  course_id: number;
  semester_id: number;
  subject_code?: string;
  subject_name: string;
  short_name?: string;
  is_active?: number;
  [key: string]: any;
}

export interface SubjectResponse {
  ok: boolean;
  msg: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private readonly baseUrl = environment.api_url || 'http://localhost:3001';

  constructor(private http: HttpClient) {}

  /**
   * Get all active subjects in real time
   */
  public getAllSubjects(): Observable<SubjectPayload[]> {
    return this.http.get<any>(`${this.baseUrl}/subject`).pipe(
      catchError(() => this.http.post<any>(`${this.baseUrl}/subject/getall`, {})),
      catchError(() => this.http.get<any>(`${this.baseUrl}/subject/getall`)),
      map(res => {
        if (Array.isArray(res)) return res;
        return res?.data || res?.result || res?.subjects || [];
      }),
      catchError(err => {
        console.error('Error fetching subjects:', err);
        return of([]);
      })
    );
  }

  /**
   * Add a new subject via live API
   */
  public addSubject(payload: {
    course_id: number;
    semester_id: number;
    subject_name: string;
    subject_code?: string;
    short_name?: string;
  }): Observable<SubjectResponse> {
    const body = {
      course_id: Number(payload.course_id),
      semester_id: Number(payload.semester_id),
      subject_name: String(payload.subject_name).trim(),
      subject_code: payload.subject_code ? String(payload.subject_code).trim() : null,
      short_name: payload.short_name ? String(payload.short_name).trim() : null,
    };

    return this.http.post<SubjectResponse>(`${this.baseUrl}/subject/add`, body).pipe(
      catchError(() => this.http.post<SubjectResponse>(`${this.baseUrl}/subject`, body)),
      catchError(err => {
        const errorMsg = err?.error?.msg || err?.error?.message || err?.message || 'Failed to add subject';
        return of({ ok: false, msg: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg });
      })
    );
  }

  /**
   * Update an existing subject in real time
   */
  public updateSubject(payload: {
    id: number | string;
    course_id: number;
    semester_id: number;
    subject_name: string;
    subject_code?: string;
    short_name?: string;
  }): Observable<SubjectResponse> {
    const id = Number(payload.id);
    const body = {
      id: id,
      course_id: Number(payload.course_id),
      semester_id: Number(payload.semester_id),
      subject_name: String(payload.subject_name).trim(),
      subject_code: payload.subject_code ? String(payload.subject_code).trim() : null,
      short_name: payload.short_name ? String(payload.short_name).trim() : null,
    };

    return this.http.put<SubjectResponse>(`${this.baseUrl}/subject/update`, body).pipe(
      catchError(() => this.http.post<SubjectResponse>(`${this.baseUrl}/subject/update`, body)),
      catchError(() => this.http.put<SubjectResponse>(`${this.baseUrl}/subject/${id}`, body)),
      catchError(err => {
        const errorMsg = err?.error?.msg || err?.error?.message || err?.message || 'Failed to update subject';
        return of({ ok: false, msg: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg });
      })
    );
  }

  /**
   * Delete / Deactivate a subject
   */
  public deleteSubject(id: number | string): Observable<SubjectResponse> {
    return this.http.post<SubjectResponse>(`${this.baseUrl}/subject/delete/${id}`, {}).pipe(
      catchError(() => this.http.delete<SubjectResponse>(`${this.baseUrl}/subject/${id}`)),
      catchError(err => {
        const errorMsg = err?.error?.msg || err?.error?.message || err?.message || 'Failed to delete subject';
        return of({ ok: false, msg: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg });
      })
    );
  }

  /**
   * Toggle subject active status (1 = active, 0 = inactive)
   */
  public toggleSubjectStatus(id: number | string, is_active: number): Observable<SubjectResponse> {
    const body = { id: Number(id), is_active: Number(is_active) };
    return this.http.post<SubjectResponse>(`${this.baseUrl}/subject/toggle_status`, body).pipe(
      catchError(err => {
        const errorMsg = err?.error?.msg || err?.error?.message || err?.message || 'Failed to toggle subject status';
        return of({ ok: false, msg: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg });
      })
    );
  }

  /**
   * Get subjects filtered by course and semester
   */
  public getSubjectsByCourseSemester(courseId: number | string, semesterId: number | string): Observable<SubjectPayload[]> {
    return this.http.get<any>(`${this.baseUrl}/subject/course/${courseId}/semester/${semesterId}`).pipe(
      catchError(() => this.http.post<any>(`${this.baseUrl}/subject/get_by_course_semester`, { course_id: Number(courseId), semester_id: Number(semesterId) })),
      map(res => {
        if (Array.isArray(res)) return res;
        return res?.data || res?.result || [];
      }),
      catchError(err => {
        console.error('Error fetching subjects by course/semester:', err);
        return of([]);
      })
    );
  }

  /**
   * Get chapter count per subject
   */
  public getChapterCount(subjectId?: number | string): Observable<any[]> {
    const url = subjectId ? `${this.baseUrl}/subject/chapter_count/${subjectId}` : `${this.baseUrl}/subject/chapter_count`;
    return this.http.get<any>(url).pipe(
      catchError(() => this.http.post<any>(`${this.baseUrl}/subject/chapter_count`, subjectId ? { subject_id: Number(subjectId) } : {})),
      map(res => {
        if (Array.isArray(res)) return res;
        return res?.data || res?.result || [];
      }),
      catchError(err => {
        console.error('Error fetching chapter count:', err);
        return of([]);
      })
    );
  }
}
