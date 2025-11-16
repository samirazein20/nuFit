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

export interface DailyData {
  date: string;
  workouts: Workout[];
  foods: Food[];
  totalActiveCalories: number;
  totalCalories: number;
  totalProtein: number;
  proteinGoal: number;
}

export interface AppState {
  dailyData: { [date: string]: DailyData };
  proteinGoal: number;
}
