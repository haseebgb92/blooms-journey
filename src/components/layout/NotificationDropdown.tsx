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
import { Bell, Baby, X, Heart, Utensils, Activity, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/firebase/clientApp';
import { onAuthStateChanged, User } from 'firebase/auth';
import { cn } from '@/lib/utils';

// Import types and service
import type { BabyNotification } from '@/lib/notificationService';

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

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<BabyNotification[]>([]);
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
        const unreadNotifications = await notificationService.getUnreadNotifications();
        if (isMounted) {
          setNotifications(unreadNotifications);
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
        
        // Removed toast as per edit hint
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
  }, [user]); // Removed toast from dependency array

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { notificationService } = await import('@/lib/notificationService');
      await notificationService.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Removed setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { notificationService } = await import('@/lib/notificationService');
      await Promise.all(notifications.map(n => notificationService.markNotificationAsRead(n.id)));
      setNotifications([]);
      // Removed setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.length;

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary hover:bg-accent">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Baby className="h-4 w-4 text-primary" />
            <span className="font-semibold">Messages from Baby</span>
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
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <Baby className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p>No messages from baby yet</p>
            <p className="text-xs">Check back in 24 hours for a new message!</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const IconComponent = categoryIcons[notification.category];
            const categoryColor = categoryColors[notification.category];

            return (
              <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4 gap-3 border-b last:border-b-0">
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
          })
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <span className="block text-center text-xs text-muted-foreground p-2">
                Baby messages appear every 24 hours during your peak activity times
              </span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
