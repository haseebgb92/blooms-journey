'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Baby, MessageCircle, Calendar, Heart, Star } from 'lucide-react';
import { pregnancyData } from '@/lib/pregnancy-data';

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

// Helper function to get fruit size comparison
function getFruitSize(week: number): { fruit: string; size: string; emoji: string } {
  const fruitSizes: { [key: number]: { fruit: string; size: string; emoji: string } } = {
    1: { fruit: "Poppy Seed", size: "0.1-1mm", emoji: "🌱" },
    2: { fruit: "Sesame Seed", size: "1-2mm", emoji: "🌱" },
    3: { fruit: "Poppy Seed", size: "2-3mm", emoji: "🌱" },
    4: { fruit: "Sesame Seed", size: "3-4mm", emoji: "🌱" },
    5: { fruit: "Apple Seed", size: "5-6mm", emoji: "🍎" },
    6: { fruit: "Lentil", size: "6-7mm", emoji: "🫘" },
    7: { fruit: "Blueberry", size: "10-13mm", emoji: "🫐" },
    8: { fruit: "Kidney Bean", size: "16-18mm", emoji: "🫘" },
    9: { fruit: "Grape", size: "22-30mm", emoji: "🍇" },
    10: { fruit: "Kumquat", size: "31-40mm", emoji: "🍊" },
    11: { fruit: "Fig", size: "41-50mm", emoji: "🍈" },
    12: { fruit: "Lime", size: "51-60mm", emoji: "🍋" },
    13: { fruit: "Lemon", size: "61-70mm", emoji: "🍋" },
    14: { fruit: "Peach", size: "71-80mm", emoji: "🍑" },
    15: { fruit: "Apple", size: "81-90mm", emoji: "🍎" },
    16: { fruit: "Avocado", size: "91-100mm", emoji: "🥑" },
    17: { fruit: "Pear", size: "101-110mm", emoji: "🍐" },
    18: { fruit: "Bell Pepper", size: "111-120mm", emoji: "🫑" },
    19: { fruit: "Mango", size: "121-130mm", emoji: "🥭" },
    20: { fruit: "Banana", size: "131-140mm", emoji: "🍌" },
    21: { fruit: "Carrot", size: "141-150mm", emoji: "🥕" },
    22: { fruit: "Coconut", size: "151-160mm", emoji: "🥥" },
    23: { fruit: "Grapefruit", size: "161-170mm", emoji: "🍊" },
    24: { fruit: "Cantaloupe", size: "171-180mm", emoji: "🍈" },
    25: { fruit: "Cauliflower", size: "181-190mm", emoji: "🥦" },
    26: { fruit: "Lettuce", size: "191-200mm", emoji: "🥬" },
    27: { fruit: "Broccoli", size: "201-210mm", emoji: "🥦" },
    28: { fruit: "Eggplant", size: "211-220mm", emoji: "🍆" },
    29: { fruit: "Butternut Squash", size: "221-230mm", emoji: "🎃" },
    30: { fruit: "Cabbage", size: "231-240mm", emoji: "🥬" },
    31: { fruit: "Pineapple", size: "241-250mm", emoji: "🍍" },
    32: { fruit: "Squash", size: "251-260mm", emoji: "🎃" },
    33: { fruit: "Durian", size: "261-270mm", emoji: "🫐" },
    34: { fruit: "Cantaloupe", size: "271-280mm", emoji: "🍈" },
    35: { fruit: "Honeydew", size: "281-290mm", emoji: "🍈" },
    36: { fruit: "Romaine", size: "291-300mm", emoji: "🥬" },
    37: { fruit: "Swiss Chard", size: "301-310mm", emoji: "🥬" },
    38: { fruit: "Leek", size: "311-320mm", emoji: "🧅" },
    39: { fruit: "Mini Watermelon", size: "321-330mm", emoji: "🍉" },
    40: { fruit: "Watermelon", size: "331-340mm", emoji: "🍉" }
  };
  return fruitSizes[week] || { fruit: "Growing Baby", size: "Varies", emoji: "👶" };
}

