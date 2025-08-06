'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, GlassWater, Loader2 } from 'lucide-react';
import { auth, firestore, doc, getDoc, setDoc, onSnapshot } from '@/lib/firebase/clientApp';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const DAILY_GOAL = 8; // 8 glasses of water

export function WaterIntakeTracker() {
  const [waterCount, setWaterCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    let unsubscribeSnapshot: () => void = () => {};
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setIsLoading(true);
        const waterDocRef = doc(firestore, 'users', user.uid, 'waterIntake', todayStr);
        
        unsubscribeSnapshot = onSnapshot(waterDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setWaterCount(docSnap.data().count);
            } else {
                setWaterCount(0);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching water intake:", error);
            toast({ title: "Error", description: "Could not fetch water intake data.", variant: "destructive" });
            setIsLoading(false);
        });

      } else {
        setIsLoading(false);
        setWaterCount(0);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [todayStr, toast]);


  const updateWaterCount = async (newCount: number) => {
      const user = auth.currentUser;
      if (!user) {
          toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
          return;
      }
      const waterDocRef = doc(firestore, 'users', user.uid, 'waterIntake', todayStr);
      try {
          await setDoc(waterDocRef, { count: newCount, date: new Date() }, { merge: true });
          // The onSnapshot listener will update the state automatically.
      } catch (error) {
          console.error("Error updating water count:", error);
          toast({ title: "Error", description: "Could not save your water intake.", variant: "destructive" });
      }
  };

  const handleAddWater = () => {
    const newCount = Math.min(waterCount + 1, 20);
    setWaterCount(newCount); // Optimistic update
    updateWaterCount(newCount);
  };

  const handleRemoveWater = () => {
    const newCount = Math.max(waterCount - 1, 0);
    setWaterCount(newCount); // Optimistic update
    updateWaterCount(newCount);
  };

  const waterIcons = Array.from({ length: DAILY_GOAL }, (_, i) => i < waterCount);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-sm font-medium font-body">Water Intake</CardTitle>
        <CardDescription className="text-xs">Stay hydrated for you and baby.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
            <>
                <div className="text-center space-y-2">
                    <p className="text-3xl font-bold font-headline text-primary">{waterCount} <span className="text-base font-body text-muted-foreground">/ {DAILY_GOAL} glasses</span></p>
                    <div className="flex justify-center gap-1.5 flex-wrap">
                        {waterIcons.map((filled, i) => (
                            <GlassWater key={i} className={`h-6 w-6 transition-colors ${filled ? 'text-primary' : 'text-primary/20'}`} />
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="icon" onClick={handleRemoveWater} disabled={waterCount === 0}>
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Remove water</span>
                </Button>
                <Button variant="outline" size="icon" onClick={handleAddWater}>
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add water</span>
                </Button>
                </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}
