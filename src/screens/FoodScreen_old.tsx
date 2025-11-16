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

export default function FoodScreen() {
  const { addFood, getTodayData } = useApp();
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [proteinPerServing, setProteinPerServing] = useState('');

  const todayData = getTodayData();

  // Auto-estimate protein when food name changes
  const handleFoodNameChange = (name: string) => {
    setFoodName(name);
    
    // Search for matching food in database
    const nameLower = name.toLowerCase().trim();
    for (const [foodKey, protein] of Object.entries(COMMON_FOODS)) {
      if (nameLower.includes(foodKey) || foodKey.includes(nameLower)) {
        setProteinPerServing(protein.toString());
        return;
      }
    }
  };

  const handleAddFood = async () => {
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

    setFoodName('');
    setQuantity('');
    setProteinPerServing('');
    Alert.alert('Success', 'Food added successfully!');
  };

  const proteinPercentage = (todayData.totalProtein / todayData.proteinGoal) * 100;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Log Food</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Food Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Chicken Breast, Greek Yogurt"
            placeholderTextColor={COLORS.textLight}
            value={foodName}
            onChangeText={handleFoodNameChange}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Quantity (servings)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter number of servings"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Protein per Serving (g) {proteinPerServing && '✓'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Auto-calculated or enter manually"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
            value={proteinPerServing}
            onChangeText={setProteinPerServing}
          />
          {proteinPerServing && (
            <Text style={styles.estimateNote}>
              Estimated from food database
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleAddFood}>
          <Text style={styles.buttonText}>Add Food</Text>
        </TouchableOpacity>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Today's Protein</Text>
          <View style={styles.summaryCard}>
            <View style={styles.proteinHeader}>
              <Text style={styles.proteinCurrent}>{todayData.totalProtein.toFixed(1)}g</Text>
              <Text style={styles.proteinGoal}>/ {todayData.proteinGoal}g</Text>
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
            
            <Text style={styles.percentageText}>
              {proteinPercentage.toFixed(0)}% of goal
            </Text>
            
            {proteinPercentage >= 100 && (
              <Text style={styles.goalReachedText}>🎉 Goal Reached!</Text>
            )}
          </View>
        </View>

        {todayData.foods.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Today's Foods</Text>
            {todayData.foods.slice().reverse().map((food) => (
              <View key={food.id} style={styles.listItem}>
                <View style={styles.listItemHeader}>
                  <Text style={styles.listItemTitle}>{food.name}</Text>
                  <Text style={styles.listItemProtein}>{food.totalProtein.toFixed(1)}g</Text>
                </View>
                <Text style={styles.listItemText}>
                  {food.quantity} serving{food.quantity !== 1 ? 's' : ''} × {food.proteinPerServing}g protein
                </Text>
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
  proteinHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 20,
  },
  proteinCurrent: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  proteinGoal: {
    fontSize: 24,
    color: COLORS.textLight,
    marginLeft: 5,
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: COLORS.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 10,
  },
  percentageText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 5,
  },
  goalReachedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
    textAlign: 'center',
    marginTop: 10,
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
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
  },
  listItemProtein: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  listItemText: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 2,
  },
  estimateNote: {
    fontSize: 12,
    color: COLORS.success,
    marginTop: 5,
    fontStyle: 'italic',
  },
});
