'use client';

import { CircleUser, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  const router = useRouter();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card/80 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30 glass-effect">
      <SidebarTrigger className="md:hidden" />
      <div className="w-full flex-1">
        {/* Can add a search bar here if needed */}
      </div>
    </header>
  );
}
