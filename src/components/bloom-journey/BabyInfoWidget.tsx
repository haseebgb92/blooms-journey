'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Baby, 
  Calendar, 
  Heart, 
  Ruler, 
  Weight, 
  Eye, 
  Ear, 
  Brain, 
  Heart as HeartIcon,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info,
  Star,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { differenceInDays } from 'date-fns';
import { pregnancyData } from '@/lib/pregnancy-data';

interface BabyInfo {
  babyName: string;
  babyGender: string;
  currentWeek: number;
  dueDate: Date | null;
  babyCount: string;
  isBorn?: boolean;
}

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
  
  // Fallback for weeks not in pregnancyData
  return {
    babySize: `Week ${week} size`,
    babyDevelopment: [`Week ${week} development information`],
    momSymptoms: [`Week ${week} symptoms`]
  };
};

// Helper function to get trimester
const getTrimester = (week: number): string => {
  if (week <= 12) return "First";
  if (week <= 26) return "Second";
  return "Third";
};

// Helper function to calculate approximate days until due date
const getApproximateDays = (dueDate: Date | null): number => {
  if (!dueDate) return 0;
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
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
  const { toast } = useToast();

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
                  dueDate: data.dueDate ? new Date(data.dueDate.toDate()) : null,
                  babyCount: data.babyCount || 'single',
                  isBorn: data.isBorn || false
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

  const weekData = getWeekDevelopmentData(babyInfo.currentWeek);
  const trimester = getTrimester(babyInfo.currentWeek);
  const approximateDays = getApproximateDays(babyInfo.dueDate);

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
        
        setBabyInfo(prev => ({ ...prev, isBorn: true }));
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

  const handleBack = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, { 
          isBorn: false 
        }, { merge: true });
        
        setBabyInfo(prev => ({ ...prev, isBorn: false }));
        toast({
          title: "Status Updated",
          description: "Back to pregnancy tracking mode.",
        });
      } catch (error) {
        console.error("Error updating status: ", error);
        toast({
          title: "Error",
          description: "Could not update status. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 shadow-lg hover:shadow-primary/10 transition-shadow duration-300">
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (babyInfo.isBorn) {
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
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-pink-100 rounded-full">
              <Baby className="h-3 w-3 text-pink-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-pink-800">
                {babyInfo.babyName ? babyInfo.babyName : 'Your Baby'}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge variant="outline" className="text-xs border-pink-200 text-pink-700">
                  {babyInfo.babyGender !== 'unspecified' ? babyInfo.babyGender : 'Gender TBD'}
                </Badge>
                {babyInfo.babyCount !== 'single' && (
                  <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700">
                    {babyInfo.babyCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Info */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="text-center p-1.5 bg-white rounded-lg border border-pink-200">
            <div className="text-lg font-bold text-blue-600">Week {babyInfo.currentWeek}</div>
            <div className="text-xs text-gray-600">{trimester}</div>
          </div>
          <div className="text-center p-1.5 bg-white rounded-lg border border-pink-200">
            <div className="text-2xl mb-1">{getFruitSize(babyInfo.currentWeek).emoji}</div>
            <div className="text-lg font-bold text-green-600">{getFruitSize(babyInfo.currentWeek).fruit}</div>
            <div className="text-xs text-gray-600">Size</div>
          </div>
        </div>

        {/* Approximate Days */}
        {babyInfo.dueDate && (
          <div className="p-1.5 bg-white rounded-lg border border-pink-200 mb-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600">~{approximateDays} days</div>
                <div className="text-xs text-gray-600">until due</div>
              </div>
              <Calendar className="h-4 w-4 text-orange-500" />
            </div>
          </div>
        )}

        {/* Development Info */}
        <div className="p-1.5 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-pink-200 mb-2">
          <div className="flex items-center gap-1 mb-1">
            <Star className="h-2.5 w-2.5 text-yellow-500" />
            <span className="font-medium text-xs text-pink-800">Development</span>
          </div>
          <div className="text-xs text-gray-700">
            {weekData.babyDevelopment[0] && (
              <div className="flex items-start gap-1">
                <div className="w-0.5 h-0.5 bg-yellow-400 rounded-full mt-1 flex-shrink-0"></div>
                <span className="leading-tight">{weekData.babyDevelopment[0].substring(0, 60)}...</span>
              </div>
            )}
          </div>
        </div>

        {/* Mom's Symptoms */}
        {weekData.momSymptoms && weekData.momSymptoms.length > 0 && (
          <div className="p-1.5 bg-gradient-to-r from-pink-5 to-pink-10 rounded-lg border border-pink-200 mb-2">
            <div className="flex items-center gap-1 mb-1">
              <Heart className="h-2.5 w-2.5 text-pink-500" />
              <span className="font-medium text-xs text-pink-800">Symptoms</span>
            </div>
            <div className="text-xs text-gray-700">
              {weekData.momSymptoms[0] && (
                <div className="flex items-start gap-1">
                  <div className="w-0.5 h-0.5 bg-pink-400 rounded-full mt-1 flex-shrink-0"></div>
                  <span className="leading-tight">{weekData.momSymptoms[0].substring(0, 50)}...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 