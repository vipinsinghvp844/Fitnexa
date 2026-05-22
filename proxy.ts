import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export default function proxy(req: NextRequest) {
  const url = req.nextUrl;

  // Determine if this is a subdomain or a custom domain
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
  
  // Clean hostname for port if local dev
  const cleanHost = req.headers.get('host') || '';
  
  // Skip localhost:3000 or root domain checks
  if (
    cleanHost !== 'localhost:3000' &&
    cleanHost !== '127.0.0.1:3000' &&
    cleanHost !== rootDomain &&
    cleanHost !== `www.${rootDomain}`
  ) {
    // If it's a subdomain of our application (e.g. powerhouse.gymsaas.com)
    if (cleanHost.endsWith(`.${rootDomain}`)) {
      const subdomain = cleanHost.replace(`.${rootDomain}`, '');
      if (subdomain && subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'admin') {
        // Rewrite root path to the public gym profile route
        if (url.pathname === '/') {
          return NextResponse.rewrite(new URL(`/gyms/${subdomain}`, req.url));
        }
      }
    } else {
      // It's a fully custom domain mapping (e.g. www.powerhousegym.com)
      // Rewrite root path to load gym profile by the custom domain string
      if (url.pathname === '/') {
        return NextResponse.rewrite(new URL(`/gyms/${cleanHost}`, req.url));
      }
    }
  }

  return NextResponse.next();
}
