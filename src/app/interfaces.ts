// Database Table Interfaces matching MySQL ERD Schema

export interface student {
  id?: number;
  roll_no?: string | number;
  name?: string;
  email?: string;
  password?: string;
  language?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  category?: string; 
  nationality?: string;
  blood_group?: string;
  session_id?: number | string;
  course_id?: number | string;
  semester_id?: number | string;
  aadhar_no?: string;
  aadhar_card?: string;
  father_name?: string;
  father_mob_no?: string;
  father_occupation?: string;
  mother_name?: string;
  mother_occupation?: string;
  other_mob_no?: string;
  
  // Temporary Address
  temp_house_no?: string;
  temp_pincode?: string;
  temp_locality?: string;
  temp_area?: string;
  temp_city_id?: number | string;
  temp_destrict_id?: number | string;
  temp_state_id?: number | string;
  temp_country_id?: number | string;
  
  // Permanent Address
  perm_house_no?: string;
  perm_pincode?: string;
  perm_locality?: string;
  perm_area?: string;
  perm_destrict_id?: number | string;
  perm_city_id?: number | string;
  perm_state_id?: number | string;
  perm_country_id?: number | string;
  
  // Educational Qualifications
  qualification?: string;
  board_10th?: string;
  passing_year_10th?: number | string;
  total_marks_10th?: number | string;
  division_10th?: string;
  percentage_10th?: number | string;
  admit_card_10th?: string;
  marksheet_10th?: string;

  board_12th?: string;
  passing_year_12th?: number | string;
  total_marks_12th?: number | string;
  division_12th?: string;
  percentage_12th?: number | string;
  admit_card_12th?: string;
  marksheet_12th?: string;

  // Pre Registration & University Info
  pre_registration_no?: string;
  pre_subject?: string;
  KU_reg_no?: string;
  ku_roll_no?: string;
  migration?: string;
  transfer?: string;
  status?: boolean | string;
}

// Alias for PascalCase usage
export type Student = student;

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