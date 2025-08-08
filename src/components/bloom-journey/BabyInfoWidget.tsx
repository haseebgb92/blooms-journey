'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Baby, 
  Calendar, 
  Heart, 
  ChevronRight,
  Info,
  Star
} from 'lucide-react';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

interface BabyInfo {
  babyName: string;
  babyGender: string;
  currentWeek: number;
  dueDate: Date | null;
  babyCount: string;
}

// Simplified baby development data
const babyDevelopmentData: { [key: number]: any } = {
  1: { size: "0.1mm", fruit: "Poppy seed", development: "Fertilization occurs" },
  4: { size: "0.4mm", fruit: "Sesame seed", development: "Heart starts beating" },
  8: { size: "1.6cm", fruit: "Kidney bean", development: "All major organs present" },
  12: { size: "5.4cm", fruit: "Lime", development: "Baby can make sucking motions" },
  16: { size: "11.6cm", fruit: "Apple", development: "Baby can hear sounds" },
  20: { size: "16.4cm", fruit: "Banana", development: "Baby can hear your voice" },
  24: { size: "21cm", fruit: "Corn", development: "Baby responds to light and sound" },
  28: { size: "25cm", fruit: "Eggplant", development: "Baby can open eyes" },
  32: { size: "28cm", fruit: "Squash", development: "Baby practices breathing" },
  36: { size: "32cm", fruit: "Honeydew melon", development: "Baby is almost ready for birth" },
  40: { size: "36cm", fruit: "Watermelon", development: "Baby is fully developed" }
};

// Helper function to get week data
const getWeekData = (week: number) => {
  const availableWeeks = Object.keys(babyDevelopmentData).map(Number).sort((a, b) => a - b);
  const closestWeek = availableWeeks.reduce((prev, curr) => 
    Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev
  );
  return babyDevelopmentData[closestWeek] || babyDevelopmentData[12];
};

// Helper function to get trimester
const getTrimester = (week: number): string => {
  if (week <= 12) return "First";
  if (week <= 26) return "Second";
  return "Third";
};

// Helper function to calculate days until due date
const getDaysUntilDue = (dueDate: Date | null): number => {
  if (!dueDate) return 0;
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export function BabyInfoWidget() {
  const [babyInfo, setBabyInfo] = useState<BabyInfo>({
    babyName: '',
    babyGender: 'unspecified',
    currentWeek: 1,
    dueDate: null,
    babyCount: 'single'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: () => void = () => {};

    const fetchBabyData = async () => {
      try {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
          if (user) {
            const userDocRef = doc(firestore, 'users', user.uid);
            unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
              if (doc.exists()) {
                const data = doc.data();
                setBabyInfo({
                  babyName: data.babyName || '',
                  babyGender: data.babyGender || 'unspecified',
                  currentWeek: data.currentWeek || 1,
                  dueDate: data.dueDate ? new Date(data.dueDate) : null,
                  babyCount: data.babyCount || 'single'
                });
              }
              setIsLoading(false);
            }, (error) => {
              console.error('Error fetching baby data:', error);
              setIsLoading(false);
            });
          } else {
            setIsLoading(false);
          }
        });

        return () => {
          if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
      } catch (error) {
        console.error('Error setting up baby data listener:', error);
        setIsLoading(false);
      }
    };

    fetchBabyData();
  }, []);

  const weekData = getWeekData(babyInfo.currentWeek);
  const trimester = getTrimester(babyInfo.currentWeek);
  const daysUntilDue = getDaysUntilDue(babyInfo.dueDate);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="w-full hover:shadow-md transition-shadow duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-full">
                  <Baby className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {babyInfo.babyName ? babyInfo.babyName : 'Your Baby'}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Week {babyInfo.currentWeek}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {trimester} Trimester
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Size</div>
                <div className="font-medium text-sm">{weekData.fruit}</div>
                <ChevronRight className="h-4 w-4 text-gray-400 mt-1" />
              </div>
            </div>

            {babyInfo.dueDate && (
              <div className="mt-3 p-2 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Due in</span>
                  <span className="font-semibold text-orange-600">{daysUntilDue} days</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-pink-600" />
            Baby Information
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-pink-600 mb-1">
              {babyInfo.babyName ? babyInfo.babyName : 'Your Baby'}
            </div>
            <div className="flex justify-center gap-2">
              <Badge variant="outline">
                {babyInfo.babyGender !== 'unspecified' ? babyInfo.babyGender : 'Gender TBD'}
              </Badge>
              {babyInfo.babyCount !== 'single' && (
                <Badge variant="secondary">{babyInfo.babyCount}</Badge>
              )}
            </div>
          </div>

          {/* Week Information */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">Week {babyInfo.currentWeek}</div>
              <div className="text-xs text-gray-600">{trimester} Trimester</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{weekData.size}</div>
              <div className="text-xs text-gray-600">Size</div>
            </div>
          </div>

          {/* Development Info */}
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-sm">This Week's Development</span>
            </div>
            <div className="text-sm text-gray-700">{weekData.development}</div>
          </div>

          {/* Due Date Info */}
          {babyInfo.dueDate && (
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-sm">Due Date</span>
              </div>
              <div className="text-sm text-gray-700">
                {babyInfo.dueDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-sm font-semibold text-orange-600 mt-1">
                {daysUntilDue} days remaining
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={() => {
                window.location.href = '/timeline';
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              View Full Timeline
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                window.location.href = '/profile';
              }}
            >
              <Info className="h-4 w-4 mr-2" />
              Edit Baby Info
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 