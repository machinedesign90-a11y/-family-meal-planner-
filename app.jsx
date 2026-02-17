// Family Meal Planner - Clean Version with Backend Integration
// Built with React, Supabase, and Gemini AI

const { useState, useEffect } = React;

// Import will be done via script tag in index.html
// Expected: supabase, authHelpers, api from supabase-client.js

function MealPlannerApp() {
  // ============= AUTHENTICATION STATE =============
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ============= APP STATE =============
  const [activeTab, setActiveTab] = useState('home');
  const [inventory, setInventory] = useState([]);
  const [customRecipes, setCustomRecipes] = useState([]);
  
  // ============= UI STATE =============
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);

  // ============= INITIALIZATION =============
  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      // Check authentication
      const currentUser = await window.authHelpers.getUser();
      if (!currentUser) {
        window.location.href = '/login.html';
        return;
      }
      
      setUser(currentUser);
      
      // Load user data from backend
      await loadUserData();
      
      setAuthLoading(false);
    } catch (error) {
      console.error('Initialization error:', error);
      window.location.href = '/login.html';
    }
  }

  async function loadUserData() {
    try {
      // Load profile
      const { profile: userProfile } = await window.api.getProfile();
      setProfile(userProfile);

      // Load inventory
      const { items } = await window.api.getInventory();
      setInventory(items || []);

      // Load custom recipes
      const { recipes } = await window.api.getRecipes();
      setCustomRecipes(recipes || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  // ============= LOGOUT =============
  async function handleLogout() {
    await window.authHelpers.signOut();
    window.location.href = '/login.html';
  }

  // ============= PROFILE MANAGEMENT =============
  async function handleSaveProfile() {
    try {
      const { profile: updated } = await window.api.updateProfile(editingProfile);
      setProfile(updated);
      setEditingProfile(null);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    }
  }

  // ============= INVENTORY MANAGEMENT =============
  async function addInventoryItem(item) {
    try {
      const { item: newItem } = await window.api.addInventoryItem(item);
      setInventory([...inventory, newItem]);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    }
  }

  async function deleteInventoryItem(id) {
    try {
      await window.api.deleteInventoryItem(id);
      setInventory(inventory.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  // ============= RECIPE MANAGEMENT =============
  async function addCustomRecipe(recipe) {
    try {
      const { recipe: newRecipe } = await window.api.createRecipe(recipe);
      setCustomRecipes([...customRecipes, newRecipe]);
      alert('Recipe added to your collection!');
    } catch (error) {
      console.error('Error adding recipe:', error);
      alert('Failed to add recipe');
    }
  }

  async function deleteCustomRecipe(id) {
    try {
      await window.api.deleteRecipe(id);
      setCustomRecipes(customRecipes.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  }

  // ============= AI RECIPE GENERATION =============
  async function generateAIRecipes() {
    setIsGeneratingAI(true);
    setAiError(null);
    
    try {
     // const result = await window.api.generateRecipes(profile, inventory);
      const result = await window.api.generateRecipes(null, inventory);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate recipes');
      }
      
      setAiSuggestions(result.recipes);
      setShowAISuggestions(true);
      
    } catch (error) {
      console.error('AI Generation Error:', error);
      setAiError(error.message || 'Failed to generate suggestions. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  }

  // ============= DEFAULT RECIPES =============
  const defaultRecipes = {
    veg: [
      {
        id: 'default-1',
        name: 'Palak Paneer',
        calories: 380,
        protein: 28,
        prepTime: 25,
        mealType: 'lunch',
        isVeg: true,
        cuisine: 'Indian',
        description: 'Classic spinach and cottage cheese curry'
      },
      {
        id: 'default-2',
        name: 'Dal Tadka',
        calories: 320,
        protein: 22,
        prepTime: 30,
        mealType: 'dinner',
        isVeg: true,
        cuisine: 'Indian',
        description: 'Lentil curry with tempering'
      },
      {
        id: 'default-3',
        name: 'Vegetable Biryani',
        calories: 450,
        protein: 18,
        prepTime: 45,
        mealType: 'lunch',
        isVeg: true,
        cuisine: 'Indian',
        description: 'Fragrant rice with mixed vegetables'
      }
    ],
    nonVeg: [
      {
        id: 'default-4',
        name: 'Butter Chicken',
        calories: 520,
        protein: 42,
        prepTime: 40,
        mealType: 'dinner',
        isVeg: false,
        cuisine: 'Indian',
        description: 'Creamy tomato-based chicken curry'
      },
      {
        id: 'default-5',
        name: 'Grilled Chicken Salad',
        calories: 380,
        protein: 45,
        prepTime: 20,
        mealType: 'lunch',
        isVeg: false,
        cuisine: 'Continental',
        description: 'High-protein healthy salad'
      }
    ]
  };

  // ============= HELPER FUNCTIONS =============
  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const calculateBMR = (profile) => {
    if (profile.gender === 'male') {
      return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    } else {
      return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
    }
  };

  const getFilteredRecipes = () => {
    if (!profile) return [];
    
    const dietPref = profile.dietary_preference || 'omnivore';
    const dayOfWeek = new Date().getDay();
    const isNonVegDay = [0, 1, 3, 5].includes(dayOfWeek); // Sun, Mon, Wed, Fri
    
    let recipes = [];
    
    if (dietPref === 'omnivore') {
      // Day-based filtering for omnivores
      recipes = isNonVegDay 
        ? [...defaultRecipes.nonVeg, ...customRecipes.filter(r => !r.is_veg)]
        : [...defaultRecipes.veg, ...customRecipes.filter(r => r.is_veg)];
    } else if (dietPref === 'vegetarian' || dietPref === 'eggetarian') {
      // Always veg
      recipes = [...defaultRecipes.veg, ...customRecipes.filter(r => r.is_veg)];
    } else if (dietPref === 'vegan') {
      // Veg without dairy
      const vegRecipes = [...defaultRecipes.veg, ...customRecipes.filter(r => r.is_veg)];
      recipes = vegRecipes.filter(r => 
        !r.name.toLowerCase().includes('paneer') &&
        !r.name.toLowerCase().includes('cheese') &&
        !r.name.toLowerCase().includes('yogurt')
      );
    } else if (dietPref === 'pescatarian') {
      // Veg + fish
      recipes = [...defaultRecipes.veg, ...customRecipes.filter(r => r.is_veg)];
      if (isNonVegDay) {
        const fishRecipes = defaultRecipes.nonVeg.filter(r => 
          r.name.toLowerCase().includes('fish') || 
          r.name.toLowerCase().includes('prawn')
        );
        recipes = [...recipes, ...fishRecipes];
      }
    } else {
      recipes = [...defaultRecipes.veg, ...customRecipes.filter(r => r.is_veg)];
    }
    
    return recipes;
  };

  const getDietTypeLabel = () => {
    if (!profile) return 'Loading...';
    
    const dietPref = profile.dietary_preference || 'omnivore';
    const dayOfWeek = new Date().getDay();
    const isNonVegDay = [0, 1, 3, 5].includes(dayOfWeek);
    
    if (dietPref === 'vegetarian') return '🥬 Vegetarian';
    if (dietPref === 'eggetarian') return '🥚 Eggetarian';
    if (dietPref === 'vegan') return '🌱 Vegan';
    if (dietPref === 'pescatarian') return isNonVegDay ? '🐟 Pescatarian' : '🥬 Vegetarian';
    if (dietPref === 'omnivore') return isNonVegDay ? '🍗 Non-Vegetarian' : '🥬 Vegetarian';
    
    return 'Mixed Diet';
  };

  // ============= LOADING STATE =============
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your meal planner...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading profile</p>
          <button onClick={handleLogout} className="mt-4 text-blue-600">Logout</button>
        </div>
      </div>
    );
  }

  // ============= RENDER COMPONENTS =============
  
  const todayRecipes = getFilteredRecipes();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🍽️ Meal Planner</h1>
            <p className="text-sm text-blue-100">Welcome, {profile.name}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto">
        {/* Tabs Content - Using display: none to preserve component state */}
        <div className="p-4">
          {/* Home Tab */}
          <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow">
                <h2 className="text-lg font-bold mb-2">📊 Your Stats</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded p-3">
                    <p className="text-xs text-gray-600">BMI</p>
                    <p className="text-xl font-bold text-blue-600">
                      {calculateBMI(profile.weight, profile.height)}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded p-3">
                    <p className="text-xs text-gray-600">Target Calories</p>
                    <p className="text-xl font-bold text-purple-600">{profile.target_calories}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow">
                <h2 className="text-lg font-bold mb-2">🍽️ Today's Menu</h2>
                <p className="text-sm text-gray-600 mb-3">{getDietTypeLabel()}</p>
                <div className="space-y-2">
                  {todayRecipes.slice(0, 3).map(recipe => (
                    <div key={recipe.id} className="border-l-4 border-blue-500 pl-3 py-2">
                      <p className="font-medium">{recipe.name}</p>
                      <p className="text-xs text-gray-500">
                        {recipe.calories} cal • {recipe.protein}g protein
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white shadow-lg">
                <h3 className="font-bold mb-2">🤖 Try AI Recipe Suggestions!</h3>
                <p className="text-sm text-blue-100 mb-3">
                  Get personalized recipes based on your fridge and health goals
                </p>
                <button
                  onClick={() => {
                    generateAIRecipes();
                  }}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium w-full hover:bg-blue-50 transition-colors"
                >
                  Generate Recipes
                </button>
              </div>
            </div>
          </div>

          {/* Inventory Tab */}
          <div style={{ display: activeTab === 'inventory' ? 'block' : 'none' }}>
            <InventoryTab 
              inventory={inventory}
              onAdd={addInventoryItem}
              onDelete={deleteInventoryItem}
            />
          </div>

          {/* Recipes Tab */}
          <div style={{ display: activeTab === 'recipes' ? 'block' : 'none' }}>
            <RecipesTab 
              recipes={todayRecipes}
              dietType={getDietTypeLabel()}
              onGenerateAI={() => {
                generateAIRecipes();
              }}
              onAddRecipe={addCustomRecipe}
            />
          </div>

          {/* Settings Tab */}
          <div style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
            <SettingsTab 
              profile={profile}
              editingProfile={editingProfile}
              setEditingProfile={setEditingProfile}
              onSave={handleSaveProfile}
              calculateBMR={calculateBMR}
            />
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-md mx-auto flex justify-around py-3">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1 px-4 ${
                activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <span className="text-2xl">🏠</span>
              <span className="text-xs">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex flex-col items-center gap-1 px-4 ${
                activeTab === 'inventory' ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <span className="text-2xl">🧊</span>
              <span className="text-xs">Fridge</span>
            </button>

            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex flex-col items-center gap-1 px-4 ${
                activeTab === 'recipes' ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <span className="text-2xl">📖</span>
              <span className="text-xs">Recipes</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center gap-1 px-4 ${
                activeTab === 'settings' ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <span className="text-2xl">⚙️</span>
              <span className="text-xs">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Suggestions Modal */}
      {showAISuggestions && (
        <AISuggestionsModal
          isGenerating={isGeneratingAI}
          suggestions={aiSuggestions}
          error={aiError}
          onClose={() => setShowAISuggestions(false)}
          onAddRecipe={addCustomRecipe}
          onRegenerate={generateAIRecipes}
        />
      )}
    </div>
  );
}

// ============= INVENTORY TAB COMPONENT =============
function InventoryTab({ inventory, onAdd, onDelete }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: 'g', category: 'vegetables' });

  function handleAdd() {
    if (!newItem.name || !newItem.quantity) {
      alert('Please fill in all fields');
      return;
    }

    onAdd({
      name: newItem.name,
      quantity: parseFloat(newItem.quantity),
      unit: newItem.unit,
      category: newItem.category,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_low: false
    });

    setNewItem({ name: '', quantity: '', unit: 'g', category: 'vegetables' });
    setShowAddForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">🧊 Your Fridge</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          {showAddForm ? '✕ Cancel' : '+ Add Item'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg p-4 shadow space-y-3">
          <input
            type="text"
            placeholder="Item name (e.g., Tomatoes)"
            value={newItem.name}
            onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
              className="px-3 py-2 border rounded-lg"
            />
            <select
              value={newItem.unit}
              onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="g">grams</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="l">liters</option>
              <option value="pieces">pieces</option>
            </select>
          </div>
          <select
            value={newItem.category}
            onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="vegetables">Vegetables</option>
            <option value="protein">Protein</option>
            <option value="dairy">Dairy</option>
            <option value="grains">Grains</option>
            <option value="spices">Spices</option>
            <option value="other">Other</option>
          </select>
          <button
            onClick={handleAdd}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium"
          >
            Add to Fridge
          </button>
        </div>
      )}

      <div className="space-y-2">
        {inventory.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            <p>Your fridge is empty!</p>
            <p className="text-sm mt-1">Add items to get started</p>
          </div>
        ) : (
          inventory.map(item => (
            <div key={item.id} className="bg-white rounded-lg p-4 shadow flex items-center justify-between">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity}{item.unit} • {item.category}
                </p>
              </div>
              <button
                onClick={() => onDelete(item.id)}
                className="text-red-600 hover:bg-red-50 p-2 rounded"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============= RECIPES TAB COMPONENT =============
function RecipesTab({ recipes, dietType, onGenerateAI, onAddRecipe }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">📖 Recipes</h2>
        <button
          onClick={onGenerateAI}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          🤖 AI Suggest
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-900 font-medium">{dietType}</p>
        <p className="text-xs text-blue-700 mt-1">
          💡 Try AI suggestions for personalized recipes!
        </p>
      </div>

      <div className="space-y-3">
        {recipes.map(recipe => (
          <div key={recipe.id} className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold">{recipe.name}</h3>
                <p className="text-xs text-gray-500">{recipe.cuisine}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                recipe.isVeg || recipe.is_veg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {recipe.isVeg || recipe.is_veg ? '🥬 Veg' : '🍖 Non-Veg'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
            <div className="flex gap-4 text-xs text-gray-600">
              <span>🔥 {recipe.calories} cal</span>
              <span>💪 {recipe.protein}g protein</span>
              <span>⏱️ {recipe.prepTime}m</span>
            </div>
          </div>
        ))}
        {recipes.length === 0 && (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            <p>No recipes available</p>
            <p className="text-sm mt-1">Try generating AI suggestions!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============= SETTINGS TAB COMPONENT =============
function SettingsTab({ profile, editingProfile, setEditingProfile, onSave, calculateBMR }) {
  if (editingProfile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">✏️ Edit Profile</h2>
          <button
            onClick={() => setEditingProfile(null)}
            className="text-gray-600 text-sm"
          >
            ✕ Cancel
          </button>
        </div>

        <div className="bg-white rounded-lg p-4 shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={editingProfile.name}
              onChange={(e) => setEditingProfile(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input
                type="number"
                value={editingProfile.age}
                onChange={(e) => setEditingProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                value={editingProfile.gender}
                onChange={(e) => setEditingProfile(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Height (cm)</label>
              <input
                type="number"
                value={editingProfile.height}
                onChange={(e) => setEditingProfile(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight (kg)</label>
              <input
                type="number"
                value={editingProfile.weight}
                onChange={(e) => setEditingProfile(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Health Goal</label>
            <select
              value={editingProfile.goal}
              onChange={(e) => setEditingProfile(prev => ({ ...prev, goal: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="weight_loss">Weight Loss</option>
              <option value="weight_gain">Weight Gain</option>
              <option value="maintenance">Maintenance</option>
              <option value="growth">Growth (children)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">🥗 Dietary Preference</label>
            <select
              value={editingProfile.dietary_preference}
              onChange={(e) => setEditingProfile(prev => ({ ...prev, dietary_preference: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="omnivore">🍖 Omnivore (Eats everything)</option>
              <option value="vegetarian">🥬 Vegetarian (No meat/fish)</option>
              <option value="eggetarian">🥚 Eggetarian (Veg + Eggs)</option>
              <option value="vegan">🌱 Vegan (No animal products)</option>
              <option value="pescatarian">🐟 Pescatarian (Veg + Fish)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              This filters which recipes you see each day
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-800 mb-1">📊 Auto-calculated target:</p>
            <p className="text-sm font-semibold text-green-900">
              {Math.round(calculateBMR(editingProfile) * 1.2)} calories/day
            </p>
          </div>

          <button
            onClick={onSave}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
          >
            💾 Save Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">⚙️ Settings</h2>

      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Your Profile</h3>
          <button
            onClick={() => setEditingProfile({ ...profile })}
            className="text-blue-600 text-sm font-medium"
          >
            ✏️ Edit
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{profile.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Age:</span>
            <span className="font-medium">{profile.age} years</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Height:</span>
            <span className="font-medium">{profile.height} cm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Weight:</span>
            <span className="font-medium">{profile.weight} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Goal:</span>
            <span className="font-medium capitalize">{profile.goal?.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Diet:</span>
            <span className="font-medium capitalize">{profile.dietary_preference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Target Calories:</span>
            <span className="font-medium">{profile.target_calories}/day</span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          💡 <strong>Tip:</strong> Update your dietary preference to filter recipes based on your diet!
        </p>
      </div>
    </div>
  );
}

// ============= AI SUGGESTIONS MODAL COMPONENT =============
function AISuggestionsModal({ isGenerating, suggestions, error, onClose, onAddRecipe, onRegenerate }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">🤖 AI Recipe Suggestions</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {isGenerating ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating personalized recipes...</p>
            <p className="text-sm text-gray-500 mt-2">Based on your ingredients and health goals</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-medium mb-2">⚠️ {error}</p>
            <button
              onClick={onRegenerate}
              className="bg-red-600 text-white px-4 py-2 rounded-lg mt-3"
            >
              Try Again
            </button>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                💡 These recipes are tailored to your dietary preferences, health goals, and available ingredients!
              </p>
            </div>

            {suggestions.map((recipe) => (
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
                  onClick={() => {
                    onAddRecipe({
                      name: recipe.name,
                      calories: recipe.calories,
                      protein: recipe.protein,
                      prep_time: recipe.prepTime,
                      ingredients: recipe.ingredients,
                      meal_type: recipe.mealType,
                      is_veg: recipe.isVeg,
                      cuisine: recipe.cuisine,
                      nutrition: recipe.nutrition,
                      description: recipe.description
                    });
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>+</span> Add to My Recipes
                </button>
              </div>
            ))}

            <button
              onClick={onRegenerate}
              className="w-full bg-purple-100 text-purple-700 py-3 rounded-lg font-medium hover:bg-purple-200 transition-colors"
            >
              🔄 Generate New Suggestions
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Click below to generate recipe suggestions</p>
            <button
              onClick={onRegenerate}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              🤖 Generate Suggestions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============= RENDER APP =============
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MealPlannerApp />);
