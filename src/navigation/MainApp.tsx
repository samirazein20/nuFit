import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import FoodScreen from '../screens/FoodScreen';
import HydrationScreen from '../screens/HydrationScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import { COLORS } from '../constants/colors';
import { UserProfile } from '../context/AppContext';

const Tab = createMaterialTopTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarStyle: {
          backgroundColor: COLORS.primary,
          elevation: 0,
          shadowColor: COLORS.shadowDark,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '700',
          textTransform: 'none',
        },
        tabBarIndicatorStyle: {
          backgroundColor: COLORS.white,
          height: 4,
          borderRadius: 2,
        },
        tabBarPressColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: '📊 Dashboard',
        }}
      />
      <Tab.Screen 
        name="Workout" 
        component={WorkoutScreen}
        options={{
          tabBarLabel: '🏃 Workouts',
        }}
      />
      <Tab.Screen 
        name="Food" 
        component={FoodScreen}
        options={{
          tabBarLabel: '🍎 Nutrition',
        }}
      />
      <Tab.Screen 
        name="Hydration" 
        component={HydrationScreen}
        options={{
          tabBarLabel: '💧 Hydration',
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainApp() {
  const { userProfile, setUserProfile } = useApp();

  const handleRegistrationComplete = async (profile: UserProfile) => {
    await setUserProfile(profile);
  };

  // Show registration screen if no user profile
  if (!userProfile) {
    return <RegistrationScreen onComplete={handleRegistrationComplete} />;
  }

  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
        <TabNavigator />
      </SafeAreaView>
    </NavigationContainer>
  );
}
