'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Droplets, Calendar, Baby, Pill, Activity, Check, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mobileNotificationService } from '@/lib/mobileNotificationService';
import { auth } from '@/lib/firebase/clientApp';
import { format, isToday, isTomorrow } from 'date-fns';

interface Reminder {
  id: string;
  type: 'water_intake' | 'doctor_appointment' | 'baby_message' | 'medication' | 'exercise';
  title: string;
  body: string;
  scheduledTime: Date;
  completed: boolean;
  userId: string;
  data?: any;
}

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

export function RemindersList() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const userReminders = await mobileNotificationService.getReminders();
      setReminders(userReminders);
    } catch (error: any) {
      console.error('Error loading reminders:', error);
      // Don't show error toast for permission issues as they're handled gracefully
      if (error.code !== 'permission-denied') {
        toast({
          title: "Error",
          description: "Failed to load reminders.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const markAsCompleted = async (reminderId: string) => {
    try {
      await mobileNotificationService.markReminderCompleted(reminderId);
      setReminders(prev => prev.filter(r => r.id !== reminderId));
      toast({
        title: "Reminder Completed!",
        description: "Great job staying on track!",
      });
    } catch (error) {
      console.error('Error marking reminder as completed:', error);
      toast({
        title: "Error",
        description: "Failed to mark reminder as completed.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (date: Date) => {
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy h:mm a');
    }
  };

  const getReminderStatus = (reminder: Reminder) => {
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }

  if (reminders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-500" />
            No Active Reminders
          </CardTitle>
          <CardDescription>
            You don't have any active reminders at the moment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Reminders will appear here when you have scheduled water intake, doctor appointments, or other notifications.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Active Reminders</h2>
        <Badge variant="secondary">{reminders.length} reminders</Badge>
      </div>

      <div className="space-y-3">
        {reminders.map((reminder) => {
          const status = getReminderStatus(reminder);
          return (
            <Card key={reminder.id} className={`${getReminderColor(reminder.type)}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getReminderIcon(reminder.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{reminder.title}</h3>
                        <Badge className={status.color}>
                          {status.text}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {reminder.body}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatTime(reminder.scheduledTime)}
                      </div>
                    </div>
                  </div>
                  {!reminder.completed && (
                    <Button
                      size="sm"
                      onClick={() => markAsCompleted(reminder.id)}
                      className="ml-4"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 