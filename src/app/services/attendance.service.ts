import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AttendancePayload {
  session_id: number;
  users_id: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  marked_by: number;
}

export interface BulkAttendanceItem {
  users_id: number;
  status: string;
}

export interface BulkAttendancePayload {
  session_id: number;
  marked_by: number;
  attendances: BulkAttendanceItem[];
}

export interface AttendanceRecordBackend {
  id: number;
  session_id: number;
  session_name?: string;
  users_id: number;
  student_name?: string;
  roll_no?: string;
  student_email?: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  marked_by: number;
  marked_by_name?: string;
  marked_at?: string;
  updated_at?: string;
  session_date?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private baseUrl = environment.api_url || 'http://localhost:3001';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /**
   * Mark individual student attendance
   */
  markAttendance(payload: AttendancePayload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/attendance/add`, payload).pipe(
      catchError(() => this.http.post<any>(`${this.baseUrl}/attendance/mark`, payload)),
      catchError(err => {
        console.error('Error marking attendance:', err);
        return of({ ok: false, msg: err?.error?.msg || err?.message || 'Failed to mark attendance' });
      })
    );
  }

  /**
   * Bulk mark attendance for entire class / session
   */
  bulkMarkAttendance(payload: BulkAttendancePayload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/attendance/bulk-add`, payload).pipe(
      catchError(err => {
        console.error('Error in bulk attendance:', err);
        return of({ ok: false, msg: err?.error?.msg || err?.message || 'Failed to bulk mark attendance' });
      })
    );
  }

  /**
   * Retrieve all attendance records
   */
  getAllAttendance(): Observable<AttendanceRecordBackend[]> {
    return this.http.get<any>(`${this.baseUrl}/attendance/getall`).pipe(
      catchError(() => this.http.post<any>(`${this.baseUrl}/attendance/getall`, {})),
      map(res => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        if (res?.result && Array.isArray(res.result)) return res.result;
        return [];
      }),
      catchError(err => {
        console.error('Error fetching all attendance:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieve attendance records by date
   */
  getAttendanceByDate(date: string): Observable<AttendanceRecordBackend[]> {
    return this.http.post<any>(`${this.baseUrl}/attendance/date`, { date }).pipe(
      catchError(() => this.http.get<any>(`${this.baseUrl}/attendance/date/${date}`)),
      map(res => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        return [];
      }),
      catchError(err => {
        console.error('Error fetching attendance by date:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieve attendance records for a specific session
   */
  getAttendanceBySession(sessionId: number): Observable<AttendanceRecordBackend[]> {
    return this.http.get<any>(`${this.baseUrl}/attendance/session/${sessionId}`).pipe(
      catchError(() => this.http.post<any>(`${this.baseUrl}/attendance/session/${sessionId}`, {})),
      map(res => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        return [];
      }),
      catchError(err => {
        console.error('Error fetching attendance by session:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieve attendance history records for a specific student
   */
  getAttendanceByStudent(studentId: number): Observable<AttendanceRecordBackend[]> {
    return this.http.get<any>(`${this.baseUrl}/attendance/student/${studentId}`).pipe(
      catchError(() => this.http.get<any>(`${this.baseUrl}/attendance/user/${studentId}`)),
      map(res => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        if (res?.result && Array.isArray(res.result)) return res.result;
        return [];
      }),
      catchError(err => {
        console.error('Error fetching student attendance history:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieve attendance percentage and statistics for a student
   */
  getStudentAttendanceStats(studentId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/attendance/percentage/${studentId}`).pipe(
      catchError(() => this.http.post<any>(`${this.baseUrl}/attendance/percentage/${studentId}`, {})),
      map(res => {
        if (Array.isArray(res) && res.length > 0) return res[0];
        return res?.data || res;
      }),
      catchError(err => {
        console.error('Error fetching student attendance stats:', err);
        return of(null);
      })
    );
  }

  /**
   * Fetch all academic sessions
   */
  getSessions(): Observable<any[]> {
    return this.http.post<any>(`${this.baseUrl}/session/getall`, {}).pipe(
      catchError(() => this.http.get<any>(`${this.baseUrl}/session/getall`)),
      map(res => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        return [];
      }),
      catchError(err => {
        console.error('Error fetching sessions:', err);
        return of([]);
      })
    );
  }

  /**
   * Fetch all courses
   */
  getCourses(): Observable<any[]> {
    return this.http.post<any>(`${this.baseUrl}/course/getall`, {}).pipe(
      catchError(() => this.http.get<any>(`${this.baseUrl}/course/getall`)),
      map(res => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        return [];
      }),
      catchError(err => {
        console.error('Error fetching courses:', err);
        return of([]);
      })
    );
  }

  /**
   * Fetch all semesters
   */
  getSemesters(): Observable<any[]> {
    return this.http.post<any>(`${this.baseUrl}/semester/getall`, {}).pipe(
      catchError(() => this.http.get<any>(`${this.baseUrl}/semester/getall`)),
      map(res => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        return [];
      }),
      catchError(err => {
        console.error('Error fetching semesters:', err);
        return of([]);
      })
    );
  }
}
