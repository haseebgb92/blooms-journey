'use client';

import AiPregnancyPal from '@/components/bloom-journey/AiPregnancyPal';
import { AppointmentReminders } from '@/components/bloom-journey/AppointmentReminders';
import { DueDateCountdown } from '@/components/bloom-journey/DueDateCountdown';
import { MealPlanner } from '@/components/bloom-journey/MealPlanner';
import { Journal } from '@/components/bloom-journey/Journal';
import { PregnancyTimeline } from '@/components/bloom-journey/PregnancyTimeline';
import { BabyChat } from '@/components/bloom-journey/BabyChat';
import { WaterIntakeTracker } from '@/components/bloom-journey/WaterIntakeTracker';
import { QuickJournal } from '@/components/bloom-journey/QuickJournal';
import { CommunityChat } from '@/components/bloom-journey/CommunityChat';
import { BabyInfoWidget } from '@/components/bloom-journey/BabyInfoWidget';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Mobile Layout - Show on small screens */}
      <div className="lg:hidden">
        <div className="mobile-container py-4">
          <header className="relative rounded-xl overflow-hidden mb-6 shadow-lg bg-gradient-to-b from-primary/30 to-primary/50 h-48 flex flex-col justify-end p-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/images/chat.png"
                alt="Chat with AI Pregnancy Pal"
                width={400}
                height={400}
                className="opacity-10 w-full h-full object-contain animate-float"
              />
            </div>
            <div className="relative z-10 text-white">
              <h1 className="text-2xl font-headline tracking-tight text-primary-foreground">Welcome to Bloom Journey</h1>
              <p className="mt-1 font-body text-sm max-w-2xl text-primary-foreground/90">Your personal guide through pregnancy.</p>
            </div>
          </header>

          {/* Mobile grid - single column */}
          <div className="space-y-4">
            <ScrollAnimatedComponent index={0}>
              <PregnancyTimeline />
            </ScrollAnimatedComponent>
            <ScrollAnimatedComponent index={1}>
              <AiPregnancyPal />
            </ScrollAnimatedComponent>
            <ScrollAnimatedComponent index={2}>
              <MealPlanner />
            </ScrollAnimatedComponent>
            <ScrollAnimatedComponent index={3}>
              <Journal />
            </ScrollAnimatedComponent>
            <ScrollAnimatedComponent index={4}>
              <BabyInfoWidget />
            </ScrollAnimatedComponent>
            <ScrollAnimatedComponent index={5}>
              <DueDateCountdown />
            </ScrollAnimatedComponent>
            <ScrollAnimatedComponent index={6}>
              <BabyChat />
            </ScrollAnimatedComponent>
            <ScrollAnimatedComponent index={7}>
              <CommunityChat />
            </ScrollAnimatedComponent>
            <ScrollAnimatedComponent index={8}>
              <QuickJournal />
            </ScrollAnimatedComponent>
            <ScrollAnimatedComponent index={9}>
              <WaterIntakeTracker />
            </ScrollAnimatedComponent>
            <ScrollAnimatedComponent index={10}>
              <AppointmentReminders />
            </ScrollAnimatedComponent>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Show only on large screens */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="relative rounded-xl overflow-hidden mb-8 shadow-lg bg-gradient-to-b from-primary/30 to-primary/50 h-60 flex flex-col justify-end p-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/images/chat.png"
                alt="Chat with AI Pregnancy Pal"
                width={800}
                height={800}
                className="opacity-10 w-full h-full object-contain animate-float"
              />
            </div>
            <div className="relative z-10 text-white">
              <h1 className="text-3xl font-headline tracking-tight text-primary-foreground">Welcome to Bloom Journey</h1>
              <p className="mt-1 font-body text-sm max-w-2xl text-primary-foreground/90">Your personal guide through pregnancy.</p>
            </div>
          </header>

          {/* Desktop grid layout */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main content area - 3 columns on xl screens */}
            <div className="xl:col-span-3 space-y-6">
              <ScrollAnimatedComponent index={0}>
                <PregnancyTimeline />
              </ScrollAnimatedComponent>
              <ScrollAnimatedComponent index={1}>
                <AiPregnancyPal />
              </ScrollAnimatedComponent>
              <ScrollAnimatedComponent index={2}>
                <MealPlanner />
              </ScrollAnimatedComponent>
              <ScrollAnimatedComponent index={3}>
                <Journal />
              </ScrollAnimatedComponent>
            </div>

            {/* Sidebar - 1 column on xl screens */}
            <div className="space-y-6">
              <ScrollAnimatedComponent index={4}>
                <BabyInfoWidget />
              </ScrollAnimatedComponent>
              <ScrollAnimatedComponent index={5}>
                <DueDateCountdown />
              </ScrollAnimatedComponent>
              <ScrollAnimatedComponent index={6}>
                <BabyChat />
              </ScrollAnimatedComponent>
              <ScrollAnimatedComponent index={7}>
                <CommunityChat />
              </ScrollAnimatedComponent>
              <ScrollAnimatedComponent index={8}>
                <QuickJournal />
              </ScrollAnimatedComponent>
              <ScrollAnimatedComponent index={9}>
                <WaterIntakeTracker />
              </ScrollAnimatedComponent>
              <ScrollAnimatedComponent index={10}>
                <AppointmentReminders />
              </ScrollAnimatedComponent>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScrollAnimatedComponent({ children, index }: { children: React.ReactNode; index: number }) {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true
  });

  return (
    <div
      ref={elementRef}
      className={`transform transition-all duration-700 ease-out ${
        isVisible 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 translate-x-[-50px]'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {children}
    </div>
  );
}
