import { auth, firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, setDoc, Timestamp, collection, query, where, orderBy, getDocs, onSnapshot, addDoc, updateDoc } from 'firebase/firestore';
import { differenceInDays, differenceInHours, isToday, isTomorrow, format, isAfter, isBefore, startOfDay, endOfDay, parseISO, isEqual } from 'date-fns';

export interface ReminderNotification {
  id: string;
  type: 'water_intake' | 'doctor_appointment' | 'baby_message' | 'medication' | 'exercise' | 'baby_development_morning' | 'baby_development_night';
  title: string;
  body: string;
  scheduledTime: Date;
  completed: boolean;
  userId: string;
  data?: any;
  createdAt?: Date;
  sound?: boolean;
  read?: boolean;
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
  private audioContext: AudioContext | null = null;

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
        const permission = await Notification.requestPermission();
        this.permission = permission;
        
        if (permission !== 'granted') {
          console.log('Notification permission denied');
          return false;
        }
      }

      // Start checking for reminders
      this.startReminderCheck();
      
      console.log('Mobile notifications initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing mobile notifications:', error);
      return false;
    }
  }

  // Start checking for reminders
  startReminderCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check immediately
    this.checkReminders();

    // Then check every minute
    this.checkInterval = setInterval(() => {
      this.checkReminders();
    }, 60000); // 1 minute
  }

  // Stop checking for reminders
  stopReminderCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Check all reminders
  private async checkReminders(): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

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

      const times = reminderSettings.waterIntake.times || [];
      const now = new Date();
      const currentTime = format(now, 'HH:mm');

      // Check if current time matches any reminder time (within 1 minute)
      for (const time of times) {
        const [hours, minutes] = time.split(':').map(Number);
        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);
        
        const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
        const oneMinute = 60 * 1000;

        if (timeDiff <= oneMinute) {
          // Check if we already sent a notification for this time today
          const today = startOfDay(now);
          const tomorrow = endOfDay(now);
          
          const notificationsRef = collection(firestore, 'users', user.uid, 'notifications');
          const q = query(
            notificationsRef,
            where('type', '==', 'water_intake'),
            where('scheduledTime', '>=', Timestamp.fromDate(today)),
            where('scheduledTime', '<=', Timestamp.fromDate(tomorrow)),
            where('data.time', '==', time)
          );

          const snapshot = await getDocs(q);
          
          if (snapshot.empty) {
            // Send water intake reminder
            await this.sendNotification({
              type: 'water_intake',
              title: '💧 Time to Hydrate!',
              body: 'Your baby needs you to stay hydrated! Drink a glass of water now.',
              scheduledTime: now,
              userId: user.uid,
              data: { time },
              sound: true
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking water intake reminders:', error);
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

      // Get appointments from Firestore
      const appointmentsRef = collection(firestore, 'users', user.uid, 'appointments');
      const appointmentsQuery = query(appointmentsRef, where('date', '>=', Timestamp.now()));
      const appointmentsSnapshot = await getDocs(appointmentsQuery);

      const now = new Date();
      const reminderHours = reminderSettings.doctorAppointments.reminderHours || 24;

      appointmentsSnapshot.forEach((doc) => {
        const appointment = doc.data();
        const appointmentDate = appointment.date.toDate();
        const timeUntilAppointment = differenceInHours(appointmentDate, now);

        if (timeUntilAppointment <= reminderHours && timeUntilAppointment > 0) {
          // Check if we already sent a reminder for this appointment
          const notificationsRef = collection(firestore, 'users', user.uid, 'notifications');
          const q = query(
            notificationsRef,
            where('type', '==', 'doctor_appointment'),
            where('data.appointmentId', '==', doc.id)
          );

          getDocs(q).then((snapshot) => {
            if (snapshot.empty) {
              // Send appointment reminder
              this.sendNotification({
                type: 'doctor_appointment',
                title: '🏥 Doctor Appointment Reminder',
                body: `You have a doctor appointment tomorrow at ${appointment.time}. Don't forget!`,
                scheduledTime: now,
                userId: user.uid,
                data: { 
                  appointmentId: doc.id,
                  appointmentDate: appointment.date,
                  time: appointment.time,
                  location: appointment.location
                },
                sound: true
              });
            }
          });
        }
      });
    } catch (error) {
      console.error('Error checking doctor appointments:', error);
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
      const frequency = reminderSettings.babyMessages.frequency || 6;
      const now = new Date();

      // Check if enough time has passed since last message
      if (!lastBabyMessage || differenceInHours(now, lastBabyMessage.toDate()) >= frequency) {
        const dueDate = data.dueDate?.toDate();
        const currentWeek = this.calculateCurrentWeek(dueDate);
        const message = this.getBabyMessage(currentWeek);

        await this.sendNotification({
          type: 'baby_message',
          title: '👶 Message from Baby',
          body: message,
          scheduledTime: now,
          userId: user.uid,
          data: { week: currentWeek },
          sound: true
        });

        // Update last baby message time
        await setDoc(userDocRef, {
          lastBabyMessage: Timestamp.now()
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error checking baby messages:', error);
    }
  }

  // Check baby development notifications
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

      const dueDate = data.dueDate?.toDate();
      const currentWeek = this.calculateCurrentWeek(dueDate);
      const now = new Date();
      const currentTime = format(now, 'HH:mm');

      // Check morning notification
      if (currentTime === reminderSettings.babyDevelopment.morningTime) {
        const today = startOfDay(now);
        const notificationsRef = collection(firestore, 'users', user.uid, 'notifications');
        const q = query(
          notificationsRef,
          where('type', '==', 'baby_development_morning'),
          where('scheduledTime', '>=', Timestamp.fromDate(today))
        );

        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          const message = this.getBabyDevelopmentMessage(currentWeek, 'morning', reminderSettings.babyDevelopment);
          
          await this.sendNotification({
            type: 'baby_development_morning',
            title: '👶 Good Morning, Mommy!',
            body: message,
            scheduledTime: now,
            userId: user.uid,
            data: { week: currentWeek, timeOfDay: 'morning' },
            sound: true
          });
        }
      }

      // Check night notification
      if (currentTime === reminderSettings.babyDevelopment.nightTime) {
        const today = startOfDay(now);
        const notificationsRef = collection(firestore, 'users', user.uid, 'notifications');
        const q = query(
          notificationsRef,
          where('type', '==', 'baby_development_night'),
          where('scheduledTime', '>=', Timestamp.fromDate(today))
        );

        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          const message = this.getBabyDevelopmentMessage(currentWeek, 'night', reminderSettings.babyDevelopment);
          
          await this.sendNotification({
            type: 'baby_development_night',
            title: '👶 Good Night, Mommy!',
            body: message,
            scheduledTime: now,
            userId: user.uid,
            data: { week: currentWeek, timeOfDay: 'night' },
            sound: true
          });
        }
      }
    } catch (error) {
      console.error('Error checking baby development notifications:', error);
    }
  }

  // Send notification with sound and store in Firestore
  async sendNotification(notification: Omit<ReminderNotification, 'id' | 'completed'>): Promise<void> {
    if (this.permission !== 'granted') return;

    try {
      // Store notification in Firestore
      const notificationsRef = collection(firestore, 'users', notification.userId, 'notifications');
      const notificationData = {
        ...notification,
        completed: false,
        scheduledTime: Timestamp.fromDate(notification.scheduledTime),
        createdAt: Timestamp.now(),
        sound: notification.sound || false,
        read: false
      };

      const docRef = await addDoc(notificationsRef, notificationData);
      const notificationId = docRef.id;

      console.log('Notification stored in Firestore:', notificationId);

      // Create the full notification object
      const fullNotification: ReminderNotification = {
        ...notification,
        id: notificationId,
        completed: false
      };

      // Send push notification
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          
          const options: NotificationOptions = {
            body: notification.body,
            icon: '/images/icon.png',
            badge: '/images/icon.png',
            tag: `reminder-${notification.type}-${notificationId}`,
            data: {
              ...notification.data,
              notificationId,
              type: notification.type
            },
            requireInteraction: true,
            silent: !notification.sound
          };

          await registration.showNotification(notification.title, options);

          // Play sound if enabled
          if (notification.sound) {
            this.playNotificationSound(notification.type);
          }

          // Show mobile popup for mobile devices
          if (typeof window !== 'undefined' && window.innerWidth <= 768) {
            // Small delay to ensure the popup appears after the notification
            setTimeout(() => {
              this.showMobilePopup(fullNotification);
            }, 500);
          }

          console.log('Push notification sent:', notification.title);
        } catch (swError) {
          console.error('Error showing notification:', swError);
          
          // Fallback: show mobile popup even if service worker fails
          if (typeof window !== 'undefined' && window.innerWidth <= 768) {
            this.showMobilePopup(fullNotification);
          }
        }
      } else {
        // Fallback for browsers without service worker support
        if (notification.sound) {
          this.playNotificationSound(notification.type);
        }
        
        // Show mobile popup as fallback
        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
          this.showMobilePopup(fullNotification);
        }
      }

      // Always show mobile popup for important notifications
      if (typeof window !== 'undefined' && window.innerWidth <= 768) {
        // Ensure popup is shown even if other methods fail
        setTimeout(() => {
          this.showMobilePopup(fullNotification);
        }, 1000);
      }
    } catch (error: any) {
      if (error.code !== 'permission-denied') {
        console.error('Error sending notification:', error);
      }
    }
  }

  // Play notification sound with different tones for different notification types
  private playNotificationSound(notificationType?: string): void {
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        if (!this.audioContext) {
          this.audioContext = new AudioContext();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Different sound patterns for different notification types
        let frequencies: number[] = [];
        let durations: number[] = [];

        switch (notificationType) {
          case 'water_intake':
            // Gentle water drop sound
            frequencies = [800, 600, 800, 1000];
            durations = [0.1, 0.1, 0.1, 0.2];
            break;
          case 'baby_message':
            // Sweet baby chime
            frequencies = [523, 659, 784, 659]; // C, E, G, E
            durations = [0.15, 0.15, 0.15, 0.2];
            break;
          case 'doctor_appointment':
            // Professional reminder tone
            frequencies = [440, 554, 659, 440]; // A, C#, E, A
            durations = [0.2, 0.2, 0.2, 0.3];
            break;
          case 'baby_development_morning':
            // Morning wake-up tone
            frequencies = [659, 784, 880, 784]; // E, G, A, G
            durations = [0.15, 0.15, 0.15, 0.25];
            break;
          case 'baby_development_night':
            // Gentle night tone
            frequencies = [440, 523, 440, 392]; // A, C, A, G
            durations = [0.2, 0.2, 0.2, 0.3];
            break;
          default:
            // Default notification sound
            frequencies = [800, 600, 800];
            durations = [0.1, 0.1, 0.2];
        }

        const startTime = this.audioContext.currentTime;
        let currentTime = startTime;

        frequencies.forEach((freq, index) => {
          oscillator.frequency.setValueAtTime(freq, currentTime);
          currentTime += durations[index];
        });

        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + currentTime);

        oscillator.start(startTime);
        oscillator.stop(startTime + currentTime);
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  // Play a simple notification tone (fallback)
  private playSimpleNotificationSound(): void {
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        if (!this.audioContext) {
          this.audioContext = new AudioContext();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
      }
    } catch (error) {
      console.error('Error playing simple notification sound:', error);
    }
  }

  // Show mobile popup notification
  private showMobilePopup(notification: ReminderNotification): void {
    try {
      // Create custom event for mobile popup
      const popupEvent = new CustomEvent('mobileNotificationPopup', {
        detail: {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          data: notification.data,
          timestamp: new Date()
        }
      });

      window.dispatchEvent(popupEvent);
      console.log('Mobile popup event dispatched:', notification.title);
    } catch (error) {
      console.error('Error showing mobile popup:', error);
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
  }

  // Get baby development message
  private getBabyDevelopmentMessage(week: number, timeOfDay: 'morning' | 'night', settings: BabyDevelopmentSettings): string {
    const developmentData = this.getBabyDevelopmentData(week);
    let message = `Good ${timeOfDay}, Mommy! I'm now ${developmentData.size} and ${developmentData.milestone}! 💕`;

    if (settings.includeTips) {
      message += `\n\n💡 Tip: ${developmentData.tip}`;
    }

    if (settings.includeSize) {
      message += `\n\n📏 I'm about the size of a ${developmentData.fruit}!`;
    }

    if (settings.includeMilestones) {
      message += `\n\n🎯 Milestone: ${developmentData.milestone}`;
    }

    return message;
  }

  // Get baby development data
  private getBabyDevelopmentData(week: number): any {
    const developmentData: { [key: number]: { size: string; fruit: string; milestone: string; tip: string } } = {
      1: { size: "a tiny cell", fruit: "poppy seed", milestone: "just beginning to form", tip: "Start taking prenatal vitamins if you haven't already!" },
      2: { size: "implanting", fruit: "sesame seed", milestone: "implanting in your uterus", tip: "Rest well and stay hydrated!" },
      3: { size: "forming neural tube", fruit: "poppy seed", milestone: "neural tube developing", tip: "Folic acid is crucial for my brain development!" },
      4: { size: "heart starting to beat", fruit: "poppy seed", milestone: "heart beginning to form", tip: "Avoid alcohol and smoking completely!" },
      5: { size: "major organs forming", fruit: "sesame seed", milestone: "organs developing", tip: "Eat a balanced diet rich in nutrients!" },
      6: { size: "heart beating", fruit: "lentil", milestone: "heart beating regularly", tip: "Stay active with gentle exercises!" },
      7: { size: "arms and legs forming", fruit: "blueberry", milestone: "limb buds appearing", tip: "Get plenty of rest and sleep!" },
      8: { size: "moving around", fruit: "kidney bean", milestone: "starting to move", tip: "Stay hydrated and drink plenty of water!" },
      9: { size: "fingers and toes forming", fruit: "grape", milestone: "digits developing", tip: "Eat small, frequent meals to manage nausea!" },
      10: { size: "major organs in place", fruit: "kumquat", milestone: "organs fully formed", tip: "Continue with prenatal care appointments!" },
      11: { size: "looking more like a baby", fruit: "fig", milestone: "facial features developing", tip: "Practice relaxation techniques!" },
      12: { size: "reflexes developing", fruit: "lime", milestone: "reflexes starting", tip: "Start thinking about childbirth classes!" },
      13: { size: "making sucking motions", fruit: "lemon", milestone: "sucking reflex", tip: "Stay active with pregnancy-safe exercises!" },
      14: { size: "facial muscles working", fruit: "peach", milestone: "facial expressions", tip: "Eat protein-rich foods for my growth!" },
      15: { size: "moving arms and legs", fruit: "apple", milestone: "coordinated movements", tip: "Practice good posture to support your growing belly!" },
      16: { size: "practicing breathing", fruit: "avocado", milestone: "breathing practice", tip: "Stay hydrated and avoid overheating!" },
      17: { size: "hearing your voice", fruit: "pear", milestone: "hearing developing", tip: "Talk and sing to me often!" },
      18: { size: "getting stronger", fruit: "sweet potato", milestone: "muscle development", tip: "Continue with gentle exercises!" },
      19: { size: "developing taste", fruit: "mango", milestone: "taste buds forming", tip: "Eat a variety of healthy foods!" },
      20: { size: "halfway there", fruit: "banana", milestone: "halfway point", tip: "Start planning for my arrival!" },
      21: { size: "very active", fruit: "carrot", milestone: "increased activity", tip: "Monitor my movements daily!" },
      22: { size: "hearing your heartbeat", fruit: "coconut", milestone: "hearing your heart", tip: "Stay calm and relaxed!" },
      23: { size: "face fully formed", fruit: "grapefruit", milestone: "facial features complete", tip: "Continue with prenatal vitamins!" },
      24: { size: "growing rapidly", fruit: "ear of corn", milestone: "rapid growth phase", tip: "Eat nutrient-dense foods!" },
      25: { size: "practicing breathing", fruit: "cauliflower", milestone: "breathing practice", tip: "Stay active and mobile!" },
      26: { size: "eyes opening", fruit: "head of lettuce", milestone: "eyes opening", tip: "Get plenty of rest!" },
      27: { size: "getting chubbier", fruit: "broccoli", milestone: "weight gain", tip: "Eat healthy fats for my brain!" },
      28: { size: "very responsive", fruit: "eggplant", milestone: "responding to stimuli", tip: "Play music and talk to me!" },
      29: { size: "getting stronger", fruit: "butternut squash", milestone: "muscle strength", tip: "Stay active with walking!" },
      30: { size: "practicing breathing", fruit: "cabbage", milestone: "breathing practice", tip: "Practice relaxation techniques!" },
      31: { size: "gaining weight fast", fruit: "pineapple", milestone: "rapid weight gain", tip: "Eat protein-rich foods!" },
      32: { size: "very active", fruit: "large jicama", milestone: "high activity level", tip: "Monitor my movements!" },
      33: { size: "practicing breathing", fruit: "pineapple", milestone: "breathing practice", tip: "Stay hydrated!" },
      34: { size: "getting ready", fruit: "cantaloupe", milestone: "preparing for birth", tip: "Pack your hospital bag!" },
      35: { size: "almost ready", fruit: "honeydew melon", milestone: "nearly full-term", tip: "Rest and prepare for labor!" },
      36: { size: "getting bigger", fruit: "romaine lettuce", milestone: "continued growth", tip: "Stay comfortable and rest!" },
      37: { size: "full-term soon", fruit: "Swiss chard", milestone: "full-term approaching", tip: "Be ready for labor signs!" },
      38: { size: "ready to meet you", fruit: "leek", milestone: "ready for birth", tip: "Watch for labor signs!" },
      39: { size: "almost here", fruit: "mini watermelon", milestone: "any day now", tip: "Stay calm and ready!" },
      40: { size: "ready to be born", fruit: "small pumpkin", milestone: "ready for birth", tip: "You're ready to meet me!" }
    };

    return developmentData[week] || { size: "growing", fruit: "baby", milestone: "developing", tip: "Take care of yourself!" };
  }

  // Schedule water intake reminder
  async scheduleWaterIntakeReminder(reminder: WaterIntakeReminder): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const remindersRef = collection(firestore, 'users', user.uid, 'reminders');
      await addDoc(remindersRef, {
        ...reminder,
        type: 'water_intake',
        scheduledTime: Timestamp.now(),
        completed: false
      });
    } catch (error) {
      console.error('Error scheduling water intake reminder:', error);
    }
  }

  // Schedule doctor appointment
  async scheduleDoctorAppointment(appointment: DoctorAppointment): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const appointmentsRef = collection(firestore, 'users', user.uid, 'appointments');
      await addDoc(appointmentsRef, {
        ...appointment,
        date: Timestamp.fromDate(appointment.date),
        createdAt: Timestamp.now()
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
      if (error.code === 'permission-denied') {
        console.log('Permission denied for getting reminders, returning empty array');
        return [];
      } else {
        console.error('Error getting reminders:', error);
        return [];
      }
    }
  }

  // Get all notifications for a user
  async getNotifications(): Promise<ReminderNotification[]> {
    const user = auth.currentUser;
    if (!user) return [];

    try {
      const notificationsRef = collection(firestore, 'users', user.uid, 'notifications');
      const notificationsQuery = query(notificationsRef, orderBy('scheduledTime', 'desc'));
      const notificationsSnapshot = await getDocs(notificationsQuery);

      return notificationsSnapshot.docs.map(doc => ({
        ...doc.data(),
        scheduledTime: doc.data().scheduledTime.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as ReminderNotification[];
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        console.log('Permission denied for getting notifications, returning empty array');
        return [];
      } else {
        console.error('Error getting notifications:', error);
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
      await updateDoc(reminderRef, { completed: true });
    } catch (error: any) {
      if (error.code !== 'permission-denied') {
        console.error('Error marking reminder completed:', error);
      }
    }
  }

  // Mark notification as completed
  async markNotificationCompleted(notificationId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const notificationRef = doc(firestore, 'users', user.uid, 'notifications', notificationId);
      await updateDoc(notificationRef, { completed: true });
    } catch (error: any) {
      if (error.code !== 'permission-denied') {
        console.error('Error marking notification completed:', error);
      }
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const notificationRef = doc(firestore, 'users', user.uid, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error: any) {
      if (error.code !== 'permission-denied') {
        console.error('Error marking notification as read:', error);
      }
    }
  }

  // Test notification function for development
  async testNotification(type: 'water_intake' | 'baby_message' | 'doctor_appointment' = 'baby_message'): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in for test notification');
      return;
    }

    const testNotification: Omit<ReminderNotification, 'id' | 'completed'> = {
      type,
      title: type === 'water_intake' ? '💧 Water Reminder' : 
             type === 'baby_message' ? '👶 Message from Baby' : 
             '🏥 Appointment Reminder',
      body: type === 'water_intake' ? 'Time to stay hydrated! Drink a glass of water for you and your baby.' :
            type === 'baby_message' ? 'Hi Mommy! I love you so much and I\'m growing strong every day! 💕' :
            'You have an upcoming doctor appointment. Don\'t forget to prepare!',
      scheduledTime: new Date(),
      userId: user.uid,
      data: { test: true },
      sound: true
    };

    await this.sendNotification(testNotification);
    console.log('Test notification sent:', type);
  }
}

export const mobileNotificationService = MobileNotificationService.getInstance(); 