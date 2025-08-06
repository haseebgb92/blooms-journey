
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { auth, googleProvider, appleProvider, sendBrandedPasswordResetEmail } from '@/lib/firebase/clientApp';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { AppleIcon, GoogleIcon } from '@/components/ui/icons';
import Image from 'next/image';

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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<null | 'google' | 'apple'>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSocialSignIn = async (provider: 'google' | 'apple') => {
    setIsSocialLoading(provider);
    const authProvider = provider === 'google' ? googleProvider : appleProvider;
    try {
      await signInWithPopup(auth, authProvider);
      toast({
        title: "Signed In Successfully",
        description: "Welcome back!",
      });
      router.push('/home');
    } catch (error: any) {
      let errorMessage = "Unable to sign in. Please try again.";
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign in was cancelled. Please try again.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Pop-up was blocked. Please allow pop-ups and try again.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "An account already exists with this email using a different sign-in method.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSocialLoading(null);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Signed In Successfully",
        description: "Welcome back!",
      });
      router.push('/home');
    } catch (error: any) {
      let errorMessage = "Unable to sign in. Please check your credentials and try again.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email. Please check your email or create a new account.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled. Please contact support.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive",
      });
      return;
    }
    try {
      await sendBrandedPasswordResetEmail(email);
      
      // Mask the email for display
      const maskEmail = (email: string) => {
        const [localPart, domain] = email.split('@');
        if (localPart.length <= 2) return email;
        const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
        return `${maskedLocal}@${domain}`;
      };
      
      const maskedEmail = maskEmail(email);
      
      toast({
        title: "Password Reset Email Sent",
        description: `Check your inbox at ${maskedEmail} for a link to reset your password.`,
      });
    } catch (error: any) {
      let errorMessage = "Unable to send reset email. Please try again.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many requests. Please try again later.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
       <Card className="w-full max-w-md shadow-2xl animate-fade-in-down">
            <CardHeader className="text-center">
                <BloomJourneyLogo />
                <CardTitle className="text-3xl font-headline text-primary">Welcome Back</CardTitle>
                <CardDescription>Sign in to continue your Bloom Journey</CardDescription>
            </CardHeader>
            <CardContent className="px-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <Button variant="outline" onClick={() => handleSocialSignIn('google')} disabled={!!isSocialLoading}>
                        {isSocialLoading === 'google' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5" />}
                        Google
                    </Button>
                    <Button variant="outline" onClick={() => handleSocialSignIn('apple')} disabled={!!isSocialLoading}>
                        {isSocialLoading === 'apple' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <AppleIcon className="mr-2 h-5 w-5" />}
                        Apple
                    </Button>
                </div>
                <div className="flex items-center mb-4">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="mx-4 text-xs uppercase text-muted-foreground">OR</span>
                    <div className="flex-grow border-t border-muted"></div>
                </div>
                <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email or Phone Number</Label>
                        <Input
                            id="email"
                            type="text"
                            placeholder="you@example.com or phone number"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={!!isSocialLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                             <button type="button" onClick={handleForgotPassword} className="text-xs text-primary hover:underline">
                                Forgot Password?
                            </button>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={!!isSocialLoading}
                                className="pr-10"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-primary"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                            </button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || !!isSocialLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <p className="text-sm text-center text-muted-foreground">
                    Don't have an account? <Link href="/signup" className="text-primary hover:underline">Sign Up</Link>
                </p>
            </CardFooter>
        </Card>
    </div>
  );
}
