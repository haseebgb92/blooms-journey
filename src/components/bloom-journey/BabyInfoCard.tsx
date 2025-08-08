'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Star
} from 'lucide-react';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface BabyInfo {
  babyName: string;
  babyGender: string;
  currentWeek: number;
  dueDate: Date | null;
  babyCount: string;
}

// Baby development data by week
const babyDevelopmentData: { [key: number]: any } = {
  1: {
    size: "0.1mm",
    weight: "0g",
    fruit: "Poppy seed",
    development: "Fertilization occurs, cell division begins",
    milestones: ["Zygote forms", "Cell division starts", "Implantation preparation"],
    tips: ["Start taking prenatal vitamins", "Avoid alcohol and smoking", "Schedule first prenatal visit"]
  },
  2: {
    size: "0.2mm",
    weight: "0g",
    fruit: "Sesame seed",
    development: "Implantation in uterus, placenta begins forming",
    milestones: ["Implantation occurs", "Placenta development starts", "Hormone production begins"],
    tips: ["Continue healthy diet", "Stay hydrated", "Get adequate rest"]
  },
  3: {
    size: "0.3mm",
    weight: "0g",
    fruit: "Poppy seed",
    development: "Neural tube forms, heart begins developing",
    milestones: ["Neural tube formation", "Heart development starts", "Basic cell layers form"],
    tips: ["Take folic acid", "Avoid hot tubs", "Eat folate-rich foods"]
  },
  4: {
    size: "0.4mm",
    weight: "0g",
    fruit: "Sesame seed",
    development: "Heart starts beating, major organs begin forming",
    milestones: ["Heart begins beating", "Major organs start forming", "Arm and leg buds appear"],
    tips: ["Schedule ultrasound", "Continue prenatal vitamins", "Avoid raw fish"]
  },
  8: {
    size: "1.6cm",
    weight: "1g",
    fruit: "Kidney bean",
    development: "All major organs present, baby starts moving",
    milestones: ["All major organs present", "Baby starts moving", "Fingers and toes form"],
    tips: ["First trimester screening", "Eat protein-rich foods", "Stay active with doctor's approval"]
  },
  12: {
    size: "5.4cm",
    weight: "14g",
    fruit: "Lime",
    development: "Baby can make sucking motions, reflexes developing",
    milestones: ["Sucking motions", "Reflexes develop", "Fingernails form"],
    tips: ["Second trimester begins", "Gender may be visible on ultrasound", "Energy levels improve"]
  },
  16: {
    size: "11.6cm",
    weight: "100g",
    fruit: "Apple",
    development: "Baby can hear sounds, movements become coordinated",
    milestones: ["Can hear sounds", "Coordinated movements", "Heart pumps 25 quarts of blood daily"],
    tips: ["Start talking to baby", "Play music", "Consider prenatal classes"]
  },
  20: {
    size: "16.4cm",
    weight: "300g",
    fruit: "Banana",
    development: "Baby can hear your voice, sleep cycles develop",
    milestones: ["Can hear your voice", "Sleep cycles develop", "Hair and nails grow"],
    tips: ["Mid-pregnancy ultrasound", "Start belly bonding", "Practice relaxation techniques"]
  },
  24: {
    size: "21cm",
    weight: "600g",
    fruit: "Corn",
    development: "Baby responds to light and sound, fingerprints form",
    milestones: ["Responds to light and sound", "Fingerprints form", "Lungs develop surfactant"],
    tips: ["Monitor movements", "Stay hydrated", "Eat iron-rich foods"]
  },
  28: {
    size: "25cm",
    weight: "1000g",
    fruit: "Eggplant",
    development: "Baby can open eyes, brain growth accelerates",
    milestones: ["Can open eyes", "Brain growth accelerates", "Breathing practice begins"],
    tips: ["Third trimester begins", "Monitor blood pressure", "Prepare for birth classes"]
  },
  32: {
    size: "28cm",
    weight: "1700g",
    fruit: "Squash",
    development: "Baby practices breathing, bones harden",
    milestones: ["Practices breathing", "Bones harden", "Baby gains weight rapidly"],
    tips: ["Frequent prenatal visits", "Monitor movements", "Prepare hospital bag"]
  },
  36: {
    size: "32cm",
    weight: "2600g",
    fruit: "Honeydew melon",
    development: "Baby is almost ready for birth, lungs mature",
    milestones: ["Lungs mature", "Baby gains weight", "Head may engage in pelvis"],
    tips: ["Weekly prenatal visits", "Monitor contractions", "Finalize birth plan"]
  },
  40: {
    size: "36cm",
    weight: "3400g",
    fruit: "Watermelon",
    development: "Baby is fully developed and ready for birth",
    milestones: ["Fully developed", "Ready for birth", "All systems functional"],
    tips: ["Monitor for labor signs", "Stay calm and prepared", "Trust your body"]
  }
};

