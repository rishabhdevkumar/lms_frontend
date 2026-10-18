import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Configuration } from '../api/configuration';
import { environment } from '../../environments/environment';

export interface UserPayload {
  id?: string | number;
  name?: string;
  fullName?: string;
  email: string;
  password?: string;
  phone?: string;
  role?: string;
  department?: string;
  designation?: string;
  status?: boolean | string;
  [key: string]: any;
}

export interface AdminAddUserDto {
  roll_no?: string | null;
  name: string;
  email: string;
  password: string;
  language?: string | null;
  phone: string;
  dob?: string | null;
  gender?: string | null;
  role?: string | null;
  session_id?: number | null;
  course_id?: number | null;
  semester_id?: number | null;
  aadhar_no?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  board_10th?: string | null;
  total_marks_10th?: number | null;
  percentage_10th?: number | null;
  board_12th?: string | null;
  total_marks_12th?: number | null;
  percentage_12th?: number | null;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private httpClient: HttpClient,
    private apiConfig: Configuration
  ) { }

  private getBasePath(): string {
    return environment.api_url || this.apiConfig.basePath || 'http://localhost:3000';
  }

  /**
   * Login strictly via /users/login or /users/authenticate
   */
  public loginUser(credentials: { email: string; password: string; role?: string }): Observable<any> {
    const basePath = this.getBasePath();
    const payload = {
      email: credentials.email,
      password: credentials.password,
      role: credentials.role || 'student'
    };

    return this.httpClient.post(`${basePath}/users/login`, payload).pipe(
      catchError(() => this.httpClient.post(`${basePath}/users/authenticate`, payload)),
      catchError(() => this.httpClient.post(`${basePath}/user/login`, payload))
    );
  }

  /**
   * Add User strictly via /users/add or /user/add (Self-signup)
   */
  public addUser(user: UserPayload): Observable<any> {
    const basePath = this.getBasePath();
    const payload = {
      name: String(user.name || user.fullName || '').trim(),
      email: String(user.email || '').trim(),
      password: String(user.password || 'Password123!').trim(),
      role: String(user.role || 'student').trim()
    };

    return this.httpClient.post(`${basePath}/users/add`, payload).pipe(
      catchError(() => this.httpClient.post(`${basePath}/user/add`, payload))
    );
  }

  /**
   * Admin Register a New User strictly via /users/admin_add or /users/admin/add
   * Supports all 21 database columns with sp_admin_users_add
   */
  public adminAddUser(dto: AdminAddUserDto): Observable<any> {
    const basePath = this.getBasePath();
    const payload: AdminAddUserDto = {
      roll_no: dto.roll_no ? String(dto.roll_no).trim() : null,
      name: String(dto.name || '').trim(),
      email: String(dto.email || '').trim(),
      password: String(dto.password || '').trim(),
      language: dto.language ? String(dto.language).trim() : null,
      phone: String(dto.phone || '').trim(),
      dob: dto.dob ? String(dto.dob).trim() : null,
      gender: dto.gender ? String(dto.gender).trim() : null,
      role: String(dto.role || 'student').toLowerCase(),
      session_id: dto.session_id ? Number(dto.session_id) : null,
      course_id: dto.course_id ? Number(dto.course_id) : null,
      semester_id: dto.semester_id ? Number(dto.semester_id) : null,
      aadhar_no: dto.aadhar_no ? String(dto.aadhar_no).trim() : null,
      father_name: dto.father_name ? String(dto.father_name).trim() : null,
      mother_name: dto.mother_name ? String(dto.mother_name).trim() : null,
      board_10th: dto.board_10th ? String(dto.board_10th).trim() : null,
      total_marks_10th: dto.total_marks_10th !== undefined && dto.total_marks_10th !== null && String(dto.total_marks_10th) !== '' ? Number(dto.total_marks_10th) : null,
      percentage_10th: dto.percentage_10th !== undefined && dto.percentage_10th !== null && String(dto.percentage_10th) !== '' ? Number(dto.percentage_10th) : null,
      board_12th: dto.board_12th ? String(dto.board_12th).trim() : null,
      total_marks_12th: dto.total_marks_12th !== undefined && dto.total_marks_12th !== null && String(dto.total_marks_12th) !== '' ? Number(dto.total_marks_12th) : null,
      percentage_12th: dto.percentage_12th !== undefined && dto.percentage_12th !== null && String(dto.percentage_12th) !== '' ? Number(dto.percentage_12th) : null,
    };

    return this.httpClient.post(`${basePath}/users/admin_add`, payload).pipe(
      catchError(() => this.httpClient.post(`${basePath}/users/admin/add`, payload)),
      catchError(() => this.httpClient.post(`${basePath}/user/admin_add`, payload)),
      catchError((err) => {
        if (err?.error) return of(err.error);
        return of({ ok: false, msg: err?.message || 'Failed to connect to backend server' });
      })
    );
  }

  /**
   * Update User via /users/update
   */
  public updateUser(dto: { id: string | number; name?: string; email?: string; password?: string; phone?: string; [key: string]: any }): Observable<any> {
    const basePath = this.getBasePath();
    return this.httpClient.post(`${basePath}/users/update`, dto).pipe(
      catchError(() => this.httpClient.put(`${basePath}/users/update`, dto)),
      catchError(() => this.httpClient.put(`${basePath}/users/${dto.id}`, dto)),
      catchError((err) => {
        if (err?.error) return of(err.error);
        return of({ ok: false, msg: err?.message || 'Failed to update user' });
      })
    );
  }

  /**
   * Change User Status (Active / Inactive / Deactive) via /users/status or /users/change_status
   */
  public updateUserStatus(id: string | number, status: string): Observable<any> {
    const basePath = this.getBasePath();
    const payload = { id, status };

    return this.httpClient.post(`${basePath}/users/status`, payload).pipe(
      catchError(() => this.httpClient.post(`${basePath}/users/change_status`, payload)),
      catchError(() => this.httpClient.put(`${basePath}/users/status`, payload)),
      catchError(() => this.httpClient.post(`${basePath}/users/update`, payload)),
      catchError((err) => {
        if (err?.error) return of(err.error);
        return of({ ok: false, msg: err?.message || 'Failed to update user status' });
      })
    );
  }

  /**
   * Get All Users strictly via /users/getall or /user/getall
   */
  public getAllUsers(): Observable<UserPayload[]> {
    const basePath = this.getBasePath();

    return this.httpClient.get(`${basePath}/users`).pipe(
      catchError(() => this.httpClient.post(`${basePath}/users/getall`, {})),
      catchError(() => this.httpClient.get(`${basePath}/users/getall`)),
      catchError(() => this.httpClient.post(`${basePath}/user/getall`, {})),
      map((res: any) => {
        if (Array.isArray(res)) return res;
        return res?.data || res?.users || res?.result || [];
      })
    );
  }
}
