'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import { IBountySubmission, SubmissionStatus } from '@/types/submission';
import { getFirebaseFirestore } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Timestamp, orderBy, getDocs } from 'firebase/firestore';

const formatDate = (timestamp: any) => {
  if (timestamp instanceof Timestamp) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  }
  return new Date(timestamp).toLocaleDateString();
};

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<IBountySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const wallet = useWallet();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Set up real-time listener for submissions
    const db = getFirebaseFirestore();
    const submissionsRef = collection(db, 'submissions');
    
    // Create a query that checks for both userId and submitterId fields
    const q = query(
      submissionsRef,
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const submissionsData: IBountySubmission[] = [];
        
        // First check submissions with userId
        snapshot.forEach((doc) => {
          const data = doc.data();
          submissionsData.push({ 
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds)
          } as IBountySubmission);
        });

        // If no submissions found with userId, try submitterId
        if (submissionsData.length === 0) {
          const submitterQuery = query(
            submissionsRef,
            where('submitterId', '==', user.uid)
          );
          const submitterSnapshot = await getDocs(submitterQuery);
          
          submitterSnapshot.forEach((doc) => {
            const data = doc.data();
            submissionsData.push({ 
              id: doc.id,
              ...data,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt : new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds)
            } as IBountySubmission);
          });
        }

        console.log('Fetched submissions:', submissionsData);
        setSubmissions(submissionsData);
        setError(null);
      } catch (err) {
        console.error('Error processing submissions:', err);
        setError('Error loading submissions');
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Error fetching submissions:', error);
      setError('Failed to load submissions');
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Submissions</h1>
      
      {submissions.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No submissions yet</h3>
          <p className="mt-2 text-gray-500">
            Start contributing to bounties to see your submissions here.
          </p>
          <div className="mt-6">
            <Link
              href="/bounties"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
            >
              Browse Bounties
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white shadow rounded-lg p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    <Link href={`/bounties/${submission.bountyId}`} className="hover:text-purple-600">
                      Bounty #{submission.bountyId}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Submitted {formatDate(submission.createdAt)}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-sm font-medium rounded-full ${
                    submission.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : submission.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                </span>
              </div>
              
              <div className="mt-4">
                <a
                  href={submission.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-500"
                >
                  View Pull Request →
                </a>
              </div>

              {submission.reviewerComments && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900">Reviewer Comments:</h4>
                  <p className="mt-1 text-sm text-gray-500">{submission.reviewerComments}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 