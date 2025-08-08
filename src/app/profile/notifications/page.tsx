
'use client';

import { MobileNotificationSetup } from '@/components/bloom-journey/MobileNotificationSetup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Smartphone, Settings } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Notification Settings</h1>
          <p className="text-gray-600">
            Manage your mobile notifications and reminders
          </p>
        </div>

        <div className="grid gap-6">
          {/* Mobile Notifications Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-500" />
                Mobile Notifications
              </CardTitle>
              <CardDescription>
                Enable push notifications to receive reminders on your mobile device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MobileNotificationSetup />
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-500" />
                Notification Types
              </CardTitle>
              <CardDescription>
                Choose what types of notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">💧 Water Intake Reminders</h3>
                    <p className="text-sm text-gray-600">
                      Get reminded to drink water throughout the day
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">🏥 Doctor Appointment Reminders</h3>
                    <p className="text-sm text-gray-600">
                      Never miss important doctor appointments
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">👶 Baby Messages</h3>
                    <p className="text-sm text-gray-600">
                      Receive personalized messages from your baby
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">💊 Medication Reminders</h3>
                    <p className="text-sm text-gray-600">
                      Get reminded to take your medications
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">🏃‍♀️ Exercise Reminders</h3>
                    <p className="text-sm text-gray-600">
                      Stay active with pregnancy-safe exercise reminders
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-500" />
                Tips for Better Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  Make sure to allow notifications in your browser settings for the best experience
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  Notifications are sent at optimal times based on your activity patterns
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  You can customize reminder times and frequencies in the settings above
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  All notifications are stored locally and respect your privacy
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
