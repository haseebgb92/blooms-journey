'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Wand2 } from 'lucide-react';

export function AiPregnancyPal() {
  const [topic, setTopic] = useState('');
  const currentWeek = 12;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      setLoading(true);
      setData(undefined);
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Placeholder advice based on common topics
      const adviceMap: { [key: string]: string } = {
        'nutrition': 'Focus on a balanced diet rich in folic acid, iron, calcium, and protein. Include plenty of fruits, vegetables, whole grains, and lean proteins. Stay hydrated and avoid raw fish, unpasteurized dairy, and excessive caffeine.',
        'exercise': 'Gentle exercise like walking, swimming, and prenatal yoga are excellent choices. Aim for 30 minutes of moderate activity most days. Always consult your healthcare provider before starting any new exercise routine.',
        'symptoms': 'Common symptoms include morning sickness, fatigue, and mood swings. These are normal but if you experience severe symptoms, contact your healthcare provider immediately.',
        'sleep': 'Sleep can be challenging during pregnancy. Try sleeping on your left side, use pregnancy pillows, and establish a relaxing bedtime routine. Avoid caffeine and large meals before bed.'
      };
      
      const lowerTopic = topic.toLowerCase();
      let advice = 'I understand you\'re asking about pregnancy. Here\'s some general advice: Stay hydrated, get plenty of rest, and always consult your healthcare provider for personalized guidance.';
      
      for (const [key, value] of Object.entries(adviceMap)) {
        if (lowerTopic.includes(key)) {
          advice = value;
          break;
        }
      }
      
      setData(advice);
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-primary/20 hover:shadow-primary/10 transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Wand2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="font-headline text-2xl">AI Pregnancy Pal</CardTitle>
            <CardDescription>Get AI-powered advice for your pregnancy stage.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            placeholder="Ask about nutrition, exercise, symptoms..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="text-base"
          />
          <Button type="submit" disabled={loading} className="w-full font-bold">
            {loading ? 'Thinking...' : 'Get Advice'}
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        </form>
        <div className="mt-6 p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg min-h-[120px]">
          {loading && (
            <div className="space-y-2">
              <div className="h-4 w-full bg-primary/20 rounded animate-pulse" />
              <div className="h-4 w-full bg-primary/20 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-primary/20 rounded animate-pulse" />
            </div>
          )}
          {data && <p className="text-sm whitespace-pre-wrap leading-relaxed font-serif">{data}</p>}
          {!loading && !data && <p className="text-sm text-muted-foreground">Your personalized advice will appear here.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
