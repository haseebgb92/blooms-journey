
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Baby, Settings, Home, Users, Timer, Leaf, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/clientApp';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { cn } from '@/lib/utils';
import { NotificationDropdown } from './NotificationDropdown';

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
    if (!name || name.trim() === '') return 'U';
    const nameParts = name.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return 'U';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return nameParts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
  }

  return (
    <header className="hidden lg:flex items-center justify-between bg-background/80 backdrop-blur-lg border-b sticky top-0 z-50 h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
            <Link href="/home" className="flex items-center gap-2 text-xl font-headline text-primary">
                <Baby className="h-6 w-6" />
                <span>Bloom Journey</span>
            </Link>

            <nav className="flex items-center gap-4">
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
            {user && <NotificationDropdown />}
        {user ? (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary aspect-square">
                    {getInitials(user.displayName)}
                </div>
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
                    <Link href="/profile" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        ) : (
            <Button asChild>
                <Link href="/login">Sign In</Link>
            </Button>
        )}
        </div>
    </header>
  );
}
