// Database Table Interfaces matching MySQL ERD Schema

export interface users {
  id?: number;
  roll_no?: number | string;
  name: string;
  email: string;
  password: string;
  language?: string;
  phone?: any;
  dob?: Date | string;
  gender?: string;
  role?: string;
  blood_group?: string;
  session_id?: any;
  course_id?: any;
  semester_id?: any;
  aadhar_n?: number | string;
  father_name?: string;
  father_mob_no?: string;
  mother_name?: string;
  mother_mob_no?: string;
  other_mob_no?: string;
  board_10th?: string;
  total_marks_10th?: number;
  percentage_10th?: any;
  board_12th?: string;
  total_marks_12th?: number;
  percentage_12th?: string;
  status?: boolean;
}

// Aliases for compatibility
export type User = users;
export type student = users;
export type Student = users;

export interface Session {
  id: number;
  session_name: string;
  short_name: string;
  is_active?: boolean;
}

export interface Course {
  id: number;
  session_id: number;
  course_name: string;
  short_name: string;
  is_active?: boolean;
}

export interface Semester {
  id: number;
  course_id: number;
  semester_name: string;
  short_name: string;
  is_active?: boolean;
}

export interface Country {
  id: number;
  country_code: string;
  country_name: string;
  short_name: string;
  is_active?: boolean;
}

export interface State {
  id: number;
  country_id: number;
  state_name: string;
  short_name?: string;
  is_active?: boolean;
}

export interface District {
  id: number;
  state_id: number;
  district_name: string;
  is_active?: boolean;
}

export interface City {
  id: number;
  district_id: number;
  city_name: string;
  is_active?: boolean;
}