// Helper function to get week data
const getWeekData = (week: number) => {
  // Find the closest week data
  const availableWeeks = Object.keys(babyDevelopmentData).map(Number).sort((a, b) => a - b);
  const closestWeek = availableWeeks.reduce((prev, curr) => 
    Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev
  );
  return babyDevelopmentData[closestWeek] || babyDevelopmentData[12];
};

// Helper function to get trimester
const getTrimester = (week: number): string => {
  if (week <= 12) return "First Trimester";
  if (week <= 26) return "Second Trimester";
  return "Third Trimester";
};

// Helper function to format date
const formatDate = (date: Date | null): string => {
  if (!date) return "Not set";
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Helper function to calculate days until due date
const getDaysUntilDue = (dueDate: Date | null): number => {
  if (!dueDate) return 0;
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export function BabyInfoCard() {
  const [babyInfo, setBabyInfo] = useState<BabyInfo>({
    babyName: '',
    babyGender: 'unspecified',
    currentWeek: 1,
    dueDate: null,
    babyCount: 'single'
  });
  const [isExpanded, setIsExpanded] = useState(false);
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
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-full">
              <Baby className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {babyInfo.babyName ? babyInfo.babyName : 'Your Baby'}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {babyInfo.babyGender !== 'unspecified' ? babyInfo.babyGender : 'Gender TBD'}
                </Badge>
                {babyInfo.babyCount !== 'single' && (
                  <Badge variant="secondary" className="text-xs">
                    {babyInfo.babyCount}
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Basic Info - Always Visible */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">Week {babyInfo.currentWeek}</div>
            <div className="text-sm text-gray-600">{trimester}</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{weekData.size}</div>
            <div className="text-sm text-gray-600">Size</div>
          </div>
        </div>

        {babyInfo.dueDate && (
          <div className="mb-4 p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Due Date</div>
                <div className="font-medium">{formatDate(babyInfo.dueDate)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Days Left</div>
                <div className="font-bold text-orange-600">{daysUntilDue}</div>
              </div>
            </div>
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <Separator />
            
            {/* Development Information */}
            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                This Week's Development
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Size Comparison</div>
                  <div className="font-medium">Like a {weekData.fruit}</div>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Development</div>
                  <div className="font-medium">{weekData.development}</div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Key Milestones</div>
                  <ul className="space-y-1">
                    {weekData.milestones.map((milestone: string, index: number) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        {milestone}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-green-500" />
                Tips for This Week
              </h4>
              <div className="space-y-2">
                {weekData.tips.map((tip: string, index: number) => (
                  <div key={index} className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium">{tip}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="text-sm text-gray-600">Weight</div>
                <div className="font-bold text-lg">{weekData.weight}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="text-sm text-gray-600">Length</div>
                <div className="font-bold text-lg">{weekData.size}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                View Full Pregnancy Timeline
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Baby className="h-5 w-5 text-pink-600" />
                  Complete Pregnancy Timeline
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Track your baby's development week by week with detailed information about growth, milestones, and tips.
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => {
                    // Navigate to timeline page
                    window.location.href = '/timeline';
                  }}
                >
                  Go to Timeline
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
} 