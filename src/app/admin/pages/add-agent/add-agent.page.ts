import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { UserService } from '../../../services/user.service';

export interface FacultyStaff {
  id: number;
  staffId: string;
  name: string;
  email: string;
  phone: string;
  type: 'Faculty' | 'Agent';
  department: string;
  designation: string;
  assignedCourses?: string;
  status: 'Active' | 'Suspended';
  joiningDate: string;
  avatarBg: string;
}

@Component({
  selector: 'app-add-agent',
  templateUrl: './add-agent.page.html',
  styleUrls: ['./add-agent.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class AddAgentPage implements OnInit {

  // ACTIVE TAB & SEARCH
  activeTab: 'faculty' | 'agent' = 'faculty';
  searchText = '';
  statusFilter = 'All';

  // MODAL STATES
  isViewModalOpen = false;
  isAddEditModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  
  selectedItem: FacultyStaff | null = null;

  // FORM MODEL FOR ADD / EDIT
  formData: Partial<FacultyStaff> = {
    name: '',
    email: '',
    phone: '',
    type: 'Faculty',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    assignedCourses: 'B.Tech CS, Data Science',
    status: 'Active'
  };

  // FACULTY LIST DATASET
  facultyList: FacultyStaff[] = [
    {
      id: 1,
      staffId: 'FAC-2026-01',
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@lms-edu.com',
      phone: '+91 98111 22334',
      type: 'Faculty',
      department: 'Computer Science & Engineering',
      designation: 'Senior Professor',
      assignedCourses: 'Data Structures, AI & ML',
      status: 'Active',
      joiningDate: '15 Aug 2022',
      avatarBg: '#059669'
    },
    {
      id: 2,
      staffId: 'FAC-2026-02',
      name: 'Dr. Sunita Rao',
      email: 'sunita.rao@lms-edu.com',
      phone: '+91 98222 33445',
      type: 'Faculty',
      department: 'Data Science & AI',
      designation: 'Associate Professor',
      assignedCourses: 'Python for DS, Neural Networks',
      status: 'Active',
      joiningDate: '10 Jan 2023',
      avatarBg: '#2563eb'
    },
    {
      id: 3,
      staffId: 'FAC-2026-03',
      name: 'Prof. Vikramaditya Roy',
      email: 'vikram.roy@lms-edu.com',
      phone: '+91 98333 44556',
      type: 'Faculty',
      department: 'Information Technology',
      designation: 'Assistant Professor',
      assignedCourses: 'Web Technologies, Cloud Computing',
      status: 'Suspended',
      joiningDate: '01 Jun 2024',
      avatarBg: '#ef4444'
    },
    {
      id: 4,
      staffId: 'FAC-2026-04',
      name: 'Dr. Meera Deshmukh',
      email: 'meera.deshmukh@lms-edu.com',
      phone: '+91 98444 55667',
      type: 'Faculty',
      department: 'Software Engineering',
      designation: 'Head of Department',
      assignedCourses: 'Software Architecture, DevOps',
      status: 'Active',
      joiningDate: '01 Mar 2021',
      avatarBg: '#7c3aed'
    }
  ];

  // AGENTS / STAFF LIST DATASET
  agentsList: FacultyStaff[] = [
    {
      id: 101,
      staffId: 'AGT-2026-11',
      name: 'Amit Sharma',
      email: 'amit.sharma@lms-edu.com',
      phone: '+91 97111 88990',
      type: 'Agent',
      department: 'Student Affairs',
      designation: 'Academic Counselor',
      assignedCourses: 'Student Admissions & Support',
      status: 'Active',
      joiningDate: '01 Nov 2023',
      avatarBg: '#d97706'
    },
    {
      id: 102,
      staffId: 'AGT-2026-12',
      name: 'Ritu Kapoor',
      email: 'ritu.kapoor@lms-edu.com',
      phone: '+91 97222 99001',
      type: 'Agent',
      department: 'Registrar Office',
      designation: 'Admissions Coordinator',
      assignedCourses: 'Enrollment & Verification',
      status: 'Active',
      joiningDate: '15 Feb 2024',
      avatarBg: '#059669'
    },
    {
      id: 103,
      staffId: 'AGT-2026-13',
      name: 'Alok Singh',
      email: 'alok.singh@lms-edu.com',
      phone: '+91 97333 00112',
      type: 'Agent',
      department: 'Academic Cell',
      designation: 'Examination Support Officer',
      assignedCourses: 'Exams & Grading Admin',
      status: 'Suspended',
      joiningDate: '10 Aug 2024',
      avatarBg: '#ef4444'
    }
  ];

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.loadUsersFromBackend();
  }

  loadUsersFromBackend() {
    this.userService.getAllUsers().subscribe({
      next: (users: any[]) => {
        if (users && users.length > 0) {
          const loadedFaculty: FacultyStaff[] = [];
          const loadedAgents: FacultyStaff[] = [];

          users.forEach((u, index) => {
            const isFaculty = u.role === 'faculty' || u.type === 'Faculty';
            const staffItem: FacultyStaff = {
              id: u.id || index + 1,
              staffId: u.staffId || u.id || (isFaculty ? `FAC-2026-${10 + index}` : `AGT-2026-${10 + index}`),
              name: u.name || u.fullName || 'User',
              email: u.email || '',
              phone: u.phone || '+91 98000 00000',
              type: isFaculty ? 'Faculty' : 'Agent',
              department: u.department || 'Academic Department',
              designation: u.designation || (isFaculty ? 'Professor' : 'Officer'),
              assignedCourses: u.assignedCourses || 'General Courses',
              status: (u.status === false || u.status === 'Suspended') ? 'Suspended' : 'Active',
              joiningDate: u.joiningDate || 'Recently Added',
              avatarBg: isFaculty ? '#059669' : '#d97706'
            };

            if (isFaculty) {
              loadedFaculty.push(staffItem);
            } else {
              loadedAgents.push(staffItem);
            }
          });

          if (loadedFaculty.length > 0) this.facultyList = loadedFaculty;
          if (loadedAgents.length > 0) this.agentsList = loadedAgents;
        }
      },
      error: (err) => console.warn('Could not fetch live users:', err)
    });
  }

  // SWITCH TAB
  selectTab(tab: 'faculty' | 'agent') {
    this.activeTab = tab;
    this.searchText = '';
    this.statusFilter = 'All';
  }

  // GET ACTIVE LIST
  getCurrentList(): FacultyStaff[] {
    return this.activeTab === 'faculty' ? this.facultyList : this.agentsList;
  }

  // FILTERED LIST
  getFilteredItems(): FacultyStaff[] {
    const list = this.getCurrentList();
    return list.filter(item => {
      const matchesSearch = !this.searchText ||
        item.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item.department.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item.designation.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesStatus = this.statusFilter === 'All' || item.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  // STAT COUNTS
  getActiveCount(): number {
    return this.getCurrentList().filter(i => i.status === 'Active').length;
  }

  getSuspendedCount(): number {
    return this.getCurrentList().filter(i => i.status === 'Suspended').length;
  }

  // VIEW DETAILS MODAL
  openViewModal(item: FacultyStaff) {
    this.selectedItem = item;
    this.isViewModalOpen = true;
  }

  closeViewModal() {
    this.isViewModalOpen = false;
    this.selectedItem = null;
  }

  // OPEN ADD MODAL
  openAddModal() {
    this.modalMode = 'add';
    this.resetFormData();
    this.formData.type = this.activeTab === 'faculty' ? 'Faculty' : 'Agent';
    this.isAddEditModalOpen = true;
  }

  // OPEN EDIT MODAL
  openEditModal(item: FacultyStaff) {
    this.modalMode = 'edit';
    this.selectedItem = item;
    this.formData = { ...item };
    this.isAddEditModalOpen = true;
  }

  closeAddEditModal() {
    this.isAddEditModalOpen = false;
    this.selectedItem = null;
    this.resetFormData();
  }

  resetFormData() {
    this.formData = {
      name: '',
      email: '',
      phone: '',
      type: this.activeTab === 'faculty' ? 'Faculty' : 'Agent',
      department: 'Computer Science & Engineering',
      designation: 'Assistant Professor',
      assignedCourses: 'B.Tech CS, Data Science',
      status: 'Active'
    };
  }

  // SAVE ITEM (CREATE / UPDATE) VIA BACKEND USER SERVICE
  saveItem() {
    if (!this.formData.name || !this.formData.email) return;

    if (this.modalMode === 'add') {
      const role = this.activeTab === 'faculty' ? 'faculty' : 'agent';
      this.userService.addUser({
        name: this.formData.name,
        fullName: this.formData.name,
        email: this.formData.email,
        phone: this.formData.phone,
        role: role,
        department: this.formData.department,
        designation: this.formData.designation,
        status: this.formData.status === 'Active'
      }).subscribe({
        next: () => {
          this.loadUsersFromBackend();
        },
        error: () => {
          // Fallback UI update
          const list = this.getCurrentList();
          const newId = list.length ? Math.max(...list.map(i => i.id)) + 1 : 1;
          const prefix = this.activeTab === 'faculty' ? 'FAC' : 'AGT';
          const randomNum = Math.floor(10 + Math.random() * 90);

          const newItem: FacultyStaff = {
            id: newId,
            staffId: `${prefix}-2026-${randomNum}`,
            name: this.formData.name!,
            email: this.formData.email!,
            phone: this.formData.phone || '+91 98000 00000',
            type: this.activeTab === 'faculty' ? 'Faculty' : 'Agent',
            department: this.formData.department || 'Academic Department',
            designation: this.formData.designation || 'Academic Officer',
            assignedCourses: this.formData.assignedCourses || 'General Courses',
            status: (this.formData.status as 'Active' | 'Suspended') || 'Active',
            joiningDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            avatarBg: this.activeTab === 'faculty' ? '#059669' : '#d97706'
          };

          if (this.activeTab === 'faculty') {
            this.facultyList.unshift(newItem);
          } else {
            this.agentsList.unshift(newItem);
          }
        }
      });
    } else if (this.modalMode === 'edit' && this.selectedItem) {
      if (this.activeTab === 'faculty') {
        const idx = this.facultyList.findIndex(f => f.id === this.selectedItem?.id);
        if (idx !== -1) {
          this.facultyList[idx] = { ...this.facultyList[idx], ...this.formData } as FacultyStaff;
        }
      } else {
        const idx = this.agentsList.findIndex(a => a.id === this.selectedItem?.id);
        if (idx !== -1) {
          this.agentsList[idx] = { ...this.agentsList[idx], ...this.formData } as FacultyStaff;
        }
      }
    }

    this.closeAddEditModal();
  }

  // TOGGLE STATUS (ACTIVATE / SUSPEND)
  toggleStatus(item: FacultyStaff) {
    const newStatus = item.status === 'Active' ? 'Suspended' : 'Active';
    const actionText = newStatus === 'Suspended' ? 'suspend' : 'activate';
    
    if (confirm(`Are you sure you want to ${actionText} ${item.name}?`)) {
      item.status = newStatus;
    }
  }

  // HELPER GET INITIALS
  getInitials(name: string): string {
    if (!name) return 'FC';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
