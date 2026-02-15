import { supabase, authHelpers, api } from './supabase-client.js';

const { useState, useEffect } = React;

function MealPlannerApp() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const currentUser = await authHelpers.getUser();
    if (!currentUser) {
      window.location.href = '/login.html';
      return;
    }
    
    setUser(currentUser);
    
    // Load profile from backend
    const { profile: userProfile } = await api.getProfile();
    setProfile(userProfile);
    setLoading(false);
  }

  // Logout function
  async function handleLogout() {
    await authHelpers.signOut();
    window.location.href = '/login.html';
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  // Rest of your app continues here...

// Use React from global scope (loaded via CDN)
const { useState } = React;

// Simple icon components (replacing lucide-react)
const Camera = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const Calendar = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ShoppingCart = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const TrendingDown = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>;
const Utensils = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const Clock = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AlertCircle = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckCircle = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const X = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const Plus = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const Edit2 = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const Save = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;

function MealPlannerApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPinSettings, setShowPinSettings] = useState(false);
  
  // Default PIN is 1234 - users should change this!
  const [appPin, setAppPin] = useState('1234');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  const [currentUser, setCurrentUser] = useState('me');
  const [plannedMeals, setPlannedMeals] = useState({});
  const [cookedMeals, setCookedMeals] = useState({});
  
  // User profiles with health metrics
  const [userProfiles, setUserProfiles] = useState({
    me: {
      name: 'Nikhel',
      age: 36,
      height: 175, // cm
      weight: 85, // kg
      gender: 'male',
      goal: 'weight_loss',
      targetCalories: 1260,
      dietaryPreference: 'omnivore'
    },
    kiran: {
      name: 'Kiran',
      age: 34,
      height: 165,
      weight: 65,
      gender: 'female',
      goal: 'maintenance',
      targetCalories: 1800,
      dietaryPreference: 'vegetarian'
    },
    child: {
      name: 'Little One',
      age: 4,
      height: 105,
      weight: 16,
      gender: 'female',
      goal: 'growth',
      targetCalories: 1400,
      dietaryPreference: 'vegetarian'
    }
  });

  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const calculateBMR = (profile) => {
    // Mifflin-St Jeor Equation
    if (profile.gender === 'male') {
      return (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) + 5;
    } else {
      return (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) - 161;
    }
  };

  const getCurrentUserProfile = () => {
    return userProfiles[currentUser] || userProfiles.me;
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === appPin) {
      setIsAuthenticated(true);
      setPinInput('');
      setPinError('');
      // Store authentication in sessionStorage (cleared when browser closes)
      sessionStorage.setItem('mealPlannerAuth', 'true');
    } else {
      setPinError('Incorrect PIN. Please try again.');
      setPinInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('mealPlannerAuth');
    setPinInput('');
    setCurrentUser('me');
    setActiveTab('home');
  };

  const handlePinChange = () => {
    if (newPin.length !== 4 || confirmPin.length !== 4) {
      alert('PIN must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      alert('PINs do not match');
      return;
    }
    setAppPin(newPin);
    setShowPinSettings(false);
    setNewPin('');
    setConfirmPin('');
    alert('✅ PIN changed successfully!');
  };

  const handleProfileUpdate = () => {
    if (!editingProfile) return;
    
    // Validation
    if (editingProfile.age < 1 || editingProfile.age > 120) {
      alert('Please enter a valid age');
      return;
    }
    if (editingProfile.height < 50 || editingProfile.height > 250) {
      alert('Please enter a valid height (50-250 cm)');
      return;
    }
    if (editingProfile.weight < 10 || editingProfile.weight > 300) {
      alert('Please enter a valid weight (10-300 kg)');
      return;
    }
    
    // Calculate BMR and suggest calorie target
    const bmr = calculateBMR(editingProfile);
    let suggestedCalories = bmr;
    
    // Apply activity multiplier and goal adjustment
    if (editingProfile.goal === 'weight_loss') {
      suggestedCalories = bmr * 1.2 * 0.8; // Sedentary activity, 20% deficit
    } else if (editingProfile.goal === 'weight_gain') {
      suggestedCalories = bmr * 1.2 * 1.2; // Sedentary activity, 20% surplus
    } else if (editingProfile.goal === 'growth') {
      suggestedCalories = bmr * 1.5; // Higher for children
    } else {
      suggestedCalories = bmr * 1.2; // Maintenance
    }
    
    const updatedProfile = {
      ...editingProfile,
      targetCalories: Math.round(suggestedCalories)
    };
    
    setUserProfiles({
      ...userProfiles,
      [currentUser]: updatedProfile
    });
    
    setShowProfileSettings(false);
    setEditingProfile(null);
    alert('✅ Profile updated successfully!');
  };

  // Check if already authenticated in this session
  React.useEffect(() => {
    if (sessionStorage.getItem('mealPlannerAuth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);
  const [activeTab, setActiveTab] = useState('home');
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Chicken Breast', quantity: 500, unit: 'g', category: 'protein', expires: '2026-02-10', low: false },
    { id: 2, name: 'Paneer', quantity: 250, unit: 'g', category: 'protein', expires: '2026-02-08', low: false },
    { id: 3, name: 'Tomatoes', quantity: 1000, unit: 'g', category: 'vegetables', expires: '2026-02-06', low: false },
    { id: 4, name: 'Spinach', quantity: 200, unit: 'g', category: 'vegetables', expires: '2026-02-05', low: true },
    { id: 5, name: 'Brown Rice', quantity: 2000, unit: 'g', category: 'grains', expires: '2026-03-01', low: false },
    { id: 6, name: 'Eggs', quantity: 6, unit: 'pieces', category: 'protein', expires: '2026-02-12', low: true },
    { id: 7, name: 'Greek Yogurt', quantity: 400, unit: 'g', category: 'dairy', expires: '2026-02-07', low: false },
  ]);
  
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: '', quantity: '', unit: 'g', category: 'vegetables' });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showRecipeEditor, setShowRecipeEditor] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [showWeekPlanner, setShowWeekPlanner] = useState(false);
  
  // AI Recipe Suggestions
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);

  const today = new Date();
  const dayOfWeek = today.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[dayOfWeek];
  const isNonVegDay = [0, 1, 3, 5].includes(dayOfWeek);
  
  // Get diet type based on user preference
  const getDietTypeDisplay = () => {
    const profile = getCurrentUserProfile();
    const dietPref = profile.dietaryPreference || 'omnivore';
    
    if (dietPref === 'vegetarian') return '🥬 Vegetarian';
    if (dietPref === 'eggetarian') return '🥚 Eggetarian (Veg + Eggs)';
    if (dietPref === 'vegan') return '🌱 Vegan';
    if (dietPref === 'pescatarian') return isNonVegDay ? '🐟 Pescatarian (Veg + Fish)' : '🥬 Vegetarian';
    if (dietPref === 'omnivore') return isNonVegDay ? '🍗 Non-Vegetarian' : '🥬 Pure Vegetarian';
    
    return isNonVegDay ? 'Non-Vegetarian' : 'Pure Vegetarian';
  };
  
  const dietType = getDietTypeDisplay();

  // Custom recipes state
  const [customRecipes, setCustomRecipes] = useState([]);
  
  // Weekly meal plan state
  const [weeklyMealPlan, setWeeklyMealPlan] = useState({});

  const defaultRecipes = {
    nonVeg: [
      // Indian Non-Veg
      {
        id: 'r1',
        name: 'Grilled Chicken with Quinoa',
        calories: 450,
        protein: 42,
        prepTime: 25,
        ingredients: [
          { name: 'Chicken Breast', amount: 200, unit: 'g' },
          { name: 'Quinoa', amount: 100, unit: 'g' },
          { name: 'Broccoli', amount: 150, unit: 'g' },
        ],
        mealType: 'dinner',
        nutrition: { carbs: 35, fat: 12 },
        isCustom: false,
        cuisine: 'Continental'
      },
      {
        id: 'r2',
        name: 'Egg White Omelette Bowl',
        calories: 320,
        protein: 28,
        prepTime: 15,
        ingredients: [
          { name: 'Eggs', amount: 3, unit: 'pieces' },
          { name: 'Tomatoes', amount: 100, unit: 'g' },
          { name: 'Spinach', amount: 50, unit: 'g' },
        ],
        mealType: 'breakfast',
        nutrition: { carbs: 18, fat: 8 },
        isCustom: false,
        cuisine: 'Continental'
      },
      {
        id: 'r3',
        name: 'Chicken Tikka Salad',
        calories: 380,
        protein: 38,
        prepTime: 20,
        ingredients: [
          { name: 'Chicken Breast', amount: 150, unit: 'g' },
          { name: 'Greek Yogurt', amount: 100, unit: 'g' },
        ],
        mealType: 'lunch',
        nutrition: { carbs: 22, fat: 10 },
        isCustom: false,
        cuisine: 'Indian'
      },
      {
        id: 'r11',
        name: 'Butter Chicken (Light)',
        calories: 420,
        protein: 35,
        prepTime: 35,
        ingredients: [
          { name: 'Chicken Breast', amount: 200, unit: 'g' },
          { name: 'Tomatoes', amount: 150, unit: 'g' },
          { name: 'Greek Yogurt', amount: 100, unit: 'g' },
        ],
        mealType: 'dinner',
        nutrition: { carbs: 25, fat: 18 },
        isCustom: false,
        cuisine: 'Indian'
      },
      {
        id: 'r12',
        name: 'Chicken Keema with Peas',
        calories: 390,
        protein: 36,
        prepTime: 30,
        ingredients: [
          { name: 'Chicken Mince', amount: 200, unit: 'g' },
          { name: 'Peas', amount: 100, unit: 'g' },
          { name: 'Tomatoes', amount: 100, unit: 'g' },
        ],
        mealType: 'dinner',
        nutrition: { carbs: 20, fat: 15 },
        isCustom: false,
        cuisine: 'Indian'
      },
      {
        id: 'r13',
        name: 'Egg Bhurji',
        calories: 340,
        protein: 26,
        prepTime: 15,
        ingredients: [
          { name: 'Eggs', amount: 3, unit: 'pieces' },
          { name: 'Tomatoes', amount: 100, unit: 'g' },
          { name: 'Onion', amount: 50, unit: 'g' },
        ],
        mealType: 'breakfast',
        nutrition: { carbs: 15, fat: 20 },
        isCustom: false,
        cuisine: 'Indian'
      },
      {
        id: 'r14',
        name: 'Tandoori Chicken Wrap',
        calories: 400,
        protein: 32,
        prepTime: 25,
        ingredients: [
          { name: 'Chicken Breast', amount: 150, unit: 'g' },
          { name: 'Whole Wheat Roti', amount: 2, unit: 'pieces' },
          { name: 'Cucumber', amount: 50, unit: 'g' },
        ],
        mealType: 'lunch',
        nutrition: { carbs: 35, fat: 12 },
        isCustom: false,
        cuisine: 'Indian'
      },
      {
        id: 'r15',
        name: 'Grilled Fish with Lemon',
        calories: 350,
        protein: 40,
        prepTime: 20,
        ingredients: [
          { name: 'Fish Fillet', amount: 200, unit: 'g' },
          { name: 'Lemon', amount: 1, unit: 'pieces' },
          { name: 'Broccoli', amount: 100, unit: 'g' },
        ],
        mealType: 'dinner',
        nutrition: { carbs: 10, fat: 15 },
        isCustom: false,
        cuisine: 'Continental'
      },
      {
        id: 'r16',
        name: 'Chicken Soup with Vegetables',
        calories: 280,
        protein: 28,
        prepTime: 30,
        ingredients: [
          { name: 'Chicken Breast', amount: 150, unit: 'g' },
          { name: 'Carrots', amount: 100, unit: 'g' },
          { name: 'Celery', amount: 50, unit: 'g' },
        ],
        mealType: 'lunch',
        nutrition: { carbs: 18, fat: 8 },
        isCustom: false,
        cuisine: 'Continental'
      },
      {
        id: 'r17',
        name: 'Scrambled Eggs with Toast',
        calories: 360,
        protein: 24,
        prepTime: 10,
        ingredients: [
          { name: 'Eggs', amount: 3, unit: 'pieces' },
          { name: 'Whole Wheat Bread', amount: 2, unit: 'pieces' },
          { name: 'Milk', amount: 50, unit: 'ml' },
        ],
        mealType: 'breakfast',
        nutrition: { carbs: 30, fat: 16 },
        isCustom: false,
        cuisine: 'Continental'
      }
    ],
    veg: [
      // Indian Veg
      {
        id: 'r4',
        name: 'Paneer Bhurji with Brown Rice',
        calories: 420,
        protein: 32,
        prepTime: 20,
        ingredients: [
          { name: 'Paneer', amount: 150, unit: 'g' },
          { name: 'Brown Rice', amount: 100, unit: 'g' },
          { name: 'Tomatoes', amount: 100, unit: 'g' },
        ],
        mealType: 'dinner',
        nutrition: { carbs: 40, fat: 15 },
        isCustom: false,
        cuisine: 'Indian'
      },
      {
        id: 'r5',
        name: 'Moong Dal Cheela',
        calories: 280,
        protein: 18,
        prepTime: 15,
        ingredients: [
          { name: 'Moong Dal', amount: 100, unit: 'g' },
          { name: 'Tomatoes', amount: 50, unit: 'g' },
        ],
        mealType: 'breakfast',
        nutrition: { carbs: 35, fat: 6 },
        isCustom: false,
        cuisine: 'Indian'
      },
      {
        id: 'r6',
        name: 'Palak Paneer Bowl',
        calories: 360,
        protein: 24,
        prepTime: 25,
        ingredients: [
          { name: 'Paneer', amount: 150, unit: 'g' },
          { name: 'Spinach', amount: 200, unit: 'g' },
          { name: 'Tomatoes', amount: 100, unit: 'g' },
        ],
        mealType: 'lunch',
        nutrition: { carbs: 28, fat: 14 },
        isCustom: false,
        cuisine: 'Indian'
      },
      {
        id: 'r21',
        name: 'Dal Tadka with Roti',
        calories: 380,
        protein: 20,
        prepTime: 30,
        ingredients: [
          { name: 'Toor Dal', amount: 100, unit: 'g' },
          { name: 'Whole Wheat Roti', amount: 2, unit: 'pieces' },
          { name: 'Tomatoes', amount: 100, unit: 'g' },
        ],
        mealType: 'dinner',
        nutrition: { carbs: 55, fat: 8 },
        isCustom: false,
        cuisine: 'Indian'
      },
      {
        id: 'r22',
        name: 'Chole (Chickpea Curry)',
        calories: 400,
        protein: 22,
        prepTime: 35,
        ingredients: [
          { name: 'Chickpeas', amount: 150, unit: 'g' },
          { name: 'Tomatoes', amount: 100, unit: 'g' },
          { name: 'Onion', amount: 80, unit: 'g' },
        ],
        mealType: 'lunch',
        nutrition: { carbs: 58, fat: 10 },
        isCustom: false,
        cuisine: 'Indian'
      },
      {
        id: 'r23',
        name: 'Vegetable Upma',
        calories: 300,
        protein: 12,
        prepTime: 20,
        ingredients: [
          { name: 'Rava/Semolina', amount: 100, unit: 'g' },
          { name: 'Mixed Vegetables', amount: 150, unit: 'g' },
          { name: 'Curry Leaves', amount: 10, unit: 'g' },
        ],
        mealType: 'breakfast',
        nutrition: { carbs: 48, fat: 8 },
        isCustom: false,
        cuisine: 'Indian'
      },
      {
        id: 'r24',
        name: 'Aloo Gobi (Dry)',
        calories: 320,
        protein: 10,
        prepTime: 25,
        ingredients: [
          { name: 'Potato', amount: 150, unit: 'g' },
          { name: 'Cauliflower', amount: 150, unit: 'g' },
          { name: 'Tomatoes', amount: 50, unit: 'g' },
        ],
        mealType: 'lunch',
        nutrition: { carbs: 52, fat: 8 },
        isCustom: false,
        cuisine: 'Indian'
      },
      {
        id: 'r25',
        name: 'Poha (Flattened Rice)',
        calories: 260,
        protein: 8,
        prepTime: 15,
        ingredients: [
          { name: 'Poha', amount: 100, unit: 'g' },
          { name: 'Peanuts', amount: 30, unit: 'g' },
          { name: 'Curry Leaves', amount: 10, unit: 'g' },
        ],
        mealType: 'breakfast',
        nutrition: { carbs: 45, fat: 6 },
        isCustom: false,
        cuisine: 'Indian'
      },
      {
        id: 'r26',
        name: 'Rajma (Kidney Bean Curry)',
        calories: 390,
        protein: 24,
        prepTime: 40,
        ingredients: [
          { name: 'Kidney Beans', amount: 150, unit: 'g' },
          { name: 'Tomatoes', amount: 100, unit: 'g' },
          { name: 'Brown Rice', amount: 100, unit: 'g' },
        ],
        mealType: 'dinner',
        nutrition: { carbs: 60, fat: 8 },
        isCustom: false,
        cuisine: 'Indian'
      },
      {
        id: 'r27',
        name: 'Greek Salad with Feta',
        calories: 320,
        protein: 16,
        prepTime: 10,
        ingredients: [
          { name: 'Feta Cheese', amount: 100, unit: 'g' },
          { name: 'Cucumber', amount: 150, unit: 'g' },
          { name: 'Tomatoes', amount: 150, unit: 'g' },
        ],
        mealType: 'lunch',
        nutrition: { carbs: 18, fat: 22 },
        isCustom: false,
        cuisine: 'Continental'
      },
      {
        id: 'r28',
        name: 'Vegetable Pasta',
        calories: 400,
        protein: 14,
        prepTime: 20,
        ingredients: [
          { name: 'Whole Wheat Pasta', amount: 100, unit: 'g' },
          { name: 'Mixed Vegetables', amount: 200, unit: 'g' },
          { name: 'Tomatoes', amount: 100, unit: 'g' },
        ],
        mealType: 'dinner',
        nutrition: { carbs: 65, fat: 10 },
        isCustom: false,
        cuisine: 'Continental'
      },
      {
        id: 'r29',
        name: 'Oatmeal with Fruits',
        calories: 290,
        protein: 12,
        prepTime: 10,
        ingredients: [
          { name: 'Oats', amount: 80, unit: 'g' },
          { name: 'Banana', amount: 1, unit: 'pieces' },
          { name: 'Milk', amount: 200, unit: 'ml' },
        ],
        mealType: 'breakfast',
        nutrition: { carbs: 48, fat: 6 },
        isCustom: false,
        cuisine: 'Continental'
      },
      {
        id: 'r30',
        name: 'Quinoa Buddha Bowl',
        calories: 380,
        protein: 18,
        prepTime: 25,
        ingredients: [
          { name: 'Quinoa', amount: 100, unit: 'g' },
          { name: 'Mixed Vegetables', amount: 200, unit: 'g' },
          { name: 'Chickpeas', amount: 100, unit: 'g' },
        ],
        mealType: 'lunch',
        nutrition: { carbs: 55, fat: 10 },
        isCustom: false,
        cuisine: 'Continental'
      }
    ]
  };

  const allRecipes = [
    ...defaultRecipes.nonVeg, 
    ...defaultRecipes.veg,
    ...customRecipes
  ];

  // Get recipes based on user's dietary preference AND day
  const getCurrentUserRecipes = () => {
    const profile = getCurrentUserProfile();
    const dietPref = profile.dietaryPreference || 'omnivore';
    
    // For omnivores, use day-based filtering (original behavior)
    if (dietPref === 'omnivore') {
      return isNonVegDay 
        ? [...defaultRecipes.nonVeg, ...customRecipes.filter(r => !r.isVeg)]
        : [...defaultRecipes.veg, ...customRecipes.filter(r => r.isVeg)];
    }
    
    // For vegetarian/eggetarian/vegan - ALWAYS veg recipes regardless of day
    if (dietPref === 'vegetarian' || dietPref === 'eggetarian' || dietPref === 'vegan') {
      const vegRecipes = [...defaultRecipes.veg, ...customRecipes.filter(r => r.isVeg)];
      
      // For vegan, filter out dairy/egg recipes
      if (dietPref === 'vegan') {
        return vegRecipes.filter(r => 
          !r.name.toLowerCase().includes('paneer') &&
          !r.name.toLowerCase().includes('yogurt') &&
          !r.name.toLowerCase().includes('cheese') &&
          !r.name.toLowerCase().includes('egg')
        );
      }
      
      return vegRecipes;
    }
    
    // For pescatarian - veg recipes + fish (on non-veg days)
    if (dietPref === 'pescatarian') {
      const vegRecipes = [...defaultRecipes.veg, ...customRecipes.filter(r => r.isVeg)];
      if (isNonVegDay) {
        const fishRecipes = defaultRecipes.nonVeg.filter(r => 
          r.name.toLowerCase().includes('fish') || 
          r.name.toLowerCase().includes('prawn') ||
          r.name.toLowerCase().includes('shrimp')
        );
        return [...vegRecipes, ...fishRecipes];
      }
      return vegRecipes;
    }
    
    // Default: veg recipes
    return [...defaultRecipes.veg, ...customRecipes.filter(r => r.isVeg)];
  };

  const todaysRecipes = getCurrentUserRecipes();

  // Dynamic schedule based on day
  const getDynamicSchedule = (dayOfWeek) => {
    const isSunday = dayOfWeek === 0;
    
    return [
      { 
        time: '9:00 AM', 
        meal: 'Breakfast', 
        type: 'breakfast', 
        calories: 280, 
        status: 'completed',
        cooked: false 
      },
      !isSunday && { 
        time: '11:00 AM', 
        meal: 'Yoga Class', 
        type: 'activity', 
        status: 'upcoming', 
        note: '60 min session' 
      },
      { 
        time: '12:30 PM', 
        meal: 'Lunch/Brunch', 
        type: 'lunch', 
        calories: 380, 
        status: 'upcoming', 
        note: isSunday ? 'Leisurely family meal' : 'Post-yoga meal',
        cooked: false 
      },
      { 
        time: '4:00 PM', 
        meal: 'Snack (Optional)', 
        type: 'snack', 
        calories: 150, 
        status: 'pending', 
        note: 'Healthy option',
        cooked: false 
      },
      { 
        time: '8:00 PM', 
        meal: 'Family Dinner', 
        type: 'dinner', 
        calories: 450, 
        status: 'pending', 
        note: 'Main meal',
        cooked: false 
      },
      { 
        time: '8:30 PM', 
        meal: 'EATING CUTOFF', 
        type: 'cutoff', 
        status: 'alert' 
      }
    ].filter(Boolean);
  };

  const mealSchedule = getDynamicSchedule(dayOfWeek);

  // Auto-adjust inventory when meal time passes
  React.useEffect(() => {
    const checkMealTimes = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute; // Convert to minutes since midnight

      mealSchedule.forEach(meal => {
        if (meal.type === 'breakfast' || meal.type === 'lunch' || meal.type === 'dinner' || meal.type === 'snack') {
          // Parse meal time (e.g., "9:00 AM" -> minutes)
          const timeParts = meal.time.match(/(\d+):(\d+)\s*(AM|PM)/);
          if (timeParts) {
            let mealHour = parseInt(timeParts[1]);
            const mealMinute = parseInt(timeParts[2]);
            const period = timeParts[3];
            
            if (period === 'PM' && mealHour !== 12) mealHour += 12;
            if (period === 'AM' && mealHour === 12) mealHour = 0;
            
            const mealTime = mealHour * 60 + mealMinute;
            const mealKey = `${currentDay}-${meal.type}`;
            
            // If current time is past meal time and we have a planned meal and haven't cooked it yet
            if (currentTime > mealTime && plannedMeals[mealKey] && !cookedMeals[mealKey]) {
              // Auto-deduct ingredients
              deductIngredients(plannedMeals[mealKey]);
              setCookedMeals({...cookedMeals, [mealKey]: true});
            }
          }
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkMealTimes, 60000);
    checkMealTimes(); // Check immediately on mount
    
    return () => clearInterval(interval);
  }, [plannedMeals, cookedMeals, mealSchedule]);

  const assignRecipeToMeal = (mealType, recipe) => {
    const mealKey = `${currentDay}-${mealType}`;
    setPlannedMeals({...plannedMeals, [mealKey]: recipe});
  };

  const getMealStatus = (mealType) => {
    const mealKey = `${currentDay}-${mealType}`;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const meal = mealSchedule.find(m => m.type === mealType);
    if (!meal) return 'pending';
    
    const timeParts = meal.time.match(/(\d+):(\d+)\s*(AM|PM)/);
    if (!timeParts) return 'pending';
    
    let mealHour = parseInt(timeParts[1]);
    const mealMinute = parseInt(timeParts[2]);
    const period = timeParts[3];
    
    if (period === 'PM' && mealHour !== 12) mealHour += 12;
    if (period === 'AM' && mealHour === 12) mealHour = 0;
    
    const mealTime = mealHour * 60 + mealMinute;
    
    if (cookedMeals[mealKey]) return 'completed';
    if (currentTime > mealTime) return 'auto-completed';
    if (currentTime > mealTime - 30) return 'upcoming';
    return 'pending';
  };

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.quantity) {
      setInventory([...inventory, {
        id: Date.now(),
        name: newIngredient.name,
        quantity: parseFloat(newIngredient.quantity),
        unit: newIngredient.unit,
        category: newIngredient.category,
        expires: '2026-02-20',
        low: false
      }]);
      setNewIngredient({ name: '', quantity: '', unit: 'g', category: 'vegetables' });
      setShowAddIngredient(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        simulateAIRecognition();
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateAIRecognition = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const mockDetections = [
        { name: 'Carrots', quantity: 500, unit: 'g', category: 'vegetables' },
        { name: 'Milk', quantity: 1000, unit: 'ml', category: 'dairy' },
        { name: 'Chicken Thighs', quantity: 800, unit: 'g', category: 'protein' }
      ];
      
      const newItems = mockDetections.map((item, idx) => ({
        id: Date.now() + idx,
        ...item,
        expires: '2026-02-15',
        low: false
      }));
      
      setInventory([...inventory, ...newItems]);
      setIsAnalyzing(false);
      setUploadedImage(null);
      setShowAddIngredient(false);
    }, 2000);
  };

  const removeIngredient = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const deductIngredients = (recipe) => {
    const updatedInventory = [...inventory];
    
    recipe.ingredients.forEach(ingredient => {
      const inventoryItem = updatedInventory.find(
        item => item.name.toLowerCase() === ingredient.name.toLowerCase()
      );
      
      if (inventoryItem) {
        inventoryItem.quantity -= ingredient.amount;
        
        // Mark as low stock if below threshold
        const threshold = inventoryItem.unit === 'pieces' ? 3 : 300;
        if (inventoryItem.quantity < threshold) {
          inventoryItem.low = true;
        }
      }
    });
    
    setInventory(updatedInventory);
  };

  const markMealAsCooked = (recipe) => {
    deductIngredients(recipe);
    alert(`✅ Meal cooked! Ingredients have been deducted from inventory.`);
  };

  const lowStockCount = inventory.filter(item => item.low).length;

  const getShoppingList = () => {
    return inventory.filter(item => item.low);
  };

  const generateSearchQuery = (items) => {
    return items.map(item => item.name).join(', ');
  };

  const openSwiggyInstamart = () => {
    const items = getShoppingList();
    const query = generateSearchQuery(items);
    const appLink = `swiggy://instamart?search=${encodeURIComponent(query)}`;
    const webLink = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`;
    
    window.location.href = appLink;
    setTimeout(() => {
      window.open(webLink, '_blank');
    }, 500);
  };

  const openBlinkit = () => {
    const items = getShoppingList();
    const query = generateSearchQuery(items);
    const webLink = `https://blinkit.com/s/?q=${encodeURIComponent(query)}`;
    window.open(webLink, '_blank');
  };

  const openZepto = () => {
    const items = getShoppingList();
    const query = generateSearchQuery(items);
    const webLink = `https://www.zepto.com/search?query=${encodeURIComponent(query)}`;
    window.open(webLink, '_blank');
  };

  const shareViaWhatsApp = () => {
    const items = getShoppingList();
    const message = `🛒 Shopping List (Low Stock Items):\n\n${items.map(item => `• ${item.name} - ${item.quantity}${item.unit}`).join('\n')}\n\nPlease order these items. Thank you!`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
  };

  const copyShoppingList = () => {
    const items = getShoppingList();
    const text = `🛒 Shopping List (Low Stock Items):\n\n${items.map(item => `• ${item.name} - ${item.quantity}${item.unit}`).join('\n')}\n\n📲 Order on: Swiggy Instamart | Blinkit | Zepto`;
    navigator.clipboard.writeText(text);
    alert('Shopping list copied to clipboard!');
  };

  const saveCustomRecipe = (recipe) => {
    if (recipe.id && recipe.id.startsWith('custom-')) {
      // Update existing
      setCustomRecipes(customRecipes.map(r => r.id === recipe.id ? recipe : r));
    } else {
      // Add new
      const newRecipe = { ...recipe, id: `custom-${Date.now()}`, isCustom: true };
      setCustomRecipes([...customRecipes, newRecipe]);
    }
    setShowRecipeEditor(false);
    setEditingRecipe(null);
  };

  const deleteCustomRecipe = (id) => {
    setCustomRecipes(customRecipes.filter(r => r.id !== id));
  };

  //const generateAIRecipeSuggestions = async () => {
    //setIsGeneratingAI(true);
    //setAiError(null);
  const generateAIRecipeSuggestions = async () => {
  setIsGeneratingAI(true);
  setAiError(null);
  
  try {
    // Call your actual backend API
    const result = await api.generateRecipes(profile, inventory);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to generate recipes');
    }
    
    setAiSuggestions(result.recipes);
    setShowAISuggestions(true);
    
  } catch (error) {
    console.error('AI Generation Error:', error);
    setAiError('Failed to generate suggestions. Please try again.');
  } finally {
    setIsGeneratingAI(false);
  }
};
    
    try {
      const profile = getCurrentUserProfile();
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Smart recipe generation based on profile and ingredients
      const recipes = generateSmartRecipes(profile, inventory);
      setAiSuggestions(recipes);
      setShowAISuggestions(true);
      
    } catch (error) {
      console.error('Generation Error:', error);
      setAiError('Failed to generate suggestions. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const generateSmartRecipes = (profile, availableInventory) => {
    const dietaryPref = profile.dietaryPreference || 'omnivore';
    const targetCalsPerMeal = Math.round(profile.targetCalories / 3);
    const targetProteinPerMeal = Math.round(profile.weight * 1.6 / 3);
    
    // Get available ingredients
    const hasChicken = availableInventory.some(i => i.name.toLowerCase().includes('chicken'));
    const hasPaneer = availableInventory.some(i => i.name.toLowerCase().includes('paneer'));
    const hasEggs = availableInventory.some(i => i.name.toLowerCase().includes('egg'));
    const hasSpinach = availableInventory.some(i => i.name.toLowerCase().includes('spinach'));
    const hasTomato = availableInventory.some(i => i.name.toLowerCase().includes('tomato'));
    const hasRice = availableInventory.some(i => i.name.toLowerCase().includes('rice'));
    const hasYogurt = availableInventory.some(i => i.name.toLowerCase().includes('yogurt'));
    
    // Recipe templates based on dietary preference
    const recipeTemplates = [];
    
    // Non-veg recipes (only if omnivore or pescatarian)
    if (dietaryPref === 'omnivore' || dietaryPref === 'pescatarian') {
      if (hasChicken) {
        recipeTemplates.push({
          name: 'Grilled Chicken with Vegetables',
          calories: Math.min(targetCalsPerMeal, 450),
          protein: Math.min(targetProteinPerMeal, 45),
          prepTime: 25,
          ingredients: [
            { name: 'Chicken Breast', amount: 200, unit: 'g' },
            { name: 'Mixed Vegetables', amount: 150, unit: 'g' },
            { name: 'Olive Oil', amount: 10, unit: 'ml' },
            { name: 'Spices', amount: 5, unit: 'g' }
          ],
          mealType: profile.goal === 'weight_loss' ? 'lunch' : 'dinner',
          isVeg: false,
          cuisine: 'Indian Fusion',
          description: 'High-protein grilled chicken with seasonal vegetables. Perfect for weight management and muscle building.',
          nutrition: {
            carbs: Math.round(targetCalsPerMeal * 0.3 / 4),
            fat: Math.round(targetCalsPerMeal * 0.25 / 9)
          }
        });
      }
      
      recipeTemplates.push({
        name: 'Tandoori Fish Curry',
        calories: Math.min(targetCalsPerMeal + 50, 480),
        protein: Math.min(targetProteinPerMeal + 5, 42),
        prepTime: 30,
        ingredients: [
          { name: 'Fish Fillet', amount: 200, unit: 'g' },
          { name: 'Yogurt', amount: 100, unit: 'g' },
          { name: 'Tomatoes', amount: 150, unit: 'g' },
          { name: 'Spices (turmeric, red chili)', amount: 10, unit: 'g' }
        ],
        mealType: 'dinner',
        isVeg: false,
        cuisine: 'Indian',
        description: 'Traditional tandoori fish in a rich tomato-yogurt curry. Omega-3 rich and protein-packed.',
        nutrition: {
          carbs: Math.round(targetCalsPerMeal * 0.35 / 4),
          fat: Math.round(targetCalsPerMeal * 0.3 / 9)
        }
      });
    }
    
    // Vegetarian recipes (for all except vegans)
    if (dietaryPref !== 'vegan') {
      if (hasPaneer) {
        recipeTemplates.push({
          name: 'Palak Paneer with Brown Rice',
          calories: Math.min(targetCalsPerMeal, 420),
          protein: Math.min(targetProteinPerMeal, 38),
          prepTime: 20,
          ingredients: [
            { name: 'Paneer', amount: 150, unit: 'g' },
            { name: 'Spinach', amount: 200, unit: 'g' },
            { name: 'Brown Rice', amount: 100, unit: 'g' },
            { name: 'Onions & Spices', amount: 50, unit: 'g' }
          ],
          mealType: 'lunch',
          isVeg: true,
          cuisine: 'Indian',
          description: 'Classic paneer curry with fresh spinach and fiber-rich brown rice. Iron and protein rich.',
          nutrition: {
            carbs: Math.round(targetCalsPerMeal * 0.45 / 4),
            fat: Math.round(targetCalsPerMeal * 0.3 / 9)
          }
        });
      }
      
      if (hasEggs && (dietaryPref === 'omnivore' || dietaryPref === 'eggetarian')) {
        recipeTemplates.push({
          name: 'Egg White Omelette with Vegetables',
          calories: Math.min(targetCalsPerMeal - 50, 280),
          protein: Math.min(targetProteinPerMeal, 32),
          prepTime: 15,
          ingredients: [
            { name: 'Egg Whites', amount: 150, unit: 'g' },
            { name: 'Bell Peppers', amount: 100, unit: 'g' },
            { name: 'Tomatoes', amount: 80, unit: 'g' },
            { name: 'Mushrooms', amount: 50, unit: 'g' }
          ],
          mealType: 'breakfast',
          isVeg: true,
          cuisine: 'Continental',
          description: 'Light, protein-rich breakfast with colorful vegetables. Low calorie and highly nutritious.',
          nutrition: {
            carbs: Math.round((targetCalsPerMeal - 50) * 0.25 / 4),
            fat: Math.round((targetCalsPerMeal - 50) * 0.2 / 9)
          }
        });
      }
    }
    
    // Vegan recipes (for everyone, especially vegans)
    recipeTemplates.push({
      name: 'Chana Masala Bowl',
      calories: Math.min(targetCalsPerMeal, 400),
      protein: Math.min(targetProteinPerMeal - 5, 28),
      prepTime: 25,
      ingredients: [
        { name: 'Chickpeas', amount: 200, unit: 'g' },
        { name: 'Tomatoes', amount: 150, unit: 'g' },
        { name: 'Onions', amount: 100, unit: 'g' },
        { name: 'Spices & Herbs', amount: 15, unit: 'g' }
      ],
      mealType: 'dinner',
      isVeg: true,
      cuisine: 'Indian',
      description: 'Hearty chickpea curry with aromatic spices. Plant-based protein and fiber rich.',
      nutrition: {
        carbs: Math.round(targetCalsPerMeal * 0.55 / 4),
        fat: Math.round(targetCalsPerMeal * 0.2 / 9)
      }
    });
    
    recipeTemplates.push({
      name: 'Quinoa Buddha Bowl',
      calories: Math.min(targetCalsPerMeal + 30, 430),
      protein: Math.min(targetProteinPerMeal - 8, 25),
      prepTime: 20,
      ingredients: [
        { name: 'Quinoa', amount: 100, unit: 'g' },
        { name: 'Roasted Vegetables', amount: 200, unit: 'g' },
        { name: 'Chickpeas', amount: 80, unit: 'g' },
        { name: 'Tahini Dressing', amount: 30, unit: 'ml' }
      ],
      mealType: 'lunch',
      isVeg: true,
      cuisine: 'Fusion',
      description: 'Complete protein bowl with quinoa and roasted vegetables. Nutrient-dense superfood meal.',
      nutrition: {
        carbs: Math.round(targetCalsPerMeal * 0.5 / 4),
        fat: Math.round(targetCalsPerMeal * 0.28 / 9)
      }
    });
    
    // Add goal-specific recipes
    if (profile.goal === 'weight_loss') {
      recipeTemplates.push({
        name: 'Greek Salad with Grilled Tofu',
        calories: 320,
        protein: 28,
        prepTime: 15,
        ingredients: [
          { name: 'Firm Tofu', amount: 150, unit: 'g' },
          { name: 'Cucumbers', amount: 100, unit: 'g' },
          { name: 'Tomatoes', amount: 100, unit: 'g' },
          { name: 'Feta Cheese', amount: 30, unit: 'g' }
        ],
        mealType: 'lunch',
        isVeg: true,
        cuisine: 'Mediterranean',
        description: 'Low-calorie, high-volume salad perfect for weight loss. Fresh and satisfying.',
        nutrition: { carbs: 18, fat: 12 }
      });
    } else if (profile.goal === 'weight_gain' || profile.goal === 'growth') {
      recipeTemplates.push({
        name: 'Peanut Butter Banana Smoothie Bowl',
        calories: 520,
        protein: 32,
        prepTime: 10,
        ingredients: [
          { name: 'Banana', amount: 150, unit: 'g' },
          { name: 'Peanut Butter', amount: 40, unit: 'g' },
          { name: 'Greek Yogurt', amount: 200, unit: 'g' },
          { name: 'Granola', amount: 50, unit: 'g' }
        ],
        mealType: 'breakfast',
        isVeg: true,
        cuisine: 'Continental',
        description: 'Calorie-dense smoothie bowl for muscle building and growth. Delicious and energizing.',
        nutrition: { carbs: 65, fat: 18 }
      });
    }
    
    // Filter recipes based on dietary preference
    let filteredRecipes = recipeTemplates.filter(recipe => {
      if (dietaryPref === 'vegan') return recipe.isVeg && !recipe.ingredients.some(i => 
        i.name.toLowerCase().includes('paneer') || 
        i.name.toLowerCase().includes('yogurt') ||
        i.name.toLowerCase().includes('cheese') ||
        i.name.toLowerCase().includes('egg')
      );
      if (dietaryPref === 'vegetarian') return recipe.isVeg;
      if (dietaryPref === 'eggetarian') return recipe.isVeg || recipe.ingredients.some(i => i.name.toLowerCase().includes('egg'));
      if (dietaryPref === 'pescatarian') return recipe.isVeg || recipe.name.toLowerCase().includes('fish');
      return true; // omnivore
    });
    
    // Randomly select 3 recipes
    const shuffled = filteredRecipes.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3).map((recipe, index) => ({
      ...recipe,
      id: `ai-${Date.now()}-${index}`,
      isAI: true
    }));
    
    return selected;
  };

  const addAIRecipeToCollection = (recipe) => {
    const newRecipe = { ...recipe, isCustom: true, id: `custom-${Date.now()}` };
    setCustomRecipes([...customRecipes, newRecipe]);
    alert(`Added "${recipe.name}" to your recipe collection!`);
  };

  const planMealForDay = (day, mealType, recipe) => {
    const key = `${day}-${mealType}`;
    setWeeklyMealPlan({
      ...weeklyMealPlan,
      [key]: recipe
    });
  };

  const HomeDashboard = () => {
    const profile = getCurrentUserProfile();
    const targetCalories = profile.targetCalories;
    const bmi = calculateBMI(profile.weight, profile.height);
    
    // House Help sees family meal plan, not their own
    if (currentUser === 'help') {
      return (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">👨‍🍳 Family Meal Plan</h2>
            <p className="text-sm opacity-90">{currentDay} • {dietType} Day</p>
            <p className="text-xs opacity-80 mt-2">View today's meals to prepare for the family</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-600" />
              Today's Meal Schedule
            </h3>
            <div className="space-y-3">
              {mealSchedule
                .filter(meal => meal.type === 'breakfast' || meal.type === 'lunch' || meal.type === 'dinner' || meal.type === 'snack')
                .map((meal, idx) => {
                  const mealKey = `${currentDay}-${meal.type}`;
                  const assignedRecipe = plannedMeals[mealKey];
                  
                  return (
                    <div key={idx} className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <h4 className="font-semibold text-gray-800">{meal.meal}</h4>
                          <p className="text-xs text-gray-600">{meal.time}</p>
                        </div>
                        {assignedRecipe && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            ✓ Planned
                          </span>
                        )}
                      </div>
                      {assignedRecipe ? (
                        <div className="mt-2 bg-white rounded p-2">
                          <p className="font-medium text-sm text-gray-800">
                            🍽️ {assignedRecipe.name}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            ⏱️ Prep time: {assignedRecipe.prepTime} min | 🍴 {assignedRecipe.cuisine}
                          </p>
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Ingredients needed:</p>
                            <ul className="text-xs text-gray-600 space-y-0.5">
                              {assignedRecipe.ingredients.map((ing, i) => (
                                <li key={i}>• {ing.name} - {ing.amount}{ing.unit}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-orange-600 mt-1">
                          ⚠️ No meal planned yet
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📝 Cooking Notes:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Check inventory before starting</li>
              <li>• Family dinner is at 8:00 PM sharp</li>
              <li>• No eating after 8:30 PM (weight loss goal)</li>
              {dayOfWeek === 0 && <li>• Sunday - No school, family brunch style</li>}
            </ul>
          </div>
        </div>
      );
    }
    
    // Regular user view
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome, {profile.name}!</h2>
          <p className="text-sm opacity-90">{currentDay} • {dietType} Day</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
              {isNonVegDay ? '🍗 Non-Veg' : '🥬 Vegetarian'}
            </div>
            {dayOfWeek === 0 && (
              <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
                🏠 Sunday - No School/Yoga
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Utensils className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Daily Target</span>
            </div>
            <p className="text-2xl font-bold">{targetCalories}</p>
            <p className="text-xs text-gray-500 mt-1">calories/day</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">Low Stock</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
            <p className="text-xs text-gray-500 mt-1">Items to replenish</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-gray-700">Health Profile</h3>
            <button
              onClick={() => {
                setEditingProfile({...profile});
                setShowProfileSettings(true);
              }}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-blue-50 rounded p-2 text-center">
              <p className="font-semibold text-blue-700">{bmi}</p>
              <p className="text-gray-600">BMI</p>
            </div>
            <div className="bg-purple-50 rounded p-2 text-center">
              <p className="font-semibold text-purple-700">{profile.weight}kg</p>
              <p className="text-gray-600">Weight</p>
            </div>
            <div className="bg-green-50 rounded p-2 text-center">
              <p className="font-semibold text-green-700">{profile.age}y</p>
              <p className="text-gray-600">Age</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-600">Height</p>
              <p className="font-semibold">{profile.height} cm</p>
            </div>
            <div>
              <p className="text-gray-600">Goal</p>
              <p className="font-semibold capitalize">{profile.goal.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Today's Schedule
          </h3>
          <div className="space-y-2">
            {mealSchedule.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-sm">{item.meal}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
                {item.status && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'completed' ? 'bg-green-100 text-green-700' :
                    item.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {item.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowWeekPlanner(true)}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <Calendar className="w-5 h-5" />
          Plan This Week's Meals
        </button>
      </div>
    );
  };

  const InventoryTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Fridge Inventory</h2>
        <button 
          onClick={() => setShowAddIngredient(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
        >
          <Camera className="w-4 h-4" />
          Add Photo
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-orange-800 font-medium">⚠️ {lowStockCount} items running low</p>
            <button
              onClick={() => setShowShoppingList(true)}
              className="bg-orange-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium"
            >
              📋 Order Now
            </button>
          </div>
        </div>
      )}

      {showAddIngredient && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Add Ingredients</h3>
            <button onClick={() => {
              setShowAddIngredient(false);
              setUploadedImage(null);
              setIsAnalyzing(false);
            }}>
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {!uploadedImage && !isAnalyzing && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-4">Take a photo of your fridge or upload an image</p>
                <label className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer inline-block">
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  📷 Take Photo / Upload
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">or add manually</span>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={newIngredient.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewIngredient(prev => ({...prev, name: value}));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={newIngredient.quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewIngredient(prev => ({...prev, quantity: value}));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <select
                    value={newIngredient.unit}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewIngredient(prev => ({...prev, unit: value}));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>
                <select
                  value={newIngredient.category}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewIngredient(prev => ({...prev, category: value}));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="vegetables">Vegetables</option>
                  <option value="protein">Protein</option>
                  <option value="dairy">Dairy</option>
                  <option value="grains">Grains</option>
                </select>
                <button
                  onClick={addIngredient}
                  className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium"
                >
                  Add to Inventory
                </button>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600 font-medium">🤖 AI is analyzing your fridge...</p>
              <p className="text-xs text-gray-500 mt-2">Detecting ingredients and quantities</p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        {inventory.map(item => (
          <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{item.name}</h3>
                  {item.low && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Low</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{item.quantity}{item.unit}</p>
                <p className="text-xs text-gray-400 mt-1">Expires: {item.expires}</p>
              </div>
              <button
                onClick={() => removeIngredient(item.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RecipesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Recipes</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAISuggestions(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <span className="text-base">🤖</span>
            AI Suggest
          </button>
          <button
            onClick={() => {
              setEditingRecipe({
                name: '',
                calories: 0,
                protein: 0,
                prepTime: 0,
                ingredients: [],
                mealType: 'dinner',
                nutrition: { carbs: 0, fat: 0 },
                isVeg: !isNonVegDay
              });
              setShowRecipeEditor(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Recipe
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-900 font-medium mb-1">
          <strong>{currentDay}</strong> • {dietType} recipes
        </p>
        <p className="text-xs text-purple-700">
          💡 Try AI suggestions for personalized recipes based on your fridge and health goals!
        </p>
      </div>

      <div className="space-y-3">
        {todaysRecipes.map(recipe => {
          const assignedMeals = Object.entries(plannedMeals)
            .filter(([key, meal]) => key.startsWith(currentDay) && meal.id === recipe.id)
            .map(([key]) => key.split('-')[1]);
          
          return (
            <div 
              key={recipe.id} 
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1" onClick={() => setSelectedMeal(recipe)}>
                  <h3 className="font-semibold cursor-pointer">{recipe.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mr-2">
                      {recipe.mealType}
                    </span>
                    {recipe.prepTime} min prep
                  </p>
                  {assignedMeals.length > 0 && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      ✓ Assigned to: {assignedMeals.join(', ')}
                    </p>
                  )}
                </div>
                {recipe.isCustom && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingRecipe(recipe);
                        setShowRecipeEditor(true);
                      }}
                      className="text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCustomRecipe(recipe.id)}
                      className="text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                <span>🔥 {recipe.calories} cal</span>
                <span>💪 {recipe.protein}g protein</span>
                <span>🍚 {recipe.nutrition.carbs}g carbs</span>
              </div>
              <div className="space-y-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      assignRecipeToMeal(e.target.value, recipe);
                      e.target.value = ''; // Reset dropdown
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-blue-50 text-blue-700 font-medium"
                  defaultValue=""
                >
                  <option value="">📅 Assign to Meal Time...</option>
                  <option value="breakfast">Breakfast (9:00 AM)</option>
                  <option value="lunch">Lunch (12:30 PM)</option>
                  <option value="snack">Snack (4:00 PM)</option>
                  <option value="dinner">Dinner (8:00 PM)</option>
                </select>
                <p className="text-xs text-gray-500 text-center">
                  💡 Inventory auto-adjusts when meal time passes
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedMeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedMeal.name}</h3>
              <button onClick={() => setSelectedMeal(null)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-red-50 rounded p-2">
                  <p className="font-semibold text-red-700">{selectedMeal.calories}</p>
                  <p className="text-xs text-gray-600">Calories</p>
                </div>
                <div className="bg-blue-50 rounded p-2">
                  <p className="font-semibold text-blue-700">{selectedMeal.protein}g</p>
                  <p className="text-xs text-gray-600">Protein</p>
                </div>
                <div className="bg-green-50 rounded p-2">
                  <p className="font-semibold text-green-700">{selectedMeal.prepTime} min</p>
                  <p className="text-xs text-gray-600">Prep Time</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ingredients Needed:</h4>
                <ul className="space-y-1">
                  {selectedMeal.ingredients.map((ing, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {ing.name} - {ing.amount}{ing.unit}
                    </li>
                  ))}
                </ul>
              </div>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    assignRecipeToMeal(e.target.value, selectedMeal);
                    setSelectedMeal(null);
                  }
                }}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-blue-50 text-blue-700 font-medium"
                defaultValue=""
              >
                <option value="">📅 Assign to Meal Time...</option>
                <option value="breakfast">Breakfast (9:00 AM)</option>
                <option value="lunch">Lunch (12:30 PM)</option>
                <option value="snack">Snack (4:00 PM)</option>
                <option value="dinner">Dinner (8:00 PM)</option>
              </select>
              <p className="text-xs text-gray-500 text-center">
                💡 Inventory will auto-adjust when meal time passes
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const RecipeEditor = () => {
    const [recipe, setRecipe] = useState(editingRecipe || {
      name: '',
      calories: 0,
      protein: 0,
      prepTime: 0,
      ingredients: [],
      mealType: 'dinner',
      nutrition: { carbs: 0, fat: 0 },
      isVeg: !isNonVegDay
    });

    const [newIngredient, setNewIngredient] = useState({ name: '', amount: 0, unit: 'g' });

    const addIngredientToRecipe = () => {
      if (newIngredient.name && newIngredient.amount) {
        setRecipe({
          ...recipe,
          ingredients: [...recipe.ingredients, newIngredient]
        });
        setNewIngredient({ name: '', amount: 0, unit: 'g' });
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-lg p-6 max-w-md w-full my-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{recipe.id ? 'Edit Recipe' : 'Create Recipe'}</h3>
            <button onClick={() => setShowRecipeEditor(false)}>
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Name *</label>
              <input
                type="text"
                placeholder="e.g., Grilled Chicken Salad"
                value={recipe.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setRecipe(prev => ({...prev, name: value}));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calories *</label>
                <input
                  type="number"
                  placeholder="450"
                  value={recipe.calories || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setRecipe(prev => ({...prev, calories: value}));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g) *</label>
                <input
                  type="number"
                  placeholder="35"
                  value={recipe.protein || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setRecipe(prev => ({...prev, protein: value}));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min) *</label>
                <input
                  type="number"
                  placeholder="25"
                  value={recipe.prepTime || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setRecipe(prev => ({...prev, prepTime: value}));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type *</label>
                <select
                  value={recipe.mealType}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRecipe(prev => ({...prev, mealType: value}));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  placeholder="40"
                  value={recipe.nutrition.carbs || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setRecipe(prev => ({...prev, nutrition: {...prev.nutrition, carbs: value}}));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fats (g)</label>
                <input
                  type="number"
                  placeholder="40"
                  value={recipe.nutrition.fat || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setRecipe(prev => ({...prev, nutrition: {...prev.nutrition, fat: value}}));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recipe.isVeg}
                  onChange={(e) => {
                    const value = e.target.checked;
                    setRecipe(prev => ({...prev, isVeg: value}));
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">🥬 This is a Vegetarian Recipe</span>
              </label>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 text-gray-800">Ingredients:</h4>
              
              {recipe.ingredients.length > 0 && (
                <div className="space-y-2 mb-3 bg-gray-50 rounded-lg p-3">
                  {recipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                      <span className="text-sm font-medium text-gray-700">
                        {ing.name} - {ing.amount}{ing.unit}
                      </span>
                      <button
                        onClick={() => setRecipe({...recipe, ingredients: recipe.ingredients.filter((_, i) => i !== idx)})}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 bg-blue-50 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-800">Add Ingredient:</p>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ingredient Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Chicken Breast, Spinach"
                    value={newIngredient.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewIngredient(prev => ({...prev, name: value}));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      placeholder="200"
                      value={newIngredient.amount || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setNewIngredient(prev => ({...prev, amount: value}));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      value={newIngredient.unit}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewIngredient(prev => ({...prev, unit: value}));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="l">l</option>
                      <option value="pieces">pcs</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={addIngredientToRecipe}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  + Add Ingredient to Recipe
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <button
                onClick={() => saveCustomRecipe(recipe)}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
              >
                <Save className="w-5 h-5" />
                Save Recipe
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const WeekPlanner = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner'];

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">📅 Weekly Meal Planner</h3>
            <button onClick={() => setShowWeekPlanner(false)}>
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            {days.map(day => {
              const dayIndex = dayNames.indexOf(day);
              const isDayNonVeg = [0, 1, 3, 5].includes(dayIndex);
              
              return (
                <div key={day} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{day}</h4>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {isDayNonVeg && getCurrentUserProfile().dietaryPreference === 'omnivore' ? '🍗 Non-Veg' : '🥬 Veg'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {mealTypes.map(mealType => {
                      const plannedMeal = weeklyMealPlan[`${day}-${mealType}`];
                      
                      // Get recipes based on user's dietary preference
                      const profile = getCurrentUserProfile();
                      const dietPref = profile.dietaryPreference || 'omnivore';
                      let availableRecipes;
                      
                      if (dietPref === 'omnivore') {
                        // Original behavior for omnivores
                        availableRecipes = isDayNonVeg 
                          ? [...defaultRecipes.nonVeg, ...customRecipes.filter(r => !r.isVeg)]
                          : [...defaultRecipes.veg, ...customRecipes.filter(r => r.isVeg)];
                      } else if (dietPref === 'vegetarian' || dietPref === 'eggetarian') {
                        // Always veg for vegetarian/eggetarian
                        availableRecipes = [...defaultRecipes.veg, ...customRecipes.filter(r => r.isVeg)];
                      } else if (dietPref === 'vegan') {
                        // Veg without dairy/eggs for vegan
                        const vegRecipes = [...defaultRecipes.veg, ...customRecipes.filter(r => r.isVeg)];
                        availableRecipes = vegRecipes.filter(r => 
                          !r.name.toLowerCase().includes('paneer') &&
                          !r.name.toLowerCase().includes('yogurt') &&
                          !r.name.toLowerCase().includes('cheese') &&
                          !r.name.toLowerCase().includes('egg')
                        );
                      } else if (dietPref === 'pescatarian') {
                        // Veg + fish
                        const vegRecipes = [...defaultRecipes.veg, ...customRecipes.filter(r => r.isVeg)];
                        if (isDayNonVeg) {
                          const fishRecipes = defaultRecipes.nonVeg.filter(r => 
                            r.name.toLowerCase().includes('fish') || 
                            r.name.toLowerCase().includes('prawn') ||
                            r.name.toLowerCase().includes('shrimp')
                          );
                          availableRecipes = [...vegRecipes, ...fishRecipes];
                        } else {
                          availableRecipes = vegRecipes;
                        }
                      } else {
                        // Default: veg
                        availableRecipes = [...defaultRecipes.veg, ...customRecipes.filter(r => r.isVeg)];
                      }
                      
                      return (
                        <div key={mealType}>
                          <label className="text-xs text-gray-600 capitalize mb-1 block">{mealType}</label>
                          <select
                            value={plannedMeal?.id || ''}
                            onChange={(e) => {
                              const recipe = allRecipes.find(r => r.id === e.target.value);
                              planMealForDay(day, mealType, recipe);
                            }}
                            className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Select meal</option>
                            {availableRecipes
                              .filter(r => r.mealType === mealType)
                              .map(recipe => (
                                <option key={recipe.id} value={recipe.id}>
                                  {recipe.name}
                                </option>
                              ))}
                          </select>
                          {plannedMeal && (
                            <p className="text-xs text-gray-500 mt-1">
                              {plannedMeal.calories} cal, {plannedMeal.protein}g protein
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              alert('✅ Weekly meal plan saved!');
              setShowWeekPlanner(false);
            }}
            className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-medium"
          >
            Save Week Plan
          </button>
        </div>
      </div>
    );
  };

  const ProfileSettings = () => {
    if (!editingProfile) return null;
    
    const currentBMI = calculateBMI(editingProfile.weight, editingProfile.height);
    const currentBMR = calculateBMR(editingProfile);
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-lg p-6 max-w-md w-full my-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">⚙️ Edit Profile - {editingProfile.name}</h3>
            <button onClick={() => {
              setShowProfileSettings(false);
              setEditingProfile(null);
            }}>
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Current BMI</p>
                  <p className="font-bold text-blue-900">{currentBMI}</p>
                </div>
                <div>
                  <p className="text-gray-600">BMR</p>
                  <p className="font-bold text-blue-900">{Math.round(currentBMR)} cal</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
                <input
                  type="number"
                  value={editingProfile.age}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setEditingProfile(prev => ({...prev, age: value}));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                  max="120"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={editingProfile.gender}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditingProfile(prev => ({...prev, gender: value}));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={editingProfile.height}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setEditingProfile(prev => ({...prev, height: value}));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="50"
                  max="250"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={editingProfile.weight}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setEditingProfile(prev => ({...prev, weight: value}));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="10"
                  max="300"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Health Goal</label>
              <select
                value={editingProfile.goal}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditingProfile(prev => ({...prev, goal: value}));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="weight_gain">Weight Gain</option>
                <option value="maintenance">Maintenance</option>
                <option value="growth">Growth (for children)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">🥗 Dietary Preference</label>
              <select
                value={editingProfile.dietaryPreference || 'omnivore'}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditingProfile(prev => ({...prev, dietaryPreference: value}));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="omnivore">🍖 Omnivore (Eats everything)</option>
                <option value="vegetarian">🥬 Vegetarian (No meat/fish)</option>
                <option value="eggetarian">🥚 Eggetarian (Veg + Eggs)</option>
                <option value="vegan">🌱 Vegan (No animal products)</option>
                <option value="pescatarian">🐟 Pescatarian (Veg + Fish)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {editingProfile.dietaryPreference === 'vegetarian' && 'Will only show vegetarian recipes'}
                {editingProfile.dietaryPreference === 'eggetarian' && 'Will show vegetarian recipes + eggs'}
                {editingProfile.dietaryPreference === 'vegan' && 'Will only show plant-based recipes'}
                {editingProfile.dietaryPreference === 'pescatarian' && 'Will show vegetarian + fish/seafood'}
                {(!editingProfile.dietaryPreference || editingProfile.dietaryPreference === 'omnivore') && 'Will show all recipes'}
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-800 mb-1">📊 Auto-calculated calorie target:</p>
              <p className="text-sm font-semibold text-green-900">
                {Math.round(calculateBMR(editingProfile) * 1.2 * (editingProfile.goal === 'weight_loss' ? 0.8 : editingProfile.goal === 'weight_gain' ? 1.2 : editingProfile.goal === 'growth' ? 1.5 : 1))} calories/day
              </p>
              <p className="text-xs text-green-700 mt-1">
                {editingProfile.goal === 'weight_loss' && '20% deficit for weight loss'}
                {editingProfile.goal === 'weight_gain' && '20% surplus for weight gain'}
                {editingProfile.goal === 'maintenance' && 'Maintenance calories'}
                {editingProfile.goal === 'growth' && 'Increased for healthy growth'}
              </p>
            </div>
            
            <button
              onClick={handleProfileUpdate}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Profile
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PinSettings = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">🔒 Change PIN</h3>
          <button onClick={() => {
            setShowPinSettings(false);
            setNewPin('');
            setConfirmPin('');
          }}>
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              ⚠️ Current PIN: <strong>{appPin}</strong> (Default is 1234)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New PIN (4 digits)</label>
            <input
              type="password"
              maxLength="4"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono"
              placeholder="****"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm PIN</label>
            <input
              type="password"
              maxLength="4"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono"
              placeholder="****"
            />
          </div>
          
          <button
            onClick={handlePinChange}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
          >
            Change PIN
          </button>
        </div>
      </div>
    </div>
  );

  const PinEntryScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Family Meal Planner</h1>
          <p className="text-gray-600">Enter your PIN to access the app</p>
        </div>
        
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="4"
              value={pinInput}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setPinInput(value);
                setPinError('');
              }}
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-center text-3xl font-mono tracking-widest focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              placeholder="••••"
              autoFocus
              autoComplete="off"
            />
          </div>
          
          {pinError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 text-center">❌ {pinError}</p>
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            🔓 Unlock
          </button>
          
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <p className="text-xs text-gray-600 text-center">
              💡 <strong>First time?</strong> Default PIN is <code className="bg-gray-200 px-2 py-1 rounded font-bold">1234</code>
            </p>
            <p className="text-xs text-gray-500 text-center mt-2">
              Change your PIN after logging in from Settings
            </p>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">🔒 Secured with PIN Authentication</p>
        </div>
      </div>
    </div>
  );

  const ScheduleTab = () => {
    const profile = getCurrentUserProfile();
    const targetCalories = profile.targetCalories;
    const bmi = calculateBMI(profile.weight, profile.height);
    const bmr = calculateBMR(profile);
    
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Today's Schedule - {currentDay}</h2>
        
        {dayOfWeek === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 font-medium">
              🏠 Sunday Schedule - No yoga class or school today. Enjoy family time!
            </p>
          </div>
        )}
        
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">
              {profile.name}'s Daily Target
            </span>
            <TrendingDown className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">{targetCalories} calories</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-purple-700">
            <span>BMI: {bmi}</span>
            <span>BMR: {Math.round(bmr)} cal</span>
            <span>Goal: {profile.goal.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="space-y-3">
          {mealSchedule.map((meal, idx) => {
            const mealKey = `${currentDay}-${meal.type}`;
            const assignedRecipe = plannedMeals[mealKey];
            const status = meal.type ? getMealStatus(meal.type) : meal.status;
            
            return (
              <div 
                key={idx} 
                className={`rounded-lg p-4 ${
                  meal.type === 'cutoff' 
                    ? 'bg-red-50 border-2 border-red-300' 
                    : meal.type === 'activity'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className={`font-semibold ${meal.type === 'cutoff' ? 'text-red-700' : meal.type === 'activity' ? 'text-green-700' : ''}`}>
                      {meal.type === 'cutoff' && '🚫 '}
                      {meal.type === 'activity' && '🧘 '}
                      {meal.meal}
                    </h3>
                    <p className="text-sm text-gray-600">{meal.time}</p>
                    {assignedRecipe && (
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        📋 {assignedRecipe.name}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {meal.calories && (
                      <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                        {meal.calories} cal
                      </span>
                    )}
                    {status && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        status === 'completed' || status === 'auto-completed' ? 'bg-green-100 text-green-700' :
                        status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {status === 'auto-completed' ? '✓ Auto-completed' :
                         status === 'completed' ? '✓ Completed' :
                         status === 'upcoming' ? 'Coming up' : 'Pending'}
                      </span>
                    )}
                  </div>
                </div>
                {meal.note && (
                  <p className="text-xs text-gray-500 mt-2">💡 {meal.note}</p>
                )}
                {meal.type === 'cutoff' && (
                  <p className="text-xs text-red-600 font-medium mt-2">
                    ⚠️ No eating after this time - helps with weight loss goals
                  </p>
                )}
                {!assignedRecipe && (meal.type === 'breakfast' || meal.type === 'lunch' || meal.type === 'dinner' || meal.type === 'snack') && (
                  <p className="text-xs text-orange-600 mt-2">
                    ⚠️ No meal assigned - Go to Recipes tab to assign
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Nutrition Breakdown for {profile.name}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Protein</span>
              <span className="font-medium">{Math.round(targetCalories * 0.35 / 4)}g (35%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Carbs</span>
              <span className="font-medium">{Math.round(targetCalories * 0.38 / 4)}g (38%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Fats</span>
              <span className="font-medium">{Math.round(targetCalories * 0.27 / 9)}g (27%)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AISuggestionsModal = () => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">🤖 AI Recipe Suggestions</h3>
            <button onClick={() => setShowAISuggestions(false)}>
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {isGeneratingAI ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Generating personalized recipes...</p>
              <p className="text-sm text-gray-500 mt-2">Based on your ingredients and health goals</p>
            </div>
          ) : aiError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-800 font-medium mb-2">⚠️ {aiError}</p>
              <button
                onClick={generateAIRecipeSuggestions}
                className="bg-red-600 text-white px-4 py-2 rounded-lg mt-3"
              >
                Try Again
              </button>
            </div>
          ) : aiSuggestions.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  💡 These recipes are tailored to your dietary preferences, health goals, and available ingredients!
                </p>
              </div>

              {aiSuggestions.map((recipe) => (
                <div key={recipe.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">{recipe.name}</h4>
                      {recipe.description && (
                        <p className="text-sm text-gray-600 mt-1">{recipe.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      recipe.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {recipe.isVeg ? '🥬 Veg' : '🍖 Non-Veg'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-gray-50 rounded p-2 text-center">
                      <p className="text-xs text-gray-600">Calories</p>
                      <p className="text-sm font-semibold text-gray-800">{recipe.calories}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-2 text-center">
                      <p className="text-xs text-gray-600">Protein</p>
                      <p className="text-sm font-semibold text-gray-800">{recipe.protein}g</p>
                    </div>
                    <div className="bg-gray-50 rounded p-2 text-center">
                      <p className="text-xs text-gray-600">Prep Time</p>
                      <p className="text-sm font-semibold text-gray-800">{recipe.prepTime}m</p>
                    </div>
                  </div>

                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Ingredients:</p>
                      <p className="text-sm text-gray-600">{recipe.ingredients.map(i => i.name).join(', ')}</p>
                    </div>
                  )}

                  <button
                    onClick={() => addAIRecipeToCollection(recipe)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add to My Recipes
                  </button>
                </div>
              ))}

              <button
                onClick={generateAIRecipeSuggestions}
                className="w-full bg-purple-100 text-purple-700 py-3 rounded-lg font-medium hover:bg-purple-200 transition-colors"
              >
                🔄 Generate New Suggestions
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Click below to generate recipe suggestions</p>
              <button
                onClick={generateAIRecipeSuggestions}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold"
              >
                🤖 Generate Suggestions
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ShoppingListModal = () => {
    const items = getShoppingList();
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">🛒 Shopping List</h3>
            <button onClick={() => setShowShoppingList(false)}>
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800 font-medium">
                {items.length} low stock items need replenishment
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">Items to Order:</h4>
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity}{item.unit}</p>
                  </div>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                    Low Stock
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Order from:</h4>
              <div className="space-y-2">
                <button
                  onClick={openSwiggyInstamart}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Open in Swiggy Instamart
                </button>
                <button
                  onClick={openBlinkit}
                  className="w-full bg-yellow-500 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-yellow-600 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Open in Blinkit
                </button>
                <button
                  onClick={openZepto}
                  className="w-full bg-purple-500 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-purple-600 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Open in Zepto
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Or share list:</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={shareViaWhatsApp}
                  className="bg-green-500 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                >
                  📱 WhatsApp
                </button>
                <button
                  onClick={copyShoppingList}
                  className="bg-gray-600 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
                >
                  📋 Copy List
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              💡 Tip: The app will try to open the platform with your items pre-searched
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {!isAuthenticated ? (
        <PinEntryScreen />
      ) : (
        <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20">
          <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold text-gray-800">Family Meal Planner</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPinSettings(true)}
                  className="text-gray-600 hover:text-blue-600 p-2"
                  title="Change PIN"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
                <select 
                  value={currentUser}
                  onChange={(e) => setCurrentUser(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
                >
                  <option value="me">Me (Nikhel)</option>
                  <option value="kiran">Kiran</option>
                  <option value="child">Child</option>
                  <option value="help">House Help</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-gray-600">{currentDay}, Feb 8, 2026</p>
          </div>

          <div className="p-4">
            <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
              <HomeDashboard />
            </div>
            <div style={{ display: activeTab === 'inventory' ? 'block' : 'none' }}>
              <InventoryTab />
            </div>
            <div style={{ display: activeTab === 'recipes' ? 'block' : 'none' }}>
              <RecipesTab />
            </div>
            <div style={{ display: activeTab === 'schedule' ? 'block' : 'none' }}>
              <ScheduleTab />
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-md mx-auto flex justify-around py-3">
              <button 
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center gap-1 px-4 ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <Calendar className="w-6 h-6" />
                <span className="text-xs">Home</span>
              </button>
              {currentUser !== 'help' && (
                <button 
                  onClick={() => setActiveTab('inventory')}
                  className={`flex flex-col items-center gap-1 px-4 relative ${activeTab === 'inventory' ? 'text-blue-600' : 'text-gray-400'}`}
                >
                  <ShoppingCart className="w-6 h-6" />
                  {lowStockCount > 0 && (
                    <span className="absolute top-0 right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {lowStockCount}
                    </span>
                  )}
                  <span className="text-xs">Inventory</span>
                </button>
              )}
              {currentUser !== 'help' && (
                <button 
                  onClick={() => setActiveTab('recipes')}
                  className={`flex flex-col items-center gap-1 px-4 ${activeTab === 'recipes' ? 'text-blue-600' : 'text-gray-400'}`}
                >
                  <Utensils className="w-6 h-6" />
                  <span className="text-xs">Recipes</span>
                </button>
              )}
              <button 
                onClick={() => setActiveTab('schedule')}
                className={`flex flex-col items-center gap-1 px-4 ${activeTab === 'schedule' ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <Clock className="w-6 h-6" />
                <span className="text-xs">Schedule</span>
              </button>
            </div>
          </div>

          {showShoppingList && <ShoppingListModal />}
          {showRecipeEditor && <RecipeEditor />}
          {showWeekPlanner && <WeekPlanner />}
          {showAISuggestions && <AISuggestionsModal />}
          {showPinSettings && <PinSettings />}
          {showProfileSettings && <ProfileSettings />}
        </div>
      )}
    </>
  );
}

// Render the app when script loads
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MealPlannerApp />);
