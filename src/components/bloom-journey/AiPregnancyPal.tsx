'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Baby, MessageCircle, Calendar, Heart } from 'lucide-react';

// Helper function to get week information
function getWeekInfo(week: number): string {
  const weekData: { [key: number]: string } = {
    1: "Your baby is just a tiny cluster of cells, smaller than a grain of rice. The fertilized egg implants in your uterus.",
    2: "The embryo is developing rapidly. Your baby's neural tube, which will become the brain and spinal cord, is forming.",
    3: "Your baby is about the size of a poppy seed. The heart is beginning to form and will start beating soon.",
    4: "Your baby is now the size of a sesame seed. The placenta is developing to provide nourishment.",
    5: "Your baby is about the size of an apple seed. The heart is beating and major organs are forming.",
    6: "Your baby is the size of a lentil. The eyes, ears, and nose are beginning to form.",
    7: "Your baby is about the size of a blueberry. The arms and legs are developing as tiny buds.",
    8: "Your baby is the size of a kidney bean. All major organs are present and developing.",
    9: "Your baby is about the size of a grape. The baby is now called a fetus and is moving around.",
    10: "Your baby is the size of a kumquat. The baby can make sucking motions and has tiny fingernails.",
    11: "Your baby is about the size of a fig. The baby's head makes up about half of its body length.",
    12: "Your baby is the size of a lime. The baby's reflexes are developing and it can move its fingers and toes.",
    13: "Your baby is the size of a lemon. The baby's vocal cords are developing and it can make sounds.",
    14: "Your baby is about the size of a peach. The baby's facial muscles are developing and it can make expressions.",
    15: "Your baby is the size of an apple. The baby's bones are hardening and it can move its joints.",
    16: "Your baby is about the size of an avocado. The baby's heart is pumping about 25 quarts of blood daily.",
    17: "Your baby is the size of a pear. The baby's fat stores are beginning to develop.",
    18: "Your baby is about the size of a bell pepper. The baby's ears are in their final position.",
    19: "Your baby is the size of a mango. The baby's skin is developing a protective coating called vernix.",
    20: "Your baby is about the size of a banana. The baby's movements are becoming more coordinated.",
    21: "Your baby is the size of a carrot. The baby's digestive system is developing and it can swallow.",
    22: "Your baby is about the size of a coconut. The baby's sense of balance is developing.",
    23: "Your baby is the size of a grapefruit. The baby's lungs are developing surfactant for breathing.",
    24: "Your baby is about the size of a cantaloupe. The baby's face is fully formed and recognizable.",
    25: "Your baby is the size of a cauliflower. The baby's brain is growing rapidly.",
    26: "Your baby is about the size of a lettuce head. The baby's eyes are opening and it can see light.",
    27: "Your baby is the size of a broccoli. The baby's immune system is developing.",
    28: "Your baby is about the size of an eggplant. The baby's brain is developing rapidly.",
    29: "Your baby is the size of a butternut squash. The baby's muscles are getting stronger.",
    30: "Your baby is about the size of a cabbage. The baby's brain is growing rapidly.",
    31: "Your baby is the size of a pineapple. The baby's lungs are almost fully developed.",
    32: "Your baby is about the size of a squash. The baby's toenails have grown in.",
    33: "Your baby is the size of a durian. The baby's immune system is maturing.",
    34: "Your baby is about the size of a cantaloupe. The baby's lungs are fully developed.",
    35: "Your baby is the size of a honeydew melon. The baby's kidneys are fully developed.",
    36: "Your baby is about the size of a romaine lettuce. The baby's brain is still developing rapidly.",
    37: "Your baby is the size of a Swiss chard. The baby is considered full-term now.",
    38: "Your baby is about the size of a leek. The baby's brain is still growing rapidly.",
    39: "Your baby is the size of a mini watermelon. The baby's brain is still developing.",
    40: "Your baby is about the size of a watermelon. Your baby is ready to be born!"
  };
  return weekData[week] || "Your baby is developing beautifully!";
}

