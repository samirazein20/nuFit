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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { getTodayData, setProteinGoal, appState, userProfile, clearAllWorkoutData, getDataForDate } = useApp();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showProfileModal, setShowProfileModal] = useState(false);

  const todayData = getTodayData();
  const proteinPercentage = (todayData.totalProtein / todayData.proteinGoal) * 100;
  
  // Calculate overall statistics
  const calculateOverallStats = () => {
    let totalWorkouts = 0;
    let totalActiveCalories = 0;
    let totalCalories = 0;
    let totalFoods = 0;
    let totalProtein = 0;
    let totalWater = 0;
    let totalDays = 0;

    Object.values(appState.dailyData).forEach((dayData) => {
      totalWorkouts += dayData.workouts.length;
      totalActiveCalories += dayData.totalActiveCalories;
      totalCalories += dayData.totalCalories;
      totalFoods += dayData.foods.length;
      totalProtein += dayData.totalProtein;
      totalWater += dayData.totalWater;
      totalDays++;
    });

    return {
      totalWorkouts,
      totalActiveCalories,
      totalCalories,
      totalFoods,
      totalProtein,
      totalWater,
      totalDays,
      avgActiveCalories: totalDays > 0 ? totalActiveCalories / totalDays : 0,
      avgProtein: totalDays > 0 ? totalProtein / totalDays : 0,
      avgWater: totalDays > 0 ? totalWater / totalDays : 0,
    };
  };

  const overallStats = calculateOverallStats();

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const hasDataForDate = (date: Date) => {
    const dateString = formatDateString(date);
    const data = appState.dailyData[dateString];
    return data && (data.workouts.length > 0 || data.foods.length > 0 || data.waterLogs.length > 0);
  };

  const getSelectedDateData = () => {
    const dateString = formatDateString(selectedDate);
    return getDataForDate(dateString);
  };

  const selectedDateData = getSelectedDateData();
  
  const calculateBMI = () => {
    if (!userProfile) return null;
    const heightInMeters = userProfile.height / 100;
    const bmi = userProfile.currentWeight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getWeightProgress = () => {
    if (!userProfile) return null;
    const diff = userProfile.currentWeight - userProfile.goalWeight;
    return diff > 0 ? `${diff.toFixed(1)} kg to lose` : `${Math.abs(diff).toFixed(1)} kg to gain`;
  };

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
              <Text style={styles.greeting}>Hello, {userProfile?.name || 'User'}! 👋</Text>
              <Text style={styles.appName}>nuFit</Text>
              <Text style={styles.subtitle}>Start your fitness journey!</Text>
            </View>
            <TouchableOpacity 
              style={styles.avatarCircle}
              onPress={() => setShowProfileModal(true)}
            >
              <MaterialCommunityIcons name="account" size={32} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity 
              onPress={() => {
                const newDate = new Date(currentMonth);
                newDate.setMonth(newDate.getMonth() - 1);
                setCurrentMonth(newDate);
              }}
              style={styles.monthButton}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            
            <Text style={styles.monthTitle}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            
            <TouchableOpacity 
              onPress={() => {
                const newDate = new Date(currentMonth);
                newDate.setMonth(newDate.getMonth() + 1);
                setCurrentMonth(newDate);
              }}
              style={styles.monthButton}
            >
              <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={styles.dayHeaderText}>{day}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {(() => {
              const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
              const days = [];
              
              // Empty cells for days before month starts
              for (let i = 0; i < startingDayOfWeek; i++) {
                days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
              }
              
              // Actual days of the month
              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const isSelected = isSameDay(date, selectedDate);
                const isTodayDate = isToday(date);
                const hasData = hasDataForDate(date);
                
                days.push(
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayCell,
                      isSelected && styles.selectedDay,
                      isTodayDate && !isSelected && styles.todayDay,
                    ]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[
                      styles.dayText,
                      isSelected && styles.selectedDayText,
                      isTodayDate && !isSelected && styles.todayDayText,
                    ]}>
                      {day}
                    </Text>
                    {hasData && (
                      <View style={[styles.dataDot, isSelected && styles.dataDotSelected]} />
                    )}
                  </TouchableOpacity>
                );
              }
              
              return days;
            })()}
          </View>
        </View>

        {/* Selected Date Summary */}
        <View style={styles.dateSummaryCard}>
          <View style={styles.dateSummaryHeader}>
            <MaterialCommunityIcons name="calendar-today" size={24} color={COLORS.primary} />
            <Text style={styles.dateSummaryTitle}>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.summaryStatRow}>
              <View style={styles.summaryStatItem}>
                <MaterialCommunityIcons name="fire" size={24} color="#FF6B9D" />
                <Text style={styles.summaryStatLabel}>Calories</Text>
                <Text style={styles.summaryStatValue}>{selectedDateData.totalActiveCalories}</Text>
              </View>
              
              <View style={styles.summaryStatItem}>
                <MaterialCommunityIcons name="dumbbell" size={24} color="#7ED957" />
                <Text style={styles.summaryStatLabel}>Workouts</Text>
                <Text style={styles.summaryStatValue}>{selectedDateData.workouts.length}</Text>
              </View>
              
              <View style={styles.summaryStatItem}>
                <MaterialCommunityIcons name="nutrition" size={24} color="#FFB74D" />
                <Text style={styles.summaryStatLabel}>Protein</Text>
                <Text style={styles.summaryStatValue}>{selectedDateData.totalProtein.toFixed(0)}g</Text>
              </View>
            </View>

            <View style={styles.summaryStatRow}>
              <View style={styles.summaryStatItem}>
                <MaterialCommunityIcons name="cup-water" size={24} color="#4FC3F7" />
                <Text style={styles.summaryStatLabel}>Water</Text>
                <Text style={styles.summaryStatValue}>{(selectedDateData.totalWater / 1000).toFixed(1)}L</Text>
              </View>
              
              <View style={styles.summaryStatItem}>
                <MaterialCommunityIcons name="food-apple" size={24} color="#A06BFF" />
                <Text style={styles.summaryStatLabel}>Foods</Text>
                <Text style={styles.summaryStatValue}>{selectedDateData.foods.length}</Text>
              </View>
              
              <View style={styles.summaryStatItem}>
                {/* Empty spacer */}
              </View>
            </View>
          </View>
        </View>

        {/* Clear Workout Data Button */}
        <View style={styles.dangerZone}>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => {
              Alert.alert(
                'Clear Workout Data',
                'Are you sure you want to clear all workout data? This will remove all workouts, workout plans, and workout preferences. This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Clear All', 
                    style: 'destructive',
                    onPress: async () => {
                      await clearAllWorkoutData();
                      Alert.alert('Success', 'All workout data has been cleared.');
                    }
                  }
                ]
              );
            }}
          >
            <MaterialCommunityIcons name="delete-sweep" size={20} color={COLORS.error} />
            <Text style={styles.clearButtonText}>Clear All Workout Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <MaterialCommunityIcons name="account-circle" size={32} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Your Profile</Text>
              </View>
              <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                <Ionicons name="close-circle" size={32} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>

            {userProfile ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.profileModalSection}>
                  <Text style={styles.profileModalLabel}>Name</Text>
                  <Text style={styles.profileModalValue}>{userProfile.name}</Text>
                </View>

                <View style={styles.profileStatsGrid}>
                  <View style={styles.profileModalStatCard}>
                    <MaterialCommunityIcons name="weight-kilogram" size={32} color="#FF6B9D" />
                    <Text style={styles.profileModalStatLabel}>Current Weight</Text>
                    <Text style={styles.profileModalStatValue}>{userProfile.currentWeight} kg</Text>
                  </View>

                  <View style={styles.profileModalStatCard}>
                    <MaterialCommunityIcons name="target" size={32} color="#7ED957" />
                    <Text style={styles.profileModalStatLabel}>Goal Weight</Text>
                    <Text style={styles.profileModalStatValue}>{userProfile.goalWeight} kg</Text>
                  </View>

                  <View style={styles.profileModalStatCard}>
                    <MaterialCommunityIcons name="human-male-height" size={32} color="#4FC3F7" />
                    <Text style={styles.profileModalStatLabel}>Height</Text>
                    <Text style={styles.profileModalStatValue}>{userProfile.height} cm</Text>
                  </View>

                  <View style={styles.profileModalStatCard}>
                    <MaterialCommunityIcons name="calculator" size={32} color="#FFB74D" />
                    <Text style={styles.profileModalStatLabel}>BMI</Text>
                    <Text style={styles.profileModalStatValue}>{calculateBMI()}</Text>
                  </View>

                  <View style={styles.profileModalStatCard}>
                    <MaterialCommunityIcons name="trending-up" size={32} color="#A06BFF" />
                    <Text style={styles.profileModalStatLabel}>Progress</Text>
                    <Text style={styles.profileModalStatValue}>{getWeightProgress()}</Text>
                  </View>

                  <View style={styles.profileModalStatCard}>
                    <MaterialCommunityIcons name="nutrition" size={32} color="#FF6B9D" />
                    <Text style={styles.profileModalStatLabel}>Protein Goal</Text>
                    <Text style={styles.profileModalStatValue}>{appState.proteinGoal}g</Text>
                  </View>
                </View>

                {/* Daily Protein Goal Edit Section */}
                <View style={styles.profileModalSection}>
                  <Text style={styles.profileModalLabel}>Daily Protein Goal</Text>
                  {!isEditingGoal ? (
                    <View style={styles.proteinGoalDisplay}>
                      <View style={styles.proteinGoalInfo}>
                        <Text style={styles.profileModalValue}>{appState.proteinGoal}g</Text>
                        <Text style={styles.proteinGoalSubtext}>per day</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.editGoalButton} 
                        onPress={() => {
                          setIsEditingGoal(true);
                          setGoalInput(appState.proteinGoal.toString());
                        }}
                      >
                        <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.editGoalButtonText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View>
                      <TextInput
                        style={styles.goalInputModal}
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
                          onPress={async () => {
                            await handleUpdateGoal();
                            setShowProfileModal(false);
                          }}
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

                {userProfile.allergies && userProfile.allergies.length > 0 && (
                  <View style={styles.profileModalSection}>
                    <Text style={styles.profileModalLabel}>Allergies</Text>
                    <View style={styles.allergiesList}>
                      {userProfile.allergies.map((allergy, index) => (
                        <View key={index} style={styles.allergyChip}>
                          <Text style={styles.allergyText}>{allergy}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>
            ) : (
              <View style={styles.noProfileContainer}>
                <MaterialCommunityIcons name="account-off" size={64} color={COLORS.textLight} />
                <Text style={styles.noProfileText}>No profile data available</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  statAverage: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  overallSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  overallTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  overallSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
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
  profileSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 10,
  },
  profileStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  profileStat: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  profileStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
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
  dangerZone: {
    marginHorizontal: 20,
    marginBottom: 30,
    marginTop: 10,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  clearButtonText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  calendarSection: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  dayHeaderText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  todayDay: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
  },
  dayText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedDayText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  todayDayText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  dataDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
  dataDotSelected: {
    backgroundColor: COLORS.white,
  },
  dateSummaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
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
  dateSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateSummaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 10,
    flex: 1,
  },
  summaryStats: {
    gap: 16,
  },
  summaryStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  summaryStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 12,
  },
  profileModalSection: {
    marginBottom: 24,
  },
  profileModalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileModalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  profileStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profileModalStatCard: {
    width: (width - 100) / 2,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  profileModalStatLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  profileModalStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  allergiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyChip: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  allergyText: {
    fontSize: 14,
    color: COLORS.text,
  },
  noProfileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noProfileText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 16,
  },
  proteinGoalDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proteinGoalInfo: {
    flex: 1,
  },
  proteinGoalSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  editGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 4,
  },
  editGoalButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  goalInputModal: {
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
});
