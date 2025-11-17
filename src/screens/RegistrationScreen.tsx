import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface RegistrationScreenProps {
  onComplete: (userData: UserProfile) => void;
}

export interface UserProfile {
  name: string;
  currentWeight: number;
  height: number;
  goalWeight: number;
  allergies: string[];
  workoutPlan?: WeeklyPlan;
  dietPlan?: WeeklyPlan;
}

export interface WeeklyPlan {
  [key: string]: string[];
}

export default function RegistrationScreen({ onComplete }: RegistrationScreenProps) {
  const [name, setName] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [allergies, setAllergies] = useState('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const generateAIPlan = async (): Promise<{ workoutPlan: WeeklyPlan; dietPlan: WeeklyPlan }> => {
    // Simulate AI generation with realistic plans
    await new Promise(resolve => setTimeout(resolve, 2000));

    const weightDiff = parseFloat(currentWeight) - parseFloat(goalWeight);
    const isWeightLoss = weightDiff > 0;
    const allergyList = allergies.split(',').map(a => a.trim().toLowerCase());

    // Generate workout plan based on goals
    const workoutPlan: WeeklyPlan = {
      Monday: isWeightLoss 
        ? ['30 min Cardio (Running/Cycling)', '15 min Core exercises', '10 min Stretching']
        : ['45 min Strength Training (Upper Body)', '15 min Core', '10 min Stretching'],
      Tuesday: ['45 min Yoga or Pilates', '20 min Walking'],
      Wednesday: isWeightLoss
        ? ['40 min HIIT Training', '15 min Ab workout', '10 min Cool down']
        : ['45 min Strength Training (Lower Body)', '15 min Core', '10 min Stretching'],
      Thursday: ['Rest Day or 30 min Light Walking'],
      Friday: isWeightLoss
        ? ['35 min Swimming or Cycling', '15 min Full body stretch']
        : ['45 min Full Body Workout', '15 min Cardio', '10 min Stretching'],
      Saturday: ['60 min Active Recreation (Hiking, Dancing, Sports)', '15 min Stretching'],
      Sunday: ['Rest and Recovery', 'Light stretching if needed'],
    };

    // Generate diet plan considering allergies
    const hasDairyAllergy = allergyList.some(a => a.includes('dairy') || a.includes('milk') || a.includes('lactose'));
    const hasNutAllergy = allergyList.some(a => a.includes('nut') || a.includes('peanut'));
    const hasGlutenAllergy = allergyList.some(a => a.includes('gluten') || a.includes('wheat'));

    const dietPlan: WeeklyPlan = {
      Monday: [
        hasGlutenAllergy ? 'Breakfast: Gluten-free oatmeal with berries' : 'Breakfast: Oatmeal with banana and honey',
        hasDairyAllergy ? 'Lunch: Grilled chicken with quinoa and vegetables' : 'Lunch: Chicken salad with Greek yogurt dressing',
        'Snack: Apple slices with ' + (hasNutAllergy ? 'sunflower seed butter' : 'almond butter'),
        'Dinner: Baked salmon with sweet potato and broccoli',
      ],
      Tuesday: [
        'Breakfast: Scrambled eggs with spinach and tomatoes',
        hasGlutenAllergy ? 'Lunch: Rice bowl with tofu and vegetables' : 'Lunch: Turkey sandwich with whole grain bread',
        hasDairyAllergy ? 'Snack: Fresh fruit smoothie with coconut milk' : 'Snack: Greek yogurt with berries',
        'Dinner: Lean beef stir-fry with brown rice',
      ],
      Wednesday: [
        hasGlutenAllergy ? 'Breakfast: Smoothie bowl with gluten-free granola' : 'Breakfast: Whole grain toast with avocado',
        'Lunch: Tuna salad with mixed greens',
        hasNutAllergy ? 'Snack: Hummus with vegetable sticks' : 'Snack: Mixed nuts and dried fruits',
        'Dinner: Grilled chicken breast with quinoa and roasted vegetables',
      ],
      Thursday: [
        hasDairyAllergy ? 'Breakfast: Chia pudding with coconut milk' : 'Breakfast: Cottage cheese with fruits',
        'Lunch: Lentil soup with side salad',
        'Snack: Protein shake with banana',
        'Dinner: Baked cod with asparagus and wild rice',
      ],
      Friday: [
        'Breakfast: Egg white omelet with vegetables',
        hasGlutenAllergy ? 'Lunch: Quinoa salad with chickpeas' : 'Lunch: Chicken wrap with whole wheat tortilla',
        'Snack: Carrot sticks with hummus',
        'Dinner: Turkey meatballs with zucchini noodles',
      ],
      Saturday: [
        hasGlutenAllergy ? 'Breakfast: Gluten-free pancakes with berries' : 'Breakfast: Whole grain pancakes with maple syrup',
        'Lunch: Grilled shrimp salad',
        hasDairyAllergy ? 'Snack: Rice cakes with avocado' : 'Snack: String cheese and grapes',
        'Dinner: Lean pork tenderloin with roasted Brussels sprouts',
      ],
      Sunday: [
        'Breakfast: Veggie frittata',
        'Lunch: Chicken and vegetable soup',
        hasNutAllergy ? 'Snack: Trail mix (nut-free)' : 'Snack: Trail mix with nuts',
        'Dinner: Baked chicken with sweet potato fries and green beans',
      ],
    };

    return { workoutPlan, dietPlan };
  };

  const handleComplete = async () => {
    if (!name.trim() || !currentWeight || !height || !goalWeight) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const cWeight = parseFloat(currentWeight);
    const h = parseFloat(height);
    const gWeight = parseFloat(goalWeight);

    if (isNaN(cWeight) || isNaN(h) || isNaN(gWeight) || cWeight <= 0 || h <= 0 || gWeight <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for weight and height');
      return;
    }

    try {
      setIsGenerating(true);
      const { workoutPlan, dietPlan } = await generateAIPlan();

      const userData: UserProfile = {
        name: name.trim(),
        currentWeight: cWeight,
        height: h,
        goalWeight: gWeight,
        allergies: allergies.split(',').map(a => a.trim()).filter(a => a),
        workoutPlan,
        dietPlan,
      };

      onComplete(userData);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate plans. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[COLORS.gradient1, COLORS.gradient2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <MaterialCommunityIcons name="account-plus" size={60} color={COLORS.white} />
          <Text style={styles.headerTitle}>Welcome to nuFit!</Text>
          <Text style={styles.headerSubtitle}>Let's create your personalized fitness journey</Text>
        </LinearGradient>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <View style={styles.inputCard}>
              <MaterialCommunityIcons name="account" size={20} color={COLORS.textLight} />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textLight}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputGroupSmall]}>
              <Text style={styles.inputLabel}>Current Weight (kg) *</Text>
              <View style={styles.inputCard}>
                <MaterialCommunityIcons name="weight-kilogram" size={20} color={COLORS.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="70"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="numeric"
                  value={currentWeight}
                  onChangeText={setCurrentWeight}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.inputGroupSmall]}>
              <Text style={styles.inputLabel}>Height (cm) *</Text>
              <View style={styles.inputCard}>
                <MaterialCommunityIcons name="human-male-height" size={20} color={COLORS.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="170"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Goal Weight (kg) *</Text>
            <View style={styles.inputCard}>
              <MaterialCommunityIcons name="target" size={20} color={COLORS.textLight} />
              <TextInput
                style={styles.input}
                placeholder="65"
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
                value={goalWeight}
                onChangeText={setGoalWeight}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Allergies (optional)</Text>
            <View style={styles.inputCard}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color={COLORS.textLight} />
              <TextInput
                style={styles.input}
                placeholder="e.g., dairy, nuts, gluten (comma separated)"
                placeholderTextColor={COLORS.textLight}
                value={allergies}
                onChangeText={setAllergies}
                multiline={true}
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.accent} />
            <Text style={styles.infoText}>
              We'll use AI to generate personalized workout and diet plans based on your goals and allergies. You can edit them later!
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleComplete}
            disabled={isGenerating}
          >
            <LinearGradient
              colors={[COLORS.gradient1, COLORS.gradient2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {isGenerating ? (
                <>
                  <ActivityIndicator color={COLORS.white} size="small" />
                  <Text style={styles.submitText}>Generating AI Plans...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="rocket" size={24} color={COLORS.white} />
                  <Text style={styles.submitText}>Start My Journey</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
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
  header: {
    padding: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center',
  },
  formSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputGroupSmall: {
    flex: 1,
    marginHorizontal: 5,
  },
  inputRow: {
    flexDirection: 'row',
    marginHorizontal: -5,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent + '15',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
});
