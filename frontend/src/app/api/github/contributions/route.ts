import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Verify auth token
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the GitHub username from the query parameter
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'GitHub username is required' },
        { status: 400 }
      );
    }

    // Fetch contributions from GitHub
    const contributions = await fetchGitHubContributions(username);
    
    return NextResponse.json({ contributions });
  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub contributions' },
      { status: 500 }
    );
  }
}

async function fetchGitHubContributions(username: string) {
  try {
    // In a real app, you would fetch actual GitHub contributions data
    // For demo purposes, we'll generate random contributions for the last 60 days
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
  } catch (error) {
    console.error('Error in fetchGitHubContributions:', error);
    throw error;
  }
} 