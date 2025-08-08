'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Heart, Baby, Clock, Users, Star, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface OnboardingData {
  dueDate: Date | null;
  lastPeriodDate: Date | null;
  babyCount: 'single' | 'twin';
  notificationTime: string;
  babyGender: 'girl' | 'boy' | 'unspecified';
  skinTone: 'white' | 'yellow' | 'light' | 'medium' | 'dark' | 'black' | 'unspecified';
  momBirthDate: Date | null;
  babyName: string;
  preferredCountry: string;
  userRole: 'mom' | 'father' | 'singleMom';
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    dueDate: null,
    lastPeriodDate: null,
    babyCount: 'single',
    notificationTime: '09:00',
    babyGender: 'unspecified',
    skinTone: 'unspecified',
    momBirthDate: null,
    babyName: '',
    preferredCountry: '',
    userRole: 'mom' // Default to mom
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const totalSteps = 9;

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipStep = () => {
    // Set default values for the current step and move to next
    switch (currentStep) {
      case 1:
        // Set default due date (6 months from now)
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 180);
        updateData('dueDate', defaultDueDate);
        break;
      case 2:
        // Set default last period date (2 weeks ago)
        const defaultLastPeriod = new Date();
        defaultLastPeriod.setDate(defaultLastPeriod.getDate() - 14);
        updateData('lastPeriodDate', defaultLastPeriod);
        break;
      case 3:
        // Set default baby count
        updateData('babyCount', 'single');
        break;
      case 4:
        // Set default notification time
        updateData('notificationTime', '09:00');
        break;
      case 5:
        // Set default gender
        updateData('babyGender', 'unspecified');
        break;
      case 6:
        // Set default skin tone
        updateData('skinTone', 'unspecified');
        break;
      case 7:
        // Set default mom birth date (25 years ago)
        const defaultMomBirth = new Date();
        defaultMomBirth.setFullYear(defaultMomBirth.getFullYear() - 25);
        updateData('momBirthDate', defaultMomBirth);
        break;
      case 8:
        // Set default baby name and country
        updateData('babyName', '');
        updateData('preferredCountry', 'Pakistan');
        break;
      case 9:
        // Set default user role
        updateData('userRole', 'mom');
        break;
    }
    nextStep();
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Store onboarding data in localStorage for later use during signup
      localStorage.setItem('onboardingData', JSON.stringify({
        ...data,
        dueDate: data.dueDate?.toISOString(),
        lastPeriodDate: data.lastPeriodDate?.toISOString(),
        momBirthDate: data.momBirthDate?.toISOString()
      }));
      
      toast({
        title: "Onboarding Complete!",
        description: "Creating your personalized plan...",
      });
      
      // Redirect to loading page
      router.push('/onboarding/loading');
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <div className="animate-fade-in-down"><DueDateStep data={data} updateData={updateData} skipStep={skipStep} /></div>;
      case 2:
        return <div className="animate-slide-in-right"><LastPeriodStep data={data} updateData={updateData} skipStep={skipStep} /></div>;
      case 3:
        return <div className="animate-fade-in-down"><BabyCountStep data={data} updateData={updateData} skipStep={skipStep} /></div>;
      case 4:
        return <div className="animate-slide-in-right"><NotificationStep data={data} updateData={updateData} skipStep={skipStep} /></div>;
      case 5:
        return <div className="animate-fade-in-down"><GenderStep data={data} updateData={updateData} skipStep={skipStep} /></div>;
      case 6:
        return <div className="animate-slide-in-right"><SkinToneStep data={data} updateData={updateData} skipStep={skipStep} /></div>;
      case 7:
        return <div className="animate-fade-in-down"><MomBirthDateStep data={data} updateData={updateData} skipStep={skipStep} /></div>;
      case 8:
        return <div className="animate-slide-in-right"><BabyNameStep data={data} updateData={updateData} skipStep={skipStep} /></div>;
      case 9:
        return <div className="animate-fade-in-down"><UserRoleStep data={data} updateData={updateData} skipStep={skipStep} /></div>;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!data.dueDate;
      case 2:
        return !!data.lastPeriodDate;
      case 3:
        return !!data.babyCount;
      case 4:
        return !!data.notificationTime;
      case 5:
        return !!data.babyGender;
      case 6:
        return !!data.skinTone;
      case 7:
        return !!data.momBirthDate;
      case 8:
        return !!data.babyName && !!data.preferredCountry;
      case 9:
        return !!data.userRole;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 flex items-center justify-center p-4">
      {/* Back to Home Link */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg">
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back to Home</span>
        </Link>
      </div>
      
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/images/icon.png"
              alt="Bloom Journey Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">Bloom Journey</CardTitle>
          <CardDescription className="text-blue-700">
            Your complete pregnancy companion - from first plans to your child's third birthday.
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-gradient-to-r from-pink-400 to-red-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Step {currentStep} of {totalSteps}</p>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          {renderStep()}
        </CardContent>
        
        <div className="px-6 pb-6 flex gap-3">
          {currentStep > 1 && (
            <Button 
              variant="outline" 
              onClick={prevStep}
              className="flex-1"
            >
              Back
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button 
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex-1 bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500"
            >
              Continue
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              disabled={!canProceed() || isLoading}
              className="flex-1 bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500"
            >
              {isLoading ? 'Saving...' : 'Complete Setup'}
            </Button>
          )}
        </div>
        
        {/* Skip option */}
        <div className="px-6 pb-4 text-center">
          <button
            onClick={skipStep}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip for now
          </button>
        </div>
      </Card>
    </div>
  );
}

