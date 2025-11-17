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
import MealPlanScreen from './MealPlanScreen';

const { width } = Dimensions.get('window');

// Common foods database with protein content per serving
const COMMON_FOODS: { [key: string]: number } = {
  'chicken breast': 31,
  'chicken': 31,
  'greek yogurt': 20,
  'yogurt': 10,
  'eggs': 6,
  'egg': 6,
  'salmon': 25,
  'fish': 20,
  'protein shake': 25,
  'protein powder': 25,
  'whey protein': 25,
  'almonds': 6,
  'nuts': 6,
  'tuna': 30,
  'cottage cheese': 28,
  'cheese': 7,
  'beef': 26,
  'steak': 26,
  'ground beef': 26,
  'tofu': 8,
  'lentils': 18,
  'beans': 15,
  'black beans': 15,
  'peanut butter': 8,
  'milk': 8,
  'quinoa': 8,
  'rice': 4,
  'pasta': 7,
  'bread': 4,
  'oats': 5,
  'oatmeal': 5,
  'turkey': 29,
  'pork': 26,
  'shrimp': 24,
  'protein bar': 20,
};

const FOOD_CATEGORIES = [
  { id: 'fruits', icon: 'food-apple', color: '#FF6B9D', name: 'Fruits' },
  { id: 'vegetables', icon: 'carrot', color: '#7ED957', name: 'Vegetables' },
  { id: 'meat', icon: 'food-steak', color: '#A06BFF', name: 'Meat' },
  { id: 'seafood', icon: 'fish', color: '#6B9DFF', name: 'Seafood' },
  { id: 'dairy', icon: 'cheese', color: '#FFB74D', name: 'Dairy' },
  { id: 'grains', icon: 'noodles', color: '#FFA726', name: 'Grains' },
  { id: 'snacks', icon: 'food-variant', color: '#FF9D6B', name: 'Snacks' },
  { id: 'beverages', icon: 'cup', color: '#4ECDC4', name: 'Beverages' },
];

