import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FacultyHeaderComponent } from '../../components/faculty-header/faculty-header.component';

@Component({
  selector: 'app-faculty-material',
  templateUrl: './faculty-material.page.html',
  styleUrls: ['./faculty-material.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, FacultyHeaderComponent]
})
export class FacultyMaterialPage implements OnInit {
  selectedCourseFilter: string = 'all';

  materialsList = [
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
    type: 'PDF',
    description: ''
  };

  constructor() {}

  ngOnInit() {}

  get filteredMaterials() {
    if (this.selectedCourseFilter === 'all') return this.materialsList;
    return this.materialsList.filter(m => m.courseCode === this.selectedCourseFilter);
  }

  openUploadModal() {
    this.isUploadModalOpen = true;
  }

  closeUploadModal() {
    this.isUploadModalOpen = false;
  }

  submitUpload() {
    if (!this.newMaterial.title) return;
    this.materialsList.unshift({
      id: `MAT-${Math.floor(100 + Math.random() * 900)}`,
      title: this.newMaterial.title,
      courseCode: this.newMaterial.course,
      fileType: this.newMaterial.type,
      fileSize: '3.5 MB',
      uploadDate: 'Just Now',
      downloads: 0
    });
    alert(`Resource "${this.newMaterial.title}" uploaded successfully!`);
    this.newMaterial = { course: 'CS-402', title: '', type: 'PDF', description: '' };
    this.closeUploadModal();
  }

  deleteMaterial(mat: any) {
    if (confirm(`Are you sure you want to delete "${mat.title}"?`)) {
      this.materialsList = this.materialsList.filter(m => m.id !== mat.id);
    }
  }
}
