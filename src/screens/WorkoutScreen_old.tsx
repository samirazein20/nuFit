import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';

export default function WorkoutScreen() {
  const { addWorkout, getTodayData } = useApp();
  const [workoutName, setWorkoutName] = useState('');
  const [activeCalories, setActiveCalories] = useState('');
  const [totalCalories, setTotalCalories] = useState('');

  const todayData = getTodayData();

  const handleAddWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Invalid Input', 'Please enter a workout name');
      return;
    }

    const active = parseFloat(activeCalories);
    const total = parseFloat(totalCalories);

    if (isNaN(active) || isNaN(total) || active <= 0 || total <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid calorie values');
      return;
    }

    if (active > total) {
      Alert.alert('Invalid Input', 'Active calories cannot exceed total calories');
      return;
    }

    await addWorkout({
      date: todayData.date,
      name: workoutName,
      activeCalories: active,
      totalCalories: total,
    });

    setWorkoutName('');
    setActiveCalories('');
    setTotalCalories('');
    Alert.alert('Success', 'Workout added successfully!');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Log Workout</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Workout Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Running, Weight Training, Yoga"
            placeholderTextColor={COLORS.textLight}
            value={workoutName}
            onChangeText={setWorkoutName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Active Calories Burned</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter active calories"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
            value={activeCalories}
            onChangeText={setActiveCalories}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Total Calories Burned</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter total calories"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
            value={totalCalories}
            onChangeText={setTotalCalories}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleAddWorkout}>
          <Text style={styles.buttonText}>Add Workout</Text>
        </TouchableOpacity>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Today's Workouts</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Active Calories:</Text>
              <Text style={styles.summaryValue}>{todayData.totalActiveCalories.toFixed(0)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Calories:</Text>
              <Text style={styles.summaryValue}>{todayData.totalCalories.toFixed(0)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Workouts Logged:</Text>
              <Text style={styles.summaryValue}>{todayData.workouts.length}</Text>
            </View>
          </View>
        </View>

        {todayData.workouts.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Recent Workouts</Text>
            {todayData.workouts.slice().reverse().map((workout, index) => (
              <View key={workout.id} style={styles.listItem}>
                <Text style={styles.listItemTitle}>{workout.name}</Text>
                <Text style={styles.listItemText}>Active: {workout.activeCalories} cal</Text>
                <Text style={styles.listItemText}>Total: {workout.totalCalories} cal</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
  },
  summaryCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  listContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
  },
  listItem: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  listItemText: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 2,
  },
});
