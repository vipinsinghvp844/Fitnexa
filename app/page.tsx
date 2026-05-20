import type { Metadata } from 'next';
import { fetchPublicCmsContent, defaultCmsContent } from '@/lib/cms';
import { ModernTemplate } from '@/components/landing/ModernTemplate';
import { BoldTemplate } from '@/components/landing/BoldTemplate';
import { SportsTemplate } from '@/components/landing/SportsTemplate';
import { AnimatedGlassTemplate } from '@/components/landing/AnimatedGlassTemplate';
import { MinimalElegantTemplate } from '@/components/landing/MinimalElegantTemplate';
import { DarkNeonTemplate } from '@/components/landing/DarkNeonTemplate';

// Server Component — runs on server for SEO
export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchPublicCmsContent();
  const cms = content?.cms ?? defaultCmsContent.cms;
  const platform = content?.platform ?? defaultCmsContent.platform;

  return {
    title: cms.seo_title || platform.name,
    description: cms.seo_description,
    openGraph: {
      title: cms.seo_title || platform.name,
      description: cms.seo_description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: cms.seo_title || platform.name,
      description: cms.seo_description,
    },
  };
}

export default async function HomePage() {
  const content = await fetchPublicCmsContent();
  const cms = content?.cms ?? defaultCmsContent.cms;
  const platform = content?.platform ?? defaultCmsContent.platform;

  const props = { cms, platformName: platform.name };

  switch (cms.active_template) {
    case 'animated-glass':
      return <AnimatedGlassTemplate {...props} />;
    case 'minimal-elegant':
      return <MinimalElegantTemplate {...props} />;
    case 'dark-neon':
      return <DarkNeonTemplate {...props} />;
    case 'bold':
      return <BoldTemplate {...props} />;
    case 'sports':
      return <SportsTemplate {...props} />;
    default:
      return <ModernTemplate {...props} />;
  }
}
