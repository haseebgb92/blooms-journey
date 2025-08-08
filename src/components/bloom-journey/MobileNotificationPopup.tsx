'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Heart, Utensils, Activity, AlertCircle, Clock, Droplets, Calendar, Pill, Check, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase/clientApp';
import { onAuthStateChanged, User } from 'firebase/auth';
import type { ReminderNotification } from '@/lib/mobileNotificationService';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'water_intake':
      return <Droplets className="w-5 h-5 text-blue-500" />;
    case 'doctor_appointment':
      return <Calendar className="w-5 h-5 text-green-500" />;
    case 'baby_message':
      return <Heart className="w-5 h-5 text-pink-500" />;
    case 'medication':
      return <Pill className="w-5 h-5 text-purple-500" />;
    case 'exercise':
      return <Activity className="w-5 h-5 text-orange-500" />;
    case 'baby_development_morning':
      return <Heart className="w-5 h-5 text-pink-500" />;
    case 'baby_development_night':
      return <Heart className="w-5 h-5 text-pink-500" />;
    default:
      return <Clock className="w-5 h-5 text-gray-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'water_intake':
      return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'doctor_appointment':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'baby_message':
      return 'bg-pink-50 border-pink-200 text-pink-800';
    case 'medication':
      return 'bg-purple-50 border-purple-200 text-purple-800';
    case 'exercise':
      return 'bg-orange-50 border-orange-200 text-orange-800';
    case 'baby_development_morning':
      return 'bg-pink-50 border-pink-200 text-pink-800';
    case 'baby_development_night':
      return 'bg-pink-50 border-pink-200 text-pink-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

const getNotificationTitle = (type: string) => {
  switch (type) {
    case 'water_intake':
      return '💧 Water Reminder';
    case 'doctor_appointment':
      return '🏥 Appointment Reminder';
    case 'baby_message':
      return '👶 Message from Baby';
    case 'medication':
      return '💊 Medication Reminder';
    case 'exercise':
      return '🏃‍♀️ Exercise Reminder';
    case 'baby_development_morning':
      return '🌅 Morning Update';
    case 'baby_development_night':
      return '🌙 Night Update';
    default:
      return '🔔 Notification';
  }
};

export function MobileNotificationPopup() {
  const [currentNotification, setCurrentNotification] = useState<ReminderNotification | null>(null);
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

    const handleMobileNotificationPopup = (event: CustomEvent) => {
      const notification = event.detail as ReminderNotification;
      setCurrentNotification(notification);
      setShowPopup(true);

      // Auto-hide after 8 seconds
      setTimeout(() => {
        if (isMounted) {
          setShowPopup(false);
          setCurrentNotification(null);
        }
      }, 8000);
    };

    let isMounted = true;
    window.addEventListener('mobileNotificationPopup', handleMobileNotificationPopup as EventListener);

    return () => {
      isMounted = false;
      window.removeEventListener('mobileNotificationPopup', handleMobileNotificationPopup as EventListener);
    };
  }, [user]);

  const handleDismiss = () => {
    setShowPopup(false);
    setCurrentNotification(null);
  };

  const handleMarkAsRead = async () => {
    if (!currentNotification) return;

    try {
      const { mobileNotificationService } = await import('@/lib/mobileNotificationService');
      await mobileNotificationService.markNotificationAsRead(currentNotification.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    
    handleDismiss();
  };

  if (!user || !showPopup || !currentNotification) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/30 pointer-events-none" />
      
      {/* Popup */}
      <div className="fixed top-4 left-4 right-4 z-50 pointer-events-none">
        <div className="pointer-events-auto animate-in slide-in-from-top-2 duration-300">
          <Card className="w-full bg-white shadow-2xl border-2 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs", getNotificationColor(currentNotification.type))}>
                    {getNotificationIcon(currentNotification.type)}
                    <span className="ml-1">{getNotificationTitle(currentNotification.type)}</span>
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">{currentNotification.title}</h3>
                <p className="text-sm text-gray-600">{currentNotification.body}</p>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500">
                    {new Date(currentNotification.scheduledTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDismiss}
                      className="h-7 px-2 text-xs"
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleMarkAsRead}
                      className="h-7 px-2 text-xs"
                    >
                      Mark Read
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
