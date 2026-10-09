import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

export interface LiveSession {
  id: number;
  title: string;
  category: string;
  instructorName: string;
  instructorRole: string;
  instructorAvatar: string;
  status: 'live' | 'upcoming' | 'recorded';
  viewersCount?: string;
  scheduledTime?: string;
  date?: string;
  duration: string;
  thumbnail: string;
  topicTag: string;
}

@Component({
  selector: 'app-live-classes-page',
  templateUrl: './live-classes.page.html',
  styleUrls: ['./live-classes.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonicModule, NavbarComponent],
})
export class LiveClassesPage implements OnInit {
  activeTab: 'all' | 'live' | 'upcoming' | 'recorded' = 'all';

  showToast = false;
  toastMessage = '';

  activeLiveStream: LiveSession = {
    id: 101,
    title: 'Mastering Angular 18 & Signals Architecture Workshop',
    category: 'Web Development',
    instructorName: 'Dr. Sarah Jenkins',
    instructorRole: 'Principal Angular Architect',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'live',
    viewersCount: '1,840 Active Viewers',
    duration: '2h 30m',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    topicTag: 'Angular 18 & RxJS'
  };

  liveSessions: LiveSession[] = [
    {
      id: 1,
      title: 'Real-World AI Engineering with LLMs & Vector Databases',
      category: 'Artificial Intelligence',
      instructorName: 'Prof. Marcus Vance',
      instructorRole: 'AI Lead Researcher',
      instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'live',
      viewersCount: '920 Live Now',
      duration: '1h 45m',
      thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&auto=format&fit=crop&q=80',
      topicTag: 'AI & Vector DB'
    },
    {
      id: 2,
      title: 'Figma to Code: Building Responsive Enterprise Design Systems',
      category: 'UI/UX Design',
      instructorName: 'Elena Rostova',
      instructorRole: 'Product Design Director',
      instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'upcoming',
      scheduledTime: 'Today at 5:00 PM EST',
      date: 'OCT 09',
      duration: '1h 30m',
      thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&auto=format&fit=crop&q=80',
      topicTag: 'UI/UX & Figma'
    },
    {
      id: 3,
      title: 'System Design 101: Scaling Microservices to Millions of Requests',
      category: 'Computer Science',
      instructorName: 'Rishabh Dev Kumar',
      instructorRole: 'Principal Systems Architect',
      instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      status: 'upcoming',
      scheduledTime: 'Tomorrow at 11:00 AM EST',
      date: 'OCT 10',
      duration: '2 hrs',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      topicTag: 'System Design'
    },
    {
      id: 4,
      title: 'DevOps Mastery: CI/CD Pipelines & Kubernetes Deployment',
      category: 'DevOps & Cloud',
      instructorName: 'David K. Miller',
      instructorRole: 'Cloud Solutions Specialist',
      instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      status: 'recorded',
      duration: '2h 10m',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
      topicTag: 'DevOps Replay'
    },
    {
      id: 5,
      title: 'Full-Stack Security & OWASP Top 10 Prevention Tactics',
      category: 'Cybersecurity',
      instructorName: 'Alex Rivera',
      instructorRole: 'Security Audit Lead',
      instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'recorded',
      duration: '1h 50m',
      thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
      topicTag: 'Security Replay'
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  get filteredSessions(): LiveSession[] {
    if (this.activeTab === 'all') return this.liveSessions;
    return this.liveSessions.filter(s => s.status === this.activeTab);
  }

  joinLiveStream(session: LiveSession) {
    if (this.authService.isLoggedInValue) {
      this.triggerToast(`Joining live interactive room for "${session.title}"...`);
    } else {
      this.triggerToast(`Please sign in to join the live session "${session.title}".`);
    }
  }

  reserveSeat(session: LiveSession) {
    this.triggerToast(`Seat reserved for "${session.title}"! Calendar invite sent.`);
  }

  triggerToast(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3500);
  }
}
