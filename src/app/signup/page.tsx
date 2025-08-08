
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { auth, googleProvider, appleProvider, firestore, doc, setDoc, Timestamp } from '@/lib/firebase/clientApp';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, UserCredential } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { GoogleIcon, AppleIcon } from '@/components/ui/icons';
import { ArrowRight } from 'lucide-react';
import { appDataService } from '@/lib/appDataService';

// Bloom Journey Logo Component
function BloomJourneyLogo() {
  return (
    <div className="flex flex-col items-center mb-0">
      {/* Logo Image */}
      <div className="relative w-28 h-28 mb-2">
        <Image
          src="/images/icon.png"
          alt="Bloom Journey Logo"
          width={112}
          height={112}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

const createInitialUserData = async (user: any, name?: string, gender?: string, onboardingData?: any) => {
    const userDocRef = doc(firestore, 'users', user.uid);
    
    // Use onboarding data if available, otherwise use defaults
    const dueDate = onboardingData?.dueDate ? new Date(onboardingData.dueDate) : new Date();
    if (!onboardingData?.dueDate) {
        dueDate.setDate(dueDate.getDate() + 180); // Default to ~6 months from now
    }
    
    // Calculate current week based on due date
    const today = new Date();
    const weeksDiff = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const currentWeek = Math.max(1, 40 - weeksDiff);
    
    const userData: any = {
        displayName: name || user.displayName || 'New User',
        email: user.email,
        gender: gender || 'mother',
        createdAt: Timestamp.now(),
        dueDate: Timestamp.fromDate(dueDate),
        currentWeek: currentWeek,
        timelineWeek: currentWeek,
    };

    // Add onboarding data if available
    if (onboardingData) {
      userData.lastPeriodDate = onboardingData.lastPeriodDate ? Timestamp.fromDate(new Date(onboardingData.lastPeriodDate)) : null;
      userData.babyCount = onboardingData.babyCount || 'single';
      userData.notificationTime = onboardingData.notificationTime || '09:00';
      userData.babyGender = onboardingData.babyGender || 'unspecified';
      userData.skinTone = onboardingData.skinTone || 'unspecified';
      userData.momBirthDate = onboardingData.momBirthDate ? Timestamp.fromDate(new Date(onboardingData.momBirthDate)) : null;
      userData.babyName = onboardingData.babyName || '';
      userData.preferredCountry = onboardingData.preferredCountry || 'Pakistan';
      userData.userRole = onboardingData.userRole || 'mom';
    }
    
    await setDoc(userDocRef, userData, { merge: true });

    // Add initial appointment
    const appointmentsRef = doc(firestore, 'users', user.uid, 'appointments', 'initial-appointment');
    await setDoc(appointmentsRef, {
        title: 'First Doctor\'s Visit',
        date: Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() + 7))),
        notes: 'Discuss pregnancy plan and ask questions.'
    });

    // Add initial journal entry
    const journalRef = doc(firestore, 'users', user.uid, 'journalEntries', 'initial-journal');
    await setDoc(journalRef, {
        text: 'Started my Bloom Journey today! Feeling excited for what\'s to come.',
        date: Timestamp.now(),
    });
};

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('mother');
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<null | 'google' | 'apple'>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleSuccessfulSignup = async (result: UserCredential, name?: string, gender?: string) => {
    // Get onboarding data from localStorage if available
    const onboardingDataStr = localStorage.getItem('onboardingData');
    let onboardingData = null;
    
    if (onboardingDataStr) {
      try {
        onboardingData = JSON.parse(onboardingDataStr);
        // Clear the data from localStorage after using it
        localStorage.removeItem('onboardingData');
      } catch (error) {
        console.error('Error parsing onboarding data:', error);
      }
    }
    
    await createInitialUserData(result.user, name, gender, onboardingData);
    
    // Initialize app data service with user data
    try {
      const dueDate = onboardingData?.dueDate ? new Date(onboardingData.dueDate) : new Date();
      if (!onboardingData?.dueDate) {
        dueDate.setDate(dueDate.getDate() + 180);
      }
      
      const today = new Date();
      const weeksDiff = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7));
      const currentWeek = Math.max(1, 40 - weeksDiff);
      
      await appDataService.initializeUserData({
        displayName: name || result.user.displayName || 'New User',
        email: result.user.email || '',
        gender: gender || 'mother',
        dueDate: dueDate,
        currentWeek: currentWeek,
        timelineWeek: currentWeek,
        lastPeriodDate: onboardingData?.lastPeriodDate ? new Date(onboardingData.lastPeriodDate) : null,
        babyCount: onboardingData?.babyCount || 'single',
        notificationTime: onboardingData?.notificationTime || '09:00',
        babyGender: onboardingData?.babyGender || 'unspecified',
        skinTone: onboardingData?.skinTone || 'unspecified',
        momBirthDate: onboardingData?.momBirthDate ? new Date(onboardingData.momBirthDate) : null,
        babyName: onboardingData?.babyName || '',
        preferredCountry: onboardingData?.preferredCountry || 'Pakistan',
        userRole: onboardingData?.userRole || 'mom',
        lastLogin: new Date()
      });
      
      // Track signup activity
      await appDataService.trackActivity({
        action: 'user_signup',
        page: 'signup',
        data: { method: 'email', hasOnboardingData: !!onboardingData }
      });
    } catch (error) {
      console.error('Error initializing app data service:', error);
    }
    
    toast({
      title: "Account Created!",
      description: "Welcome to Bloom Journey.",
    });
    router.push('/agreement');
  };

  const handleSocialSignup = async (provider: 'google' | 'apple') => {
    setIsSocialLoading(provider);
    const authProvider = provider === 'google' ? googleProvider : appleProvider;
    
    try {
      console.log(`Attempting ${provider} sign-up...`);
      const result = await signInWithPopup(auth, authProvider);
      console.log(`${provider} sign-up successful:`, result.user.email);
      
      // For social signups, we'll default to mother but allow them to change it in profile
      await handleSuccessfulSignup(result, undefined, 'mother');
    } catch (error: any) {
      console.error(`${provider} sign-up error:`, error);
      let errorMessage = "Unable to create account. Please try again.";
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign up was cancelled. Please try again.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Pop-up was blocked. Please allow pop-ups and try again.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "An account already exists with this email using a different sign-in method.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for Google sign-in. Please contact support.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Google sign-in is not enabled. Please contact support.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Sign up was cancelled. Please try again.";
      }
      
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSocialLoading(null);
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({
        title: "Error",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Your password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      await handleSuccessfulSignup(userCredential, name, gender);
    } catch (error: any) {
      let errorMessage = "Unable to create account. Please try again.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many requests. Please try again later.";
      }
      
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 px-4">
      {/* Back to Home Link */}
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back to Home</span>
        </Link>
      </div>
      
      <Card className="w-full max-w-md shadow-2xl animate-fade-in-down bg-white/90 backdrop-blur-sm border-0">
        <CardHeader className="text-center">
            <BloomJourneyLogo />
            <CardTitle className="text-3xl font-headline text-primary">Create Your Account</CardTitle>
            <CardDescription>Join Bloom Journey to track your pregnancy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4">
             <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleSocialSignup('google')} disabled={!!isSocialLoading}>
                  {isSocialLoading === 'google' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5" />} 
                  Google
                </Button>
                <Button variant="outline" onClick={() => handleSocialSignup('apple')} disabled={!!isSocialLoading}>
                   {isSocialLoading === 'apple' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <AppleIcon className="mr-2 h-5 w-5" />}
                   Apple
                </Button>
            </div>
            <div className="flex items-center">
                <div className="flex-grow border-t border-muted"></div>
                <span className="mx-4 text-xs uppercase text-muted-foreground">OR</span>
                <div className="flex-grow border-t border-muted"></div>
            </div>
            <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={!!isSocialLoading}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={!!isSocialLoading}
                />
                </div>
                <div className="space-y-2">
                <Label>I am a...</Label>
                <RadioGroup value={gender} onValueChange={setGender} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mother" id="mother" />
                        <Label htmlFor="mother">Mother (Pregnant Person)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="partner" id="partner" />
                        <Label htmlFor="partner">Partner/Support Person</Label>
                    </div>
                </RadioGroup>
                </div>
                <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={!!isSocialLoading}
                />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || !!isSocialLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                </Button>
            </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <p className="text-sm text-center text-muted-foreground">
                Already have an account? <Link href="/login" className="text-primary hover:underline">Sign In</Link>
            </p>
            <p className="text-sm text-center text-muted-foreground">
                Want to set up your pregnancy data first? <Link href="/onboarding" className="text-primary hover:underline">Start Onboarding</Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
