import { getAuth } from 'firebase/auth';

/**
 * Helper function to make authenticated API requests
 * @param url API endpoint URL
 * @param options Fetch API options
 * @returns Promise with fetch response
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const token = await user.getIdToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {})
  };
  
  return fetch(url, {
    ...options,
    headers
  });
}

/**
 * Helper function to make unauthenticated API requests
 * @param url API endpoint URL
 * @param options Fetch API options
 * @returns Promise with fetch response
 */
export async function fetchApi(url: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  return fetch(url, {
    ...options,
    headers
  });
} 