
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { auth, googleProvider, appleProvider, firestore, doc, setDoc, Timestamp } from '@/lib/firebase/clientApp';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, UserCredential } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { GoogleIcon, AppleIcon } from '@/components/ui/icons';


const createInitialUserData = async (user: any, name?: string) => {
    const userDocRef = doc(firestore, 'users', user.uid);
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 180); // Default to ~6 months from now
    
    await setDoc(userDocRef, {
        displayName: name || user.displayName || 'New User',
        email: user.email,
        createdAt: Timestamp.now(),
        dueDate: Timestamp.fromDate(defaultDueDate),
        currentWeek: 12,
        timelineWeek: 12,
    }, { merge: true });

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<null | 'google' | 'apple'>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleSuccessfulSignup = async (result: UserCredential, name?: string) => {
    await createInitialUserData(result.user, name);
    toast({
      title: "Account Created!",
      description: "Welcome to Bloom Journey.",
    });
    router.push('/home');
  };

  const handleSocialSignup = async (provider: 'google' | 'apple') => {
    setIsSocialLoading(provider);
    const authProvider = provider === 'google' ? googleProvider : appleProvider;
    try {
      const result = await signInWithPopup(auth, authProvider);
      await handleSuccessfulSignup(result);
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
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
      await handleSuccessfulSignup(userCredential, name);
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-2xl animate-fade-in-down">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline text-primary">Create Your Account</CardTitle>
            <CardDescription>Join Bloom Journey to track your pregnancy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardFooter>
      </Card>
    </div>
  );
}
