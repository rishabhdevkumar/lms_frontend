
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
  mother_name?: string;
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

export interface Student {
  id?: number;
  users_id: number;
  rollNo: string;
  name: string;
  email: string;
  profile_image: string;
  fallbackInitials?: boolean;
  session_id?: number | null;
  sessionName: string;
  course_id?: number | null;
  courseName: string;
  semester_id?: number | null;
  semesterName: string;
  status: 'Present' | 'Absent' | 'Late';
  attendanceRecordId?: number | null;
}

export interface CourseOption {
  id: number;
  code: string;
  name: string;
  department: string;
  room: string;
  session_id?: number;
}

export interface SessionOption {
  id: number;
  session_name: string;
  short_name?: string;
}

export interface SemesterOption {
  id: number;
  course_id?: number;
  semester_name: string;
  short_name?: string;
}

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

export interface BatchItemBackend {
  id: number;
  batch_code: string;
  course_id: number;
  course_name: string;
  course_short_name?: string;
  users_id: number;
  instructor_name: string;
  instructor_email?: string;
  instructor_phone?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  room?: string;
  status: 'active' | 'upcoming' | 'completed' | string;
  created_at?: string;
  updated_at?: string;
  enrolled_students_count: number;
}

export interface BatchStudent {
  enrollment_id: number;
  batch_id: number;
  enrolled_at: string;
  user_id: number;
  roll_no?: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  student_status?: string;
}

export interface AddBatchPayload {
  course_id: number;
  users_id: number;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  room?: string | null;
  status?: string;
}

export interface UpdateBatchPayload {
  id: number;
  batch_code?: string | null;
  course_id: number;
  users_id: number;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  room?: string | null;
  status: string;
}

export interface SyllabusPayload {
  id?: number | string;
  course_id: number;
  semester_id: number;
  syllabus_name: string;
  syllabus: string;
  syllabus_pdf?: string | null;
  is_active?: number;
  [key: string]: any;
}

export interface SyllabusResponse {
  ok: boolean;
  msg: string;
  data?: any;
  error?: string;
}
