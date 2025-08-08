
'use client';

import { MobileNotificationSetup } from '@/components/bloom-journey/MobileNotificationSetup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Smartphone, Settings, Droplets, Calendar, Baby, Pill, Activity, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
      <div className="space-y-6">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Notification Settings</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Manage your mobile notifications and reminders
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Mobile Notifications Setup */}
          <Card className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Smartphone className="w-5 h-5 text-blue-500" />
                Mobile Notifications
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Enable push notifications to receive reminders on your mobile device
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <MobileNotificationSetup />
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Bell className="w-5 h-5 text-green-500" />
                Notification Types
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Choose what types of notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Droplets className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">Water Intake Reminders</h3>
                      <p className="text-sm text-gray-600">
                        Get reminded to drink water throughout the day
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">Doctor Appointment Reminders</h3>
                      <p className="text-sm text-gray-600">
                        Never miss important doctor appointments
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 rounded-full">
                      <Baby className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">Baby Messages</h3>
                      <p className="text-sm text-gray-600">
                        Receive personalized messages from your baby
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Pill className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">Medication Reminders</h3>
                      <p className="text-sm text-gray-600">
                        Get reminded to take your medications
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <Activity className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">Exercise Reminders</h3>
                      <p className="text-sm text-gray-600">
                        Stay active with pregnancy-safe exercises
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Tips */}
          <Card className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Settings className="w-5 h-5 text-gray-500" />
                Notification Tips
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Get the most out of your notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">📱 Mobile Optimization</h4>
                  <p className="text-sm text-blue-700">
                    Enable push notifications on your mobile device for instant reminders and updates.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">⏰ Timing Matters</h4>
                  <p className="text-sm text-green-700">
                    Set reminder times that work best with your daily routine and schedule.
                  </p>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg">
                  <h4 className="font-semibold text-pink-900 mb-2">👶 Baby Development</h4>
                  <p className="text-sm text-pink-700">
                    Receive personalized messages from your baby about their development milestones.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">🏥 Health Tracking</h4>
                  <p className="text-sm text-purple-700">
                    Never miss important appointments or medication reminders.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
