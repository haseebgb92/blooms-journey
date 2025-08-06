
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { yogaData } from "@/lib/yoga-data";

export default function YogaPage() {
  return (
    <div className="bg-background text-foreground py-12 animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-headline text-primary tracking-tight">Yoga & Wellness</h1>
          <p className="text-muted-foreground mt-2 font-body text-lg">Nurture your body and mind during this special time.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {yogaData.map((article, i) => (
            <Link key={article.slug} href={`/yoga/${article.slug}`}>
              <Card 
                className="overflow-hidden h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
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
          ))}
        </div>
      </div>
    </div>
  );
}
