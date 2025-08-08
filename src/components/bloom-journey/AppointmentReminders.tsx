
'use client';
import { useState, useEffect } from 'react';
import { CalendarDays, PlusCircle, BellRing, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Textarea } from '../ui/textarea';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type Appointment = {
  id: string;
  title: string;
  date: Date;
  notes: string;
};

export function AppointmentReminders() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [newNotes, setNewNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    let unsubscribeSnapshot: () => void = () => {};
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setIsLoading(true);
        const q = query(collection(firestore, 'users', user.uid, 'appointments'), orderBy('date', 'asc'));
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const appts = snapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            notes: doc.data().notes,
            date: (doc.data().date as Timestamp).toDate(),
          }));
          setAppointments(appts);
          setIsLoading(false);
        });
      } else {
        setAppointments([]);
        setIsLoading(false);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });
    
    return () => {
        unsubscribeAuth();
        if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const handleAddAppointment = async () => {
    const user = auth.currentUser;
    if (user && newTitle && newDate) {
      try {
        await addDoc(collection(firestore, 'users', user.uid, 'appointments'), {
          title: newTitle,
          date: Timestamp.fromDate(newDate),
          notes: newNotes,
        });

        toast({
            title: "Appointment Added",
            description: "Your appointment has been saved.",
        })
        
        setNewTitle('');
        setNewDate(undefined);
        setNewNotes('');
        setOpen(false);

      } catch (error) {
        console.error("Error adding appointment: ", error);
        toast({
            title: "Error",
            description: "Could not save your appointment.",
            variant: "destructive"
        })
      }
    }
  };

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 shadow-lg hover:shadow-primary/10 transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="text-sm font-medium font-body text-pink-800">Appointments</CardTitle>
            <CardDescription className="text-xs">Your upcoming visits</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <PlusCircle className="h-5 w-5 text-primary" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. 20-week ultrasound"/>
                </div>
                 <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {newDate ? format(newDate, 'PPP') : 'Select a date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={newDate} onSelect={setNewDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="e.g. Remember to bring insurance card"/>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleAddAppointment}>Add Appointment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center items-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : appointments.length > 0 ? (
          <ul className="space-y-3 max-h-[200px] overflow-y-auto">
            {appointments.map((appt) => (
              <li key={appt.id} className="flex items-start gap-4 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                <div className="flex flex-col items-center justify-center p-2 bg-accent rounded-md text-accent-foreground w-14">
                    <span className="text-sm font-bold">{format(appt.date, 'MMM')}</span>
                    <span className="text-xl font-headline">{format(appt.date, 'd')}</span>
                </div>
                <div className="flex-1">
                    <p className="font-semibold">{appt.title}</p>
                    <p className="text-sm text-muted-foreground">{appt.notes}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <BellRing className="mx-auto h-8 w-8 mb-2" />
            <p>No upcoming appointments.</p>
            <p>Click the '+' to add one.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    
