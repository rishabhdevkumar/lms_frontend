import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

export interface PlanTier {
  id: string;
  name: string;
  badge?: string;
  badgeColor?: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
}

@Component({
  selector: 'app-pricing-page',
  templateUrl: './pricing.page.html',
  styleUrls: ['./pricing.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonicModule, NavbarComponent],
})
export class PricingPage implements OnInit {
  isAnnual = true;

  showToast = false;
  toastMessage = '';

  plans: PlanTier[] = [
    {
      id: 'starter',
      name: 'Starter Student',
      badge: 'Free Tier',
      badgeColor: '#64748b',
      monthlyPrice: 0,
      annualMonthlyPrice: 0,
      description: 'Ideal for beginners exploring self-paced course intros & community support.',
      features: [
        'Access to 25+ Free Starter Courses',
        'Standard Quality Video Playback',
        'Community Forum Access',
        'Basic Learning Progress Tracker',
        'Certificate of Completion'
      ],
      buttonText: 'Get Started Free'
    },
    {
      id: 'pro',
      name: 'Pro Scholar',
      badge: 'Most Popular 🎉',
      badgeColor: '#2563eb',
      monthlyPrice: 29,
      annualMonthlyPrice: 22,
      isPopular: true,
      description: 'Complete access to 500+ masterclasses, live streams, quizzes & verified certificates.',
      features: [
        'Unlimited Access to All 500+ Courses',
        'Live Interactive Masterclasses & Q&A',
        'Hands-on Code Labs & Quizzes',
        'Verifiable Digital Certificates & Badges',
        'Offline Video & Resource Downloads',
        'Direct Mentor Q&A Support'
      ],
      buttonText: 'Start 7-Day Free Trial'
    },
    {
      id: 'enterprise',
      name: 'Enterprise & Institute',
      badge: 'Best Value',
      badgeColor: '#10b981',
      monthlyPrice: 79,
      annualMonthlyPrice: 59,
      description: 'For university campuses, coding bootcamps & team skill development.',
      features: [
        'Everything in Pro Scholar Plan',
        '1-on-1 Code Reviews & Project Audits',
        'Dedicated Career Mentor & Resume Review',
        'Custom Admin Analytics & Student Tracking',
        'API Access & LMS SSO Integration',
        '24/7 Priority VIP Support'
      ],
      buttonText: 'Contact Sales / Campus'
    }
  ];

  faqs = [
    {
      q: 'Can I switch or cancel my plan at any time?',
      a: 'Yes, absolutely! You can upgrade, downgrade, or cancel your subscription at any time directly from your account settings without hidden fees.',
      open: true
    },
    {
      q: 'Do I get a verified certificate upon course completion?',
      a: 'Yes! Pro Scholar and Enterprise members earn verifiable digital certificates with unique QR codes that can be shared on LinkedIn or added to your resume.',
      open: false
    },
    {
      q: 'Is there a money-back guarantee?',
      a: 'We offer a 14-day 100% money-back guarantee. If you are not completely satisfied with LearnSphere, simply request a refund with no questions asked.',
      open: false
    },
    {
      q: 'How does the annual billing discount work?',
      a: 'When you choose Annual Billing, you pay upfront for 12 months and receive a 25% discount compared to paying month-to-month.',
      open: false
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  toggleBilling() {
    this.isAnnual = !this.isAnnual;
  }

  toggleFaq(faq: any) {
    faq.open = !faq.open;
  }

  selectPlan(plan: PlanTier) {
    if (plan.id === 'starter') {
      this.triggerToast('Starter plan activated! Welcome to LearnSphere.');
      return;
    }

    if (this.authService.isLoggedInValue) {
      const price = this.isAnnual ? plan.annualMonthlyPrice * 12 : plan.monthlyPrice;
      this.triggerToast(`Selected "${plan.name}" (${this.isAnnual ? 'Annual' : 'Monthly'}) - Total: $${price}. Redirecting to checkout...`);
    } else {
      this.triggerToast(`Please sign in to subscribe to the "${plan.name}" plan.`);
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
