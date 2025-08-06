
'use client';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppHeader } from '@/components/layout/AppHeader';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { usePathname } from 'next/navigation';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { fontBody, fontHeadline } from '@/lib/fonts';
import { auth } from '@/lib/firebase/clientApp';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useIsMobile } from '@/hooks/use-mobile';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const noNavRoutes = ['/login', '/signup', '/'];
  const [user, setUser] = useState<User | null>(null);
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
       if (typeof window !== 'undefined') {
        sessionStorage.setItem('authenticated', user ? 'true' : 'false');
      }
    });

    return () => unsubscribe();
  }, []);

  const isAuthenticated = !!user;
  const showNav = isAuthenticated && !noNavRoutes.includes(pathname);
  const showHeader = showNav && !isMobile;
  const showBottomNav = showNav && isMobile;

  // Special case for profile page on mobile
  const isProfilePageOnMobile = isMobile && pathname === '/profile';
  const showHeaderOnProfileMobile = isProfilePageOnMobile ? false : showHeader;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Bloom Journey</title>
      </head>
      <body className={cn("antialiased bg-muted/40", fontBody.variable, fontHeadline.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            {isClient && showHeaderOnProfileMobile && <AppHeader />}
            <main className={`flex-1 ${showBottomNav ? 'pb-16' : ''}`}>{children}</main>
            {isClient && showBottomNav && <BottomNavBar />}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
