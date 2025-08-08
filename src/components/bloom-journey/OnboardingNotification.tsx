'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Clock } from 'lucide-react';

interface OnboardingNotificationProps {
  onAllow: () => void;
  onDismiss: () => void;
}

export default function OnboardingNotification({ onAllow, onDismiss }: OnboardingNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show notification after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-sm shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        <CardContent className="p-6 space-y-4">
          {/* Notification Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm">HiMommy</span>
            </div>
            <span className="text-xs text-gray-500">Now</span>
          </div>

          {/* Notification Content */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg">Day 4 of pregnancy</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Mommy, please go to a gynecologist. I know you want me to be healthy, so don't forget about the recommended tests. They are all painless, and we'll both be fine :)
            </p>
          </div>

          {/* Time Display */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">09:00</div>
          </div>

          {/* Push Notification Prompt */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <p className="text-sm text-gray-700">
              Tap 'Allow' for Push Notifications to receive daily updates like the one above. This way, you can keep up with all the progress day by day!
            </p>
            <Button 
              onClick={onAllow}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              OK
            </Button>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={onDismiss}
            className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Maybe later
          </button>
        </CardContent>
      </Card>
    </div>
  );
} 