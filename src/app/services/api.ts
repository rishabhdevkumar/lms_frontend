import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private rt: Router
  ) { }
  
  async post(path: string, body: any = {}, type: string = "JSON") {
    const normalizePath = (p: string) => p.startsWith('/') ? p : '/' + p;
    const rawPath = normalizePath(path);
    
    // Candidate route variations to ensure compatibility with any backend router
    const pathsToTry = [
      rawPath,                                            // e.g. /sp_session_add
      '/api' + rawPath,                                   // e.g. /api/sp_session_add
      rawPath.replace('/sp_', '/'),                       // e.g. /session_add
      rawPath.replace('/sp_', '/').replace('_', '/'),     // e.g. /session/add
      '/api' + rawPath.replace('/sp_', '/').replace('_', '/') // e.g. /api/session/add
    ];

    // Remove duplicates while preserving order
    const uniquePaths = Array.from(new Set(pathsToTry));

    for (const p of uniquePaths) {
      try {
        let headers: any = {
          "Authorization": localStorage.getItem("token") || ""
        };

        if (type === "JSON") {
          headers["Content-Type"] = "application/json";
        }

        const url = environment.api_url + p;
        let res = await fetch(url, {
          method: "POST",
          headers: headers,
          body: type === "JSON" ? JSON.stringify(body) : body
        });

        // If not 404, we found the right backend endpoint
        if (res.status !== 404) {
          if (!res.ok) {
            return { ok: false, status: res.status, msg: "Server returned error status" };
          }
          
          let data: any = null;
          switch (type) {
            case "JSON":
              data = await res.json();
              break;
            case "Blob":
              data = await res.blob();
              break;
          }

          if (typeof data === "object" && data && !data.ok && data.type === "LOGIN") {
            this.logout();
            return data;
          } else {
            return data;
          }
        }
      } catch (e) {
        console.warn(`Attempt failed for endpoint ${p}:`, e);
      }
    }

    return { ok: false, status: 404, msg: `Endpoint ${path} not found on server` };
  }

  async post_form(path: string, body: FormData, type: string = "JSON") {
    try {
      let headers: any = {
        "Authorization": localStorage.getItem("token") || ""
      };
  
      let res = await fetch(environment.api_url + (path.startsWith('/') ? path : '/' + path), {
        method: "POST",
        headers: headers,
        body: body
      });
  
      if (!res.ok) {
        return { ok: false, status: res.status, msg: "Something went wrong" };
      } else {
        let data: any = null;
        switch (type) {
          case "JSON":
            data = await res.json();
            break;
          case "Blob":
            data = await res.blob();
            break;
        }
        if (typeof data === "object" && data && !data.ok && data.type === "LOGIN") {
          this.logout();
          return data;
        } else return data;
      }
    } catch (e) {
      return { ok: false, error: e, msg: "Something went wrong" };
    }
  }

  async fetch_blob(path: string, body: any = {}) {
    try {
      let res = await fetch(environment.api_url + (path.startsWith('/') ? path : '/' + path), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("token") || ""
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        return await res.blob();
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  logout() {
    localStorage.removeItem("token");
    this.rt.navigate(['/login']);
  }
}
