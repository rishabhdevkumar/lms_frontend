import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, NavbarComponent, FooterComponent],
})
export class HomePage {

  categories = [
    { icon: '💻', name: 'Programming', count: '45+ Courses', color: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
    { icon: '🌐', name: 'Web Development', count: '60+ Courses', color: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
    { icon: '🤖', name: 'AI & Machine Learning', count: '35+ Courses', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
    { icon: '📊', name: 'Data Science', count: '40+ Courses', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
    { icon: '🛡️', name: 'Cyber Security', count: '25+ Courses', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
    { icon: '🎨', name: 'UI/UX Design', count: '30+ Courses', color: '#db2777', bg: 'rgba(219, 39, 119, 0.1)' },
    { icon: '☁️', name: 'Cloud Computing', count: '20+ Courses', color: '#0891b2', bg: 'rgba(8, 145, 178, 0.1)' },
    { icon: '💼', name: 'Business', count: '50+ Courses', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.1)' },
    { icon: '📈', name: 'Finance', count: '30+ Courses', color: '#0d9488', bg: 'rgba(13, 148, 136, 0.1)' },
    { icon: '🚀', name: 'Digital Marketing', count: '40+ Courses', color: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)' }
  ];

  whyChooseUs = [
    { icon: '🎓', title: 'Expert Trainers', desc: 'Learn directly from industry leaders with years of practical experience.' },
    { icon: '💻', title: 'Live Classes', desc: 'Interactive live sessions with real-time Q&A and hands-on coding.' },
    { icon: '📹', title: 'Recorded Lectures', desc: 'Access HD recorded videos anytime to revise lessons at your own pace.' },
    { icon: '♾️', title: 'Lifetime Access', desc: 'Get unrestricted lifetime access to course materials and future updates.' },
    { icon: '📜', title: 'Certificates', desc: 'Earn recognized certificates upon course completion to boost your resume.' },
    { icon: '🤝', title: 'Placement Assistance', desc: 'Dedicated career guidance, mock interviews, and job referral support.' },
    { icon: '📱', title: 'Mobile Learning', desc: 'Learn seamlessly on mobile, tablet, or desktop with synced progress.' },
    { icon: '🤖', title: 'AI Learning Assistant', desc: 'Get 24/7 instant coding help and smart recommendations powered by AI.' }
  ];

  trails = [
    {
      level: 'GREEN · BEGINNER',
      levelColor: 'text-[#16a34a]',
      title: 'Foundations of Code',
      desc: 'Start with no prior experience. Build three small tools by week two.',
      duration: '5 weeks',
      enrolled: '1,284 on trail'
    },
    {
      level: 'BLUE · INTERMEDIATE',
      levelColor: 'text-[#d97706]',
      title: 'Applied Data Analysis',
      desc: 'Work real datasets with a mentor reviewing every submission.',
      duration: '7 weeks',
      enrolled: '892 on trail'
    },
    {
      level: 'BLACK · ADVANCED',
      levelColor: 'text-[#dc2626]',
      title: 'Systems & Architecture',
      desc: 'Design and defend a production-grade system end to end.',
      duration: '10 weeks',
      enrolled: '340 on trail'
    }
  ];

  mentors = [
    { initials: 'RA', name: 'Rosa Alvarez', role: 'Product Design · 9 yrs' },
    { initials: 'DK', name: 'Devon Kim', role: 'Data Science · 6 yrs' },
    { initials: 'NT', name: 'Naledi Thoko', role: 'Backend Systems · 11 yrs' },
    { initials: 'JL', name: 'Jonas Lindqvist', role: 'Frontend Eng · 7 yrs' }
  ];

}
