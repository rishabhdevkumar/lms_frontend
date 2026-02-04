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
  
  async post(path: string, body: any={}, type: string="JSON") {
    try {
      let headers: any = {
        "Authorization": localStorage.getItem("token") || ""
      };

      if (type == "JSON") {
        headers["Content-Type"] = "application/json";
      }
      let res = await fetch(environment.api_url + path, {
        method: "POST",
        headers: headers,
        body: type=="JSON" ? JSON.stringify(body): body
      });
      if (!res.ok) {
        return { ok: false, status: res.status, msg: "Something went wrong" };
      } else {
        let data: any = null;
        switch(type){
          case "JSON":
            data = await res.json()
          break;
          case "Blob":
            data = await res.blob()
          break;
        }
        if( typeof data === "object" && !data.ok && data.type == "LOGIN" ){
          this.logout();
          return data;
        }else return data;
      }
    } catch (e) {
      return { ok: false, error: e, msg: "Something went wrong" };
    }
  }



  async post_form(path: string, body: FormData, type: string="JSON") {
    try {
      let headers: any = {
        "Authorization": localStorage.getItem("token") || ""
      };
  
      if (type == "JSON") {
        headers["Content-Type"] = "application/json";
      }
  
      let res = await fetch(environment.api_url + path, {
        method: "POST",
        headers: headers,
        body: body
      });
  
      if (!res.ok) {
        return { ok: false, status: res.status, msg: "Something went wrong" };
      } else {
        let data: any = null;
        switch(type){
          case "JSON":
            data = await res.json()
          break;
          case "Blob":
            data = await res.blob()
          break;
        }
        if( typeof data === "object" && !data.ok && data.type == "LOGIN" ){
          this.logout();
          return data;
        }else return data;
      }
    } catch (e) {
      return { ok: false, error: e, msg: "Something went wrong" };
    }
  }


  async fetch_blob(path: string, body: any = {}) 
  {
    try {
      let res = await fetch(environment.api_url + path,
        {
          method: "POST",
          headers: 
          {
            "Content-Type" : "application/json",
        "Authorization": localStorage.getItem("token") || ""
      },
      body: JSON.stringify(body)
    })
      if (!res.ok) {
        return false;
      } else {
        let data =  await res.blob()
        return data;
      }
    }catch(e){
      return false;
      }
    }


  async isLoggedIn(){
    return !!localStorage.getItem('token');
  }

   logout(){
    localStorage.removeItem("student")
    localStorage.removeItem("admin")
    localStorage.removeItem("token")
    window.location.href = "/login"
  }
}
