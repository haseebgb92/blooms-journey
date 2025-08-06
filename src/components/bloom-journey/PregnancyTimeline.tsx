
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { pregnancyData, type PregnancyWeek } from '@/lib/pregnancy-data';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { differenceInDays } from 'date-fns';

const findWeekData = (week: number): PregnancyWeek | undefined => {
  return pregnancyData.find(w => w.week === week);
};

const calculatePregnancyProgress = (dueDate: Date | undefined): { weeks: number; days: number } | null => {
  if (!dueDate) return null;
  
  const today = new Date();
  const totalPregnancyDays = 280; // 40 weeks * 7 days
  const daysPassed = totalPregnancyDays - differenceInDays(dueDate, today);
  
  // Deduct 5 days to account for due date variance
  const adjustedDaysPassed = daysPassed - 5;
  
  if (adjustedDaysPassed <= 0) {
    return { weeks: 0, days: 0 };
  }
  
  const weeks = Math.floor(adjustedDaysPassed / 7);
  const days = adjustedDaysPassed % 7;
  
  return { weeks: Math.max(0, Math.min(weeks, 40)), days };
};

export function PregnancyTimeline() {
  const [timelineWeek, setTimelineWeek] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [dueDate, setDueDate] = useState<Date | undefined>();

  useEffect(() => {
    let unsubscribeSnapshot: () => void = () => {};
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            // Get the due date
            if (data.dueDate) {
              const savedDueDate = data.dueDate.toDate();
              setDueDate(savedDueDate);
              
              // Calculate current week based on due date
              const pregnancyProgress = calculatePregnancyProgress(savedDueDate);
              if (pregnancyProgress) {
                setTimelineWeek(pregnancyProgress.weeks);
              } else {
                setTimelineWeek(data.timelineWeek || data.currentWeek || 12);
              }
            } else {
              setTimelineWeek(data.timelineWeek || data.currentWeek || 12);
            }
          }
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
        setTimelineWeek(12);
        setDueDate(undefined);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });
    
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);
  
  const handleWeekChange = (value: number[]) => {
    const newWeek = value[0];
    setTimelineWeek(newWeek);
  };
  
  const handleSliderCommit = async (value: number[]) => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, { timelineWeek: value[0] }, { merge: true });
      }
  };

  const weekData = findWeekData(timelineWeek);
  const pregnancyProgress = calculatePregnancyProgress(dueDate);

  if (isLoading) {
    return (
        <Card className="w-full hover:shadow-lg transition-shadow duration-300 flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Card>
    );
  }

  if (!weekData) {
     return (
        <Card className="w-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">
                  {pregnancyProgress ? 
                    `${pregnancyProgress.weeks} weeks ${pregnancyProgress.days} days` : 
                    `Week ${timelineWeek}`
                  }
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>No data available for this week.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">
          {pregnancyProgress ? 
            `${pregnancyProgress.weeks} weeks ${pregnancyProgress.days} days` : 
            `Week ${timelineWeek}`
          }
        </CardTitle>
        <CardDescription>{weekData.babySize}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full px-2">
            <Slider
              value={[timelineWeek]}
              min={1}
              max={40}
              step={1}
              onValueChange={handleWeekChange}
              onValueCommit={handleSliderCommit}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>
                  {pregnancyProgress ? 
                    `${pregnancyProgress.weeks} weeks ${pregnancyProgress.days} days` : 
                    `Week ${timelineWeek}`
                  }
                </span>
                <span>Week 40</span>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="font-headline text-xl">Baby's Development</h3>
                 <Image
                    src={weekData.image || `https://placehold.co/400x300.png`}
                    alt={weekData.imageHint}
                    data-ai-hint={weekData.imageHint}
                    width={400}
                    height={300}
                    className="rounded-lg object-cover w-full aspect-[4/3]"
                />
                <ul className="space-y-2">
                {weekData.babyDevelopment.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                        <span>{item}</span>
                    </li>
                ))}
                </ul>
            </div>
            <div className="space-y-4">
                <h3 className="font-headline text-xl">Your Body & Symptoms</h3>
                <div className="flex flex-wrap gap-2">
                {weekData.momSymptoms.map((symptom, index) => (
                    <Badge key={index} variant="secondary">{symptom}</Badge>
                ))}
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