// Helper function to get fruit size comparison
function getFruitSize(week: number): { fruit: string; size: string; emoji: string } {
  const fruitSizes: { [key: number]: { fruit: string; size: string; emoji: string } } = {
    1: { fruit: "Poppy Seed", size: "0.1mm", emoji: "🌱" },
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
  return fruitSizes[week] || { fruit: "Unknown", size: "Unknown", emoji: "👶" };
}

// Helper function to get animal size comparison
function getAnimalSize(week: number): { animal: string; size: string; emoji: string } {
  const animalSizes: { [key: number]: { animal: string; size: string; emoji: string } } = {
    1: { animal: "Tiny Ant", size: "0.1mm", emoji: "🐜" },
    2: { animal: "Small Ant", size: "1-2mm", emoji: "🐜" },
    3: { animal: "Medium Ant", size: "2-3mm", emoji: "🐜" },
    4: { animal: "Large Ant", size: "3-4mm", emoji: "🐜" },
    5: { animal: "Ladybug", size: "5-6mm", emoji: "🐞" },
    6: { animal: "Small Beetle", size: "6-7mm", emoji: "🪲" },
    7: { animal: "Large Beetle", size: "10-13mm", emoji: "🪲" },
    8: { animal: "Small Mouse", size: "16-18mm", emoji: "🐭" },
    9: { animal: "Large Mouse", size: "22-30mm", emoji: "🐭" },
    10: { animal: "Small Rat", size: "31-40mm", emoji: "🐀" },
    11: { animal: "Large Rat", size: "41-50mm", emoji: "🐀" },
    12: { animal: "Small Cat", size: "51-60mm", emoji: "🐱" },
    13: { animal: "Large Cat", size: "61-70mm", emoji: "🐱" },
    14: { animal: "Small Dog", size: "71-80mm", emoji: "🐕" },
    15: { animal: "Large Dog", size: "81-90mm", emoji: "🐕" },
    16: { animal: "Small Rabbit", size: "91-100mm", emoji: "🐰" },
    17: { animal: "Large Rabbit", size: "101-110mm", emoji: "🐰" },
    18: { animal: "Small Fox", size: "111-120mm", emoji: "🦊" },
    19: { animal: "Large Fox", size: "121-130mm", emoji: "🦊" },
    20: { animal: "Small Deer", size: "131-140mm", emoji: "🦌" },
    21: { animal: "Large Deer", size: "141-150mm", emoji: "🦌" },
    22: { animal: "Small Bear", size: "151-160mm", emoji: "🐻" },
    23: { animal: "Large Bear", size: "161-170mm", emoji: "🐻" },
    24: { animal: "Small Elephant", size: "171-180mm", emoji: "🐘" },
    25: { animal: "Large Elephant", size: "181-190mm", emoji: "🐘" },
    26: { animal: "Small Giraffe", size: "191-200mm", emoji: "🦒" },
    27: { animal: "Large Giraffe", size: "201-210mm", emoji: "🦒" },
    28: { animal: "Small Whale", size: "211-220mm", emoji: "🐋" },
    29: { animal: "Large Whale", size: "221-230mm", emoji: "🐋" },
    30: { animal: "Small Dinosaur", size: "231-240mm", emoji: "🦕" },
    31: { animal: "Large Dinosaur", size: "241-250mm", emoji: "🦕" },
    32: { animal: "Small Dragon", size: "251-260mm", emoji: "🐉" },
    33: { animal: "Large Dragon", size: "261-270mm", emoji: "🐉" },
    34: { animal: "Small Unicorn", size: "271-280mm", emoji: "🦄" },
    35: { animal: "Large Unicorn", size: "281-290mm", emoji: "🦄" },
    36: { animal: "Small Phoenix", size: "291-300mm", emoji: "🦅" },
    37: { animal: "Large Phoenix", size: "301-310mm", emoji: "🦅" },
    38: { animal: "Small Griffin", size: "311-320mm", emoji: "🦅" },
    39: { animal: "Large Griffin", size: "321-330mm", emoji: "🦅" },
    40: { animal: "Full Grown Dragon", size: "331-340mm", emoji: "🐉" }
  };
  return animalSizes[week] || { animal: "Unknown", size: "Unknown", emoji: "👶" };
}

export default function AiPregnancyPal() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [isLoadingWeek, setIsLoadingWeek] = useState(true);
  const [sizeType, setSizeType] = useState<'fruit' | 'animal'>('fruit');
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
  const animalSize = getAnimalSize(currentWeek);
  const currentSize = sizeType === 'fruit' ? fruitSize : animalSize;

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2 text-pink-800">
          <Heart className="w-6 h-6" />
          <span>Pregnancy Pal</span>
        </CardTitle>
        <CardDescription>
          {isLoadingWeek ? 'Loading your pregnancy info...' : `Week ${currentWeek} - ${getWeekInfo(currentWeek).split('.')[0]}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Baby Size Comparison */}
        <div className="bg-white rounded-lg p-4 border border-pink-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-pink-800">Baby Size This Week</h3>
            <div className="flex space-x-2">
              <Button
                variant={sizeType === 'fruit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSizeType('fruit')}
                className="text-xs"
              >
                🍎 Fruit
              </Button>
              <Button
                variant={sizeType === 'animal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSizeType('animal')}
                className="text-xs"
              >
                🐾 Animal
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-5xl mb-3">{currentSize.emoji}</div>
              <div className="font-bold text-xl text-pink-700">
                {sizeType === 'fruit' ? fruitSize.fruit : animalSize.animal}
              </div>
              <div className="text-sm text-pink-600">{currentSize.size}</div>
            </div>
            <div className="text-pink-400 text-3xl">≈</div>
            <div className="text-center">
              <div className="text-5xl mb-3">👶</div>
              <div className="font-bold text-xl text-pink-700">Your Baby</div>
              <div className="text-sm text-pink-600">Week {currentWeek}</div>
            </div>
          </div>
        </div>

        {/* Week Information */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4">
          <h3 className="font-semibold text-primary mb-2">This Week's Development</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isLoadingWeek ? 'Loading...' : getWeekInfo(currentWeek)}
          </p>
        </div>

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
