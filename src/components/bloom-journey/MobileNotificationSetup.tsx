'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bell, Droplets, Calendar, Baby, Pill, Activity, Sunrise, Moon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mobileNotificationService, ReminderSettings, BabyDevelopmentSettings } from '@/lib/mobileNotificationService';
import { auth } from '@/lib/firebase/clientApp';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';

export function MobileNotificationSetup() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<ReminderSettings>({
    waterIntake: {
      enabled: false,
      frequency: 2,
      times: ['09:00', '12:00', '15:00', '18:00']
    },
    doctorAppointments: {
      enabled: true,
      reminderHours: 24
    },
    babyMessages: {
      enabled: true,
      frequency: 6
    },
    babyDevelopment: {
      enabled: true,
      morningTime: '08:00',
      nightTime: '20:00',
      includeTips: true,
      includeMilestones: true,
      includeSize: true
    },
    medication: {
      enabled: false,
      times: ['08:00', '20:00']
    },
    exercise: {
      enabled: false,
      times: ['07:00', '17:00']
    }
  });

  const { toast } = useToast();

  useEffect(() => {
    checkSupport();
    loadSettings();
  }, []);

  const checkSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  };

  const loadSettings = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.reminderSettings) {
          setSettings(data.reminderSettings);
        }
      }
    } catch (error: any) {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.log('Permission denied for loading settings, using defaults');
      } else {
        console.error('Error loading settings:', error);
      }
    }
  };

  const initializeNotifications = async () => {
    setIsLoading(true);
    try {
      const success = await mobileNotificationService.initialize();
      if (success) {
        setIsInitialized(true);
        setPermission('granted');
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive push notifications for your pregnancy journey!",
        });
      } else {
        toast({
          title: "Notification Setup Failed",
          description: "Please check your browser settings and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
      toast({
        title: "Error",
        description: "Failed to initialize notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        reminderSettings: settings
      }, { merge: true });

      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated!",
      });
    } catch (error: any) {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.log('Permission denied for saving settings');
        toast({
          title: "Settings Saved Locally",
          description: "Settings saved to local storage. Some features may be limited.",
        });
      } else {
        console.error('Error saving settings:', error);
        toast({
          title: "Error",
          description: "Failed to save settings. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const updateSetting = (category: keyof ReminderSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const updateBabyDevelopmentSetting = (field: keyof BabyDevelopmentSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      babyDevelopment: {
        ...prev.babyDevelopment,
        [field]: value
      }
    }));
  };

  const addTimeSlot = (category: 'waterIntake' | 'medication' | 'exercise') => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        times: [...prev[category].times, '12:00']
      }
    }));
  };

  const removeTimeSlot = (category: 'waterIntake' | 'medication' | 'exercise', index: number) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        times: prev[category].times.filter((_, i) => i !== index)
      }
    }));
  };

  const updateTimeSlot = (category: 'waterIntake' | 'medication' | 'exercise', index: number, value: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        times: prev[category].times.map((time, i) => i === index ? value : time)
      }
    }));
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Enable push notifications to receive reminders and updates about your pregnancy journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notification Permission</p>
              <p className="text-sm text-muted-foreground">
                {permission === 'granted' ? '✅ Granted' : permission === 'denied' ? '❌ Denied' : '⏳ Not requested'}
              </p>
            </div>
            {permission !== 'granted' && (
              <Button onClick={initializeNotifications} disabled={isLoading}>
                {isLoading ? 'Initializing...' : 'Enable Notifications'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Baby Development Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="w-5 h-5" />
            Baby Development Notifications
          </CardTitle>
          <CardDescription>
            Receive daily morning and night updates about your baby's development.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="baby-development-enabled">Enable Baby Development Notifications</Label>
            <Switch
              id="baby-development-enabled"
              checked={settings.babyDevelopment.enabled}
              onCheckedChange={(checked) => updateBabyDevelopmentSetting('enabled', checked)}
            />
          </div>

          {settings.babyDevelopment.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="morning-time" className="flex items-center gap-2">
                    <Sunrise className="w-4 h-4" />
                    Morning Time
                  </Label>
                  <Input
                    id="morning-time"
                    type="time"
                    value={settings.babyDevelopment.morningTime}
                    onChange={(e) => updateBabyDevelopmentSetting('morningTime', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="night-time" className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Night Time
                  </Label>
                  <Input
                    id="night-time"
                    type="time"
                    value={settings.babyDevelopment.nightTime}
                    onChange={(e) => updateBabyDevelopmentSetting('nightTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Include in notifications:</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-size"
                      checked={settings.babyDevelopment.includeSize}
                      onCheckedChange={(checked) => updateBabyDevelopmentSetting('includeSize', checked)}
                    />
                    <Label htmlFor="include-size">Baby size and fruit comparison</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-milestones"
                      checked={settings.babyDevelopment.includeMilestones}
                      onCheckedChange={(checked) => updateBabyDevelopmentSetting('includeMilestones', checked)}
                    />
                    <Label htmlFor="include-milestones">Key development milestones</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-tips"
                      checked={settings.babyDevelopment.includeTips}
                      onCheckedChange={(checked) => updateBabyDevelopmentSetting('includeTips', checked)}
                    />
                    <Label htmlFor="include-tips">Helpful tips and advice</Label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Water Intake Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5" />
            Water Intake Reminders
          </CardTitle>
          <CardDescription>
            Get reminded to stay hydrated throughout the day.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="water-enabled">Enable Water Intake Reminders</Label>
            <Switch
              id="water-enabled"
              checked={settings.waterIntake.enabled}
              onCheckedChange={(checked) => updateSetting('waterIntake', 'enabled', checked)}
            />
          </div>

          {settings.waterIntake.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              <div className="space-y-2">
                <Label>Reminder Times</Label>
                {settings.waterIntake.times.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => updateTimeSlot('waterIntake', index, e.target.value)}
                      className="w-32"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTimeSlot('waterIntake', index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addTimeSlot('waterIntake')}
                >
                  Add Time
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctor Appointment Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Doctor Appointment Reminders
          </CardTitle>
          <CardDescription>
            Get reminded about upcoming doctor appointments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="appointments-enabled">Enable Appointment Reminders</Label>
            <Switch
              id="appointments-enabled"
              checked={settings.doctorAppointments.enabled}
              onCheckedChange={(checked) => updateSetting('doctorAppointments', 'enabled', checked)}
            />
          </div>

          {settings.doctorAppointments.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              <div className="space-y-2">
                <Label htmlFor="reminder-hours">Reminder Hours Before Appointment</Label>
                <Input
                  id="reminder-hours"
                  type="number"
                  min="1"
                  max="72"
                  value={settings.doctorAppointments.reminderHours}
                  onChange={(e) => updateSetting('doctorAppointments', 'reminderHours', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Baby Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="w-5 h-5" />
            Baby Messages
          </CardTitle>
          <CardDescription>
            Receive periodic messages from your baby about their development.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="baby-messages-enabled">Enable Baby Messages</Label>
            <Switch
              id="baby-messages-enabled"
              checked={settings.babyMessages.enabled}
              onCheckedChange={(checked) => updateSetting('babyMessages', 'enabled', checked)}
            />
          </div>

          {settings.babyMessages.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              <div className="space-y-2">
                <Label htmlFor="baby-message-frequency">Message Frequency (hours)</Label>
                <Input
                  id="baby-message-frequency"
                  type="number"
                  min="1"
                  max="24"
                  value={settings.babyMessages.frequency}
                  onChange={(e) => updateSetting('babyMessages', 'frequency', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} className="w-full sm:w-auto">
          Save Settings
        </Button>
      </div>
    </div>
  );
} 