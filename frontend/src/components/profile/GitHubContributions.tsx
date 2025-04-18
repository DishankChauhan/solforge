'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Contribution {
  date: string;
  count: number;
}

export default function GitHubContributions() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchContributions = async () => {
      if (!user?.githubUsername) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Generate mock contribution data
        const mockContributions = generateMockContributions();
        
        // Simulate API delay
        setTimeout(() => {
          setContributions(mockContributions);
          setLoading(false);
        }, 500);
        
      } catch (err) {
        console.error('Error fetching GitHub contributions:', err);
        setError('Failed to load GitHub contributions');
        setLoading(false);
      }
    };

    fetchContributions();
  }, [user?.githubUsername]);
  
  // Helper function to generate mock contribution data
  const generateMockContributions = (): Contribution[] => {
    const contributions = [];
    const today = new Date();
    
    for (let i = 60; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      contributions.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10) // Random contributions count 0-9
      });
    }
    
    return contributions;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700">
        {error}
      </div>
    );
  }

  if (!contributions.length) {
    return (
      <div className="bg-gray-50 p-4 rounded-md text-gray-700">
        No contribution data available.
      </div>
    );
  }

  // Prepare data for the chart
  const lastMonthContributions = contributions.slice(-30); // Get last 30 days
  
  const chartData = {
    labels: lastMonthContributions.map(c => new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Contributions',
        data: lastMonthContributions.map(c => c.count),
        backgroundColor: 'rgba(124, 58, 237, 0.6)',
        borderColor: 'rgba(124, 58, 237, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Last 30 Days GitHub Activity',
      },
    },
  };

  // Calculate total contributions
  const totalContributions = contributions.reduce((sum, item) => sum + item.count, 0);
  const averageDaily = totalContributions / contributions.length || 0;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-500">Total Contributions</div>
          <div className="text-2xl font-semibold text-gray-900">{totalContributions}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-500">Daily Average</div>
          <div className="text-2xl font-semibold text-gray-900">{averageDaily.toFixed(1)}</div>
        </div>
      </div>
      
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
} 