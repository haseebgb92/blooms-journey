
'use client';
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Baby, Loader2, Target, Heart, Star, CheckCircle, MessageCircle, ArrowLeft } from 'lucide-react';
import { format, differenceInDays, addWeeks, subWeeks } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, setDoc, Timestamp, onSnapshot, collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { pregnancyData } from '@/lib/pregnancy-data';

// Helper function to get fruit size comparison
const getFruitSize = (week: number): { fruit: string; emoji: string } => {
  const fruitSizes: { [key: number]: { fruit: string; emoji: string } } = {
    1: { fruit: "Poppy Seed", emoji: "🌱" },
    2: { fruit: "Sesame Seed", emoji: "🌱" },
    3: { fruit: "Poppy Seed", emoji: "🌱" },
    4: { fruit: "Sesame Seed", emoji: "🌱" },
    5: { fruit: "Apple Seed", emoji: "🍎" },
    6: { fruit: "Lentil", emoji: "🫘" },
    7: { fruit: "Blueberry", emoji: "🫐" },
    8: { fruit: "Kidney Bean", emoji: "🫘" },
    9: { fruit: "Grape", emoji: "🍇" },
    10: { fruit: "Kumquat", emoji: "🍊" },
    11: { fruit: "Fig", emoji: "🍈" },
    12: { fruit: "Lime", emoji: "🍋" },
    13: { fruit: "Lemon", emoji: "🍋" },
    14: { fruit: "Peach", emoji: "🍑" },
    15: { fruit: "Apple", emoji: "🍎" },
    16: { fruit: "Avocado", emoji: "🥑" },
    17: { fruit: "Pear", emoji: "🍐" },
    18: { fruit: "Bell Pepper", emoji: "🫑" },
    19: { fruit: "Mango", emoji: "🥭" },
    20: { fruit: "Banana", emoji: "🍌" },
    21: { fruit: "Carrot", emoji: "🥕" },
    22: { fruit: "Coconut", emoji: "🥥" },
    23: { fruit: "Grapefruit", emoji: "🍊" },
    24: { fruit: "Cantaloupe", emoji: "🍈" },
    25: { fruit: "Cauliflower", emoji: "🥦" },
    26: { fruit: "Lettuce", emoji: "🥬" },
    27: { fruit: "Broccoli", emoji: "🥦" },
    28: { fruit: "Eggplant", emoji: "🍆" },
    29: { fruit: "Butternut Squash", emoji: "🎃" },
    30: { fruit: "Cabbage", emoji: "🥬" },
    31: { fruit: "Pineapple", emoji: "🍍" },
    32: { fruit: "Squash", emoji: "🎃" },
    33: { fruit: "Durian", emoji: "🫐" },
    34: { fruit: "Cantaloupe", emoji: "🍈" },
    35: { fruit: "Honeydew", emoji: "🍈" },
    36: { fruit: "Romaine", emoji: "🥬" },
    37: { fruit: "Swiss Chard", emoji: "🥬" },
    38: { fruit: "Leek", emoji: "🧅" },
    39: { fruit: "Mini Watermelon", emoji: "🍉" },
    40: { fruit: "Watermelon", emoji: "🍉" }
  };
  return fruitSizes[week] || { fruit: "Growing Baby", emoji: "👶" };
};

// Helper function to get week-specific development data
const getWeekDevelopmentData = (week: number) => {
  const weekData = pregnancyData.find(data => data.week === week);
  if (weekData) {
    return {
      babySize: weekData.babySize,
      babyDevelopment: weekData.babyDevelopment,
      momSymptoms: weekData.momSymptoms
    };
  }
  
  // Fallback data if week not found
  return {
    babySize: getBabySize(week),
    babyDevelopment: [`Week ${week} development information`],
    momSymptoms: [`Week ${week} symptoms`]
  };
};

interface Review {
  id: string;
  rating: number;
  comment: string;
  timestamp: Date;
  userName: string;
}

const calculateCurrentWeek = (dueDate: Date | undefined): number | null => {
    if (!dueDate) return null;
    const daysUntilDue = differenceInDays(dueDate, new Date());
    // Add 5 days to account for due date variance (making the countdown more conservative)
    const adjustedDaysUntilDue = daysUntilDue + 5;
    const week = 40 - Math.ceil(adjustedDaysUntilDue / 7);
    return Math.max(1, Math.min(week, 40));
}

