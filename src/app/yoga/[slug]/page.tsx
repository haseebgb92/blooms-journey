
import { yogaData } from "@/lib/yoga-data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function YogaArticlePage({ params }: { params: { slug: string } }) {
  const article = yogaData.find(
    (a) => a.slug === params.slug
  );

  if (!article) {
    notFound();
  }

  return (
    <div className="bg-muted/40 py-12 animate-fade-in-up">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/yoga" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Yoga & Wellness
          </Link>
        </div>
        <Card>
          <CardHeader>
            <Image
              src={article.image}
              alt={article.title}
              data-ai-hint={article.imageHint}
              width={1200}
              height={600}
              className="w-full h-auto object-cover rounded-t-lg mb-4"
            />
            <CardTitle className="font-headline text-4xl">{article.title}</CardTitle>
            <CardDescription className="pt-2">{article.description}</CardDescription>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>{article.content}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
    return yogaData.map(article => ({ slug: article.slug }));
}
