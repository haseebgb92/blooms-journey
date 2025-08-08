'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, Shield, FileText, Check, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function AgreementPage() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedData, setAcceptedData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAgreement, setIsCheckingAgreement] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Check if user has already accepted agreement
  useEffect(() => {
    const checkAgreementStatus = async () => {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData.agreementAccepted) {
                // User has already accepted agreement, redirect to home
                router.push('/home');
                return;
              }
            }
          } else {
            // User not authenticated, redirect to login
            router.push('/login');
            return;
          }
          setIsCheckingAgreement(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error checking agreement status:', error);
        setIsCheckingAgreement(false);
      }
    };

    checkAgreementStatus();
  }, [router]);

  const handleAcceptAll = () => {
    setAcceptedTerms(true);
    setAcceptedPrivacy(true);
    setAcceptedData(true);
  };

  const handleContinue = async () => {
    if (!acceptedTerms || !acceptedPrivacy || !acceptedData) {
      toast({
        title: "Agreement Required",
        description: "Please accept all terms to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Store agreement acceptance in Firebase
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        agreementAccepted: true,
        agreementAcceptedAt: Timestamp.now(),
        agreementVersion: '1.0'
      }, { merge: true });

      // Also store in localStorage as backup
      localStorage.setItem('agreementAccepted', 'true');
      
      toast({
        title: "Welcome to Bloom Journey!",
        description: "Your pregnancy journey starts now.",
      });
      
      // Redirect to home page
      router.push('/home');
    } catch (error) {
      console.error('Error saving agreement:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking agreement status
  if (isCheckingAgreement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl bg-white/90 backdrop-blur-sm">
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
          <CardTitle className="text-3xl font-bold text-blue-900">Welcome to Bloom Journey</CardTitle>
          <CardDescription className="text-lg text-blue-700">
            Before we begin your pregnancy journey, please review and accept our terms
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Accept All Button */}
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={handleAcceptAll}
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              <Check className="mr-2 h-4 w-4" />
              Accept All Terms
            </Button>
          </div>

          {/* Agreement Sections */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              />
              <div className="space-y-2">
                <Label htmlFor="terms" className="text-base font-semibold flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Terms of Service</span>
                </Label>
                <p className="text-sm text-gray-600">
                  I agree to the Terms of Service and understand that Bloom Journey provides pregnancy tracking and educational content. I acknowledge that this app is not a substitute for professional medical advice.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="privacy"
                checked={acceptedPrivacy}
                onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
              />
              <div className="space-y-2">
                <Label htmlFor="privacy" className="text-base font-semibold flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>Privacy Policy</span>
                </Label>
                <p className="text-sm text-gray-600">
                  I agree to the Privacy Policy and understand how my personal data will be collected, used, and protected. I consent to receiving personalized content and notifications.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="data"
                checked={acceptedData}
                onCheckedChange={(checked) => setAcceptedData(checked as boolean)}
              />
              <div className="space-y-2">
                <Label htmlFor="data" className="text-base font-semibold flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  <span>Data Usage & Personalization</span>
                </Label>
                <p className="text-sm text-gray-600">
                  I consent to Bloom Journey using my pregnancy data to provide personalized content, tracking, and recommendations. I understand this data helps improve my experience and app features.
                </p>
              </div>
            </div>
          </div>

          {/* Key Features Preview */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 text-center">
              What you'll get with Bloom Journey:
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm">Personalized pregnancy tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm">Daily baby development updates</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm">Expert health advice</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm">Partner connection features</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm">Journal and milestone tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm">Community support</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/login')}
              className="flex-1"
            >
              Back to Login
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!acceptedTerms || !acceptedPrivacy || !acceptedData || isLoading}
              className="flex-1 bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500"
            >
              {isLoading ? 'Setting up...' : (
                <>
                  Start My Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 