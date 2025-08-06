'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { yogaData } from "@/lib/yoga-data";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export default function YogaPage() {
  return (
    <div className="bg-background text-foreground py-12 md:animate-fade-in-up animate-fade-in-mobile">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-headline text-primary tracking-tight">Yoga & Wellness</h1>
          <p className="text-muted-foreground mt-2 font-body text-lg">Nurture your body and mind during this special time.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {yogaData.map((article, i) => (
            <ScrollAnimatedCard key={article.slug} index={i}>
              <Link href={`/yoga/${article.slug}`}>
                <Card className="overflow-hidden h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <CardHeader className="p-0">
                    <Image
                      src={article.image}
                      alt={article.title}
                      data-ai-hint={article.imageHint}
                      width={600}
                      height={400}
                      className="w-full h-64 object-cover"
                    />
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="font-headline text-2xl mb-2">{article.title}</CardTitle>
                    <CardDescription>{article.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </ScrollAnimatedCard>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScrollAnimatedCard({ children, index }: { children: React.ReactNode; index: number }) {
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
