// Example usage and data structures for nuFit app

// Example: Adding a workout
const workoutExample = {
  date: "2025-11-16",
  activeCalories: 350,
  totalCalories: 450,
};

// Example: Adding food with protein
const foodExample = {
  date: "2025-11-16",
  name: "Grilled Chicken Breast",
  quantity: 2,           // 2 servings
  proteinPerServing: 31, // 31g per serving
  // totalProtein will be calculated automatically: 2 × 31 = 62g
};

// Example: Daily data structure
const dailyDataExample = {
  date: "2025-11-16",
  workouts: [
    {
      id: "1700000000001",
      date: "2025-11-16",
      activeCalories: 350,
      totalCalories: 450,
      timestamp: 1700000000001,
    },
    {
      id: "1700000000002",
      date: "2025-11-16",
      activeCalories: 200,
      totalCalories: 280,
      timestamp: 1700000000002,
    }
  ],
  foods: [
    {
      id: "1700000000003",
      date: "2025-11-16",
      name: "Grilled Chicken Breast",
      quantity: 2,
      proteinPerServing: 31,
      totalProtein: 62,
      timestamp: 1700000000003,
    },
    {
      id: "1700000000004",
      date: "2025-11-16",
      name: "Greek Yogurt",
      quantity: 1,
      proteinPerServing: 20,
      totalProtein: 20,
      timestamp: 1700000000004,
    }
  ],
  totalActiveCalories: 550,  // 350 + 200
  totalCalories: 730,         // 450 + 280
  totalProtein: 82,           // 62 + 20
  proteinGoal: 150,
};

// Common food items with protein content (reference)
const commonFoods = [
  { name: "Chicken Breast (100g)", protein: 31 },
  { name: "Greek Yogurt (1 cup)", protein: 20 },
  { name: "Eggs (1 large)", protein: 6 },
  { name: "Salmon (100g)", protein: 25 },
  { name: "Protein Shake (1 scoop)", protein: 25 },
  { name: "Almonds (1 oz)", protein: 6 },
  { name: "Tuna (100g)", protein: 30 },
  { name: "Cottage Cheese (1 cup)", protein: 28 },
  { name: "Lean Beef (100g)", protein: 26 },
  { name: "Tofu (100g)", protein: 8 },
  { name: "Lentils (1 cup cooked)", protein: 18 },
  { name: "Peanut Butter (2 tbsp)", protein: 8 },
  { name: "Milk (1 cup)", protein: 8 },
  { name: "Quinoa (1 cup cooked)", protein: 8 },
  { name: "Black Beans (1 cup)", protein: 15 },
];

// Typical workout calorie burns (reference)
const workoutCalories = [
  { activity: "Running (30 min, moderate)", active: 300, total: 350 },
  { activity: "Cycling (30 min, moderate)", active: 250, total: 300 },
  { activity: "Swimming (30 min)", active: 350, total: 400 },
  { activity: "Weight Training (45 min)", active: 200, total: 280 },
  { activity: "HIIT (20 min)", active: 250, total: 300 },
  { activity: "Walking (30 min)", active: 120, total: 150 },
  { activity: "Yoga (45 min)", active: 100, total: 140 },
  { activity: "Basketball (30 min)", active: 300, total: 360 },
];

export { workoutExample, foodExample, dailyDataExample, commonFoods, workoutCalories };
