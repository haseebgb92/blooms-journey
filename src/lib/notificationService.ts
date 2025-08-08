import { auth, firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, setDoc, Timestamp, collection, query, where, orderBy, getDocs, onSnapshot, addDoc, updateDoc } from 'firebase/firestore';
import { differenceInDays } from 'date-fns';
import { mobileNotificationService } from './mobileNotificationService';

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

export interface ReminderSettings {
  waterIntake: {
    enabled: boolean;
    frequency: number; // hours
    times: string[]; // HH:mm format
  };
  doctorAppointments: {
    enabled: boolean;
    reminderHours: number; // hours before appointment
  };
  babyMessages: {
    enabled: boolean;
    frequency: number; // hours
  };
  medication: {
    enabled: boolean;
    times: string[]; // HH:mm format
  };
  exercise: {
    enabled: boolean;
    times: string[]; // HH:mm format
  };
}

const calculateCurrentWeek = (dueDate: Date | undefined): number => {
  if (!dueDate) return 12;
  const week = 40 - Math.ceil(differenceInDays(dueDate, new Date()) / 7);
  return Math.max(1, Math.min(week, 40));
};

const isPeakHour = (userActivity: UserActivity | null): boolean => {
  if (!userActivity) return true;
  
  const now = new Date();
  const currentHour = now.getHours();
  const { start, end } = userActivity.peakHours;
  
  return currentHour >= start && currentHour <= end;
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

const getStaticNotification = (week: number): string => {
  const messages: { [key: number]: string } = {
    1: "Welcome to your pregnancy journey! I'm just a tiny cell right now, but I'm growing fast! 💕",
    2: "I'm implanting in your uterus! You might not feel anything yet, but I'm here! 🌱",
    3: "My neural tube is forming! This is crucial for my brain and spine development! 🧠",
    4: "My heart is starting to beat! It's the most amazing sound you'll ever hear! 💓",
    5: "I'm about the size of a sesame seed! My major organs are beginning to form! 🌱",
    6: "I'm growing so fast! My heart is beating and my brain is developing! 💕",
    7: "I'm the size of a blueberry now! My arms and legs are starting to form! 🫐",
    8: "I'm about the size of a kidney bean! I'm moving around, but you can't feel me yet! 🫘",
    9: "I'm the size of a grape! My tiny fingers and toes are forming! 🍇",
    10: "I'm about the size of a kumquat! My major organs are all in place! 🍊",
    11: "I'm the size of a fig! I'm starting to look more like a baby! 🫒",
    12: "I'm about the size of a lime! My reflexes are developing! 🍋",
    13: "I'm the size of a lemon! I can make sucking motions now! 🍋",
    14: "I'm about the size of a peach! My facial muscles are working! 🍑",
    15: "I'm the size of an apple! I can move my arms and legs! 🍎",
    16: "I'm about the size of an avocado! I'm practicing breathing! 🥑",
    17: "I'm the size of a pear! I can hear your voice now! 🍐",
    18: "I'm about the size of a sweet potato! I'm getting stronger! 🍠",
    19: "I'm the size of a mango! I'm developing my sense of taste! 🥭",
    20: "I'm about the size of a banana! I'm halfway there! 🍌",
    21: "I'm the size of a carrot! I'm very active now! 🥕",
    22: "I'm about the size of a coconut! I can hear your heartbeat! 🥥",
    23: "I'm the size of a grapefruit! My face is fully formed! 🍊",
    24: "I'm about the size of an ear of corn! I'm growing rapidly! 🌽",
    25: "I'm the size of a cauliflower! I'm practicing breathing! 🥦",
    26: "I'm about the size of a head of lettuce! My eyes are opening! 🥬",
    27: "I'm the size of a broccoli! I'm getting chubbier! 🥦",
    28: "I'm about the size of an eggplant! I'm very responsive! 🍆",
    29: "I'm the size of a butternut squash! I'm getting stronger! 🎃",
    30: "I'm about the size of a cabbage! I'm practicing breathing! 🥬",
    31: "I'm the size of a pineapple! I'm gaining weight fast! 🍍",
    32: "I'm about the size of a large jicama! I'm very active! 🥔",
    33: "I'm the size of a pineapple! I'm practicing breathing! 🍍",
    34: "I'm about the size of a cantaloupe! I'm getting ready! 🍈",
    35: "I'm the size of a honeydew melon! I'm almost ready! 🍈",
    36: "I'm about the size of a romaine lettuce! I'm getting bigger! 🥬",
    37: "I'm the size of a Swiss chard! I'm full-term soon! 🥬",
    38: "I'm about the size of a leek! I'm ready to meet you! 🧅",
    39: "I'm the size of a mini watermelon! I'm almost here! 🍉",
    40: "I'm about the size of a small pumpkin! I'm ready to be born! 🎃"
  };

  return messages[week] || "I'm growing and developing every day! I can't wait to meet you! 💕";
};

export class NotificationService {
  private static instance: NotificationService;
  private checkInterval: NodeJS.Timeout | null = null;
  private mobileService: typeof mobileNotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  constructor() {
    this.mobileService = mobileNotificationService;
  }

  async shouldShowNotification(): Promise<boolean> {
    return shouldShowNotification();
  }

  async generateBabyNotification(): Promise<BabyNotification | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) return null;

      const data = userDoc.data();
      const dueDate = data.dueDate?.toDate();
      const currentWeek = calculateCurrentWeek(dueDate);
      
      const message = getStaticNotification(currentWeek);
      
      const notification: BabyNotification = {
        id: `notification-${Date.now()}`,
        message,
        category: 'nutrition',
        week: currentWeek,
        timestamp: new Date(),
        read: false,
        type: 'baby_message'
      };

      // Save notification to Firestore
      const notificationsRef = collection(firestore, 'users', user.uid, 'notifications');
      await addDoc(notificationsRef, {
        ...notification,
        timestamp: Timestamp.fromDate(notification.timestamp),
        createdAt: Timestamp.now(),
        sound: true,
        completed: false
      });

      // Update last notification time
      await setDoc(userDocRef, {
        lastBabyNotification: Timestamp.now()
      }, { merge: true });

      // Send mobile notification if enabled
      const reminderSettings = data.reminderSettings;
      if (reminderSettings?.babyMessages?.enabled) {
        await this.mobileService.sendNotification({
          type: 'baby_message',
          title: '👶 Message from Baby',
          body: message,
          scheduledTime: new Date(),
          userId: user.uid,
          data: { week: currentWeek },
          sound: true
        });
      }

      return notification;
    } catch (error) {
      console.error('Error generating baby notification:', error);
      return null;
    }
  }

  async getUnreadNotifications(): Promise<BabyNotification[]> {
    const user = auth.currentUser;
    if (!user) return [];

    try {
      const notificationsRef = collection(firestore, 'users', user.uid, 'notifications');
      
      // Get all notifications and filter client-side
      const q = query(notificationsRef, orderBy('timestamp', 'desc'));
      
      const snapshot = await getDocs(q);
      const notifications: BabyNotification[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filter for unread notifications
        if (!data.read) {
          notifications.push({
            ...data,
            timestamp: data.timestamp.toDate(),
          } as BabyNotification);
        }
      });
      
      return notifications;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const notificationRef = doc(firestore, 'users', user.uid, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
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
      
      await setDoc(userDocRef, {
        userActivity: {
          lastActiveTime: Timestamp.fromDate(now),
          peakHours: {
            start: 9, // 9 AM
            end: 21   // 9 PM
          },
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  }

  async initializeMobileNotifications(): Promise<boolean> {
    try {
      return await this.mobileService.initialize();
    } catch (error) {
      console.error('Error initializing mobile notifications:', error);
      return false;
    }
  }

  async scheduleWaterIntakeReminder(times: string[]): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      for (const time of times) {
        await this.mobileService.scheduleWaterIntakeReminder({
          id: `water-${Date.now()}`,
          time,
          enabled: true,
          message: 'Time to hydrate!'
        });
      }
    } catch (error) {
      console.error('Error scheduling water intake reminders:', error);
    }
  }

  async scheduleDoctorAppointment(appointment: any): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await this.mobileService.scheduleDoctorAppointment(appointment);
    } catch (error) {
      console.error('Error scheduling doctor appointment:', error);
    }
  }

  async getReminders(): Promise<any[]> {
    try {
      return await this.mobileService.getReminders();
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  }

  async markReminderCompleted(reminderId: string): Promise<void> {
    try {
      await this.mobileService.markReminderCompleted(reminderId);
    } catch (error) {
      console.error('Error marking reminder completed:', error);
    }
  }

  startNotificationCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check immediately
    this.checkNotifications();

    // Then check every 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkNotifications();
    }, 5 * 60 * 1000); // 5 minutes
  }

  stopNotificationCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkNotifications(): Promise<void> {
    try {
      const shouldShow = await this.shouldShowNotification();
      if (shouldShow) {
        const notification = await this.generateBabyNotification();
        if (notification) {
          this.triggerNotificationDisplay(notification);
        }
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }

  private triggerNotificationDisplay(notification: BabyNotification): void {
    // This can be used to trigger UI updates or other notification displays
    console.log('Baby notification generated:', notification);
  }
}

export const notificationService = NotificationService.getInstance();
