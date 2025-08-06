'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Utensils, ChevronDown, ChevronUp } from 'lucide-react';
import { getMealSuggestion } from '@/ai/flows/mealSuggestion';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function MealPlanner() {
  const [preference, setPreference] = useState('');
  const [country, setCountry] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<string | undefined>();
  const [openRecipes, setOpenRecipes] = useState<number[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preference.trim() && country.trim() && location.trim()) {
      setLoading(true);
      setError(null);
      setData(undefined);
      setOpenRecipes([0]); // Set first recipe as open by default
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

  const toggleRecipe = (recipeIndex: number) => {
    setOpenRecipes(prev => {
      if (prev.includes(recipeIndex)) {
        // If clicking on the currently open recipe, close it
        return [];
      } else {
        // Close all others and open this one
        return [recipeIndex];
      }
    });
  };

  const parseMealData = (data: string) => {
    const sections = data.split('\n\n').filter(section => section.trim());
    const meals: Array<{ title: string; content: string }> = [];
    
    let currentMeal: { title: string; content: string } | null = null;
    
    sections.forEach(section => {
      const lines = section.split('\n');
      const firstLine = lines[0].trim();
      
      // Check if this is a meal title (starts with ** and ends with **)
      if (firstLine.startsWith('**') && firstLine.endsWith('**')) {
        // Save previous meal if exists
        if (currentMeal) {
          meals.push(currentMeal);
        }
        // Start new meal
        currentMeal = {
          title: firstLine.slice(2, -2),
          content: lines.slice(1).join('\n')
        };
      } else if (currentMeal) {
        // Add to current meal content
        currentMeal.content += '\n' + section;
      }
    });
    
    // Add the last meal
    if (currentMeal) {
      meals.push(currentMeal);
    }
    
    return meals;
  };

  const renderMealContent = (content: string) => {
    const lines = content.split('\n');
    
    return lines.map((line, lineIndex) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;
      
      // Handle section headers (like "Ingredients:")
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        return (
          <h4 key={lineIndex} className="font-semibold text-primary/80 mt-3 mb-2">
            {trimmedLine.slice(2, -2)}
          </h4>
        );
      }
      
      // Handle bullet points
      if (trimmedLine.startsWith('- ')) {
        const bulletContent = trimmedLine.slice(2);
        
        // Check if this bullet point contains bold text (like "**Iron**: description")
        if (bulletContent.includes('**')) {
          const parts = bulletContent.split(/(\*\*.*?\*\*)/g);
          return (
            <span key={lineIndex} className="block ml-4 mb-1">
              <span className="text-primary">•</span>{' '}
              {parts.map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={partIndex} className="text-primary font-semibold">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              })}
            </span>
          );
        }
        
        // Regular bullet point without bold text
        return (
          <span key={lineIndex} className="block ml-4 mb-1">
            <span className="text-primary">•</span> {bulletContent}
          </span>
        );
      }
      
      // Handle bold text within lines (but not section headers)
      if (trimmedLine.includes('**') && !(trimmedLine.startsWith('**') && trimmedLine.endsWith('**'))) {
        const parts = trimmedLine.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={lineIndex} className="mb-2">
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={partIndex} className="text-primary font-semibold">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      }
      
      // Regular text
      return (
        <p key={lineIndex} className="mb-2">{trimmedLine}</p>
      );
    });
  };

  const meals = data ? parseMealData(data) : [];

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
          {meals.length > 0 && (
            <div className="space-y-4">
              {/* All meals use accordion system */}
              {meals.map((meal, index) => {
                const isOpen = openRecipes.includes(index);
                
                return (
                  <Collapsible
                    key={index}
                    open={isOpen}
                    onOpenChange={() => toggleRecipe(index)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-3 h-auto text-left hover:bg-primary/10"
                      >
                        <span className="text-primary font-semibold">{meal.title}</span>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-primary" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-primary" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <div className="text-sm leading-relaxed font-serif pl-3 border-l-2 border-primary/20">
                        {renderMealContent(meal.content)}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
          {!loading && !data && !error && <p className="text-sm text-muted-foreground">Your personalized meal suggestions will appear here.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
