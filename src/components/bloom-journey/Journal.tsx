
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { BookHeart, Weight, LineChart, Loader2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { collection, addDoc, query, orderBy, onSnapshot, doc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type JournalEntry = {
    id: string;
    date: Date;
    text: string;
};

type WeightEntry = {
    id: string;
    date: Date;
    weight: number;
    name: string;
};

const chartConfig = {
  weight: {
    label: "Weight (kg)",
    color: "hsl(var(--primary))",
  },
};

export function Journal() {
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [newJournalText, setNewJournalText] = useState('');
    const [isJournalLoading, setIsJournalLoading] = useState(true);

    const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
    const [newWeight, setNewWeight] = useState('');
    const [isWeightLoading, setIsWeightLoading] = useState(true);

    const { toast } = useToast();

    useEffect(() => {
        let unsubscribeJournal: () => void = () => {};
        let unsubscribeWeight: () => void = () => {};

        const unsubscribeAuth = auth.onAuthStateChanged(user => {
            if (user) {
                // Fetch Journal Entries
                const journalQuery = query(collection(firestore, 'users', user.uid, 'journalEntries'), orderBy('date', 'desc'));
                unsubscribeJournal = onSnapshot(journalQuery, (snapshot) => {
                    const entries = snapshot.docs.map(doc => ({
                        id: doc.id,
                        text: doc.data().text,
                        date: (doc.data().date as Timestamp).toDate()
                    }));
                    setJournalEntries(entries);
                    setIsJournalLoading(false);
                }, (error) => {
                    console.error("Error fetching journal entries:", error);
                    setIsJournalLoading(false);
                });

                // Fetch Weight Entries
                const weightQuery = query(collection(firestore, 'users', user.uid, 'weightEntries'), orderBy('date', 'asc'));
                unsubscribeWeight = onSnapshot(weightQuery, (snapshot) => {
                    const entries = snapshot.docs.map(doc => ({
                        id: doc.id,
                        weight: doc.data().weight,
                        date: (doc.data().date as Timestamp).toDate(),
                        name: format((doc.data().date as Timestamp).toDate(), 'MMM d')
                    }));
                    setWeightEntries(entries);
                    setIsWeightLoading(false);
                }, (error) => {
                    console.error("Error fetching weight entries:", error);
                    setIsWeightLoading(false);
                });

            } else {
                setIsJournalLoading(false);
                setIsWeightLoading(false);
                setJournalEntries([]);
                setWeightEntries([]);
                if (unsubscribeJournal) unsubscribeJournal();
                if (unsubscribeWeight) unsubscribeWeight();
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeJournal) unsubscribeJournal();
            if (unsubscribeWeight) unsubscribeWeight();
        };
    }, []);

    const handleAddJournalEntry = async () => {
        const user = auth.currentUser;
        if (!user || !newJournalText.trim()) return;

        try {
            await addDoc(collection(firestore, 'users', user.uid, 'journalEntries'), {
                text: newJournalText,
                date: Timestamp.now()
            });
            setNewJournalText('');
            toast({ title: "Journal entry saved!" });
        } catch (error) {
            console.error("Error adding journal entry: ", error);
            toast({ title: "Error", description: "Could not save journal entry.", variant: 'destructive' });
        }
    };
    
    const handleAddWeightEntry = async () => {
        const user = auth.currentUser;
        if (!user || !newWeight) return;

        try {
            await addDoc(collection(firestore, 'users', user.uid, 'weightEntries'), {
                weight: parseFloat(newWeight),
                date: Timestamp.now()
            });
            setNewWeight('');
            toast({ title: "Weight entry saved!" });
        } catch (error) {
            console.error("Error adding weight entry: ", error);
            toast({ title: "Error", description: "Could not save weight entry.", variant: 'destructive' });
        }
    };

    return (
        <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 shadow-lg hover:shadow-primary/10 transition-shadow duration-300">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-pink-800">Personal Journal</CardTitle>
                <CardDescription>Track symptoms, weight, and more</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="symptoms" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="symptoms"><BookHeart className="mr-2 h-4 w-4"/>Symptoms</TabsTrigger>
                        <TabsTrigger value="weight"><Weight className="mr-2 h-4 w-4"/>Weight</TabsTrigger>
                        <TabsTrigger value="graph"><LineChart className="mr-2 h-4 w-4"/>Graph</TabsTrigger>
                    </TabsList>
                    <TabsContent value="symptoms" className="mt-4">
                        <div className="space-y-4">
                            <Textarea 
                                placeholder="How are you feeling today?" 
                                value={newJournalText}
                                onChange={(e) => setNewJournalText(e.target.value)}
                            />
                            <Button onClick={handleAddJournalEntry} className="w-full">Add Journal Entry</Button>
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                {isJournalLoading ? <Loader2 className="mx-auto animate-spin" /> : 
                                journalEntries.length > 0 ?
                                journalEntries.map(entry => (
                                    <div key={entry.id} className="p-3 rounded-lg border hover:bg-muted transition-colors">
                                        <p className="text-xs text-muted-foreground">{format(entry.date, 'PPP')}</p>
                                        <p className="text-sm whitespace-pre-wrap">{entry.text}</p>
                                    </div>
                                )) : <p className="text-center text-sm text-muted-foreground py-4">No journal entries yet.</p>}
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="weight" className="mt-4">
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input 
                                    type="number" 
                                    placeholder="Enter weight in kg" 
                                    value={newWeight}
                                    onChange={(e) => setNewWeight(e.target.value)}
                                />
                                <Button onClick={handleAddWeightEntry}>Add</Button>
                            </div>
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                               {isWeightLoading ? <Loader2 className="mx-auto animate-spin" /> :
                                weightEntries.length > 0 ?
                                weightEntries.map(entry => (
                                    <div key={entry.id} className="flex justify-between items-center p-3 rounded-lg border hover:bg-muted transition-colors">
                                        <p className="text-sm">{format(entry.date, 'PPP')}</p>
                                        <p className="text-sm font-semibold">{entry.weight} kg</p>
                                    </div>
                                )) : <p className="text-center text-sm text-muted-foreground py-4">No weight entries yet.</p>}
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="graph" className="mt-4">
                         {isWeightLoading ? <Loader2 className="mx-auto animate-spin" /> :
                         weightEntries.length > 1 ? (
                            <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                <AreaChart data={weightEntries} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                    <Area dataKey="weight" type="natural" fill="var(--color-weight)" fillOpacity={0.4} stroke="var(--color-weight)" />
                                </AreaChart>
                            </ChartContainer>
                         ) : (
                            <div className="text-center py-6 text-sm text-muted-foreground">
                                <p>Add at least two weight entries to see a graph.</p>
                            </div>
                         )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

    