// Step 1: Due Date Selection
function DueDateStep({ data, updateData, skipStep }: { data: OnboardingData; updateData: (field: keyof OnboardingData, value: any) => void; skipStep: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-red-400 rounded-full flex items-center justify-center animate-pulse-glow">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
            <Baby className="w-12 h-12 text-red-400" />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-blue-900 mb-2">
          Mommy,<br />
          when will we see each other?
        </h3>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal mt-4",
                !data.dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {data.dueDate ? format(data.dueDate, "PPP") : "Select due date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={data.dueDate || undefined}
              onSelect={(date) => updateData('dueDate', date)}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
        
        {data.dueDate && (
          <p className="text-sm text-gray-600 mt-2">
            Due Date: {format(data.dueDate, "PPP")}
          </p>
        )}
        
        <div className="mt-4">
          <button
            onClick={skipStep}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            I'm not sure
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 2: Last Period Date
function LastPeriodStep({ data, updateData, skipStep }: { data: OnboardingData; updateData: (field: keyof OnboardingData, value: any) => void; skipStep: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-red-400 rounded-full flex items-center justify-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
            <CalendarIcon className="w-12 h-12 text-red-400" />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-blue-900 mb-2">
          Select the first day before your period
        </h3>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal mt-4",
                !data.lastPeriodDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {data.lastPeriodDate ? format(data.lastPeriodDate, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={data.lastPeriodDate || undefined}
              onSelect={(date) => updateData('lastPeriodDate', date)}
              initialFocus
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
        
        {data.lastPeriodDate && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              First day of last period: {format(data.lastPeriodDate, "PPP")}
            </p>
            <p className="text-sm text-blue-600 font-medium">
              Estimated Due Date: {data.dueDate ? format(data.dueDate, "PPP") : 'Calculating...'}
            </p>
          </div>
        )}
        
        <div className="mt-4">
          <button
            onClick={skipStep}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 3: Baby Count
function BabyCountStep({ data, updateData, skipStep }: { data: OnboardingData; updateData: (field: keyof OnboardingData, value: any) => void; skipStep: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-red-400 rounded-full flex items-center justify-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
            <Users className="w-12 h-12 text-red-400" />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-blue-900 mb-4">
          Mommy, how many of us are you expecting?
        </h3>
        
        <RadioGroup
          value={data.babyCount}
          onValueChange={(value) => updateData('babyCount', value)}
          className="space-y-4"
        >
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="single" id="single" />
            <Label htmlFor="single" className="text-lg font-medium cursor-pointer">
              Just Me!
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="twin" id="twin" />
            <Label htmlFor="twin" className="text-lg font-medium cursor-pointer">
              Me and a Twin!
            </Label>
          </div>
        </RadioGroup>
        
        <div className="mt-4">
          <button
            onClick={skipStep}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 4: Notification Time
function NotificationStep({ data, updateData, skipStep }: { data: OnboardingData; updateData: (field: keyof OnboardingData, value: any) => void; skipStep: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-orange-400 rounded-full flex items-center justify-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
            <Clock className="w-12 h-12 text-orange-400" />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-blue-900 mb-4">
          Mommy, choose the notification time.
        </h3>
        
        <div className="space-y-4">
          <Input
            type="time"
            value={data.notificationTime}
            onChange={(e) => updateData('notificationTime', e.target.value)}
            className="text-center text-2xl font-bold"
          />
          
          <p className="text-sm text-gray-600">
            You'll receive daily updates at this time
          </p>
        </div>
        
        <div className="mt-4">
          <button
            onClick={skipStep}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 5: Gender Selection
function GenderStep({ data, updateData, skipStep }: { data: OnboardingData; updateData: (field: keyof OnboardingData, value: any) => void; skipStep: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-blue-400 rounded-full flex items-center justify-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
            <Heart className="w-12 h-12 text-blue-400" />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-blue-900 mb-4">
          Mommy, let's start by specifying who I am.
        </h3>
        
        <RadioGroup
          value={data.babyGender}
          onValueChange={(value) => updateData('babyGender', value)}
          className="space-y-4"
        >
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="girl" id="girl" />
            <Label htmlFor="girl" className="text-lg font-medium cursor-pointer text-pink-600">
              I'm a Girl
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="boy" id="boy" />
            <Label htmlFor="boy" className="text-lg font-medium cursor-pointer text-blue-600">
              I'm a Boy
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="unspecified" id="unspecified" />
            <Label htmlFor="unspecified" className="text-lg font-medium cursor-pointer text-gray-600">
              Prefer Not to Specify
            </Label>
          </div>
        </RadioGroup>
        
        <div className="mt-4">
          <button
            onClick={skipStep}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 6: Skin Tone Selection
function SkinToneStep({ data, updateData, skipStep }: { data: OnboardingData; updateData: (field: keyof OnboardingData, value: any) => void; skipStep: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-orange-400 rounded-full flex items-center justify-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 to-orange-400 border-4 border-white shadow-lg"></div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-blue-900 mb-4">
          Mommy, what's my skin tone?
        </h3>
        
        <RadioGroup
          value={data.skinTone}
          onValueChange={(value) => updateData('skinTone', value)}
          className="grid grid-cols-2 gap-3"
        >
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="white" id="white" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-gray-300"></div>
            <Label htmlFor="white" className="text-lg font-medium cursor-pointer">White</Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="yellow" id="yellow" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-300 border-2 border-gray-300"></div>
            <Label htmlFor="yellow" className="text-lg font-medium cursor-pointer">Yellow</Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="light" id="light" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 border-2 border-gray-300"></div>
            <Label htmlFor="light" className="text-lg font-medium cursor-pointer">Light</Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="medium" id="medium" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 border-2 border-gray-300"></div>
            <Label htmlFor="medium" className="text-lg font-medium cursor-pointer">Medium</Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="dark" id="dark" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brown-400 to-brown-500 border-2 border-gray-300"></div>
            <Label htmlFor="dark" className="text-lg font-medium cursor-pointer">Dark</Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="black" id="black" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-300"></div>
            <Label htmlFor="black" className="text-lg font-medium cursor-pointer">Black</Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer col-span-2">
            <RadioGroupItem value="unspecified" id="unspecified" />
            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
              <span className="text-xs text-gray-500">?</span>
            </div>
            <Label htmlFor="unspecified" className="text-lg font-medium cursor-pointer text-gray-600">
              Prefer Not to Specify
            </Label>
          </div>
        </RadioGroup>
        
        <div className="mt-4">
          <button
            onClick={skipStep}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 7: Mom Birth Date
function MomBirthDateStep({ data, updateData, skipStep }: { data: OnboardingData; updateData: (field: keyof OnboardingData, value: any) => void; skipStep: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-green-400 rounded-full flex items-center justify-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
            <Users className="w-12 h-12 text-green-400" />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-blue-900 mb-4">
          Mommy, what's your birth date?
        </h3>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal mt-4",
                !data.momBirthDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {data.momBirthDate ? format(data.momBirthDate, "PPP") : "Select birth date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={data.momBirthDate || undefined}
              onSelect={(date) => updateData('momBirthDate', date)}
              initialFocus
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
        
        {data.momBirthDate && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Your birth date: {format(data.momBirthDate, "PPP")}
            </p>
          </div>
        )}
        
        <div className="mt-4">
          <button
            onClick={skipStep}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
} 

// Step 8: Baby Name and Preferred Country
function BabyNameStep({ data, updateData, skipStep }: { data: OnboardingData; updateData: (field: keyof OnboardingData, value: any) => void; skipStep: () => void }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Baby name suggestions by country and gender
  const nameSuggestions = {
    Pakistan: {
      boy: ['Ahmed', 'Ali', 'Hassan', 'Hussein', 'Muhammad', 'Omar', 'Yusuf', 'Zain', 'Ibrahim', 'Adam'],
      girl: ['Aisha', 'Fatima', 'Zara', 'Amina', 'Maryam', 'Hana', 'Layla', 'Noor', 'Sara', 'Yasmin'],
      unisex: ['Ayan', 'Zara', 'Noor', 'Sara', 'Adam', 'Hana']
    },
    USA: {
      boy: ['Liam', 'Noah', 'Oliver', 'Elijah', 'William', 'James', 'Benjamin', 'Lucas', 'Henry', 'Alexander'],
      girl: ['Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Charlotte', 'Mia', 'Amelia', 'Harper', 'Evelyn'],
      unisex: ['Riley', 'Avery', 'Jordan', 'Taylor', 'Morgan', 'Casey']
    },
    UK: {
      boy: ['Oliver', 'Harry', 'George', 'Noah', 'Jack', 'Leo', 'Oscar', 'Charlie', 'Muhammad', 'Thomas'],
      girl: ['Olivia', 'Amelia', 'Isla', 'Ava', 'Emily', 'Sophia', 'Grace', 'Lily', 'Freya', 'Chloe'],
      unisex: ['Riley', 'Avery', 'Jordan', 'Taylor', 'Morgan', 'Casey']
    },
    Canada: {
      boy: ['Liam', 'Noah', 'Oliver', 'Lucas', 'Benjamin', 'William', 'Henry', 'Theodore', 'Jack', 'Levi'],
      girl: ['Olivia', 'Emma', 'Ava', 'Charlotte', 'Sophia', 'Amelia', 'Isabella', 'Mia', 'Evelyn', 'Luna'],
      unisex: ['Riley', 'Avery', 'Jordan', 'Taylor', 'Morgan', 'Casey']
    },
    Australia: {
      boy: ['Oliver', 'Noah', 'Jack', 'William', 'Lucas', 'Mason', 'Ethan', 'Alexander', 'Henry', 'Isaac'],
      girl: ['Olivia', 'Charlotte', 'Ava', 'Amelia', 'Mia', 'Isla', 'Grace', 'Willow', 'Zoe', 'Chloe'],
      unisex: ['Riley', 'Avery', 'Jordan', 'Taylor', 'Morgan', 'Casey']
    },
    Germany: {
      boy: ['Liam', 'Noah', 'Ben', 'Paul', 'Jonas', 'Felix', 'Leon', 'Maximilian', 'Julian', 'Lukas'],
      girl: ['Emma', 'Mia', 'Hannah', 'Emilia', 'Sofia', 'Anna', 'Lea', 'Lina', 'Clara', 'Lena'],
      unisex: ['Riley', 'Avery', 'Jordan', 'Taylor', 'Morgan', 'Casey']
    },
    France: {
      boy: ['Liam', 'Hugo', 'Léo', 'Jules', 'Lucas', 'Adam', 'Arthur', 'Louis', 'Paul', 'Antoine'],
      girl: ['Emma', 'Jade', 'Louise', 'Alice', 'Chloé', 'Léa', 'Mia', 'Agathe', 'Jules', 'Inès'],
      unisex: ['Riley', 'Avery', 'Jordan', 'Taylor', 'Morgan', 'Casey']
    },
    Japan: {
      boy: ['Hiroto', 'Yuto', 'Haruto', 'Sota', 'Yuki', 'Kento', 'Riku', 'Yamato', 'Takumi', 'Kenji'],
      girl: ['Yui', 'Aoi', 'Sakura', 'Yuka', 'Mika', 'Hina', 'Riko', 'Aki', 'Mai', 'Ema'],
      unisex: ['Riley', 'Avery', 'Jordan', 'Taylor', 'Morgan', 'Casey']
    },
    India: {
      boy: ['Arjun', 'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arnav', 'Advait', 'Pranav', 'Advaith', 'Aarush'],
      girl: ['Aanya', 'Pari', 'Myra', 'Aisha', 'Zara', 'Anaya', 'Diya', 'Kiara', 'Riya', 'Aria'],
      unisex: ['Riley', 'Avery', 'Jordan', 'Taylor', 'Morgan', 'Casey']
    },
    Other: {
      boy: ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Drew'],
      girl: ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Drew'],
      unisex: ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Drew']
    }
  };

  const getSuggestions = () => {
    const country = data.preferredCountry || 'Pakistan';
    const gender = data.babyGender || 'unspecified';
    
    if (gender === 'unspecified') {
      return nameSuggestions[country as keyof typeof nameSuggestions]?.unisex || nameSuggestions.Pakistan.unisex;
    }
    
    return nameSuggestions[country as keyof typeof nameSuggestions]?.[gender as 'boy' | 'girl'] || nameSuggestions.Pakistan[gender as 'boy' | 'girl'];
  };

  const handleNameSuggestion = (name: string) => {
    updateData('babyName', name);
    setShowSuggestions(false);
  };

  return (
    <div className="text-center space-y-6">
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-purple-400 rounded-full flex items-center justify-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
            <Star className="w-12 h-12 text-purple-400" />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-blue-900 mb-4">
          Mommy, what's my name?
        </h3>
        
        <div className="relative">
          <Input
            type="text"
            placeholder="Enter baby's name"
            value={data.babyName}
            onChange={(e) => updateData('babyName', e.target.value)}
            className="text-center text-2xl font-bold"
          />
          
          {data.preferredCountry && (
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 text-sm"
            >
              💡
            </button>
          )}
        </div>
        
        {showSuggestions && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              Popular {data.preferredCountry} names for {data.babyGender === 'boy' ? 'boys' : data.babyGender === 'girl' ? 'girls' : 'babies'}:
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {getSuggestions().slice(0, 9).map((name, index) => (
                <button
                  key={index}
                  onClick={() => handleNameSuggestion(name)}
                  className="px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <p className="text-sm text-gray-600 mt-2">
          We'll use this name for all our future communications.
        </p>
        
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">
            Mommy, where are you from?
          </h3>
          
          <RadioGroup
            value={data.preferredCountry}
            onValueChange={(value) => {
              updateData('preferredCountry', value);
              setShowSuggestions(false);
            }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="Pakistan" id="pakistan" />
              <Label htmlFor="pakistan" className="text-lg font-medium cursor-pointer">Pakistan</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="USA" id="usa" />
              <Label htmlFor="usa" className="text-lg font-medium cursor-pointer">USA</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="UK" id="uk" />
              <Label htmlFor="uk" className="text-lg font-medium cursor-pointer">UK</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="Canada" id="canada" />
              <Label htmlFor="canada" className="text-lg font-medium cursor-pointer">Canada</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="Australia" id="australia" />
              <Label htmlFor="australia" className="text-lg font-medium cursor-pointer">Australia</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="Germany" id="germany" />
              <Label htmlFor="germany" className="text-lg font-medium cursor-pointer">Germany</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="France" id="france" />
              <Label htmlFor="france" className="text-lg font-medium cursor-pointer">France</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="Japan" id="japan" />
              <Label htmlFor="japan" className="text-lg font-medium cursor-pointer">Japan</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="India" id="india" />
              <Label htmlFor="india" className="text-lg font-medium cursor-pointer">India</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="Other" id="other" />
              <Label htmlFor="other" className="text-lg font-medium cursor-pointer">Other</Label>
            </div>
          </RadioGroup>
          
          <div className="mt-4">
            <button
              onClick={skipStep}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 

// Step 9: User Role Step
function UserRoleStep({ data, updateData, skipStep }: { data: OnboardingData; updateData: (field: keyof OnboardingData, value: any) => void; skipStep: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
            <Users className="w-12 h-12 text-purple-400" />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-blue-900 mb-4">
          Who are you to the baby?
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          This helps us personalize your experience and provide relevant content.
        </p>
        
        <RadioGroup
          value={data.userRole}
          onValueChange={(value) => updateData('userRole', value)}
          className="space-y-4"
        >
          <div className="flex items-center space-x-3 p-4 border-2 border-pink-200 rounded-lg hover:bg-pink-50 cursor-pointer transition-colors">
            <RadioGroupItem value="mom" id="mom" />
            <div className="flex-1 text-left">
              <Label htmlFor="mom" className="text-lg font-medium cursor-pointer text-pink-800">Mom</Label>
              <p className="text-sm text-gray-600">I'm the pregnant person carrying the baby</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
            <RadioGroupItem value="father" id="father" />
            <div className="flex-1 text-left">
              <Label htmlFor="father" className="text-lg font-medium cursor-pointer text-blue-800">Father</Label>
              <p className="text-sm text-gray-600">I'm the father/supporting partner</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <RadioGroupItem value="singleMom" id="singleMom" />
            <div className="flex-1 text-left">
              <Label htmlFor="singleMom" className="text-lg font-medium cursor-pointer text-purple-800">Single Mom</Label>
              <p className="text-sm text-gray-600">I'm a single mother or solo parent</p>
            </div>
          </div>
        </RadioGroup>
        
        <div className="mt-6">
          <button
            onClick={skipStep}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
} 