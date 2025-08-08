'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Baby, Calendar } from 'lucide-react';
import { mobileNotificationService } from '@/lib/mobileNotificationService';

export function NotificationTest() {
  const [isTesting, setIsTesting] = useState(false);

  const testNotification = async (type: 'water_intake' | 'baby_message' | 'doctor_appointment') => {
    setIsTesting(true);
    try {
      await mobileNotificationService.testNotification(type);
    } catch (error) {
      console.error('Error testing notification:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Test Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <Button
            onClick={() => testNotification('water_intake')}
            disabled={isTesting}
            className="flex items-center gap-2"
          >
            <Droplets className="w-4 h-4" />
            Test Water Reminder
          </Button>
          
          <Button
            onClick={() => testNotification('baby_message')}
            disabled={isTesting}
            className="flex items-center gap-2"
          >
            <Baby className="w-4 h-4" />
            Test Baby Message
          </Button>
          
          <Button
            onClick={() => testNotification('doctor_appointment')}
            disabled={isTesting}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Test Appointment Reminder
          </Button>
        </div>
        
        {isTesting && (
          <div className="text-center text-sm text-muted-foreground">
            Sending test notification...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
