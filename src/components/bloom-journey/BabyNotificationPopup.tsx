'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Heart, Utensils, Activity, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase/clientApp';
import { onAuthStateChanged, User } from 'firebase/auth';
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

export function BabyNotificationPopup() {
  const [currentNotification, setCurrentNotification] = useState<BabyNotification | null>(null);
  const [showPopup, setShowPopup] = useState(false);
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
    if (!user) return;

    const handleNewNotification = (event: CustomEvent) => {
      const notification = event.detail as BabyNotification;
      setCurrentNotification(notification);
      setShowPopup(true);
    };

    window.addEventListener('babyNotification', handleNewNotification as EventListener);

    return () => {
      window.removeEventListener('babyNotification', handleNewNotification as EventListener);
    };
  }, [user]);

  const handleDismiss = () => {
    setShowPopup(false);
    setCurrentNotification(null);
  };

  const handleMarkAsRead = async () => {
    if (!currentNotification) return;

    try {
      const { notificationService } = await import('@/lib/notificationService');
      await notificationService.markNotificationAsRead(currentNotification.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    
    handleDismiss();
  };

  if (!user || !showPopup || !currentNotification) {
    return null;
  }

  const IconComponent = categoryIcons[currentNotification.category];
  const categoryColor = categoryColors[currentNotification.category];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 pointer-events-none" />
      
      {/* Notification Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto animate-in zoom-in duration-300 w-full max-w-md">
          <Card className="w-full bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-full">
                    <Heart className="h-5 w-5 text-pink-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-sm", categoryColor)}>
                      <IconComponent className="h-4 w-4 mr-1" />
                      {currentNotification.category.charAt(0).toUpperCase() + currentNotification.category.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Week {currentNotification.week}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-8 w-8 p-0 hover:bg-pink-100 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-lg leading-relaxed font-serif text-gray-700 text-center">
                      "{currentNotification.message}"
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-pink-200">
                  <span className="text-sm text-muted-foreground">
                    {new Date(currentNotification.timestamp).toLocaleDateString([], { 
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} • Message from your baby
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAsRead}
                    className="text-pink-600 border-pink-300 hover:bg-pink-50 hover:text-pink-700"
                  >
                    Mark as read
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
