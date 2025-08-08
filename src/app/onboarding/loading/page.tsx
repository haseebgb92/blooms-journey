'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';
import OnboardingNotification from '@/components/bloom-journey/OnboardingNotification';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function OnboardingLoadingPage() {
  const [progress, setProgress] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Simulate progress loading
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Show notification after completion
          setTimeout(() => {
            setShowNotification(true);
          }, 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center p-4">
      {/* Back to Home Link */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg">
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back to Home</span>
        </Link>
      </div>
      
      <Card className="w-full max-w-md shadow-2xl text-center">
        <CardContent className="p-8 space-y-8">
          {/* Logo and Title */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <Image
                src="/images/icon.png"
                alt="Hi Mommy Logo"
                width={80}
                height={80}
                className="rounded-full"
              />
            </div>
            <h1 className="text-4xl font-bold text-pink-400">
              Hi Mommy
            </h1>
            <p className="text-lg text-blue-900 font-medium">
              2x the support – HiMommy cares for you and your little one from the first plans to the third birthday.
            </p>
          </div>

          {/* Central Illustration */}
          <div className="relative w-48 h-48 mx-auto">
            <div className="absolute inset-0 bg-blue-200 rounded-full flex items-center justify-center">
              <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center relative">
                {/* Cooking pot */}
                <div className="absolute bottom-4 w-16 h-12 bg-red-500 rounded-b-full"></div>
                
                {/* Food items falling into pot */}
                <div className="absolute top-2 left-4 w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="absolute top-4 right-6 w-2 h-2 bg-red-400 rounded-full"></div>
                <div className="absolute top-6 left-8 w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="absolute top-8 right-4 w-3 h-3 bg-green-600 rounded-full"></div>
                
                {/* Care icons */}
                <div className="absolute top-2 right-2 w-4 h-4 bg-blue-400 rounded-full"></div>
                <div className="absolute top-6 left-2 w-3 h-3 bg-pink-400 rounded-full"></div>
                <div className="absolute top-10 right-2 w-2 h-2 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Loading Message */}
          <div className="space-y-4">
            <p className="text-lg text-blue-900 font-medium">
              We are currently creating a plan based on your data...
            </p>
            
            {/* Progress Bar */}
            <div className="w-full">
              <Progress value={progress} className="h-2" />
            </div>
            
            <p className="text-sm text-gray-600">
              {progress}% Complete
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Notification Popup */}
      {showNotification && (
        <OnboardingNotification
          onAllow={() => {
            setShowNotification(false);
            router.push('/signup');
          }}
          onDismiss={() => {
            setShowNotification(false);
            router.push('/signup');
          }}
        />
      )}
    </div>
  );
} 