import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ActivityScreen() {
  const { getDataForDate } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const dayData = getDataForDate(formatDate(selectedDate));

  const formatDateDisplay = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (formatDate(date) === formatDate(today)) {
      return 'Today';
    } else if (formatDate(date) === formatDate(yesterday)) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Date Selector Card */}
        <View style={styles.dateSelectorCard}>
          <LinearGradient
            colors={[COLORS.gradient1, COLORS.gradient2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dateSelectorGradient}
          >
            <Text style={styles.dateSelectorLabel}>Select Date</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons name="calendar" size={24} color={COLORS.primary} />
              <Text style={styles.dateButtonText}>{formatDateDisplay(selectedDate)}</Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Daily Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <MaterialCommunityIcons name="chart-box" size={28} color={COLORS.primary} />
            <Text style={styles.summaryTitle}>Daily Summary</Text>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#FFE0E6' }]}>
                <MaterialCommunityIcons name="fire" size={24} color="#FF6B9D" />
              </View>
              <Text style={styles.summaryValue}>{dayData.totalActiveCalories}</Text>
              <Text style={styles.summaryLabel}>Active Kcal</Text>
            </View>

            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons name="nutrition" size={24} color="#7ED957" />
              </View>
              <Text style={styles.summaryValue}>{dayData.totalProtein.toFixed(1)}g</Text>
              <Text style={styles.summaryLabel}>Protein</Text>
            </View>

            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#E1F5FE' }]}>
                <MaterialCommunityIcons name="cup-water" size={24} color="#29B6F6" />
              </View>
              <Text style={styles.summaryValue}>{(dayData.totalWater / 1000).toFixed(1)}L</Text>
              <Text style={styles.summaryLabel}>Water</Text>
            </View>

            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#FFF3E0' }]}>
                <MaterialCommunityIcons name="food-apple" size={24} color="#FFB74D" />
              </View>
              <Text style={styles.summaryValue}>{dayData.foods.length}</Text>
              <Text style={styles.summaryLabel}>Meals</Text>
            </View>
          </View>
        </View>

        {/* Completed Workouts */}
        {dayData.workouts.length > 0 && (
          <View style={styles.completedCard}>
            <View style={styles.completedHeader}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
              <Text style={styles.completedTitle}>Completed Workouts</Text>
            </View>
            {dayData.workouts.map((workout) => (
              <View key={workout.id} style={styles.completedItem}>
                <MaterialCommunityIcons name="dumbbell" size={24} color={COLORS.primary} />
                <View style={styles.completedInfo}>
                  <Text style={styles.completedName}>{workout.name}</Text>
                  <Text style={styles.completedDetails}>
                    {workout.activeCalories} active kcal • {workout.totalCalories} total kcal
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Logged Foods */}
        {dayData.foods.length > 0 && (
          <View style={styles.completedCard}>
            <View style={styles.completedHeader}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
              <Text style={styles.completedTitle}>Logged Foods</Text>
            </View>
            {dayData.foods.map((food) => (
              <View key={food.id} style={styles.completedItem}>
                <MaterialCommunityIcons name="food" size={24} color={COLORS.primary} />
                <View style={styles.completedInfo}>
                  <Text style={styles.completedName}>{food.name}</Text>
                  <Text style={styles.completedDetails}>
                    {food.quantity}g • {food.totalProtein.toFixed(1)}g protein
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {dayData.workouts.length === 0 && 
         dayData.foods.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-blank" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>No Activity</Text>
            <Text style={styles.emptyText}>
              {formatDate(selectedDate) === formatDate(new Date())
                ? 'Start logging your workouts and meals!'
                : 'No data recorded for this date.'}
            </Text>
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
  dateSelectorCard: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  dateSelectorGradient: {
    padding: 20,
  },
  dateSelectorLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  summaryCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 10,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  planCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 10,
  },
  planContent: {
    marginVertical: 4,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
  },
  planItemCompleted: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  checkbox: {
    marginRight: 12,
    padding: 4,
  },
  planIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planItemText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  planItemTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight,
  },
  completedCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 10,
  },
  completedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 8,
  },
  completedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  completedName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  completedDetails: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
});
