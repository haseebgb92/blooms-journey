
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
import { BabyNotificationPopup } from '@/components/bloom-journey/BabyNotificationPopup';
import { FloatingNotificationButton } from '@/components/layout/FloatingNotificationButton';
import { MobileNotificationPopup } from '@/components/bloom-journey/MobileNotificationPopup';
import { initializeAppDataSync } from '@/lib/appDataService';

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

  useEffect(() => {
    if (isClient && isAuthenticated) {
      // Start the notification service
      const startNotificationService = async () => {
        try {
          const { notificationService } = await import('@/lib/notificationService');
          notificationService.startNotificationCheck();
          
          // Initialize mobile notifications
          try {
            await notificationService.initializeMobileNotifications();
          } catch (mobileError: any) {
            // Handle mobile notification errors gracefully
            if (mobileError.code === 'permission-denied') {
              console.log('Mobile notifications not available due to permissions');
            } else {
              console.error('Error initializing mobile notifications:', mobileError);
            }
          }
        } catch (error) {
          console.error('Error starting notification service:', error);
        }
      };
      
      startNotificationService();

      // Initialize app data sync
      initializeAppDataSync();

      // Cleanup on unmount
      return () => {
        const cleanup = async () => {
          try {
            const { notificationService } = await import('@/lib/notificationService');
            notificationService.stopNotificationCheck();
          } catch (error) {
            console.error('Error stopping notification service:', error);
          }
        };
        cleanup();
      };
    }
  }, [isClient, isAuthenticated]);

  const showNav = isAuthenticated && !noNavRoutes.includes(pathname);
  // Show header only on large screens (lg and up)
  const showHeader = showNav && !isMobile;
  // Show bottom navigation only on small screens (mobile)
  const showBottomNav = showNav && isMobile;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Bloom Journey</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#ec4899" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bloom Journey" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/icon.png" />
      </head>
      <body className={cn(
        "antialiased bg-muted/40 min-h-screen overflow-x-hidden",
        fontBody.variable, 
        fontHeadline.variable,
        "safe-area-top safe-area-bottom"
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen relative">
            {/* Mobile Status Bar Spacer */}
            {isMobile && <div className="h-0 safe-area-top" />}
            
            {/* Header - Large screens only (lg and up) */}
            {isClient && showHeader && (
              <div className="hidden lg:block">
                <AppHeader />
              </div>
            )}
            
            {/* Main Content */}
            <main className={cn(
              "flex-1 relative",
              showBottomNav ? 'pb-20 lg:pb-0' : '', // Extra padding for mobile bottom nav
              isMobile ? "mobile-container" : "container mx-auto px-4 sm:px-6 lg:px-8"
            )}>
              {children}
            </main>
            
            {/* Bottom Navigation - Small screens only (mobile) */}
            {isClient && showBottomNav && (
              <div className="lg:hidden">
                <BottomNavBar />
              </div>
            )}
            
            {/* Mobile Notifications - Only show on mobile */}
            {isClient && isAuthenticated && isMobile && <BabyNotificationPopup />}
            {isClient && isMobile && <FloatingNotificationButton />}
            {isClient && isMobile && <MobileNotificationPopup />}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
