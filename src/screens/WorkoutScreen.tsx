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

const WORKOUT_TYPES = [
  { id: 'running', name: 'Running', icon: 'run', color: '#FF6B9D' },
  { id: 'walking', name: 'Walking', icon: 'walk', color: '#4ECDC4' },
  { id: 'cycling', name: 'Cycling', icon: 'bike', color: '#A06BFF' },
  { id: 'weights', name: 'Weights', icon: 'dumbbell', color: '#7ED957' },
  { id: 'yoga', name: 'Yoga', icon: 'yoga', color: '#FFA726' },
  { id: 'dance', name: 'Dance', icon: 'dance-ballroom', color: '#FF6B9D' },
  { id: 'swimming', name: 'Swimming', icon: 'swim', color: '#6B9DFF' },
  { id: 'other', name: 'Other', icon: 'fitness', color: '#FF9D6B' },
];

export default function WorkoutScreen() {
  const { addWorkout, getTodayData } = useApp();
  const [workoutName, setWorkoutName] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [activeCalories, setActiveCalories] = useState('');
  const [totalCalories, setTotalCalories] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const todayData = getTodayData();

  const handleAddWorkout = async () => {
    const name = workoutName.trim() || selectedType;
    if (!name) {
      Alert.alert('Invalid Input', 'Please enter or select a workout type');
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
      name: name,
      activeCalories: active,
      totalCalories: total,
    });

    setWorkoutName('');
    setSelectedType('');
    setActiveCalories('');
    setTotalCalories('');
    Alert.alert('Success', '🎉 Workout logged successfully!');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <LinearGradient
          colors={[COLORS.gradient1, COLORS.gradient2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <MaterialCommunityIcons name="dumbbell" size={40} color={COLORS.white} />
          <Text style={styles.headerTitle}>Log Workout</Text>
          <Text style={styles.headerSubtitle}>Track your exercise & burn calories</Text>
        </LinearGradient>

        {/* Workout Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Workout Type</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setDropdownVisible(true)}
          >
            {selectedType ? (
              <>
                <View style={styles.dropdownSelectedContent}>
                  {(() => {
                    const workoutType = WORKOUT_TYPES.find(t => t.name === selectedType);
                    return (
                      <>
                        <View
                          style={[
                            styles.dropdownIcon,
                            { backgroundColor: workoutType?.color + '20' },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={workoutType?.icon as any}
                            size={24}
                            color={workoutType?.color}
                          />
                        </View>
                        <Text style={styles.dropdownSelectedText}>{selectedType}</Text>
                      </>
                    );
                  })()}
                </View>
                <Ionicons name="chevron-down" size={24} color={COLORS.textGray} />
              </>
            ) : (
              <>
                <Text style={styles.dropdownPlaceholder}>Choose a workout type</Text>
                <Ionicons name="chevron-down" size={24} color={COLORS.textLight} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Dropdown Modal */}
        <Modal
          visible={dropdownVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setDropdownVisible(false)}
          >
            <View style={styles.dropdownModal}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownHeaderText}>Select Workout Type</Text>
                <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                  <Ionicons name="close-circle" size={28} color={COLORS.textGray} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.dropdownList}>
                {WORKOUT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.dropdownItem,
                      selectedType === type.name && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedType(type.name);
                      setWorkoutName('');
                      setDropdownVisible(false);
                    }}
                  >
                    <View
                      style={[
                        styles.dropdownItemIcon,
                        { backgroundColor: type.color + '20' },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={type.icon as any}
                        size={28}
                        color={type.color}
                      />
                    </View>
                    <Text style={styles.dropdownItemText}>{type.name}</Text>
                    {selectedType === type.name && (
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Custom Workout Name - Only shown when "Other" is selected */}
        {selectedType === 'Other' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enter Custom Workout</Text>
            <View style={styles.inputCard}>
              <MaterialCommunityIcons name="pencil" size={20} color={COLORS.textLight} />
              <TextInput
                style={styles.input}
                placeholder="e.g., HIIT, Boxing, Dance"
                placeholderTextColor={COLORS.textLight}
                value={workoutName}
                onChangeText={(text) => {
                  setWorkoutName(text);
                }}
              />
            </View>
          </View>
        )}

        {/* Calories Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calories Burned</Text>
          <View style={styles.caloriesRow}>
            <View style={styles.calorieCard}>
              <View style={styles.calorieHeader}>
                <MaterialCommunityIcons name="fire" size={24} color="#FF6B9D" />
                <Text style={styles.calorieLabel}>Active</Text>
              </View>
              <TextInput
                style={styles.calorieInput}
                placeholder="0"
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
                value={activeCalories}
                onChangeText={setActiveCalories}
              />
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>

            <View style={styles.calorieCard}>
              <View style={styles.calorieHeader}>
                <MaterialCommunityIcons name="lightning-bolt" size={24} color="#A06BFF" />
                <Text style={styles.calorieLabel}>Total</Text>
              </View>
              <TextInput
                style={styles.calorieInput}
                placeholder="0"
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
                value={totalCalories}
                onChangeText={setTotalCalories}
              />
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>
          </View>
        </View>

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddWorkout}>
          <LinearGradient
            colors={[COLORS.gradient1, COLORS.gradient2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addGradient}
          >
            <Ionicons name="add-circle" size={24} color={COLORS.white} />
            <Text style={styles.addButtonText}>Log Workout</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Today's Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Today's Summary</Text>
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={['#FF6B9D', '#FFA06B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.summaryIcon}
              >
                <MaterialCommunityIcons name="fire" size={28} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.summaryValue}>
                {todayData.totalActiveCalories.toFixed(0)}
              </Text>
              <Text style={styles.summaryLabel}>Active Kcal</Text>
            </View>

            <View style={styles.summaryCard}>
              <LinearGradient
                colors={['#A06BFF', '#6B9DFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.summaryIcon}
              >
                <MaterialCommunityIcons name="lightning-bolt" size={28} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.summaryValue}>
                {todayData.totalCalories.toFixed(0)}
              </Text>
              <Text style={styles.summaryLabel}>Total Kcal</Text>
            </View>

            <View style={styles.summaryCard}>
              <LinearGradient
                colors={['#7ED957', '#5CB85C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.summaryIcon}
              >
                <MaterialCommunityIcons name="dumbbell" size={28} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.summaryValue}>{todayData.workouts.length}</Text>
              <Text style={styles.summaryLabel}>Workouts</Text>
            </View>
          </View>
        </View>

        {/* Recent Workouts */}
        {todayData.workouts.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent Workouts</Text>
            {todayData.workouts.slice().reverse().map((workout, index) => {
              const workoutType = WORKOUT_TYPES.find(t => t.name === workout.name);
              const iconName = workoutType?.icon || 'fitness';
              const iconColor = workoutType?.color || COLORS.primary;
              
              return (
                <View key={workout.id} style={styles.workoutItem}>
                  <View
                    style={[
                      styles.workoutIcon,
                      { backgroundColor: iconColor + '20' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={iconName as any}
                      size={24}
                      color={iconColor}
                    />
                  </View>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <View style={styles.workoutStats}>
                      <View style={styles.workoutStat}>
                        <MaterialCommunityIcons name="fire" size={14} color="#FF6B9D" />
                        <Text style={styles.workoutStatText}>
                          {workout.activeCalories} kcal
                        </Text>
                      </View>
                      <View style={styles.workoutStat}>
                        <MaterialCommunityIcons name="lightning-bolt" size={14} color="#A06BFF" />
                        <Text style={styles.workoutStatText}>
                          {workout.totalCalories} kcal
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                </View>
              );
            })}
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
  },
  headerCard: {
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownSelectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dropdownSelectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: width - 40,
    maxHeight: 500,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownHeaderText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  dropdownItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
    outlineWidth: 0,
  },
  caloriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calorieCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calorieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  calorieLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGray,
    marginLeft: 8,
  },
  calorieInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
    outlineWidth: 0,
  },
  calorieUnit: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  addButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  addGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textGray,
    textAlign: 'center',
  },
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  workoutStats: {
    flexDirection: 'row',
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  workoutStatText: {
    fontSize: 13,
    color: COLORS.textGray,
    marginLeft: 4,
  },
});
