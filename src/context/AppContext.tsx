import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AppState, 
  Workout, 
  Food, 
  DailyData, 
  WaterLog,
  MealPlanPreferences,
  MealPlanItem,
  WorkoutPlanPreferences,
  WorkoutPlanExercise,
  DailyWorkoutPlan
} from '../types';

export interface UserProfile {
  name: string;
  currentWeight: number;
  height: number;
  goalWeight: number;
  allergies: string[];
}

interface AppContextType {
  appState: AppState;
  userProfile: UserProfile | null;
  addWorkout: (workout: Omit<Workout, 'id' | 'timestamp'>) => Promise<void>;
  addFood: (food: Omit<Food, 'id' | 'timestamp' | 'totalProtein'>) => Promise<void>;
  addWaterLog: (amount: number) => Promise<void>;
  setProteinGoal: (goal: number) => Promise<void>;
  setWaterGoal: (goal: number) => Promise<void>;
  setUserProfile: (profile: UserProfile) => Promise<void>;
  getTodayData: () => DailyData;
  getDataForDate: (date: string) => DailyData;
  setMealPlanPreferences: (preferences: MealPlanPreferences) => Promise<void>;
  generateMealPlan: (preferences: MealPlanPreferences, startDate: string) => Promise<void>;
  updateDailyMealPlan: (date: string, meals: MealPlanItem[]) => Promise<void>;
  toggleMealPlanItem: (date: string, mealId: string) => Promise<void>;
  setWorkoutPlanPreferences: (preferences: WorkoutPlanPreferences) => Promise<void>;
  generateWorkoutPlan: (preferences: WorkoutPlanPreferences, startDate: string) => Promise<void>;
  updateDailyWorkoutPlan: (date: string, exercises: WorkoutPlanExercise[]) => Promise<void>;
  updateWorkoutPlanExercise: (date: string, exerciseId: string, actualData: Partial<WorkoutPlanExercise>) => Promise<void>;
  toggleWorkoutPlanExercise: (date: string, exerciseId: string) => Promise<void>;
  getStartDate: () => string | undefined;
  setStartDate: (date: string) => Promise<void>;
  clearAllWorkoutData: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = '@nuFit_data';
const PROFILE_KEY = '@nuFit_profile';

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const calculateWaterGoal = (weight: number): number => {
  // Recommended: 30-35ml per kg of body weight
  return Math.round(weight * 33);
};

const getEmptyDailyData = (date: string, proteinGoal: number, waterGoal: number): DailyData => ({
  date,
  workouts: [],
  foods: [],
  waterLogs: [],
  totalActiveCalories: 0,
  totalCalories: 0,
  totalProtein: 0,
  totalWater: 0,
  proteinGoal,
  waterGoal,
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>({
    dailyData: {},
    proteinGoal: 150, // Default protein goal
    waterGoal: 2500, // Default water goal in ml (2.5L)
  });
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveData();
    }
  }, [appState, isLoaded]);

  useEffect(() => {
    if (isLoaded && userProfile) {
      saveProfile();
    }
  }, [userProfile, isLoaded]);

  const loadData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setAppState(JSON.parse(storedData));
      }
      const storedProfile = await AsyncStorage.getItem(PROFILE_KEY);
      if (storedProfile) {
        setUserProfileState(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const saveProfile = async () => {
    try {
      if (userProfile) {
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const getTodayData = (): DailyData => {
    const today = getTodayDate();
    return appState.dailyData[today] || getEmptyDailyData(today, appState.proteinGoal, appState.waterGoal);
  };

  const addWorkout = async (workout: Omit<Workout, 'id' | 'timestamp'>) => {
    const workoutDate = workout.date || getTodayDate();
    const newWorkout: Workout = {
      ...workout,
      date: workoutDate,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    setAppState((prev) => {
      const dateData = prev.dailyData[workoutDate] || getEmptyDailyData(workoutDate, prev.proteinGoal, prev.waterGoal);
      const updatedWorkouts = [...dateData.workouts, newWorkout];
      const totalActiveCalories = updatedWorkouts.reduce((sum, w) => sum + w.activeCalories, 0);
      const totalCalories = updatedWorkouts.reduce((sum, w) => sum + w.totalCalories, 0);

      return {
        ...prev,
        dailyData: {
          ...prev.dailyData,
          [workoutDate]: {
            ...dateData,
            workouts: updatedWorkouts,
            totalActiveCalories,
            totalCalories,
          },
        },
      };
    });
  };

  const addFood = async (food: Omit<Food, 'id' | 'timestamp' | 'totalProtein'>) => {
    const today = getTodayDate();
    const totalProtein = food.proteinPerServing * food.quantity;
    const newFood: Food = {
      ...food,
      id: Date.now().toString(),
      timestamp: Date.now(),
      totalProtein,
    };

    setAppState((prev) => {
      const todayData = prev.dailyData[today] || getEmptyDailyData(today, prev.proteinGoal, prev.waterGoal);
      const updatedFoods = [...todayData.foods, newFood];
      const totalProteinConsumed = updatedFoods.reduce((sum, f) => sum + f.totalProtein, 0);

      return {
        ...prev,
        dailyData: {
          ...prev.dailyData,
          [today]: {
            ...todayData,
            foods: updatedFoods,
            totalProtein: totalProteinConsumed,
          },
        },
      };
    });
  };

  const setProteinGoal = async (goal: number) => {
    setAppState((prev) => ({
      ...prev,
      proteinGoal: goal,
    }));
  };

  const addWaterLog = async (amount: number) => {
    const today = getTodayDate();
    const newWaterLog: WaterLog = {
      id: Date.now().toString(),
      amount,
      timestamp: Date.now(),
    };

    setAppState((prev) => {
      const todayData = prev.dailyData[today] || getEmptyDailyData(today, prev.proteinGoal, prev.waterGoal);
      const updatedWaterLogs = [...todayData.waterLogs, newWaterLog];
      const totalWater = updatedWaterLogs.reduce((sum, w) => sum + w.amount, 0);

      return {
        ...prev,
        dailyData: {
          ...prev.dailyData,
          [today]: {
            ...todayData,
            waterLogs: updatedWaterLogs,
            totalWater,
          },
        },
      };
    });
  };

  const setWaterGoal = async (goal: number) => {
    setAppState((prev) => ({
      ...prev,
      waterGoal: goal,
    }));
  };

  const setUserProfile = async (profile: UserProfile) => {
    setUserProfileState(profile);
    // Calculate recommended water intake based on weight
    if (profile.currentWeight) {
      const recommendedWater = calculateWaterGoal(profile.currentWeight);
      await setWaterGoal(recommendedWater);
    }
    // Set start date if not already set
    if (!appState.startDate) {
      await setStartDate(getTodayDate());
    }
  };

  const getDataForDate = (dateStr: string): DailyData => {
    return appState.dailyData[dateStr] || getEmptyDailyData(dateStr, appState.proteinGoal, appState.waterGoal);
  };

  const setMealPlanPreferences = async (preferences: MealPlanPreferences) => {
    setAppState((prev) => ({
      ...prev,
      mealPlanPreferences: preferences,
    }));
  };

  const generateMealPlan = async (preferences: MealPlanPreferences, startDate: string) => {
    // AI-generated meal plan for a week
    const mealSuggestions = [
      { breakfast: 'Oatmeal with berries and almonds', lunch: 'Grilled chicken salad with avocado', dinner: 'Baked salmon with quinoa and vegetables', snack: 'Greek yogurt with honey' },
      { breakfast: 'Scrambled eggs with spinach and toast', lunch: 'Turkey and hummus wrap', dinner: 'Stir-fried tofu with brown rice', snack: 'Apple slices with almond butter' },
      { breakfast: 'Smoothie bowl with banana and granola', lunch: 'Quinoa bowl with chickpeas', dinner: 'Grilled chicken with sweet potato', snack: 'Trail mix' },
      { breakfast: 'Whole grain toast with avocado', lunch: 'Lentil soup with whole grain bread', dinner: 'Baked cod with roasted vegetables', snack: 'Cottage cheese with berries' },
      { breakfast: 'Protein pancakes with fruit', lunch: 'Greek salad with grilled chicken', dinner: 'Lean beef stir-fry with vegetables', snack: 'Protein shake' },
      { breakfast: 'Egg white omelet with vegetables', lunch: 'Tuna salad with whole grain crackers', dinner: 'Grilled shrimp with zucchini noodles', snack: 'Hummus with carrots' },
      { breakfast: 'Chia pudding with berries', lunch: 'Chicken and vegetable soup', dinner: 'Turkey meatballs with marinara', snack: 'Dark chocolate and nuts' },
    ];

    setAppState((prev) => {
      const newDailyData = { ...prev.dailyData };
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayPlan = mealSuggestions[i];
        const meals: MealPlanItem[] = [
          { id: `${dateStr}-breakfast`, mealType: 'Breakfast', description: dayPlan.breakfast, completed: false },
          { id: `${dateStr}-lunch`, mealType: 'Lunch', description: dayPlan.lunch, completed: false },
          { id: `${dateStr}-dinner`, mealType: 'Dinner', description: dayPlan.dinner, completed: false },
          { id: `${dateStr}-snack`, mealType: 'Snack', description: dayPlan.snack, completed: false },
        ];

        const existingData = newDailyData[dateStr] || getEmptyDailyData(dateStr, prev.proteinGoal, prev.waterGoal);
        newDailyData[dateStr] = {
          ...existingData,
          mealPlan: { date: dateStr, meals },
        };
      }

      return {
        ...prev,
        dailyData: newDailyData,
        mealPlanPreferences: preferences,
      };
    });
  };

  const updateDailyMealPlan = async (date: string, meals: MealPlanItem[]) => {
    setAppState((prev) => {
      const dayData = prev.dailyData[date] || getEmptyDailyData(date, prev.proteinGoal, prev.waterGoal);
      
      return {
        ...prev,
        dailyData: {
          ...prev.dailyData,
          [date]: {
            ...dayData,
            mealPlan: {
              date,
              meals,
            },
          },
        },
      };
    });
  };

  const toggleMealPlanItem = async (date: string, mealId: string) => {
    setAppState((prev) => {
      const dayData = prev.dailyData[date] || getEmptyDailyData(date, prev.proteinGoal, prev.waterGoal);
      
      if (!dayData.mealPlan) return prev;

      const updatedMeals = dayData.mealPlan.meals.map((meal) =>
        meal.id === mealId ? { ...meal, completed: !meal.completed } : meal
      );

      return {
        ...prev,
        dailyData: {
          ...prev.dailyData,
          [date]: {
            ...dayData,
            mealPlan: {
              ...dayData.mealPlan,
              meals: updatedMeals,
            },
          },
        },
      };
    });
  };

  const getStartDate = (): string | undefined => {
    return appState.startDate;
  };

  const setStartDate = async (date: string) => {
    setAppState((prev) => ({
      ...prev,
      startDate: date,
    }));
  };

  const setWorkoutPlanPreferences = async (preferences: WorkoutPlanPreferences) => {
    setAppState((prev) => ({
      ...prev,
      workoutPlanPreferences: preferences,
    }));
  };

  const generateWorkoutPlan = async (preferences: WorkoutPlanPreferences, startDate: string) => {
    // AI-generated workout plan for a month based on preferences
    const workoutTemplates = {
      strength: {
        chest: ['Bench Press', 'Push-ups', 'Dumbbell Flyes', 'Incline Press'],
        back: ['Pull-ups', 'Barbell Rows', 'Lat Pulldowns', 'Deadlifts'],
        legs: ['Squats', 'Lunges', 'Leg Press', 'Romanian Deadlifts'],
        arms: ['Bicep Curls', 'Tricep Dips', 'Hammer Curls', 'Overhead Extension'],
        shoulders: ['Overhead Press', 'Lateral Raises', 'Front Raises', 'Face Pulls'],
      },
      cardio: ['Running', 'Cycling', 'Jump Rope', 'Rowing', 'Burpees'],
      flexibility: ['Yoga Flow', 'Stretching Routine', 'Foam Rolling', 'Mobility Work'],
      restDayActivities: ['Walking', 'Light Stretching', 'Swimming (leisure)', 'Yoga', 'Meditation', 'Foam Rolling'],
    };

    const daysPerWeek = preferences.daysPerWeek;
    const isStrength = preferences.workoutTypes.includes('strength');
    const isCardio = preferences.workoutTypes.includes('cardio');
    const distribution = preferences.weekDistribution || 'consecutive';
    
    // Calculate rest day pattern based on distribution
    const getIsRestDay = (dayIndex: number): boolean => {
      const weekProgress = dayIndex % 7;
      
      if (distribution === 'consecutive') {
        // All workout days at start of week
        return weekProgress >= daysPerWeek;
      } else if (distribution === 'spread') {
        // Spread workouts evenly throughout the week
        const restDays = 7 - daysPerWeek;
        const interval = Math.floor(7 / restDays);
        
        if (restDays === 0) return false;
        if (daysPerWeek === 1) return weekProgress !== 0;
        
        // Spread rest days evenly
        for (let r = 1; r <= restDays; r++) {
          if (weekProgress === r * interval - 1) return true;
        }
        return false;
      } else {
        // Custom: alternate pattern (workout, workout, rest)
        const pattern = [true, true, false]; // 2 workout days, 1 rest day
        return !pattern[weekProgress % pattern.length];
      }
    };
    
    setAppState((prev) => {
      const newDailyData = { ...prev.dailyData };
      
      // Generate 30 days of workout plans
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Determine if this is a rest day based on daysPerWeek and distribution
        const isRestDay = getIsRestDay(i);
        
        let exercises: WorkoutPlanExercise[] = [];
        let restDayActivities: WorkoutPlanExercise[] = [];
        let dayName = 'Rest Day';
        
        if (!isRestDay) {
          // Rotate through target areas
          const targetIndex = Math.floor(i / 7) % preferences.targetAreas.length;
          const targetArea = preferences.targetAreas[targetIndex] || 'full-body';
          
          if (isStrength && workoutTemplates.strength[targetArea as keyof typeof workoutTemplates.strength]) {
            const areaExercises = workoutTemplates.strength[targetArea as keyof typeof workoutTemplates.strength];
            dayName = `${targetArea.charAt(0).toUpperCase() + targetArea.slice(1)} Day`;
            
            exercises = areaExercises.slice(0, 4).map((exercise, idx) => ({
              id: `${dateStr}-${idx}`,
              name: exercise,
              sets: 3,
              reps: preferences.experienceLevel === 'beginner' ? 10 : preferences.experienceLevel === 'advanced' ? 15 : 12,
              weight: 0,
              completed: false,
            }));
          }
          
          if (isCardio && (i % 2 === 0 || !isStrength)) {
            const cardioExercise = workoutTemplates.cardio[i % workoutTemplates.cardio.length];
            exercises.push({
              id: `${dateStr}-cardio`,
              name: cardioExercise,
              duration: preferences.experienceLevel === 'beginner' ? 20 : preferences.experienceLevel === 'advanced' ? 40 : 30,
              completed: false,
            });
            dayName = isStrength ? `${dayName} + Cardio` : 'Cardio Day';
          }
        } else {
          // Add optional light exercises for rest days
          restDayActivities = workoutTemplates.restDayActivities.slice(0, 3).map((activity, idx) => ({
            id: `${dateStr}-rest-${idx}`,
            name: activity,
            duration: preferences.experienceLevel === 'beginner' ? 15 : preferences.experienceLevel === 'advanced' ? 30 : 20,
            completed: false,
          }));
        }

        const existingData = newDailyData[dateStr] || getEmptyDailyData(dateStr, prev.proteinGoal, prev.waterGoal);
        newDailyData[dateStr] = {
          ...existingData,
          workoutPlan: {
            date: dateStr,
            dayName,
            exercises,
            isRestDay,
            restDayActivities: isRestDay ? restDayActivities : undefined,
          },
        };
      }

      return {
        ...prev,
        dailyData: newDailyData,
        workoutPlanPreferences: preferences,
      };
    });
  };

  const updateDailyWorkoutPlan = async (date: string, exercises: WorkoutPlanExercise[]) => {
    setAppState((prev) => {
      const dayData = prev.dailyData[date] || getEmptyDailyData(date, prev.proteinGoal, prev.waterGoal);
      
      if (!dayData.workoutPlan) return prev;

      return {
        ...prev,
        dailyData: {
          ...prev.dailyData,
          [date]: {
            ...dayData,
            workoutPlan: {
              ...dayData.workoutPlan,
              exercises,
            },
          },
        },
      };
    });
  };

  const updateWorkoutPlanExercise = async (date: string, exerciseId: string, actualData: Partial<WorkoutPlanExercise>) => {
    setAppState((prev) => {
      const dayData = prev.dailyData[date] || getEmptyDailyData(date, prev.proteinGoal, prev.waterGoal);
      
      if (!dayData.workoutPlan) return prev;

      const updatedExercises = dayData.workoutPlan.exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, ...actualData } : exercise
      );

      return {
        ...prev,
        dailyData: {
          ...prev.dailyData,
          [date]: {
            ...dayData,
            workoutPlan: {
              ...dayData.workoutPlan,
              exercises: updatedExercises,
            },
          },
        },
      };
    });
  };

  const toggleWorkoutPlanExercise = async (date: string, exerciseId: string) => {
    setAppState((prev) => {
      const dayData = prev.dailyData[date] || getEmptyDailyData(date, prev.proteinGoal, prev.waterGoal);
      
      if (!dayData.workoutPlan) return prev;

      const updatedExercises = dayData.workoutPlan.exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, completed: !exercise.completed } : exercise
      );

      // Also check rest day activities
      const updatedRestDayActivities = dayData.workoutPlan.restDayActivities?.map((activity) =>
        activity.id === exerciseId ? { ...activity, completed: !activity.completed } : activity
      );

      return {
        ...prev,
        dailyData: {
          ...prev.dailyData,
          [date]: {
            ...dayData,
            workoutPlan: {
              ...dayData.workoutPlan,
              exercises: updatedExercises,
              restDayActivities: updatedRestDayActivities,
            },
          },
        },
      };
    });
  };

  const clearAllWorkoutData = async () => {
    setAppState((prev) => {
      const newDailyData: { [date: string]: DailyData } = {};
      
      // Remove all workouts from each day, but keep food, water, and meal plans
      Object.keys(prev.dailyData).forEach((date) => {
        const dayData = prev.dailyData[date];
        newDailyData[date] = {
          ...dayData,
          workouts: [],
          totalActiveCalories: 0,
          totalCalories: 0,
          workoutPlan: undefined,
        };
      });

      return {
        ...prev,
        dailyData: newDailyData,
        workoutPlanPreferences: undefined,
      };
    });
  };

  return (
    <AppContext.Provider
      value={{
        appState,
        userProfile,
        addWorkout,
        addFood,
        addWaterLog,
        setProteinGoal,
        setWaterGoal,
        setUserProfile,
        getTodayData,
        getDataForDate,
        setMealPlanPreferences,
        generateMealPlan,
        updateDailyMealPlan,
        toggleMealPlanItem,
        setWorkoutPlanPreferences,
        generateWorkoutPlan,
        updateDailyWorkoutPlan,
        updateWorkoutPlanExercise,
        toggleWorkoutPlanExercise,
        getStartDate,
        setStartDate,
        clearAllWorkoutData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
