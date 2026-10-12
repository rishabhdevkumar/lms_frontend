import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { toast } from 'ngx-sonner';

export interface CourseMaterial {
  id: string;
  title: string;
  courseCode: string;
  fileType: 'PDF' | 'PPTX' | 'IPYNB' | 'ZIP';
  fileSize: string;
  uploadDate: string;
  downloads: number;
}

@Component({
  selector: 'app-faculty-material',
  templateUrl: './faculty-material.page.html',
  styleUrls: ['./faculty-material.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class FacultyMaterialPage implements OnInit {
  selectedCourseFilter: string = 'all';
  selectedFormatFilter: string = 'all';
  searchQuery: string = '';

  courses = [
    { code: 'CS-402', name: 'CS-402: Web Engineering' },
    { code: 'CS-501', name: 'CS-501: Microservices' },
    { code: 'DS-302', name: 'DS-302: Data Analytics' },
    { code: 'SE-601', name: 'SE-601: Software Architecture' }
  ];

  formatTabs = [
    { label: 'All', value: 'all' },
    { label: 'PDFs', value: 'PDF' },
    { label: 'Slides (PPTX)', value: 'PPTX' },
    { label: 'Notebooks (IPYNB)', value: 'IPYNB' },
    { label: 'Archives (ZIP)', value: 'ZIP' }
  ];

  materialsList: CourseMaterial[] = [
    {
      id: 'MAT-1',
      title: 'Module 1: Angular Directives & Services Deep Dive',
      courseCode: 'CS-402',
      fileType: 'PDF',
      fileSize: '4.2 MB',
      uploadDate: '01 Aug 2026',
      downloads: 42
    },
    {
      id: 'MAT-2',
      title: 'Microservices Architecture & API Gateway Slides',
      courseCode: 'CS-501',
      fileType: 'PPTX',
      fileSize: '12.8 MB',
      uploadDate: '28 Jul 2026',
      downloads: 58
    },
    {
      id: 'MAT-3',
      title: 'Data Analytics Python Jupyter Notebook Samples',
      courseCode: 'DS-302',
      fileType: 'IPYNB',
      fileSize: '1.5 MB',
      uploadDate: '25 Jul 2026',
      downloads: 35
    },
    {
      id: 'MAT-4',
      title: 'Software Design Patterns & SOLID Principles Handbook',
      courseCode: 'SE-601',
      fileType: 'PDF',
      fileSize: '8.1 MB',
      uploadDate: '15 Jul 2026',
      downloads: 88
    }
  ];

  isUploadModalOpen = false;
  newMaterial = {
    course: 'CS-402',
    title: '',
    type: 'PDF' as 'PDF' | 'PPTX' | 'IPYNB' | 'ZIP',
    description: ''
  };

  constructor() {}

  ngOnInit() {}

  get totalDownloadsCount(): number {
    return this.materialsList.reduce((acc, curr) => acc + curr.downloads, 0);
  }

  get filteredMaterials(): CourseMaterial[] {
    return this.materialsList.filter(m => {
      const matchCourse = this.selectedCourseFilter === 'all' || m.courseCode === this.selectedCourseFilter;
      const matchFormat = this.selectedFormatFilter === 'all' || m.fileType === this.selectedFormatFilter;
      
      const q = this.searchQuery.toLowerCase().trim();
      const matchSearch = 
        !q || 
        m.title.toLowerCase().includes(q) || 
        m.courseCode.toLowerCase().includes(q);

      return matchCourse && matchFormat && matchSearch;
    });
  }

  getFormatCount(format: string): number {
    if (format === 'all') return this.materialsList.length;
    return this.materialsList.filter(m => m.fileType === format).length;
  }

  getCourseThemeClass(code: string): string {
    const map: { [key: string]: string } = {
      'CS-402': 'theme-royal-blue',
      'CS-501': 'theme-cyan-blue',
      'DS-302': 'theme-emerald-green',
      'SE-601': 'theme-violet-purple'
    };
    return map[code] || 'theme-royal-blue';
  }

  openUploadModal() {
    this.isUploadModalOpen = true;
  }

  closeUploadModal() {
    this.isUploadModalOpen = false;
  }

  submitUpload() {
    if (!this.newMaterial.title || !this.newMaterial.title.trim()) {
      toast.error('Title Required', {
        description: 'Please enter a title for the resource.'
      });
      return;
    }
    this.materialsList.unshift({
      id: `MAT-${Math.floor(100 + Math.random() * 900)}`,
      title: this.newMaterial.title,
      courseCode: this.newMaterial.course,
      fileType: this.newMaterial.type,
      fileSize: '3.5 MB',
      uploadDate: 'Just Now',
      downloads: 0
    });
    toast.success('Resource Uploaded', {
      description: `"${this.newMaterial.title}" uploaded successfully.`
    });
    this.newMaterial = { course: 'CS-402', title: '', type: 'PDF', description: '' };
    this.closeUploadModal();
  }

  downloadMaterial(mat: CourseMaterial) {
    mat.downloads += 1;
    toast.info('Downloading Resource', {
      description: `Preparing download for "${mat.title}" (${mat.fileSize})...`
    });
  }

  deleteMaterial(mat: CourseMaterial) {
    if (confirm(`Are you sure you want to delete "${mat.title}"?`)) {
      this.materialsList = this.materialsList.filter(m => m.id !== mat.id);
      toast.info('Resource Deleted', {
        description: `"${mat.title}" was removed from course materials.`
      });
    }
  }
}
