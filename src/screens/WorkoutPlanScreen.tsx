import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { WorkoutPlanExercise, WorkoutPlanPreferences } from '../types';

const { width } = Dimensions.get('window');

interface WorkoutPlanScreenProps {
  visible: boolean;
  onClose: () => void;
}

const WorkoutPlanScreen: React.FC<WorkoutPlanScreenProps> = ({ visible, onClose }) => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('WorkoutPlanScreen must be used within an AppProvider');
  }

  const {
    appState,
    getDataForDate,
    addWorkout,
    setWorkoutPlanPreferences,
    generateWorkoutPlan,
    updateDailyWorkoutPlan,
    updateWorkoutPlanExercise,
    toggleWorkoutPlanExercise,
    getStartDate,
    setStartDate,
  } = context;

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [daysPerWeek, setDaysPerWeek] = useState('3');
  const [workoutTypes, setWorkoutTypes] = useState<string[]>(['strength']);
  const [targetAreas, setTargetAreas] = useState<string[]>(['chest']);
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [weekDistribution, setWeekDistribution] = useState<'consecutive' | 'spread' | 'custom'>('spread');
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingExerciseName, setEditingExerciseName] = useState('');
  const [editingSets, setEditingSets] = useState('');
  const [editingReps, setEditingReps] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<WorkoutPlanExercise | null>(null);
  const [showCalorieModal, setShowCalorieModal] = useState(false);
  const [activeCalories, setActiveCalories] = useState('');
  const [totalCalories, setTotalCalories] = useState('');

  useEffect(() => {
    const startDate = getStartDate();
    if (!startDate) {
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      generateAvailableDates(today);
    } else {
      generateAvailableDates(startDate);
    }
  }, [visible]);

  const generateAvailableDates = (startDateStr: string) => {
    const dates: string[] = [];
    const startDate = new Date(startDateStr);
    const today = new Date();
    
    // Generate dates from start date to 30 days in the future
    for (let i = 0; i <= 37; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      if (date <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    setAvailableDates(dates);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleCreateWorkoutPlan = async () => {
    const preferences: WorkoutPlanPreferences = {
      daysPerWeek: parseInt(daysPerWeek) || 3,
      workoutTypes,
      targetAreas,
      experienceLevel,
      weekDistribution,
    };

    await setWorkoutPlanPreferences(preferences);
    const startDate = getStartDate() || new Date().toISOString().split('T')[0];
    await generateWorkoutPlan(preferences, startDate);
    setShowPreferencesModal(false);
  };

  const handleToggleWorkoutType = (type: string) => {
    setWorkoutTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleToggleTargetArea = (area: string) => {
    setTargetAreas(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleExercisePress = (exercise: WorkoutPlanExercise) => {
    setSelectedExercise(exercise);
    setShowExerciseModal(true);
  };

  const handleSaveExerciseProgress = async () => {
    if (!selectedExercise) return;

    await updateWorkoutPlanExercise(selectedDate, selectedExercise.id, selectedExercise);
    setShowExerciseModal(false);
    setSelectedExercise(null);
  };

  const handleEditExercise = (exercise: WorkoutPlanExercise) => {
    setEditingExerciseId(exercise.id);
    setEditingExerciseName(exercise.name);
    setEditingSets(exercise.sets?.toString() || '');
    setEditingReps(exercise.reps?.toString() || '');
  };

  const handleSaveExerciseEdit = async () => {
    if (!editingExerciseId) return;

    const dayData = getDataForDate(selectedDate);
    if (!dayData.workoutPlan) return;

    const updatedExercises = dayData.workoutPlan.exercises.map((exercise) =>
      exercise.id === editingExerciseId
        ? {
            ...exercise,
            name: editingExerciseName,
            sets: parseInt(editingSets) || exercise.sets,
            reps: parseInt(editingReps) || exercise.reps,
          }
        : exercise
    );

    await updateDailyWorkoutPlan(selectedDate, updatedExercises);
    setEditingExerciseId(null);
  };

  const handleDoneWorkout = () => {
    setShowCalorieModal(true);
  };

  const handleSaveCalories = async () => {
    const active = parseInt(activeCalories) || 0;
    const total = parseInt(totalCalories) || 0;
    
    if (active === 0 && total === 0) {
      Alert.alert('Error', 'Please enter calorie values');
      return;
    }

    try {
      // Get the workout name from the day plan
      const dayData = getDataForDate(selectedDate);
      const workoutName = dayData.workoutPlan?.dayName || 'Workout';
      
      // Add the workout to the daily log
      await addWorkout({
        date: selectedDate,
        name: workoutName,
        activeCalories: active,
        totalCalories: total,
      });
      
      // Clear inputs
      setActiveCalories('');
      setTotalCalories('');
      
      // Close the calorie modal first
      setShowCalorieModal(false);
      
      // Wait for calorie modal animation to complete before closing parent
      setTimeout(() => {
        onClose();
        
        // Show beautiful success message after everything closes
        setTimeout(() => {
          Alert.alert(
            '🎉 Great Job!',
            `You've completed your ${workoutName}! Keep up the amazing work! 💪`,
            [{ text: 'Awesome!', style: 'default' }]
          );
        }, 200);
      }, 200);
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    }
  };

  const dayData = getDataForDate(selectedDate);
  const hasWorkoutPlan = !!dayData.workoutPlan;
  const isRestDay = dayData.workoutPlan?.isRestDay;
  
  // Check if at least one exercise is completed
  const allExercises = [...(dayData.workoutPlan?.exercises || []), ...(dayData.workoutPlan?.restDayActivities || [])];
  const hasCompletedExercise = allExercises.some(exercise => exercise.completed);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <LinearGradient colors={['#F87171', '#EF4444']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Workout Plan</Text>
            <TouchableOpacity
              onPress={() => setShowPreferencesModal(true)}
              style={styles.settingsButton}
            >
              <Ionicons name="settings-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Date Dropdown */}
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDateDropdown(!showDateDropdown)}
          >
            <Text style={styles.dateSelectorText}>{formatDate(selectedDate)}</Text>
            <Ionicons
              name={showDateDropdown ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#EF4444"
            />
          </TouchableOpacity>

          {showDateDropdown && (
            <View style={styles.dateDropdown}>
              <ScrollView style={styles.dateList} nestedScrollEnabled>
                {availableDates.map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.dateItem,
                      date === selectedDate && styles.dateItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedDate(date);
                      setShowDateDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dateItemText,
                        date === selectedDate && styles.dateItemTextSelected,
                      ]}
                    >
                      {formatDate(date)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Workout Plan Display */}
          <ScrollView style={styles.workoutPlanContainer} showsVerticalScrollIndicator={false}>
            {!hasWorkoutPlan ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="dumbbell" size={64} color="#CCC" />
                <Text style={styles.emptyStateText}>No workout plan for this date</Text>
                <TouchableOpacity
                  style={styles.createPlanButton}
                  onPress={() => setShowPreferencesModal(true)}
                >
                  <LinearGradient colors={['#EF4444', '#F87171']} style={styles.createPlanGradient}>
                    <Text style={styles.createPlanButtonText}>Create a Workout Plan Here! 💪</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : isRestDay ? (
              <View style={styles.restDayContainer}>
                <MaterialCommunityIcons name="sleep" size={80} color="#EF4444" />
                <Text style={styles.restDayTitle}>Rest Day</Text>
                <Text style={styles.restDaySubtitle}>
                  Recovery is just as important as training. Take this day to rest and recharge!
                </Text>
                
                {dayData.workoutPlan?.restDayActivities && dayData.workoutPlan.restDayActivities.length > 0 && (
                  <>
                    <Text style={styles.optionalActivitiesTitle}>Optional Light Activities</Text>
                    <Text style={styles.optionalActivitiesSubtitle}>
                      Feel free to do any of these light activities if you'd like to stay active:
                    </Text>
                    {dayData.workoutPlan.restDayActivities.map((activity: WorkoutPlanExercise) => (
                      <TouchableOpacity
                        key={activity.id}
                        style={styles.restDayActivityCard}
                        onPress={() => toggleWorkoutPlanExercise(selectedDate, activity.id)}
                      >
                        <View style={styles.activityContent}>
                          <MaterialCommunityIcons
                            name="walk"
                            size={24}
                            color="#EF4444"
                          />
                          <Text style={styles.activityName}>{activity.name}</Text>
                          {activity.duration && (
                            <Text style={styles.activityDuration}>{activity.duration} min</Text>
                          )}
                        </View>
                        <Ionicons
                          name={activity.completed ? 'checkmark-circle' : 'ellipse-outline'}
                          size={24}
                          color={activity.completed ? '#7ED957' : '#CCC'}
                        />
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </View>
            ) : (
              <>
                <Text style={styles.dayNameTitle}>{dayData.workoutPlan?.dayName}</Text>
                {dayData.workoutPlan?.exercises.map((exercise: WorkoutPlanExercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.exerciseCard}
                    onPress={() => handleExercisePress(exercise)}
                  >
                    <View style={styles.exerciseHeader}>
                      <View style={styles.exerciseNameContainer}>
                        <MaterialCommunityIcons
                          name="dumbbell"
                          size={24}
                          color="#EF4444"
                        />
                        {editingExerciseId === exercise.id ? (
                          <TextInput
                            style={styles.exerciseNameInput}
                            value={editingExerciseName}
                            onChangeText={setEditingExerciseName}
                            autoFocus
                          />
                        ) : (
                          <Text style={styles.exerciseName}>{exercise.name}</Text>
                        )}
                      </View>
                      <View style={styles.exerciseActions}>
                        {editingExerciseId !== exercise.id && (
                          <TouchableOpacity
                            onPress={() => handleEditExercise(exercise)}
                            style={styles.actionButton}
                          >
                            <Ionicons name="create-outline" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => toggleWorkoutPlanExercise(selectedDate, exercise.id)}
                          style={styles.checkboxButton}
                        >
                          <Ionicons
                            name={exercise.completed ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={exercise.completed ? '#7ED957' : '#CCC'}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {editingExerciseId === exercise.id ? (
                      <View style={styles.editContainer}>
                        <View style={styles.editRow}>
                          <View style={styles.editField}>
                            <Text style={styles.editLabel}>Sets</Text>
                            <TextInput
                              style={styles.editInput}
                              value={editingSets}
                              onChangeText={setEditingSets}
                              keyboardType="numeric"
                            />
                          </View>
                          <View style={styles.editField}>
                            <Text style={styles.editLabel}>Reps</Text>
                            <TextInput
                              style={styles.editInput}
                              value={editingReps}
                              onChangeText={setEditingReps}
                              keyboardType="numeric"
                            />
                          </View>
                        </View>
                        <View style={styles.editActions}>
                          <TouchableOpacity
                            onPress={() => setEditingExerciseId(null)}
                            style={styles.cancelButton}
                          >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={handleSaveExerciseEdit}
                            style={styles.saveButton}
                          >
                            <LinearGradient colors={['#EF4444', '#F87171']} style={styles.saveButtonGradient}>
                              <Text style={styles.saveButtonText}>Save</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.exerciseDetails}>
                        {exercise.sets && exercise.reps && (
                          <Text style={styles.exerciseDetailText}>
                            Target: {exercise.sets} sets × {exercise.reps} reps
                            {exercise.weight ? ` @ ${exercise.weight}lbs` : ''}
                          </Text>
                        )}
                        {exercise.duration && (
                          <Text style={styles.exerciseDetailText}>
                            Duration: {exercise.duration} minutes
                          </Text>
                        )}
                        {(exercise.actualSets || exercise.actualReps || exercise.actualWeight) && (
                          <Text style={styles.exerciseActualText}>
                            Actual: {exercise.actualSets || 0} sets × {exercise.actualReps || 0} reps
                            {exercise.actualWeight ? ` @ ${exercise.actualWeight}lbs` : ''}
                          </Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
          
          {/* Done Button */}
          {hasWorkoutPlan && !isRestDay && (
            <View style={styles.doneButtonContainer}>
              <TouchableOpacity
                style={[styles.doneButton, !hasCompletedExercise && styles.doneButtonDisabled]}
                onPress={handleDoneWorkout}
                disabled={!hasCompletedExercise}
              >
                <LinearGradient 
                  colors={hasCompletedExercise ? ['#EF4444', '#F87171'] : ['#CCC', '#999']} 
                  style={styles.doneButtonGradient}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Preferences Modal */}
        <Modal
          visible={showPreferencesModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowPreferencesModal(false)}
        >
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.preferencesModal}>
                <Text style={styles.modalTitle}>Workout Plan Preferences</Text>
                <Text style={styles.modalSubtitle}>
                  Let's create a personalized workout plan for you
                </Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Days per week</Text>
                  <TextInput
                    style={styles.input}
                    value={daysPerWeek}
                    onChangeText={setDaysPerWeek}
                    keyboardType="numeric"
                    placeholder="3-7 days"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Workout Types</Text>
                  <View style={styles.chipContainer}>
                    {['strength', 'cardio', 'flexibility'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.chip,
                          workoutTypes.includes(type) && styles.chipSelected,
                        ]}
                        onPress={() => handleToggleWorkoutType(type)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            workoutTypes.includes(type) && styles.chipTextSelected,
                          ]}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Target Areas</Text>
                  <View style={styles.chipContainer}>
                    {['chest', 'back', 'legs', 'arms', 'shoulders'].map((area) => (
                      <TouchableOpacity
                        key={area}
                        style={[
                          styles.chip,
                          targetAreas.includes(area) && styles.chipSelected,
                        ]}
                        onPress={() => handleToggleTargetArea(area)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            targetAreas.includes(area) && styles.chipTextSelected,
                          ]}
                        >
                          {area.charAt(0).toUpperCase() + area.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Experience Level</Text>
                  <View style={styles.chipContainer}>
                    {['beginner', 'intermediate', 'advanced'].map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.chip,
                          experienceLevel === level && styles.chipSelected,
                        ]}
                        onPress={() => setExperienceLevel(level as any)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            experienceLevel === level && styles.chipTextSelected,
                          ]}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Weekly Distribution</Text>
                  <Text style={styles.inputDescription}>How would you like your workouts spread throughout the week?</Text>
                  <View style={styles.chipContainer}>
                    <TouchableOpacity
                      style={[
                        styles.distributionChip,
                        weekDistribution === 'consecutive' && styles.chipSelected,
                      ]}
                      onPress={() => setWeekDistribution('consecutive')}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          weekDistribution === 'consecutive' && styles.chipTextSelected,
                        ]}
                      >
                        Consecutive
                      </Text>
                      <Text style={styles.distributionDescription}>All workouts at start of week</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.distributionChip,
                        weekDistribution === 'spread' && styles.chipSelected,
                      ]}
                      onPress={() => setWeekDistribution('spread')}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          weekDistribution === 'spread' && styles.chipTextSelected,
                        ]}
                      >
                        Spread Out
                      </Text>
                      <Text style={styles.distributionDescription}>Evenly distributed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.distributionChip,
                        weekDistribution === 'custom' && styles.chipSelected,
                      ]}
                      onPress={() => setWeekDistribution('custom')}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          weekDistribution === 'custom' && styles.chipTextSelected,
                        ]}
                      >
                        Alternating
                      </Text>
                      <Text style={styles.distributionDescription}>2 on, 1 off pattern</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  {appState.workoutPlanPreferences && (
                    <TouchableOpacity
                      onPress={() => setShowPreferencesModal(false)}
                      style={styles.modalCancelButton}
                    >
                      <Text style={styles.modalCancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={handleCreateWorkoutPlan}
                    style={styles.modalSubmitButton}
                  >
                    <LinearGradient colors={['#EF4444', '#F87171']} style={styles.modalSubmitGradient}>
                      <Text style={styles.modalSubmitButtonText}>Generate Workout Plan</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Exercise Progress Modal */}
        <Modal
          visible={showExerciseModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowExerciseModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.exerciseProgressModal}>
              <Text style={styles.modalTitle}>Log Your Progress</Text>
              <Text style={styles.modalSubtitle}>{selectedExercise?.name}</Text>

              {selectedExercise?.sets && selectedExercise?.reps && (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Sets Completed</Text>
                    <TextInput
                      style={styles.input}
                      value={selectedExercise.actualSets?.toString() || ''}
                      onChangeText={(text) =>
                        setSelectedExercise({
                          ...selectedExercise,
                          actualSets: parseInt(text) || 0,
                        })
                      }
                      keyboardType="numeric"
                      placeholder={`Target: ${selectedExercise.sets}`}
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Reps per Set</Text>
                    <TextInput
                      style={styles.input}
                      value={selectedExercise.actualReps?.toString() || ''}
                      onChangeText={(text) =>
                        setSelectedExercise({
                          ...selectedExercise,
                          actualReps: parseInt(text) || 0,
                        })
                      }
                      keyboardType="numeric"
                      placeholder={`Target: ${selectedExercise.reps}`}
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Weight (lbs) - Optional</Text>
                    <TextInput
                      style={styles.input}
                      value={selectedExercise.actualWeight?.toString() || ''}
                      onChangeText={(text) =>
                        setSelectedExercise({
                          ...selectedExercise,
                          actualWeight: parseInt(text) || 0,
                        })
                      }
                      keyboardType="numeric"
                      placeholder="Enter weight"
                      placeholderTextColor="#999"
                    />
                  </View>
                </>
              )}

              {selectedExercise?.duration && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Duration (minutes)</Text>
                  <TextInput
                    style={styles.input}
                    value={selectedExercise.actualDuration?.toString() || ''}
                    onChangeText={(text) =>
                      setSelectedExercise({
                        ...selectedExercise,
                        actualDuration: parseInt(text) || 0,
                      })
                    }
                    keyboardType="numeric"
                    placeholder={`Target: ${selectedExercise.duration}`}
                    placeholderTextColor="#999"
                  />
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => {
                    setShowExerciseModal(false);
                    setSelectedExercise(null);
                  }}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveExerciseProgress}
                  style={styles.modalSubmitButton}
                >
                  <LinearGradient colors={['#EF4444', '#F87171']} style={styles.modalSubmitGradient}>
                    <Text style={styles.modalSubmitButtonText}>Save Progress</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Calorie Tracking Modal */}
        <Modal
          visible={showCalorieModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowCalorieModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.exerciseProgressModal}>
              <Text style={styles.modalTitle}>Log Workout Calories</Text>
              <Text style={styles.modalSubtitle}>Enter the calories burned during your workout</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Active Calories</Text>
                <TextInput
                  style={styles.input}
                  value={activeCalories}
                  onChangeText={setActiveCalories}
                  keyboardType="numeric"
                  placeholder="Enter active calories"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Total Calories</Text>
                <TextInput
                  style={styles.input}
                  value={totalCalories}
                  onChangeText={setTotalCalories}
                  keyboardType="numeric"
                  placeholder="Enter total calories"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => {
                    setShowCalorieModal(false);
                    setActiveCalories('');
                    setTotalCalories('');
                  }}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveCalories}
                  style={styles.modalSubmitButton}
                >
                  <LinearGradient colors={['#EF4444', '#F87171']} style={styles.modalSubmitGradient}>
                    <Text style={styles.modalSubmitButtonText}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateDropdown: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  dateList: {
    maxHeight: 300,
  },
  dateItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dateItemSelected: {
    backgroundColor: '#EF4444' + '10',
  },
  dateItemText: {
    fontSize: 14,
    color: '#333',
  },
  dateItemTextSelected: {
    color: '#EF4444',
    fontWeight: '600',
  },
  workoutPlanContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  createPlanButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createPlanGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  createPlanButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  restDayContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  restDayTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 24,
    marginBottom: 12,
  },
  restDaySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  dayNameTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  exerciseNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  exerciseNameInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#EF4444',
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
    marginRight: 8,
  },
  checkboxButton: {
    padding: 4,
  },
  exerciseDetails: {
    marginTop: 8,
  },
  exerciseDetailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  exerciseActualText: {
    fontSize: 14,
    color: '#7ED957',
    fontWeight: '600',
    marginTop: 4,
  },
  editContainer: {
    marginTop: 8,
  },
  editRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editField: {
    flex: 1,
  },
  editLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  editInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#333',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  preferencesModal: {
    width: width - 40,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    maxHeight: '90%',
  },
  exerciseProgressModal: {
    width: width - 40,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  chipSelected: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginRight: 12,
  },
  modalCancelButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSubmitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalSubmitGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  modalSubmitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  distributionChip: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  distributionDescription: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  optionalActivitiesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  optionalActivitiesSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  restDayActivityCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  activityDuration: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  doneButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  doneButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  doneButtonDisabled: {
    opacity: 0.5,
  },
  doneButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WorkoutPlanScreen;