const calculateApproximateDays = (dueDate: Date | undefined): number => {
    if (!dueDate) return 0;
    const daysUntilDue = differenceInDays(dueDate, new Date());
    return Math.max(0, daysUntilDue);
}

const getTrimester = (week: number): string => {
    if (week <= 12) return 'First Trimester';
    if (week <= 26) return 'Second Trimester';
    return 'Third Trimester';
};

const getBabySize = (week: number): string => {
    const sizes: { [key: number]: string } = {
        1: 'Poppy seed', 2: 'Sesame seed', 3: 'Poppy seed', 4: 'Sesame seed',
        5: 'Peppercorn', 6: 'Lentil', 7: 'Blueberry', 8: 'Kidney bean',
        9: 'Grape', 10: 'Kumquat', 11: 'Fig', 12: 'Lime',
        13: 'Lemon', 14: 'Peach', 15: 'Apple', 16: 'Avocado',
        17: 'Pear', 18: 'Bell pepper', 19: 'Mango', 20: 'Banana',
        21: 'Carrot', 22: 'Coconut', 23: 'Grapefruit', 24: 'Cantaloupe',
        25: 'Cauliflower', 26: 'Lettuce', 27: 'Broccoli', 28: 'Eggplant',
        29: 'Butternut squash', 30: 'Cabbage', 31: 'Pineapple', 32: 'Large jicama',
        33: 'Pineapple', 34: 'Cantaloupe', 35: 'Honeydew melon', 36: 'Romaine lettuce',
        37: 'Swiss chard', 38: 'Leek', 39: 'Mini watermelon', 40: 'Small pumpkin'
    };
    return sizes[week] || 'Growing baby';
};

