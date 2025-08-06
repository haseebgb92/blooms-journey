
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Play, StopCircle, History, Info, Footprints, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth, firestore, collection, addDoc, query, orderBy, onSnapshot, Timestamp } from '@/lib/firebase/clientApp';


// Contraction Timer Types and Logic
type Contraction = {
  id: string;
  duration: number;
  frequency: number | null; 
  startTime: Date;
};

function ContractionTimer() {
  const [isTiming, setIsTiming] = useState(false);
  const [contractions, setContractions] = useState<Contraction[]>([]);
  const [duration, setDuration] = useState(0);
  const [lastContractionEnd, setLastContractionEnd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    let unsubscribeSnapshot: () => void = () => {};
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setIsLoading(true);
        const q = query(collection(firestore, 'users', user.uid, 'contractions'), orderBy('startTime', 'desc'));
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const fetchedContractions = snapshot.docs.map(doc => ({
            id: doc.id,
            duration: doc.data().duration,
            frequency: doc.data().frequency,
            startTime: (doc.data().startTime as Timestamp).toDate(),
          }));
          setContractions(fetchedContractions);
          if (fetchedContractions.length > 0) {
              const lastEndTime = fetchedContractions[0].startTime.getTime() + (fetchedContractions[0].duration * 1000);
              setLastContractionEnd(lastEndTime);
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Error fetching contractions:", error);
          toast({ title: "Error", description: "Could not fetch contraction history.", variant: "destructive" });
          setIsLoading(false);
        });
      } else {
        setContractions([]);
        setIsLoading(false);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [toast]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsTiming(true);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const stopTimer = async () => {
    setIsTiming(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const endTime = Date.now();
    const finalDuration = Math.floor((endTime - startTimeRef.current) / 1000);

    const frequency = lastContractionEnd
      ? Math.floor((startTimeRef.current - lastContractionEnd) / 1000)
      : null;

    const newContractionData = {
      duration: finalDuration,
      frequency: frequency,
      startTime: Timestamp.fromMillis(startTimeRef.current),
    };

    const user = auth.currentUser;
    if (user) {
        try {
            await addDoc(collection(firestore, 'users', user.uid, 'contractions'), newContractionData);
            toast({ title: "Contraction saved!" });
        } catch(error) {
            console.error("Error saving contraction:", error);
            toast({ title: "Error", description: "Could not save contraction.", variant: "destructive" });
        }
    }

    setLastContractionEnd(endTime);
    setDuration(0);
  };

  const handleToggleTimer = () => {
    if (isTiming) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <Card className="border-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline text-primary text-2xl">Contraction Timer</CardTitle>
                <CardDescription>Time your contractions easily and log your history.</CardDescription>
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Info className="h-4 w-4 mr-2" />
                        Learn More
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-headline text-2xl">Understanding Contractions</DialogTitle>
                        <DialogDescription className="text-left pt-2">
                            This information is for educational purposes. Always consult your healthcare provider with any concerns.
                        </DialogDescription>
                    </DialogHeader>
                     <div className="prose dark:prose-invert prose-sm max-w-none">
                        <h3 className="font-headline text-lg">Braxton Hicks vs. Labor Contractions</h3>
                        <p><strong>Braxton Hicks:</strong> These are "practice contractions." They are usually irregular, don't get closer together, and often stop with movement or rest. They might feel like mild menstrual cramps.</p>
                        <p><strong>Labor Contractions:</strong> These are the real deal. They become stronger, last longer, and come more frequently over time. They don't stop when you change activities and will gradually become more intense.</p>
                        
                        <h3 className="font-headline text-lg">When to Seek Medical Advice</h3>
                        <p><strong>The "5-1-1" Rule (or your provider's specific advice):</strong> A common guideline is to call when your contractions are coming every **5 minutes**, lasting **1 minute** each, for at least **1 hour**.</p>
                        <p><strong>Other Signs of Labor:</strong> If contractions are accompanied by your water breaking (a gush or a trickle of fluid) or a bloody show, contact your provider.</p>
                    </div>
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-8 justify-center items-center">
            <div className="text-center p-8 bg-accent/50 rounded-full w-64 h-64 flex flex-col justify-center items-center shadow-inner">
                <p className="text-6xl font-bold font-headline text-primary">
                    {formatTime(duration)}
                </p>
                <p className="text-lg text-muted-foreground">Current Duration</p>
            </div>
            <Button onClick={handleToggleTimer} className="w-full max-w-sm h-12 text-lg">
            {isTiming ? <StopCircle className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
            {isTiming ? 'Stop Contraction' : 'Start Contraction'}
            </Button>
        </CardContent>

        {isLoading ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
        ) : contractions.length > 0 && (
            <div className="p-4 border-t">
                <h4 className="flex items-center text-lg font-semibold mb-4"><History className="mr-2 h-5 w-5"/>Contraction History</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {contractions.map((c) => (
                        <div key={c.id} className="grid grid-cols-3 gap-4 items-center text-sm p-3 bg-muted/50 rounded-lg">
                            <div className="font-mono text-muted-foreground">{new Date(c.startTime).toLocaleTimeString()}</div>
                            <div>Duration: <Badge variant="secondary">{formatTime(c.duration)}</Badge></div>
                            <div>{c.frequency !== null ? <>Frequency: <Badge variant="outline">{formatTime(c.frequency)}</Badge></> : <span className="text-muted-foreground/50">First contraction</span>}</div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </Card>
  );
}

// Kick Counter Types and Logic
type KickSession = {
  id: string;
  duration: number;
  kicks: number;
  startTime: Date;
};

const KICK_GOAL = 10;

function KickCounter() {
  const [isTiming, setIsTiming] = useState(false);
  const [sessions, setSessions] = useState<KickSession[]>([]);
  const [duration, setDuration] = useState(0);
  const [kickCount, setKickCount] = useState(0);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

   useEffect(() => {
    let unsubscribeSnapshot: () => void = () => {};
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setIsLoading(true);
        const q = query(collection(firestore, 'users', user.uid, 'kickSessions'), orderBy('startTime', 'desc'));
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const fetchedSessions = snapshot.docs.map(doc => ({
            id: doc.id,
            duration: doc.data().duration,
            kicks: doc.data().kicks,
            startTime: (doc.data().startTime as Timestamp).toDate(),
          }));
          setSessions(fetchedSessions);
          setIsLoading(false);
        }, (error) => {
          console.error("Error fetching kick sessions:", error);
          toast({ title: "Error", description: "Could not fetch kick count history.", variant: "destructive" });
          setIsLoading(false);
        });
      } else {
        setSessions([]);
        setIsLoading(false);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [toast]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stopSession = async (goalAchieved = false) => {
    setIsTiming(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (startTimeRef.current > 0) {
        const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const newSessionData = {
          duration: finalDuration,
          kicks: kickCount,
          startTime: Timestamp.fromMillis(startTimeRef.current),
        };

        const user = auth.currentUser;
        if (user) {
            try {
                await addDoc(collection(firestore, 'users', user.uid, 'kickSessions'), newSessionData);
                 if (goalAchieved) {
                    toast({
                        title: "Goal Achieved!",
                        description: `You felt ${KICK_GOAL} kicks in ${formatTime(finalDuration)}.`,
                    });
                } else {
                    toast({ title: "Session saved!"});
                }
            } catch (error) {
                console.error("Error saving kick session:", error);
                toast({ title: "Error", description: "Could not save session.", variant: "destructive" });
            }
        }
    }
    
    setDuration(0);
    setKickCount(0);
    startTimeRef.current = 0;
  };

  const startSession = () => {
    setKickCount(0);
    setDuration(0);
    setIsTiming(true);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };
  
  const logKick = () => {
    if (!isTiming) return;
    const newKickCount = kickCount + 1;
    setKickCount(newKickCount);

    if (newKickCount >= KICK_GOAL) {
      stopSession(true);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <Card className="border-0 shadow-none">
        <CardHeader>
            <CardTitle className="font-headline text-primary text-2xl">Kick Counter</CardTitle>
            <CardDescription>Track your baby's movements. Aim for 10 kicks in under 2 hours.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-8 justify-center items-center">
            <div className="text-center p-8 bg-accent/50 rounded-full w-64 h-64 flex flex-col justify-center items-center shadow-inner">
                <p className="text-3xl font-bold font-headline text-primary">
                   {kickCount} / {KICK_GOAL}
                </p>
                 <p className="text-lg text-muted-foreground mb-4">Kicks Felt</p>
                <p className="text-5xl font-bold font-mono text-primary">
                    {formatTime(duration)}
                </p>
                <p className="text-sm text-muted-foreground">Session Duration</p>
            </div>

            {!isTiming ? (
                 <Button onClick={startSession} className="w-full max-w-sm h-12 text-lg">
                    <Play className="mr-2 h-5 w-5" /> Start Session
                </Button>
            ) : (
                <div className="flex flex-col gap-4 w-full max-w-sm">
                     <Button onClick={logKick} className="h-12 text-lg">
                        <Footprints className="mr-2 h-5 w-5" /> Log Kick
                    </Button>
                    <Button onClick={() => stopSession(false)} variant="destructive" className="h-12 text-lg">
                        <StopCircle className="mr-2 h-5 w-5" /> Stop Session
                    </Button>
                </div>
            )}
        </CardContent>

        {isLoading ? (
             <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
        ) : sessions.length > 0 && (
            <div className="p-4 border-t">
                <h4 className="flex items-center text-lg font-semibold mb-4"><History className="mr-2 h-5 w-5"/>Kick Count History</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {sessions.map((s) => (
                        <div key={s.id} className="grid grid-cols-3 gap-4 items-center text-sm p-3 bg-muted/50 rounded-lg">
                            <div className="font-mono text-muted-foreground">{new Date(s.startTime).toLocaleTimeString()}</div>
                            <div>Kicks: <Badge variant="secondary">{s.kicks}</Badge></div>
                            <div>Duration: <Badge variant="outline">{formatTime(s.duration)}</Badge></div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </Card>
  );
}


export default function LogPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 md:animate-fade-in-up animate-fade-in-mobile">
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <Tabs defaultValue="contractions" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contractions"><Timer className="mr-2 h-4 w-4"/>Contractions</TabsTrigger>
            <TabsTrigger value="kicks"><Footprints className="mr-2 h-4 w-4"/>Kicks</TabsTrigger>
          </TabsList>
          <TabsContent value="contractions">
            <ContractionTimer />
          </TabsContent>
          <TabsContent value="kicks">
            <KickCounter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

    
