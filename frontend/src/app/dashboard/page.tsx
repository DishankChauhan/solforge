'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  console.log('User role:', user.role);

  const tabs = user.role === 'creator' 
    ? [
        { id: 'available', label: 'Available Bounties' },
        { id: 'review', label: 'Review Submissions' },
      ]
    : [
        { id: 'available', label: 'Available Bounties' },
        { id: 'submissions', label: 'My Submissions' },
        { id: 'bounties', label: 'My Bounties' },
      ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'available' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900">Available Bounties</h3>
              {/* Display available bounties */}
            </div>
          )}

          {activeTab === 'review' && user.role === 'creator' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900">Review Submissions</h3>
              {/* Display submissions for review */}
            </div>
          )}

          {activeTab === 'submissions' && user.role !== 'creator' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900">My Submissions</h3>
              {/* Display user's submissions */}
            </div>
          )}

          {activeTab === 'bounties' && user.role !== 'creator' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900">My Bounties</h3>
              {/* Display user's bounties */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 