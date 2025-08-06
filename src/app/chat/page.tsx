
'use client';
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Bot } from "lucide-react";
import { getChatResponse } from "@/ai/flows/communityChat";
import { Skeleton } from "@/components/ui/skeleton";

type Message = {
    id: number;
    user: string;
    avatar: string;
    text: string;
    time: string;
    isMe?: boolean;
    isBot?: boolean;
};

const initialMessages: Message[] = [
    { id: 1, user: 'Jane Doe', avatar: 'https://placehold.co/100x100.png', text: 'Has anyone tried raspberry leaf tea? I heard it helps with labor!', time: '2:30 PM' },
];


export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            const userMessage: Message = {
                id: Date.now(),
                user: 'You',
                avatar: 'https://placehold.co/100x100.png',
                text: newMessage,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: true,
            };
            setMessages(prev => [...prev, userMessage]);
            setNewMessage('');
            setIsLoading(true);

            try {
                const aiResponse = await getChatResponse({ message: newMessage });
                const botMessage: Message = {
                    id: Date.now() + 1,
                    user: 'Chloe',
                    avatar: 'https://placehold.co/100x100.png',
                    text: aiResponse,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isBot: true,
                };
                setMessages(prev => [...prev, botMessage]);
            } catch (error) {
                console.error("Failed to get AI response:", error);
                 const errorMessage: Message = {
                    id: Date.now() + 1,
                    user: 'Chloe',
                    avatar: 'https://placehold.co/100x100.png',
                    text: "Sorry, I'm having a little trouble thinking right now. Please try again in a moment.",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isBot: true,
                };
                 setMessages(prev => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        }
    };
    
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 animate-fade-in-up">
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <Card className="max-w-4xl mx-auto h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-primary">Community Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.isMe ? 'justify-end' : ''}`}>
                        {!msg.isMe && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={msg.avatar} alt={msg.user} data-ai-hint={msg.isBot ? "friendly robot" : "woman smiling"} />
                                <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.isMe ? 'bg-primary text-primary-foreground' : msg.isBot ? 'bg-accent text-accent-foreground' : 'bg-secondary'}`}>
                            {!msg.isMe && <p className="text-xs font-bold mb-1 flex items-center gap-1">{msg.user} {msg.isBot && <Bot className="h-3 w-3" />}</p>}
                            <p>{msg.text}</p>
                            <p className={`text-xs mt-1 ${msg.isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</p>
                        </div>
                        {msg.isMe && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={msg.avatar} alt={msg.user} data-ai-hint="woman smiling" />
                                <AvatarFallback>Y</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-end gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://placehold.co/100x100.png" alt="Chloe" data-ai-hint="friendly robot" />
                            <AvatarFallback>C</AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-4 py-2 max-w-sm bg-accent text-accent-foreground">
                           <div className="space-y-2">
                              <Skeleton className="h-3 w-24 bg-primary/20" />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
            <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input 
                        placeholder="Type your message..." 
                        className="flex-1"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading}>
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
