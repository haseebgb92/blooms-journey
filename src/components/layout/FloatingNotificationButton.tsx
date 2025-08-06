'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Baby, X, Heart, Utensils, Activity, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/firebase/clientApp';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
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

export function FloatingNotificationButton() {
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<BabyNotification[]>([]);
  const isMobile = useIsMobile();

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
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const { notificationService } = await import('@/lib/notificationService');
        const unreadNotifications = await notificationService.getUnreadNotifications();
        setUnreadCount(unreadNotifications.length);
        setNotifications(unreadNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    const handleNewNotification = (event: CustomEvent) => {
      setUnreadCount(prev => prev + 1);
    };

    loadNotifications();
    window.addEventListener('babyNotification', handleNewNotification as EventListener);

    return () => {
      window.removeEventListener('babyNotification', handleNewNotification as EventListener);
    };
  }, [user]);

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Only show on mobile devices
  if (!isMobile || !user) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button
        onClick={handleToggleDropdown}
        className="h-14 w-14 rounded-full bg-primary shadow-lg hover:bg-primary/90 transition-all duration-200"
        size="icon"
      >
        <Bell className="h-6 w-6 text-white" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>
      
      {showDropdown && (
        <div className="absolute bottom-16 right-0 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl border z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Baby className="h-4 w-4 text-primary" />
                <span className="font-semibold">Messages from Baby</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDropdown(false)}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  <Baby className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No messages from baby yet</p>
                  <p className="text-xs">Check back in 24 hours for a new message!</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const IconComponent = categoryIcons[notification.category as keyof typeof categoryIcons];
                  const categoryColor = categoryColors[notification.category as keyof typeof categoryColors];

                  return (
                    <div key={notification.id} className="p-4 border rounded-lg bg-gray-50 mb-3">
                      <div className="flex items-center justify-between mb-3">
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
                          onClick={async () => {
                            try {
                              const { notificationService } = await import('@/lib/notificationService');
                              await notificationService.markNotificationAsRead(notification.id);
                              setNotifications(prev => prev.filter(n => n.id !== notification.id));
                              setUnreadCount(prev => Math.max(0, prev - 1));
                            } catch (error) {
                              console.error('Error marking notification as read:', error);
                            }
                          }}
                          className="h-6 w-6 p-0 hover:bg-primary/10"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-start gap-3">
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
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
