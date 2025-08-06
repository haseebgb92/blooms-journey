
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Leaf, Newspaper, Timer, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/chat', label: 'Chat', icon: Users },
  { href: '/log', label: 'Log', icon: Timer },
  { href: '/yoga', label: 'Yoga', icon: Leaf },
  { href: '/resources', label: 'Resources', icon: Newspaper },
  { href: '/profile', label: 'Settings', icon: Settings },
];

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50">
      <nav className="flex items-center justify-around h-full">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-full h-full text-muted-foreground transition-colors text-center',
                isActive ? 'text-primary' : 'hover:text-primary'
              )}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
