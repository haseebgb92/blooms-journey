
import { resourcesData } from "@/lib/resources-data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function VideoPage({ params }: { params: { slug: string } }) {
  const video = resourcesData.find(
    (r) => r.type === "Video" && r.slug === params.slug
  );

  if (!video || !video.videoId) {
    notFound();
  }

  return (
    <div className="bg-muted/40 py-12 animate-fade-in-up">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/resources" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Link>
        </div>
        <Card>
          <CardHeader>
            <div className="aspect-video bg-black rounded-t-lg">
                <iframe
                    className="w-full h-full rounded-t-lg"
                    src={`https://www.youtube.com/embed/${video.videoId}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
            <CardTitle className="font-headline text-4xl pt-6">{video.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{video.description}</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
    return resourcesData
        .filter(r => r.type === 'Video')
        .map(video => ({ slug: video.slug }));
}
