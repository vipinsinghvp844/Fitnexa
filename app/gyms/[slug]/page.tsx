import { Metadata } from 'next';
import { getPublicGym } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import GymInteractiveView from './GymInteractiveView';

interface Props {
  params: Promise<{ slug: string }>;
}

// Dynamic SEO Meta Tags Generation with dynamic fallback titles for Google Bots
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const res = await getPublicGym(slug);
    const gym = res.data;
    
    if (!gym || !gym.website_enabled) {
      return { title: 'Website Offline | Gym SaaS' };
    }

    const title = gym.seo_title || `${gym.name} | Best Gym in ${gym.city || 'Your City'}`;
    const description = gym.seo_description || gym.description || `Top fitness center in ${gym.city}. View plans, trainers, services, and join today!`;
    const keywords = gym.seo_keywords || `gym in ${gym.city}, fitness center ${gym.city}, personal training`;

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        images: gym.banner_image ? [gym.banner_image] : gym.logo_url ? [gym.logo_url] : [],
      }
    };
  } catch (error) {
    return { title: 'Gym Not Found' };
  }
}

export default async function GymProfilePage({ params }: Props) {
  let gym: any = null;
  const { slug } = await params;
  
  try {
    const res = await getPublicGym(slug);
    gym = res.data;
  } catch (error) {
    notFound();
  }

  // Handle unpublished status
  if (!gym || !gym.website_enabled) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="h-8 w-8 text-amber-500 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Website Offline</h1>
          <p className="text-slate-500 text-sm">
            The website for <strong>{gym?.name || 'this gym'}</strong> is currently in draft mode or unpublished. Check back later!
          </p>
          <div className="mt-6">
            <Link href="/gyms" className="text-sm font-semibold text-sky-600 hover:text-sky-700">
              ← Browse other gyms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <GymInteractiveView gym={gym} slug={slug} />;
}
