'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bell, Droplets, Calendar, Baby, Pill, Activity, Sunrise, Moon, X, Plus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mobileNotificationService, ReminderSettings, BabyDevelopmentSettings } from '@/lib/mobileNotificationService';
import { auth } from '@/lib/firebase/clientApp';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { useIsMobile } from '@/hooks/use-mobile';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export function MobileNotificationSetup() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<ReminderSettings | null>(null);

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const router = useRouter();

  // Default settings - only used when no saved settings exist
  const defaultSettings: ReminderSettings = {
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
  };

  useEffect(() => {
    checkSupport();
    
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        loadSettings(user);
      } else {
        setIsLoadingSettings(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const loadSettings = async (currentUser: User) => {
    if (!currentUser) {
      setIsLoadingSettings(false);
      return;
    }

    try {
      setIsLoadingSettings(true);
      console.log('Loading settings for user:', currentUser.uid);
      
      const userDocRef = doc(firestore, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.reminderSettings) {
          console.log('Found saved settings:', data.reminderSettings);
          
          // Helper function to validate time format
          const validateTimeFormat = (time: string) => {
            if (!time || typeof time !== 'string') return false;
            const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
            const isValid = timeRegex.test(time);
            console.log(`Validating time "${time}": ${isValid}`);
            return isValid;
          };

          // Helper function to validate time array - preserve saved times if valid
          const validateTimeArray = (times: any[], defaultTimes: string[]): string[] => {
            console.log('Validating time array:', times, 'defaults:', defaultTimes);
            if (!Array.isArray(times)) {
              console.log('Not an array, returning defaults');
              return defaultTimes;
            }
            if (times.length > 0) {
              console.log('Found saved times:', times);
              const validTimes = times.filter(time => {
                const isValid = validateTimeFormat(time);
                console.log(`Time ${time} is valid: ${isValid}`);
                return isValid;
              });
              console.log('Valid times found:', validTimes);
              if (validTimes.length > 0) {
                console.log('Returning valid times:', validTimes);
                return validTimes;
              } else {
                console.log('No valid times found, returning defaults');
                return defaultTimes;
              }
            }
            console.log('No times found, returning defaults');
            return defaultTimes;
          };

          const savedSettings = data.reminderSettings;
          
          const mergedSettings: ReminderSettings = {
            waterIntake: {
              enabled: savedSettings.waterIntake?.enabled ?? defaultSettings.waterIntake.enabled,
              frequency: savedSettings.waterIntake?.frequency ?? defaultSettings.waterIntake.frequency,
              times: validateTimeArray(savedSettings.waterIntake?.times, defaultSettings.waterIntake.times)
            },
            doctorAppointments: {
              enabled: savedSettings.doctorAppointments?.enabled ?? defaultSettings.doctorAppointments.enabled,
              reminderHours: savedSettings.doctorAppointments?.reminderHours ?? defaultSettings.doctorAppointments.reminderHours
            },
            babyMessages: {
              enabled: savedSettings.babyMessages?.enabled ?? defaultSettings.babyMessages.enabled,
              frequency: savedSettings.babyMessages?.frequency ?? defaultSettings.babyMessages.frequency
            },
            babyDevelopment: {
              enabled: savedSettings.babyDevelopment?.enabled ?? defaultSettings.babyDevelopment.enabled,
              morningTime: validateTimeFormat(savedSettings.babyDevelopment?.morningTime) 
                ? savedSettings.babyDevelopment.morningTime 
                : defaultSettings.babyDevelopment.morningTime,
              nightTime: validateTimeFormat(savedSettings.babyDevelopment?.nightTime) 
                ? savedSettings.babyDevelopment.nightTime 
                : defaultSettings.babyDevelopment.nightTime,
              includeTips: savedSettings.babyDevelopment?.includeTips ?? defaultSettings.babyDevelopment.includeTips,
              includeMilestones: savedSettings.babyDevelopment?.includeMilestones ?? defaultSettings.babyDevelopment.includeMilestones,
              includeSize: savedSettings.babyDevelopment?.includeSize ?? defaultSettings.babyDevelopment.includeSize
            },
            medication: {
              enabled: savedSettings.medication?.enabled ?? defaultSettings.medication.enabled,
              times: validateTimeArray(savedSettings.medication?.times, defaultSettings.medication.times)
            },
            exercise: {
              enabled: savedSettings.exercise?.enabled ?? defaultSettings.exercise.enabled,
              times: validateTimeArray(savedSettings.exercise?.times, defaultSettings.exercise.times)
            }
          };
          
          setSettings(mergedSettings);
          console.log('Merged settings applied:', mergedSettings);
        } else {
          console.log('No saved settings found, using defaults');
          setSettings(defaultSettings);
        }
      } else {
        console.log('User document does not exist, using defaults');
        setSettings(defaultSettings);
      }
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        console.log('Permission denied for loading settings, using defaults');
        setSettings(defaultSettings);
      } else {
        console.error('Error loading settings:', error);
        setSettings(defaultSettings);
      }
    } finally {
      setIsLoadingSettings(false);
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
          title: "Notifications Enabled!",
          description: "You'll now receive reminders and updates about your pregnancy journey.",
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings to receive reminders.",
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
    if (!user || !settings) {
      toast({
        title: "Error",
        description: "Please sign in to save settings.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Saving settings:', settings);
      
      // Validate and format time values before saving
      const validatedSettings: ReminderSettings = {
        ...settings,
        waterIntake: {
          ...settings.waterIntake,
          times: settings.waterIntake.times.filter(time => {
            const isValid = time && time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);
            console.log(`Water intake time "${time}" is valid: ${isValid}`);
            return isValid;
          })
        },
        babyDevelopment: {
          ...settings.babyDevelopment,
          morningTime: settings.babyDevelopment.morningTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) 
            ? settings.babyDevelopment.morningTime 
            : defaultSettings.babyDevelopment.morningTime,
          nightTime: settings.babyDevelopment.nightTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) 
            ? settings.babyDevelopment.nightTime 
            : defaultSettings.babyDevelopment.nightTime
        },
        medication: {
          ...settings.medication,
          times: settings.medication.times.filter(time => {
            const isValid = time && time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);
            console.log(`Medication time "${time}" is valid: ${isValid}`);
            return isValid;
          })
        },
        exercise: {
          ...settings.exercise,
          times: settings.exercise.times.filter(time => {
            const isValid = time && time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);
            console.log(`Exercise time "${time}" is valid: ${isValid}`);
            return isValid;
          })
        }
      };

      console.log('Validated settings to save:', validatedSettings);

      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        reminderSettings: validatedSettings
      }, { merge: true });

      console.log('Settings saved successfully:', validatedSettings);
      toast({
        title: "Settings Saved!",
        description: "Your notification preferences have been updated.",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateSetting = (category: keyof ReminderSettings, field: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value
        }
      };
    });
  };

  const updateBabyDevelopmentSetting = (field: keyof BabyDevelopmentSettings, value: any) => {
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        babyDevelopment: {
          ...prev.babyDevelopment,
          [field]: value
        }
      };
    });
  };

  const addTimeSlot = (category: 'waterIntake' | 'medication' | 'exercise') => {
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [category]: {
          ...prev[category],
          times: [...prev[category].times, '12:00']
        }
      };
    });
  };

  const removeTimeSlot = (category: 'waterIntake' | 'medication' | 'exercise', index: number) => {
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [category]: {
          ...prev[category],
          times: prev[category].times.filter((_, i) => i !== index)
        }
      };
    });
  };

  const updateTimeSlot = (category: 'waterIntake' | 'medication' | 'exercise', index: number, value: string) => {
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [category]: {
          ...prev[category],
          times: prev[category].times.map((time, i) => i === index ? value : time)
        }
      };
    });
  };

  if (!isSupported) {
    return (
      <div className="space-y-4 sm:space-y-6 w-full">
        {/* Back Button Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mobile Notifications</h1>
            <p className="text-sm text-gray-600">Enable push notifications to receive reminders on your mobile device.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Notifications Not Supported
            </CardTitle>
            <CardDescription>
              Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Back Button Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mobile Notifications</h1>
          <p className="text-sm text-gray-600">Enable push notifications to receive reminders on your mobile device.</p>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoadingSettings && (
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Loading your notification settings...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Don't render the form if settings are still loading or null */}
      {!isLoadingSettings && settings && (
        <>
          {/* Permission Status */}
          <Card className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5 text-blue-500" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Enable push notifications to receive reminders and updates about your pregnancy journey.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-base">Notification Permission</p>
                  <p className="text-sm text-muted-foreground">
                    {permission === 'granted' ? '✅ Granted' : permission === 'denied' ? '❌ Denied' : '⏳ Not requested'}
                  </p>
                </div>
                {permission !== 'granted' && (
                  <Button 
                    onClick={initializeNotifications} 
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? 'Initializing...' : 'Enable Notifications'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Baby Development Notifications */}
          <Card className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Baby className="w-5 h-5 text-pink-500" />
                Baby Development Notifications
              </CardTitle>
              <CardDescription>
                Receive daily morning and night updates about your baby's development.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="baby-development-enabled" className="text-base font-medium">
                  Enable Baby Development Notifications
                </Label>
                <Switch
                  id="baby-development-enabled"
                  checked={settings?.babyDevelopment.enabled}
                  onCheckedChange={(checked) => updateBabyDevelopmentSetting('enabled', checked)}
                  disabled={isLoadingSettings}
                />
              </div>

              {settings?.babyDevelopment.enabled && (
                <div className="space-y-4 pl-4 border-l-2 border-pink-200 bg-pink-50/50 rounded-r-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="morning-time" className="flex items-center gap-2 text-sm font-medium">
                        <Sunrise className="w-4 h-4 text-orange-500" />
                        Morning Time
                      </Label>
                      <Input
                        id="morning-time"
                        type="time"
                        value={settings?.babyDevelopment.morningTime}
                        onChange={(e) => updateBabyDevelopmentSetting('morningTime', e.target.value)}
                        className="w-full"
                        disabled={isLoadingSettings}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="night-time" className="flex items-center gap-2 text-sm font-medium">
                        <Moon className="w-4 h-4 text-blue-500" />
                        Night Time
                      </Label>
                      <Input
                        id="night-time"
                        type="time"
                        value={settings?.babyDevelopment.nightTime}
                        onChange={(e) => updateBabyDevelopmentSetting('nightTime', e.target.value)}
                        className="w-full"
                        disabled={isLoadingSettings}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Include in notifications:</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="include-size"
                          checked={settings?.babyDevelopment.includeSize}
                          onCheckedChange={(checked) => updateBabyDevelopmentSetting('includeSize', checked)}
                        />
                        <Label htmlFor="include-size" className="text-sm">Baby size and fruit comparison</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="include-milestones"
                          checked={settings?.babyDevelopment.includeMilestones}
                          onCheckedChange={(checked) => updateBabyDevelopmentSetting('includeMilestones', checked)}
                        />
                        <Label htmlFor="include-milestones" className="text-sm">Key development milestones</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="include-tips"
                          checked={settings?.babyDevelopment.includeTips}
                          onCheckedChange={(checked) => updateBabyDevelopmentSetting('includeTips', checked)}
                        />
                        <Label htmlFor="include-tips" className="text-sm">Helpful tips and advice</Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Water Intake Reminders */}
          <Card className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Droplets className="w-5 h-5 text-blue-500" />
                Water Intake Reminders
              </CardTitle>
              <CardDescription>
                Get reminded to stay hydrated throughout the day.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="water-enabled" className="text-base font-medium">
                  Enable Water Intake Reminders
                </Label>
                <Switch
                  id="water-enabled"
                  checked={settings?.waterIntake.enabled}
                  onCheckedChange={(checked) => updateSetting('waterIntake', 'enabled', checked)}
                  disabled={isLoadingSettings}
                />
              </div>

              {settings?.waterIntake.enabled && (
                <div className="space-y-4 pl-4 border-l-2 border-blue-200 bg-blue-50/50 rounded-r-lg p-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Reminder Times</Label>
                    <div className="space-y-3">
                    {settings?.waterIntake.times.map((time, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => updateTimeSlot('waterIntake', index, e.target.value)}
                          className="flex-1"
                          disabled={isLoadingSettings}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTimeSlot('waterIntake', index)}
                          className="shrink-0"
                          disabled={isLoadingSettings}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeSlot('waterIntake')}
                      className="w-full sm:w-auto"
                      disabled={isLoadingSettings}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Time
                    </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Doctor Appointment Reminders */}
          <Card className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-green-500" />
                Doctor Appointment Reminders
              </CardTitle>
              <CardDescription>
                Get reminded about upcoming doctor appointments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="appointments-enabled" className="text-base font-medium">
                  Enable Appointment Reminders
                </Label>
                <Switch
                  id="appointments-enabled"
                  checked={settings?.doctorAppointments.enabled}
                  onCheckedChange={(checked) => updateSetting('doctorAppointments', 'enabled', checked)}
                />
              </div>

              {settings?.doctorAppointments.enabled && (
                <div className="space-y-4 pl-4 border-l-2 border-green-200 bg-green-50/50 rounded-r-lg p-4">
                  <div className="space-y-2">
                    <Label htmlFor="reminder-hours" className="text-sm font-medium">
                      Reminder Hours Before Appointment
                    </Label>
                    <Input
                      id="reminder-hours"
                      type="number"
                      min="1"
                      max="72"
                      value={settings?.doctorAppointments.reminderHours}
                      onChange={(e) => updateSetting('doctorAppointments', 'reminderHours', parseInt(e.target.value))}
                      className="w-full sm:w-32"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Baby Messages */}
          <Card className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Baby className="w-5 h-5 text-pink-500" />
                Baby Messages
              </CardTitle>
              <CardDescription>
                Receive periodic messages from your baby about their development.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="baby-messages-enabled" className="text-base font-medium">
                  Enable Baby Messages
                </Label>
                <Switch
                  id="baby-messages-enabled"
                  checked={settings?.babyMessages.enabled}
                  onCheckedChange={(checked) => updateSetting('babyMessages', 'enabled', checked)}
                />
              </div>

              {settings?.babyMessages.enabled && (
                <div className="space-y-4 pl-4 border-l-2 border-pink-200 bg-pink-50/50 rounded-r-lg p-4">
                  <div className="space-y-2">
                    <Label htmlFor="baby-message-frequency" className="text-sm font-medium">
                      Message Frequency (hours)
                    </Label>
                    <Input
                      id="baby-message-frequency"
                      type="number"
                      min="1"
                      max="24"
                      value={settings?.babyMessages.frequency}
                      onChange={(e) => updateSetting('babyMessages', 'frequency', parseInt(e.target.value))}
                      className="w-full sm:w-32"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={saveSettings} 
              className="w-full sm:w-auto px-8 py-3 text-base font-medium"
              disabled={isLoadingSettings}
            >
              {isLoadingSettings ? 'Loading...' : 'Save Settings'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
} 