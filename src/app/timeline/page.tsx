'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Baby, Heart, Clock, Compass, Wand2, MapPin } from 'lucide-react';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { differenceInDays } from 'date-fns';

const calculateCurrentWeek = (dueDate: Date | undefined): number => {
  if (!dueDate) return 12;
  const week = 40 - Math.ceil(differenceInDays(dueDate, new Date()) / 7);
  return Math.max(1, Math.min(week, 40));
};

const getFruitSize = (week: number): { fruit: string; emoji: string; size: string } => {
  const fruitSizes = {
    1: { fruit: "Poppy Seed", emoji: "🌱", size: "0.1 inch" },
    2: { fruit: "Sesame Seed", emoji: "🌱", size: "0.2 inch" },
    3: { fruit: "Poppy Seed", emoji: "🌱", size: "0.3 inch" },
    4: { fruit: "Poppy Seed", emoji: "🌱", size: "0.4 inch" },
    5: { fruit: "Sesame Seed", emoji: "🌱", size: "0.5 inch" },
    6: { fruit: "Lentil", emoji: "🫘", size: "0.6 inch" },
    7: { fruit: "Blueberry", emoji: "🫐", size: "0.7 inch" },
    8: { fruit: "Kidney Bean", emoji: "🫘", size: "0.8 inch" },
    9: { fruit: "Grape", emoji: "🍇", size: "0.9 inch" },
    10: { fruit: "Kumquat", emoji: "🍊", size: "1.2 inches" },
    11: { fruit: "Lime", emoji: "🍋", size: "1.6 inches" },
    12: { fruit: "Lime", emoji: "🍋", size: "2.1 inches" },
    13: { fruit: "Lemon", emoji: "🍋", size: "2.9 inches" },
    14: { fruit: "Peach", emoji: "🍑", size: "3.4 inches" },
    15: { fruit: "Apple", emoji: "🍎", size: "4.0 inches" },
    16: { fruit: "Avocado", emoji: "🥑", size: "4.6 inches" },
    17: { fruit: "Pear", emoji: "🍐", size: "5.1 inches" },
    18: { fruit: "Sweet Potato", emoji: "🍠", size: "5.6 inches" },
    19: { fruit: "Mango", emoji: "🥭", size: "6.0 inches" },
    20: { fruit: "Banana", emoji: "🍌", size: "6.5 inches" },
    21: { fruit: "Carrot", emoji: "🥕", size: "7.2 inches" },
    22: { fruit: "Coconut", emoji: "🥥", size: "7.6 inches" },
    23: { fruit: "Grapefruit", emoji: "🍊", size: "8.1 inches" },
    24: { fruit: "Corn", emoji: "🌽", size: "8.5 inches" },
    25: { fruit: "Cauliflower", emoji: "🥦", size: "9.1 inches" },
    26: { fruit: "Lettuce", emoji: "🥬", size: "9.8 inches" },
    27: { fruit: "Cauliflower", emoji: "🥦", size: "10.2 inches" },
    28: { fruit: "Eggplant", emoji: "🍆", size: "10.8 inches" },
    29: { fruit: "Butternut Squash", emoji: "🎃", size: "11.4 inches" },
    30: { fruit: "Cabbage", emoji: "🥬", size: "12.0 inches" },
    31: { fruit: "Pineapple", emoji: "🍍", size: "12.8 inches" },
    32: { fruit: "Squash", emoji: "🎃", size: "13.4 inches" },
    33: { fruit: "Durian", emoji: "🥭", size: "14.0 inches" },
    34: { fruit: "Cantaloupe", emoji: "🍈", size: "14.8 inches" },
    35: { fruit: "Honeydew", emoji: "🍈", size: "15.7 inches" },
    36: { fruit: "Romaine Lettuce", emoji: "🥬", size: "16.5 inches" },
    37: { fruit: "Swiss Chard", emoji: "🥬", size: "17.2 inches" },
    38: { fruit: "Leek", emoji: "🧅", size: "18.0 inches" },
    39: { fruit: "Mini Watermelon", emoji: "🍉", size: "18.9 inches" },
    40: { fruit: "Small Pumpkin", emoji: "🎃", size: "19.7 inches" }
  };

  return fruitSizes[week as keyof typeof fruitSizes] || { fruit: "Baby", emoji: "👶", size: "Growing" };
};

const getTrimester = (week: number): { name: string; color: string; progress: number; weeks: string } => {
  if (week <= 12) {
    return { 
      name: "First Trimester", 
      color: "text-pink-600 bg-pink-100 border-pink-200", 
      progress: (week / 12) * 100,
      weeks: "Weeks 1-12"
    };
  } else if (week <= 26) {
    return { 
      name: "Second Trimester", 
      color: "text-blue-600 bg-blue-100 border-blue-200", 
      progress: ((week - 12) / 14) * 100,
      weeks: "Weeks 13-26"
    };
  } else {
    return { 
      name: "Third Trimester", 
      color: "text-green-600 bg-green-100 border-green-200", 
      progress: ((week - 26) / 14) * 100,
      weeks: "Weeks 27-40"
    };
  }
};

