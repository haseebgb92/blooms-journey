
'use client';
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Baby, Loader2, Target } from 'lucide-react';
import { format, differenceInDays, addWeeks, subWeeks } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, setDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const calculateTimeLeft = (targetDate: Date) => {
    const difference = +targetDate - +new Date();
    let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    };

    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    }

    return timeLeft;
};

const calculateCurrentWeek = (dueDate: Date | undefined): number | null => {
    if (!dueDate) return null;
    const daysUntilDue = differenceInDays(dueDate, new Date());
    // Add 5 days to account for due date variance (making the countdown more conservative)
    const adjustedDaysUntilDue = daysUntilDue + 5;
    const week = 40 - Math.ceil(adjustedDaysUntilDue / 7);
    return Math.max(1, Math.min(week, 40));
}

export function DueDateCountdown() {
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(new Date()));
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeekInput, setCurrentWeekInput] = useState<string>('');
  const [isDueDateSaved, setIsDueDateSaved] = useState(false);
  const [hasLoadedDueDate, setHasLoadedDueDate] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDocRef = doc(firestore, "users", user.uid);
          
          // Use real-time listener to get updates when due date changes (like AI Pregnancy Pal)
          const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
            if (doc.exists() && doc.data().dueDate) {
              try {
                const savedDueDate = doc.data().dueDate.toDate();
                console.log('DueDateCountdown - Found saved due date:', savedDueDate);
                setDueDate(savedDueDate);
                setIsDueDateSaved(true);
              } catch (timestampError) {
                console.error('DueDateCountdown - Error converting timestamp:', timestampError);
                // If timestamp conversion fails, treat as no saved date
                const defaultDueDate = new Date();
                defaultDueDate.setDate(defaultDueDate.getDate() + 180);
                setDueDate(defaultDueDate);
                setIsDueDateSaved(false);
              }
            } else {
              // If no due date is saved, set a default but DON'T save it automatically
              // Let the user set their own due date
              const defaultDueDate = new Date();
              defaultDueDate.setDate(defaultDueDate.getDate() + 180);
              setDueDate(defaultDueDate);
              setIsDueDateSaved(false);
              // Don't save the default - let user choose their own due date
            }
            setHasLoadedDueDate(true);
            setIsLoading(false);
          }, (error) => {
            console.error("Error listening to user data:", error);
            // Set a temporary default due date for display purposes only
            const defaultDueDate = new Date();
            defaultDueDate.setDate(defaultDueDate.getDate() + 180);
            setDueDate(defaultDueDate);
            setHasLoadedDueDate(true);
            setIsLoading(false);
            // Don't save on error - let user set their own due date
          });

          return () => unsubscribeSnapshot();
        } catch (error) {
          console.error("Error setting up user data listener:", error);
          // Set a temporary default due date for display purposes only
          const defaultDueDate = new Date();
          defaultDueDate.setDate(defaultDueDate.getDate() + 180);
          setDueDate(defaultDueDate);
          setHasLoadedDueDate(true);
          setIsLoading(false);
          // Don't save on error - let user set their own due date
        }
      } else {
        // For non-authenticated users, set a temporary default due date
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 180);
        setDueDate(defaultDueDate);
        setHasLoadedDueDate(true);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!dueDate) return;

    const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft(dueDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [dueDate]);
  
  const saveDueDate = async (date: Date) => {
      const user = auth.currentUser;
      if (user) {
        try {
            const userDocRef = doc(firestore, "users", user.uid);
            const currentWeek = calculateCurrentWeek(date) || 1;
            
            console.log('DueDateCountdown - Saving due date:', date, 'Week:', currentWeek);
            
            // Save due date, current week, and timeline week
            await setDoc(userDocRef, { 
              dueDate: Timestamp.fromDate(date),
              currentWeek: currentWeek,
              timelineWeek: currentWeek,
              lastUpdated: Timestamp.fromDate(new Date())
            }, { merge: true });
            
            console.log('DueDateCountdown - Due date saved successfully');
            
            setIsDueDateSaved(true);
            
            toast({
                title: "Due Date Saved",
                description: `Your due date has been updated. You are currently in Week ${currentWeek}.`,
            });
        } catch (error) {
            console.error("Error saving due date: ", error);
            toast({
                title: "Error",
                description: "Could not save your due date. Please try again.",
                variant: "destructive"
            });
        }
      } else {
        // If user is not authenticated, just update the local state
        console.log('DueDateCountdown - No user, cannot save due date to Firestore');
        toast({
            title: "Due Date Updated",
            description: "Please log in to save your due date permanently.",
        });
      }
  }

  const handleDateSelect = async (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setDueDate(selectedDate);
    await saveDueDate(selectedDate);
  };
  
  const handleWeekSelect = async () => {
    const week = parseInt(currentWeekInput, 10);
    if(isNaN(week) || week < 1 || week > 40) {
        toast({
            title: "Invalid Week",
            description: "Please enter a week between 1 and 40.",
            variant: "destructive"
        });
        return;
    }
    
    const today = new Date();
    // Due Date = Today + (40 - currentWeek) weeks
    const remainingWeeks = 40 - week;
    const calculatedDueDate = addWeeks(today, remainingWeeks);
    
    setDueDate(calculatedDueDate);
    setCurrentWeekInput('');
    await saveDueDate(calculatedDueDate);
  };

  const totalPregnancyDays = 280;
  const daysPassed = dueDate ? totalPregnancyDays - differenceInDays(dueDate, new Date()) : 0;
  const progress = (daysPassed / totalPregnancyDays) * 100;
  const currentWeek = calculateCurrentWeek(dueDate);


  if (!isClient || isLoading) {
    return (
        <Card className="w-full shadow-lg border-primary/20 hover:shadow-primary/10 transition-shadow duration-300 flex items-center justify-center h-[340px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg border-primary/20 hover:shadow-primary/10 transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium font-headline">Due Date Countdown</CardTitle>
        <Baby className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        {dueDate ? (
          <div className="text-center pt-4 pb-2">
             <div className="grid grid-cols-4 gap-2 text-center my-4">
              <div>
                <div className="text-3xl font-bold font-headline text-primary">{timeLeft.days}</div>
                <div className="text-xs text-muted-foreground">DAYS</div>
              </div>
              <div>
                <div className="text-3xl font-bold font-headline text-primary">{timeLeft.hours}</div>
                <div className="text-xs text-muted-foreground">HOURS</div>
              </div>
              <div>
                <div className="text-3xl font-bold font-headline text-primary">{timeLeft.minutes}</div>
                <div className="text-xs text-muted-foreground">MINUTES</div>
              </div>
              <div>
                <div className="text-3xl font-bold font-headline text-primary">{timeLeft.seconds}</div>
                <div className="text-xs text-muted-foreground">SECONDS</div>
              </div>
            </div>
            
            <div className="my-4 space-y-2">
                <Progress value={progress} className="h-2"/>
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Week {currentWeek}</span>
                    <span>Week 40</span>
                </div>
            </div>
            
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Set your due date to start the countdown.</p>
          </div>
        )}
        <Tabs defaultValue="date" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="date">Set Due Date</TabsTrigger>
                <TabsTrigger value="week">Set Current Week</TabsTrigger>
            </TabsList>
            <TabsContent value="date" className="mt-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                    />
                  </PopoverContent>
                </Popover>
            </TabsContent>
            <TabsContent value="week" className="mt-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="week-input">What week are you in?</Label>
                    <Input 
                        id="week-input"
                        type="number"
                        placeholder="e.g. 12"
                        value={currentWeekInput}
                        onChange={(e) => setCurrentWeekInput(e.target.value)}
                    />
                </div>
                <Button onClick={handleWeekSelect} className="w-full">
                    <Target className="mr-2 h-4 w-4"/>
                    Calculate and Save Due Date
                </Button>
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

