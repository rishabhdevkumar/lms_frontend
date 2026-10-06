import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';

export interface QuizItem {
  id: number;
  quizTitle: string;
  courseName: string;
  totalQuestions: number;
  totalMarks: number;
  durationMins: number;
  dueDate: string;
  submissionsCount: number;
  status: 'Published' | 'Draft' | 'Closed';
}

@Component({
  selector: 'app-quizzes',
  templateUrl: './quizzes.page.html',
  styleUrls: ['./quizzes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, HeaderComponent]
})
export class QuizzesPage implements OnInit {

  activeTab: 'all' | 'published' | 'draft' | 'closed' = 'all';
  searchQuery: string = '';

  isAddModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedQuiz: QuizItem | null = null;

  formData: Partial<QuizItem> = {
    quizTitle: '',
    courseName: 'B.Tech Computer Science',
    totalQuestions: 20,
    totalMarks: 50,
    durationMins: 45,
    dueDate: '2026-08-15',
    status: 'Published'
  };

  quizzesList: QuizItem[] = [
    {
      id: 1,
      quizTitle: 'Data Structures & Algorithms Quiz 1',
      courseName: 'B.Tech Computer Science',
      totalQuestions: 25,
      totalMarks: 50,
      durationMins: 45,
      dueDate: '15 Aug 2026',
      submissionsCount: 42,
      status: 'Published'
    },
    {
      id: 2,
      quizTitle: 'Machine Learning Basics Test',
      courseName: 'B.Sc Data Science & AI',
      totalQuestions: 30,
      totalMarks: 60,
      durationMins: 60,
      dueDate: '20 Aug 2026',
      submissionsCount: 38,
      status: 'Published'
    },
    {
      id: 3,
      quizTitle: 'Web Development Mid-Term Quiz',
      courseName: 'B.Tech Information Tech',
      totalQuestions: 20,
      totalMarks: 40,
      durationMins: 30,
      dueDate: '05 Sep 2026',
      submissionsCount: 0,
      status: 'Draft'
    },
    {
      id: 4,
      quizTitle: 'Software Engineering Ethics Assessment',
      courseName: 'M.Tech Software Engg',
      totalQuestions: 15,
      totalMarks: 30,
      durationMins: 25,
      dueDate: '10 May 2026',
      submissionsCount: 36,
      status: 'Closed'
    }
  ];

  constructor() { }

  ngOnInit() { }

  getFilteredQuizzes(): QuizItem[] {
    let list = this.quizzesList;

    if (this.activeTab !== 'all') {
      const target = this.activeTab.toLowerCase();
      list = list.filter(q => q.status.toLowerCase() === target);
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(item =>
        item.quizTitle.toLowerCase().includes(q) ||
        item.courseName.toLowerCase().includes(q)
      );
    }

    return list;
  }

  openAddModal() {
    this.modalMode = 'add';
    this.formData = {
      quizTitle: '',
      courseName: 'B.Tech Computer Science',
      totalQuestions: 20,
      totalMarks: 50,
      durationMins: 45,
      dueDate: '2026-08-25',
      status: 'Published'
    };
    this.isAddModalOpen = true;
  }

  openEditModal(item: QuizItem) {
    this.modalMode = 'edit';
    this.selectedQuiz = item;
    this.formData = { ...item };
    this.isAddModalOpen = true;
  }

  closeModal() {
    this.isAddModalOpen = false;
    this.selectedQuiz = null;
  }

  saveQuiz() {
    if (!this.formData.quizTitle || !this.formData.courseName) return;

    if (this.modalMode === 'add') {
      const newObj: QuizItem = {
        id: Date.now(),
        quizTitle: this.formData.quizTitle || 'New Quiz',
        courseName: this.formData.courseName || 'B.Tech CS',
        totalQuestions: this.formData.totalQuestions || 20,
        totalMarks: this.formData.totalMarks || 50,
        durationMins: this.formData.durationMins || 45,
        dueDate: this.formData.dueDate || '25 Aug 2026',
        submissionsCount: 0,
        status: (this.formData.status as any) || 'Published'
      };
      this.quizzesList.unshift(newObj);
    } else if (this.modalMode === 'edit' && this.selectedQuiz) {
      Object.assign(this.selectedQuiz, this.formData);
    }

    this.closeModal();
  }

  deleteQuiz(id: number) {
    if (confirm('Are you sure you want to delete this quiz assessment?')) {
      this.quizzesList = this.quizzesList.filter(q => q.id !== id);
    }
  }

}
