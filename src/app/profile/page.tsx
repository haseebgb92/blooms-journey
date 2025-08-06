
'use client';
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Heart, FileText, Shield, Loader2, UserCircle, Lock, Bell, Briefcase, UserPlus, QrCode, Palette, Sun, Moon, Laptop, ChevronDown, LogOut, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { auth, firestore } from "@/lib/firebase/clientApp";
import { onAuthStateChanged, User, signOut, updateProfile as updateAuthProfile } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useTheme } from "next-themes";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import QRCode from "qrcode.react";
import { sendPartnerInvitation } from "@/ai/flows/sendPartnerInvitation";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("mother");
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedGender, setEditedGender] = useState("mother");

  const [partnerEmail, setPartnerEmail] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('Current theme:', theme);
  }, [theme]);

  useEffect(() => {
    let unsubscribeSnapshot: () => void = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setEditedEmail(currentUser.email || "");
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setName(data.displayName || currentUser.displayName || "");
            setEmail(data.email || currentUser.email || "");
            setEditedName(data.displayName || currentUser.displayName || "");
            setGender(data.gender || "mother");
            setEditedGender(data.gender || "mother");
          } else {
            setName(currentUser.displayName || "");
            setEmail(currentUser.email || "");
            setEditedName(currentUser.displayName || "");
            setGender("mother");
            setEditedGender("mother");
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Error fetching user data:", error);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('authenticated');
    }
    router.push('/');
  };
  
  const handleSendInvitation = async () => {
    if (!user || !partnerEmail) return;
    setIsSendingInvite(true);
    try {
        const result = await sendPartnerInvitation({
            partnerEmail: partnerEmail,
            userName: name,
            userEmail: email
        });
        toast({
            title: "Invitation Sent!",
            description: result.message
        });
        setPartnerEmail('');
        setIsPartnerModalOpen(false);
    } catch(error) {
        toast({
            title: "Error",
            description: "Could not send invitation. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsSendingInvite(false);
    }
  }

  const handleScanQrCode = () => {
    toast({
        title: "Coming Soon!",
        description: "The ability to scan a QR code to connect with your partner is on its way."
    });
  }

  const handleSaveChanges = async () => {
    if (auth.currentUser) {
      try {
        await updateAuthProfile(auth.currentUser, { displayName: editedName });
        const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, { 
          displayName: editedName,
          gender: editedGender 
        }, { merge: true });
        
        setName(editedName);
        setGender(editedGender);
        setIsEditModalOpen(false);
        toast({
            title: "Profile Updated",
            description: "Your changes have been saved successfully.",
        });
      } catch (error: any) {
         toast({
            title: "Error Updating Profile",
            description: error.message,
            variant: "destructive",
        });
      }
    }
  };

  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return 'U';
    const nameParts = name.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return 'U';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return nameParts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
  }

  const connectionUrl = user && typeof window !== 'undefined' ? `${window.location.origin}/connect?partnerId=${user.uid}` : '';
  
  if (!mounted || isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
  }

  return (
    <div className="bg-muted/40 min-h-screen md:animate-fade-in-up animate-fade-in-mobile">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
            <h1 className="text-4xl font-headline text-primary">Settings</h1>
        </header>

        <div className="space-y-8">
            <Card className="shadow-sm">
                <CardContent className="p-2">
                    <div className="flex items-center gap-4 p-3">
                        <div className="relative">
                            <Avatar className="w-16 h-16 border-2 border-primary bg-primary/10">
                                <AvatarFallback className="text-xl font-semibold text-primary">
                                    {getInitials(name)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1">
                            <p className="text-xl font-bold">{name}</p>
                            <p className="text-muted-foreground">{email}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsPartnerModalOpen(true)}>
                            <UserPlus className="h-6 w-6" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-headline">Account</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                    <ul className="space-y-1">
                        <ListItem icon={UserCircle} text="Edit Profile" onClick={() => setIsEditModalOpen(true)} />
                        <ListItem icon={Lock} text="Privacy & Security" href="/profile/security" />
                        <ListItem icon={Bell} text="Notifications" href="/profile/notifications" />
                        <ListItem icon={Palette} text="Appearance" isOpen={isAppearanceOpen} onClick={() => setIsAppearanceOpen(!isAppearanceOpen)}>
                           <div className="w-full pl-12 pr-4 pb-4 pt-2">
                                <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Label htmlFor="light" className="border rounded-md p-3 text-center cursor-pointer hover:bg-accent has-[input:checked]:bg-accent has-[input:checked]:border-primary">
                                        <Sun className="mx-auto mb-2 h-5 w-5"/>
                                        Light
                                        <RadioGroupItem value="light" id="light" className="sr-only" />
                                    </Label>
                                    <Label htmlFor="dark" className="border rounded-md p-3 text-center cursor-pointer hover:bg-accent has-[input:checked]:bg-accent has-[input:checked]:border-primary">
                                        <Moon className="mx-auto mb-2 h-5 w-5"/>
                                        Dark
                                        <RadioGroupItem value="dark" id="dark" className="sr-only" />
                                    </Label>
                                    <Label htmlFor="system" className="border rounded-md p-3 text-center cursor-pointer hover:bg-accent has-[input:checked]:bg-accent has-[input:checked]:border-primary">
                                        <Laptop className="mx-auto mb-2 h-5 w-5"/>
                                        System
                                        <RadioGroupItem value="system" id="system" className="sr-only" />
                                    </Label>
                                </RadioGroup>
                            </div>
                        </ListItem>
                        <ListItem icon={Briefcase} text="Manage Plan" comingSoon={true} />
                    </ul>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                 <CardHeader>
                    <CardTitle className="text-lg font-headline">Partner & Legal</CardTitle>
                </CardHeader>
                 <CardContent className="p-2">
                    <ul className="space-y-1">
                        <ListItem icon={Heart} text="Partner Connection" comingSoon={true} />
                        <ListItem icon={FileText} text="Terms of Service" href="/terms" />
                        <ListItem icon={Shield} text="Privacy Policy" href="/privacy" />
                    </ul>
                </CardContent>
            </Card>

            <Button variant="outline" onClick={handleLogout} className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
            </Button>

        </div>
      </div>
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <CardDescription>Make changes to your profile here. Click save when you're done.</CardDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={editedEmail} disabled />
                     <p className="text-xs text-muted-foreground pt-1">To change your email, please contact support.</p>
                </div>
                <div className="space-y-2">
                    <Label>I am a...</Label>
                    <RadioGroup value={editedGender} onValueChange={setEditedGender} className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="mother" id="edit-mother" />
                            <Label htmlFor="edit-mother">Mother (Pregnant Person)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="partner" id="edit-partner" />
                            <Label htmlFor="edit-partner">Partner/Support Person</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isPartnerModalOpen} onOpenChange={setIsPartnerModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Connect with your Partner</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center pt-4 gap-4">
                 <DialogDescription>Have your partner scan this QR code to link your journeys together.</DialogDescription>
                {user && connectionUrl ? (
                    <div className="p-4 bg-white rounded-lg">
                         <QRCode value={connectionUrl} size={200} level="H" />
                    </div>
                ): (
                    <p>Please log in to generate your connection code.</p>
                )}
                 <Button variant="outline" onClick={handleScanQrCode} className="w-full">
                    <Mail className="mr-2 h-4 w-4"/>
                    Scan Your Partner's Code
                </Button>
            </div>
            <div className="flex items-center my-4">
                <div className="flex-grow border-t border-muted"></div>
                <span className="mx-4 text-xs uppercase text-muted-foreground">OR</span>
                <div className="flex-grow border-t border-muted"></div>
            </div>
            <div className="space-y-4">
                 <DialogDescription>Send an email invitation instead.</DialogDescription>
                 <div className="flex gap-2">
                    <Input 
                        placeholder="Partner's email address"
                        type="email"
                        value={partnerEmail}
                        onChange={(e) => setPartnerEmail(e.target.value)}
                        disabled={isSendingInvite}
                    />
                     <Button onClick={handleSendInvitation} disabled={isSendingInvite || !partnerEmail}>
                        {isSendingInvite ? <Loader2 className="h-4 w-4 animate-spin"/> : <Mail className="h-4 w-4"/>}
                        <span className="sr-only">Send</span>
                    </Button>
                 </div>
            </div>
            <DialogFooter className="mt-4">
                <DialogClose asChild>
                    <Button className="w-full">Done</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ListItem({ icon: Icon, text, href, onClick, children, isOpen, comingSoon }: { icon: React.ElementType, text: string, href?: string, onClick?: () => void, children?: React.ReactNode, isOpen?: boolean, comingSoon?: boolean }) {
  const content = (
      <div className="flex items-center justify-between p-3 w-full">
          <div className="flex items-center gap-4">
              <Icon className={`h-6 w-6 ${comingSoon ? 'text-muted-foreground/50' : 'text-muted-foreground'}`} />
              <span className={comingSoon ? 'text-muted-foreground/70' : ''}>{text}</span>
          </div>
          <div className="flex items-center gap-2">
              {comingSoon && (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Coming Soon</span>
              )}
              {typeof isOpen !== 'undefined' ? (
                  isOpen ? <ChevronDown className="h-5 w-5 text-muted-foreground/50" /> : <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
              ) : (
                 !children && !comingSoon && <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
              )}
          </div>
      </div>
  );
  
  const clickableContent = (
    <>
      {content}
      {isOpen && children}
    </>
  );

  const commonClasses = `flex flex-col w-full rounded-lg transition-colors text-left ${comingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:bg-muted cursor-pointer'}`;

  if (href && !comingSoon) {
    return (
      <li>
        <Link href={href} className={commonClasses}>
          {clickableContent}
        </Link>
      </li>
    )
  }

  return (
    <li>
        <div onClick={comingSoon ? undefined : onClick} className={commonClasses}>
            {clickableContent}
        </div>
    </li>
  )
}
