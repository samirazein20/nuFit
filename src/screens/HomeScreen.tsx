import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { getTodayData, setProteinGoal, appState } = useApp();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  const todayData = getTodayData();
  const proteinPercentage = (todayData.totalProtein / todayData.proteinGoal) * 100;

  const handleUpdateGoal = async () => {
    const newGoal = parseInt(goalInput);
    if (isNaN(newGoal) || newGoal <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid protein goal');
      return;
    }
    await setProteinGoal(newGoal);
    setIsEditingGoal(false);
    setGoalInput('');
    Alert.alert('Success', 'Protein goal updated!');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Gradient Header */}
        <LinearGradient
          colors={[COLORS.gradient1, COLORS.gradient2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello! 👋</Text>
              <Text style={styles.appName}>nuFit</Text>
              <Text style={styles.subtitle}>Start your fitness journey!</Text>
            </View>
            <View style={styles.avatarCircle}>
              <MaterialCommunityIcons name="account" size={32} color={COLORS.white} />
            </View>
          </View>
          
          <View style={styles.mainMetricCard}>
            <View style={styles.mainMetricHeader}>
              <MaterialCommunityIcons name="nutrition" size={28} color={COLORS.primary} />
              <Text style={styles.mainMetricTitle}>Daily Protein Goal</Text>
            </View>
            <View style={styles.proteinDisplay}>
              <View style={styles.proteinCircle}>
                <Text style={styles.proteinPercentage}>{proteinPercentage.toFixed(0)}%</Text>
                <Text style={styles.proteinLabel}>Complete</Text>
              </View>
              <View style={styles.proteinInfo}>
                <Text style={styles.proteinCurrent}>{todayData.totalProtein.toFixed(1)}g</Text>
                <Text style={styles.proteinGoal}>of {todayData.proteinGoal}g</Text>
                {proteinPercentage >= 100 && (
                  <View style={styles.achievedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.achievedText}>Goal Achieved!</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${Math.min(proteinPercentage, 100)}%`,
                    backgroundColor: proteinPercentage >= 100 ? COLORS.success : COLORS.primary 
                  }
                ]} 
              />
            </View>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#FF6B9D', '#FFA06B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <MaterialCommunityIcons name="fire" size={32} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.statValue}>{todayData.totalActiveCalories.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Active Kcal</Text>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#A06BFF', '#6B9DFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <MaterialCommunityIcons name="lightning-bolt" size={32} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.statValue}>{todayData.totalCalories.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Kcal</Text>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['#7ED957', '#5CB85C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <MaterialCommunityIcons name="dumbbell" size={32} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.statValue}>{todayData.workouts.length}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#FFB74D', '#FFA726']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <MaterialCommunityIcons name="food-apple" size={32} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.statValue}>{todayData.foods.length}</Text>
            <Text style={styles.statLabel}>Foods</Text>
          </View>
        </View>

        {/* Goal Setting Card */}
        <View style={styles.goalSettingCard}>
          <View style={styles.goalHeader}>
            <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
            <Text style={styles.goalHeaderText}>Daily Protein Goal</Text>
          </View>
          {!isEditingGoal ? (
            <View>
              <Text style={styles.currentGoalText}>
                Current Goal: {appState.proteinGoal}g
              </Text>
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => {
                  setIsEditingGoal(true);
                  setGoalInput(appState.proteinGoal.toString());
                }}
              >
                <Text style={styles.editButtonText}>Change Goal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TextInput
                style={styles.goalInput}
                placeholder="Enter new goal (grams)"
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
                value={goalInput}
                onChangeText={setGoalInput}
              />
              <View style={styles.goalButtonContainer}>
                <TouchableOpacity 
                  style={[styles.goalButton, styles.cancelButton]} 
                  onPress={() => {
                    setIsEditingGoal(false);
                    setGoalInput('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.goalButton, styles.saveButton]} 
                  onPress={handleUpdateGoal}
                >
                  <LinearGradient
                    colors={[COLORS.gradient1, COLORS.gradient2]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveGradient}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
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
  },
  gradientHeader: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  mainMetricCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  mainMetricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  mainMetricTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 10,
  },
  proteinDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  proteinCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: COLORS.primary,
  },
  proteinPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  proteinLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  proteinInfo: {
    alignItems: 'flex-start',
  },
  proteinCurrent: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  proteinGoal: {
    fontSize: 18,
    color: COLORS.textGray,
    marginTop: 4,
  },
  achievedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  achievedText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 4,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: COLORS.background,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  goalSettingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'center',
  },
  goalHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 8,
  },
  currentGoalText: {
    fontSize: 16,
    color: COLORS.textGray,
    textAlign: 'center',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  goalInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
    outlineWidth: 0,
  },
  goalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    alignItems: 'center',
  },
  saveButton: {
    overflow: 'hidden',
  },
  saveGradient: {
    padding: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
