'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Utensils, Apple, Carrot, Fish, Leaf, Globe, Baby, Users, Calendar, MapPin, Loader2 } from 'lucide-react';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { differenceInDays } from 'date-fns';
import { mealService, Meal } from '@/lib/mealService';

export default function MealsPage() {
  const router = useRouter();
  const [selectedMeal, setSelectedMeal] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'>('all');
  const [selectedCountry, setSelectedCountry] = useState('auto');
  const [currentWeek, setCurrentWeek] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<string>('');
  const [availableCountries, setAvailableCountries] = useState<{ code: string; name: string; flag: string }[]>([]);
  const [locationMeals, setLocationMeals] = useState<Meal[]>([]);

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
      try {
        if (selectedCountry === 'auto') {
          setIsDetectingLocation(true);
          const meals = await mealService.getLocationBasedMeals(currentWeek, 'lunch');
          setLocationMeals(meals);
          setUserLocation('Your Location');
        } else {
          const meals = mealService.getMealsForCountry(selectedCountry, currentWeek, 'lunch');
          setLocationMeals(meals);
          const country = availableCountries.find(c => c.code === selectedCountry);
          setUserLocation(country?.name || selectedCountry);
        }
      } catch (error) {
        console.error('Error loading location meals:', error);
        const defaultMeals = mealService.getDefaultMeals(currentWeek, 'lunch');
        setLocationMeals(defaultMeals);
        setUserLocation('Global');
      } finally {
        setIsDetectingLocation(false);
      }
    };

    loadLocationMeals();
  }, [selectedCountry, currentWeek, availableCountries]);

  const calculateCurrentWeek = (dueDate: Date | undefined): number => {
    if (!dueDate) return 12;
    const week = 40 - Math.ceil(differenceInDays(dueDate, new Date()) / 7);
    return Math.max(1, Math.min(week, 40));
  };

  // Get meals based on selection
  const getMeals = () => {
    if (selectedMeal === 'all') {
      return locationMeals;
    }
    
    if (selectedCountry === 'auto') {
      return locationMeals.filter(meal => 
        meal.nutrition.some(n => n.toLowerCase().includes(selectedMeal))
      );
    } else {
      const countryMeals = mealService.getCountryMeals(selectedCountry);
      if (countryMeals) {
        return countryMeals.meals[selectedMeal] || [];
      }
    }
    
    return locationMeals;
  };

  const renderMealContent = (meal: Meal) => {
    return (
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-primary/80 mb-2">Ingredients:</h4>
          <ul className="space-y-1">
            {meal.ingredients.map((ingredient, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1 flex-shrink-0">•</span>
                <span className="text-sm">{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-primary/80 mb-2">Instructions:</h4>
          <ol className="space-y-1">
            {meal.instructions.map((instruction, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary text-sm font-medium flex-shrink-0">
                  {idx + 1}.
                </span>
                <span className="text-sm">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>
        
        <div>
          <h4 className="font-semibold text-primary/80 mb-2">Nutrition:</h4>
          <div className="flex flex-wrap gap-1">
            {meal.nutrition.map((nutrient, idx) => (
              <span key={idx} className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                {nutrient}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-primary/80 mb-2">Pregnancy Benefits:</h4>
          <p className="text-sm text-muted-foreground">{meal.pregnancy_benefits}</p>
        </div>
      </div>
    );
  };

  const meals = getMeals();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your personalized meal plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/home')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Meal Planner</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Current Week Card */}
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Baby className="w-6 h-6" />
                <span>Week {currentWeek} Nutrition Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">Personalized for Your Pregnancy</div>
                <p className="text-green-100">Optimized for your baby's development stage</p>
                {userLocation && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-green-100">{userLocation}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-6 h-6" />
                <span>Meal Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <Select value={selectedMeal} onValueChange={(value: any) => setSelectedMeal(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Meals</SelectItem>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snacks</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      {isDetectingLocation ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Detecting...
                        </div>
                      ) : (
                        "📍 Auto Detect"
                      )}
                    </SelectItem>
                    {availableCountries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Meal Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Utensils className="w-6 h-6" />
                <span>Personalized Meal Suggestions</span>
              </CardTitle>
              <CardDescription>
                Based on Week {currentWeek} of your pregnancy and {userLocation} preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {meals.length === 0 ? (
                  <div className="text-center py-8">
                    <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600">No meals found</h3>
                    <p className="text-gray-500">Try selecting a different category or location.</p>
                  </div>
                ) : (
                  meals.map((meal, index) => (
                    <Card key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-green-800">{meal.title}</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{meal.description}</p>
                            <div className="space-y-2">
                              {renderMealContent(meal)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Community Help */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-6 h-6" />
                <span>Need More Help?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Have specific questions about pregnancy nutrition? Join our community chat for personalized advice from other moms and our helpful community bot!
              </p>
              <Button 
                onClick={() => router.push('/community')}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Users className="w-4 h-4 mr-2" />
                Ask Community
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 