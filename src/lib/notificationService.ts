import { auth, firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, setDoc, Timestamp, collection, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
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
  const notifications = {
    1: "Welcome to your pregnancy journey! I'm just a tiny cell right now, but I'm growing fast! 💕",
    2: "I'm implanting in your uterus! You might not feel anything yet, but I'm here! 🌱",
    3: "My neural tube is forming! This is crucial for my brain and spine development! 🧠",
    4: "My heart is starting to beat! It's the most amazing sound you'll ever hear! 💓",
    5: "I'm about the size of a sesame seed! My major organs are beginning to form! 🌱",
    6: "My tiny arms and legs are starting to develop! I'm growing so fast! 👶",
    7: "I'm about the size of a blueberry! My brain is developing rapidly! 🫐",
    8: "My fingers and toes are forming! I'm becoming more human-like every day! ✋",
    9: "I'm about the size of a grape! My major organs are almost fully formed! 🍇",
    10: "I'm officially a fetus now! My critical development period is almost complete! 🎉",
    11: "I'm about the size of a lime! I'm starting to move, but you can't feel me yet! 🍋",
    12: "First trimester complete! I'm about the size of a plum! 🍑",
    13: "I'm about the size of a lemon! My bones are hardening! 🍋",
    14: "I'm about the size of a peach! My facial features are becoming more defined! 🍑",
    15: "I'm about the size of an apple! I can make sucking motions! 🍎",
    16: "I'm about the size of an avocado! My heart is pumping 25 quarts of blood daily! 🥑",
    17: "I'm about the size of a pear! I'm practicing breathing movements! 🍐",
    18: "I'm about the size of a sweet potato! I can hear your voice now! 🍠",
    19: "I'm about the size of a mango! My skin is becoming less transparent! 🥭",
    20: "Halfway there! I'm about the size of a banana! 🍌",
    21: "I'm about the size of a carrot! I'm developing my sleep cycles! 🥕",
    22: "I'm about the size of a coconut! My taste buds are developing! 🥥",
    23: "I'm about the size of a grapefruit! I can hear sounds from outside! 🍊",
    24: "I'm about the size of a corn! My face is almost fully formed! 🌽",
    25: "I'm about the size of a cauliflower! I'm gaining weight rapidly! 🥦",
    26: "I'm about the size of a lettuce! My eyes are opening! 🥬",
    27: "I'm about the size of a broccoli! I'm practicing breathing! 🥦",
    28: "I'm about the size of an eggplant! I can dream now! 🍆",
    29: "I'm about the size of a butternut squash! I'm getting stronger! 🎃",
    30: "I'm about the size of a cabbage! I'm gaining about half a pound per week! 🥬",
    31: "I'm about the size of a pineapple! I'm developing my immune system! 🍍",
    32: "I'm about the size of a squash! I'm practicing breathing and sucking! 🎃",
    33: "I'm about the size of a durian! My bones are hardening! 🥭",
    34: "I'm about the size of a cantaloupe! I'm gaining weight rapidly! 🍈",
    35: "I'm about the size of a honeydew! I'm almost ready to meet you! 🍈",
    36: "I'm about the size of a romaine lettuce! I'm in the final stretch! 🥬",
    37: "I'm about the size of a Swiss chard! I'm considered full-term soon! 🥬",
    38: "I'm about the size of a leek! I'm gaining about an ounce per day! 🧅",
    39: "I'm about the size of a mini watermelon! I'm almost ready! 🍉",
    40: "I'm about the size of a small pumpkin! I'm ready to meet you! 🎃"
  };

  return notifications[week as keyof typeof notifications] || "I'm growing and developing every day! 💕";
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
      await setDoc(doc(notificationsRef, notification.id), {
        ...notification,
        timestamp: Timestamp.fromDate(notification.timestamp)
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
          data: { week: currentWeek }
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
      
      // Simplified query to avoid index requirements - get all notifications and filter client-side
      const q = query(notificationsRef, orderBy('timestamp', 'desc'));
      
      const snapshot = await getDocs(q);
      const notifications: BabyNotification[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filter for unread notifications on the client side
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

  // Initialize mobile notifications
  async initializeMobileNotifications(): Promise<boolean> {
    try {
      return await this.mobileService.initialize();
    } catch (error: any) {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.log('Permission denied for mobile notifications, skipping initialization');
        return false;
      } else {
        console.error('Error initializing mobile notifications:', error);
        return false;
      }
    }
  }

  // Schedule water intake reminder
  async scheduleWaterIntakeReminder(times: string[]): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const reminders = times.map(time => ({
        id: `water-${time.replace(':', '-')}`,
        time,
        enabled: true,
        message: '💧 Time to drink water! Stay hydrated for you and your baby.'
      }));

      for (const reminder of reminders) {
        await this.mobileService.scheduleWaterIntakeReminder(reminder);
      }
    } catch (error) {
      console.error('Error scheduling water intake reminders:', error);
    }
  }

  // Schedule doctor appointment reminder
  async scheduleDoctorAppointment(appointment: any): Promise<void> {
    try {
      await this.mobileService.scheduleDoctorAppointment(appointment);
    } catch (error) {
      console.error('Error scheduling doctor appointment:', error);
    }
  }

  // Get all reminders
  async getReminders(): Promise<any[]> {
    try {
      return await this.mobileService.getReminders();
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  }

  // Mark reminder as completed
  async markReminderCompleted(reminderId: string): Promise<void> {
    try {
      await this.mobileService.markReminderCompleted(reminderId);
    } catch (error) {
      console.error('Error marking reminder as completed:', error);
    }
  }

  startNotificationCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      const shouldShow = await this.shouldShowNotification();
      if (shouldShow) {
        const notification = await this.generateBabyNotification();
        if (notification) {
          this.triggerNotificationDisplay(notification);
        }
      }
    }, 60000); // Check every minute

    // Start mobile notification service
    this.mobileService.startReminderCheck();
  }

  stopNotificationCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    // Stop mobile notification service
    this.mobileService.stopReminderCheck();
  }

  private triggerNotificationDisplay(notification: BabyNotification): void {
    // This would typically trigger a UI notification
    // For now, we'll just log it
    console.log('Baby notification:', notification.message);
    
    // You can implement custom notification display here
    // For example, showing a toast notification or modal
  }
}

export const notificationService = NotificationService.getInstance();
