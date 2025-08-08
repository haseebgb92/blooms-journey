'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Save, Baby, Users, Heart, Calendar, Clock, MapPin, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, Timestamp } from 'firebase/firestore';
import { appDataService } from '@/lib/appDataService';

interface BasicInfo {
  displayName: string;
  email: string;
  userRole: string;
  babyCount: string;
  babyGender: string;
  babyName: string;
  preferredCountry: string;
  skinTone: string;
  momBirthDate: Date | null;
  notificationTime: string;
  dueDate: Date | null;
  lastPeriodDate: Date | null;
  currentWeek: number;
}

export default function BasicInfoPage() {
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    displayName: '',
    email: '',
    userRole: 'mom',
    babyCount: 'single',
    babyGender: 'unspecified',
    babyName: '',
    preferredCountry: 'Pakistan',
    skinTone: 'unspecified',
    momBirthDate: null,
    notificationTime: '09:00',
    dueDate: null,
    lastPeriodDate: null,
    currentWeek: 1
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>('');
  const [isSaving, setIsSaving] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let unsubscribeSnapshot: () => void = () => {};
    let unsubscribeAuth: (() => void) | undefined;

    const fetchUserData = async () => {
      try {
        unsubscribeAuth = onAuthStateChanged(auth, (user) => {
          if (user) {
            const userDocRef = doc(firestore, 'users', user.uid);
            unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
              if (doc.exists()) {
                const data = doc.data();
                setBasicInfo({
                  displayName: data.displayName || user.displayName || '',
                  email: data.email || user.email || '',
                  userRole: data.userRole || 'mom',
                  babyCount: data.babyCount || 'single',
                  babyGender: data.babyGender || 'unspecified',
                  babyName: data.babyName || '',
                  preferredCountry: data.preferredCountry || 'Pakistan',
                  skinTone: data.skinTone || 'unspecified',
                  momBirthDate: data.momBirthDate ? new Date(data.momBirthDate) : null,
                  notificationTime: data.notificationTime || '09:00',
                  dueDate: data.dueDate ? new Date(data.dueDate) : null,
                  lastPeriodDate: data.lastPeriodDate ? new Date(data.lastPeriodDate) : null,
                  currentWeek: data.currentWeek || 1
                });
              }
              setIsLoading(false);
            });
          } else {
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      }
    };

    fetchUserData();

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const handleEdit = (field: string, value: any) => {
    setEditingField(field);
    setEditValue(value);
  };

  const handleSave = async () => {
    if (!editingField || !auth.currentUser) return;

    setIsSaving(true);
    try {
      const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
      const updateData: any = { [editingField]: editValue };

      // Convert dates to timestamps if needed
      if (editingField === 'momBirthDate' && editValue) {
        updateData[editingField] = Timestamp.fromDate(new Date(editValue));
      }
      if (editingField === 'dueDate' && editValue) {
        updateData[editingField] = Timestamp.fromDate(new Date(editValue));
      }
      if (editingField === 'lastPeriodDate' && editValue) {
        updateData[editingField] = Timestamp.fromDate(new Date(editValue));
      }

      await updateDoc(userDocRef, updateData);

      // Update local state
      setBasicInfo(prev => ({
        ...prev,
        [editingField]: editingField.includes('Date') && editValue ? new Date(editValue) : editValue
      }));

      // Track the update
      await appDataService.trackActivity({
        action: 'profile_updated',
        page: 'basic_info',
        data: { field: editingField, value: editValue }
      });

      toast({
        title: "Updated Successfully",
        description: "Your information has been saved.",
      });

      setEditingField(null);
      setEditValue('');
    } catch (error) {
      console.error('Error updating data:', error);
      toast({
        title: "Error",
        description: "Failed to update information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'mom': return '👩';
      case 'father': return '👨';
      case 'singleMom': return '💜';
      default: return '👤';
    }
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'boy': return '👦';
      case 'girl': return '👧';
      default: return '❓';
    }
  };

  const getBabyCountIcon = (count: string) => {
    return count === 'single' ? '👶' : '👶👶';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Basic Information</h1>
            <p className="text-gray-600">View and edit your pregnancy information</p>
          </div>
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            variant={isEditMode ? "default" : "outline"}
            className="ml-auto"
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditMode ? 'View Mode' : 'Edit Mode'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm text-gray-600">Your Role</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl">{getRoleIcon(basicInfo.userRole)}</span>
                    <span className="font-medium">
                      {basicInfo.userRole === 'mom' ? 'Mom' : 
                       basicInfo.userRole === 'father' ? 'Father' : 'Single Mom'}
                    </span>
                  </div>
                </div>
                {isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('userRole', basicInfo.userRole)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm text-gray-600">Name</Label>
                  <div className="font-medium mt-1">{basicInfo.displayName}</div>
                </div>
                {isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('displayName', basicInfo.displayName)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm text-gray-600">Email</Label>
                  <div className="font-medium mt-1">{basicInfo.email}</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm text-gray-600">Skin Tone</Label>
                  <div className="font-medium mt-1 capitalize">{basicInfo.skinTone}</div>
                </div>
                {isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('skinTone', basicInfo.skinTone)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm text-gray-600">Mom's Birth Date</Label>
                  <div className="font-medium mt-1">{formatDate(basicInfo.momBirthDate)}</div>
                </div>
                {isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('momBirthDate', basicInfo.momBirthDate?.toISOString().slice(0, 10) || '')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Baby Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Baby className="h-5 w-5 text-pink-600" />
                Baby Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                <div>
                  <Label className="text-sm text-gray-600">Baby Name</Label>
                  <div className="font-medium mt-1">
                    {basicInfo.babyName || 'Not set'}
                  </div>
                </div>
                {isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('babyName', basicInfo.babyName)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                <div>
                  <Label className="text-sm text-gray-600">Baby Count</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl">{getBabyCountIcon(basicInfo.babyCount)}</span>
                    <span className="font-medium">
                      {basicInfo.babyCount === 'single' ? 'Single' : 'Twins'}
                    </span>
                  </div>
                </div>
                {isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('babyCount', basicInfo.babyCount)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                <div>
                  <Label className="text-sm text-gray-600">Baby Gender</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl">{getGenderIcon(basicInfo.babyGender)}</span>
                    <span className="font-medium">
                      {basicInfo.babyGender === 'boy' ? 'Boy' : 
                       basicInfo.babyGender === 'girl' ? 'Girl' : 'Not specified'}
                    </span>
                  </div>
                </div>
                {isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('babyGender', basicInfo.babyGender)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                <div>
                  <Label className="text-sm text-gray-600">Preferred Country</Label>
                  <div className="font-medium mt-1">{basicInfo.preferredCountry}</div>
                </div>
                {isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('preferredCountry', basicInfo.preferredCountry)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pregnancy Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                Pregnancy Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <Label className="text-sm text-gray-600">Current Week</Label>
                  <div className="font-medium text-lg text-red-600 mt-1">
                    Week {basicInfo.currentWeek}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <Label className="text-sm text-gray-600">Due Date</Label>
                  <div className="font-medium mt-1">{formatDate(basicInfo.dueDate)}</div>
                </div>
                {isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('dueDate', basicInfo.dueDate?.toISOString().slice(0, 10) || '')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <Label className="text-sm text-gray-600">Last Period Date</Label>
                  <div className="font-medium mt-1">{formatDate(basicInfo.lastPeriodDate)}</div>
                </div>
                {isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('lastPeriodDate', basicInfo.lastPeriodDate?.toISOString().slice(0, 10) || '')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <Label className="text-sm text-gray-600">Notification Time</Label>
                  <div className="font-medium mt-1">{basicInfo.notificationTime}</div>
                </div>
                {isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('notificationTime', basicInfo.notificationTime)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">{getRoleIcon(basicInfo.userRole)}</div>
                  <div className="text-sm text-gray-600">Your Role</div>
                  <div className="font-medium">
                    {basicInfo.userRole === 'mom' ? 'Mom' : 
                     basicInfo.userRole === 'father' ? 'Father' : 'Single Mom'}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">{getBabyCountIcon(basicInfo.babyCount)}</div>
                  <div className="text-sm text-gray-600">Baby Count</div>
                  <div className="font-medium">
                    {basicInfo.babyCount === 'single' ? 'Single' : 'Twins'}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <div className="text-2xl mb-2">{getGenderIcon(basicInfo.babyGender)}</div>
                  <div className="text-sm text-gray-600">Baby Gender</div>
                  <div className="font-medium">
                    {basicInfo.babyGender === 'boy' ? 'Boy' : 
                     basicInfo.babyGender === 'girl' ? 'Girl' : 'Not specified'}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-2">📅</div>
                  <div className="text-sm text-gray-600">Current Week</div>
                  <div className="font-medium text-purple-600">Week {basicInfo.currentWeek}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingField} onOpenChange={() => setEditingField(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {editingField?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {editingField === 'userRole' && (
                <RadioGroup value={editValue} onValueChange={setEditValue}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mom" id="edit-mom" />
                    <Label htmlFor="edit-mom">👩 Mom</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="father" id="edit-father" />
                    <Label htmlFor="edit-father">👨 Father</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="singleMom" id="edit-singleMom" />
                    <Label htmlFor="edit-singleMom">💜 Single Mom</Label>
                  </div>
                </RadioGroup>
              )}

              {editingField === 'babyCount' && (
                <RadioGroup value={editValue} onValueChange={setEditValue}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="edit-single" />
                    <Label htmlFor="edit-single">👶 Single</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="twin" id="edit-twin" />
                    <Label htmlFor="edit-twin">👶👶 Twins</Label>
                  </div>
                </RadioGroup>
              )}

              {editingField === 'babyGender' && (
                <RadioGroup value={editValue} onValueChange={setEditValue}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="boy" id="edit-boy" />
                    <Label htmlFor="edit-boy">👦 Boy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="girl" id="edit-girl" />
                    <Label htmlFor="edit-girl">👧 Girl</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unspecified" id="edit-unspecified" />
                    <Label htmlFor="edit-unspecified">❓ Not specified</Label>
                  </div>
                </RadioGroup>
              )}

              {editingField === 'skinTone' && (
                <RadioGroup value={editValue} onValueChange={setEditValue} className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="white" id="edit-white" />
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-gray-300"></div>
                    <Label htmlFor="edit-white" className="cursor-pointer">White</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="yellow" id="edit-yellow" />
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-300 border-2 border-gray-300"></div>
                    <Label htmlFor="edit-yellow" className="cursor-pointer">Yellow</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="light" id="edit-light" />
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 border-2 border-gray-300"></div>
                    <Label htmlFor="edit-light" className="cursor-pointer">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="medium" id="edit-medium" />
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 border-2 border-gray-300"></div>
                    <Label htmlFor="edit-medium" className="cursor-pointer">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="dark" id="edit-dark" />
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brown-400 to-brown-500 border-2 border-gray-300"></div>
                    <Label htmlFor="edit-dark" className="cursor-pointer">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="black" id="edit-black" />
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-300"></div>
                    <Label htmlFor="edit-black" className="cursor-pointer">Black</Label>
                  </div>
                </RadioGroup>
              )}

              {editingField === 'preferredCountry' && (
                <RadioGroup value={editValue} onValueChange={setEditValue} className="grid grid-cols-2 gap-3">
                  {['Pakistan', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'India', 'Other'].map((country) => (
                    <div key={country} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value={country} id={`edit-${country.toLowerCase()}`} />
                      <Label htmlFor={`edit-${country.toLowerCase()}`} className="cursor-pointer">{country}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {editingField === 'notificationTime' && (
                <Input
                  type="time"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              )}

              {(editingField === 'momBirthDate' || editingField === 'dueDate' || editingField === 'lastPeriodDate') && (
                <Input
                  type="date"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              )}

              {(editingField === 'displayName' || editingField === 'babyName') && (
                <Input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={`Enter ${editingField === 'displayName' ? 'your name' : 'baby name'}`}
                />
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 