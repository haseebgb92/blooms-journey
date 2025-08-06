import { auth, firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, setDoc, Timestamp, collection, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { getBabyNotification } from '@/ai/flows/babyNotification';
import { differenceInDays } from 'date-fns';

export interface BabyNotification {
  id: string;
  message: string;
  category: 'nutrition' | 'exercise' | 'symptoms';
  week: number;
  timestamp: Date;
  read: boolean;
  type: 'baby_message';
}

export interface UserActivity {
  lastActiveTime: Date;
  peakHours: {
    start: number; // Hour of day (0-23)
    end: number;
  };
  timezone: string;
}

const calculateCurrentWeek = (dueDate: Date | undefined): number => {
  if (!dueDate) return 12;
  const week = 40 - Math.ceil(differenceInDays(dueDate, new Date()) / 7);
  return Math.max(1, Math.min(week, 40));
};

const isPeakHour = (userActivity: UserActivity | null): boolean => {
  if (!userActivity) return true; // Default to true if no activity data
  
  const now = new Date();
  const currentHour = now.getHours();
  const { start, end } = userActivity.peakHours;
  
  // Handle cases where peak hours span midnight
  if (start <= end) {
    return currentHour >= start && currentHour <= end;
  } else {
    return currentHour >= start || currentHour <= end;
  }
};

const shouldShowNotification = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) return true;

    const data = userDoc.data();
    const lastNotification = data.lastBabyNotification;
    const notificationSettings = data.notificationSettings;
    
    // Check if baby notifications are enabled
    if (notificationSettings?.babyNotifications === false) return false;
    
    // Check if notifications are muted
    if (notificationSettings?.muteDuration === 'always') return false;
    
    // Check if it's been 24 hours since last notification
    if (lastNotification) {
      const lastNotificationDate = lastNotification.toDate();
      const now = new Date();
      const hoursSinceLastNotification = (now.getTime() - lastNotificationDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastNotification < 24) return false;
    }

    // Check if it's peak hour (if activity data exists)
    const userActivity = data.userActivity;
    if (userActivity && !isPeakHour(userActivity)) return false;

    return true;
  } catch (error) {
    console.error('Error checking notification timing:', error);
    return false;
  }
};

export class NotificationService {
  private static instance: NotificationService;
  private checkInterval: NodeJS.Timeout | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async shouldShowNotification(): Promise<boolean> {
    return await shouldShowNotification();
  }

  async generateAndStoreNotification(): Promise<BabyNotification | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      // Get user's due date and calculate current week
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) return null;

      const data = userDoc.data();
      const dueDate = data.dueDate?.toDate();
      const currentWeek = calculateCurrentWeek(dueDate);

      // Randomly select a category
      const categories: Array<'nutrition' | 'exercise' | 'symptoms'> = ['nutrition', 'exercise', 'symptoms'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];

      // Generate baby notification
      const message = await getBabyNotification({
        week: currentWeek,
        category: randomCategory
      });

      // Create notification object
      const notification: BabyNotification = {
        id: `baby-notification-${Date.now()}`,
        message,
        category: randomCategory,
        week: currentWeek,
        timestamp: new Date(),
        read: false,
        type: 'baby_message'
      };

      // Store notification in Firestore
      const notificationRef = doc(firestore, 'users', user.uid, 'notifications', notification.id);
      await setDoc(notificationRef, {
        ...notification,
        timestamp: Timestamp.fromDate(notification.timestamp)
      });

      // Update last notification timestamp
      await setDoc(userDocRef, {
        lastBabyNotification: Timestamp.now()
      }, { merge: true });

      return notification;
    } catch (error) {
      console.error('Error generating notification:', error);
      return null;
    }
  }

  async getUnreadNotifications(): Promise<BabyNotification[]> {
    const user = auth.currentUser;
    if (!user) return [];

    try {
      const notificationsRef = collection(firestore, 'users', user.uid, 'notifications');
      // Simplified query to avoid index requirement
      const q = query(notificationsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const notifications: BabyNotification[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === 'baby_message' && !data.read) {
          notifications.push({
            id: doc.id,
            message: data.message,
            category: data.category,
            week: data.week,
            timestamp: data.timestamp.toDate(),
            read: data.read,
            type: data.type
          });
        }
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const notificationRef = doc(firestore, 'users', user.uid, 'notifications', notificationId);
      await setDoc(notificationRef, { read: true }, { merge: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async updateUserActivity(): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const now = new Date();
      
      // Get user's timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Simple peak hours detection (9 AM - 6 PM local time)
      const peakHours = {
        start: 9,
        end: 18
      };

      await setDoc(userDocRef, {
        userActivity: {
          lastActiveTime: Timestamp.fromDate(now),
          peakHours,
          timezone
        }
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  }

  startNotificationCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check every 30 minutes for new notifications
    this.checkInterval = setInterval(async () => {
      const shouldShow = await this.shouldShowNotification();
      if (shouldShow) {
        const notification = await this.generateAndStoreNotification();
        if (notification) {
          this.triggerNotificationDisplay(notification);
        }
      }
    }, 30 * 60 * 1000); // Check every 30 minutes
  }

  stopNotificationCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private triggerNotificationDisplay(notification: BabyNotification): void {
    // Trigger both the dropdown update and the popup display
    const event = new CustomEvent('babyNotification', { detail: notification });
    window.dispatchEvent(event);
  }
}

export const notificationService = NotificationService.getInstance();
