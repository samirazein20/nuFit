# nuFit - Fitness Tracking App

A modern React Native fitness tracking application built with Expo that helps users monitor their daily workouts, nutrition, and protein intake goals.

## ✨ Features

### 🏃 Workout Tracking
- Log workouts with active and total calories burned
- Select from 8 workout types: Running, Walking, Cycling, Weights, Yoga, Dance, Swimming, or Other
- Custom workout name support for "Other" category
- View recent workouts with icons and calorie breakdown
- Daily workout summary with total count

### 🍎 Nutrition Tracking
- Select food categories (Fruits, Vegetables, Meat, Seafood, Dairy, Grains, Snacks, Beverages)
- Log food items with quantity in grams and protein content
- Auto-estimation of protein content for 35+ common foods
- Track protein intake per gram of food
- View today's meals with total protein calculation

### 📊 Dashboard
- Visual daily protein goal progress with circular percentage indicator
- Real-time protein tracking (consumed vs. goal)
- Achievement badges when protein goal is met
- Daily statistics: Active Calories, Total Calories, Workouts, and Foods logged
- Customizable daily protein goal setting
- Modern gradient-based UI with card layouts

## 🎨 Design

- Clean, modern interface with gradient headers
- Red color scheme (#EF4444) for primary actions and navigation
- Material Design icons throughout
- Top tab navigation for easy access to Dashboard, Workouts, and Nutrition
- Responsive design with safe area handling for mobile devices

## 🛠 Technology Stack

- **React Native** with Expo SDK 54.0.0
- **TypeScript** for type safety
- **React Navigation** (Material Top Tabs) for navigation
- **AsyncStorage** for persistent local data storage
- **React Context API** for global state management
- **expo-linear-gradient** for gradient UI elements
- **@expo/vector-icons** for Material Community Icons
- **react-native-safe-area-context** for proper mobile layout

## 📋 Prerequisites

- Node.js v18.16.0 or higher (v20.19.4+ recommended)
- npm or yarn
- Expo Go app (for mobile testing)

## 🚀 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/samirazein20/nuFit.git
   cd nuFit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## 🏃 Running the App

### Start Development Server

```bash
npm start
```

### Platform-Specific Commands

- **Web**: `npm run web` or press `w` in terminal
- **iOS Simulator**: `npm run ios` or press `i` in terminal (requires macOS with Xcode)
- **Android Emulator**: `npm run android` or press `a` in terminal (requires Android Studio)

### Using Expo Go (Recommended for Mobile Testing)

1. Install [Expo Go](https://expo.dev/client) on your mobile device
2. Start the development server: `npm start`
3. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app scanner
4. The app will load on your device

## 📁 Project Structure

```
nuFit/
├── src/
│   ├── context/
│   │   └── AppContext.tsx        # Global state management with AsyncStorage
│   ├── screens/
│   │   ├── HomeScreen.tsx        # Dashboard with protein tracking
│   │   ├── WorkoutScreen.tsx     # Workout logging with dropdown selection
│   │   └── FoodScreen.tsx        # Food logging with category selection
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   └── constants/
│       └── colors.ts             # App color palette
├── assets/                        # Images and icons
├── App.tsx                        # Root component with navigation
├── app.json                       # Expo configuration
└── package.json                   # Dependencies and scripts
```

## 💡 Usage

### Dashboard (Home Screen)

- View circular protein progress indicator
- Monitor daily statistics (calories, workouts, foods)
- Track achievement badges
- Customize daily protein goal

### Workout Screen

1. Select workout type from dropdown (Running, Walking, Cycling, etc.)
2. Enter custom workout name (if "Other" selected)
3. Input active calories burned
4. Input total calories burned
5. View recent workouts with icons

### Food Screen

1. Select food category from dropdown
2. Enter food name (auto-estimates protein for common foods)
3. Input quantity in grams
4. Input protein content per serving
5. View today's meals with protein totals

## 💾 Data Persistence

All data is automatically saved locally using AsyncStorage. Your workout logs, food entries, and protein goal persist between app sessions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Samira Zein**
- GitHub: [@samirazein20](https://github.com/samirazein20)

## Default Settings

- Default protein goal: 150g per day
- Goal can be customized in the Dashboard

## Future Enhancements

Potential features for future versions:
- Weekly/monthly statistics and trends
- Food database for quick logging
- Custom workout types
- Export data functionality
- Dark mode support
- Reminders and notifications

## License

This project is open source and available for personal use.
