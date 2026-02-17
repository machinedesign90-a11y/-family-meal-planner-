// Family Meal Planner v2 - Weekly Calendar + Day Types + Swiggy
const { useState, useEffect } = React;

const DAY_TYPES = {
  normal:    { label: 'Normal',    emoji: '🍽️', bg: 'bg-blue-50',   border: 'border-blue-400',   text: 'text-blue-700',   btn: 'bg-blue-600'   },
  order_in:  { label: 'Order In',  emoji: '🛵', bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-700', btn: 'bg-orange-500' },
  dine_out:  { label: 'Dine Out',  emoji: '🍴', bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-700', btn: 'bg-purple-600' },
  cheat_day: { label: 'Cheat Day', emoji: '🎉', bg: 'bg-red-50',    border: 'border-red-400',    text: 'text-red-700',    btn: 'bg-red-500'    }
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── HELPERS ────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function getWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function swiggyFoodUrl(searchTerm) {
  return `https://www.swiggy.com/search?query=${encodeURIComponent(searchTerm)}`;
}

function swiggyDineoutUrl(searchTerm) {
  return `https://www.swiggy.com/dineout/search?query=${encodeURIComponent(searchTerm)}`;
}

function swiggyInstamartUrl(searchTerm) {
  return `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(searchTerm)}`;
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
function MealPlannerApp() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [inventory, setInventory] = useState([]);
  const [customRecipes, setCustomRecipes] = useState([]);
  const [weekDayTypes, setWeekDayTypes] = useState({});
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [showDayTypeModal, setShowDayTypeModal] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderModalType, setOrderModalType] = useState('order_in');
  const [orderSuggestions, setOrderSuggestions] = useState([]);
  const [loadingOrderSuggestions, setLoadingOrderSuggestions] = useState(false);

  useEffect(() => { initApp(); }, []);

  async function initApp() {
    try {
      const u = await window.authHelpers.getUser();
      if (!u) { window.location.href = '/login.html'; return; }
      setUser(u);
      const [pd, inv, rec] = await Promise.all([
        window.api.getProfile(),
        window.api.getInventory(),
        window.api.getRecipes()
      ]);
      setProfile(pd.profile);
      setInventory(inv.items || []);
      setCustomRecipes(rec.recipes || []);
      await loadWeekDayTypes();
      setAuthLoading(false);
    } catch (e) {
      window.location.href = '/login.html';
    }
  }

  async function loadWeekDayTypes() {
    const dates = getWeekDates();
    try {
      const headers = await window.api.getAuthHeader();
      const r = await fetch(`/api/day-types?startDate=${dates[0]}&endDate=${dates[6]}`,
        { headers: { ...headers, 'Content-Type': 'application/json' } });
      const { dayTypes } = await r.json();
      const map = {};
      (dayTypes || []).forEach(dt => { map[dt.date] = dt; });
      setWeekDayTypes(map);
    } catch (e) { console.error(e); }
  }

  async function saveDayType(date, day_type) {
    try {
      const headers = await window.api.getAuthHeader();
      const r = await fetch('/api/day-types', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, day_type })
      });
      const { dayType } = await r.json();
      setWeekDayTypes(prev => ({ ...prev, [date]: dayType }));
      setShowDayTypeModal(false);
      if (day_type === 'order_in' || day_type === 'dine_out') {
        setOrderModalType(day_type);
        openOrderModal(day_type);
      }
    } catch (e) { console.error(e); }
  }

  async function openOrderModal(type) {
    setOrderModalType(type);
    setShowOrderModal(true);
    setLoadingOrderSuggestions(true);
    setOrderSuggestions([]);
    try {
      const dietPref = profile?.dietary_preference || 'omnivore';
      const goal = profile?.goal || 'maintenance';
      const cals = profile?.target_calories || 2000;
      const mealCal = Math.round(cals / 3);
      const prompt = `Suggest 4 ${type === 'order_in' ? 'Swiggy food order' : 'dineout restaurant'} options for someone in Hyderabad, India.
User: ${dietPref} diet, goal: ${goal}, ~${mealCal} calories per meal.
STRICTLY follow dietary preference: ${dietPref}.
Respond ONLY with JSON:
{"suggestions":[{"name":"string","cuisine":"string","dish":"string","calories":400,"isVeg":true,"price":"₹200-350","reason":"string","swiggySearch":"string"}]}`;

      const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': window._gKey || '' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (resp.ok) {
        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(clean);
        setOrderSuggestions(parsed.suggestions || []);
      } else {
        throw new Error('API failed');
      }
    } catch (e) {
      // Fallback suggestions
      const isVeg = ['vegetarian', 'vegan', 'eggetarian'].includes(profile?.dietary_preference);
      setOrderSuggestions(isVeg ? [
        { name: 'Saravanaa Bhavan', cuisine: 'South Indian', dish: 'Masala Dosa + Sambar', calories: 380, isVeg: true, price: '₹120-180', reason: 'High protein veg meal', swiggySearch: 'saravanaa bhavan' },
        { name: 'Chutneys', cuisine: 'South Indian', dish: 'Pesarattu + Upma', calories: 350, isVeg: true, price: '₹150-220', reason: 'Light and nutritious', swiggySearch: 'chutneys restaurant' },
        { name: 'Eat Fit', cuisine: 'Healthy', dish: 'Paneer Protein Bowl', calories: 420, isVeg: true, price: '₹250-350', reason: 'Calorie tracked meals', swiggySearch: 'eat fit healthy' },
        { name: 'Govindas', cuisine: 'Pure Veg Thali', dish: 'Full Veg Thali', calories: 450, isVeg: true, price: '₹100-150', reason: 'Balanced wholesome meal', swiggySearch: 'govindas hyderabad' }
      ] : [
        { name: 'Paradise Restaurant', cuisine: 'Hyderabadi', dish: 'Chicken Dum Biryani', calories: 520, isVeg: false, price: '₹250-350', reason: 'Protein rich, iconic Hyderabad dish', swiggySearch: 'paradise biryani' },
        { name: 'Eat Fit', cuisine: 'Healthy', dish: 'Grilled Chicken Bowl', calories: 380, isVeg: false, price: '₹280-380', reason: 'Calorie tracked, high protein', swiggySearch: 'eat fit grilled chicken' },
        { name: 'Barbeque Nation', cuisine: 'BBQ Grill', dish: 'Grilled Chicken + Salad', calories: 450, isVeg: false, price: '₹400-600', reason: 'Grilled = healthier than curries', swiggySearch: 'barbeque nation' },
        { name: 'Absolute Barbecues', cuisine: 'Continental Grill', dish: 'Fish Tikka + Veggies', calories: 400, isVeg: false, price: '₹350-500', reason: 'Lean protein, perfect for goals', swiggySearch: 'absolute barbecues hyderabad' }
      ]);
    } finally {
      setLoadingOrderSuggestions(false);
    }
  }

  async function generateAIRecipes() {
    setIsGeneratingAI(true);
    setAiError(null);
    setShowAISuggestions(true);
    setAiSuggestions([]);
    try {
      const result = await window.api.generateRecipes(null, inventory);
      if (!result.success) throw new Error(result.error);
      setAiSuggestions(result.recipes);
    } catch (e) { setAiError(e.message); }
    finally { setIsGeneratingAI(false); }
  }

  async function addCustomRecipe(recipe) {
    const { recipe: r } = await window.api.createRecipe(recipe);
    setCustomRecipes(prev => [...prev, r]);
    alert('Recipe added!');
  }

  async function addInventoryItem(item) {
    const { item: i } = await window.api.addInventoryItem(item);
    setInventory(prev => [...prev, i]);
  }

  async function deleteInventoryItem(id) {
    await window.api.deleteInventoryItem(id);
    setInventory(prev => prev.filter(i => i.id !== id));
  }

  async function handleSaveProfile() {
    const { profile: p } = await window.api.updateProfile(editingProfile);
    setProfile(p);
    setEditingProfile(null);
  }

  function getTodayDayType() {
    return weekDayTypes[todayStr()]?.day_type || 'normal';
  }

  function getCalorieBudget() {
    const base = profile?.target_calories || 2000;
    const dt = getTodayDayType();
    if (dt === 'cheat_day') return { budget: base, label: 'Enjoy today 🎉', color: 'text-red-600' };
    if (dt === 'order_in') return { budget: base, label: 'Ordering in today 🛵', color: 'text-orange-600' };
    if (dt === 'dine_out') return { budget: base, label: 'Dining out today 🍴', color: 'text-purple-600' };
    return { budget: base, label: 'Home cooked meals 🍽️', color: 'text-blue-600' };
  }

  const defaultRecipes = [
    { id: 'd1', name: 'Palak Paneer', calories: 380, protein: 28, prepTime: 25, mealType: 'lunch', isVeg: true, is_veg: true, cuisine: 'Indian', description: 'Classic spinach & cottage cheese curry' },
    { id: 'd2', name: 'Dal Tadka', calories: 320, protein: 22, prepTime: 30, mealType: 'dinner', isVeg: true, is_veg: true, cuisine: 'Indian', description: 'Lentil curry with tempering' },
    { id: 'd3', name: 'Butter Chicken', calories: 520, protein: 42, prepTime: 40, mealType: 'dinner', isVeg: false, is_veg: false, cuisine: 'Indian', description: 'Creamy tomato-based chicken curry' },
    { id: 'd4', name: 'Grilled Chicken Salad', calories: 380, protein: 45, prepTime: 20, mealType: 'lunch', isVeg: false, is_veg: false, cuisine: 'Continental', description: 'High-protein healthy salad' },
    { id: 'd5', name: 'Vegetable Biryani', calories: 450, protein: 18, prepTime: 45, mealType: 'lunch', isVeg: true, is_veg: true, cuisine: 'Indian', description: 'Fragrant rice with mixed vegetables' }
  ];

  function getFilteredRecipes() {
    if (!profile) return [];
    const dp = profile.dietary_preference || 'omnivore';
    const isNonVegDay = [0, 1, 3, 5].includes(new Date().getDay());
    const all = [...defaultRecipes, ...customRecipes];
    if (dp === 'vegetarian' || dp === 'eggetarian' || dp === 'vegan') return all.filter(r => r.isVeg || r.is_veg);
    if (dp === 'omnivore') return isNonVegDay ? all : all.filter(r => r.isVeg || r.is_veg);
    return all.filter(r => r.isVeg || r.is_veg);
  }

  function getDietLabel() {
    const dp = profile?.dietary_preference || 'omnivore';
    const isNonVegDay = [0, 1, 3, 5].includes(new Date().getDay());
    if (dp === 'vegetarian') return '🥬 Vegetarian';
    if (dp === 'eggetarian') return '🥚 Eggetarian';
    if (dp === 'vegan') return '🌱 Vegan';
    if (dp === 'omnivore') return isNonVegDay ? '🍗 Non-Veg Day' : '🥬 Veg Day';
    return '🍽️ Mixed';
  }

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your meal planner...</p>
      </div>
    </div>
  );

  const todayDT = getTodayDayType();
  const dtInfo = DAY_TYPES[todayDT];
  const { budget, label: budgetLabel, color: budgetColor } = getCalorieBudget();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🍽️ Meal Planner</h1>
            <p className="text-sm text-blue-100">Hi {profile?.name}! {dtInfo.emoji} {dtInfo.label} today</p>
          </div>
          <button onClick={() => { window.authHelpers.signOut(); window.location.href = '/login.html'; }}
            className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm font-medium">
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">

        {/* ── HOME TAB ─────────────────────────────────────────────── */}
        <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
          <div className="space-y-4">

            {/* Calorie Budget Banner */}
            <div className={`rounded-xl p-4 border-2 ${dtInfo.bg} ${dtInfo.border}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className={`font-bold text-lg ${dtInfo.text}`}>{dtInfo.emoji} {budgetLabel}</p>
                  <p className={`text-sm ${dtInfo.text}`}>Daily budget: {budget} calories</p>
                </div>
                {(todayDT === 'order_in' || todayDT === 'dine_out') && (
                  <button onClick={() => openOrderModal(todayDT)}
                    className={`${dtInfo.btn} text-white px-3 py-2 rounded-lg text-sm font-medium`}>
                    {todayDT === 'order_in' ? '🛵 Order Now' : '🍴 Find Table'}
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-500">Today's Diet</p>
                <p className="text-lg font-bold text-blue-600">{getDietLabel()}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-500">Calorie Target</p>
                <p className="text-lg font-bold text-purple-600">{budget} kcal</p>
              </div>
            </div>

            {/* AI Recipes CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white">
              <h3 className="font-bold mb-1">🤖 AI Recipe Suggestions</h3>
              <p className="text-sm text-blue-100 mb-3">Based on your fridge & health goals</p>
              <button onClick={generateAIRecipes}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium w-full hover:bg-blue-50 transition-colors">
                ✨ Generate Recipes
              </button>
            </div>

            {/* Today's Menu */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-3">🍽️ Today's Menu</h2>
              <div className="space-y-2">
                {getFilteredRecipes().slice(0, 3).map(r => (
                  <div key={r.id} className="border-l-4 border-blue-400 pl-3 py-1">
                    <p className="font-medium text-sm">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.calories} cal • {r.protein}g protein • {r.prepTime}m</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── CALENDAR TAB ─────────────────────────────────────────── */}
        <div style={{ display: activeTab === 'calendar' ? 'block' : 'none' }}>
          <WeeklyCalendar
            weekDates={getWeekDates()}
            weekDayTypes={weekDayTypes}
            selectedDate={selectedDate}
            onSelectDate={(d) => { setSelectedDate(d); setShowDayTypeModal(true); }}
            onOpenOrderModal={openOrderModal}
          />
        </div>

        {/* ── FRIDGE TAB ───────────────────────────────────────────── */}
        <div style={{ display: activeTab === 'fridge' ? 'block' : 'none' }}>
          <FridgeTab inventory={inventory} onAdd={addInventoryItem} onDelete={deleteInventoryItem} />
        </div>

        {/* ── RECIPES TAB ──────────────────────────────────────────── */}
        <div style={{ display: activeTab === 'recipes' ? 'block' : 'none' }}>
          <RecipesTab recipes={getFilteredRecipes()} dietLabel={getDietLabel()} onGenerateAI={generateAIRecipes} />
        </div>

        {/* ── SETTINGS TAB ─────────────────────────────────────────── */}
        <div style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
          <SettingsTab profile={profile} editingProfile={editingProfile}
            setEditingProfile={setEditingProfile} onSave={handleSaveProfile} />
        </div>
      </div>

      {/* ── BOTTOM NAV ───────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-md mx-auto flex justify-around py-2">
          {[
            { key: 'home', emoji: '🏠', label: 'Home' },
            { key: 'calendar', emoji: '📅', label: 'Week' },
            { key: 'fridge', emoji: '🧊', label: 'Fridge' },
            { key: 'recipes', emoji: '📖', label: 'Recipes' },
            { key: 'settings', emoji: '⚙️', label: 'Settings' }
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${activeTab === tab.key ? 'text-blue-600' : 'text-gray-400'}`}>
              <span className="text-xl">{tab.emoji}</span>
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── DAY TYPE MODAL ───────────────────────────────────────── */}
      {showDayTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-1">📅 {selectedDate === todayStr() ? 'Today' : selectedDate}</h3>
            <p className="text-gray-500 text-sm mb-4">How are you eating?</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(DAY_TYPES).map(([key, dt]) => (
                <button key={key} onClick={() => saveDayType(selectedDate, key)}
                  className={`p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${weekDayTypes[selectedDate]?.day_type === key ? `${dt.bg} ${dt.border}` : 'border-gray-200 bg-white'}`}>
                  <p className="text-2xl mb-1">{dt.emoji}</p>
                  <p className={`font-semibold ${dt.text}`}>{dt.label}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setShowDayTypeModal(false)}
              className="mt-4 w-full py-3 border border-gray-200 rounded-xl text-gray-500 font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── ORDER / DINE OUT MODAL ───────────────────────────────── */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md my-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold">
                  {orderModalType === 'order_in' ? '🛵 Order In' : '🍴 Dine Out'}
                </h3>
                <p className="text-sm text-gray-500">
                  {orderModalType === 'order_in' ? 'Suggestions based on your diet & goals' : 'Restaurant recommendations for you'}
                </p>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-400 text-2xl">✕</button>
            </div>

            {/* Calorie reminder */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-yellow-800">
                💡 <strong>Calorie Budget:</strong> {budget} kcal today ({Math.round(budget / 3)} kcal per meal)
              </p>
              <p className="text-xs text-yellow-700 mt-1">Diet: {getDietLabel()}</p>
            </div>

            {loadingOrderSuggestions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-500">Finding the best options for you...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderSuggestions.map((s, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold">{s.name}</p>
                        <p className="text-sm text-gray-500">{s.cuisine}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${s.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {s.isVeg ? '🥬 Veg' : '🍖 Non-Veg'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">🍽️ Try: {s.dish}</p>
                    <div className="flex gap-3 text-xs text-gray-500 mb-2">
                      <span>🔥 ~{s.calories} cal</span>
                      <span>💰 {s.price}</span>
                    </div>
                    <p className="text-xs text-green-700 mb-3">✅ {s.reason}</p>
                    <div className="flex gap-2">
                      {orderModalType === 'order_in' ? (
                        <>
                          <a href={swiggyFoodUrl(s.swiggySearch)} target="_blank" rel="noopener noreferrer"
                            className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium text-center">
                            🛵 Order on Swiggy
                          </a>
                          <a href={`https://www.zomato.com/hyderabad/search?q=${encodeURIComponent(s.swiggySearch)}`} target="_blank" rel="noopener noreferrer"
                            className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium text-center">
                            🍕 Order on Zomato
                          </a>
                        </>
                      ) : (
                        <>
                          <a href={swiggyDineoutUrl(s.swiggySearch)} target="_blank" rel="noopener noreferrer"
                            className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium text-center">
                            🍴 Book on Dineout
                          </a>
                          <a href={`https://www.zomato.com/hyderabad/restaurants?q=${encodeURIComponent(s.swiggySearch)}`} target="_blank" rel="noopener noreferrer"
                            className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium text-center">
                            🔍 Find on Zomato
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {/* Instamart CTA */}
                {orderModalType === 'order_in' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-2">
                    <p className="font-semibold text-green-800 mb-1">🛒 Need groceries instead?</p>
                    <p className="text-xs text-green-700 mb-3">Order from Swiggy Instamart - delivered in minutes!</p>
                    <a href={swiggyInstamartUrl('vegetables fruits protein')} target="_blank" rel="noopener noreferrer"
                      className="block bg-green-600 text-white py-2 rounded-lg text-sm font-medium text-center">
                      🧊 Open Swiggy Instamart
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── AI SUGGESTIONS MODAL ─────────────────────────────────── */}
      {showAISuggestions && (
        <AISuggestionsModal
          isGenerating={isGeneratingAI}
          suggestions={aiSuggestions}
          error={aiError}
          onClose={() => setShowAISuggestions(false)}
          onAdd={addCustomRecipe}
          onRegenerate={generateAIRecipes}
        />
      )}
    </div>
  );
}

// ─── WEEKLY CALENDAR ────────────────────────────────────────────────────────
function WeeklyCalendar({ weekDates, weekDayTypes, selectedDate, onSelectDate, onOpenOrderModal }) {
  const today = todayStr();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">📅 This Week</h2>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(DAY_TYPES).map(([k, v]) => (
          <span key={k} className={`px-2 py-1 rounded-full text-xs font-medium ${v.bg} ${v.text}`}>
            {v.emoji} {v.label}
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
        {weekDates.map((date) => {
          const dt = weekDayTypes[date]?.day_type || 'normal';
          const info = DAY_TYPES[dt];
          const isT = date === today;
          return (
            <button key={date} onClick={() => onSelectDate(date)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 border-2 transition-all hover:scale-105
                ${isT ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                ${info.bg} ${info.border}`}>
              <span className={`text-xs font-bold ${info.text}`}>
                {new Date(date + 'T00:00:00').getDate()}
              </span>
              <span className="text-base">{info.emoji}</span>
            </button>
          );
        })}
      </div>

      {/* Day Detail Cards */}
      <div className="space-y-3">
        {weekDates.map((date) => {
          const dt = weekDayTypes[date]?.day_type || 'normal';
          const info = DAY_TYPES[dt];
          const isT = date === today;
          const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][new Date(date + 'T00:00:00').getDay() === 0 ? 6 : new Date(date + 'T00:00:00').getDay() - 1];
          return (
            <div key={date} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${info.border} ${isT ? 'ring-2 ring-blue-300' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{dayName} {isT && <span className="text-xs text-blue-600 ml-1">● Today</span>}</p>
                  <p className={`text-sm ${info.text}`}>{info.emoji} {info.label}</p>
                </div>
                <div className="flex gap-2">
                  {(dt === 'order_in' || dt === 'dine_out') && (
                    <button onClick={() => onOpenOrderModal(dt)}
                      className={`${info.btn} text-white px-3 py-1 rounded-lg text-xs font-medium`}>
                      {dt === 'order_in' ? '🛵 Order' : '🍴 Book'}
                    </button>
                  )}
                  <button onClick={() => onSelectDate(date)}
                    className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium">
                    ✏️ Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── FRIDGE TAB ─────────────────────────────────────────────────────────────
function FridgeTab({ inventory, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [item, setItem] = useState({ name: '', quantity: '', unit: 'g', category: 'vegetables' });

  function handleAdd() {
    if (!item.name || !item.quantity) return alert('Fill in all fields');
    onAdd({ ...item, quantity: parseFloat(item.quantity), expires_at: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], is_low: false });
    setItem({ name: '', quantity: '', unit: 'g', category: 'vegetables' });
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">🧊 Your Fridge</h2>
        <button onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${showForm ? 'bg-gray-500' : 'bg-green-600'}`}>
          {showForm ? '✕ Cancel' : '+ Add Item'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <input type="text" placeholder="Item name (e.g. Tomatoes)" value={item.name}
            onChange={e => setItem(p => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Quantity" value={item.quantity}
              onChange={e => setItem(p => ({ ...p, quantity: e.target.value }))}
              className="px-3 py-2 border rounded-lg" />
            <select value={item.unit} onChange={e => setItem(p => ({ ...p, unit: e.target.value }))}
              className="px-3 py-2 border rounded-lg">
              {['g', 'kg', 'ml', 'l', 'pieces'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <select value={item.category} onChange={e => setItem(p => ({ ...p, category: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg">
            {['vegetables', 'protein', 'dairy', 'grains', 'spices', 'other'].map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <button onClick={handleAdd} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium">
            Add to Fridge
          </button>
        </div>
      )}

      <div className="space-y-2">
        {inventory.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400">
            <p className="text-4xl mb-2">🧊</p>
            <p className="font-medium">Your fridge is empty</p>
            <p className="text-sm mt-1">Add items to get better AI recipe suggestions!</p>
          </div>
        ) : inventory.map(i => (
          <div key={i.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-medium">{i.name}</p>
              <p className="text-sm text-gray-500">{i.quantity}{i.unit} • {i.category}</p>
            </div>
            <button onClick={() => onDelete(i.id)} className="text-red-400 hover:text-red-600 p-2">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RECIPES TAB ─────────────────────────────────────────────────────────────
function RecipesTab({ recipes, dietLabel, onGenerateAI }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">📖 Recipes</h2>
        <button onClick={onGenerateAI}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          🤖 AI Suggest
        </button>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-sm font-medium text-blue-800">{dietLabel}</p>
      </div>
      <div className="space-y-3">
        {recipes.map(r => (
          <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-1">
              <div>
                <h3 className="font-bold">{r.name}</h3>
                <p className="text-xs text-gray-400">{r.cuisine} • {r.mealType}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${r.isVeg || r.is_veg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {r.isVeg || r.is_veg ? '🥬 Veg' : '🍖 Non-Veg'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{r.description}</p>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>🔥 {r.calories} cal</span>
              <span>💪 {r.protein}g</span>
              <span>⏱️ {r.prepTime}m</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SETTINGS TAB ────────────────────────────────────────────────────────────
function SettingsTab({ profile, editingProfile, setEditingProfile, onSave }) {
  if (editingProfile) return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">✏️ Edit Profile</h2>
        <button onClick={() => setEditingProfile(null)} className="text-gray-400">✕ Cancel</button>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
        {[['name', 'Name', 'text'], ['age', 'Age', 'number'], ['height', 'Height (cm)', 'number'], ['weight', 'Weight (kg)', 'number']].map(([field, label, type]) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input type={type} value={editingProfile[field] || ''}
              onChange={e => setEditingProfile(p => ({ ...p, [field]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select value={editingProfile.gender} onChange={e => setEditingProfile(p => ({ ...p, gender: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">🎯 Health Goal</label>
          <select value={editingProfile.goal} onChange={e => setEditingProfile(p => ({ ...p, goal: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg">
            <option value="weight_loss">⬇️ Weight Loss</option>
            <option value="maintenance">⚖️ Maintenance</option>
            <option value="weight_gain">⬆️ Weight Gain</option>
            <option value="growth">🌱 Growth (children)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">🥗 Dietary Preference</label>
          <select value={editingProfile.dietary_preference} onChange={e => setEditingProfile(p => ({ ...p, dietary_preference: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg">
            <option value="omnivore">🍖 Omnivore</option>
            <option value="vegetarian">🥬 Vegetarian</option>
            <option value="eggetarian">🥚 Eggetarian</option>
            <option value="vegan">🌱 Vegan</option>
            <option value="pescatarian">🐟 Pescatarian</option>
          </select>
        </div>
        <button onClick={onSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium">💾 Save Profile</button>
      </div>
    </div>
  );

  if (!profile) return null;
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">⚙️ Settings</h2>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Your Profile</h3>
          <button onClick={() => setEditingProfile({ ...profile })} className="text-blue-600 text-sm font-medium">✏️ Edit</button>
        </div>
        <div className="space-y-2 text-sm">
          {[['Name', profile.name], ['Age', `${profile.age} years`], ['Height', `${profile.height} cm`], ['Weight', `${profile.weight} kg`],
            ['Goal', profile.goal?.replace('_', ' ')], ['Diet', profile.dietary_preference], ['Target Calories', `${profile.target_calories}/day`]
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-gray-500">{label}:</span>
              <span className="font-medium capitalize">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AI MODAL ────────────────────────────────────────────────────────────────
function AISuggestionsModal({ isGenerating, suggestions, error, onClose, onAdd, onRegenerate }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">🤖 AI Recipe Suggestions</h3>
          <button onClick={onClose} className="text-gray-400 text-2xl">✕</button>
        </div>
        {isGenerating ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating personalized recipes...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700">{error}</p>
            <button onClick={onRegenerate} className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg">Try Again</button>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map(r => (
              <div key={r.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold">{r.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${r.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {r.isVeg ? '🥬 Veg' : '🍖 Non-Veg'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{r.description}</p>
                <div className="flex gap-4 text-xs text-gray-500 mb-3">
                  <span>🔥 {r.calories} cal</span>
                  <span>💪 {r.protein}g</span>
                  <span>⏱️ {r.prepTime}m</span>
                </div>
                <button onClick={() => onAdd({ name: r.name, calories: r.calories, protein: r.protein, prep_time: r.prepTime, ingredients: r.ingredients, meal_type: r.mealType, is_veg: r.isVeg, cuisine: r.cuisine, description: r.description })}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium">
                  + Add to My Recipes
                </button>
              </div>
            ))}
            {suggestions.length > 0 && (
              <button onClick={onRegenerate}
                className="w-full bg-purple-100 text-purple-700 py-3 rounded-xl font-medium">
                🔄 Generate New Suggestions
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── RENDER ──────────────────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(MealPlannerApp));
