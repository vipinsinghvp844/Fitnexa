import Link from 'next/link';
import { getPublicGyms } from '@/lib/api';
import { MapPin, Search } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Gyms Near You | Gym SaaS',
  description: 'Search for the best gyms, fitness centers, and health clubs near your location.',
};

export default async function GymsDirectoryPage({
  searchParams,
}: {
  searchParams: { search?: string; lat?: string; lng?: string }
}) {
  const query: any = {};
  if (searchParams.search) query.search = searchParams.search;
  if (searchParams.lat && searchParams.lng) {
    query.latitude = parseFloat(searchParams.lat);
    query.longitude = parseFloat(searchParams.lng);
  }

  let gyms: any = [];
  try {
    const res = await getPublicGyms(query);
    gyms = res.data?.data || [];
  } catch (error) {
    console.error('Failed to fetch gyms:', error);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-sky-600 pb-24 pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find Your Perfect Gym
          </h1>
          <p className="mt-4 text-xl text-sky-100 max-w-2xl mx-auto">
            Discover and join the best fitness centers in your city. Get directions, view services, and start your fitness journey today.
          </p>
          
          <form className="mt-10 mx-auto max-w-2xl sm:flex justify-center" action="/gyms" method="GET">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                name="search"
                defaultValue={searchParams.search || ''}
                placeholder="Search by name or city..."
                className="w-full rounded-full border-0 px-12 py-4 text-base text-slate-900 shadow-sm ring-1 ring-inset ring-white focus:ring-2 focus:ring-inset focus:ring-sky-500"
              />
            </div>
            <button
              type="submit"
              className="mt-3 sm:mt-0 sm:ml-3 flex w-full sm:w-auto items-center justify-center rounded-full bg-slate-900 px-8 py-4 text-base font-medium text-white hover:bg-slate-800 transition"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <main className="-mt-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {gyms.map((gym: any) => (
            <Link key={gym.slug} href={`/gyms/${gym.slug}`}>
              <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:-translate-y-1 group">
                <div className="h-48 overflow-hidden bg-slate-100 relative">
                  {gym.gallery_images && gym.gallery_images.length > 0 ? (
                    <img src={gym.gallery_images[0]} alt={gym.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : gym.logo_url ? (
                    <img src={gym.logo_url} alt={gym.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-sky-50 text-sky-300">
                      <MapPin className="h-12 w-12" />
                    </div>
                  )}
                  {gym.distance !== undefined && (
                    <div className="absolute top-4 right-4 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
                      {Number(gym.distance).toFixed(1)} km away
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{gym.name}</h3>
                    <p className="flex items-start text-sm text-slate-500 mb-4 line-clamp-2">
                      <MapPin className="mr-1.5 h-4 w-4 shrink-0 mt-0.5" />
                      {gym.address}, {gym.city}, {gym.state}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-sm font-medium text-sky-600">View Profile →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {gyms.length === 0 && (
            <div className="col-span-full py-20 text-center rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm">
              <h3 className="text-lg font-medium text-slate-900">No gyms found</h3>
              <p className="mt-2 text-slate-500">Try adjusting your search criteria or location.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
