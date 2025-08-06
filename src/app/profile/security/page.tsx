
'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase/clientApp";
import { onAuthStateChanged, User, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export default function SecurityPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleChangePassword = async () => {
        if (!user || !currentPassword || !newPassword) {
            toast({
                title: "Error",
                description: "Please fill in both password fields.",
                variant: "destructive",
            });
            return;
        }

        setIsChangingPassword(true);
        try {
            if (user.email) {
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                // Re-authenticate the user to confirm their identity
                await reauthenticateWithCredential(user, credential);
                
                // Now update the password
                await updatePassword(user, newPassword);

                toast({
                    title: "Password Changed",
                    description: "Your password has been updated successfully.",
                });
                setCurrentPassword("");
                setNewPassword("");
            } else {
                 toast({
                    title: "Error",
                    description: "Could not find user email to re-authenticate.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error(error);
             toast({
                title: "Error Changing Password",
                description: "Your current password may be incorrect. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleTwoFactorToggle = (enabled: boolean) => {
        setIsTwoFactorEnabled(enabled);
        toast({
            title: "Two-Factor Authentication",
            description: "Full two-factor authentication requires backend setup and is not yet implemented.",
        });
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

  return (
    <div className="bg-muted/40 min-h-screen animate-fade-in-up">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Settings
                </Link>
            </div>
            <header className="mb-8 flex items-center gap-3">
                <ShieldCheck className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="text-4xl font-headline text-primary">Privacy & Security</h1>
                    <p className="text-muted-foreground">Manage your password and account security settings.</p>
                </div>
            </header>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Login & Password</CardTitle>
                        <CardDescription>Update your password and associated login email.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={user?.email || ''} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={isChangingPassword} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isChangingPassword} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                            {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isChangingPassword ? "Changing..." : "Change Password"}
                        </Button>
                    </CardFooter>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Two-Step Verification</CardTitle>
                        <CardDescription>Add an extra layer of security to your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                           <p className="text-sm font-medium">Enable Two-Step Verification</p>
                            <Switch
                                checked={isTwoFactorEnabled}
                                onCheckedChange={handleTwoFactorToggle}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    </div>
  );
}
