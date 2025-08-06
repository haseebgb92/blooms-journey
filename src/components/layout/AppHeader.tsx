
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Baby, Bell, Settings, Home, Users, Timer, Leaf, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/clientApp';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { cn } from '@/lib/utils';


const navLinks = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/chat', label: 'Chat', icon: Users },
  { href: '/log', label: 'Log', icon: Timer },
  { href: '/yoga', label: 'Yoga', icon: Leaf },
  { href: '/resources', label: 'Resources', icon: Newspaper },
];

export function AppHeader() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('authenticated');
    }
    router.push('/');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <header className="flex items-center justify-between bg-background/80 backdrop-blur-lg border-b sticky top-0 z-50 h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
            <Link href="/home" className="flex items-center gap-2 text-xl font-headline text-primary">
                <Baby className="h-6 w-6" />
                <span>Bloom Journey</span>
            </Link>

            <nav className="hidden md:flex items-center gap-4">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            'text-sm font-medium text-muted-foreground transition-colors',
                            isActive ? 'text-primary' : 'hover:text-primary'
                        )}
                        >
                        {link.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
        
        <div className="flex items-center gap-2">
            {user && (
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-accent">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
            </Button>
            )}
        {user ? (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || `https://placehold.co/100x100.png`} alt={user.displayName || 'User'} data-ai-hint="woman smiling" />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                    </p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile & Settings</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">Log out</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        ) : (
            <div className="flex items-center gap-2">
                <Button asChild variant="ghost">
                <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Sign Up</Link>
            </Button>
            </div>
        )}
        </div>
    </header>
  );
}
