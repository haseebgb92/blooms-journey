
'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, MessageCircle, Music, Smartphone, GlassWater, CalendarDays, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { auth, firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export default function NotificationsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);

    const [chatNotifications, setChatNotifications] = useState(true);
    const [reminderSms, setReminderSms] = useState(false);
    const [waterReminders, setWaterReminders] = useState(true);
    const [appointmentReminders, setAppointmentReminders] = useState(true);
    const [muteDuration, setMuteDuration] = useState("off");

    useEffect(() => {
        let unsubscribeSnapshot: () => void = () => {};
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                const userDocRef = doc(firestore, 'users', user.uid);
                // Use onSnapshot to listen for real-time updates
                unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const settings = docSnap.data().notificationSettings;
                        if (settings) {
                            setChatNotifications(settings.chatNotifications ?? true);
                            setReminderSms(settings.reminderSms ?? false);
                            setWaterReminders(settings.waterReminders ?? true);
                            setAppointmentReminders(settings.appointmentReminders ?? true);
                            setMuteDuration(settings.muteDuration ?? "off");
                        }
                    }
                    setIsLoading(false);
                }, (error) => {
                    console.error("Error fetching notification settings:", error);
                    setIsLoading(false);
                });
            } else {
                setIsLoading(false);
                // If user logs out, stop listening
                if (unsubscribeSnapshot) unsubscribeSnapshot();
            }
        });
        
        // Cleanup function
        return () => {
            unsubscribe();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []);

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) {
            toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }

        const settings = {
            chatNotifications,
            reminderSms,
            waterReminders,
            appointmentReminders,
            muteDuration
        };
        
        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            await setDoc(userDocRef, { notificationSettings: settings }, { merge: true });
            toast({
                title: "Settings Saved",
                description: "Your notification preferences have been updated.",
            });
        } catch (error) {
             toast({
                title: "Error",
                description: "Could not save settings.",
                variant: "destructive",
            });
        }
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
                <Bell className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="text-4xl font-headline text-primary">Notifications</h1>
                    <p className="text-muted-foreground">Manage how you receive alerts from Bloom Journey.</p>
                </div>
            </header>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>General Notifications</CardTitle>
                        <CardDescription>Select which notifications you want to receive.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                           <div className="flex items-center gap-3">
                                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                                <Label htmlFor="chat-notifications" className="text-base">Chat Notifications</Label>
                           </div>
                            <Switch
                                id="chat-notifications"
                                checked={chatNotifications}
                                onCheckedChange={setChatNotifications}
                            />
                        </div>
                         <div className="flex items-center justify-between p-4 border rounded-lg">
                           <div className="flex items-center gap-3">
                                <Smartphone className="h-5 w-5 text-muted-foreground" />
                                <Label htmlFor="reminder-sms" className="text-base">Reminder SMS</Label>
                           </div>
                            <Switch
                                id="reminder-sms"
                                checked={reminderSms}
                                onCheckedChange={setReminderSms}
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                           <div className="flex items-center gap-3">
                                <GlassWater className="h-5 w-5 text-muted-foreground" />
                                <Label htmlFor="water-reminders" className="text-base">Water Intake Reminders</Label>
                           </div>
                            <Switch
                                id="water-reminders"
                                checked={waterReminders}
                                onCheckedChange={setWaterReminders}
                            />
                        </div>
                         <div className="flex items-center justify-between p-4 border rounded-lg">
                           <div className="flex items-center gap-3">
                                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                <Label htmlFor="appointment-reminders" className="text-base">Appointment Reminders</Label>
                           </div>
                            <Switch
                                id="appointment-reminders"
                                checked={appointmentReminders}
                                onCheckedChange={setAppointmentReminders}
                            />
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Tones</CardTitle>
                        <CardDescription>Choose the sounds for your notifications.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Music className="h-5 w-5 text-muted-foreground" />
                                <p className="text-base font-medium">App Ringtone</p>
                            </div>
                            <p className="text-sm text-muted-foreground">Default</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Mute Notifications</CardTitle>
                        <CardDescription>Temporarily or permanently disable all alerts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={muteDuration} onValueChange={setMuteDuration} className="space-y-2">
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="off" id="off" />
                                <Label htmlFor="off">Don't Mute</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="temp" id="temp" />
                                <Label htmlFor="temp">Mute Until I Change It</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="always" id="always" />
                                <Label htmlFor="always">Always Mute</Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSave}>Save Preferences</Button>
                </div>
            </div>

        </div>
    </div>
  );
}