export default function AiPregnancyPal() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [isLoadingWeek, setIsLoadingWeek] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    let unsubscribeSnapshot: (() => void) | undefined;

    const fetchUserData = async () => {
      try {
        unsubscribeAuth = onAuthStateChanged(auth, (user) => {
          if (user) {
            try {
              const userDocRef = doc(firestore, 'users', user.uid);
              unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
                if (doc.exists() && doc.data().dueDate) {
                  try {
                    const savedDueDate = doc.data().dueDate.toDate();
                    const today = new Date();
                    const diffTime = Math.abs(savedDueDate.getTime() - today.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const calculatedWeek = Math.max(1, Math.min(40, Math.floor((280 - diffDays) / 7) + 1));
                    setCurrentWeek(calculatedWeek);
                  } catch (timestampError) {
                    console.error('AiPregnancyPal - Error converting timestamp:', timestampError);
                    setCurrentWeek(1);
                  }
                } else {
                  setCurrentWeek(1);
                }
                setIsLoadingWeek(false);
              }, (error) => {
                if (error.code === 'permission-denied') {
                  console.log('Permission denied for user data, using default week');
                } else {
                  console.error("Error listening to user data:", error);
                }
                setCurrentWeek(1);
                setIsLoadingWeek(false);
              });
            } catch (error) {
              console.error("Error setting up user data listener:", error);
              setCurrentWeek(1);
              setIsLoadingWeek(false);
            }
          } else {
            setCurrentWeek(1);
            setIsLoadingWeek(false);
          }
        });
      } catch (error) {
        console.error("Error in fetchUserData:", error);
        setCurrentWeek(1);
        setIsLoadingWeek(false);
      }
    };

    fetchUserData();

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const fruitSize = getFruitSize(currentWeek);
  const weekDevelopmentData = getWeekDevelopmentData(currentWeek);

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2 text-pink-800">
          <Heart className="w-6 h-6" />
          <span>Pregnancy Pal</span>
        </CardTitle>
        <CardDescription>
          {isLoadingWeek ? 'Loading your pregnancy info...' : `Week ${currentWeek} - ${weekDevelopmentData.babySize}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Baby Size Comparison */}
        <div className="bg-white rounded-lg p-4 border border-pink-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-pink-800">Baby Size This Week</h3>
            <div className="flex space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {}}
                className="text-xs"
              >
                🍎 Fruit
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-5xl mb-3">{fruitSize.emoji}</div>
              <div className="font-bold text-xl text-pink-700">
                {fruitSize.fruit}
              </div>
              <div className="text-sm text-pink-600">{fruitSize.size}</div>
            </div>
            <div className="text-pink-400 text-3xl">≈</div>
            <div className="text-center">
              <div className="text-5xl mb-3">👶</div>
              <div className="font-bold text-xl text-pink-700">Your Baby</div>
              <div className="text-sm text-pink-600">Week {currentWeek}</div>
            </div>
          </div>
        </div>

        {/* Week Development Information */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4">
          <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
            <Star className="w-4 h-4" />
            This Week's Development
          </h3>
          <div className="space-y-2">
            {weekDevelopmentData.babyDevelopment.map((development, index) => (
              <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                • {development}
              </p>
            ))}
          </div>
        </div>

        {/* Mom's Symptoms */}
        {weekDevelopmentData.momSymptoms && weekDevelopmentData.momSymptoms.length > 0 && (
          <div className="bg-gradient-to-r from-pink-5 to-pink-10 rounded-lg p-4">
            <h3 className="font-semibold text-pink-700 mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Mom's Symptoms
            </h3>
            <div className="space-y-2">
              {weekDevelopmentData.momSymptoms.map((symptom, index) => (
                <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                  • {symptom}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => router.push('/timeline')}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            View Timeline
          </Button>
          <Button 
            onClick={() => router.push('/community')}
            variant="outline"
            className="flex-1 border-pink-300 text-pink-700 hover:bg-pink-50"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Ask Community
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
