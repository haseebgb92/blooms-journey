import { auth, firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, setDoc, Timestamp, collection, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { differenceInDays, differenceInHours, isToday, isTomorrow, format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

export interface ReminderNotification {
  id: string;
  type: 'water_intake' | 'doctor_appointment' | 'baby_message' | 'medication' | 'exercise' | 'baby_development_morning' | 'baby_development_night';
  title: string;
  body: string;
  scheduledTime: Date;
  completed: boolean;
  userId: string;
  data?: any;
}

export interface WaterIntakeReminder {
  id: string;
  time: string; // HH:mm format
  enabled: boolean;
  message: string;
}

export interface DoctorAppointment {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  notes: string;
  reminderHours: number; // Hours before appointment
}

export interface BabyDevelopmentSettings {
  enabled: boolean;
  morningTime: string; // Default: "08:00"
  nightTime: string; // Default: "20:00"
  includeTips: boolean;
  includeMilestones: boolean;
  includeSize: boolean;
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
  babyDevelopment: BabyDevelopmentSettings;
  medication: {
    enabled: boolean;
    times: string[]; // HH:mm format
  };
  exercise: {
    enabled: boolean;
    times: string[]; // HH:mm format
  };
}

export class MobileNotificationService {
  private static instance: MobileNotificationService;
  private checkInterval: NodeJS.Timeout | null = null;
  private isSupported: boolean = false;
  private permission: NotificationPermission = 'default';

  static getInstance(): MobileNotificationService {
    if (!MobileNotificationService.instance) {
      MobileNotificationService.instance = new MobileNotificationService();
    }
    return MobileNotificationService.instance;
  }

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
    this.permission = typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  }

  // Initialize mobile notifications
  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);

      // Request notification permission
      if (this.permission === 'default') {
        this.permission = await Notification.requestPermission();
      }

      if (this.permission === 'granted') {
        console.log('Notification permission granted');
        this.startReminderCheck();
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error: any) {
      // Handle service worker registration errors gracefully
      if (error.code === 'permission-denied' || error.name === 'NotAllowedError') {
        console.log('Service worker registration failed due to permissions');
        return false;
      } else {
        console.error('Error initializing mobile notifications:', error);
        return false;
      }
    }
  }

  // Start checking for reminders
  startReminderCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      await this.checkReminders();
    }, 60000); // Check every minute
  }

  // Stop checking for reminders
  stopReminderCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Check for due reminders
  private async checkReminders(): Promise<void> {
    const user = auth.currentUser;
    if (!user || this.permission !== 'granted') return;

    try {
      // Check water intake reminders
      await this.checkWaterIntakeReminders();
      
      // Check doctor appointments
      await this.checkDoctorAppointments();
      
      // Check baby messages
      await this.checkBabyMessages();
      
      // Check baby development notifications
      await this.checkBabyDevelopmentNotifications();
      
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  // Check water intake reminders
  private async checkWaterIntakeReminders(): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) return;

      const data = userDoc.data();
      const reminderSettings = data.reminderSettings;
      
      if (!reminderSettings?.waterIntake?.enabled) return;

      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const times = reminderSettings.waterIntake.times || ['09:00', '12:00', '15:00', '18:00'];

      // Check if current time matches any scheduled time
      if (times.includes(currentTime)) {
        const lastWaterReminder = data.lastWaterReminder;
        const today = startOfDay(now);

        if (!lastWaterReminder || !isToday(lastWaterReminder.toDate())) {
          await this.sendNotification({
            type: 'water_intake',
            title: '💧 Time to Hydrate!',
            body: 'Your baby needs you to stay hydrated! Drink a glass of water now.',
            scheduledTime: now,
            userId: user.uid,
            data: { time: currentTime }
          });

          // Update last water reminder time
          await setDoc(userDocRef, { lastWaterReminder: Timestamp.now() }, { merge: true });
        }
      }
    } catch (error: any) {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.log('Permission denied for water intake reminders, skipping...');
      } else {
        console.error('Error checking water intake reminders:', error);
      }
    }
  }

  // Check doctor appointments
  private async checkDoctorAppointments(): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) return;

      const data = userDoc.data();
      const reminderSettings = data.reminderSettings;
      
      if (!reminderSettings?.doctorAppointments?.enabled) return;

      const appointmentsRef = collection(firestore, 'users', user.uid, 'appointments');
      const appointmentsQuery = query(appointmentsRef, where('reminderSent', '==', false));
      const appointmentsSnapshot = await getDocs(appointmentsQuery);

      const now = new Date();
      const reminderHours = reminderSettings.doctorAppointments.reminderHours || 24;

      appointmentsSnapshot.forEach(async (doc) => {
        const appointment = doc.data();
        const appointmentDate = appointment.date.toDate();
        const timeUntilAppointment = differenceInHours(appointmentDate, now);

        if (timeUntilAppointment <= reminderHours && timeUntilAppointment > 0) {
          await this.sendNotification({
            type: 'doctor_appointment',
            title: '🏥 Doctor Appointment Reminder',
            body: `You have a doctor appointment in ${timeUntilAppointment} hours: ${appointment.title}`,
            scheduledTime: now,
            userId: user.uid,
            data: { appointmentId: doc.id, appointment }
          });

          // Mark reminder as sent
          await setDoc(doc.ref, { reminderSent: true }, { merge: true });
        }
      });
    } catch (error: any) {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.log('Permission denied for doctor appointments, skipping...');
      } else {
        console.error('Error checking doctor appointments:', error);
      }
    }
  }

  // Check baby messages
  private async checkBabyMessages(): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) return;

      const data = userDoc.data();
      const reminderSettings = data.reminderSettings;
      
      if (!reminderSettings?.babyMessages?.enabled) return;

      const lastBabyMessage = data.lastBabyMessage;
      const now = new Date();

      // Send baby message every 6 hours if enabled
      if (!lastBabyMessage || 
          differenceInHours(now, lastBabyMessage.toDate()) >= (reminderSettings.babyMessages.frequency || 6)) {
        
        const currentWeek = this.calculateCurrentWeek(data.dueDate?.toDate());
        const message = this.getBabyMessage(currentWeek);

        await this.sendNotification({
          type: 'baby_message',
          title: '👶 Message from Baby',
          body: message,
          scheduledTime: now,
          userId: user.uid,
          data: { week: currentWeek }
        });

        // Update last baby message time
        await setDoc(userDocRef, { lastBabyMessage: Timestamp.now() }, { merge: true });
      }
    } catch (error: any) {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.log('Permission denied for baby messages, skipping...');
      } else {
        console.error('Error checking baby messages:', error);
      }
    }
  }

  // Check baby development notifications (morning and night)
  private async checkBabyDevelopmentNotifications(): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) return;

      const data = userDoc.data();
      const reminderSettings = data.reminderSettings;
      
      if (!reminderSettings?.babyDevelopment?.enabled) return;

      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const today = startOfDay(now);
      
      const morningTime = reminderSettings.babyDevelopment.morningTime || '08:00';
      const nightTime = reminderSettings.babyDevelopment.nightTime || '20:00';

      // Check for morning notification
      if (currentTime === morningTime) {
        const lastMorningNotification = data.lastBabyDevelopmentMorning;
        
        if (!lastMorningNotification || !isToday(lastMorningNotification.toDate())) {
          const currentWeek = this.calculateCurrentWeek(data.dueDate?.toDate());
          const morningMessage = this.getBabyDevelopmentMessage(currentWeek, 'morning', reminderSettings.babyDevelopment);

          await this.sendNotification({
            type: 'baby_development_morning',
            title: '🌅 Good Morning! Baby Development Update',
            body: morningMessage,
            scheduledTime: now,
            userId: user.uid,
            data: { week: currentWeek, type: 'morning' }
          });

          // Update last morning notification time
          await setDoc(userDocRef, { lastBabyDevelopmentMorning: Timestamp.now() }, { merge: true });
        }
      }

      // Check for night notification
      if (currentTime === nightTime) {
        const lastNightNotification = data.lastBabyDevelopmentNight;
        
        if (!lastNightNotification || !isToday(lastNightNotification.toDate())) {
          const currentWeek = this.calculateCurrentWeek(data.dueDate?.toDate());
          const nightMessage = this.getBabyDevelopmentMessage(currentWeek, 'night', reminderSettings.babyDevelopment);

          await this.sendNotification({
            type: 'baby_development_night',
            title: '🌙 Good Night! Baby Development Summary',
            body: nightMessage,
            scheduledTime: now,
            userId: user.uid,
            data: { week: currentWeek, type: 'night' }
          });

          // Update last night notification time
          await setDoc(userDocRef, { lastBabyDevelopmentNight: Timestamp.now() }, { merge: true });
        }
      }
    } catch (error: any) {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.log('Permission denied for baby development notifications, skipping...');
      } else {
        console.error('Error checking baby development notifications:', error);
      }
    }
  }

  // Send notification
  async sendNotification(notification: Omit<ReminderNotification, 'id' | 'completed'>): Promise<void> {
    if (this.permission !== 'granted') return;

    try {
      // Store notification in Firestore
      const notificationRef = doc(collection(firestore, 'users', notification.userId, 'reminders'));
      const notificationData = {
        ...notification,
        id: notificationRef.id,
        completed: false,
        scheduledTime: Timestamp.fromDate(notification.scheduledTime)
      };

      await setDoc(notificationRef, notificationData);

      // Send push notification
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(notification.title, {
            body: notification.body,
            icon: '/images/icon.png',
            badge: '/images/icon.png',
            tag: `reminder-${notification.type}`,
            data: notification.data,
            requireInteraction: true,
            actions: [
              {
                action: 'complete',
                title: 'Complete',
                icon: '/images/icon.png'
              },
              {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/images/icon.png'
              }
            ],
            vibrate: [200, 100, 200]
          });
        } catch (swError) {
          console.error('Error showing notification:', swError);
        }
      }
    } catch (error: any) {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.log('Permission denied for storing notification, skipping...');
      } else {
        console.error('Error sending notification:', error);
      }
    }
  }

  // Calculate current pregnancy week
  private calculateCurrentWeek(dueDate?: Date): number {
    if (!dueDate) return 12;
    const week = 40 - Math.ceil(differenceInDays(dueDate, new Date()) / 7);
    return Math.max(1, Math.min(week, 40));
  }

  // Get baby message based on week
  private getBabyMessage(week: number): string {
    const messages = {
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

    return messages[week as keyof typeof messages] || "I'm growing and developing every day! 💕";
  }

  // Get baby development message based on week and time of day
  private getBabyDevelopmentMessage(week: number, timeOfDay: 'morning' | 'night', settings: BabyDevelopmentSettings): string {
    const developmentData = this.getBabyDevelopmentData(week);
    let message = '';

    if (timeOfDay === 'morning') {
      message = `🌅 Good morning! Here's your baby's development update for Week ${week}:\n\n`;
    } else {
      message = `🌙 Good night! Here's your baby's development summary for Week ${week}:\n\n`;
    }

    if (settings.includeSize) {
      message += `📏 Size: ${developmentData.size} (${developmentData.fruit})\n`;
    }

    if (settings.includeMilestones) {
      message += `🎯 Key Milestone: ${developmentData.milestone}\n`;
    }

    if (settings.includeTips) {
      message += `💡 Tip: ${developmentData.tip}\n`;
    }

    return message;
  }

  // Get baby development data based on week
  private getBabyDevelopmentData(week: number): any {
    const developmentData: { [key: number]: any } = {
      1: { size: "0.1mm", fruit: "Poppy seed", milestone: "Fertilization occurs", tip: "Start taking prenatal vitamins" },
      2: { size: "0.2mm", fruit: "Sesame seed", milestone: "Implantation in uterus", tip: "Continue healthy diet" },
      3: { size: "0.3mm", fruit: "Poppy seed", milestone: "Neural tube forms", tip: "Take folic acid" },
      4: { size: "0.4mm", fruit: "Sesame seed", milestone: "Heart starts beating", tip: "Schedule ultrasound" },
      5: { size: "0.5mm", fruit: "Sesame seed", milestone: "Major organs begin forming", tip: "Avoid raw fish" },
      6: { size: "0.6mm", fruit: "Lentil", milestone: "Arm and leg buds appear", tip: "Stay hydrated" },
      7: { size: "1.3cm", fruit: "Blueberry", milestone: "Brain developing rapidly", tip: "Get adequate rest" },
      8: { size: "1.6cm", fruit: "Kidney bean", milestone: "All major organs present", tip: "First trimester screening" },
      9: { size: "2.3cm", fruit: "Grape", milestone: "Major organs almost fully formed", tip: "Eat protein-rich foods" },
      10: { size: "3.1cm", fruit: "Kumquat", milestone: "Officially a fetus", tip: "Stay active with doctor's approval" },
      11: { size: "4.1cm", fruit: "Lime", milestone: "Baby starts moving", tip: "Continue prenatal vitamins" },
      12: { size: "5.4cm", fruit: "Lime", milestone: "First trimester complete", tip: "Schedule second trimester screening" },
      13: { size: "7.4cm", fruit: "Lemon", milestone: "Bones hardening", tip: "Eat calcium-rich foods" },
      14: { size: "8.7cm", fruit: "Peach", milestone: "Facial features defined", tip: "Practice relaxation techniques" },
      15: { size: "10.1cm", fruit: "Apple", milestone: "Can make sucking motions", tip: "Stay active with walking" },
      16: { size: "11.6cm", fruit: "Avocado", milestone: "Heart pumping 25 quarts daily", tip: "Listen to music together" },
      17: { size: "13cm", fruit: "Pear", milestone: "Practicing breathing movements", tip: "Practice deep breathing" },
      18: { size: "14.2cm", fruit: "Sweet potato", milestone: "Can hear your voice", tip: "Talk and sing to baby" },
      19: { size: "15.3cm", fruit: "Mango", milestone: "Skin becoming less transparent", tip: "Apply stretch mark cream" },
      20: { size: "16.4cm", fruit: "Banana", milestone: "Halfway there!", tip: "Start planning nursery" },
      21: { size: "26.7cm", fruit: "Carrot", milestone: "Developing sleep cycles", tip: "Establish bedtime routine" },
      22: { size: "27.8cm", fruit: "Coconut", milestone: "Taste buds developing", tip: "Eat varied healthy foods" },
      23: { size: "28.9cm", fruit: "Grapefruit", milestone: "Can hear sounds from outside", tip: "Avoid loud noises" },
      24: { size: "30cm", fruit: "Corn", milestone: "Face almost fully formed", tip: "Take belly photos" },
      25: { size: "34.6cm", fruit: "Cauliflower", milestone: "Gaining weight rapidly", tip: "Eat nutrient-dense foods" },
      26: { size: "35.6cm", fruit: "Lettuce", milestone: "Eyes opening", tip: "Use gentle lighting" },
      27: { size: "36.6cm", fruit: "Broccoli", milestone: "Practicing breathing", tip: "Practice breathing exercises" },
      28: { size: "37.6cm", fruit: "Eggplant", milestone: "Can dream now", tip: "Create peaceful environment" },
      29: { size: "38.6cm", fruit: "Butternut squash", milestone: "Getting stronger", tip: "Practice gentle exercises" },
      30: { size: "39.9cm", fruit: "Cabbage", milestone: "Gaining half pound per week", tip: "Eat small frequent meals" },
      31: { size: "41.1cm", fruit: "Pineapple", milestone: "Developing immune system", tip: "Get plenty of rest" },
      32: { size: "42.4cm", fruit: "Squash", milestone: "Practicing breathing and sucking", tip: "Practice breastfeeding positions" },
      33: { size: "43.7cm", fruit: "Durian", milestone: "Bones hardening", tip: "Continue calcium intake" },
      34: { size: "45cm", fruit: "Cantaloupe", milestone: "Gaining weight rapidly", tip: "Monitor weight gain" },
      35: { size: "46.2cm", fruit: "Honeydew", milestone: "Almost ready to meet you", tip: "Pack hospital bag" },
      36: { size: "47.4cm", fruit: "Romaine lettuce", milestone: "Final stretch", tip: "Finalize birth plan" },
      37: { size: "48.6cm", fruit: "Swiss chard", milestone: "Considered full-term soon", tip: "Monitor for labor signs" },
      38: { size: "49.8cm", fruit: "Leek", milestone: "Gaining ounce per day", tip: "Stay calm and prepared" },
      39: { size: "50.7cm", fruit: "Mini watermelon", milestone: "Almost ready", tip: "Trust your body" },
      40: { size: "51.2cm", fruit: "Small pumpkin", milestone: "Ready to meet you", tip: "Welcome your baby!" }
    };

    return developmentData[week] || developmentData[12];
  }

  // Schedule water intake reminder
  async scheduleWaterIntakeReminder(reminder: WaterIntakeReminder): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        waterIntakeReminders: [reminder]
      }, { merge: true });
    } catch (error) {
      console.error('Error scheduling water intake reminder:', error);
    }
  }

  // Schedule doctor appointment reminder
  async scheduleDoctorAppointment(appointment: DoctorAppointment): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const appointmentsRef = collection(firestore, 'users', user.uid, 'appointments');
      await setDoc(doc(appointmentsRef), {
        ...appointment,
        date: Timestamp.fromDate(appointment.date),
        reminderSent: false
      });
    } catch (error) {
      console.error('Error scheduling doctor appointment:', error);
    }
  }

  // Get all reminders for a user
  async getReminders(): Promise<ReminderNotification[]> {
    const user = auth.currentUser;
    if (!user) return [];

    try {
      const remindersRef = collection(firestore, 'users', user.uid, 'reminders');
      const remindersQuery = query(remindersRef, orderBy('scheduledTime', 'desc'));
      const remindersSnapshot = await getDocs(remindersQuery);

      return remindersSnapshot.docs.map(doc => ({
        ...doc.data(),
        scheduledTime: doc.data().scheduledTime.toDate()
      })) as ReminderNotification[];
    } catch (error: any) {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.log('Permission denied for getting reminders, returning empty array');
        return [];
      } else {
        console.error('Error getting reminders:', error);
        return [];
      }
    }
  }

  // Mark reminder as completed
  async markReminderCompleted(reminderId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const reminderRef = doc(firestore, 'users', user.uid, 'reminders', reminderId);
      await setDoc(reminderRef, { completed: true }, { merge: true });
    } catch (error: any) {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.log('Permission denied for marking reminder completed, skipping...');
      } else {
        console.error('Error marking reminder completed:', error);
      }
    }
  }
}

export const mobileNotificationService = MobileNotificationService.getInstance(); 