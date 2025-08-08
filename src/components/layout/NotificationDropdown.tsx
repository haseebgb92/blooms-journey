'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Baby, X, Heart, Utensils, Activity, AlertCircle, Clock, Droplets, Calendar, Pill, Check, ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/firebase/clientApp';
import { onAuthStateChanged, User } from 'firebase/auth';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow } from 'date-fns';

// Import types and service
import type { BabyNotification } from '@/lib/notificationService';
import type { ReminderNotification } from '@/lib/mobileNotificationService';

const categoryIcons = {
  nutrition: Utensils,
  exercise: Activity,
  symptoms: AlertCircle,
};

const categoryColors = {
  nutrition: 'bg-orange-100 text-orange-800 border-orange-200',
  exercise: 'bg-green-100 text-green-800 border-green-200',
  symptoms: 'bg-blue-100 text-blue-800 border-blue-200',
};

const getReminderIcon = (type: string) => {
  switch (type) {
    case 'water_intake':
      return <Droplets className="w-4 h-4 text-blue-500" />;
    case 'doctor_appointment':
      return <Calendar className="w-4 h-4 text-green-500" />;
    case 'baby_message':
      return <Baby className="w-4 h-4 text-pink-500" />;
    case 'medication':
      return <Pill className="w-4 h-4 text-purple-500" />;
    case 'exercise':
      return <Activity className="w-4 h-4 text-orange-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

const getReminderColor = (type: string) => {
  switch (type) {
    case 'water_intake':
      return 'bg-blue-50 border-blue-200';
    case 'doctor_appointment':
      return 'bg-green-50 border-green-200';
    case 'baby_message':
      return 'bg-pink-50 border-pink-200';
    case 'medication':
      return 'bg-purple-50 border-purple-200';
    case 'exercise':
      return 'bg-orange-50 border-orange-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<BabyNotification[]>([]);
  const [reminders, setReminders] = useState<ReminderNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isMounted) {
        setUser(user);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadNotifications = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { notificationService } = await import('@/lib/notificationService');
        const { mobileNotificationService } = await import('@/lib/mobileNotificationService');
        
        const [unreadNotifications, userReminders, userNotifications] = await Promise.all([
          notificationService.getUnreadNotifications(),
          mobileNotificationService.getReminders(),
          mobileNotificationService.getNotifications()
        ]);
        
        if (isMounted) {
          setNotifications(unreadNotifications);
          setReminders([...userReminders, ...userNotifications]);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const handleNewNotification = (event: CustomEvent) => {
      if (isMounted) {
        const notification = event.detail as BabyNotification;
        setNotifications(prev => [notification, ...prev]);
      }
    };

    loadNotifications();
    window.addEventListener('babyNotification', handleNewNotification as EventListener);
    
    // Update user activity when component mounts
    const updateActivity = async () => {
      try {
        const { notificationService } = await import('@/lib/notificationService');
        await notificationService.updateUserActivity();
      } catch (error) {
        console.error('Error updating user activity:', error);
      }
    };
    updateActivity();

    return () => {
      isMounted = false;
      window.removeEventListener('babyNotification', handleNewNotification as EventListener);
    };
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { notificationService } = await import('@/lib/notificationService');
      await notificationService.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkReminderCompleted = async (reminderId: string) => {
    try {
      const { mobileNotificationService } = await import('@/lib/mobileNotificationService');
      await mobileNotificationService.markReminderCompleted(reminderId);
      setReminders(prev => prev.filter(r => r.id !== reminderId));
    } catch (error) {
      console.error('Error marking reminder as completed:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { notificationService } = await import('@/lib/notificationService');
      // Since there's no markAllAsRead method, we'll mark each one individually
      for (const notification of notifications) {
        await notificationService.markNotificationAsRead(notification.id);
      }
      setNotifications([]);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatTime = (date: Date) => {
    if (isToday(date)) {
      return `Today at ${format(date, 'HH:mm')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, yyyy HH:mm');
    }
  };

  const getReminderStatus = (reminder: ReminderNotification) => {
    const now = new Date();
    const scheduledTime = new Date(reminder.scheduledTime);
    
    if (reminder.completed) {
      return { status: 'completed', text: 'Completed', color: 'bg-green-100 text-green-800' };
    } else if (scheduledTime > now) {
      return { status: 'upcoming', text: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    } else {
      return { status: 'overdue', text: 'Overdue', color: 'bg-red-100 text-red-800' };
    }
  };

  const totalNotifications = notifications.length + reminders.length;

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary hover:bg-accent">
          <Bell className="h-5 w-5" />
          {totalNotifications > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {totalNotifications > 9 ? '9+' : totalNotifications}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0 hover:bg-primary/10"
            >
              <ArrowLeft className="h-3 w-3" />
            </Button>
            <Bell className="h-4 w-4 text-primary" />
            <span className="font-semibold">Notifications & Reminders</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-xs text-muted-foreground hover:text-primary"
          >
            Close
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : totalNotifications === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p>No notifications or reminders</p>
            <p className="text-xs">Check back later for updates!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Baby Notifications */}
            {notifications.length > 0 && (
              <>
                <div className="px-4 py-2 bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Baby className="h-4 w-4 text-pink-500" />
                    <span className="text-sm font-medium text-muted-foreground">Messages from Baby</span>
                  </div>
                </div>
                
                {notifications.map((notification) => {
                  const IconComponent = categoryIcons[notification.category];
                  const categoryColor = categoryColors[notification.category];

                  return (
                    <DropdownMenuItem key={`baby-${notification.id}`} className="flex flex-col items-start p-4 gap-3 border-b last:border-b-0">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-xs", categoryColor)}>
                            <IconComponent className="h-3 w-3 mr-1" />
                            {notification.category.charAt(0).toUpperCase() + notification.category.slice(1)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Week {notification.week}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="h-6 w-6 p-0 hover:bg-primary/10"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-start gap-3 w-full">
                        <div className="p-2 bg-pink-100 rounded-full flex-shrink-0">
                          <Heart className="h-4 w-4 text-pink-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-relaxed font-serif text-gray-700 mb-2">
                            "{notification.message}"
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.timestamp).toLocaleDateString([], { 
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            <span className="text-xs text-pink-600 font-medium">
                              Message from your baby
                            </span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </>
            )}

            {/* Reminders */}
            {reminders.length > 0 && (
              <>
                <div className="px-4 py-2 bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-muted-foreground">Active Reminders</span>
                  </div>
                </div>
                {reminders.map((reminder) => {
                  const status = getReminderStatus(reminder);
                  return (
                    <DropdownMenuItem key={`reminder-${reminder.id}`} className="flex flex-col items-start p-4 gap-3 border-b last:border-b-0">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-xs", status.color)}>
                            {status.text}
                          </Badge>
                        </div>
                        {!reminder.completed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkReminderCompleted(reminder.id);
                            }}
                            className="h-6 w-6 p-0 hover:bg-primary/10"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-start gap-3 w-full">
                        <div className="p-2 bg-gray-100 rounded-full flex-shrink-0">
                          {getReminderIcon(reminder.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-1">{reminder.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {reminder.body}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatTime(reminder.scheduledTime)}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </>
            )}
          </div>
        )}
        
        {totalNotifications > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <span className="block text-center text-xs text-muted-foreground p-2">
                {notifications.length > 0 && reminders.length > 0 
                  ? "Baby messages and reminders appear based on your activity and schedule"
                  : notifications.length > 0 
                  ? "Baby messages appear every 24 hours during your peak activity times"
                  : "Reminders are based on your scheduled activities and appointments"
                }
              </span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}