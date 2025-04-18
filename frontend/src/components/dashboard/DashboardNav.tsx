'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { cn } from '@/lib/utils';

const getNavigation = (role: string) => {
  const commonItems = [
    { name: 'Overview', href: '/dashboard' },
    { name: 'Available Bounties', href: '/dashboard/available-bounties' },
  ];

  const creatorItems = [
    { name: 'Review Submissions', href: '/dashboard/review' },
  ];

  const contributorItems = [
    { name: 'My Bounties', href: '/dashboard/my-bounties' },
    { name: 'My Submissions', href: '/dashboard/my-submissions' },
  ];

  return role === 'creator' 
    ? [...commonItems, ...creatorItems]
    : [...commonItems, ...contributorItems];
};

export function DashboardNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const navigation = getNavigation(user.role);

  return (
    <nav className="space-y-1 px-2">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
} 