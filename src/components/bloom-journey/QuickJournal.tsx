
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export function QuickJournal() {
    const [entry, setEntry] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user || !entry.trim() || isSaving) return;

        setIsSaving(true);
        try {
            await addDoc(collection(firestore, 'users', user.uid, 'journalEntries'), {
                text: entry,
                date: Timestamp.now()
            });

            toast({
                title: "Journal Entry Saved",
                description: "Your thoughts have been recorded.",
            });
            setEntry('');
        } catch (error) {
            console.error("Error saving quick journal entry: ", error);
            toast({
                title: "Error",
                description: "Could not save your entry.",
                variant: 'destructive'
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 shadow-lg hover:shadow-primary/10 transition-shadow duration-300">
            <CardHeader>
                <CardTitle className="text-sm font-medium font-body text-pink-800">Quick Journal</CardTitle>
                <CardDescription className="text-xs">Jot down a quick thought.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea 
                    placeholder="How are you feeling right now?"
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    rows={3}
                />
                <Button onClick={handleSave} className="w-full" disabled={!entry.trim() || isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? 'Saving...' : 'Save Entry'}
                </Button>
            </CardContent>
        </Card>
    );
}

    
