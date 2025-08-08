'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Utensils, ChevronDown, ChevronUp, Calendar, Plus, Globe, Baby, Users, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useRouter } from 'next/navigation';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { differenceInDays } from 'date-fns';
import { mealService, Meal } from '@/lib/mealService';

export function MealPlanner() {
  const [openRecipes, setOpenRecipes] = useState<number[]>([]);
  const [currentWeek, setCurrentWeek] = useState(12);
  const [selectedCountry, setSelectedCountry] = useState('auto');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [locationMeals, setLocationMeals] = useState<Meal[]>([]);
  const [userLocation, setUserLocation] = useState<string>('');
  const [availableCountries, setAvailableCountries] = useState<{ code: string; name: string; flag: string }[]>([]);
  const router = useRouter();

  // Fetch user's pregnancy week and available countries
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDocRef = doc(firestore, "users", user.uid);
          const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
            if (doc.exists() && doc.data().dueDate) {
              const dueDate = doc.data().dueDate.toDate();
              const week = calculateCurrentWeek(dueDate);
              setCurrentWeek(week);
            } else {
              setCurrentWeek(12);
            }
            setIsLoading(false);
          });
          return () => unsubscribeSnapshot();
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentWeek(12);
          setIsLoading(false);
        }
      } else {
        setCurrentWeek(12);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load available countries
  useEffect(() => {
    const countries = mealService.getAvailableCountries();
    setAvailableCountries(countries);
  }, []);

  // Load location-based meals
  useEffect(() => {
    const loadLocationMeals = async () => {
      if (selectedCountry && selectedCountry !== 'auto') {
        try {
          const countryMeals = mealService.getCountryMeals(selectedCountry);
          if (countryMeals) {
            const allMeals = [
              ...countryMeals.meals.breakfast,
              ...countryMeals.meals.lunch,
              ...countryMeals.meals.dinner,
              ...countryMeals.meals.snacks
            ];
            setLocationMeals(allMeals);
          } else {
            setLocationMeals([]);
          }
        } catch (error) {
          console.error('Error loading location meals:', error);
          setLocationMeals([]);
        }
      } else {
        setLocationMeals([]);
      }
    };

    loadLocationMeals();
  }, [selectedCountry]);

  const calculateCurrentWeek = (dueDate: Date): number => {
    const today = new Date();
    const diffTime = Math.abs(dueDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const week = Math.max(1, Math.min(40, Math.floor((280 - diffDays) / 7) + 1));
    return week;
  };

  const getMeals = (): Meal[] => {
    let meals: Meal[] = [];

    // Get meals based on current week and selected category
    if (selectedCategory === 'all') {
      // Get meals from all categories
      const weekMeals = mealService.getWeekSpecificMeals(currentWeek, selectedCountry === 'auto' ? 'usa' : selectedCountry);
      meals = [
        ...weekMeals.breakfast,
        ...weekMeals.lunch,
        ...weekMeals.dinner,
        ...weekMeals.snacks
      ];
    } else {
      // Get meals for specific category
      const mealType = selectedCategory === 'snack' ? 'snacks' : selectedCategory as 'breakfast' | 'lunch' | 'dinner';
      const weekMeals = mealService.getWeekSpecificMeals(currentWeek, selectedCountry === 'auto' ? 'usa' : selectedCountry);
      meals = weekMeals[mealType] || [];
    }

    // Add location-based meals if available and different from current selection
    if (locationMeals.length > 0 && selectedCountry !== 'auto') {
      meals = [...meals, ...locationMeals];
    }

    // Remove duplicates based on title
    const uniqueMeals = meals.filter((meal, index, self) => 
      index === self.findIndex(m => m.title === meal.title)
    );

    return uniqueMeals.slice(0, 10); // Limit to 10 meals
  };

  const toggleRecipe = (index: number) => {
    setOpenRecipes(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const renderMealContent = (meal: Meal) => {
    return (
      <div className="space-y-3">
        <div>
          <h4 className="mobile-text-sm font-semibold text-primary/80 mb-2">Ingredients:</h4>
          <ul className="space-y-1">
            {meal.ingredients.map((ingredient, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1 flex-shrink-0">•</span>
                <span className="mobile-text-sm">{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="mobile-text-sm font-semibold text-primary/80 mb-2">Instructions:</h4>
          <ol className="space-y-1">
            {meal.instructions.map((instruction, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mobile-text-sm font-medium flex-shrink-0">
                  {idx + 1}.
                </span>
                <span className="mobile-text-sm">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>
        
        <div>
          <h4 className="mobile-text-sm font-semibold text-primary/80 mb-2">Nutrition:</h4>
          <div className="flex flex-wrap gap-1">
            {meal.nutrition.map((nutrient, idx) => (
              <span key={idx} className="mobile-text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                {nutrient}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="mobile-text-sm font-semibold text-primary/80 mb-2">Pregnancy Benefits:</h4>
          <p className="mobile-text-sm text-muted-foreground">{meal.pregnancy_benefits}</p>
        </div>
      </div>
    );
  };

  const meals = getMeals();

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 shadow-lg hover:shadow-primary/10 transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Utensils className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl text-pink-800">Meal Planner</CardTitle>
              <CardDescription>Loading your personalized meal suggestions...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 shadow-lg hover:shadow-primary/10 transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Utensils className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="font-headline text-2xl text-pink-800">Meal Planner</CardTitle>
            <CardDescription>
              Personalized meal suggestions for Week {currentWeek} of your pregnancy
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4">
          <h3 className="font-semibold text-primary mb-2">Your Personalized Meal Plan</h3>
          <p className="text-sm text-muted-foreground">
            These meals are specially selected for Week {currentWeek} of your pregnancy, focusing on the nutrients your baby needs most right now.
          </p>
          {userLocation && (
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">{userLocation}</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Category</label>
            <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Country Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Location</label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                {availableCountries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          {meals.length === 0 ? (
            <div className="text-center py-8">
              <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">No meals found</h3>
              <p className="text-gray-500">Try selecting a different category or location.</p>
            </div>
          ) : (
            meals.map((meal, index) => (
              <Collapsible
                key={index}
                open={openRecipes.includes(index)}
                onOpenChange={() => toggleRecipe(index)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left font-normal"
                  >
                    <span className="truncate">{meal.title}</span>
                    {openRecipes.includes(index) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>
                    {renderMealContent(meal)}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
