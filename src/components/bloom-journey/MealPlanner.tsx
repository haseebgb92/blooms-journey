'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Utensils } from 'lucide-react';
import { getMealSuggestion } from '@/ai/flows/mealSuggestion';
import { Skeleton } from '@/components/ui/skeleton';

export function MealPlanner() {
  const [preference, setPreference] = useState('');
  const [country, setCountry] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preference.trim() && country.trim() && location.trim()) {
      setLoading(true);
      setError(null);
      setData(undefined);
      try {
        const result = await getMealSuggestion({ country, location, preference });
        setData(result);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Card className="shadow-lg border-primary/20 hover:shadow-primary/10 transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Utensils className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="font-headline text-2xl">AI Meal Planner</CardTitle>
            <CardDescription>Get healthy meal ideas for you and your baby.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Input 
              placeholder="What's your country?"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="text-base"
            />
            <Input 
              placeholder="Your city/region"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="text-base"
            />
            <Input 
              placeholder="Any cravings or preferences?"
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
              className="text-base"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full font-bold">
            {loading ? 'Thinking...' : 'Get Meal Ideas'}
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        </form>
        <div className="mt-6 p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg min-h-[120px]">
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-primary/20" />
              <Skeleton className="h-4 w-full bg-primary/20" />
              <Skeleton className="h-4 w-3/4 bg-primary/20" />
            </div>
          )}
          {error && <p className="text-destructive text-sm">Sorry, something went wrong. Please try again.</p>}
          {data && <p className="text-sm whitespace-pre-wrap leading-relaxed font-serif">{data}</p>}
          {!loading && !data && !error && <p className="text-sm text-muted-foreground">Your personalized meal suggestions will appear here.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
