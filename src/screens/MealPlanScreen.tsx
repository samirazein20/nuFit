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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { MealPlanItem, MealPlanPreferences } from '../types';

const { width } = Dimensions.get('window');

interface MealPlanScreenProps {
  visible: boolean;
  onClose: () => void;
}

const MealPlanScreen: React.FC<MealPlanScreenProps> = ({ visible, onClose }) => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('MealPlanScreen must be used within an AppProvider');
  }

  const {
    appState,
    getDataForDate,
    setMealPlanPreferences,
    generateMealPlan,
    updateDailyMealPlan,
    toggleMealPlanItem,
    getStartDate,
    setStartDate,
  } = context;

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [dislikedFoods, setDislikedFoods] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editingMealText, setEditingMealText] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);

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

  const handleCreateMealPlan = async () => {
    const preferences: MealPlanPreferences = {
      allergies: allergies.split(',').map(a => a.trim()).filter(a => a),
      dislikedFoods: dislikedFoods.split(',').map(f => f.trim()).filter(f => f),
      dietaryRestrictions: dietaryRestrictions.split(',').map(d => d.trim()).filter(d => d),
    };

    await setMealPlanPreferences(preferences);
    const startDate = getStartDate() || new Date().toISOString().split('T')[0];
    await generateMealPlan(preferences, startDate);
    setShowPreferencesModal(false);
  };

  const handleToggleMeal = async (mealId: string) => {
    await toggleMealPlanItem(selectedDate, mealId);
  };

  const handleEditMeal = (meal: MealPlanItem) => {
    setEditingMealId(meal.id);
    setEditingMealText(meal.description);
  };

  const handleSaveMealEdit = async () => {
    if (!editingMealId) return;

    const dayData = getDataForDate(selectedDate);
    if (!dayData.mealPlan) return;

    const updatedMeals = dayData.mealPlan.meals.map((meal: MealPlanItem) =>
      meal.id === editingMealId ? { ...meal, description: editingMealText } : meal
    );

    await updateDailyMealPlan(selectedDate, updatedMeals);
    setEditingMealId(null);
    setEditingMealText('');
  };

  const handleCancelEdit = () => {
    setEditingMealId(null);
    setEditingMealText('');
  };

  const dayData = getDataForDate(selectedDate);
  const hasMealPlan = !!dayData.mealPlan;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <LinearGradient colors={['#66BB6A', '#4CAF50']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Meal Plan</Text>
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
              color="#4CAF50"
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

          {/* Meal Plan Display */}
          <ScrollView style={styles.mealPlanContainer} showsVerticalScrollIndicator={false}>
            {!hasMealPlan ? (
              <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={64} color="#CCC" />
                <Text style={styles.emptyStateText}>No meal plan for this date</Text>
                <TouchableOpacity
                  style={styles.createPlanButton}
                  onPress={() => setShowPreferencesModal(true)}
                >
                  <LinearGradient colors={['#4CAF50', '#66BB6A']} style={styles.createPlanGradient}>
                    <Text style={styles.createPlanButtonText}>Create Meal Plan</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              dayData.mealPlan?.meals.map((meal: MealPlanItem) => (
                <View key={meal.id} style={styles.mealCard}>
                  <View style={styles.mealHeader}>
                    <View style={styles.mealTypeContainer}>
                      <Ionicons
                        name={
                          meal.mealType === 'Breakfast'
                            ? 'sunny-outline'
                            : meal.mealType === 'Lunch'
                            ? 'partly-sunny-outline'
                            : meal.mealType === 'Dinner'
                            ? 'moon-outline'
                            : 'cafe-outline'
                        }
                        size={24}
                        color="#4CAF50"
                      />
                      <Text style={styles.mealType}>{meal.mealType}</Text>
                    </View>
                    <View style={styles.mealActions}>
                      {editingMealId !== meal.id && (
                        <TouchableOpacity
                          onPress={() => handleEditMeal(meal)}
                          style={styles.actionButton}
                        >
                          <Ionicons name="create-outline" size={20} color="#4CAF50" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => handleToggleMeal(meal.id)}
                        style={styles.checkboxButton}
                      >
                        <Ionicons
                          name={meal.completed ? 'checkmark-circle' : 'ellipse-outline'}
                          size={24}
                          color={meal.completed ? '#4CAF50' : '#CCC'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {editingMealId === meal.id ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={editingMealText}
                        onChangeText={setEditingMealText}
                        multiline
                        autoFocus
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity
                          onPress={handleCancelEdit}
                          style={styles.cancelButton}
                        >
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleSaveMealEdit}
                          style={styles.saveButton}
                        >
                          <LinearGradient colors={['#4CAF50', '#66BB6A']} style={styles.saveButtonGradient}>
                            <Text style={styles.saveButtonText}>Save</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <Text style={[styles.mealDescription, meal.completed && styles.mealCompleted]}>
                      {meal.description}
                    </Text>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>

        {/* Preferences Modal */}
        <Modal
          visible={showPreferencesModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowPreferencesModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.preferencesModal}>
              <Text style={styles.modalTitle}>Meal Plan Preferences</Text>
              <Text style={styles.modalSubtitle}>
                Help us create a personalized meal plan for you
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Allergies (comma separated)</Text>
                <TextInput
                  style={styles.input}
                  value={allergies}
                  onChangeText={setAllergies}
                  placeholder="e.g., peanuts, shellfish"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Disliked Foods (comma separated)</Text>
                <TextInput
                  style={styles.input}
                  value={dislikedFoods}
                  onChangeText={setDislikedFoods}
                  placeholder="e.g., broccoli, mushrooms"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Dietary Restrictions (comma separated)</Text>
                <TextInput
                  style={styles.input}
                  value={dietaryRestrictions}
                  onChangeText={setDietaryRestrictions}
                  placeholder="e.g., vegetarian, gluten-free"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.modalActions}>
                {appState.mealPlanPreferences && (
                  <TouchableOpacity
                    onPress={() => setShowPreferencesModal(false)}
                    style={styles.modalCancelButton}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleCreateMealPlan}
                  style={styles.modalSubmitButton}
                >
                  <LinearGradient colors={['#4CAF50', '#66BB6A']} style={styles.modalSubmitGradient}>
                    <Text style={styles.modalSubmitButtonText}>Generate Meal Plan</Text>
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
    backgroundColor: '#4CAF50' + '10',
  },
  dateItemText: {
    fontSize: 14,
    color: '#333',
  },
  dateItemTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  mealPlanContainer: {
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
  mealCard: {
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
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  mealActions: {
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
  mealDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  mealCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  editContainer: {
    marginTop: 8,
  },
  editInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
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
  preferencesModal: {
    width: width - 40,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
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
});

export default MealPlanScreen;
