import { NextRequest } from 'next/server';
import { getFirebaseFirestore } from './firebase';
import { getDoc, doc } from 'firebase/firestore';

/**
 * Verify the Firebase authentication token from the request headers
 * @param request The Next.js request object
 * @returns The authenticated user or null if not authenticated
 */
export async function verifyAuthToken(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return null;
    }

    // On client side, we can't verify tokens - would need Firebase Admin SDK
    // Instead, we'll fetch user from the custom claims in the token
    // In a production app, this should be handled server-side with proper validation
    
    // For demo purposes, we're extracting the user ID from the JWT without verification
    // WARNING: This approach is NOT secure for production!
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const { user_id, sub } = JSON.parse(jsonPayload);
      const uid = user_id || sub;
      
      if (!uid) {
        console.error('No user ID found in token');
        return null;
      }
      
      // Get user data from Firestore
      const db = getFirebaseFirestore();
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        console.error('User document not found');
        return null;
      }
  
      return {
        uid,
        ...userSnap.data()
      };
    } catch (err) {
      console.error('Error decoding token:', err);
      return null;
    }
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
} 