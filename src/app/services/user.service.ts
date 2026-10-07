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
   * Add User strictly via /users/add or /user/add
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
   * Get All Users strictly via /users/getall or /user/getall
   */
  public getAllUsers(): Observable<UserPayload[]> {
    const basePath = this.getBasePath();

    return this.httpClient.post(`${basePath}/users/getall`, {}).pipe(
      catchError(() => this.httpClient.get(`${basePath}/users/getall`)),
      catchError(() => this.httpClient.post(`${basePath}/user/getall`, {})),
      map((res: any) => {
        if (Array.isArray(res)) return res;
        return res?.data || res?.users || res?.result || [];
      })
    );
  }
}
