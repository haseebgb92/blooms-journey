
'use client';
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Heart, FileText, Shield, Loader2, UserCircle, Lock, Bell, Briefcase, UserPlus, QrCode, Palette, Sun, Moon, Laptop, ChevronDown, LogOut, Mail, Info, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { auth, firestore } from "@/lib/firebase/clientApp";
import { onAuthStateChanged, User, signOut, updateProfile as updateAuthProfile } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { useTheme } from "next-themes";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import QRCode from "qrcode.react";
import { sendPartnerInvitation } from "@/ai/flows/sendPartnerInvitation";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";


export default function ProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("mother");
  const [skinTone, setSkinTone] = useState("unspecified");
  const [momBirthDate, setMomBirthDate] = useState<Date | null>(null);
  const [babyName, setBabyName] = useState("");
  const [preferredCountry, setPreferredCountry] = useState("Pakistan");
  const [userRole, setUserRole] = useState("mom");
  
  // Additional onboarding data fields
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | null>(null);
  const [babyCount, setBabyCount] = useState("single");
  const [notificationTime, setNotificationTime] = useState("09:00");
  const [babyGender, setBabyGender] = useState("unspecified");
  const [currentWeek, setCurrentWeek] = useState(1);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedGender, setEditedGender] = useState("mother");
  const [editedSkinTone, setEditedSkinTone] = useState("unspecified");
  const [editedMomBirthDate, setEditedMomBirthDate] = useState<Date | null>(null);
  const [editedBabyName, setEditedBabyName] = useState("");
  const [editedPreferredCountry, setEditedPreferredCountry] = useState("Pakistan");
  const [editedUserRole, setEditedUserRole] = useState("mom");

  const [partnerEmail, setPartnerEmail] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(false);
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  const [isPregnancyProgressOpen, setIsPregnancyProgressOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('Current theme:', theme);
  }, [theme]);

  useEffect(() => {
    let unsubscribeSnapshot: () => void = () => {};
    let unsubscribeAuth: (() => void) | undefined;

    const fetchUserData = async () => {
      try {
        unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
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
                setSkinTone(data.skinTone || "unspecified");
                setEditedSkinTone(data.skinTone || "unspecified");
                setMomBirthDate(data.momBirthDate ? new Date(data.momBirthDate) : null);
                setEditedMomBirthDate(data.momBirthDate ? new Date(data.momBirthDate) : null);
                setBabyName(data.babyName || "");
                setEditedBabyName(data.babyName || "");
                setPreferredCountry(data.preferredCountry || "Pakistan");
                setEditedPreferredCountry(data.preferredCountry || "Pakistan");
                setUserRole(data.userRole || "mom");
                setEditedUserRole(data.userRole || "mom");
                
                // Additional onboarding data
                setDueDate(data.dueDate ? new Date(data.dueDate) : null);
                setLastPeriodDate(data.lastPeriodDate ? new Date(data.lastPeriodDate) : null);
                setBabyCount(data.babyCount || "single");
                setNotificationTime(data.notificationTime || "09:00");
                setBabyGender(data.babyGender || "unspecified");
                setCurrentWeek(data.currentWeek || 1);
              } else {
                setName(currentUser.displayName || "");
                setEmail(currentUser.email || "");
                setEditedName(currentUser.displayName || "");
                setGender("mother");
                setEditedGender("mother");
                setSkinTone("unspecified");
                setEditedSkinTone("unspecified");
                setMomBirthDate(null);
                setEditedMomBirthDate(null);
                setBabyName("");
                setEditedBabyName("");
                setPreferredCountry("Pakistan");
                setEditedPreferredCountry("Pakistan");
                setUserRole("mom");
                setEditedUserRole("mom");
                
                // Default values for additional fields
                setDueDate(null);
                setLastPeriodDate(null);
                setBabyCount("single");
                setNotificationTime("09:00");
                setBabyGender("unspecified");
                setCurrentWeek(1);
              }
              setIsLoading(false);
            }, (error) => {
              // Handle permission errors gracefully
              if (error.code === 'permission-denied') {
                console.log('Permission denied for user data, using default values');
              } else {
                console.error("Error fetching user data:", error);
              }
              // Set default values on error
              setName(currentUser.displayName || "");
              setEmail(currentUser.email || "");
              setEditedName(currentUser.displayName || "");
              setGender("mother");
              setEditedGender("mother");
              setSkinTone("unspecified");
              setEditedSkinTone("unspecified");
              setMomBirthDate(null);
              setEditedMomBirthDate(null);
              setBabyName("");
              setEditedBabyName("");
              setPreferredCountry("Pakistan");
              setEditedPreferredCountry("Pakistan");
              setUserRole("mom");
              setEditedUserRole("mom");
              
              // Default values for additional fields
              setDueDate(null);
              setLastPeriodDate(null);
              setBabyCount("single");
              setNotificationTime("09:00");
              setBabyGender("unspecified");
              setCurrentWeek(1);
              setIsLoading(false);
            });
          } else {
            setIsLoading(false);
            if (unsubscribeSnapshot) unsubscribeSnapshot();
          }
        });
      } catch (error) {
        console.error("Error in fetchUserData:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
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
    if (!partnerEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingInvite(true);
    try {
      await sendPartnerInvitation(partnerEmail);
      toast({
        title: "Invitation Sent",
        description: "Partner invitation has been sent successfully!",
      });
      setPartnerEmail("");
      setIsPartnerModalOpen(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleScanQrCode = () => {
    // Implement QR code scanning functionality
    toast({
      title: "QR Code Scanner",
      description: "QR code scanning feature coming soon!",
    });
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        displayName: editedName,
        email: editedEmail,
        gender: editedGender,
        skinTone: editedSkinTone,
        momBirthDate: editedMomBirthDate ? Timestamp.fromDate(editedMomBirthDate) : null,
        babyName: editedBabyName,
        preferredCountry: editedPreferredCountry,
        userRole: editedUserRole,
        lastUpdated: Timestamp.now()
      }, { merge: true });

      // Update auth profile if name changed
      if (editedName !== name && auth.currentUser) {
        await updateAuthProfile(auth.currentUser, { displayName: editedName });
      }

      // Update local state
      setName(editedName);
      setEmail(editedEmail);
      setGender(editedGender);
      setSkinTone(editedSkinTone);
      setMomBirthDate(editedMomBirthDate);
      setBabyName(editedBabyName);
      setPreferredCountry(editedPreferredCountry);
      setUserRole(editedUserRole);

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBabySize = (week: number) => {
    const sizes: { [key: number]: { fruit: string; size: string; emoji: string } } = {
      1: { fruit: "Poppy seed", size: "0.1mm", emoji: "🌱" },
      2: { fruit: "Sesame seed", size: "0.2mm", emoji: "🌱" },
      3: { fruit: "Poppy seed", size: "0.3mm", emoji: "🌱" },
      4: { fruit: "Sesame seed", size: "0.4mm", emoji: "🌱" },
      5: { fruit: "Apple seed", size: "0.5mm", emoji: "🍎" },
      6: { fruit: "Lentil", size: "0.6mm", emoji: "🫘" },
      7: { fruit: "Blueberry", size: "0.7mm", emoji: "🫐" },
      8: { fruit: "Kidney bean", size: "1.6cm", emoji: "🫘" },
      9: { fruit: "Grape", size: "2.3cm", emoji: "🍇" },
      10: { fruit: "Kumquat", size: "3.1cm", emoji: "🍊" },
      11: { fruit: "Fig", size: "4.1cm", emoji: "🍈" },
      12: { fruit: "Lime", size: "5.4cm", emoji: "🍋" },
      13: { fruit: "Peach", size: "7.4cm", emoji: "🍑" },
      14: { fruit: "Lemon", size: "8.7cm", emoji: "🍋" },
      15: { fruit: "Apple", size: "10.1cm", emoji: "🍎" },
      16: { fruit: "Apple", size: "11.6cm", emoji: "🍎" },
      17: { fruit: "Pear", size: "13.0cm", emoji: "🍐" },
      18: { fruit: "Bell pepper", size: "14.2cm", emoji: "🫑" },
      19: { fruit: "Mango", size: "15.3cm", emoji: "🥭" },
      20: { fruit: "Banana", size: "16.4cm", emoji: "🍌" },
      21: { fruit: "Carrot", size: "17.5cm", emoji: "🥕" },
      22: { fruit: "Coconut", size: "18.6cm", emoji: "🥥" },
      23: { fruit: "Grapefruit", size: "19.7cm", emoji: "🍊" },
      24: { fruit: "Corn", size: "21cm", emoji: "🌽" },
      25: { fruit: "Cauliflower", size: "22cm", emoji: "🥦" },
      26: { fruit: "Lettuce", size: "23cm", emoji: "🥬" },
      27: { fruit: "Broccoli", size: "24cm", emoji: "🥦" },
      28: { fruit: "Eggplant", size: "25cm", emoji: "🍆" },
      29: { fruit: "Butternut squash", size: "26cm", emoji: "🎃" },
      30: { fruit: "Cabbage", size: "27cm", emoji: "🥬" },
      31: { fruit: "Coconut", size: "28cm", emoji: "🥥" },
      32: { fruit: "Squash", size: "28cm", emoji: "🎃" },
      33: { fruit: "Pineapple", size: "30cm", emoji: "🍍" },
      34: { fruit: "Cantaloupe", size: "31cm", emoji: "🍈" },
      35: { fruit: "Honeydew melon", size: "32cm", emoji: "🍈" },
      36: { fruit: "Honeydew melon", size: "32cm", emoji: "🍈" },
      37: { fruit: "Swiss chard", size: "33cm", emoji: "🥬" },
      38: { fruit: "Leek", size: "34cm", emoji: "🧅" },
      39: { fruit: "Mini watermelon", size: "35cm", emoji: "🍉" },
      40: { fruit: "Watermelon", size: "36cm", emoji: "🍉" }
    };
    return sizes[week] || sizes[12];
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTrimester = (week: number) => {
    if (week <= 12) return "First Trimester";
    if (week <= 26) return "Second Trimester";
    return "Third Trimester";
  };

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

            {/* Pregnancy Information Section */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-500" />
                        Pregnancy Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ul className="space-y-1">
                        <ListItem 
                            icon={Info} 
                            text="Basic Information" 
                            isOpen={isBasicInfoOpen} 
                            onClick={() => setIsBasicInfoOpen(!isBasicInfoOpen)}
                        >
                            <div className="w-full pl-12 pr-4 pb-4 pt-2 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Your Role:</span>
                                    <span className="font-medium">
                                        {userRole === 'mom' ? '👩 Mom' : userRole === 'father' ? '👨 Father' : '💜 Single Mom'}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Baby Count:</span>
                                    <span className="font-medium">
                                        {babyCount === 'single' ? '👶 Single' : '👶👶 Twins'}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Baby Gender:</span>
                                    <span className="font-medium">
                                        {babyGender === 'boy' ? '👦 Boy' : babyGender === 'girl' ? '👧 Girl' : '❓ Not specified'}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Baby Name:</span>
                                    <span className="font-medium">
                                        {babyName || 'Not set'}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Preferred Country:</span>
                                    <span className="font-medium">{preferredCountry}</span>
                                </div>
                                
                                <div className="pt-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="w-full"
                                    >
                                        Edit Basic Information
                                    </Button>
                                </div>
                            </div>
                        </ListItem>
                        
                        <ListItem 
                            icon={UserCircle} 
                            text="Personal Information" 
                            isOpen={isPersonalInfoOpen} 
                            onClick={() => setIsPersonalInfoOpen(!isPersonalInfoOpen)}
                        >
                            <div className="w-full pl-12 pr-4 pb-4 pt-2 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Skin Tone:</span>
                                    <span className="font-medium capitalize">{skinTone}</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Mom's Birth Date:</span>
                                    <span className="font-medium">{formatDate(momBirthDate)}</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Notification Time:</span>
                                    <span className="font-medium">{notificationTime}</span>
                                </div>
                                
                                <div className="pt-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="w-full"
                                    >
                                        Edit Personal Information
                                    </Button>
                                </div>
                            </div>
                        </ListItem>
                        
                        <ListItem 
                            icon={FileText} 
                            text="Pregnancy Progress" 
                            isOpen={isPregnancyProgressOpen} 
                            onClick={() => setIsPregnancyProgressOpen(!isPregnancyProgressOpen)}
                        >
                            <div className="w-full pl-12 pr-4 pb-4 pt-2 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Current Week:</span>
                                    <span className="font-medium text-lg text-pink-600">Week {currentWeek}</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Trimester:</span>
                                    <span className="font-medium">{getTrimester(currentWeek)}</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Baby Size:</span>
                                    <div className="text-right">
                                        <div className="font-medium">{getBabySize(currentWeek).fruit}</div>
                                        <div className="text-sm text-gray-500">{getBabySize(currentWeek).size}</div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Due Date:</span>
                                    <span className="font-medium">{formatDate(dueDate)}</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Last Period:</span>
                                    <span className="font-medium">{formatDate(lastPeriodDate)}</span>
                                </div>
                            </div>
                        </ListItem>
                    </ul>
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
                        <ListItem icon={Info} text="Basic Information" href="/profile/basic-info" />
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
                        <ListItem icon={Briefcase} text="Partner Invitation" onClick={() => setIsPartnerModalOpen(true)} />
                        <ListItem icon={QrCode} text="Scan QR Code" onClick={handleScanQrCode} />
                        <ListItem icon={LogOut} text="Logout" onClick={handleLogout} />
                    </ul>
                </CardContent>
            </Card>
        </div>

        {/* Edit Profile Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update your profile information
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={editedEmail}
                            onChange={(e) => setEditedEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="gender">Gender</Label>
                        <select
                            id="gender"
                            value={editedGender}
                            onChange={(e) => setEditedGender(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="mother">Mother</option>
                            <option value="father">Father</option>
                            <option value="single-mom">Single Mom</option>
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="skinTone">Skin Tone</Label>
                        <select
                            id="skinTone"
                            value={editedSkinTone}
                            onChange={(e) => setEditedSkinTone(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="unspecified">Unspecified</option>
                            <option value="light">Light</option>
                            <option value="medium">Medium</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="babyName">Baby Name</Label>
                        <Input
                            id="babyName"
                            value={editedBabyName}
                            onChange={(e) => setEditedBabyName(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="preferredCountry">Preferred Country</Label>
                        <Input
                            id="preferredCountry"
                            value={editedPreferredCountry}
                            onChange={(e) => setEditedPreferredCountry(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSaveChanges}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Partner Invitation Modal */}
        <Dialog open={isPartnerModalOpen} onOpenChange={setIsPartnerModalOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite Partner</DialogTitle>
                    <DialogDescription>
                        Send an invitation to your partner to join Bloom Journey
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="partnerEmail">Partner's Email</Label>
                        <Input
                            id="partnerEmail"
                            type="email"
                            placeholder="partner@example.com"
                            value={partnerEmail}
                            onChange={(e) => setPartnerEmail(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPartnerModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSendInvitation} disabled={isSendingInvite}>
                        {isSendingInvite ? "Sending..." : "Send Invitation"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function ListItem({ icon: Icon, text, href, onClick, children, isOpen, comingSoon }: { icon: React.ElementType, text: string, href?: string, onClick?: () => void, children?: React.ReactNode, isOpen?: boolean, comingSoon?: boolean }) {
  const router = useRouter();
  
  const handleClick = () => {
    if (comingSoon) {
      return;
    }
    if (href) {
      router.push(href);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <li>
      <div
        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
          comingSoon 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-accent cursor-pointer'
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{text}</span>
          {comingSoon && (
            <Badge variant="secondary" className="text-xs">
              Coming Soon
            </Badge>
          )}
        </div>
        {children ? (
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      {children && isOpen && children}
    </li>
  );
}
