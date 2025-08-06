'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Film, Newspaper } from "lucide-react";
import { resourcesData } from "@/lib/resources-data";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export default function ResourcesPage() {
  return (
    <div className="bg-background text-foreground py-12 md:animate-fade-in-up animate-fade-in-mobile">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-headline text-primary tracking-tight">Pregnancy Resources</h1>
          <p className="text-muted-foreground mt-2 font-body text-lg">Informative articles and videos to guide your journey.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {resourcesData.map((resource, i) => (
            <ScrollAnimatedCard key={resource.slug} index={i}>
              <Link href={`/${resource.type.toLowerCase()}s/${resource.slug}`}>
                <Card className="overflow-hidden h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <CardHeader className="p-0 relative">
                      <div className="absolute top-4 right-4 z-10">
                          {resource.type === 'Article' ? 
                              <div className="flex items-center gap-2 bg-secondary/80 backdrop-blur-sm text-secondary-foreground py-1 px-3 rounded-full text-sm">
                                  <Newspaper className="h-4 w-4"/>
                                  <span>Article</span>
                              </div>
                              :
                               <div className="flex items-center gap-2 bg-secondary/80 backdrop-blur-sm text-secondary-foreground py-1 px-3 rounded-full text-sm">
                                  <Film className="h-4 w-4"/>
                                  <span>Video</span>
                              </div>
                          }
                      </div>
                    <Image
                      src={resource.image}
                      alt={resource.title}
                      data-ai-hint={resource.imageHint}
                      width={600}
                      height={400}
                      className="w-full h-64 object-cover"
                    />
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="font-headline text-2xl mb-2">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
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
