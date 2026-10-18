import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  BatchItemBackend,
  BatchStudent,
  AddBatchPayload,
  UpdateBatchPayload
} from '../interfaces';

export {
  BatchItemBackend,
  BatchStudent,
  AddBatchPayload,
  UpdateBatchPayload
};

@Injectable({
  providedIn: 'root'
})
export class BatchesService {
  private baseUrl = environment.api_url;

  constructor(private http: HttpClient) { }

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

  getAllBatches(): Observable<BatchItemBackend[]> {
    return this.http.post<any>(`${this.baseUrl}/batches/getall`, {}).pipe(
      map(res => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        if (res?.value && Array.isArray(res.value)) return res.value;
        return [];
      }),
      catchError(err => {
        console.error('Error fetching batches:', err);
        return of([]);
      })
    );
  }

  /**
   * Get batch details by ID
   */
  getBatchById(id: number): Observable<BatchItemBackend | null> {
    return this.http.post<any>(`${this.baseUrl}/batches/getbyid/${id}`, {}).pipe(
      map(res => res?.data || res || null),
      catchError(err => {
        console.error(`Error fetching batch #${id}:`, err);
        return of(null);
      })
    );
  }

  /**
   * Create a new batch
   */
  createBatch(payload: AddBatchPayload): Observable<{ ok: boolean | number; msg?: string; data?: any }> {
    return this.http.post<any>(`${this.baseUrl}/batches/add`, payload).pipe(
      map(res => res || { ok: false, msg: 'Unknown response' }),
      catchError(err => {
        console.error('Error creating batch:', err);
        return of({ ok: false, msg: err?.error?.message || err?.message || 'Failed to create batch' });
      })
    );
  }

  /**
   * Update existing batch
   */
  updateBatch(payload: UpdateBatchPayload): Observable<{ ok: boolean | number; msg?: string; data?: any }> {
    return this.http.post<any>(`${this.baseUrl}/batches/update`, payload).pipe(
      map(res => res || { ok: false, msg: 'Unknown response' }),
      catchError(err => {
        console.error('Error updating batch:', err);
        return of({ ok: false, msg: err?.error?.message || err?.message || 'Failed to update batch' });
      })
    );
  }

  /**
   * Delete batch by ID (requires JWT auth header)
   */
  deleteBatch(id: number): Observable<{ ok: boolean | number; msg?: string }> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.baseUrl}/batches/delete/${id}`, {}, { headers }).pipe(
      map(res => res || { ok: false, msg: 'Unknown response' }),
      catchError(err => {
        console.error('Error deleting batch:', err);
        return of({ ok: false, msg: err?.error?.message || err?.message || 'Failed to delete batch' });
      })
    );
  }

  /**
   * Get enrolled students for a specific batch
   */
  getEnrolledStudents(batchId: number): Observable<BatchStudent[]> {
    return this.http.post<any>(`${this.baseUrl}/batches/students/${batchId}`, {}).pipe(
      map(res => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        if (res?.value && Array.isArray(res.value)) return res.value;
        return [];
      }),
      catchError(err => {
        console.error(`Error fetching students for batch #${batchId}:`, err);
        return of([]);
      })
    );
  }

  /**
   * Enroll a student into a batch
   */
  enrollStudent(batchId: number, userId: number): Observable<{ ok: boolean | number; msg?: string; data?: any }> {
    const payload = { batch_id: Number(batchId), users_id: Number(userId) };
    return this.http.post<any>(`${this.baseUrl}/batches/enroll-student`, payload).pipe(
      map(res => res || { ok: false, msg: 'Unknown response' }),
      catchError(err => {
        console.error('Error enrolling student:', err);
        return of({ ok: false, msg: err?.error?.message || err?.message || 'Failed to enroll student' });
      })
    );
  }

  /**
   * Remove a student from a batch
   */
  removeStudent(batchId: number, userId: number): Observable<{ ok: boolean | number; msg?: string }> {
    const payload = { batch_id: Number(batchId), users_id: Number(userId) };
    return this.http.post<any>(`${this.baseUrl}/batches/remove-student`, payload).pipe(
      map(res => res || { ok: false, msg: 'Unknown response' }),
      catchError(err => {
        console.error('Error removing student:', err);
        return of({ ok: false, msg: err?.error?.message || err?.message || 'Failed to remove student' });
      })
    );
  }

  /**
   * Load courses list for dropdown
   */
  getCourses(): Observable<any[]> {
    return this.http.post<any>(`${this.baseUrl}/course/getall`, {}).pipe(
      map(res => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        if (res?.value && Array.isArray(res.value)) return res.value;
        return [];
      }),
      catchError(err => {
        console.error('Error fetching courses:', err);
        return of([]);
      })
    );
  }

  /**
   * Load users list (to extract faculty and students)
   */
  getUsers(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/users`).pipe(
      map(res => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        if (res?.value && Array.isArray(res.value)) return res.value;
        return [];
      }),
      catchError(err => {
        console.error('Error fetching users:', err);
        return of([]);
      })
    );
  }
}
