'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Baby, Heart, Utensils, Activity, AlertCircle, X, MessageCircle } from 'lucide-react';
import { notificationService, BabyNotification } from '@/lib/notificationService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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

export function BabyNotification() {
  const [notifications, setNotifications] = useState<BabyNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<BabyNotification | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const unreadNotifications = await notificationService.getUnreadNotifications();
        setNotifications(unreadNotifications);
        
        // Show the most recent notification if there are any
        if (unreadNotifications.length > 0) {
          setCurrentNotification(unreadNotifications[0]);
          setShowNotification(true);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();

    // Listen for new notifications
    const handleNewNotification = (event: CustomEvent) => {
      const notification = event.detail as BabyNotification;
      setCurrentNotification(notification);
      setShowNotification(true);
      setNotifications(prev => [notification, ...prev]);
      
      toast({
        title: "Message from Baby! 💕",
        description: "Your little one has something to say...",
      });
    };

    window.addEventListener('babyNotification', handleNewNotification as EventListener);

    // Start notification check
    notificationService.startNotificationCheck();

    // For testing: Check if we should show a notification immediately
    const checkInitialNotification = async () => {
      const shouldShow = await notificationService.shouldShowNotification();
      if (shouldShow) {
        const notification = await notificationService.generateAndStoreNotification();
        if (notification) {
          setCurrentNotification(notification);
          setShowNotification(true);
          setNotifications(prev => [notification, ...prev]);
        }
      }
    };

    checkInitialNotification();

    return () => {
      window.removeEventListener('babyNotification', handleNewNotification as EventListener);
      notificationService.stopNotificationCheck();
    };
  }, [toast]);

  const handleDismiss = async () => {
    if (currentNotification) {
      await notificationService.markNotificationAsRead(currentNotification.id);
      setNotifications(prev => prev.filter(n => n.id !== currentNotification.id));
      setShowNotification(false);
      setCurrentNotification(null);
    }
  };

  const handleViewAll = () => {
    // This could navigate to a notifications page or show a modal
    toast({
      title: "Notifications",
      description: `You have ${notifications.length} unread messages from your baby!`,
    });
  };

  if (isLoading) {
    return null;
  }

  if (!showNotification || !currentNotification) {
    return null;
  }

  const IconComponent = categoryIcons[currentNotification.category];
  const categoryColor = categoryColors[currentNotification.category];

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300">
      <Card className="w-80 shadow-lg border-primary/20 bg-gradient-to-br from-pink-50 to-purple-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Baby className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold text-primary">
                Message from Baby
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 hover:bg-primary/10"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", categoryColor)}>
              <IconComponent className="h-3 w-3 mr-1" />
              {currentNotification.category.charAt(0).toUpperCase() + currentNotification.category.slice(1)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Week {currentNotification.week}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/5 rounded-full">
              <Heart className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm leading-relaxed font-serif text-gray-700">
                "{currentNotification.message}"
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">
                  {new Date(currentNotification.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                {notifications.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewAll}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    View all ({notifications.length})
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
