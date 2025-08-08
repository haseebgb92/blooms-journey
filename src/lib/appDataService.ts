import { auth, firestore } from './firebase/clientApp';
import { doc, setDoc, getDoc, collection, addDoc, updateDoc, Timestamp, onSnapshot } from 'firebase/firestore';

export interface AppData {
  // User Profile Data
  displayName: string;
  email: string;
  gender: string;
  skinTone: string;
  momBirthDate: Date | null;
  babyName: string;
  preferredCountry: string;
  userRole: string;
  
  // Pregnancy Data
  dueDate: Date | null;
  lastPeriodDate: Date | null;
  babyCount: string;
  notificationTime: string;
  babyGender: string;
  currentWeek: number;
  timelineWeek: number;
  
  // App Usage Data
  lastLogin: Date;
  totalSessions: number;
  featuresUsed: string[];
  
  // Settings
  theme: string;
  notificationsEnabled: boolean;
  language: string;
  
  // Analytics
  pageViews: { [key: string]: number };
  timeSpent: { [key: string]: number };
}

export interface UserActivity {
  timestamp: Date;
  action: string;
  page: string;
  data?: any;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  language: string;
  autoSync: boolean;
}

class AppDataService {
  private userId: string | null = null;

  constructor() {
    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
      this.userId = user?.uid || null;
    });
  }

  async initializeUserData(userData: Partial<AppData>): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');

    const userDocRef = doc(firestore, 'users', this.userId);
    await setDoc(userDocRef, {
      ...userData,
      lastLogin: Timestamp.now(),
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now()
    }, { merge: true });
  }

  async updateUserData(updates: Partial<AppData>): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');

    const userDocRef = doc(firestore, 'users', this.userId);
    await updateDoc(userDocRef, {
      ...updates,
      lastUpdated: Timestamp.now()
    });
  }

  async getUserData(): Promise<AppData | null> {
    if (!this.userId) return null;

    const userDocRef = doc(firestore, 'users', this.userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        dueDate: data.dueDate?.toDate() || null,
        lastPeriodDate: data.lastPeriodDate?.toDate() || null,
        momBirthDate: data.momBirthDate?.toDate() || null,
        lastLogin: data.lastLogin?.toDate() || new Date(),
      } as AppData;
    }
    return null;
  }

  async trackActivity(activity: Omit<UserActivity, 'timestamp'>): Promise<void> {
    if (!this.userId) return;

    await addDoc(collection(firestore, 'userActivities'), {
      userId: this.userId,
      ...activity,
      timestamp: Timestamp.now()
    });
  }

  async trackPageView(page: string): Promise<void> {
    if (!this.userId) return;

    const analyticsRef = doc(firestore, 'analytics', this.userId);
    const currentViews = await this.getPageViews(page);
    await setDoc(analyticsRef, {
      [`pageViews.${page}`]: currentViews + 1,
      lastUpdated: Timestamp.now()
    }, { merge: true });
  }

  private async getPageViews(page: string): Promise<number> {
    if (!this.userId) return 0;

    const analyticsRef = doc(firestore, 'analytics', this.userId);
    const analyticsDoc = await getDoc(analyticsRef);
    
    if (analyticsDoc.exists()) {
      const data = analyticsDoc.data();
      return data.pageViews?.[page] || 0;
    }
    return 0;
  }

  async trackTimeSpent(page: string, seconds: number): Promise<void> {
    if (!this.userId) return;

    const analyticsRef = doc(firestore, 'analytics', this.userId);
    const currentTime = await this.getTimeSpent(page);
    await setDoc(analyticsRef, {
      [`timeSpent.${page}`]: currentTime + seconds,
      lastUpdated: Timestamp.now()
    }, { merge: true });
  }

  private async getTimeSpent(page: string): Promise<number> {
    if (!this.userId) return 0;

    const analyticsRef = doc(firestore, 'analytics', this.userId);
    const analyticsDoc = await getDoc(analyticsRef);
    
    if (analyticsDoc.exists()) {
      const data = analyticsDoc.data();
      return data.timeSpent?.[page] || 0;
    }
    return 0;
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');

    const settingsRef = doc(firestore, 'appSettings', this.userId);
    await setDoc(settingsRef, {
      ...settings,
      lastUpdated: Timestamp.now()
    }, { merge: true });
  }

  async getSettings(): Promise<AppSettings> {
    if (!this.userId) {
      return {
        theme: 'system',
        notificationsEnabled: true,
        language: 'en',
        autoSync: true
      };
    }

    const settingsRef = doc(firestore, 'appSettings', this.userId);
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      return settingsDoc.data() as AppSettings;
    }
    
    return {
      theme: 'system',
      notificationsEnabled: true,
      language: 'en',
      autoSync: true
    };
  }

  // Sync all data from localStorage to Firebase
  async syncFromLocalStorage(): Promise<void> {
    if (!this.userId) return;

    try {
      // Get onboarding data
      const onboardingDataStr = localStorage.getItem('onboardingData');
      if (onboardingDataStr) {
        const onboardingData = JSON.parse(onboardingDataStr);
        
        // Convert string dates back to Date objects
        const syncData: Partial<AppData> = {
          dueDate: onboardingData.dueDate ? new Date(onboardingData.dueDate) : null,
          lastPeriodDate: onboardingData.lastPeriodDate ? new Date(onboardingData.lastPeriodDate) : null,
          momBirthDate: onboardingData.momBirthDate ? new Date(onboardingData.momBirthDate) : null,
          babyCount: onboardingData.babyCount || 'single',
          notificationTime: onboardingData.notificationTime || '09:00',
          babyGender: onboardingData.babyGender || 'unspecified',
          skinTone: onboardingData.skinTone || 'unspecified',
          babyName: onboardingData.babyName || '',
          preferredCountry: onboardingData.preferredCountry || 'Pakistan',
          userRole: onboardingData.userRole || 'mom',
          lastLogin: new Date()
        };

        await this.updateUserData(syncData);
        
        // Clear localStorage after successful sync
        localStorage.removeItem('onboardingData');
      }

      // Get other app data from localStorage
      const theme = localStorage.getItem('theme') || 'system';
      const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
      
      await this.updateSettings({
        theme: theme as 'light' | 'dark' | 'system',
        notificationsEnabled
      });

    } catch (error) {
      console.error('Error syncing data from localStorage:', error);
    }
  }

  // Listen to user data changes
  onUserDataChange(callback: (data: AppData | null) => void): () => void {
    if (!this.userId) return () => {};

    const userDocRef = doc(firestore, 'users', this.userId);
    return onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const appData: AppData = {
          ...data,
          dueDate: data.dueDate?.toDate() || null,
          lastPeriodDate: data.lastPeriodDate?.toDate() || null,
          momBirthDate: data.momBirthDate?.toDate() || null,
          lastLogin: data.lastLogin?.toDate() || new Date(),
        } as AppData;
        callback(appData);
      } else {
        callback(null);
      }
    });
  }

  // Export user data
  async exportUserData(): Promise<AppData | null> {
    return await this.getUserData();
  }

  // Delete user data
  async deleteUserData(): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');

    const userDocRef = doc(firestore, 'users', this.userId);
    await setDoc(userDocRef, { deletedAt: Timestamp.now() }, { merge: true });
  }
}

// Create singleton instance
export const appDataService = new AppDataService();

// Auto-sync function to be called on app initialization
export const initializeAppDataSync = async () => {
  try {
    await appDataService.syncFromLocalStorage();
    
    // Track app initialization
    await appDataService.trackActivity({
      action: 'app_initialized',
      page: 'app_startup'
    });
  } catch (error) {
    console.error('Error initializing app data sync:', error);
  }
}; 