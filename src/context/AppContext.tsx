import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Workout, Food, DailyData } from '../types';

interface AppContextType {
  appState: AppState;
  addWorkout: (workout: Omit<Workout, 'id' | 'timestamp'>) => Promise<void>;
  addFood: (food: Omit<Food, 'id' | 'timestamp' | 'totalProtein'>) => Promise<void>;
  setProteinGoal: (goal: number) => Promise<void>;
  getTodayData: () => DailyData;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = '@nuFit_data';

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getEmptyDailyData = (date: string, proteinGoal: number): DailyData => ({
  date,
  workouts: [],
  foods: [],
  totalActiveCalories: 0,
  totalCalories: 0,
  totalProtein: 0,
  proteinGoal,
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>({
    dailyData: {},
    proteinGoal: 150, // Default protein goal
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveData();
    }
  }, [appState, isLoaded]);

  const loadData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setAppState(JSON.parse(storedData));
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

  const getTodayData = (): DailyData => {
    const today = getTodayDate();
    return appState.dailyData[today] || getEmptyDailyData(today, appState.proteinGoal);
  };

  const addWorkout = async (workout: Omit<Workout, 'id' | 'timestamp'>) => {
    const today = getTodayDate();
    const newWorkout: Workout = {
      ...workout,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    setAppState((prev) => {
      const todayData = prev.dailyData[today] || getEmptyDailyData(today, prev.proteinGoal);
      const updatedWorkouts = [...todayData.workouts, newWorkout];
      const totalActiveCalories = updatedWorkouts.reduce((sum, w) => sum + w.activeCalories, 0);
      const totalCalories = updatedWorkouts.reduce((sum, w) => sum + w.totalCalories, 0);

      return {
        ...prev,
        dailyData: {
          ...prev.dailyData,
          [today]: {
            ...todayData,
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
      const todayData = prev.dailyData[today] || getEmptyDailyData(today, prev.proteinGoal);
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

  return (
    <AppContext.Provider
      value={{
        appState,
        addWorkout,
        addFood,
        setProteinGoal,
        getTodayData,
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
