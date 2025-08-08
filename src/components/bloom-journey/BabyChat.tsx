'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircleHeart, Loader2 } from 'lucide-react';

type BabyMessage = {
    text: string;
    audio: string;
}

export function BabyChat() {
  const currentWeek = 12; // In a real app, this would come from user data
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<BabyMessage | undefined>();
  const [initialLoad, setInitialLoad] = useState(true);

  const handleGetMessage = async () => {
    setLoading(true);
    setMessage(undefined);
    setInitialLoad(false);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Placeholder messages for different weeks
    const messages = [
      "Hi Mommy! I'm about the size of a plum now. I've been practicing my somersaults in here!",
      "I can hear your voice! It's my favorite sound. Keep talking to me, Mommy!",
      "My taste buds are developing! I wonder if you're eating anything yummy today?",
      "It's getting a little snug in here, but I feel so safe and warm. I can't wait to meet you soon!",
      "I'm growing stronger every day! Can you feel my little kicks?",
      "Your heartbeat is my favorite lullaby. I love being close to you, Mommy!"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    setMessage({
      text: randomMessage,
      audio: ''
    });
    
    setLoading(false);
  };

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 shadow-lg hover:shadow-primary/10 transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-sm font-medium font-body text-pink-800">A Message from Baby</CardTitle>
        <CardDescription className="text-xs">A daily hello from inside the womb.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-accent/50 rounded-lg min-h-[80px] flex items-center justify-center">
            {loading ? (
                <div className="space-y-2 w-full">
                    <div className="h-4 w-3/4 bg-primary/20 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-primary/20 rounded animate-pulse" />
                </div>
            ) : (
                <p className="text-center text-sm italic text-accent-foreground">
                    {initialLoad ? "Click the button to get a message from your little one!" : message?.text}
                </p>
            )}
        </div>
        {message?.audio && !loading && (
            <audio src={message.audio} controls className="w-full h-10"></audio>
        )}
        <Button onClick={handleGetMessage} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <MessageCircleHeart className="mr-2 h-4 w-4" />
          )}
          {loading ? 'Listening...' : 'Message from Baby'}
        </Button>
      </CardContent>
    </Card>
  );
}
