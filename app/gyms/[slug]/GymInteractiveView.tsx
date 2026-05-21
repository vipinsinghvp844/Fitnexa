'use client';

import { useState, useEffect } from 'react';
import { 
  MapPin, Phone, Mail, Globe, CheckCircle2, Clock, 
  User, ExternalLink, Star, MessageSquare, PlusCircle, 
  X, Loader2, Sparkles, ShieldCheck, Ticket, CreditCard,
  QrCode, Smartphone, ChevronRight, AlertCircle, ArrowLeft,
  CheckCircle, ShieldAlert, Dumbbell, Calendar, ChevronLeft,
  BookOpen, Calculator, Play, Eye
} from 'lucide-react';
import { submitPublicFeedback, subscribePublicPlan } from '@/lib/api';

interface Testimonial {
  name: string;
  rating: number;
  text: string;
  created_at?: string;
}

interface GymInteractiveViewProps {
  gym: any;
  slug: string;
}

// Fallback Gallery Images categorized
const FALLBACK_GALLERY = {
  yoga: [
    { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', caption: 'Vinyasa Flow Studio' },
    { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80', caption: 'Mindfulness & Breathing Class' }
  ],
  fitness: [
    { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80', caption: 'Premium Cardio Deck' },
    { url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80', caption: 'HIIT Aerobics Zone' }
  ],
  gym: [
    { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', caption: 'Strength Training Arena' },
    { url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80', caption: 'Professional Lift Platform' }
  ],
  running: [
    { url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80', caption: 'Outdoor Endurance Run' },
    { url: 'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=800&q=80', caption: 'Sprints Training Track' }
  ]
};

// Fallback Classes
const FALLBACK_CLASSES = [
  { name: 'Martial Arts', description: 'Master defensive tactics, flexibility, and physical discipline.', duration: '60 mins', intensity: 'High', image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=800&q=80', trainer: 'David Smith' },
  { name: 'Endurance Running', description: 'Build supreme cardiovascular conditioning and lower body strength.', duration: '45 mins', intensity: 'Medium', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80', trainer: 'Selina Stuart' },
  { name: 'Yoga & Meditation', description: 'Realign your breathing, improve focus, and restore joints.', duration: '50 mins', intensity: 'Low', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80', trainer: 'John Doe' }
];

// Fallback Blog/Latest Posts
const FALLBACK_POSTS = [
  { title: 'Give your fitness a boost with our new gym challenge', excerpt: 'Start our custom 30-day conditioning and lifting sprint. Get matched with professional meal trackers and direct coach mentorship.', date: '5 Jun', year: '2026', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80' },
  { title: 'How to Keep Your Body Healthy Over the Festive Season', excerpt: 'A simple guide to balanced nutrition, daily active movement, and keeping up your hydration during family holidays.', date: '18 Jun', year: '2026', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80' },
  { title: 'The most effective ways to shift the winter weight quickly', excerpt: 'Unlock premium anaerobic interval advice that burns major caloric reserve during active and passive recovery rest cycles.', date: '25 Jun', year: '2026', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80' }
];

// Default Trainers
const DEFAULT_TRAINERS = [
  { name: 'David Smith', specialization: 'Fitness Trainer', avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80' },
  { name: 'Selina Stuart', specialization: 'Yoga Expert', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80' },
  { name: 'John Doe', specialization: 'Strength Coach', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Jenifer Alex', specialization: 'HIIT Instructor', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' }
];

export default function GymInteractiveView({ gym: initialGym, slug }: GymInteractiveViewProps) {
  const [gym, setGym] = useState(initialGym);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialGym.testimonials_data || [
    { name: 'John Miller', rating: 5, text: 'Awesome equipment, super clean floors, and very knowledgeable trainers. Best decision I made!' },
    { name: 'Elena Rostova', rating: 5, text: 'The high-impact vibes of the facility matches their premium classes. HIIT is absolute fire!' }
  ]);

  // Modals & Forms State
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'info' | 'payment' | 'processing' | 'success'>('info');
  const [paymentMethod, setPaymentMethod] = useState<'gpay' | 'phonepe' | 'upi' | 'stripe' | 'razorpay'>('gpay');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [submittingCheckout, setSubmittingCheckout] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<any | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Form Fields
  const [feedbackForm, setFeedbackForm] = useState({ name: '', rating: 5, text: '' });
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
  const [error, setError] = useState<string | null>(null);

  // BMI Interactive State
  const [bmiUnit, setBmiUnit] = useState<'metric' | 'imperial'>('metric');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [calculatedBmi, setCalculatedBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>('');
  const [bmiAdvice, setBmiAdvice] = useState<string>('');
  const [bmiError, setBmiError] = useState<string | null>(null);

  // Gallery Filter State
  const [activeGalleryTab, setActiveGalleryTab] = useState<string>('all');

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  const template = gym.website_template || 'modern';
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${gym.latitude},${gym.longitude}`;

  // Get price integer for UPI Pay
  const cleanPrice = selectedPlan ? (parseFloat(selectedPlan.price.replace(/[^0-9.]/g, '')) || 49) : 49;
  
  // Dynamic Indian UPI payment string link
  const upiPayString = `upi://pay?pa=gympay@okaxis&pn=${encodeURIComponent(gym.name)}&am=${cleanPrice}&cu=INR&tn=${encodeURIComponent('Membership ' + (selectedPlan?.name || 'Plan'))}`;

  // Handle Feedback Submission
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.name.trim() || !feedbackForm.text.trim()) return;

    setSubmittingFeedback(true);
    setError(null);
    try {
      const res = await submitPublicFeedback(slug, feedbackForm);
      setTestimonials(res.data || []);
      setFeedbackSuccess('Thank you! Your feedback has been published dynamically in testimonials.');
      setFeedbackForm({ name: '', rating: 5, text: '' });
      setTimeout(() => {
        setShowFeedbackModal(false);
        setFeedbackSuccess(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback. Try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Step 1: Validate Info Form
  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.name.trim() || !checkoutForm.email.trim() || !checkoutForm.phone.trim() || !checkoutForm.password.trim()) {
      setError('Please fill in all registration details.');
      return;
    }
    setError(null);
    setCheckoutStep('payment');
  };

  // Step 2: Simulate Payment & Call API to Onboard Member
  const handlePaymentSubmit = async () => {
    setCheckoutStep('processing');
    setError(null);
    
    // Simulate payment gateway handshakes
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const payload = {
        ...checkoutForm,
        plan_name: selectedPlan.name
      };
      const res = await subscribePublicPlan(slug, payload);
      setCheckoutSuccess(res.data);
      setCheckoutStep('success');
      setCheckoutForm({ name: '', email: '', phone: '', password: '' });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email might already be registered.');
      setCheckoutStep('payment');
    }
  };

  // BMI Calculation handler
  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    setBmiError(null);
    
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      setBmiError('Please enter valid positive values.');
      setCalculatedBmi(null);
      return;
    }

    let bmi = 0;
    if (bmiUnit === 'metric') {
      // Metric: weight(kg) / height(m)^2
      const heightInMeters = h / 100;
      bmi = w / (heightInMeters * heightInMeters);
    } else {
      // Imperial: (weight(lbs) / height(inches)^2) * 703
      bmi = (w / (h * h)) * 703;
    }

    const finalBmi = Math.round(bmi * 10) / 10;
    setCalculatedBmi(finalBmi);

    // Categories
    if (finalBmi < 18.5) {
      setBmiCategory('Underweight');
      setBmiAdvice('Focus on a nutrient-rich caloric surplus and progressive strength conditioning.');
    } else if (finalBmi >= 18.5 && finalBmi < 25) {
      setBmiCategory('Normal Weight');
      setBmiAdvice('Excellent! Maintain your balance with structured weight workouts and proper active recovery.');
    } else if (finalBmi >= 25 && finalBmi < 30) {
      setBmiCategory('Overweight');
      setBmiAdvice('Combine high-intensity cardio intervals with weight training and a clean, high-protein diet.');
    } else {
      setBmiCategory('Obese');
      setBmiAdvice('Prioritize low-impact joint-friendly exercises, structured resistance work, and a caloric deficit plan.');
    }
  };

  // Compile active gallery image list
  const getGalleryImages = () => {
    // If the gym has uploaded their own gallery, use them
    if (gym.gallery_images && gym.gallery_images.length > 0) {
      const parsed = gym.gallery_images.map((img: any) => {
        if (typeof img === 'string') {
          return { url: img, category: 'gym', caption: 'Club Facility' };
        }
        return {
          url: img?.url || '',
          category: img?.category || 'gym',
          caption: img?.caption || 'Club Facility'
        };
      });
      
      if (activeGalleryTab === 'all') return parsed;
      return parsed.filter((img: any) => img.category === activeGalleryTab);
    }
    
    // Otherwise return beautiful themed categories
    const yoga = FALLBACK_GALLERY.yoga.map(item => ({ ...item, category: 'yoga' }));
    const fitness = FALLBACK_GALLERY.fitness.map(item => ({ ...item, category: 'fitness' }));
    const gymImages = FALLBACK_GALLERY.gym.map(item => ({ ...item, category: 'gym' }));
    const running = FALLBACK_GALLERY.running.map(item => ({ ...item, category: 'running' }));
    
    const combined = [...yoga, ...fitness, ...gymImages, ...running];
    
    if (activeGalleryTab === 'all') return combined;
    return combined.filter(img => img.category === activeGalleryTab);
  };

  // Fetch active trainers roster (prefer real DB trainers, fallback to trainers_data blob, then DEFAULT_TRAINERS)
  const getTrainers = () => {
    // Real DB trainers (from /api/gyms/:slug which now returns trainers from the trainers table)
    if (gym.trainers && gym.trainers.length > 0) return gym.trainers;
    // Legacy: trainers saved as JSON blob in tenants table
    if (gym.trainers_data && gym.trainers_data.length > 0) return gym.trainers_data;
    return DEFAULT_TRAINERS;
  };

  // Fetch dynamic classes (with fallback)
  const getClasses = () => {
    return gym.classes_data && gym.classes_data.length > 0 ? gym.classes_data : FALLBACK_CLASSES;
  };

  // Fetch dynamic blogs (with fallback)
  const getBlogs = () => {
    return gym.blogs_data && gym.blogs_data.length > 0 ? gym.blogs_data : FALLBACK_POSTS;
  };

  return (
    <div className={`min-h-screen relative transition-all duration-300 font-sans ${
      template === 'dark' ? 'bg-[#0a0a0a] text-zinc-100 selection:bg-orange-500/30' : 
      template === 'glass' ? 'bg-slate-950 text-slate-100 selection:bg-cyan-500/30' : 'bg-slate-50 text-slate-800 selection:bg-emerald-100'
    }`}>
      
      {/* ────────────────── BRANDED NAVIGATION HEADER ────────────────── */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md transition ${
        template === 'dark' ? 'border-zinc-900 bg-black/90 text-zinc-100' : 
        template === 'glass' ? 'border-white/5 bg-slate-950/70 text-slate-100' : 'border-slate-200/60 bg-white/90 text-slate-800'
      }`}>
        <div className="mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {(gym.header_data?.show_logo_image !== false) && (gym.header_data?.logo_image || gym.logo_url) ? (
              <img src={gym.header_data?.logo_image || gym.logo_url} alt={gym.name} className="h-10 w-10 object-contain rounded-lg" />
            ) : (
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-black shadow-sm ${
                template === 'dark' ? 'bg-orange-600 text-white' :
                template === 'glass' ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' : 'bg-slate-900 text-white'
              }`}>{(gym.header_data?.logo_text || gym.name)?.[0] || 'G'}</div>
            )}
            <span className={`font-black text-lg tracking-tight ${template === 'dark' ? 'text-white' : ''}`}>{gym.header_data?.logo_text || gym.name}</span>
          </div>

          {/* Dynamic Menu Items */}
          {gym.header_data?.menu_items && gym.header_data.menu_items.length > 0 && (
            <nav className="hidden md:flex items-center gap-6">
              {gym.header_data.menu_items.map((item: any, idx: number) => (
                <a 
                  key={idx} 
                  href={item.link || '#'} 
                  className={`text-sm font-semibold transition ${
                    template === 'dark' ? 'text-zinc-400 hover:text-orange-500' :
                    template === 'glass' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            {gym.social_links?.instagram && (
              <a href={gym.social_links.instagram} target="_blank" rel="noopener noreferrer" className={`transition hidden sm:block ${template === 'dark' ? 'hover:text-orange-500 text-zinc-400' : 'hover:text-pink-500 text-slate-500'}`}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            )}
            {gym.social_links?.facebook && (
              <a href={gym.social_links.facebook} target="_blank" rel="noopener noreferrer" className={`transition hidden sm:block ${template === 'dark' ? 'hover:text-orange-500 text-zinc-400' : 'hover:text-blue-500 text-slate-500'}`}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            )}
            
            {/* Dynamic CTA Button or fallback to Get Directions */}
            {gym.header_data?.buttons && gym.header_data.buttons.length > 0 ? (
              gym.header_data.buttons.map((btn: any, btnIdx: number) => {
                const isOutline = btn.variant === 'outline';
                let btnStyle = '';
                if (template === 'dark') {
                  btnStyle = isOutline 
                    ? 'border border-zinc-700 hover:border-zinc-500 text-zinc-300 bg-transparent hover:bg-zinc-900/40' 
                    : 'bg-orange-600 hover:bg-orange-700 text-white';
                } else if (template === 'glass') {
                  btnStyle = isOutline 
                    ? 'border border-white/20 hover:bg-white/5 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/15';
                } else {
                  btnStyle = isOutline 
                    ? 'border border-slate-350 hover:bg-slate-50 text-slate-700 bg-transparent' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white';
                }
                return (
                  <a 
                    key={btnIdx}
                    href={btn.link || '#'} 
                    className={`hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition shadow-sm ${btnStyle}`}
                  >
                    {btn.text}
                  </a>
                );
              })
            ) : gym.header_data?.button_text ? (
              <a 
                href={gym.header_data.button_link || '#pricing'} 
                className={`hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition shadow-sm ${
                  template === 'dark' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
                  template === 'glass' ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15' : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {gym.header_data.button_text}
              </a>
            ) : (
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${gym.latitude},${gym.longitude}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition shadow-sm ${
                  template === 'dark' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
                  template === 'glass' ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15' : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                Get Directions <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ────────────────── DYNAMIC PREMIUM HERO SECTION ────────────────── */}
      <section id="home" className={`relative overflow-hidden py-24 sm:py-36 border-b transition ${
        template === 'dark' ? 'bg-black border-zinc-900' :
        template === 'glass' ? 'bg-gradient-to-b from-slate-950 to-slate-900 border-white/5' : 'bg-white border-slate-200/60'
      }`}>
        {/* Background Image Overlay with Gradients */}
        <div className={`absolute inset-0 opacity-20 pointer-events-none ${template === 'dark' ? 'mix-blend-luminosity opacity-15' : ''}`}>
          <img src={gym.banner_image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80'} alt="" className="w-full h-full object-cover" />
        </div>
        
        {/* Background Glows for Cyberpunk Glass */}
        {template === 'glass' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/20 blur-[120px]" />
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px]" />
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest ${
            template === 'dark' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
            template === 'glass' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-100 text-slate-800 border border-slate-200'
          }`}>
            <Sparkles className={`h-3.5 w-3.5 animate-pulse ${template === 'dark' ? 'text-orange-500' : template === 'glass' ? 'text-cyan-400' : 'text-indigo-600'}`} /> 
            Verified Elite Partner
          </span>
          
          <h1 className={`text-4xl font-black tracking-tight leading-none max-w-4xl mx-auto sm:text-6xl ${
            template === 'dark' ? 'uppercase font-extrabold text-white tracking-tighter' :
            template === 'glass' ? 'bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent' : 'text-slate-900 font-extrabold'
          }`}>
            {gym.seo_title || `Transform Your Health at ${gym.name}`}
          </h1>
          
          <p className={`text-base sm:text-xl max-w-2xl mx-auto leading-relaxed ${
            template === 'dark' ? 'text-zinc-400' : 'text-slate-500'
          }`}>
            {gym.description || 'Elevate your fitness journey with high-end machinery, professional strength trainers, and dynamic recovery zones.'}
          </p>
          
          <div className="pt-6 flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => {
                setCheckoutStep('info');
                setError(null);
                if (gym.pricing_plans && gym.pricing_plans.length > 0) {
                  setSelectedPlan(gym.pricing_plans[0]);
                } else {
                  setSelectedPlan({ name: 'Standard General Pass', price: '$49/mo' });
                }
              }}
              className={`rounded-full px-8 py-4 text-sm font-black transition-all shadow-lg hover:scale-105 shrink-0 ${
                template === 'dark' ? 'bg-orange-600 text-white hover:bg-orange-700' :
                template === 'glass' ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:brightness-110 shadow-cyan-500/20' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              Subscribe / Join Online
            </button>
            
            <a 
              href={`tel:${gym.phone}`} 
              className={`rounded-full px-8 py-4 text-sm font-black transition-all shadow-lg flex items-center gap-2 border ${
                template === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-orange-500 hover:border-orange-500/30' :
                template === 'glass' ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Phone className={`h-4 w-4 ${template === 'dark' ? 'text-orange-500' : 'text-emerald-500'}`} /> Call Club Desk
            </a>
          </div>
        </div>
      </section>

      {/* ────────────────── MAIN LANDING CONTENT ────────────────── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 space-y-28">
        
        {/* SERVICES AND WORKOUTS */}
        {gym.services?.length > 0 && (
          <section id="services" className="space-y-12">
            <div className="text-center space-y-2">
              <h2 className={`text-3xl font-black tracking-tight ${template === 'dark' ? 'uppercase text-white font-extrabold' : 'text-slate-900'}`}>
                Our Premium Workout Services
              </h2>
              <div className={`h-1.5 w-16 mx-auto rounded-full ${
                template === 'dark' ? 'bg-orange-600' : template === 'glass' ? 'bg-cyan-500' : 'bg-slate-900'
              }`} />
              <p className={`mt-4 max-w-md mx-auto text-sm ${template === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                Tailored experiences designed to support your active lifestyle and aesthetic goals.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {gym.services.map((serv: string, idx: number) => (
                <div key={idx} className={`p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
                  template === 'dark' ? 'bg-zinc-900/40 border-zinc-800 hover:border-orange-600' :
                  template === 'glass' ? 'bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:shadow-lg'
                }`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 font-bold text-lg ${
                    template === 'dark' ? 'bg-orange-600/10 text-orange-500' :
                    template === 'glass' ? 'bg-cyan-500/15 text-cyan-400' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <h3 className={`font-black text-lg mb-2 ${template === 'dark' ? 'text-white' : 'text-slate-900'}`}>{serv}</h3>
                  <p className={`text-xs leading-relaxed ${template === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Includes unlimited weekly schedules, professional coaching oversight, and performance metrics logging.
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ────────────────── FEATURED CLASSES (NEW!) ────────────────── */}
        <section id="classes" className="space-y-12">
          <div className="flex flex-wrap gap-4 items-end justify-between border-b border-zinc-900 pb-6">
            <div className="space-y-2">
              <h2 className={`text-3xl font-black tracking-tight ${template === 'dark' ? 'uppercase text-white font-extrabold' : 'text-slate-900'}`}>
                Featured Classes
              </h2>
              <p className={`text-sm ${template === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                Engage in top-tier workouts mentored by certified dynamic instructors.
              </p>
            </div>
            
            {/* Mock slider arrows matching screenshots */}
            <div className="flex gap-2">
              <button className={`p-2 rounded-lg transition ${
                template === 'dark' ? 'bg-zinc-900 hover:bg-orange-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className={`p-2 rounded-lg transition ${
                template === 'dark' ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-slate-900 hover:bg-slate-850 text-white'
              }`}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {getClasses().map((cls: any, idx: number) => (
              <div key={idx} className={`rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-xl ${
                template === 'dark' ? 'bg-zinc-900/30 border-zinc-800 hover:border-orange-600' :
                template === 'glass' ? 'bg-white/5 border-white/10 backdrop-blur-md' : 'bg-white border-slate-200'
              }`}>
                {/* Class Thumbnail */}
                <div className="aspect-[16/10] relative overflow-hidden bg-slate-800">
                  <img src={cls.image} alt={cls.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  <span className={`absolute top-4 left-4 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                    template === 'dark' ? 'bg-orange-600 text-white' : 'bg-slate-900 text-white'
                  }`}>
                    {cls.intensity} Intensity
                  </span>
                </div>
                
                {/* Class Details */}
                <div className="p-6 space-y-4">
                  <h3 className={`font-black text-xl ${template === 'dark' ? 'text-white' : 'text-slate-900'}`}>{cls.name}</h3>
                  <p className={`text-xs leading-relaxed ${template === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>{cls.description}</p>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800/80 pt-4 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-indigo-500" /> {cls.duration}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-slate-300">
                      <User className={`h-3.5 w-3.5 ${template === 'dark' ? 'text-orange-500' : 'text-cyan-500'}`} /> Coach: {cls.trainer}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ────────────────── INTERACTIVE BMI CALCULATOR WIDGET (NEW!) ────────────────── */}
        <section id="bmi" className={`relative rounded-[2.5rem] overflow-hidden border p-8 sm:p-12 transition ${
          template === 'dark' ? 'bg-black border-zinc-800' :
          template === 'glass' ? 'bg-white/5 border-white/10 backdrop-blur-md' : 'bg-white border-slate-200'
        }`}>
          {/* Muscular Background Overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
            <img src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80" alt="" className="w-full h-full object-cover" />
          </div>

          <div className="relative z-10 grid lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Form Details */}
            <div className="lg:col-span-7 space-y-6">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                template === 'dark' ? 'bg-orange-500/10 text-orange-500' : 'bg-slate-200 text-slate-800'
              }`}>Fitness Tools</span>
              <h2 className={`text-3xl sm:text-4xl font-black ${template === 'dark' ? 'uppercase text-white tracking-tight' : 'text-slate-900'}`}>
                Calculate Your BMI
              </h2>
              <p className={`text-xs leading-relaxed max-w-lg ${template === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                Body Mass Index (BMI) evaluates fat based on weight and height. Instantly analyze your fitness zone using our direct calculations.
              </p>

              <form onSubmit={calculateBMI} className="space-y-6">
                {/* Unit Switcher */}
                <div className="flex gap-6 items-center">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-300">
                    <input 
                      type="radio" 
                      name="bmiUnit" 
                      value="metric"
                      checked={bmiUnit === 'metric'}
                      onChange={() => {
                        setBmiUnit('metric');
                        setWeight('');
                        setHeight('');
                        setCalculatedBmi(null);
                      }}
                      className={`h-4 w-4 ${template === 'dark' ? 'accent-orange-500' : 'accent-indigo-600'}`} 
                    />
                    Metric Units (kg / cm)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-300">
                    <input 
                      type="radio" 
                      name="bmiUnit" 
                      value="imperial"
                      checked={bmiUnit === 'imperial'}
                      onChange={() => {
                        setBmiUnit('imperial');
                        setWeight('');
                        setHeight('');
                        setCalculatedBmi(null);
                      }}
                      className={`h-4 w-4 ${template === 'dark' ? 'accent-orange-500' : 'accent-indigo-600'}`} 
                    />
                    Imperial Units (lbs / inches)
                  </label>
                </div>

                {/* Form fields */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Weight ({bmiUnit === 'metric' ? 'kg' : 'lbs'})</label>
                    <input 
                      type="number" 
                      placeholder={bmiUnit === 'metric' ? 'e.g. 72' : 'e.g. 160'}
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className={`w-full text-xs px-4 py-3 rounded-xl border focus:outline-none ${
                        template === 'dark' ? 'bg-zinc-950 border-zinc-800 focus:border-orange-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-slate-400'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Height ({bmiUnit === 'metric' ? 'cm' : 'inches'})</label>
                    <input 
                      type="number" 
                      placeholder={bmiUnit === 'metric' ? 'e.g. 175' : 'e.g. 70'}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className={`w-full text-xs px-4 py-3 rounded-xl border focus:outline-none ${
                        template === 'dark' ? 'bg-zinc-950 border-zinc-800 focus:border-orange-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {bmiError && <p className="text-xs font-semibold text-rose-500">{bmiError}</p>}

                <div className="flex flex-wrap items-center gap-4">
                  <button 
                    type="submit"
                    className={`px-8 py-3.5 rounded-xl text-xs font-black uppercase transition-all shadow-md ${
                      template === 'dark' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
                      template === 'glass' ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400' : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    Calculate
                  </button>

                  {calculatedBmi !== null && (
                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-2 rounded-xl text-xs font-black ${
                        template === 'dark' ? 'bg-orange-600/20 text-orange-500 border border-orange-500/20' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        Your BMI: <span className="text-lg font-black">{calculatedBmi}</span>
                      </div>
                      <div className="text-xs">
                        Category: <strong className="text-white uppercase font-extrabold">{bmiCategory}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Right Column: Health Guide Translucent Panel */}
            <div className="lg:col-span-5">
              <div className={`p-6 rounded-3xl border ${
                template === 'dark' ? 'bg-orange-500/10 border-orange-500/20 text-white shadow-xl shadow-orange-500/5' :
                template === 'glass' ? 'bg-white/5 border-white/10 backdrop-blur-lg' : 'bg-slate-100 border-slate-200'
              }`}>
                <h3 className="font-black text-lg mb-4 uppercase tracking-tight flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-orange-500" /> BMI Reference Table
                </h3>
                
                <div className="divide-y divide-white/5 text-xs">
                  <div className="flex justify-between py-2.5 font-bold">
                    <span>BMI Scale</span>
                    <span>Weight Status</span>
                  </div>
                  <div className={`flex justify-between py-2.5 ${calculatedBmi && calculatedBmi < 18.5 ? 'text-orange-500 font-extrabold' : 'text-slate-400'}`}>
                    <span>Below 18.5</span>
                    <span>Underweight</span>
                  </div>
                  <div className={`flex justify-between py-2.5 ${calculatedBmi && calculatedBmi >= 18.5 && calculatedBmi < 25 ? 'text-orange-500 font-extrabold' : 'text-slate-400'}`}>
                    <span>18.5 - 24.9</span>
                    <span>Normal Weight</span>
                  </div>
                  <div className={`flex justify-between py-2.5 ${calculatedBmi && calculatedBmi >= 25 && calculatedBmi < 30 ? 'text-orange-500 font-extrabold' : 'text-slate-400'}`}>
                    <span>25 - 29.9</span>
                    <span>Overweight</span>
                  </div>
                  <div className={`flex justify-between py-2.5 ${calculatedBmi && calculatedBmi >= 30 ? 'text-orange-500 font-extrabold' : 'text-slate-400'}`}>
                    <span>30 and Above</span>
                    <span>Obese</span>
                  </div>
                </div>

                {calculatedBmi !== null && (
                  <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
                    <p className="text-[10px] uppercase font-black tracking-widest text-orange-500">Coach Recommendation</p>
                    <p className="text-xs leading-relaxed italic text-slate-200">"{bmiAdvice}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* DYNAMIC MEMBERSHIP PLANS DIRECT GATEWAY CHECKOUT */}
        {gym.pricing_plans?.length > 0 && (
          <section id="pricing" className="space-y-12">
            <div className="text-center space-y-2">
              <h2 className={`text-3xl font-black tracking-tight ${template === 'dark' ? 'uppercase text-white font-extrabold' : 'text-slate-900'}`}>
                Select Membership & Join Online
              </h2>
              <div className={`h-1.5 w-16 mx-auto rounded-full ${
                template === 'dark' ? 'bg-orange-600' : template === 'glass' ? 'bg-cyan-500' : 'bg-slate-900'
              }`} />
              <p className={`mt-4 max-w-md mx-auto text-sm ${template === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                Select your pass option and finish direct verification checkout safely in minutes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 max-w-4x2 mx-auto gap-8">
              {gym.pricing_plans.map((plan: any, idx: number) => (
                <div key={idx} className={`p-8 rounded-3xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
                  template === 'dark' ? 'bg-zinc-900/40 border-zinc-800 hover:border-orange-600' :
                  template === 'glass' ? 'bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10' : 'bg-white border-slate-200 hover:shadow-lg'
                }`}>
                  {idx === 1 && (
                    <div className={`absolute top-0 right-0 text-[10px] font-black uppercase px-4 py-2 rounded-bl-2xl ${
                      template === 'dark' ? 'bg-orange-600 text-white' : 'bg-indigo-600 text-white'
                    }`}>
                      Most Popular
                    </div>
                  )}
                  <div>
                    <h3 className={`text-xl font-black mb-1 ${template === 'dark' ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                    <p className={`text-3xl font-black mb-6 ${
                      template === 'dark' ? 'text-orange-500' :
                      template === 'glass' ? 'text-cyan-400' : 'text-indigo-600'
                    }`}>{plan.price}</p>
                    <ul className="space-y-3 mb-8">
                      {plan.features?.map((feat: string, i: number) => (
                        <li key={i} className="text-xs flex items-center gap-2 text-slate-400">
                          <CheckCircle2 className={`h-4 w-4 shrink-0 ${template === 'dark' ? 'text-orange-500' : 'text-emerald-500'}`} /> {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button 
                    onClick={() => {
                      setCheckoutStep('info');
                      setSelectedPlan(plan);
                      setError(null);
                    }}
                    className={`block w-full py-3 rounded-full text-center text-xs font-black uppercase transition-all duration-300 ${
                      template === 'dark' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
                      template === 'glass' ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400' : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    Select & Subscribe Direct
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ────────────────── EXPERT TRAINERS SECTION ────────────────── */}
        <section id="trainers" className="space-y-12">
          <div className="flex flex-wrap gap-4 items-end justify-between border-b border-zinc-900 pb-6">
            <div className="space-y-2">
              <h2 className={`text-3xl font-black tracking-tight ${template === 'dark' ? 'uppercase text-white font-extrabold' : 'text-slate-900'}`}>
                Expert Trainers
              </h2>
              <p className={`text-sm ${template === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                Work with elite professionals focused on your absolute athletic performance.
              </p>
            </div>
            
            {/* Slider chevron indicators */}
            <div className="flex gap-2">
              <button className={`p-2 rounded-lg transition ${
                template === 'dark' ? 'bg-zinc-900 hover:bg-orange-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className={`p-2 rounded-lg transition ${
                template === 'dark' ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-slate-900 hover:bg-slate-850 text-white'
              }`}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {getTrainers().map((tr: any, idx: number) => {
              if (template === 'dark') {
                {/* Iron High-Contrast style: White card, image centered, overlay bottom orange badge */}
                return (
                  <div key={idx} className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 relative group flex flex-col items-center pb-8 pt-6">
                    {/* Centered trainer photograph */}
                    <div className="w-56 h-56 rounded-full overflow-hidden border-2 border-slate-200 shadow-inner bg-slate-150 flex items-center justify-center">
                      {tr.avatar ? (
                        <img src={tr.avatar} alt={tr.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <User className="h-20 w-20 text-slate-400" />
                      )}
                    </div>
                    
                    {/* Orange Badge Name Card Overlay */}
                    <div className="bg-orange-600 text-white rounded-2xl py-3 px-6 -mt-6 z-10 w-[85%] text-center shadow-md border border-orange-500 relative transition-transform group-hover:scale-105">
                      <h4 className="font-extrabold text-sm tracking-tight">{tr.name}</h4>
                      <p className="text-[10px] text-orange-200 mt-0.5 font-bold uppercase tracking-wider">{tr.specialization}</p>
                    </div>
                  </div>
                );
              }

              {/* Glass / Modern themes layout */}
              return (
                <div key={idx} className={`p-6 rounded-3xl border text-center transition duration-300 hover:-translate-y-1 ${
                  template === 'glass' ? 'bg-white/5 border-white/10 backdrop-blur-md hover:border-cyan-500/50' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className={`w-28 h-28 rounded-full overflow-hidden mx-auto border mb-6 bg-slate-150 flex items-center justify-center ${
                    template === 'glass' ? 'border-white/15' : 'border-slate-200'
                  }`}>
                    {tr.avatar ? <img src={tr.avatar} alt={tr.name} className="w-full h-full object-cover" /> : <User className="h-12 w-12 text-slate-400" />}
                  </div>
                  <h3 className={`font-black text-lg ${template === 'glass' ? 'text-white' : 'text-slate-900'}`}>{tr.name}</h3>
                  <p className={`text-xs font-bold mt-1 ${
                    template === 'glass' ? 'text-cyan-400' : 'text-indigo-600'
                  }`}>{tr.specialization}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ────────────────── FILTERABLE OUR FACILITY GALLERY SECTION ────────────────── */}
        <section id="gallery" className="space-y-12">
          <div className="flex flex-wrap gap-6 items-end justify-between border-b border-zinc-900 pb-6">
            <div className="space-y-2">
              <h2 className={`text-3xl font-black tracking-tight ${template === 'dark' ? 'uppercase text-white font-extrabold' : 'text-slate-900'}`}>
                Our Gallery
              </h2>
              <p className={`text-sm ${template === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                Explore our custom workout floors, premium cardio decks, and meditation space.
              </p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {['all', 'yoga', 'fitness', 'gym', 'running'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveGalleryTab(tab)}
                  className={`px-5 py-2.5 rounded-full text-xs font-black uppercase transition-all tracking-wider ${
                    activeGalleryTab === tab
                      ? (template === 'dark' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' :
                         template === 'glass' ? 'bg-cyan-500 text-slate-950 font-black shadow-md' : 'bg-slate-900 text-white')
                      : (template === 'dark' ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white' :
                         template === 'glass' ? 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10' : 'bg-slate-200/60 text-slate-700 hover:bg-slate-200')
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout of photos */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {getGalleryImages().map((img: any, idx: number) => (
              <div 
                key={idx} 
                className={`aspect-[4/3] rounded-3xl overflow-hidden relative group border transition duration-300 shadow-sm ${
                  template === 'dark' ? 'border-zinc-800' : 'border-slate-200'
                }`}
              >
                <img src={img.url} alt={img.caption || 'Facility'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                
                {/* Hover overlay with dynamic plus button from screenshots */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 scale-75 group-hover:scale-100 ${
                    template === 'dark' ? 'bg-orange-600' : 'bg-cyan-500'
                  }`}>
                    <PlusCircle className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-white tracking-widest">{img.caption}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ────────────────── LATEST POSTS / BLOG SECTION (NEW!) ────────────────── */}
        <section id="blogs" className="space-y-12">
          <div className="flex flex-wrap gap-4 items-end justify-between border-b border-zinc-900 pb-6">
            <div className="space-y-2">
              <h2 className={`text-3xl font-black tracking-tight ${template === 'dark' ? 'uppercase text-white font-extrabold' : 'text-slate-900'}`}>
                Latest Posts
              </h2>
              <p className={`text-sm ${template === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                Read news, healthy eating tips, and performance routines from our desk.
              </p>
            </div>
            
            {/* Slider arrows */}
            <div className="flex gap-2">
              <button className={`p-2 rounded-lg transition ${
                template === 'dark' ? 'bg-zinc-900 hover:bg-orange-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className={`p-2 rounded-lg transition ${
                template === 'dark' ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-slate-900 hover:bg-slate-850 text-white'
              }`}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {getBlogs().map((post: any, idx: number) => (
              <div key={idx} className={`rounded-3xl overflow-hidden border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                template === 'dark' ? 'bg-zinc-900/30 border-zinc-800' :
                template === 'glass' ? 'bg-white/5 border-white/10 backdrop-blur-md' : 'bg-white border-slate-200'
              }`}>
                <div>
                  {/* Thumbnail and Date Badge */}
                  <div className="aspect-[16/10] relative overflow-hidden bg-slate-800">
                    <img src={post.image} alt="" className="w-full h-full object-cover" />
                    
                    {/* Orange Date Badge Overlay */}
                    <div className="absolute top-4 left-4 bg-orange-600 text-white px-3.5 py-2 rounded-xl text-center shadow-md border border-orange-500 flex flex-col justify-center items-center">
                      <span className="text-sm font-black tracking-tight leading-none">{post.date.split(' ')[0]}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5 leading-none">{post.date.split(' ')[1]}</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className={`font-black text-lg leading-snug transition hover:text-orange-500 cursor-pointer ${
                      template === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>{post.title}</h3>
                    <p className={`text-xs leading-relaxed line-clamp-3 ${template === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 dark:border-zinc-800/80 mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1"><Calendar className="h-3 w-3 text-orange-500" /> June {post.year}</span>
                  <a href="#" className={`text-xs font-black flex items-center gap-1 hover:underline ${
                    template === 'dark' ? 'text-orange-500' : 'text-indigo-600'
                  }`}>
                    Read More <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MEMBER TESTIMONIAL FEEDBACK */}
        <section id="testimonials" className="space-y-12">
          <div className="flex flex-wrap gap-4 items-center justify-between border-b border-zinc-900 pb-6">
            <div className="space-y-2">
              <h2 className={`text-3xl font-black tracking-tight flex items-center gap-2 ${template === 'dark' ? 'text-white uppercase' : 'text-slate-900'}`}>
                <MessageSquare className={`h-8 w-8 ${template === 'dark' ? 'text-orange-500' : 'text-indigo-600'}`} /> Client Testimonials
              </h2>
              <p className={`text-sm ${template === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                Real reviews and verified training experiences submitted directly by our members.
              </p>
            </div>
            
            <button
              onClick={() => {
                setError(null);
                setFeedbackSuccess(null);
                setShowFeedbackModal(true);
              }}
              className={`flex items-center gap-2 font-black px-6 py-3 rounded-full text-xs transition-all shadow-sm ${
                template === 'dark' ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20' :
                template === 'glass' ? 'bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-400' : 'bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-755 font-extrabold'
              }`}
            >
              <PlusCircle className="h-4 w-4" /> Share Your Feedback
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className={`p-6 rounded-3xl border flex flex-col justify-between transition ${
                template === 'dark' ? 'bg-zinc-900/30 border-zinc-800 text-zinc-100' :
                template === 'glass' ? 'bg-white/5 border-white/10 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4.5 w-4.5 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700 dark:text-zinc-800'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 italic leading-relaxed mb-6">"{t.text}"</p>
                </div>
                
                <div className="flex items-center gap-3 border-t border-slate-100 dark:border-zinc-800/80 pt-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                    template === 'dark' ? 'bg-orange-600 text-white' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className={`font-black text-xs ${template === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t.name}</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Verified Club Member</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT AND EMBEDDED MAP DETAILS */}
        <section id="contact" className="grid md:grid-cols-3 gap-8 border-t border-slate-200/60 dark:border-zinc-900 pt-16">
          <div className={`p-8 rounded-3xl border flex flex-col justify-between ${
            template === 'dark' ? 'bg-zinc-900/30 border-zinc-800' :
            template === 'glass' ? 'bg-white/5 border-white/10 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div>
              <h3 className={`text-lg font-black mb-6 flex items-center gap-2 ${template === 'dark' ? 'text-white' : ''}`}>
                <Clock className="h-5 w-5 text-orange-500" /> Operating Hours
              </h3>
              <ul className="space-y-3 text-xs">
                {gym.opening_hours && Object.entries(gym.opening_hours).map(([day, hours]: any) => (
                  <li key={day} className="flex justify-between border-b border-slate-100 dark:border-zinc-850 pb-2">
                    <span className="font-bold text-slate-400">{day}</span>
                    <span className={`font-black ${template === 'dark' ? 'text-white' : ''}`}>{hours}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={`p-8 rounded-3xl border flex flex-col justify-between ${
            template === 'dark' ? 'bg-zinc-900/30 border-zinc-800' :
            template === 'glass' ? 'bg-white/5 border-white/10 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div>
              <h3 className={`text-lg font-black mb-6 flex items-center gap-2 ${template === 'dark' ? 'text-white' : ''}`}>
                <Mail className="h-5 w-5 text-orange-500" /> Club Contacts
              </h3>
              <ul className="space-y-4 text-xs">
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-sky-500 shrink-0" />
                  <div>
                    <p className={`font-black ${template === 'dark' ? 'text-white' : ''}`}>Phone</p>
                    <a href={`tel:${gym.phone}`} className="text-slate-400 hover:text-sky-500 transition">{gym.phone}</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className={`font-black ${template === 'dark' ? 'text-white' : ''}`}>Email</p>
                    <a href={`mailto:${gym.email}`} className="text-slate-400 hover:text-emerald-500 transition">{gym.email}</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-amber-500 shrink-0" />
                  <div>
                    <p className={`font-black ${template === 'dark' ? 'text-white' : ''}`}>Location</p>
                    <span className="text-slate-400">{gym.address}, {gym.city}, {gym.state}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Dynamic Map coordinates trigger directions link */}
          {gym.latitude && gym.longitude && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <div className="rounded-3xl overflow-hidden h-64 border border-slate-200 dark:border-zinc-800 relative">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={mapUrl}
              />
            </div>
          ) : (
            <div className={`rounded-3xl border border-dashed flex flex-col justify-center items-center p-6 text-center ${
              template === 'dark' ? 'border-zinc-850 text-white' : 'border-slate-300'
            }`}>
              <MapPin className="h-10 w-10 text-orange-500 mb-2 animate-bounce" />
              <p className="text-xs text-slate-400">Map coordinates configured: {gym.latitude}, {gym.longitude}</p>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${gym.latitude},${gym.longitude}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`mt-4 text-xs font-black uppercase ${
                  template === 'dark' ? 'text-orange-500 hover:underline' : 'text-indigo-600 hover:underline'
                }`}
              >
                Get Directions →
              </a>
            </div>
          )}
        </section>
      </main>

      {/* ────────────────── FOOTER RENDER ────────────────── */}
      <footer className={`border-t mt-24 transition duration-300 ${
        template === 'dark' ? 'border-zinc-900 bg-black text-zinc-400' :
        template === 'glass' ? 'border-white/5 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-600'
      }`}>
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            
            {/* Column 1: Branding, About & Social Links */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                {(gym.header_data?.show_logo_image !== false) && (gym.header_data?.logo_image || gym.logo_url) ? (
                  <img src={gym.header_data?.logo_image || gym.logo_url} alt={gym.name} className="h-9 w-9 object-contain rounded-lg" />
                ) : (
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center font-black shadow-sm text-sm ${
                    template === 'dark' ? 'bg-orange-600 text-white' :
                    template === 'glass' ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' : 'bg-slate-900 text-white'
                  }`}>{(gym.header_data?.logo_text || gym.name)?.[0] || 'G'}</div>
                )}
                <span className={`font-black text-base tracking-tight ${template === 'dark' ? 'text-white' : ''}`}>{gym.header_data?.logo_text || gym.name}</span>
              </div>
              <p className="text-xs leading-relaxed max-w-sm">
                {gym.footer_data?.about_text || 'Premium fitness facilities, custom-tailored conditioning programs, and elite trainers dedicated to your performance.'}
              </p>
              
              {/* Social links icons row */}
              <div className="flex items-center gap-3 pt-2">
                {gym.social_links?.facebook && (
                  <a href={gym.social_links.facebook} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full border transition ${
                    template === 'dark' ? 'border-zinc-800 bg-zinc-950 hover:text-orange-500 hover:border-orange-500 text-zinc-400' :
                    template === 'glass' ? 'border-white/10 bg-white/5 hover:text-cyan-400 hover:border-cyan-400 text-slate-400' :
                    'border-slate-200 bg-slate-50 hover:text-slate-900 hover:border-slate-400 text-slate-500'
                  }`}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                )}
                {gym.social_links?.instagram && (
                  <a href={gym.social_links.instagram} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full border transition ${
                    template === 'dark' ? 'border-zinc-800 bg-zinc-950 hover:text-orange-500 hover:border-orange-500 text-zinc-400' :
                    template === 'glass' ? 'border-white/10 bg-white/5 hover:text-cyan-400 hover:border-cyan-400 text-slate-400' :
                    'border-slate-200 bg-slate-50 hover:text-slate-900 hover:border-slate-400 text-slate-500'
                  }`}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                )}
                {gym.social_links?.youtube && (
                  <a href={gym.social_links.youtube} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full border transition ${
                    template === 'dark' ? 'border-zinc-800 bg-zinc-950 hover:text-orange-500 hover:border-orange-500 text-zinc-400' :
                    template === 'glass' ? 'border-white/10 bg-white/5 hover:text-cyan-400 hover:border-cyan-400 text-slate-400' :
                    'border-slate-200 bg-slate-50 hover:text-slate-900 hover:border-slate-400 text-slate-500'
                  }`}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Columns 2-4: Dynamic Custom Columns */}
            {gym.footer_data?.columns && gym.footer_data.columns.length > 0 ? (
              gym.footer_data.columns.slice(0, 3).map((col: any, colIdx: number) => (
                <div key={colIdx} className="space-y-4 text-left">
                  <h4 className={`text-xs font-black uppercase tracking-wider ${
                    template === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {col.title}
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {(col.links || []).map((link: any, linkIdx: number) => (
                      <li key={linkIdx}>
                        <a 
                          href={link.link || '#'} 
                          className={`transition ${
                            template === 'dark' ? 'hover:text-orange-500 text-zinc-400' :
                            template === 'glass' ? 'hover:text-cyan-400 text-slate-300' :
                            'hover:text-slate-900 text-slate-500'
                          }`}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              // Default Fallback Column 2: Quick Links
              <div className="space-y-4 text-left">
                <h4 className={`text-xs font-black uppercase tracking-wider ${
                  template === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  Quick Links
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <a href="#about" className={`transition ${template === 'dark' ? 'hover:text-orange-500 text-zinc-400' : template === 'glass' ? 'hover:text-cyan-400 text-slate-300' : 'hover:text-slate-900 text-slate-500'}`}>About Us</a>
                  </li>
                  <li>
                    <a href="#features" className={`transition ${template === 'dark' ? 'hover:text-orange-500 text-zinc-400' : template === 'glass' ? 'hover:text-cyan-400 text-slate-300' : 'hover:text-slate-900 text-slate-500'}`}>Programs</a>
                  </li>
                  <li>
                    <a href="#pricing" className={`transition ${template === 'dark' ? 'hover:text-orange-500 text-zinc-400' : template === 'glass' ? 'hover:text-cyan-400 text-slate-300' : 'hover:text-slate-900 text-slate-500'}`}>Pricing</a>
                  </li>
                </ul>
              </div>
            )}

            {/* Column 5: Beautiful Opening Hours */}
            {gym.opening_hours && Object.keys(gym.opening_hours).length > 0 && (
              <div className="space-y-4 text-left">
                <h4 className={`text-xs font-black uppercase tracking-wider ${
                  template === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  Opening Hours
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {Object.entries(gym.opening_hours).map(([day, hrs]: any) => (
                    <li key={day} className="flex justify-between border-b border-dashed border-slate-200 dark:border-zinc-800 pb-1">
                      <span className="font-semibold text-slate-500 dark:text-zinc-500">{day}</span>
                      <span className={`${template === 'dark' ? 'text-zinc-300' : 'text-slate-700'}`}>{hrs}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* Bottom strip */}
          <div className={`mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-4 ${
            template === 'dark' ? 'border-zinc-900 text-zinc-500' :
            template === 'glass' ? 'border-white/5 text-slate-500' : 'border-slate-200 text-slate-450'
          }`}>
            <p>
              {gym.footer_data?.copyright_text || `© ${new Date().getFullYear()} ${gym.name}. All rights reserved.`}
            </p>
            <div className="flex gap-4">
              <span className="hover:underline cursor-pointer">Privacy Policy</span>
              <span className="hover:underline cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ────────────────── MODAL: Direct Plan Subscription Checkout ────────────────── */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white text-slate-950 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl p-6 space-y-6">
            
            {/* Modal Close */}
            <button
              onClick={() => {
                setSelectedPlan(null);
                setCheckoutSuccess(null);
                setError(null);
                setCheckoutStep('info');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* STEP 1: Registration Form */}
            {checkoutStep === 'info' && (
              <>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto">
                    <Sparkles className="h-6 w-6 animate-pulse" />
                  </div>
                  <h3 className="font-extrabold text-xl">Join {gym.name}</h3>
                  <p className="text-xs text-slate-500">
                    Step 1 of 2: Create Account for plan <strong className="text-indigo-600">{selectedPlan.name}</strong> ({selectedPlan.price})
                  </p>
                </div>

                <form onSubmit={handleInfoSubmit} className="space-y-4">
                  {error && (
                    <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">{error}</p>
                  )}

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Your Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      required
                      value={checkoutForm.name}
                      onChange={(e) => setCheckoutForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. john@example.com"
                      required
                      value={checkoutForm.email}
                      onChange={(e) => setCheckoutForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Phone Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. +91 9988776655"
                      required
                      value={checkoutForm.phone}
                      onChange={(e) => setCheckoutForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Create Account Password</label>
                    <input 
                      type="password" 
                      placeholder="Min 6 characters"
                      required
                      value={checkoutForm.password}
                      onChange={(e) => setCheckoutForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50" 
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                  >
                    Proceed to Select Payment Option <ChevronRight className="h-4 w-4" />
                  </button>
                </form>
              </>
            )}

            {/* STEP 2: Payment Gateways Selector */}
            {checkoutStep === 'payment' && (
              <>
                <button
                  onClick={() => setCheckoutStep('info')}
                  className="absolute top-4 left-4 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>

                <div className="text-center space-y-2">
                  <h3 className="font-extrabold text-xl">Select Payment Gateway</h3>
                  <p className="text-xs text-slate-500">
                    Amount to pay: <strong className="text-indigo-600 font-extrabold">{selectedPlan.price}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                  
                  {/* Google Pay */}
                  <button
                    onClick={() => setPaymentMethod('gpay')}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition ${
                      paymentMethod === 'gpay' ? 'border-indigo-600 bg-indigo-50/40' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-white shadow-sm border rounded-xl flex items-center justify-center font-bold text-xs text-slate-700">GPay</div>
                      <div>
                        <h4 className="font-extrabold text-xs">Google Pay</h4>
                        <p className="text-[9px] text-slate-400">Direct instant Indian UPI Pay</p>
                      </div>
                    </div>
                    {paymentMethod === 'gpay' && <div className="h-2 w-2 rounded-full bg-indigo-600" />}
                  </button>

                  {/* PhonePe */}
                  <button
                    onClick={() => setPaymentMethod('phonepe')}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition ${
                      paymentMethod === 'phonepe' ? 'border-purple-600 bg-purple-50/40' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-purple-600 rounded-xl flex items-center justify-center font-bold text-xs text-white">Pe</div>
                      <div>
                        <h4 className="font-extrabold text-xs">PhonePe</h4>
                        <p className="text-[9px] text-slate-400">Scan & pay via PhonePe app</p>
                      </div>
                    </div>
                    {paymentMethod === 'phonepe' && <div className="h-2 w-2 rounded-full bg-purple-600" />}
                  </button>

                  {/* General UPI */}
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition ${
                      paymentMethod === 'upi' ? 'border-emerald-600 bg-emerald-50/40' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-emerald-600 rounded-xl flex items-center justify-center"><QrCode className="h-5 w-5 text-white" /></div>
                      <div>
                        <h4 className="font-extrabold text-xs">Any UPI App / Paytm</h4>
                        <p className="text-[9px] text-slate-400">Pay via BHIM QR Scanner</p>
                      </div>
                    </div>
                    {paymentMethod === 'upi' && <div className="h-2 w-2 rounded-full bg-emerald-600" />}
                  </button>

                  {/* Stripe / Card */}
                  <button
                    onClick={() => setPaymentMethod('stripe')}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition ${
                      paymentMethod === 'stripe' ? 'border-indigo-600 bg-indigo-50/40' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-slate-900 rounded-xl flex items-center justify-center"><CreditCard className="h-5 w-5 text-white" /></div>
                      <div>
                        <h4 className="font-extrabold text-xs">Stripe Checkout</h4>
                        <p className="text-[9px] text-slate-400">Credit / Debit card payment</p>
                      </div>
                    </div>
                    {paymentMethod === 'stripe' && <div className="h-2 w-2 rounded-full bg-slate-900" />}
                  </button>

                </div>

                {/* UPI Interactive Screen (Intent & QR Simulation) */}
                {(paymentMethod === 'gpay' || paymentMethod === 'phonepe' || paymentMethod === 'upi') && (
                  <div className="border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50 text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                        <QrCode className="h-32 w-32 text-slate-900" />
                        <span className="text-[9px] text-slate-400 mt-2 font-black tracking-widest">SCAN WITH ANY UPI APP</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold">Payee Merchant VPA: <strong className="text-indigo-600">gympay@okaxis</strong></p>
                      <p className="text-[10px] text-slate-500">
                        Please scan this dynamic checkout QR code using GPay, PhonePe, Paytm, or click below to directly trigger the payment request.
                      </p>
                    </div>

                    {/* Mobile UPI Deep Link Intent Trigger */}
                    <div className="flex flex-col gap-2 justify-center items-center">
                      <a 
                        href={upiPayString}
                        className={`w-full py-2.5 px-4 rounded-xl text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 ${
                          paymentMethod === 'gpay' ? 'bg-sky-600 hover:bg-sky-700' :
                          paymentMethod === 'phonepe' ? 'bg-purple-700 hover:bg-purple-800' : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        <Smartphone className="h-4 w-4" /> 
                        {paymentMethod === 'gpay' ? 'Launch Google Pay' : 
                         paymentMethod === 'phonepe' ? 'Launch PhonePe' : 'Trigger UPI Intent App'}
                      </a>
                    </div>
                  </div>
                )}

                {/* Stripe / Cards Interactive inputs */}
                {paymentMethod === 'stripe' && (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-black uppercase text-slate-400">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="4242 4242 4242 4242"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-black uppercase text-slate-400">Expiry Date</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] font-black uppercase text-slate-400">CVC Code</label>
                        <input 
                          type="text" 
                          placeholder="123"
                          value={cardDetails.cvc}
                          onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value }))}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">{error}</p>
                )}

                <button
                  onClick={handlePaymentSubmit}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="h-4.5 w-4.5" /> 
                  {paymentMethod === 'stripe' ? 'Confirm Payment & Subscribe' : 'Simulate Completed Payment & Onboard'}
                </button>
              </>
            )}

            {/* STEP 3: Submitting / Processing Gateway Screen */}
            {checkoutStep === 'processing' && (
              <div className="text-center space-y-6 py-12 flex flex-col justify-center items-center">
                <Loader2 className="h-16 w-16 text-indigo-600 animate-spin" />
                <div className="space-y-2">
                  <h3 className="font-extrabold text-xl text-slate-900">Authorizing Payment...</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Securing safe handshake with {paymentMethod.toUpperCase()} gateway app. Do not close or refresh this page!
                  </p>
                </div>
              </div>
            )}

            {/* STEP 4: Success Digital Pass */}
            {checkoutStep === 'success' && checkoutSuccess && (
              <div className="text-center space-y-6 py-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                  <Ticket className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-2xl text-slate-900">Subscription Confirmed!</h3>
                  <p className="text-xs text-slate-500">Welcome to the club family! Here is your onboarding membership pass.</p>
                </div>

                {/* Branded Digital Pass */}
                <div className="border border-dashed border-indigo-200 bg-indigo-50/30 rounded-3xl p-5 text-left relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/5 rounded-full" />
                  <div className="flex justify-between items-start border-b border-dashed border-indigo-150 pb-3 mb-3">
                    <div>
                      <h4 className="font-black text-xs text-slate-900">{gym.name}</h4>
                      <p className="text-[9px] text-slate-500">Official Membership ID Pass</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">ACTIVE</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p className="text-slate-500">Member: <strong className="text-slate-900 font-extrabold">{checkoutSuccess.name}</strong></p>
                    <p className="text-slate-500">Email: <strong className="text-slate-900 font-extrabold">{checkoutSuccess.email}</strong></p>
                    <p className="text-slate-500">Subscribed to: <strong className="text-indigo-700 font-extrabold">{checkoutSuccess.plan_name}</strong></p>
                  </div>
                </div>

                <div className="space-y-2 p-3 bg-slate-50 rounded-xl border">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 justify-center">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Transaction Verified via {paymentMethod.toUpperCase()}
                  </span>
                </div>

                <p className="text-[10px] text-slate-400">An invoice receipt and verification email have been successfully triggered. Use your credentials to log in to the Member Dashboard!</p>

                <button
                  onClick={() => {
                    setSelectedPlan(null);
                    setCheckoutSuccess(null);
                    setCheckoutStep('info');
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition"
                >
                  Close Pass & Return to Landing Page
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────── MODAL: Share Member Testimonial / Feedback ────────────────── */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white text-slate-950 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl p-6 space-y-6">
            
            {/* Close */}
            <button
              onClick={() => {
                setShowFeedbackModal(false);
                setError(null);
                setFeedbackSuccess(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto">
                <Star className="h-6 w-6 fill-indigo-600 text-indigo-600" />
              </div>
              <h3 className="font-extrabold text-xl">Share Your Experience</h3>
              <p className="text-xs text-slate-500">Submit a verified testimonial that will show on our official public page.</p>
            </div>

            {feedbackSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-center space-y-2 py-8">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold">{feedbackSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                {error && (
                  <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">{error}</p>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Your Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe"
                    required
                    value={feedbackForm.name}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Star Rating ({feedbackForm.rating} / 5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setFeedbackForm(prev => ({ ...prev, rating: stars }))}
                        className="transition hover:scale-110"
                      >
                        <Star className={`h-8 w-8 ${stars <= feedbackForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Your Testimonial Review</label>
                  <textarea 
                    rows={4}
                    placeholder="Describe your training experience inside the club, cleanliness, trainers support..."
                    required
                    value={feedbackForm.text}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50 resize-none" 
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
                >
                  {submittingFeedback ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : 'Publish Testimonial Instantly'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
