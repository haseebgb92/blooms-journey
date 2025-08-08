import pregnancyMeals from './pregnancy-meals.json';

export interface Meal {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  nutrition: string[];
  pregnancy_benefits: string;
}

export interface CountryMeals {
  name: string;
  flag: string;
  meals: {
    breakfast: Meal[];
    lunch: Meal[];
    dinner: Meal[];
    snacks: Meal[];
  };
}

export interface PregnancyMealsData {
  countries: {
    [key: string]: CountryMeals;
  };
}

// Default countries if location detection fails
const DEFAULT_COUNTRIES = ['usa', 'uk', 'pakistan', 'india'];

// Country mapping based on common locations
const COUNTRY_MAPPING: { [key: string]: string } = {
  'united states': 'usa',
  'usa': 'usa',
  'us': 'usa',
  'america': 'usa',
  'united kingdom': 'uk',
  'uk': 'uk',
  'england': 'uk',
  'britain': 'uk',
  'pakistan': 'pakistan',
  'india': 'india',
  'china': 'china',
  'japan': 'japan',
  'italy': 'italy',
  'mexico': 'mexico',
  'france': 'france',
  'germany': 'germany',
  'australia': 'australia',
  'australian': 'australia',
};

export class MealService {
  private static instance: MealService;
  private mealsData: PregnancyMealsData;

  private constructor() {
    this.mealsData = pregnancyMeals as PregnancyMealsData;
  }

  static getInstance(): MealService {
    if (!MealService.instance) {
      MealService.instance = new MealService();
    }
    return MealService.instance;
  }

  // Get user's location and suggest meals
  async getLocationBasedMeals(week: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'lunch'): Promise<Meal[]> {
    try {
      const country = await this.detectUserLocation();
      return this.getMealsForCountry(country, week, mealType);
    } catch (error) {
      console.log('Location detection failed, using default meals');
      return this.getDefaultMeals(week, mealType);
    }
  }

  // Detect user's location using browser API
  private async detectUserLocation(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const country = await this.reverseGeocode(latitude, longitude);
            resolve(country);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          console.log('Geolocation error:', error);
          reject(error);
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 600000 // 10 minutes
        }
      );
    });
  }

  // Reverse geocoding to get country from coordinates
  private async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      const countryName = data.countryName?.toLowerCase() || '';
      
      // Map country name to our country code
      const countryCode = COUNTRY_MAPPING[countryName] || 'usa';
      console.log(`Detected country: ${countryName} -> ${countryCode}`);
      
      return countryCode;
    } catch (error) {
      console.log('Reverse geocoding failed:', error);
      throw error;
    }
  }

  // Get meals for specific country and week
  getMealsForCountry(countryCode: string, week: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): Meal[] {
    const country = this.mealsData.countries[countryCode];
    
    if (!country) {
      console.log(`Country ${countryCode} not found, using default`);
      return this.getDefaultMeals(week, mealType);
    }

    const meals = country.meals[mealType] || [];
    
    // Filter meals based on pregnancy week (if needed)
    // For now, return all meals for the country
    return meals.slice(0, 5); // Return top 5 meals
  }

  // Get default meals if location detection fails
  getDefaultMeals(week: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): Meal[] {
    const allMeals: Meal[] = [];
    
    // Collect meals from default countries
    DEFAULT_COUNTRIES.forEach(countryCode => {
      const country = this.mealsData.countries[countryCode];
      if (country && country.meals[mealType]) {
        allMeals.push(...country.meals[mealType]);
      }
    });

    // Return random selection of 5 meals
    return this.shuffleArray(allMeals).slice(0, 5);
  }

  // Get all available countries
  getAvailableCountries(): { code: string; name: string; flag: string }[] {
    return Object.entries(this.mealsData.countries).map(([code, country]) => ({
      code,
      name: country.name,
      flag: country.flag
    }));
  }

  // Get meals for specific country
  getCountryMeals(countryCode: string): CountryMeals | null {
    return this.mealsData.countries[countryCode] || null;
  }

  // Get meal suggestions based on pregnancy week
  getWeekSpecificMeals(week: number, countryCode: string = 'usa'): {
    breakfast: Meal[];
    lunch: Meal[];
    dinner: Meal[];
    snacks: Meal[];
  } {
    const country = this.mealsData.countries[countryCode];
    
    if (!country) {
      return {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      };
    }

    // For now, return all meals for the country
    // In the future, you could filter based on week-specific nutritional needs
    return {
      breakfast: country.meals.breakfast.slice(0, 3),
      lunch: country.meals.lunch.slice(0, 3),
      dinner: country.meals.dinner.slice(0, 3),
      snacks: country.meals.snacks.slice(0, 3)
    };
  }

  // Utility function to shuffle array
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get nutritional recommendations based on pregnancy week
  getNutritionalRecommendations(week: number): string[] {
    if (week <= 12) {
      return ['folic acid', 'iron', 'protein', 'vitamin d'];
    } else if (week <= 26) {
      return ['calcium', 'protein', 'omega-3', 'vitamin d', 'iron'];
    } else {
      return ['protein', 'iron', 'calcium', 'fiber', 'omega-3'];
    }
  }

  // Filter meals by nutritional content
  filterMealsByNutrition(meals: Meal[], nutrients: string[]): Meal[] {
    return meals.filter(meal => 
      nutrients.some(nutrient => 
        meal.nutrition.some(n => n.toLowerCase().includes(nutrient.toLowerCase()))
      )
    );
  }
}

export const mealService = MealService.getInstance(); 