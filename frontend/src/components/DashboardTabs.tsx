'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const getTabs = (role: string) => {
  const commonTabs = [
    { name: 'Available Bounties', href: '/dashboard/available-bounties' },
    { name: 'Profile', href: '/profile' },
  ];

  const creatorTabs = [
    { name: 'Review Submissions', href: '/dashboard/review' },
  ];

  const contributorTabs = [
    { name: 'My Submissions', href: '/dashboard/my-submissions' },
    { name: 'My Bounties', href: '/dashboard/my-bounties' },
  ];

  return role === 'creator'
    ? [...commonTabs, ...creatorTabs]
    : [...commonTabs, ...contributorTabs];
};

export function DashboardTabs() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const tabs = getTabs(user.role);

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                ${isActive
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 