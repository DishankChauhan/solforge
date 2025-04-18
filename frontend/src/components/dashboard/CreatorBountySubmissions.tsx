import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetch';

interface Submission {
  id: string;
  userId: string;
  pullRequestUrl: string;
  issueUrl: string;
  bountyAmount: number;
  status: string;
}

interface Bounty {
  id: string;
  title: string;
  submissions: Submission[];
}

const CreatorBountySubmissions: React.FC = () => {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBounties = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/api/creator/bounties');
      if (!response.ok) {
        throw new Error('Failed to fetch bounties');
      }
      const data = await response.json();
      setBounties(data.bounties || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBounties();
  }, []);

  const handleApprove = async (submissionId: string) => {
    try {
      const response = await fetchWithAuth(`/api/submissions/${submissionId}/approve`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to approve submission');
      }
      // Optionally, refetch bounties to update the UI
      await fetchBounties();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReject = async (submissionId: string) => {
    try {
      const response = await fetchWithAuth(`/api/submissions/${submissionId}/reject`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to reject submission');
      }
      // Optionally, refetch bounties to update the UI
      await fetchBounties();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>My Bounties</h2>
      {bounties.map((bounty) => (
        <div key={bounty.id}>
          <h3>{bounty.title}</h3>
          <ul>
            {bounty.submissions.map((submission) => (
              <li key={submission.id}>
                <p>Issue: {submission.issueUrl}</p>
                <p>PR: {submission.pullRequestUrl}</p>
                <p>Amount: {submission.bountyAmount}</p>
                <button onClick={() => handleApprove(submission.id)}>Approve</button>
                <button onClick={() => handleReject(submission.id)}>Reject</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default CreatorBountySubmissions; 