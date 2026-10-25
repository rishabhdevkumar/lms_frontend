import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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

export interface AdminUpdateUserDto {
  id: string | number;
  roll_no?: string | null;
  name: string;
  email: string;
  password?: string | null;
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
  status?: string | null;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = environment.api_url;

  constructor(
    private httpClient: HttpClient
  ) { }

  private normalizeResponse(res: any): { ok: boolean; msg: string; data?: any; [key: string]: any } {
    if (!res) {
      return { ok: false, msg: 'No response from server' };
    }
    if (res.statusCode && res.statusCode >= 400) {
      const msg = Array.isArray(res.message) ? res.message.join(', ') : (res.message || res.error || 'Request failed');
      return { ...res, ok: false, msg };
    }
    const okVal = res.ok !== undefined
      ? (res.ok === true || res.ok === 1 || res.ok === '1' || res.ok === 'true')
      : (!res.error && !res.statusCode);
    return {
      ...res,
      ok: Boolean(okVal),
      msg: res.msg || res.message || (okVal ? 'Success' : 'Operation failed')
    };
  }

  private handleHttpError(err: any): Observable<any> {
    const errBody = err?.error || {};
    const msg = Array.isArray(errBody.message)
      ? errBody.message.join(', ')
      : (errBody.message || errBody.msg || err?.message || 'Server connection error');
    return of({ ok: false, msg, statusCode: err?.status || 500, ...errBody });
  }

  /**
   * Login strictly via /users/login or /users/authenticate
   */
  public loginUser(credentials: { email: string; password: string; role?: string }): Observable<any> {
    const basePath = this.baseUrl;
    const payload = {
      email: credentials.email,
      password: credentials.password,
      role: credentials.role || 'student'
    };

    return this.httpClient.post(`${basePath}/users/login`, payload).pipe(
      catchError(() => this.httpClient.post(`${basePath}/users/authenticate`, payload)),
      catchError(() => this.httpClient.post(`${basePath}/user/login`, payload)),
      map(res => this.normalizeResponse(res)),
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Add User strictly via /users/add or /user/add (Self-signup)
   */
  public addUser(user: UserPayload): Observable<any> {
    const basePath = this.baseUrl;
    const payload = {
      name: String(user.name || user.fullName || '').trim(),
      email: String(user.email || '').trim(),
      password: String(user.password || 'Password123!').trim(),
      role: String(user.role || 'student').trim()
    };

    return this.httpClient.post(`${basePath}/users/add`, payload).pipe(
      catchError(() => this.httpClient.post(`${basePath}/user/add`, payload)),
      map(res => this.normalizeResponse(res)),
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Admin Register a New User strictly via /users/admin_add or /users/admin/add
   * Supports all 21 database columns with sp_admin_users_add
   */
  public adminAddUser(dto: AdminAddUserDto): Observable<any> {
    const basePath = this.baseUrl;
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
      map(res => this.normalizeResponse(res)),
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Update User via /users/update (all 22 fields for sp_users_update)
   */
  public updateUser(dto: AdminUpdateUserDto): Observable<any> {
    const basePath = this.baseUrl;
    const payload: any = {
      id: Number(dto.id) || dto.id,
      name: String(dto.name || '').trim(),
      email: String(dto.email || '').trim(),
      phone: String(dto.phone || '').trim(),
    };

    if (dto.roll_no !== undefined && dto.roll_no !== null) payload.roll_no = String(dto.roll_no).trim();
    if (dto.password && String(dto.password).trim() !== '') payload.password = String(dto.password).trim();
    if (dto.role) payload.role = String(dto.role).toLowerCase();
    if (dto.gender) payload.gender = String(dto.gender).trim();
    if (dto.dob !== undefined) payload.dob = dto.dob ? String(dto.dob).trim() : null;
    if (dto.language !== undefined) payload.language = dto.language ? String(dto.language).trim() : null;
    if (dto.session_id !== undefined) payload.session_id = dto.session_id ? Number(dto.session_id) : null;
    if (dto.course_id !== undefined) payload.course_id = dto.course_id ? Number(dto.course_id) : null;
    if (dto.semester_id !== undefined) payload.semester_id = dto.semester_id ? Number(dto.semester_id) : null;
    if (dto.aadhar_no !== undefined) payload.aadhar_no = dto.aadhar_no ? String(dto.aadhar_no).trim() : null;
    if (dto.father_name !== undefined) payload.father_name = dto.father_name ? String(dto.father_name).trim() : null;
    if (dto.mother_name !== undefined) payload.mother_name = dto.mother_name ? String(dto.mother_name).trim() : null;
    if (dto.board_10th !== undefined) payload.board_10th = dto.board_10th ? String(dto.board_10th).trim() : null;
    if (dto.total_marks_10th !== undefined) payload.total_marks_10th = dto.total_marks_10th !== null && String(dto.total_marks_10th) !== '' ? Number(dto.total_marks_10th) : null;
    if (dto.percentage_10th !== undefined) payload.percentage_10th = dto.percentage_10th !== null && String(dto.percentage_10th) !== '' ? Number(dto.percentage_10th) : null;
    if (dto.board_12th !== undefined) payload.board_12th = dto.board_12th ? String(dto.board_12th).trim() : null;
    if (dto.total_marks_12th !== undefined) payload.total_marks_12th = dto.total_marks_12th !== null && String(dto.total_marks_12th) !== '' ? Number(dto.total_marks_12th) : null;
    if (dto.percentage_12th !== undefined) payload.percentage_12th = dto.percentage_12th !== null && String(dto.percentage_12th) !== '' ? Number(dto.percentage_12th) : null;
    if (dto.status !== undefined) payload.status = String(dto.status);

    return this.httpClient.post(`${basePath}/users/update`, payload).pipe(
      map(res => this.normalizeResponse(res)),
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Change User Status via /users/status using sp_users_toggle_status (is_active 0 or 1)
   */
  public updateUserStatus(id: string | number, status: string | number | boolean): Observable<any> {
    const basePath = this.baseUrl;
    const userId = Number(id) || id;

    let isActive = 1;
    let statusStr = 'Active';

    if (typeof status === 'number') {
      isActive = status === 1 ? 1 : 0;
      statusStr = isActive === 1 ? 'Active' : 'Deactive';
    } else if (typeof status === 'boolean') {
      isActive = status ? 1 : 0;
      statusStr = isActive === 1 ? 'Active' : 'Deactive';
    } else {
      const lower = String(status || '').trim().toLowerCase();
      if (lower === '0' || lower === 'false' || lower.includes('deact') || lower.includes('inact') || lower.includes('lock')) {
        isActive = 0;
        statusStr = 'Deactive';
      } else {
        isActive = 1;
        statusStr = 'Active';
      }
    }

    const payload = {
      id: userId,
      user_id: userId,
      is_active: isActive,
      status: statusStr
    };

    return this.httpClient.post(`${basePath}/users/status`, payload).pipe(
      map(res => this.normalizeResponse(res)),
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get All Users strictly via /users/getall or /user/getall
   */
  public getAllUsers(): Observable<UserPayload[]> {
    const basePath = this.baseUrl;

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
