import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SyllabusPayload, SyllabusResponse } from '../interfaces';

export { SyllabusPayload, SyllabusResponse };

@Injectable({
  providedIn: 'root'
})
export class SyllabusService {
  private readonly baseUrl = environment.api_url;

  constructor(private http: HttpClient) { }

  public getAllSyllabi(): Observable<SyllabusPayload[]> {
    return this.http.post<any>(`${this.baseUrl}/syllabus/getall`, {}).pipe(
      catchError(() => this.http.get<any>(`${this.baseUrl}/syllabus/getall`)),
      catchError(() => this.http.get<any>(`${this.baseUrl}/syllabus`)),
      map(res => {
        if (Array.isArray(res)) return res;
        return res?.data || res?.result || res?.syllabi || [];
      }),
      catchError(err => {
        console.error('Error fetching syllabi:', err);
        return of([]);
      })
    );
  }

  public addSyllabus(payload: {
    course_id: number;
    semester_id: number;
    syllabus_name: string;
    syllabus: string;
    syllabus_pdf?: string | null;
  }): Observable<SyllabusResponse> {
    const body = {
      course_id: Number(payload.course_id),
      semester_id: Number(payload.semester_id),
      syllabus_name: String(payload.syllabus_name).trim(),
      syllabus: String(payload.syllabus).trim(),
      syllabus_pdf: payload.syllabus_pdf ? String(payload.syllabus_pdf).trim() : null
    };

    return this.http.post<SyllabusResponse>(`${this.baseUrl}/syllabus/add`, body).pipe(
      catchError(() => this.http.post<SyllabusResponse>(`${this.baseUrl}/syllabus`, body)),
      catchError(err => {
        const errorMsg = err?.error?.msg || err?.error?.message || err?.message || 'Failed to add syllabus';
        return of({ ok: false, msg: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg });
      })
    );
  }

  /**
   * Update an existing syllabus in real time
   */
  public updateSyllabus(payload: {
    id: number | string;
    course_id: number;
    semester_id: number;
    syllabus_name: string;
    syllabus: string;
    syllabus_pdf?: string | null;
  }): Observable<SyllabusResponse> {
    const id = Number(payload.id);
    const body = {
      id: id,
      course_id: Number(payload.course_id),
      semester_id: Number(payload.semester_id),
      syllabus_name: String(payload.syllabus_name).trim(),
      syllabus: String(payload.syllabus).trim(),
      syllabus_pdf: payload.syllabus_pdf ? String(payload.syllabus_pdf).trim() : null
    };

    return this.http.post<SyllabusResponse>(`${this.baseUrl}/syllabus/update`, body).pipe(
      catchError(() => this.http.put<SyllabusResponse>(`${this.baseUrl}/syllabus/update`, body)),
      catchError(() => this.http.put<SyllabusResponse>(`${this.baseUrl}/syllabus/${id}`, body)),
      catchError(err => {
        const errorMsg = err?.error?.msg || err?.error?.message || err?.message || 'Failed to update syllabus';
        return of({ ok: false, msg: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg });
      })
    );
  }

  /**
   * Delete / Deactivate a syllabus by ID
   */
  public deleteSyllabus(id: number | string): Observable<SyllabusResponse> {
    return this.http.post<SyllabusResponse>(`${this.baseUrl}/syllabus/delete/${id}`, {}).pipe(
      catchError(() => this.http.delete<SyllabusResponse>(`${this.baseUrl}/syllabus/${id}`)),
      catchError(err => {
        const errorMsg = err?.error?.msg || err?.error?.message || err?.message || 'Failed to delete syllabus';
        return of({ ok: false, msg: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg });
      })
    );
  }

  /**
   * Get syllabus by Course ID and Semester ID
   */
  public getByCourseSemester(courseId: number | string, semesterId: number | string): Observable<SyllabusPayload | null> {
    return this.http.post<any>(`${this.baseUrl}/syllabus/course-semester`, {
      course_id: Number(courseId),
      semester_id: Number(semesterId)
    }).pipe(
      map(res => {
        if (res?.data) return res.data;
        if (Array.isArray(res)) return res[0] || null;
        return res || null;
      }),
      catchError(err => {
        console.error('Error fetching syllabus by course and semester:', err);
        return of(null);
      })
    );
  }
}
