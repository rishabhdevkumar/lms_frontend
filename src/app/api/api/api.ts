export * from './admin.service';
import { AdminService } from './admin.service';
export * from './default.service';
import { DefaultService } from './default.service';
export * from './faculty.service';
import { FacultyService } from './faculty.service';
export * from './student.service';
import { StudentService } from './student.service';
export const APIS = [AdminService, DefaultService, FacultyService, StudentService];