const getWeekInfo = (week: number) => {
  const weekInfo = {
    1: "Your pregnancy journey begins! The fertilized egg implants in your uterus.",
    2: "Your baby is now a tiny cluster of cells, smaller than a grain of rice.",
    3: "The neural tube begins to form - this will become your baby's brain and spinal cord.",
    4: "Your baby's heart begins to beat! It's about the size of a poppy seed.",
    5: "Major organs are starting to develop. Your baby is now an embryo.",
    6: "Your baby's facial features are beginning to form.",
    7: "Your baby is now about the size of a blueberry.",
    8: "All major organs are present. Your baby is now called a fetus.",
    9: "Your baby's fingers and toes are developing.",
    10: "Your baby can now move their tiny limbs!",
    11: "Your baby's head makes up about half of their body length.",
    12: "First trimester complete! Your baby is fully formed.",
    13: "Second trimester begins! Your baby is about the size of a lemon.",
    14: "Your baby's facial muscles are developing.",
    15: "Your baby can now make sucking motions.",
    16: "Your baby's eyes can now move and detect light.",
    17: "Your baby's skeleton is turning from cartilage to bone.",
    18: "Your baby can now hear sounds! Talk and sing to them.",
    19: "Your baby is covered in a waxy coating called vernix.",
    20: "Halfway there! Your baby is about the size of a banana.",
    21: "Your baby's eyebrows and eyelashes are developing.",
    22: "Your baby's sense of balance is developing.",
    23: "Your baby's lungs are developing rapidly.",
    24: "Your baby's fingerprints and footprints are fully formed.",
    25: "Your baby's brain is growing rapidly.",
    26: "Your baby's eyes can now open and close.",
    27: "Third trimester begins! Your baby is about the size of a cauliflower.",
    28: "Your baby can now dream (REM sleep).",
    29: "Your baby's bones are hardening, except for the skull.",
    30: "Your baby is gaining weight rapidly.",
    31: "Your baby's lungs are almost fully developed.",
    32: "Your baby is practicing breathing movements.",
    33: "Your baby's immune system is developing.",
    34: "Your baby's fingernails reach the tips of their fingers.",
    35: "Your baby's kidneys are fully developed.",
    36: "Your baby is gaining about half a pound per week.",
    37: "Your baby is considered full-term!",
    38: "Your baby's brain is still developing rapidly.",
    39: "Your baby is getting ready for birth.",
    40: "Your due date! Your baby is ready to meet you."
  };
  return weekInfo[week as keyof typeof weekInfo] || "Your baby is growing and developing beautifully!";
};

export default function TimelinePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    let unsubscribeSnapshot: (() => void) | undefined;

    const fetchUserData = async () => {
      try {
        unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
          setUser(currentUser);
          
          if (currentUser) {
            try {
              const userDocRef = doc(firestore, 'users', currentUser.uid);
              unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                  const data = doc.data();
                  setUserData(data);
                  
                  if (data.dueDate) {
                    const dueDate = data.dueDate.toDate();
                    const week = calculateCurrentWeek(dueDate);
                    setCurrentWeek(week);
                  }
                }
              }, (error) => {
                if (error.code === 'permission-denied') {
                  console.log('Permission denied for user data');
                } else {
                  console.error('Error listening to user data:', error);
                }
              });
            } catch (error) {
              console.error('Error setting up user data listener:', error);
            }
          } else {
            router.push('/login');
          }
          
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error in fetchUserData:', error);
        setIsLoading(false);
      }
    };

    fetchUserData();

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-900">Loading timeline...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const fruitSize = getFruitSize(currentWeek);
  const trimester = getTrimester(currentWeek);
  const pregnancyProgress = (currentWeek / 40) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/home')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Pregnancy Timeline</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Current Week Card */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-6 h-6" />
                <span>Current Week</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">Week {currentWeek}</div>
                <p className="text-blue-100">You're {currentWeek} weeks pregnant!</p>
              </div>
            </CardContent>
          </Card>

          {/* Pregnancy Progress and Trimester Combined */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Compass className="w-6 h-6" />
                <span>Pregnancy Progress & Trimester</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                {/* Pregnancy Progress */}
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    {/* Compass Clock Circle */}
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background Circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      {/* Progress Circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - pregnancyProgress / 100)}`}
                        className="transition-all duration-1000 ease-out"
                      />
                      {/* Center Text */}
                      <text
                        x="50"
                        y="50"
                        textAnchor="middle"
                        dy="0.35em"
                        className="text-sm font-bold fill-blue-700"
                      >
                        {Math.round(pregnancyProgress)}%
                      </text>
                    </svg>
                    {/* Clock Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-6">
                    <div className="text-3xl font-bold text-blue-700">{currentWeek}/40</div>
                    <div className="text-lg text-blue-600">Weeks</div>
                    <div className="text-sm text-blue-500 mt-2">
                      {40 - currentWeek} weeks to go
                    </div>
                  </div>
                </div>

                {/* Trimester Progress */}
                <div className="flex-1 max-w-md">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium border ${trimester.color}`}>
                        {trimester.name}
                      </span>
                      <span className="text-sm text-green-600 font-medium">
                        {Math.round(trimester.progress)}% complete
                      </span>
                    </div>
                    {/* Trimester Progress Bar */}
                    <div className="w-full bg-green-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${trimester.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-green-600">
                      {trimester.weeks} • {currentWeek <= 12 && `Week ${currentWeek} of 12`}
                      {currentWeek > 12 && currentWeek <= 26 && `Week ${currentWeek - 12} of 14`}
                      {currentWeek > 26 && `Week ${currentWeek - 26} of 14`}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Week Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-6 h-6" />
                <span>This Week's Development</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-lg">
                {getWeekInfo(currentWeek)}
              </p>
            </CardContent>
          </Card>

          {/* Timeline Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Your Journey Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Week 1</span>
                  <span>Week 40</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-pink-500 via-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${pregnancyProgress}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div className="bg-pink-100 p-3 rounded-lg">
                    <div className="font-semibold text-pink-700">First Trimester</div>
                    <div className="text-pink-600">Weeks 1-12</div>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <div className="font-semibold text-blue-700">Second Trimester</div>
                    <div className="text-blue-600">Weeks 13-26</div>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <div className="font-semibold text-green-700">Third Trimester</div>
                    <div className="text-green-600">Weeks 27-40</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 