import { auth, firestore } from './clientApp';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

// Wait for authentication to be ready
export const waitForAuth = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Get user data with retry logic
export const getUserData = async (userId: string, retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error: any) {
      console.error(`Attempt ${i + 1} failed to get user data:`, error);
      
      if (error.code === 'permission-denied') {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      // For other errors, don't retry
      throw error;
    }
  }
  
  throw new Error('Failed to get user data after multiple attempts');
};

// Set user data with retry logic
export const setUserData = async (userId: string, data: any, retries = 3): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await setDoc(doc(firestore, 'users', userId), {
        ...data,
        lastUpdated: Timestamp.fromDate(new Date())
      }, { merge: true });
      return;
    } catch (error: any) {
      console.error(`Attempt ${i + 1} failed to set user data:`, error);
      
      if (error.code === 'permission-denied') {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      // For other errors, don't retry
      throw error;
    }
  }
  
  throw new Error('Failed to set user data after multiple attempts');
};

// Listen to user data with error handling
export const listenToUserData = (
  userId: string, 
  onData: (data: any) => void, 
  onError?: (error: any) => void
): Unsubscribe => {
  try {
    return onSnapshot(
      doc(firestore, 'users', userId),
      (doc) => {
        if (doc.exists()) {
          onData(doc.data());
        } else {
          onData(null);
        }
      },
      (error) => {
        console.error('Error listening to user data:', error);
        if (onError) {
          onError(error);
        }
      }
    );
  } catch (error) {
    console.error('Error setting up user data listener:', error);
    if (onError) {
      onError(error);
    }
    // Return a no-op function
    return () => {};
  }
};

// Initialize user document if it doesn't exist
export const initializeUserDocument = async (user: User, initialData: any = {}): Promise<void> => {
  try {
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: Timestamp.fromDate(new Date()),
        lastUpdated: Timestamp.fromDate(new Date()),
        ...initialData
      });
      console.log('User document initialized');
    }
  } catch (error) {
    console.error('Error initializing user document:', error);
    throw error;
  }
};

// Check if user is authenticated and has necessary permissions
export const checkUserPermissions = async (): Promise<{ isAuthenticated: boolean; user: User | null; error?: string }> => {
  try {
    const user = await waitForAuth();
    
    if (!user) {
      return { isAuthenticated: false, user: null, error: 'User not authenticated' };
    }
    
    // Try to access user data to verify permissions
    try {
      await getUserData(user.uid);
      return { isAuthenticated: true, user };
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        return { isAuthenticated: true, user, error: 'Insufficient permissions' };
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error checking user permissions:', error);
    return { isAuthenticated: false, user: null, error: error.message };
  }
}; 