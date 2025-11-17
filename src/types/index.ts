export interface Workout {
  id: string;
  date: string;
  name: string;
  activeCalories: number;
  totalCalories: number;
  timestamp: number;
}

export interface Food {
  id: string;
  date: string;
  name: string;
  quantity: number;
  proteinPerServing: number;
  totalProtein: number;
  timestamp: number;
}

export interface WaterLog {
  id: string;
  amount: number; // in ml
  timestamp: number;
}

export interface MealPlanItem {
  id: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  description: string;
  completed: boolean;
}

export interface DailyMealPlan {
  date: string; // YYYY-MM-DD
  meals: MealPlanItem[];
}

export interface MealPlanPreferences {
  allergies: string[];
  dislikedFoods: string[];
  dietaryRestrictions?: string[];
}

export interface WorkoutPlanExercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number; // in lbs or kg
  duration?: number; // in minutes for cardio
  completed: boolean;
  actualSets?: number;
  actualReps?: number;
  actualWeight?: number;
  actualDuration?: number;
}

export interface DailyWorkoutPlan {
  date: string; // YYYY-MM-DD
  dayName: string; // e.g., "Chest & Triceps Day"
  exercises: WorkoutPlanExercise[];
  isRestDay: boolean;
  restDayActivities?: WorkoutPlanExercise[]; // Optional light exercises for rest days
}

export interface WorkoutPlanPreferences {
  daysPerWeek: number; // 1-7
  workoutTypes: string[]; // e.g., ['strength', 'cardio', 'flexibility']
  targetAreas: string[]; // e.g., ['chest', 'legs', 'back', 'arms']
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  weekDistribution?: 'consecutive' | 'spread' | 'custom'; // How workouts are distributed in the week
}

export interface DailyData {
  date: string;
  workouts: Workout[];
  foods: Food[];
  waterLogs: WaterLog[];
  mealPlan?: DailyMealPlan;
  workoutPlan?: DailyWorkoutPlan;
  totalActiveCalories: number;
  totalCalories: number;
  totalProtein: number;
  totalWater: number; // in ml
  proteinGoal: number;
  waterGoal: number; // in ml
}

export interface AppState {
  dailyData: { [date: string]: DailyData };
  proteinGoal: number;
  waterGoal: number; // in ml
  mealPlanPreferences?: MealPlanPreferences;
  workoutPlanPreferences?: WorkoutPlanPreferences;
  startDate?: string; // YYYY-MM-DD - when user started using the app
}