export default function FoodScreen({ navigation }: any) {
  const { addFood, getTodayData } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [proteinPerServing, setProteinPerServing] = useState('');
  const [isAutoEstimated, setIsAutoEstimated] = useState(false);
  const [mealPlanVisible, setMealPlanVisible] = useState(false);

  const todayData = getTodayData();
  const proteinPercentage = (todayData.totalProtein / todayData.proteinGoal) * 100;

  // Auto-estimate protein when food name changes
  const handleFoodNameChange = (name: string) => {
    setFoodName(name);
    
    // Search for matching food in database
    const nameLower = name.toLowerCase().trim();
    for (const [foodKey, protein] of Object.entries(COMMON_FOODS)) {
      if (nameLower.includes(foodKey) || foodKey.includes(nameLower)) {
        setProteinPerServing(protein.toString());
        setIsAutoEstimated(true);
        return;
      }
    }
    setIsAutoEstimated(false);
  };

  const handleAddFood = async () => {
    if (!selectedCategory) {
      Alert.alert('Invalid Input', 'Please select a food category');
      return;
    }
    
    if (!foodName.trim()) {
      Alert.alert('Invalid Input', 'Please enter a food name');
      return;
    }

    const qty = parseFloat(quantity);
    const protein = parseFloat(proteinPerServing);

    if (isNaN(qty) || isNaN(protein) || qty <= 0 || protein < 0) {
      Alert.alert('Invalid Input', 'Please enter valid quantity and protein values');
      return;
    }

    await addFood({
      date: todayData.date,
      name: foodName,
      quantity: qty,
      proteinPerServing: protein,
    });

    setSelectedCategory('');
    setFoodName('');
    setQuantity('');
    setProteinPerServing('');
    setIsAutoEstimated(false);
    Alert.alert('Success', '🎉 Food logged successfully!');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <LinearGradient
          colors={['#66BB6A', '#4CAF50']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <MaterialCommunityIcons name="food-apple" size={40} color={COLORS.white} />
          <Text style={styles.headerTitle}>Log Food</Text>
          <Text style={styles.headerSubtitle}>Track your nutrition & protein intake</Text>
        </LinearGradient>

        {/* Meal Plan Button */}
        <TouchableOpacity
          style={styles.mealPlanButton}
          onPress={() => setMealPlanVisible(true)}
        >
          <LinearGradient
            colors={['#4CAF50', '#66BB6A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.mealPlanGradient}
          >
            <MaterialCommunityIcons name="food-fork-drink" size={24} color={COLORS.white} />
            <Text style={styles.mealPlanButtonText}>View Meal Plan</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Protein Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Protein</Text>
            <Text style={styles.progressPercent}>{proteinPercentage.toFixed(0)}%</Text>
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressValue}>
              {todayData.totalProtein.toFixed(1)}g
            </Text>
            <Text style={styles.progressGoal}>/ {todayData.proteinGoal}g</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(proteinPercentage, 100)}%`,
                  backgroundColor: proteinPercentage >= 100 ? COLORS.success : '#4CAF50',
                },
              ]}
            />
          </View>
          {proteinPercentage >= 100 && (
            <View style={styles.achievedBadge}>
              <Ionicons name="trophy" size={16} color={COLORS.success} />
              <Text style={styles.achievedText}>Goal Achieved!</Text>
            </View>
          )}
        </View>

        {/* Food Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Category</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setCategoryDropdownVisible(true)}
          >
            {selectedCategory ? (
              <>
                <View style={styles.dropdownSelectedContent}>
                  {(() => {
                    const category = FOOD_CATEGORIES.find(c => c.name === selectedCategory);
                    return (
                      <>
                        <View
                          style={[
                            styles.dropdownIcon,
                            { backgroundColor: category?.color + '20' },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={category?.icon as any}
                            size={24}
                            color={category?.color}
                          />
                        </View>
                        <Text style={styles.dropdownSelectedText}>{selectedCategory}</Text>
                      </>
                    );
                  })()}
                </View>
                <Ionicons name="chevron-down" size={24} color={COLORS.textGray} />
              </>
            ) : (
              <>
                <Text style={styles.dropdownPlaceholder}>Choose a category</Text>
                <Ionicons name="chevron-down" size={24} color={COLORS.textLight} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Dropdown Modal */}
        <Modal
          visible={Boolean(categoryDropdownVisible)}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setCategoryDropdownVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setCategoryDropdownVisible(false)}
          >
            <View style={styles.dropdownModal}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownHeaderText}>Select Category</Text>
                <TouchableOpacity onPress={() => setCategoryDropdownVisible(false)}>
                  <Ionicons name="close-circle" size={28} color={COLORS.textGray} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.dropdownList}>
                {FOOD_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.dropdownItem,
                      selectedCategory === category.name && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedCategory(category.name);
                      setCategoryDropdownVisible(false);
                    }}
                  >
                    <View
                      style={[
                        styles.dropdownItemIcon,
                        { backgroundColor: category.color + '20' },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={category.icon as any}
                        size={28}
                        color={category.color}
                      />
                    </View>
                    <Text style={styles.dropdownItemText}>{category.name}</Text>
                    {selectedCategory === category.name && (
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Food Input Form */}
        <View style={styles.section}>
          <View style={styles.inputHeader}>
            <MaterialCommunityIcons name="food" size={20} color={COLORS.text} />
            <Text style={styles.inputLabel}>Food Name</Text>
          </View>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="e.g., Chicken breast, Greek yogurt"
              placeholderTextColor={COLORS.textLight}
              value={foodName}
              onChangeText={handleFoodNameChange}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputCardSmall}>
              <View style={styles.inputHeader}>
                <MaterialCommunityIcons name="counter" size={20} color={COLORS.text} />
                <Text style={styles.inputLabel}>Quantity</Text>
              </View>
              <View style={styles.inputCard}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
                <Text style={styles.unitText}>grams</Text>
              </View>
            </View>

            <View style={styles.inputCardSmall}>
              <View style={styles.inputHeader}>
                <MaterialCommunityIcons name="food-drumstick" size={20} color={COLORS.text} />
                <Text style={styles.inputLabel}>Protein</Text>
                {isAutoEstimated && (
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} style={{ marginLeft: 4 }} />
                )}
              </View>
              <View style={styles.inputCard}>
                <TextInput
                  style={[styles.input, isAutoEstimated && styles.inputHighlight]}
                  placeholder="0"
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
                  value={proteinPerServing}
                  onChangeText={(text) => {
                    setProteinPerServing(text);
                    setIsAutoEstimated(false);
                  }}
                />
                <Text style={styles.unitText}>g / serving</Text>
              </View>
            </View>
          </View>

          {isAutoEstimated && (
            <View style={styles.estimateNote}>
              <Ionicons name="information-circle" size={16} color={COLORS.accent} />
              <Text style={styles.estimateText}>Auto-estimated from database</Text>
            </View>
          )}
        </View>

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddFood}>
          <LinearGradient
            colors={['#4CAF50', '#66BB6A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addGradient}
          >
            <Ionicons name="add-circle" size={24} color={COLORS.white} />
            <Text style={styles.addButtonText}>Log Food</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent Foods */}
        {todayData.foods.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Today's Meals</Text>
            {todayData.foods.slice().reverse().map((food, index) => {
              const totalProtein = food.quantity * food.proteinPerServing;
              return (
                <View key={food.id} style={styles.foodItem}>
                  <View style={styles.foodIconContainer}>
                    <MaterialCommunityIcons
                      name="food-variant"
                      size={24}
                      color="#4CAF50"
                    />
                  </View>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodDetails}>
                      {food.quantity} serving{food.quantity !== 1 ? 's' : ''} • {food.proteinPerServing}g per serving
                    </Text>
                  </View>
                  <View style={styles.foodProtein}>
                    <Text style={styles.foodProteinValue}>{totalProtein.toFixed(1)}g</Text>
                    <Text style={styles.foodProteinLabel}>protein</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <MealPlanScreen
        visible={mealPlanVisible}
        onClose={() => setMealPlanVisible(false)}
      />
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
  progressSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  progressValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressGoal: {
    fontSize: 18,
    color: COLORS.textGray,
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  achievedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 12,
  },
  achievedText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 6,
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
    backgroundColor: '#4CAF50' + '10',
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
    backgroundColor: COLORS.white,
    borderRadius: 12,
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
  inputCardSmall: {
    flex: 1,
    marginHorizontal: 5,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 8,
  },
  input: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '600',
    paddingVertical: 4,
    outlineWidth: 0,
  },
  inputHighlight: {
    color: COLORS.success,
  },
  unitText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  estimateNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  estimateText: {
    fontSize: 12,
    color: COLORS.accent,
    marginLeft: 6,
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
  foodItem: {
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
  foodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#4CAF50' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  foodDetails: {
    fontSize: 13,
    color: COLORS.textGray,
  },
  foodProtein: {
    alignItems: 'flex-end',
  },
  foodProteinValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  foodProteinLabel: {
    fontSize: 11,
    color: COLORS.textGray,
  },
  mealPlanButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mealPlanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  mealPlanButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
});
