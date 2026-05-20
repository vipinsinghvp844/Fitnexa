/**
 * Public CMS API — fetches content without authentication
 * Used by the public-facing landing page (Server Component)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface PublicCmsContent {
  cms: {
    active_template: string;
    
    // Header
    header_logo_type: 'text' | 'image';
    header_logo_text: string;
    header_logo_image: string;
    header_nav_links: Array<{ label: string; url: string }>;

    // Hero
    hero_title: string;
    hero_subtitle: string;
    hero_image: string;
    hero_cta_text: string;
    hero_cta_url: string;

    // Trusted By
    trusted_by_text: string;
    trusted_by_logos: string[];

    // About
    about_title: string;
    about_text: string;

    // Features
    features_title: string;
    features_subtitle: string;
    features: Array<{ title: string; description: string; icon: string }>;

    // How it works
    how_it_works_title: string;
    how_it_works_subtitle: string;
    how_it_works: Array<{ title: string; description: string; icon: string }>;

    // Testimonials
    testimonials_title: string;
    testimonials_subtitle: string;
    testimonials: Array<{ name: string; role: string; content: string; avatar_url?: string }>;

    // FAQs
    faqs_title: string;
    faqs: Array<{ question: string; answer: string }>;

    // CTA
    cta_title: string;
    cta_text: string;
    cta_button_text: string;
    cta_button_url: string;

    // SEO / Footer
    seo_title: string;
    seo_description: string;
    footer_text: string;
  };
  platform: {
    name: string;
    logo: string;
    support_email: string;
  };
}

export async function fetchPublicCmsContent(): Promise<PublicCmsContent | null> {
  try {
    const res = await fetch(`${API_BASE}/api/cms/content`, {
      next: { revalidate: 300 }, // Cache for 5 minutes, then revalidate
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json;
  } catch {
    return null;
  }
}

export const defaultCmsContent: PublicCmsContent = {
  cms: {
    active_template: 'modern',
    
    header_logo_type: 'text',
    header_logo_text: 'Gym SaaS',
    header_logo_image: '',
    header_nav_links: [
      { label: 'Features', url: '#features' },
      { label: 'How it Works', url: '#how-it-works' },
      { label: 'Testimonials', url: '#testimonials' },
      { label: 'FAQ', url: '#faq' },
    ],

    hero_title: 'The Ultimate Gym SaaS Platform',
    hero_subtitle: 'Manage your fitness business, memberships, and billing with ease.',
    hero_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop',
    hero_cta_text: 'Start Free Trial',
    hero_cta_url: '/register',

    trusted_by_text: 'TRUSTED BY INNOVATIVE GYMS WORLDWIDE',
    trusted_by_logos: ['FitLife', 'IronForge', 'PeakFitness', 'CoreStudio', 'FlexGym'],

    about_title: 'Empowering Gym Owners',
    about_text: 'We built this platform to help fitness entrepreneurs scale their businesses without the headache of complex software. Everything you need, all in one place.',

    features_title: 'Everything you need to grow',
    features_subtitle: 'Powerful features designed specifically for fitness businesses.',
    features: [
      { title: 'Member Management', description: 'Easily track and manage all your gym members in one place.', icon: 'Users' },
      { title: 'Automated Billing', description: 'Collect payments seamlessly via Stripe & Razorpay.', icon: 'CreditCard' },
      { title: 'Class Scheduling', description: 'Organize classes and let members book online.', icon: 'Calendar' },
      { title: 'Trainer Portal', description: 'Give trainers their own dashboard to manage clients.', icon: 'Activity' },
      { title: 'Analytics & Reports', description: 'Track MRR, churn rate, and attendance with beautiful charts.', icon: 'BarChart' },
      { title: 'Access Control', description: 'Integrate with door scanners and turnstiles automatically.', icon: 'Lock' },
    ],

    how_it_works_title: 'How It Works',
    how_it_works_subtitle: 'Get up and running in minutes, not days.',
    how_it_works: [
      { title: '1. Create Your Space', description: 'Setup your gym profile, add locations, and configure your branding.', icon: 'MapPin' },
      { title: '2. Setup Plans', description: 'Create memberships, class packs, and drop-in pricing rules.', icon: 'Tag' },
      { title: '3. Invite Members', description: 'Import your existing members or start accepting new signups instantly.', icon: 'UserPlus' },
    ],

    testimonials_title: 'What our customers say',
    testimonials_subtitle: 'Join hundreds of gym owners already using our platform.',
    testimonials: [
      { name: 'Sarah Johnson', role: 'Owner, FitLife Gym', content: 'This platform transformed how we run our gym. The automated billing alone saved us 20 hours a month!', avatar_url: 'https://i.pravatar.cc/150?img=1' },
      { name: 'Mike Chen', role: 'Head Trainer', content: 'Incredible scheduling features. My clients can book sessions easily, and I can manage my whole day from my phone.', avatar_url: 'https://i.pravatar.cc/150?img=11' },
      { name: 'Emma Davis', role: 'Studio Manager', content: 'The best software decision we ever made. The UI is beautiful and our members love the app.', avatar_url: 'https://i.pravatar.cc/150?img=5' },
    ],

    faqs_title: 'Frequently Asked Questions',
    faqs: [
      { question: 'Do you offer a free trial?', answer: 'Yes! You can try all features completely free for 14 days. No credit card required.' },
      { question: 'Can I import my existing members?', answer: 'Absolutely. We offer a free CSV import tool and white-glove onboarding for premium plans.' },
      { question: 'What payment gateways do you support?', answer: 'We currently support Stripe, Razorpay, and direct bank transfers.' },
      { question: 'Is there a limit on how many members I can add?', answer: 'No, our platform scales with you. Pricing is based on active members, but there are no hard caps.' },
    ],

    cta_title: 'Ready to level up your gym?',
    cta_text: 'Join thousands of gym owners who are growing their business faster and working smarter.',
    cta_button_text: 'Get Started for Free',
    cta_button_url: '/register',

    seo_title: 'Gym SaaS – Fitness Management Software',
    seo_description: 'The best software to manage your gym, trainers, and memberships all in one place. Start your free trial today.',
    footer_text: 'Transforming fitness businesses worldwide.',
  },
  platform: {
    name: 'Gym SaaS',
    logo: '',
    support_email: 'support@gymsaas.com',
  },
};
