
import { AiPregnancyPal } from '@/components/bloom-journey/AiPregnancyPal';
import { AppointmentReminders } from '@/components/bloom-journey/AppointmentReminders';
import { DueDateCountdown } from '@/components/bloom-journey/DueDateCountdown';
import { MealPlanner } from '@/components/bloom-journey/MealPlanner';
import { Journal } from '@/components/bloom-journey/Journal';
import { PregnancyTimeline } from '@/components/bloom-journey/PregnancyTimeline';
import { BabyChat } from '@/components/bloom-journey/BabyChat';
import { WaterIntakeTracker } from '@/components/bloom-journey/WaterIntakeTracker';
import { QuickJournal } from '@/components/bloom-journey/QuickJournal';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="bg-background text-foreground animate-fade-in-up">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PregnancyTimeline />
            <AiPregnancyPal />
            <MealPlanner />
            <Journal />
          </div>

          <div className="space-y-6">
            <DueDateCountdown />
            <BabyChat />
            <QuickJournal />
            <WaterIntakeTracker />
            <AppointmentReminders />
          </div>
        </div>
      </div>
    </div>
  );
}
