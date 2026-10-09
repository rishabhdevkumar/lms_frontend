import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

export interface Course {
  id: number;
  title: string;
  category: string;
  categoryName: string;
  level: string;
  rating: number;
  reviewsCount: number;
  studentsCount: string;
  duration: string;
  lessons: number;
  instructorName: string;
  instructorTitle: string;
  instructorAvatar: string;
  price: number;
  originalPrice: number;
  badge: string;
  badgeColor: string;
  image: string;
}

@Component({
  selector: 'app-courses-page',
  templateUrl: './courses.page.html',
  styleUrls: ['./courses.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonicModule, NavbarComponent],
})
export class CoursesPage implements OnInit {
  searchQuery = '';
  selectedCategory = 'all';
  selectedLevel = 'all';

  showToast = false;
  toastMessage = '';

  categories = [
    { id: 'all', name: 'All Categories', icon: '🌐' },
    { id: 'web', name: 'Web Development', icon: '💻' },
    { id: 'cs', name: 'Computer Science', icon: '⚡' },
    { id: 'ai', name: 'AI & Data Science', icon: '🤖' },
    { id: 'design', name: 'UI/UX Design', icon: '🎨' },
    { id: 'business', name: 'Business & Finance', icon: '📈' },
  ];

  allCourses: Course[] = [
    {
      id: 1,
      title: 'Full-Stack Web Development Mastery (Angular & Node.js)',
      category: 'web',
      categoryName: 'Web Development',
      level: 'intermediate',
      rating: 4.9,
      reviewsCount: 1420,
      studentsCount: '18.5k',
      duration: '54 hrs',
      lessons: 140,
      instructorName: 'Dr. Sarah Jenkins',
      instructorTitle: 'Senior Full-Stack Architect',
      instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      price: 89,
      originalPrice: 149,
      badge: 'Bestseller',
      badgeColor: '#2563eb',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      title: 'Python for Data Science, AI & Machine Learning Specialization',
      category: 'ai',
      categoryName: 'AI & Data Science',
      level: 'all',
      rating: 4.95,
      reviewsCount: 2310,
      studentsCount: '24.2k',
      duration: '68 hrs',
      lessons: 180,
      instructorName: 'Prof. Marcus Vance',
      instructorTitle: 'AI Research Lead',
      instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      price: 99,
      originalPrice: 179,
      badge: 'Trending',
      badgeColor: '#d97706',
      image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      title: 'UI/UX Design Systems, Figma & Modern Product Interface Design',
      category: 'design',
      categoryName: 'UI/UX Design',
      level: 'beginner',
      rating: 4.85,
      reviewsCount: 980,
      studentsCount: '12.1k',
      duration: '36 hrs',
      lessons: 95,
      instructorName: 'Elena Rostova',
      instructorTitle: 'Lead Product Designer',
      instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      price: 69,
      originalPrice: 119,
      badge: 'Popular',
      badgeColor: '#10b981',
      image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 4,
      title: 'Data Structures, Algorithms & System Design Interview Bootcamp',
      category: 'cs',
      categoryName: 'Computer Science',
      level: 'advanced',
      rating: 4.92,
      reviewsCount: 1850,
      studentsCount: '15.8k',
      duration: '60 hrs',
      lessons: 160,
      instructorName: 'Rishabh Dev Kumar',
      instructorTitle: 'Lead Systems Architect',
      instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      price: 109,
      originalPrice: 199,
      badge: 'Top Rated',
      badgeColor: '#7c3aed',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 5,
      title: 'Cloud Architecture & DevOps with AWS, Docker & Kubernetes',
      category: 'cs',
      categoryName: 'Computer Science',
      level: 'intermediate',
      rating: 4.88,
      reviewsCount: 1120,
      studentsCount: '14.0k',
      duration: '45 hrs',
      lessons: 115,
      instructorName: 'David K. Miller',
      instructorTitle: 'Principal Cloud Consultant',
      instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      price: 85,
      originalPrice: 139,
      badge: 'Hot',
      badgeColor: '#ef4444',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 6,
      title: 'Financial Analysis, Corporate Valuation & Financial Modeling 2026',
      category: 'business',
      categoryName: 'Business & Finance',
      level: 'all',
      rating: 4.81,
      reviewsCount: 760,
      studentsCount: '9.4k',
      duration: '30 hrs',
      lessons: 80,
      instructorName: 'Rachel Green',
      instructorTitle: 'Chartered Financial Analyst',
      instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      price: 79,
      originalPrice: 129,
      badge: 'New',
      badgeColor: '#06b6d4',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  get filteredCourses(): Course[] {
    return this.allCourses.filter((course) => {
      const matchesCat = this.selectedCategory === 'all' || course.category === this.selectedCategory;
      const matchesLevel = this.selectedLevel === 'all' || course.level === this.selectedLevel;
      const matchesQuery = !this.searchQuery || 
        course.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        course.categoryName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        course.instructorName.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesCat && matchesLevel && matchesQuery;
    });
  }

  setCategory(catId: string) {
    this.selectedCategory = catId;
  }

  enrollCourse(course: Course) {
    if (this.authService.isLoggedInValue) {
      this.triggerToast(`Successfully enrolled in "${course.title}"! Redirecting to student portal...`);
      setTimeout(() => {
        this.authService.navigateToDashboard();
      }, 1500);
    } else {
      this.triggerToast(`Please sign in to enroll in "${course.title}".`);
    }
  }

  triggerToast(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3500);
  }
}
