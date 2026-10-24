'use client';

import dynamic from 'next/dynamic';

const FinpulseDashboard = dynamic(
  () => import('@/components/FinpulseDashboard'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-sm selection:bg-sky-400 selection:text-black">
        <div className="flex items-center gap-3 p-6 rounded-2xl glass-panel-elevated border border-sky-500/30 shadow-2xl">
          <span className="w-5 h-5 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
          <span className="text-sky-300 font-semibold tracking-wide">Loading Finpulse Daily Budget...</span>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  return <FinpulseDashboard />;
}