export function DueDateCountdown() {
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeekInput, setCurrentWeekInput] = useState<string>('');
  const [isDueDateSaved, setIsDueDateSaved] = useState(false);
  const [hasLoadedDueDate, setHasLoadedDueDate] = useState(false);
  const [isBorn, setIsBorn] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { toast } = useToast();

  const handleBack = () => {
    // Reset the born status to go back to pregnancy tracking
    const user = auth.currentUser;
    if (user) {
      setDoc(doc(firestore, "users", user.uid), { 
        isBorn: false 
      }, { merge: true }).then(() => {
        setIsBorn(false);
        toast({
          title: "Status Updated",
          description: "Back to pregnancy tracking mode.",
        });
      }).catch((error) => {
        console.error("Error updating status: ", error);
        toast({
          title: "Error",
          description: "Could not update status. Please try again.",
          variant: "destructive"
        });
      });
    }
  };

  useEffect(() => {
    setIsClient(true);
    let unsubscribeAuth: (() => void) | undefined;
    let unsubscribeSnapshot: (() => void) | undefined;

    const fetchUserData = async () => {
      try {
        unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
          if (user) {
            try {
              const userDocRef = doc(firestore, "users", user.uid);
              
              // Use real-time listener to get updates when due date changes
              unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                  const data = doc.data();
                  if (data.dueDate) {
                    try {
                      const savedDueDate = data.dueDate.toDate();
                      setDueDate(savedDueDate);
                      setIsDueDateSaved(true);
                    } catch (timestampError) {
                      console.error('DueDateCountdown - Error converting timestamp:', timestampError);
                      const defaultDueDate = new Date();
                      defaultDueDate.setDate(defaultDueDate.getDate() + 180);
                      setDueDate(defaultDueDate);
                      setIsDueDateSaved(false);
                    }
                  } else {
                    const defaultDueDate = new Date();
                    defaultDueDate.setDate(defaultDueDate.getDate() + 180);
                    setDueDate(defaultDueDate);
                    setIsDueDateSaved(false);
                  }
                  
                  // Check if baby is born
                  setIsBorn(data.isBorn || false);
                }
                setHasLoadedDueDate(true);
                setIsLoading(false);
              }, (error) => {
                if (error.code === 'permission-denied') {
                  console.log('Permission denied for user data, using default due date');
                  const defaultDueDate = new Date();
                  defaultDueDate.setDate(defaultDueDate.getDate() + 180);
                  setDueDate(defaultDueDate);
                  setIsDueDateSaved(false);
                  setHasLoadedDueDate(true);
                  setIsLoading(false);
                } else {
                  console.error('DueDateCountdown - Error fetching user data:', error);
                  setIsLoading(false);
                }
              });
            } catch (error) {
              console.error('DueDateCountdown - Error setting up snapshot listener:', error);
              setIsLoading(false);
            }
          } else {
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error('DueDateCountdown - Error in fetchUserData:', error);
        setIsLoading(false);
      }
    };

    fetchUserData();

    // Cleanup function
    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  useEffect(() => {
    // Load reviews
    const loadReviews = async () => {
      try {
        const reviewsRef = collection(firestore, 'reviews');
        const q = query(reviewsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const reviewsData: Review[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          reviewsData.push({
            id: doc.id,
            rating: data.rating,
            comment: data.comment,
            timestamp: data.timestamp.toDate(),
            userName: data.userName || 'Anonymous'
          });
        });
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    };

    loadReviews();
  }, []);

  const saveDueDate = async (date: Date) => {
      const user = auth.currentUser;
      if (user) {
        try {
            const userDocRef = doc(firestore, "users", user.uid);
            const currentWeek = calculateCurrentWeek(date) || 1;
            
            console.log('DueDateCountdown - Saving due date:', date, 'Week:', currentWeek);
            
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
        console.log('DueDateCountdown - No user, cannot save due date to Firestore');
        toast({
            title: "Due Date Updated",
            description: "Please log in to save your due date permanently.",
        });
      }
  }

  const handleDateSelect = async (selectedDate: Date | undefined) => {
    if (selectedDate) {
      await saveDueDate(selectedDate);
    }
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
    const remainingWeeks = 40 - week;
    const calculatedDueDate = addWeeks(today, remainingWeeks);
    
    setDueDate(calculatedDueDate);
    setCurrentWeekInput('');
    await saveDueDate(calculatedDueDate);
  };

  const handleBornClick = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, { 
          isBorn: true,
          bornDate: Timestamp.fromDate(new Date()),
          lastUpdated: Timestamp.fromDate(new Date())
        }, { merge: true });
        
        setIsBorn(true);
        toast({
          title: "Congratulations! 🎉",
          description: "Your baby has been born! Welcome to parenthood!",
        });
      } catch (error) {
        console.error("Error marking baby as born: ", error);
        toast({
          title: "Error",
          description: "Could not update baby status. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmitReview = async () => {
    console.log('handleSubmitReview called');
    
    if (isSubmittingReview) {
      console.log('Already submitting review');
      return;
    }

    const user = auth.currentUser;
    
    if (!user) {
      console.log('No user found');
      toast({
        title: "Error",
        description: "Please log in to submit a review.",
        variant: "destructive"
      });
      return;
    }

    if (!newReview.comment.trim()) {
      console.log('No comment provided');
      toast({
        title: "Error",
        description: "Please enter a review comment.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingReview(true);

    try {
      console.log('Submitting review:', newReview);
      const reviewsRef = collection(firestore, 'reviews');
      
      const reviewData = {
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        timestamp: Timestamp.fromDate(new Date()),
        userName: user.displayName || user.email || 'Anonymous',
        userId: user.uid
      };

      console.log('Review data to submit:', reviewData);
      
      const docRef = await addDoc(reviewsRef, reviewData);
      console.log('Review submitted successfully with ID:', docRef.id);

      // Reset form
      setNewReview({ rating: 5, comment: '' });
      setShowReviewDialog(false);
      
      // Reload reviews
      try {
        const q = query(reviewsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const reviewsData: Review[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          reviewsData.push({
            id: doc.id,
            rating: data.rating,
            comment: data.comment,
            timestamp: data.timestamp.toDate(),
            userName: data.userName || 'Anonymous'
          });
        });
        setReviews(reviewsData);
        console.log('Reviews reloaded:', reviewsData.length);
      } catch (reloadError) {
        console.error('Error reloading reviews:', reloadError);
      }

      toast({
        title: "Review Submitted",
        description: "Thank you for your review!",
      });
    } catch (error) {
      console.error("Error submitting review: ", error);
      toast({
        title: "Error",
        description: `Could not submit review: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const totalPregnancyDays = 280;
  const daysPassed = dueDate ? totalPregnancyDays - differenceInDays(dueDate, new Date()) : 0;
  const progress = (daysPassed / totalPregnancyDays) * 100;
  const currentWeek = calculateCurrentWeek(dueDate);
  const approximateDays = calculateApproximateDays(dueDate);

  if (!isClient || isLoading) {
    return (
        <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 shadow-lg hover:shadow-primary/10 transition-shadow duration-300 flex items-center justify-center h-[340px]">
            <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
        </Card>
    );
  }

  if (isBorn) {
    return (
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 shadow-lg hover:shadow-primary/10 transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium font-headline text-pink-800">Baby Status</CardTitle>
          <Baby className="h-5 w-5 text-pink-600" />
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-600 mb-2">Congratulations! 🎉</h3>
              <p className="text-gray-600">Your baby has been born!</p>
            </div>
            
            <Button
              onClick={handleBack}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pregnancy Tracking
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 shadow-lg hover:shadow-primary/10 transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-sm font-medium font-headline text-pink-800">Pregnancy Progress</CardTitle>
        <Baby className="h-4 w-4 text-pink-600" />
      </CardHeader>
      <CardContent className="pb-3">
        {dueDate ? (
          <div className="space-y-2">
            {/* Pregnancy Overview */}
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-1.5 bg-white rounded-lg border border-pink-200">
                <div className="text-lg font-bold text-blue-600">Week {currentWeek}</div>
                <div className="text-xs text-gray-600">{getTrimester(currentWeek || 1)}</div>
              </div>
              <div className="text-center p-1.5 bg-white rounded-lg border border-pink-200">
                <div className="text-2xl mb-1">{getFruitSize(currentWeek || 1).emoji}</div>
                <div className="text-lg font-bold text-green-600">{getFruitSize(currentWeek || 1).fruit}</div>
                <div className="text-xs text-gray-600">Size</div>
              </div>
            </div>

            {/* Week-specific Development Information */}
            {currentWeek && (
              <div className="space-y-1">
                <div className="p-1.5 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-pink-200">
                  <h4 className="font-semibold text-pink-700 mb-1 flex items-center gap-1 text-xs">
                    <Star className="w-2.5 h-2.5" />
                    Development
                  </h4>
                  <div className="text-xs text-gray-700">
                    {getWeekDevelopmentData(currentWeek).babyDevelopment[0] && (
                      <div className="flex items-start gap-1">
                        <span className="text-purple-500">•</span>
                        <span className="leading-tight">{getWeekDevelopmentData(currentWeek).babyDevelopment[0].substring(0, 60)}...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-1.5 bg-gradient-to-r from-pink-5 to-pink-10 rounded-lg border border-pink-200">
                  <h4 className="font-semibold text-pink-700 mb-1 flex items-center gap-1 text-xs">
                    <Heart className="w-2.5 h-2.5" />
                    Symptoms
                  </h4>
                  <div className="text-xs text-gray-700">
                    {getWeekDevelopmentData(currentWeek).momSymptoms[0] && (
                      <div className="flex items-start gap-1">
                        <span className="text-pink-500">•</span>
                        <span className="leading-tight">{getWeekDevelopmentData(currentWeek).momSymptoms[0].substring(0, 50)}...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Approximate Days */}
            <div className="p-1.5 bg-orange-50 rounded-lg border border-pink-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-600">~{approximateDays} days</div>
                  <div className="text-xs text-gray-600">until due</div>
                </div>
                <CalendarIcon className="h-4 w-4 text-orange-500" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <Progress value={progress} className="h-1.5"/>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Week {currentWeek}</span>
                <span>Week 40</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-muted-foreground text-xs">Set your due date to start tracking.</p>
          </div>
        )}
        
        <Tabs defaultValue="date" className="w-full mt-3">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="date">Set Due Date</TabsTrigger>
                <TabsTrigger value="week">Set Current Week</TabsTrigger>
            </TabsList>
            <TabsContent value="date" className="mt-4">
                <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input
                        id="due-date"
                        type="date"
                        value={dueDate ? format(dueDate, "yyyy-MM-dd") : ""}
                        onChange={(e) => handleDateSelect(e.target.value ? new Date(e.target.value) : undefined)}
                        className="w-full"
                    />
                </div>
            </TabsContent>
            <TabsContent value="week" className="mt-4">
                <div className="space-y-2">
                    <Label htmlFor="current-week">Current Week (1-40)</Label>
                    <div className="flex gap-2">
                        <Input
                            id="current-week"
                            type="number"
                            min="1"
                            max="40"
                            value={currentWeekInput}
                            onChange={(e) => setCurrentWeekInput(e.target.value)}
                            placeholder="Enter current week"
                            className="flex-1"
                        />
                        <Button onClick={handleWeekSelect} className="shrink-0">
                            Set Week
                        </Button>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

