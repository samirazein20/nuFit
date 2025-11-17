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
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';

const QUICK_ADD_AMOUNTS = [250, 500, 750, 1000]; // ml

export default function HydrationScreen() {
  const { getTodayData, addWaterLog } = useApp();
  const [customAmount, setCustomAmount] = useState('');

  const todayData = getTodayData();
  const waterPercentage = (todayData.totalWater / todayData.waterGoal) * 100;
  const remainingWater = Math.max(0, todayData.waterGoal - todayData.totalWater);

  const handleQuickAdd = async (amount: number) => {
    await addWaterLog(amount);
    Alert.alert('Success', `Added ${amount}ml of water!`);
  };

  const handleCustomAdd = async () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid amount');
      return;
    }
    await addWaterLog(amount);
    setCustomAmount('');
    Alert.alert('Success', `Added ${amount}ml of water!`);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <LinearGradient
            colors={['#4FC3F7', '#29B6F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <MaterialCommunityIcons name="water" size={60} color={COLORS.white} />
            <Text style={styles.headerTitle}>Hydration Tracker</Text>
            <Text style={styles.headerSubtitle}>Stay hydrated, stay healthy!</Text>
          </LinearGradient>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <MaterialCommunityIcons name="water-check" size={28} color="#29B6F6" />
            <Text style={styles.progressTitle}>Today's Progress</Text>
          </View>

          <View style={styles.waterDisplay}>
            <View style={styles.waterCircle}>
              <MaterialCommunityIcons 
                name="cup-water" 
                size={48} 
                color={waterPercentage >= 100 ? COLORS.success : '#29B6F6'} 
              />
              <Text style={styles.waterPercentage}>{waterPercentage.toFixed(0)}%</Text>
            </View>
            <View style={styles.waterInfo}>
              <Text style={styles.waterCurrent}>{todayData.totalWater}ml</Text>
              <Text style={styles.waterGoal}>of {todayData.waterGoal}ml</Text>
              {waterPercentage >= 100 ? (
                <View style={styles.achievedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.achievedText}>Goal Achieved!</Text>
                </View>
              ) : (
                <Text style={styles.remainingText}>{remainingWater}ml remaining</Text>
              )}
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${Math.min(waterPercentage, 100)}%`,
                  backgroundColor: waterPercentage >= 100 ? COLORS.success : '#29B6F6'
                }
              ]} 
            />
          </View>

          <View style={styles.recommendationBox}>
            <Ionicons name="information-circle" size={20} color="#29B6F6" />
            <Text style={styles.recommendationText}>
              Recommended: {todayData.waterGoal}ml/day (~{(todayData.waterGoal / 250).toFixed(0)} glasses)
            </Text>
          </View>
        </View>

        {/* Quick Add Section */}
        <View style={styles.quickAddSection}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickAddGrid}>
            {QUICK_ADD_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={styles.quickAddButton}
                onPress={() => handleQuickAdd(amount)}
              >
                <LinearGradient
                  colors={['#4FC3F7', '#29B6F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickAddGradient}
                >
                  <MaterialCommunityIcons name="cup-water" size={32} color={COLORS.white} />
                  <Text style={styles.quickAddAmount}>{amount}ml</Text>
                  <Text style={styles.quickAddLabel}>
                    {amount === 250 ? '1 glass' : amount === 500 ? '2 glasses' : amount === 750 ? '3 glasses' : '4 glasses'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Amount Section */}
        <View style={styles.customSection}>
          <Text style={styles.sectionTitle}>Custom Amount</Text>
          <View style={styles.customCard}>
            <View style={styles.inputHeader}>
              <MaterialCommunityIcons name="water-plus" size={20} color={COLORS.primary} />
              <Text style={styles.inputLabel}>Amount (ml)</Text>
            </View>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="e.g., 350"
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
                value={customAmount}
                onChangeText={setCustomAmount}
              />
            </View>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleCustomAdd}
            >
              <LinearGradient
                colors={['#4FC3F7', '#29B6F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addGradient}
              >
                <Ionicons name="add-circle" size={24} color={COLORS.white} />
                <Text style={styles.addButtonText}>Add Water</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Logs */}
        {todayData.waterLogs.length > 0 && (
          <View style={styles.logsSection}>
            <Text style={styles.sectionTitle}>Today's Log</Text>
            <View style={styles.logsCard}>
              {todayData.waterLogs
                .slice()
                .reverse()
                .map((log) => (
                  <View key={log.id} style={styles.logItem}>
                    <View style={styles.logIconContainer}>
                      <MaterialCommunityIcons name="cup-water" size={24} color="#29B6F6" />
                    </View>
                    <View style={styles.logInfo}>
                      <Text style={styles.logAmount}>{log.amount}ml</Text>
                      <Text style={styles.logTime}>{formatTime(log.timestamp)}</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                  </View>
                ))}
            </View>
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
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  headerGradient: {
    padding: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  progressCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
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
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 10,
  },
  waterDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  waterCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E1F5FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  waterPercentage: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#29B6F6',
    marginTop: 4,
  },
  waterInfo: {
    flex: 1,
  },
  waterCurrent: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  waterGoal: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  achievedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  achievedText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 6,
  },
  remainingText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1F5FE',
    borderRadius: 12,
    padding: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
  },
  quickAddSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  quickAddButton: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAddGradient: {
    padding: 20,
    alignItems: 'center',
  },
  quickAddAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 8,
  },
  quickAddLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  customSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  customCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  inputCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    outlineWidth: 0,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  logsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  logsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E1F5FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  logAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  logTime: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
