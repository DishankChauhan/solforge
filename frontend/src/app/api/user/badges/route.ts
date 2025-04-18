import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-utils';
import { getFirebaseFirestore } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

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

    // Get Firestore instance
    const db = getFirebaseFirestore();
    
    // Query badges collection for the user
    const badgesRef = collection(db, 'user_badges');
    const badgesQuery = query(badgesRef, where('userId', '==', user.uid));
    const badgesSnapshot = await getDocs(badgesQuery);
    
    // Transform badges data
    const badges = badgesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Return the badges
    return NextResponse.json({ badges });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
} 