'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Users, Heart, MessageSquare, Bot } from 'lucide-react';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: any;
  likes?: string[];
  isBot?: boolean;
}

export default function CommunityChatPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [botTimeout, setBotTimeout] = useState<NodeJS.Timeout | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    let unsubscribeSnapshot: (() => void) | undefined;

    const initChat = async () => {
      try {
        unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
          setUser(currentUser);
          
          if (currentUser) {
            try {
              const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
              if (userDoc.exists()) {
                setUserData(userDoc.data());
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
            }
          } else {
            router.push('/login');
            return;
          }
          
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error initializing chat:', error);
        setIsLoading(false);
      }
    };

    initChat();

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [router]);

  useEffect(() => {
    if (!user) return;

    let unsubscribeSnapshot: (() => void) | undefined;

    try {
      // Subscribe to community chat messages
      const q = query(
        collection(firestore, 'communityChat'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const newMessages: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          newMessages.push({ id: doc.id, ...doc.data() } as ChatMessage);
        });
        setMessages(newMessages.reverse());
        
        // Scroll to bottom
        setTimeout(() => {
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
          }
        }, 100);
      }, (error) => {
        console.error('Error listening to messages:', error);
      });
    } catch (error) {
      console.error('Error setting up message listener:', error);
    }

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [user]);

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Pregnancy-related questions
    if (message.includes('pregnancy') || message.includes('pregnant')) {
      return "Congratulations on your pregnancy! Remember to eat a balanced diet rich in folic acid, iron, and protein. Stay hydrated and get plenty of rest. Always consult your healthcare provider for personalized advice! 💕";
    }
    
    if (message.includes('food') || message.includes('eat') || message.includes('diet') || message.includes('meal')) {
      return "For a healthy pregnancy diet, focus on:\n• Leafy greens (folic acid)\n• Lean proteins (chicken, fish, beans)\n• Whole grains (fiber)\n• Dairy products (calcium)\n• Fruits and vegetables (vitamins)\n\nAvoid raw fish, unpasteurized dairy, and excessive caffeine. Small, frequent meals can help with nausea! 🥗";
    }
    
    if (message.includes('nausea') || message.includes('morning sickness')) {
      return "Morning sickness is common in the first trimester! Try:\n• Eating small, frequent meals\n• Ginger tea or ginger candies\n• Avoiding spicy or greasy foods\n• Staying hydrated\n• Resting when needed\n\nIt usually improves by week 12-14. Hang in there! 🌸";
    }
    
    if (message.includes('exercise') || message.includes('workout') || message.includes('fitness')) {
      return "Exercise during pregnancy is great! Safe options include:\n• Walking (30 minutes daily)\n• Prenatal yoga\n• Swimming\n• Light strength training\n• Pelvic floor exercises\n\nListen to your body and avoid high-impact activities. Always check with your doctor first! 💪";
    }
    
    if (message.includes('sleep') || message.includes('rest') || message.includes('tired')) {
      return "Fatigue is very common during pregnancy! Tips for better sleep:\n• Sleep on your left side\n• Use pregnancy pillows\n• Avoid caffeine after 2 PM\n• Create a relaxing bedtime routine\n• Take short naps during the day\n\nYour body is working hard growing a baby - rest is essential! 😴";
    }
    
    if (message.includes('baby') || message.includes('development') || message.includes('week')) {
      return "Your baby is growing and developing every day! Each week brings new milestones:\n• First trimester: Major organs form\n• Second trimester: Baby movements start\n• Third trimester: Baby gains weight rapidly\n\nTrack your pregnancy week to see what's happening with your little one! 👶";
    }
    
    if (message.includes('doctor') || message.includes('appointment') || message.includes('healthcare')) {
      return "Regular prenatal care is crucial! You should:\n• See your doctor monthly (first 2 trimesters)\n• Visit every 2 weeks (weeks 28-36)\n• Weekly visits (weeks 36-40)\n• Call immediately if you have concerns\n\nDon't hesitate to reach out to your healthcare provider with any questions! 🏥";
    }
    
    if (message.includes('partner') || message.includes('husband') || message.includes('family')) {
      return "Involving your partner and family in your pregnancy journey is wonderful! They can:\n• Attend appointments with you\n• Help with household tasks\n• Provide emotional support\n• Learn about pregnancy together\n• Plan for the baby's arrival\n\nYou're not alone in this beautiful journey! 💑";
    }
    
    // Default response
    return "Hi! I'm here to help with your pregnancy questions. Feel free to ask about nutrition, exercise, symptoms, baby development, or anything else pregnancy-related. Remember, I'm just a helpful bot - always consult your healthcare provider for medical advice! 🤖💕";
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user || isSending) return;

    setIsSending(true);
    try {
      const messageData = {
        text: message.trim(),
        userId: user.uid,
        userName: userData?.displayName || user.displayName || 'Anonymous',
        userAvatar: user.photoURL || '',
        timestamp: serverTimestamp(),
        likes: []
      };

      await addDoc(collection(firestore, 'communityChat'), messageData);
      setMessage('');

      // Set up bot response after 15 seconds if no one else responds
      if (botTimeout) {
        clearTimeout(botTimeout);
      }

      const timeout = setTimeout(async () => {
        // Check if anyone else has responded in the last 15 seconds
        const recentMessages = messages.filter(msg => 
          msg.timestamp?.toDate && 
          (new Date().getTime() - msg.timestamp.toDate().getTime()) < 15000 &&
          msg.userId !== user.uid
        );

        if (recentMessages.length === 0) {
          // No one responded, send bot message
          const botResponse = getBotResponse(message.trim());
          const botMessageData = {
            text: botResponse,
            userId: 'community-bot',
            userName: 'Community Helper',
            userAvatar: '/images/icon.png',
            timestamp: serverTimestamp(),
            isBot: true,
            likes: []
          };
          await addDoc(collection(firestore, 'communityChat'), botMessageData);
        }
      }, 15000);

      setBotTimeout(timeout);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleLike = async (messageId: string) => {
    if (!user) return;

    try {
      const messageRef = doc(firestore, 'communityChat', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (messageDoc.exists()) {
        const currentLikes = messageDoc.data().likes || [];
        const userLiked = currentLikes.includes(user.uid);
        
        const updatedLikes = userLiked 
          ? currentLikes.filter((id: string) => id !== user.uid)
          : [...currentLikes, user.uid];

        await addDoc(collection(firestore, 'communityChat'), {
          ...messageDoc.data(),
          likes: updatedLikes
        });
      }
    } catch (error) {
      console.error('Error liking message:', error);
    }
  };

  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return 'U';
    const nameParts = name.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return 'U';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return nameParts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading community chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/home')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">Community Chat</h1>
            <div className="flex items-center justify-center space-x-2 mt-1">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">{onlineUsers} online</span>
              <Badge variant="secondary" className="ml-2">
                <Bot className="w-3 h-3 mr-1" />
                Bot Available
              </Badge>
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">Welcome to the Community!</h3>
                <p className="text-gray-500">Be the first to start a conversation.</p>
                <p className="text-sm text-gray-400 mt-2">Our community helper will respond if no one else does within 15 seconds!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.userId === user?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <Card className={`max-w-xs ${msg.userId === user?.uid ? 'bg-blue-500 text-white' : msg.isBot ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-2">
                        {msg.userId !== user?.uid && (
                          <Avatar className="w-6 h-6 flex-shrink-0">
                            <AvatarImage src={msg.userAvatar} />
                            <AvatarFallback className="text-xs">
                              {msg.isBot ? <Bot className="w-3 h-3" /> : getInitials(msg.userName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1">
                          {msg.userId !== user?.uid && (
                            <p className={`text-xs font-semibold mb-1 ${msg.userId === user?.uid ? 'text-blue-100' : msg.isBot ? 'text-green-700' : 'text-gray-600'}`}>
                              {msg.userName}
                              {msg.isBot && <span className="ml-1">🤖</span>}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-line">{msg.text}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className={`text-xs opacity-70 ${msg.userId === user?.uid ? 'text-blue-100' : msg.isBot ? 'text-green-600' : 'text-gray-500'}`}>
                              {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString() : 'Just now'}
                            </p>
                            {!msg.isBot && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLike(msg.id)}
                                className={`h-6 w-6 p-0 ${msg.userId === user?.uid ? 'text-blue-100 hover:text-blue-200' : 'text-gray-400 hover:text-red-500'}`}
                              >
                                <Heart className={`w-3 h-3 ${msg.likes?.includes(user?.uid || '') ? 'fill-red-500 text-red-500' : ''}`} />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about pregnancy, nutrition, exercise, or anything else..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isSending}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isSending || !message.trim()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <div className="max-w-2xl mx-auto mt-2">
          <p className="text-xs text-gray-500 text-center">
            💡 Tip: If no one responds within 15 seconds, our community helper will provide helpful pregnancy advice!
          </p>
        </div>
      </div>
    </div>
  );
} 