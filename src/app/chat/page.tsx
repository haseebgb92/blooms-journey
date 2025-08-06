
'use client';
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Bot, AlertCircle, Users } from "lucide-react";
import { getChatResponse } from "@/ai/flows/communityChat";
import { Skeleton } from "@/components/ui/skeleton";
import { auth, firestore } from "@/lib/firebase/clientApp";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type Message = {
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: Timestamp;
    isBot?: boolean;
    isMe?: boolean;
};

const getInitials = (name: string) => {
    if (!name || name.trim() === '') return 'U';
    const nameParts = name.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return 'U';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return nameParts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
};

const BOT_RESPONSE_DELAY = 30000; // 30 seconds before bot responds if no human response

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [userGender, setUserGender] = useState<string | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [lastHumanMessageTime, setLastHumanMessageTime] = useState<number>(Date.now());
    const [botResponseTimer, setBotResponseTimer] = useState<NodeJS.Timeout | null>(null);
    const [isBotActive, setIsBotActive] = useState(false);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [lastBotResponseTime, setLastBotResponseTime] = useState<number>(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const userDocRef = doc(firestore, 'users', currentUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUserGender(userData.gender || 'mother');
                    } else {
                        setUserGender('mother');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setUserGender('mother');
                }
            }
            setIsLoadingUser(false);
        });

        return () => unsubscribe();
    }, []);

    // Listen to real-time messages
    useEffect(() => {
        if (!user || userGender !== 'mother') return;

        const messagesRef = collection(firestore, 'communityChat');
        const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages: Message[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                newMessages.push({
                    id: doc.id,
                    userId: data.userId,
                    userName: data.userName,
                    text: data.text,
                    timestamp: data.timestamp,
                    isBot: data.isBot || false,
                    isMe: data.userId === user.uid
                });
            });
            setMessages(newMessages);
            
            // Check if there are human messages in the last 30 seconds
            const now = Date.now();
            const recentHumanMessages = newMessages.filter(msg => 
                !msg.isBot && 
                msg.timestamp && 
                now - msg.timestamp.toMillis() < BOT_RESPONSE_DELAY
            );
            
            if (recentHumanMessages.length > 0) {
                setLastHumanMessageTime(now);
                setIsBotActive(false);
                // Clear any existing bot response timer
                if (botResponseTimer) {
                    clearTimeout(botResponseTimer);
                    setBotResponseTimer(null);
                }
            }
        }, (error) => {
            console.error("Error listening to messages:", error);
            toast({
                title: "Connection Error",
                description: "Unable to load messages. Please refresh the page.",
                variant: "destructive",
            });
        });

        return () => unsubscribe();
    }, [user, userGender]);

    // Handle bot response timer
    useEffect(() => {
        if (!user || userGender !== 'mother' || isBotActive) return;

        const now = Date.now();
        const timeSinceLastHuman = now - lastHumanMessageTime;
        
        // Clear any existing timer
        if (botResponseTimer) {
            clearTimeout(botResponseTimer);
        }
        
        if (timeSinceLastHuman >= BOT_RESPONSE_DELAY) {
            // No human response in 30 seconds, bot should respond
            handleBotResponse();
        } else {
            // Set timer for bot response
            const remainingTime = BOT_RESPONSE_DELAY - timeSinceLastHuman;
            const timer = setTimeout(() => {
                handleBotResponse();
            }, remainingTime);
            setBotResponseTimer(timer);
        }

        return () => {
            if (botResponseTimer) {
                clearTimeout(botResponseTimer);
            }
        };
    }, [lastHumanMessageTime, user, userGender, isBotActive]);

    const handleBotResponse = async () => {
        if (isBotActive || isBotTyping) return;
        
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.isBot) return;

        // Don't respond to messages older than 5 minutes
        const now = Date.now();
        if (lastMessage.timestamp && now - lastMessage.timestamp.toMillis() > 300000) {
            return;
        }

        // Rate limiting: Don't respond more than once every 60 seconds
        if (now - lastBotResponseTime < 60000) {
            return;
        }

        setIsBotActive(true);
        setIsBotTyping(true);

        try {
            const aiResponse = await getChatResponse({ message: lastMessage.text });
            await addDoc(collection(firestore, 'communityChat'), {
                userId: 'bot',
                userName: 'Bloom Bot',
                text: aiResponse,
                timestamp: serverTimestamp(),
                isBot: true
            });
            setLastBotResponseTime(now);
        } catch (error) {
            console.error("Failed to get AI response:", error);
            // Provide a more helpful fallback response
            const fallbackResponses = [
                "I'm here to support you! Feel free to ask any questions about your pregnancy journey.",
                "That's a great question! I'm sure other mothers in the community would love to share their experiences.",
                "I'm here to help! Don't hesitate to reach out with any pregnancy-related questions.",
                "You're not alone in this journey! Feel free to ask anything - we're all here to support each other."
            ];
            const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
            
            await addDoc(collection(firestore, 'communityChat'), {
                userId: 'bot',
                userName: 'Bloom Bot',
                text: randomResponse,
                timestamp: serverTimestamp(),
                isBot: true
            });
            setLastBotResponseTime(now);
        } finally {
            setIsBotActive(false);
            setIsBotTyping(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        setIsLoading(true);
        try {
            await addDoc(collection(firestore, 'communityChat'), {
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                text: newMessage.trim(),
                timestamp: serverTimestamp(),
                isBot: false
            });
            
            setNewMessage('');
            setLastHumanMessageTime(Date.now());
            
            // Clear any existing bot response timer since a human just responded
            if (botResponseTimer) {
                clearTimeout(botResponseTimer);
                setBotResponseTimer(null);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            toast({
                title: "Error",
                description: "Failed to send message. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading state while checking user authentication
    if (isLoadingUser) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                <Skeleton className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    // Show access denied for partners
    if (userGender === 'partner') {
        return (
            <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 animate-fade-in-up">
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Card className="max-w-4xl mx-auto h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-headline text-primary flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                Access Restricted
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                                <h3 className="text-lg font-semibold text-red-800 mb-2">Community Chat Access Restricted</h3>
                                <p className="text-red-700 mb-4">
                                    The community chat is exclusively for mothers and pregnant individuals to share their experiences and support each other.
                                </p>
                                <p className="text-sm text-red-600">
                                    Partners and support persons can still access other features of the app to support their loved ones.
                                </p>
                            </div>
                            <Button onClick={() => router.push('/home')} variant="outline">
                                Return to Home
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 md:animate-fade-in-up animate-fade-in-mobile">
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <Card className="max-w-4xl mx-auto h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline text-primary flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Community Chat
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Connect with other mothers. Bloom Bot will help if no one responds within 30 seconds.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded-md border border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Bloom Bot is online and ready to help</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                                <div>
                                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-semibold">Welcome to the Community!</p>
                                    <p className="text-sm">Start a conversation with other mothers. Share your experiences, ask questions, and support each other.</p>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={`flex items-end gap-2 ${msg.isMe ? 'justify-end' : ''}`}>
                                    {!msg.isMe && (
                                        <Avatar className="h-8 w-8 bg-primary/10">
                                            <AvatarFallback className="text-xs font-semibold text-primary">
                                                {getInitials(msg.userName)}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.isMe ? 'bg-primary text-primary-foreground' : msg.isBot ? 'bg-accent text-accent-foreground' : 'bg-secondary'}`}>
                                        {!msg.isMe && (
                                            <div className="text-xs font-bold mb-1 flex items-center gap-1">
                                                {msg.userName} 
                                                {msg.isBot && <Bot className="h-3 w-3" />}
                                            </div>
                                        )}
                                        <p>{msg.text}</p>
                                        <p className={`text-xs mt-1 ${msg.isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            {msg.timestamp ? new Date(msg.timestamp.toMillis()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                        </p>
                                    </div>
                                    {msg.isMe && (
                                        <Avatar className="h-8 w-8 bg-primary/10">
                                            <AvatarFallback className="text-xs font-semibold text-primary">
                                                {getInitials(user?.displayName || 'You')}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex items-end gap-2 justify-end">
                                <div className="rounded-lg px-4 py-2 max-w-sm bg-primary text-primary-foreground">
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                                <Avatar className="h-8 w-8 bg-primary/10">
                                    <AvatarFallback className="text-xs font-semibold text-primary">
                                        {getInitials(user?.displayName || 'You')}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        )}
                        {isBotTyping && (
                            <div className="flex items-end gap-2">
                                <Avatar className="h-8 w-8 bg-primary/10">
                                    <AvatarFallback className="text-xs font-semibold text-primary">B</AvatarFallback>
                                </Avatar>
                                <div className="rounded-lg px-4 py-2 max-w-sm bg-accent text-accent-foreground">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-bold">Bloom Bot</span>
                                        <Bot className="h-3 w-3" />
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                        <span className="text-xs ml-2">typing...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>
                    <div className="p-4 border-t">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <Input 
                                placeholder="Share your experience or ask a question..." 
                                className="flex-1"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={isLoading}
                            />
                            <Button type="submit" disabled={isLoading || !newMessage.trim()}>
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Send</span>
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
}
