'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Wand2, Loader2 } from 'lucide-react';
import { getPregnancyAdvice } from '@/ai/flows/pregnancyAdvice';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { differenceInDays } from 'date-fns';

const calculateCurrentWeek = (dueDate: Date | undefined): number => {
  if (!dueDate) return 12; // Default to week 12 if no due date
  const week = 40 - Math.ceil(differenceInDays(dueDate, new Date()) / 7);
  return Math.max(1, Math.min(week, 40));
};

export function AiPregnancyPal() {
  const [topic, setTopic] = useState('');
  const [currentWeek, setCurrentWeek] = useState(12);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<string | undefined>();
  const [isLoadingWeek, setIsLoadingWeek] = useState(true);

  // Fetch user's due date and calculate current week
  useEffect(() => {
    const fetchUserData = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const userDocRef = doc(firestore, "users", user.uid);
            
            // Use real-time listener to get updates when due date changes
            const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
              if (doc.exists() && doc.data().dueDate) {
                const dueDate = doc.data().dueDate.toDate();
                const week = calculateCurrentWeek(dueDate);
                console.log('AI Pregnancy Pal - Due date updated:', dueDate, 'Week:', week);
                setCurrentWeek(week);
              } else {
                console.log('AI Pregnancy Pal - No due date found, using default week 12');
                setCurrentWeek(12);
              }
              setIsLoadingWeek(false);
            }, (error) => {
              console.error("Error listening to user data:", error);
              setCurrentWeek(12);
              setIsLoadingWeek(false);
            });

            return () => unsubscribeSnapshot();
          } catch (error) {
            console.error("Error setting up user data listener:", error);
            setCurrentWeek(12);
            setIsLoadingWeek(false);
          }
        } else {
          console.log('AI Pregnancy Pal - No user, using default week 12');
          setCurrentWeek(12);
          setIsLoadingWeek(false);
        }
      });

      return () => unsubscribe();
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      setLoading(true);
      setData(undefined);
      
      try {
        const result = await getPregnancyAdvice({ week: currentWeek, topic });
        setData(result);
      } catch (error) {
        console.error("Error getting pregnancy advice:", error);
        setData("I'm sorry, I'm having trouble providing advice right now. Please try again in a moment. If the problem persists, please check your internet connection.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Card className="shadow-lg border-primary/20 hover:shadow-primary/10 transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Wand2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="font-headline text-2xl">AI Pregnancy Pal</CardTitle>
            <CardDescription>
              {isLoadingWeek ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading your pregnancy stage...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Get AI-powered advice for</span>
                  <span className="font-semibold text-primary">Week {currentWeek}</span>
                  <span>of your pregnancy</span>
                </span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            placeholder="Ask about nutrition, exercise, symptoms..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="text-base"
            disabled={isLoadingWeek}
          />
          <Button type="submit" disabled={loading || isLoadingWeek} className="w-full font-bold">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                Get Advice
                <Sparkles className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
        <div className="mt-6 p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg min-h-[120px]">
          {loading && (
            <div className="space-y-2">
              <div className="h-4 w-full bg-primary/20 rounded animate-pulse" />
              <div className="h-4 w-full bg-primary/20 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-primary/20 rounded animate-pulse" />
            </div>
          )}
          {data && (
            <div className="text-sm leading-relaxed font-serif space-y-2">
              {data.split('\n').map((paragraph, index) => {
                const trimmedParagraph = paragraph.trim();
                if (!trimmedParagraph) return null;
                
                // Check if this is a bullet point or list item (handle both • and * and -)
                if (trimmedParagraph.startsWith('•') || trimmedParagraph.startsWith('-') || trimmedParagraph.startsWith('*')) {
                  // Remove the bullet point character and any leading spaces
                  const cleanText = trimmedParagraph.replace(/^[•*-]\s*/, '');
                  
                  // Check if the text contains bold formatting (like "**Key points:**")
                  if (cleanText.includes('**')) {
                    const parts = cleanText.split(/(\*\*.*?\*\*)/g);
                    return (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1 flex-shrink-0">•</span>
                        <span>
                          {parts.map((part, partIndex) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return (
                                <strong key={partIndex} className="text-primary font-semibold">
                                  {part.slice(2, -2)}
                                </strong>
                              );
                            }
                            return part;
                          })}
                        </span>
                      </div>
                    );
                  }
                  
                  // Regular bullet point without bold text
                  return (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1 flex-shrink-0">•</span>
                      <span>{cleanText}</span>
                    </div>
                  );
                }
                
                // Regular paragraph
                return (
                  <p key={index} className="text-sm leading-relaxed">
                    {trimmedParagraph}
                  </p>
                );
              })}
            </div>
          )}
          {!loading && !data && !isLoadingWeek && (
            <p className="text-sm text-muted-foreground">
              Ask me anything about your pregnancy journey! I'll provide quick, focused advice for week {currentWeek}.
            </p>
          )}
          {isLoadingWeek && (
            <p className="text-sm text-muted-foreground">
              Loading your pregnancy information...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
