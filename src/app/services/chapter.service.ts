import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ChapterPayload {
  id?: number | string;
  course_id?: number;
  semester_id?: number;
  subject_id: number;
  chapter_name: string;
  short_name?: string;
  chapter_no?: string | number;
  is_active?: number;
  [key: string]: any;
}

export interface ChapterResponse {
  ok: boolean;
  msg: string;
  data?: any;
  affected?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChapterService {
  private readonly baseUrl = environment.api_url || 'http://localhost:3001';

  constructor(private http: HttpClient) {}

  /**
   * Get all active chapters in real time
   */
  public getAllChapters(): Observable<ChapterPayload[]> {
    return this.http.get<any>(`${this.baseUrl}/chapter`).pipe(
      catchError(() => this.http.post<any>(`${this.baseUrl}/chapter/getall`, {})),
      catchError(() => this.http.get<any>(`${this.baseUrl}/chapter/getall`)),
      map(res => {
        if (Array.isArray(res)) return res;
        return res?.data || res?.result || res?.chapters || [];
      }),
      catchError(err => {
        console.error('Error fetching chapters:', err);
        return of([]);
      })
    );
  }

  /**
   * Add a new chapter via live API
   */
  public addChapter(payload: {
    course_id?: number;
    semester_id?: number;
    subject_id: number;
    chapter_name: string;
    short_name?: string;
  }): Observable<ChapterResponse> {
    const body: any = {
      subject_id: Number(payload.subject_id),
      chapter_name: String(payload.chapter_name).trim(),
      short_name: payload.short_name ? String(payload.short_name).trim() : null,
    };
    if (payload.course_id) body.course_id = Number(payload.course_id);
    if (payload.semester_id) body.semester_id = Number(payload.semester_id);

    return this.http.post<ChapterResponse>(`${this.baseUrl}/chapter/add`, body).pipe(
      catchError(() => this.http.post<ChapterResponse>(`${this.baseUrl}/chapter`, body)),
      catchError(err => {
        const errorMsg = err?.error?.msg || err?.error?.message || err?.message || 'Failed to add chapter';
        return of({ ok: false, msg: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg });
      })
    );
  }

  /**
   * Update an existing chapter in real time
   */
  public updateChapter(payload: {
    id: number | string;
    course_id?: number;
    semester_id?: number;
    subject_id: number;
    chapter_name: string;
    short_name?: string;
  }): Observable<ChapterResponse> {
    const id = Number(payload.id);
    const body: any = {
      id: id,
      subject_id: Number(payload.subject_id),
      chapter_name: String(payload.chapter_name).trim(),
      short_name: payload.short_name ? String(payload.short_name).trim() : null,
    };
    if (payload.course_id) body.course_id = Number(payload.course_id);
    if (payload.semester_id) body.semester_id = Number(payload.semester_id);

    return this.http.put<ChapterResponse>(`${this.baseUrl}/chapter/update`, body).pipe(
      catchError(() => this.http.post<ChapterResponse>(`${this.baseUrl}/chapter/update`, body)),
      catchError(() => this.http.put<ChapterResponse>(`${this.baseUrl}/chapter/${id}`, body)),
      catchError(err => {
        const errorMsg = err?.error?.msg || err?.error?.message || err?.message || 'Failed to update chapter';
        return of({ ok: false, msg: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg });
      })
    );
  }

  /**
   * Delete / Deactivate a chapter
   */
  public deleteChapter(id: number | string): Observable<ChapterResponse> {
    return this.http.post<ChapterResponse>(`${this.baseUrl}/chapter/delete/${id}`, {}).pipe(
      catchError(() => this.http.delete<ChapterResponse>(`${this.baseUrl}/chapter/${id}`)),
      catchError(err => {
        const errorMsg = err?.error?.msg || err?.error?.message || err?.message || 'Failed to delete chapter';
        return of({ ok: false, msg: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg });
      })
    );
  }

  /**
   * Get chapters belonging to a specific subject
   */
  public getChaptersBySubject(subjectId: number | string): Observable<ChapterPayload[]> {
    return this.http.get<any>(`${this.baseUrl}/chapter/by_subject/${subjectId}`).pipe(
      catchError(() => this.http.get<any>(`${this.baseUrl}/chapter/subject/${subjectId}`)),
      catchError(() => this.http.post<any>(`${this.baseUrl}/chapter/by_subject`, { subject_id: Number(subjectId) })),
      map(res => {
        if (Array.isArray(res)) return res;
        return res?.data || res?.result || [];
      }),
      catchError(err => {
        console.error('Error fetching chapters by subject:', err);
        return of([]);
      })
    );
  }

  /**
   * Toggle chapter active status
   */
  public toggleChapterStatus(id: number | string, is_active: number): Observable<ChapterResponse> {
    const body = { id: Number(id), is_active: Number(is_active) };
    return this.http.post<ChapterResponse>(`${this.baseUrl}/chapter/toggle_status`, body).pipe(
      catchError(err => {
        const errorMsg = err?.error?.msg || err?.error?.message || err?.message || 'Failed to toggle chapter status';
        return of({ ok: false, msg: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg });
      })
    );
  }

  /**
   * Get single chapter details by ID
   */
  public getChapterById(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/chapter/${id}`).pipe(
      map(res => res?.data || res),
      catchError(err => {
        console.error('Error getting chapter by id:', err);
        return of(null);
      })
    );
  }
}
