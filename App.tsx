import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import FoodScreen from './src/screens/FoodScreen';
import { COLORS } from './src/constants/colors';

const Tab = createMaterialTopTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }} edges={['top']}>
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
            </Tab.Navigator>
          </SafeAreaView>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
