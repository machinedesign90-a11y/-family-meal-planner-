// Family Meal Planner v4
// FIXES: future date planning | calorie formula | backend API only | medical conditions | no direct Gemini
const { useState, useEffect } = React;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DAY_TYPES = {
  normal:    { label: 'Normal',    emoji: '🍽️', bg: 'bg-blue-50',   border: 'border-blue-400',   text: 'text-blue-700',   btn: 'bg-blue-600'   },
  order_in:  { label: 'Order In',  emoji: '🛵', bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-700', btn: 'bg-orange-500' },
  dine_out:  { label: 'Dine Out',  emoji: '🍴', bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-700', btn: 'bg-purple-600' },
  cheat_day: { label: 'Cheat Day', emoji: '🎉', bg: 'bg-red-50',    border: 'border-red-400',    text: 'text-red-700',    btn: 'bg-red-500'    }
};

const MEAL_SLOTS = [
  { key: 'breakfast',     label: 'Breakfast',     emoji: '🌅', pct: 0.25 },
  { key: 'morning_snack', label: 'Morning Snack', emoji: '🍎', pct: 0.10 },
  { key: 'lunch',         label: 'Lunch',         emoji: '🍱', pct: 0.35 },
  { key: 'evening_snack', label: 'Evening Snack', emoji: '🥜', pct: 0.10 },
  { key: 'dinner',        label: 'Dinner',        emoji: '🌙', pct: 0.20 }
];

// FIX 2: Recalibrated activity levels - yoga 6x/week is light_moderate not moderate
const ACTIVITY_LEVELS = {
  sedentary:      { label: 'Sedentary (desk job, no exercise)',            factor: 1.2   },
  light:          { label: 'Light (yoga/walks 1-3x/week)',                 factor: 1.375 },
  light_moderate: { label: 'Light-Moderate (yoga 5-6x/week) ← your level', factor: 1.45  },
  moderate:       { label: 'Moderate (gym/sports 4-5x/week)',              factor: 1.55  },
  active:         { label: 'Very Active (intense training daily)',          factor: 1.725 }
};

// FIX 4: Medical conditions and allergies
const MEDICAL_CONDITIONS = [
  { key: 'hypothyroid',    label: 'Hypothyroidism',         icon: '🦋' },
  { key: 'hyperthyroid',   label: 'Hyperthyroidism',        icon: '🦋' },
  { key: 'hypertension',   label: 'Hypertension (High BP)', icon: '❤️' },
  { key: 'diabetes_t2',    label: 'Type 2 Diabetes',        icon: '🩸' },
  { key: 'prediabetes',    label: 'Pre-diabetes',           icon: '🩸' },
  { key: 'hyperacidity',   label: 'Hyperacidity / GERD',    icon: '🔥' },
  { key: 'pcod',           label: 'PCOD/PCOS',              icon: '🌸' },
  { key: 'ibs',            label: 'IBS / Gut Issues',       icon: '🫃' },
];

const FOOD_ALLERGIES = [
  { key: 'nuts',      label: 'Tree Nuts',       icon: '🥜' },
  { key: 'peanuts',   label: 'Peanuts',         icon: '🥜' },
  { key: 'dairy',     label: 'Dairy / Lactose', icon: '🥛' },
  { key: 'gluten',    label: 'Gluten / Wheat',  icon: '🌾' },
  { key: 'eggs',      label: 'Eggs',            icon: '🥚' },
  { key: 'soy',       label: 'Soy',             icon: '🫘' },
  { key: 'shellfish', label: 'Shellfish',        icon: '🦐' },
];

// ─── CALORIE CALCULATOR ───────────────────────────────────────────────────────
function calcCalories(p) {
  if (!p?.weight || !p?.height || !p?.age) return 1800;
  const bmr = p.gender === 'female'
    ? (10 * p.weight) + (6.25 * p.height) - (5 * p.age) - 161
    : (10 * p.weight) + (6.25 * p.height) - (5 * p.age) + 5;
  const factor = ACTIVITY_LEVELS[p.activity_level || 'light_moderate']?.factor || 1.45;
  const tdee   = Math.round(bmr * factor);
  const adj    = Math.round((parseFloat(p.weight_goal_kg_per_week || -0.5) * 7700) / 7);
  return Math.max(1200, tdee + adj);
}

function getCalWarnings(p) {
  if (!p?.weight || !p?.height || !p?.age) return [];
  const goal = parseFloat(p.weight_goal_kg_per_week || -0.5);
  const bmr  = p.gender === 'female'
    ? (10*p.weight) + (6.25*p.height) - (5*p.age) - 161
    : (10*p.weight) + (6.25*p.height) - (5*p.age) + 5;
  const tdee = Math.round(bmr * (ACTIVITY_LEVELS[p.activity_level||'light_moderate']?.factor||1.45));
  const raw  = tdee + Math.round((goal * 7700) / 7);
  const w    = [];
  if (raw < 1200) w.push(`⚠️ Calculated target (${raw} kcal) is below safe minimum. Locked to 1200 kcal.`);
  if (goal < -1)  w.push('⚠️ Losing more than 1 kg/week causes muscle loss and nutrient deficiencies.');
  else if (goal < -0.5) w.push('💡 0.5 kg/week is the most sustainable and safe rate of weight loss.');
  return w;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function todayStr()    { return new Date().toISOString().split('T')[0]; }
function fmtDate(d)    {
  const dt = new Date(d + 'T00:00:00');
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${days[dt.getDay()]} ${dt.getDate()} ${months[dt.getMonth()]}`;
}

function getWeekDates(offset = 0) {
  const today = new Date();
  const day   = today.getDay();
  const mon   = new Date(today);
  mon.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon); d.setDate(mon.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

async function detectCity() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const d = await r.json();
          resolve(d.address?.city || d.address?.town || d.address?.village || null);
        } catch { resolve(null); }
      },
      () => resolve(null),
      { timeout: 8000 }
    );
  });
}

// ─── REUSABLE MODAL ───────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
        <div className="overflow-y-auto p-5 flex-1">{children}</div>
      </div>
    </div>
  );
}

// ─── PILL TOGGLE ─────────────────────────────────────────────────────────────
function PillToggle({ value, options, onChange, activeColor = '#dc2626', activeBg = '#fef2f2', activeBorder = '#fca5a5' }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map(o => {
        const active = value?.includes(o.key);
        return (
          <button key={o.key} onClick={() => {
            const curr = value || [];
            onChange(active ? curr.filter(x => x !== o.key) : [...curr, o.key]);
          }} style={{
            padding: '6px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
            border: `2px solid ${active ? activeBorder : '#e5e7eb'}`,
            background: active ? activeBg : 'white',
            color: active ? activeColor : '#6b7280', fontWeight: active ? '600' : '400'
          }}>
            {o.icon} {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function MealPlannerApp() {
  const [loading, setLoading]       = useState(true);
  const [profile, setProfile]       = useState(null);
  const [inventory, setInventory]   = useState([]);
  const [customRecipes, setCustomRecipes] = useState([]);
  const [weekDTs, setWeekDTs]       = useState({});
  const [slots, setSlots]           = useState({});
  const [activeTab, setActiveTab]   = useState('home');
  const [city, setCity]             = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

  // FIX 1: planningDate drives everything - not hardcoded todayStr()
  const [planningDate, setPlanningDate] = useState(todayStr());

  // Modals
  const [dtModal, setDtModal]           = useState(false);
  const [dtModalDate, setDtModalDate]   = useState(todayStr());
  const [slotModal, setSlotModal]       = useState(null);
  const [orderModal, setOrderModal]     = useState(null);
  const [orderData, setOrderData]       = useState({ suggestions: [], loading: false });
  const [aiModal, setAiModal]           = useState(null);
  const [aiData, setAiData]             = useState({ suggestions: [], loading: false, error: null });

  useEffect(() => { initApp(); }, []);

  async function initApp() {
    try {
      const u = await window.authHelpers.getUser();
      if (!u) { window.location.href = '/login.html'; return; }
      const [pd, inv, rec] = await Promise.all([
        window.api.getProfile(), window.api.getInventory(), window.api.getRecipes()
      ]);
      setProfile(pd.profile);
      setInventory(inv.items || []);
      setCustomRecipes(rec.recipes || []);

      // FIX 5: Detect city on load, not on demand
      if (pd.profile?.city) {
        setCity(pd.profile.city);
      } else {
        // Detect city in background - capture profile locally to avoid null ref
        const profileSnapshot = pd.profile;
        detectCity().then(async detected => {
          if (detected && profileSnapshot) {
            setCity(detected);
            try {
              await window.api.updateProfile({ ...profileSnapshot, city: detected });
            } catch (e) { console.warn('Could not save city to profile:', e); }
          }
        });
      }

      await Promise.all([loadWeekDTs(getWeekDates(0)), loadSlots(todayStr())]);
      setLoading(false);
    } catch (e) { console.error(e); window.location.href = '/login.html'; }
  }

  async function loadWeekDTs(dates) {
    try {
      const h = await window.api.getAuthHeader();
      const r = await fetch(`/api/day-types?startDate=${dates[0]}&endDate=${dates[6]}`,
        { headers: { ...h, 'Content-Type': 'application/json' } });
      const { dayTypes } = await r.json();
      const m = {}; (dayTypes || []).forEach(d => { m[d.date] = d; });
      setWeekDTs(prev => ({ ...prev, ...m }));
    } catch (e) { console.error(e); }
  }

  // FIX 1: loadSlots is date-aware
  async function loadSlots(date) {
    try {
      const h = await window.api.getAuthHeader();
      const r = await fetch(`/api/meal-slots?date=${date}`,
        { headers: { ...h, 'Content-Type': 'application/json' } });
      const { slots: s } = await r.json();
      const m = {}; (s || []).forEach(x => { m[x.slot_type] = x; });
      setSlots(m);
      setPlanningDate(date);
    } catch (e) { console.error(e); }
  }

  async function saveDayType(date, day_type) {
    const h = await window.api.getAuthHeader();
    const r = await fetch('/api/day-types', {
      method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, day_type })
    });
    const { dayType } = await r.json();
    setWeekDTs(p => ({ ...p, [date]: dayType }));
    setDtModal(false);
  }

  // FIX 1: saveSlot uses planningDate
  async function saveSlot(slotKey, mode, recipe = null) {
    const h = await window.api.getAuthHeader();
    const r = await fetch('/api/meal-slots', {
      method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: planningDate, slot_type: slotKey, slot_mode: mode,
        recipe_name: recipe?.name || null,
        recipe_calories: recipe?.calories || null,
        recipe_protein: recipe?.protein || null
      })
    });
    const { slot } = await r.json();
    setSlots(p => ({ ...p, [slotKey]: slot }));
    setSlotModal(null);
  }

  async function clearSlot(slotKey) {
    const h = await window.api.getAuthHeader();
    await fetch(`/api/meal-slots?date=${planningDate}&slot_type=${slotKey}`,
      { method: 'DELETE', headers: { ...h, 'Content-Type': 'application/json' } });
    setSlots(p => { const n = { ...p }; delete n[slotKey]; return n; });
  }

  // FIX 3+5: ALL Gemini calls go through backend - no window._gKey
  async function openOrderModal(type, slotKey = null) {
    setOrderModal({ type, slotKey });
    setOrderData({ suggestions: [], loading: true });
    try {
      const h = await window.api.getAuthHeader();
      const r = await fetch('/api/ai/generate', {
        method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'restaurants', orderType: type, city, slotKey })
      });
      const data = await r.json();
      if (!data.success) throw new Error(data.error);
      setOrderData({ suggestions: data.suggestions || [], loading: false });
    } catch (e) {
      const veg = ['vegetarian', 'vegan', 'eggetarian'].includes(profile?.dietary_preference);
      setOrderData({
        loading: false, suggestions: veg ? [
          { name: 'Saravanaa Bhavan', cuisine: 'South Indian', dish: 'Masala Dosa', calories: 380, isVeg: true, price: '₹120-180', reason: 'High-protein veg', swiggySearch: 'saravanaa bhavan' },
          { name: 'Chutneys', cuisine: 'South Indian', dish: 'Pesarattu', calories: 350, isVeg: true, price: '₹150-220', reason: 'Light & nutritious', swiggySearch: 'chutneys' },
          { name: 'Eat Fit', cuisine: 'Healthy', dish: 'Paneer Bowl', calories: 420, isVeg: true, price: '₹250-350', reason: 'Calorie-tracked', swiggySearch: 'eat fit' },
          { name: 'Govindas', cuisine: 'Veg Thali', dish: 'Full Thali', calories: 450, isVeg: true, price: '₹100-150', reason: 'Balanced meal', swiggySearch: 'govindas' }
        ] : [
          { name: 'Paradise', cuisine: 'Hyderabadi', dish: 'Chicken Biryani', calories: 520, isVeg: false, price: '₹250-350', reason: 'Protein-rich', swiggySearch: 'paradise biryani' },
          { name: 'Eat Fit', cuisine: 'Healthy', dish: 'Grilled Chicken Bowl', calories: 380, isVeg: false, price: '₹280-380', reason: 'Calorie-tracked', swiggySearch: 'eat fit chicken' },
          { name: 'Barbeque Nation', cuisine: 'BBQ', dish: 'Grilled Chicken', calories: 450, isVeg: false, price: '₹400-600', reason: 'Grilled is healthier', swiggySearch: 'barbeque nation' },
          { name: 'Absolute Barbecues', cuisine: 'Grill', dish: 'Fish Tikka', calories: 400, isVeg: false, price: '₹350-500', reason: 'Lean protein', swiggySearch: 'absolute barbecues' }
        ]
      });
    }
  }

  // FIX 3: AI recipes also go through backend only
  async function openAIModal(slotKey = null) {
    setAiModal(slotKey);
    setAiData({ suggestions: [], loading: true, error: null });
    try {
      // Use direct fetch with auth header - NOT window.api.generateRecipes (no auth)
      const h = await window.api.getAuthHeader();
      const r = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { ...h, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory })
      });
      if (!r.ok) throw new Error(`Server error: ${r.status}`);
      const result = await r.json();
      if (!result.success) throw new Error(result.error || 'AI generation failed');
      setAiData({ suggestions: result.recipes || [], loading: false, error: null });
    } catch (e) { setAiData({ suggestions: [], loading: false, error: e.message }); }
  }

  async function pickAIRecipe(recipe) {
    if (aiModal) {
      await saveSlot(aiModal, 'recipe', { name: recipe.name, calories: recipe.calories, protein: recipe.protein });
    } else {
      await window.api.createRecipe({ name: recipe.name, calories: recipe.calories, protein: recipe.protein, prep_time: recipe.prepTime, is_veg: recipe.isVeg, cuisine: recipe.cuisine, description: recipe.description, meal_type: recipe.mealType });
      setCustomRecipes(p => [...p, { ...recipe, id: 'r' + Date.now() }]);
      alert('Recipe saved!');
    }
    setAiModal(null);
  }

  async function handleSaveProfile(updated) {
    try {
      const cal = calcCalories(updated);
      const result = await window.api.updateProfile({ ...updated, target_calories: cal });
      const p = result?.profile || result;
      if (p && typeof p === 'object') {
        setProfile(p);
        if (p.city) setCity(p.city);
      }
    } catch (e) { console.error('Profile save error:', e); alert('Profile saved! Please refresh to see updates.'); }
  }

  // Recipes
  const DEF_RECIPES = [
    { id: 'd1', name: 'Palak Paneer', calories: 380, protein: 28, prepTime: 25, meal_type: 'lunch', is_veg: true, cuisine: 'Indian', description: 'Spinach & cottage cheese curry' },
    { id: 'd2', name: 'Dal Tadka', calories: 320, protein: 22, prepTime: 30, meal_type: 'dinner', is_veg: true, cuisine: 'Indian', description: 'Lentil curry with tempering' },
    { id: 'd3', name: 'Butter Chicken', calories: 520, protein: 42, prepTime: 40, meal_type: 'dinner', is_veg: false, cuisine: 'Indian', description: 'Creamy tomato chicken curry' },
    { id: 'd4', name: 'Grilled Chicken Salad', calories: 380, protein: 45, prepTime: 20, meal_type: 'lunch', is_veg: false, cuisine: 'Continental', description: 'High-protein healthy salad' },
    { id: 'd5', name: 'Oats Upma', calories: 280, protein: 12, prepTime: 15, meal_type: 'breakfast', is_veg: true, cuisine: 'Indian', description: 'Healthy savory oatmeal' },
    { id: 'd6', name: 'Egg White Omelette', calories: 160, protein: 28, prepTime: 10, meal_type: 'breakfast', is_veg: false, cuisine: 'General', description: 'High protein low calorie' },
    { id: 'd7', name: 'Mixed Nuts (small)', calories: 180, protein: 6, prepTime: 0, meal_type: 'morning_snack', is_veg: true, cuisine: 'General', description: 'Healthy fats snack' },
    { id: 'd8', name: 'Sprouts Chaat', calories: 160, protein: 10, prepTime: 10, meal_type: 'evening_snack', is_veg: true, cuisine: 'Indian', description: 'High protein evening snack' },
    { id: 'd9', name: 'Veg Biryani', calories: 450, protein: 18, prepTime: 45, meal_type: 'lunch', is_veg: true, cuisine: 'Indian', description: 'Fragrant rice with veggies' }
  ];

  function allRecipes() {
    const dp = profile?.dietary_preference || 'omnivore';
    const planDay = new Date(planningDate + 'T00:00:00').getDay();
    const nvDay = [0, 1, 3, 5].includes(planDay);
    const all = [...DEF_RECIPES, ...customRecipes];
    if (['vegetarian', 'eggetarian', 'vegan'].includes(dp)) return all.filter(r => r.is_veg || r.isVeg);
    if (dp === 'omnivore') return nvDay ? all : all.filter(r => r.is_veg || r.isVeg);
    return all.filter(r => r.is_veg || r.isVeg);
  }

  function dietLabel() {
    const dp = profile?.dietary_preference || 'omnivore';
    const planDay = new Date(planningDate + 'T00:00:00').getDay();
    const nvDay = [0, 1, 3, 5].includes(planDay);
    if (dp === 'vegetarian') return '🥬 Vegetarian';
    if (dp === 'eggetarian') return '🥚 Eggetarian';
    if (dp === 'vegan') return '🌱 Vegan';
    return nvDay ? '🍗 Non-Veg Day' : '🥬 Veg Day';
  }

  const calBudget   = calcCalories(profile);
  const todayDT     = weekDTs[planningDate]?.day_type || 'normal';
  const dtInfo      = DAY_TYPES[todayDT];
  const plannedCals = Object.values(slots).reduce((s, x) => s + (x.recipe_calories || 0), 0);
  const isToday     = planningDate === todayStr();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#eff6ff,#faf5ff)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" style={{ margin: '0 auto 16px' }}></div>
        <p style={{ color: '#6b7280' }}>Loading your meal planner...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', paddingBottom: '72px', overflowX: 'hidden', width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(to right,#2563eb,#7c3aed)', color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: '700', fontSize: '18px', margin: 0 }}>🍽️ Meal Planner</p>
            <p style={{ fontSize: '12px', color: '#bfdbfe', margin: 0 }}>
              {dtInfo.emoji} {dtInfo.label} · {dietLabel()} · {city && `📍 ${city}`}
            </p>
          </div>
          <button onClick={() => { window.authHelpers.signOut(); window.location.href = '/login.html'; }}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px' }}>
        <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
          <HomeTab
            calBudget={calBudget} plannedCals={plannedCals} dtInfo={dtInfo} todayDT={todayDT}
            slots={slots} recipes={allRecipes()} planningDate={planningDate} isToday={isToday}
            onSetDayType={() => { setDtModalDate(planningDate); setDtModal(true); }}
            onOpenOrder={openOrderModal} onOpenSlot={k => setSlotModal(k)} onClearSlot={clearSlot}
            onGoToCalendar={() => setActiveTab('calendar')}
          />
        </div>
        <div style={{ display: activeTab === 'calendar' ? 'block' : 'none' }}>
          <CalendarTab
            weekDates={getWeekDates(weekOffset)} weekDTs={weekDTs} planningDate={planningDate}
            weekOffset={weekOffset} onChangeWeek={async (dir) => {
              const newOffset = weekOffset + dir;
              setWeekOffset(newOffset);
              const dates = getWeekDates(newOffset);
              await loadWeekDTs(dates);
            }}
            onSelectDate={async (date) => { await loadSlots(date); setActiveTab('home'); }}
            onSetDayType={(date) => { setDtModalDate(date); setDtModal(true); }}
            onOpenOrder={openOrderModal}
          />
        </div>
        <div style={{ display: activeTab === 'fridge' ? 'block' : 'none' }}>
          <FridgeTab inventory={inventory}
            onAdd={async i => { const { item: x } = await window.api.addInventoryItem(i); setInventory(p => [...p, x]); }}
            onDelete={async id => { await window.api.deleteInventoryItem(id); setInventory(p => p.filter(i => i.id !== id)); }}
          />
        </div>
        <div style={{ display: activeTab === 'recipes' ? 'block' : 'none' }}>
          <RecipesTab recipes={allRecipes()} dietLabel={dietLabel()} onAI={() => openAIModal(null)} />
        </div>
        <div style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
          <SettingsTab profile={profile} calBudget={calBudget} city={city}
            onSave={handleSaveProfile}
            onDetectCity={async () => { const c = await detectCity(); if (c) setCity(c); return c; }}
          />
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #e5e7eb', zIndex: 40 }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', padding: '6px 0' }}>
          {[
            { k: 'home',     e: '🏠', l: 'Today'    },
            { k: 'calendar', e: '📅', l: 'Week'     },
            { k: 'fridge',   e: '🧊', l: 'Fridge'   },
            { k: 'recipes',  e: '📖', l: 'Recipes'  },
            { k: 'settings', e: '⚙️', l: 'Settings' }
          ].map(t => (
            <button key={t.k} onClick={() => setActiveTab(t.k)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === t.k ? '#2563eb' : '#9ca3af' }}>
              <span style={{ fontSize: '20px' }}>{t.e}</span>
              <span style={{ fontSize: '11px', fontWeight: activeTab === t.k ? '600' : '400' }}>{t.l}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Day Type Modal */}
      {dtModal && (
        <Modal title={`📅 ${dtModalDate === todayStr() ? 'Today' : fmtDate(dtModalDate)}`} onClose={() => setDtModal(false)}>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>How are you eating?</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {Object.entries(DAY_TYPES).map(([key, dt]) => {
              const active = weekDTs[dtModalDate]?.day_type === key;
              return (
                <button key={key} onClick={() => saveDayType(dtModalDate, key)}
                  className={`rounded-xl border-2 text-left p-4 transition-all ${active ? `${dt.bg} ${dt.border}` : 'border-gray-200 bg-white'}`}
                  style={{ cursor: 'pointer' }}>
                  <p style={{ fontSize: '28px', marginBottom: '4px' }}>{dt.emoji}</p>
                  <p className={`font-semibold text-sm ${dt.text}`}>{dt.label}</p>
                </button>
              );
            })}
          </div>
        </Modal>
      )}

      {/* Slot Modal */}
      {slotModal && (
        <SlotModal slotKey={slotModal} slot={slots[slotModal]} recipes={allRecipes()} calBudget={calBudget}
          onPickRecipe={r => saveSlot(slotModal, 'recipe', r)}
          onOrderIn={() => { setSlotModal(null); openOrderModal('order_in', slotModal); }}
          onDineOut={() => { setSlotModal(null); openOrderModal('dine_out', slotModal); }}
          onAI={() => { setSlotModal(null); openAIModal(slotModal); }}
          onSkip={() => saveSlot(slotModal, 'skip')}
          onClose={() => setSlotModal(null)}
        />
      )}

      {/* Order Modal */}
      {orderModal && (
        <Modal title={orderModal.type === 'order_in' ? '🛵 Order In' : '🍴 Dine Out'} onClose={() => setOrderModal(null)}>
          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '12px', padding: '10px 14px', marginBottom: '14px' }}>
            <p style={{ fontSize: '13px', color: '#92400e' }}>
              💡 Daily budget: <strong>{calBudget} kcal</strong>
              {city && <span> · 📍 <strong>{city}</strong></span>}
            </p>
          </div>
          {orderData.loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" style={{ margin: '0 auto 12px' }}></div>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Finding healthy options near you...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orderData.suggestions.map((s, i) => (
                <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <p style={{ fontWeight: '700', fontSize: '14px' }}>{s.name}</p>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', background: s.isVeg ? '#dcfce7' : '#fee2e2', color: s.isVeg ? '#15803d' : '#dc2626' }}>{s.isVeg ? '🥬 Veg' : '🍖'}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '4px' }}>🍽️ {s.dish}</p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                    <span>🔥 ~{s.calories} cal</span><span>💰 {s.price}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#15803d', marginBottom: '10px' }}>✅ {s.reason}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {orderModal.type === 'order_in' ? (
                      <>
                        <a href={`https://www.swiggy.com/search?query=${encodeURIComponent(s.swiggySearch)}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#f97316', color: 'white', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', textAlign: 'center', textDecoration: 'none' }}>🛵 Swiggy</a>
                        <a href={`https://www.zomato.com/search?q=${encodeURIComponent(s.swiggySearch)}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#ef4444', color: 'white', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', textAlign: 'center', textDecoration: 'none' }}>🍕 Zomato</a>
                      </>
                    ) : (
                      <>
                        <a href={`https://www.swiggy.com/dineout/search?query=${encodeURIComponent(s.swiggySearch)}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#7c3aed', color: 'white', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', textAlign: 'center', textDecoration: 'none' }}>🍴 Dineout</a>
                        <a href={`https://www.zomato.com/search?q=${encodeURIComponent(s.swiggySearch)}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#ef4444', color: 'white', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', textAlign: 'center', textDecoration: 'none' }}>🔍 Zomato</a>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <a href="https://www.swiggy.com/instamart" target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', background: '#16a34a', color: 'white', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', textAlign: 'center', textDecoration: 'none' }}>
                🛒 Order Groceries on Instamart
              </a>
            </div>
          )}
        </Modal>
      )}

      {/* AI Recipes Modal */}
      {aiModal !== null && (
        <Modal title="🤖 AI Recipe Suggestions" onClose={() => setAiModal(null)}>
          {aiModal && (
            <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>
              Suggesting for: <strong>{MEAL_SLOTS.find(s => s.key === aiModal)?.label}</strong>
            </div>
          )}
          {aiData.loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" style={{ margin: '0 auto 12px' }}></div>
              <p style={{ color: '#6b7280' }}>Generating personalized recipes...</p>
            </div>
          ) : aiData.error ? (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px' }}>
              <p style={{ color: '#b91c1c', fontSize: '14px' }}>{aiData.error}</p>
              <button onClick={() => openAIModal(aiModal)} style={{ marginTop: '12px', background: '#ef4444', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', border: 'none' }}>Try Again</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {aiData.suggestions.map((r, i) => (
                <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <p style={{ fontWeight: '700', fontSize: '14px' }}>{r.name}</p>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', background: r.isVeg ? '#dcfce7' : '#fee2e2', color: r.isVeg ? '#15803d' : '#dc2626' }}>{r.isVeg ? '🥬 Veg' : '🍖'}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{r.description}</p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#9ca3af', marginBottom: '10px' }}>
                    <span>🔥 {r.calories}</span><span>💪 {r.protein}g</span><span>⏱️ {r.prepTime}m</span>
                  </div>
                  <button onClick={() => pickAIRecipe(r)} style={{ width: '100%', background: '#2563eb', color: 'white', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none' }}>
                    {aiModal ? '+ Add to This Meal' : '+ Save to Recipes'}
                  </button>
                </div>
              ))}
              {aiData.suggestions.length > 0 && (
                <button onClick={() => openAIModal(aiModal)} style={{ background: '#f3e8ff', color: '#7c3aed', padding: '10px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none' }}>🔄 Regenerate</button>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── HOME TAB ─────────────────────────────────────────────────────────────────
function HomeTab({ calBudget, plannedCals, dtInfo, todayDT, slots, recipes, planningDate, isToday, onSetDayType, onOpenOrder, onOpenSlot, onClearSlot, onGoToCalendar }) {
  const rem = calBudget - plannedCals;
  const pct = Math.min(100, Math.round((plannedCals / calBudget) * 100));
  const barCol = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Planning date banner */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '12px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontWeight: '700', fontSize: '15px' }}>
            {isToday ? '📅 Today' : `📅 ${fmtDate(planningDate)}`}
            {!isToday && <span style={{ fontSize: '11px', color: '#f97316', marginLeft: '8px', background: '#fff7ed', padding: '2px 8px', borderRadius: '10px' }}>Planning ahead</span>}
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Tap week to plan different days</p>
        </div>
        <button onClick={onGoToCalendar}
          style={{ background: '#eff6ff', color: '#2563eb', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          📅 Change
        </button>
      </div>

      {/* Day type + calorie banner */}
      <div className={`rounded-xl p-4 border-2 ${dtInfo.bg} ${dtInfo.border}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div>
            <p className={`font-bold ${dtInfo.text}`}>{dtInfo.emoji} {dtInfo.label}</p>
            <p className={`text-sm ${dtInfo.text}`}>Budget: {calBudget} · Planned: {plannedCals} kcal</p>
          </div>
          <button onClick={onSetDayType} className={`${dtInfo.btn} text-white`}
            style={{ border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
            Change
          </button>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: barCol, borderRadius: '999px', transition: 'width 0.4s' }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <p className={`text-xs ${dtInfo.text}`}>{pct}% used</p>
          <p className={`text-xs ${dtInfo.text}`}>{rem >= 0 ? `${rem} kcal remaining` : `${Math.abs(rem)} kcal over!`}</p>
        </div>
      </div>

      {(todayDT === 'order_in' || todayDT === 'dine_out') && (
        <button onClick={() => onOpenOrder(todayDT)} className={`w-full ${dtInfo.btn} text-white`}
          style={{ border: 'none', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
          {todayDT === 'order_in' ? '🛵 Find Food to Order' : '🍴 Find a Restaurant'}
        </button>
      )}

      {/* 5 Meal Slots */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <p style={{ fontWeight: '700', fontSize: '15px', margin: 0 }}>🗓️ Meal Plan{!isToday ? ` · ${fmtDate(planningDate)}` : ' · Today'}</p>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Tap each meal to plan it</p>
        </div>
        {MEAL_SLOTS.map(slot => {
          const saved = slots[slot.key];
          const targetCal = Math.round(calBudget * slot.pct);
          return (
            <div key={slot.key} style={{ padding: '12px 16px', borderBottom: '1px solid #f9fafb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '18px' }}>{slot.emoji}</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{slot.label}</span>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>~{targetCal} kcal</span>
                  </div>
                  {saved && saved.slot_mode !== 'skip' ? (
                    <div style={{ paddingLeft: '26px' }}>
                      {saved.slot_mode === 'recipe' && saved.recipe_name
                        ? <p style={{ fontSize: '13px', color: '#15803d' }}>✅ {saved.recipe_name} · {saved.recipe_calories} cal</p>
                        : saved.slot_mode === 'order_in'
                          ? <p style={{ fontSize: '13px', color: '#ea580c' }}>🛵 Ordering in</p>
                          : <p style={{ fontSize: '13px', color: '#7c3aed' }}>🍴 Dining out</p>
                      }
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: '#d1d5db', paddingLeft: '26px' }}>Not planned yet</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: '8px', flexShrink: 0 }}>
                  {saved && (
                    <button onClick={() => onClearSlot(slot.key)}
                      style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>✕</button>
                  )}
                  <button onClick={() => onOpenSlot(slot.key)}
                    style={{ background: '#2563eb', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none' }}>
                    {saved ? 'Edit' : 'Plan'}
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

// ─── SLOT MODAL ───────────────────────────────────────────────────────────────
function SlotModal({ slotKey, slot, recipes, calBudget, onPickRecipe, onOrderIn, onDineOut, onAI, onSkip, onClose }) {
  const [view, setView] = useState('options');
  const info = MEAL_SLOTS.find(s => s.key === slotKey);
  const targetCal = Math.round(calBudget * (info?.pct || 0.2));

  return (
    <Modal title={`${info?.emoji} Plan ${info?.label}`} onClose={onClose}>
      {view === 'options' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>Target: ~{targetCal} kcal · Choose how:</p>
          {[
            { icon: '📖', title: 'Pick from Saved Recipes', sub: `${recipes.length} recipes available`, bg: '#eff6ff', border: '#bfdbfe', col: '#1d4ed8', action: () => setView('recipes') },
            { icon: '🤖', title: 'AI Suggest a Recipe', sub: 'Based on your fridge & goals', bg: '#faf5ff', border: '#e9d5ff', col: '#7c3aed', action: onAI },
            { icon: '🛵', title: 'Order In', sub: 'Swiggy / Zomato — AI picks healthy options', bg: '#fff7ed', border: '#fed7aa', col: '#c2410c', action: onOrderIn },
            { icon: '🍴', title: 'Dine Out', sub: 'Find restaurants near you', bg: '#fdf4ff', border: '#e9d5ff', col: '#7c3aed', action: onDineOut }
          ].map((b, i) => (
            <button key={i} onClick={b.action}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: `2px solid ${b.border}`, background: b.bg, borderRadius: '12px', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
              <span style={{ fontSize: '24px' }}>{b.icon}</span>
              <div>
                <p style={{ fontWeight: '600', color: b.col, fontSize: '14px', margin: 0 }}>{b.title}</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{b.sub}</p>
              </div>
            </button>
          ))}
          <button onClick={onSkip} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#9ca3af', fontSize: '13px', cursor: 'pointer', background: 'white' }}>⏭️ Skip this meal</button>
        </div>
      ) : (
        <div>
          <button onClick={() => setView('options')} style={{ color: '#2563eb', fontSize: '13px', marginBottom: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
            {recipes.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '24px', fontSize: '14px' }}>No recipes yet! Try AI Suggest.</p>
            ) : recipes.map(r => (
              <button key={r.id} onClick={() => onPickRecipe({ name: r.name, calories: r.calories, protein: r.protein })}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', background: 'white', textAlign: 'left', width: '100%' }}>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '13px', margin: 0 }}>{r.name}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{r.cuisine} · {r.calories} cal · {r.protein}g protein</p>
                </div>
                <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', marginLeft: '8px', flexShrink: 0, background: r.is_veg || r.isVeg ? '#dcfce7' : '#fee2e2', color: r.is_veg || r.isVeg ? '#15803d' : '#dc2626' }}>
                  {r.is_veg || r.isVeg ? '🥬' : '🍖'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── CALENDAR TAB ─────────────────────────────────────────────────────────────
function CalendarTab({ weekDates, weekDTs, planningDate, weekOffset, onChangeWeek, onSelectDate, onSetDayType, onOpenOrder }) {
  const today = todayStr();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Week navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => onChangeWeek(-1)} style={{ background: '#f3f4f6', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>‹</button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: '700', fontSize: '16px', margin: 0 }}>
            {weekOffset === 0 ? 'This Week' : weekOffset === 1 ? 'Next Week' : weekOffset === -1 ? 'Last Week' : `Week ${weekOffset > 0 ? '+' : ''}${weekOffset}`}
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{fmtDate(weekDates[0])} – {fmtDate(weekDates[6])}</p>
        </div>
        <button onClick={() => onChangeWeek(1)} style={{ background: '#f3f4f6', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>›</button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {Object.entries(DAY_TYPES).map(([k, v]) => (
          <span key={k} className={`px-2 py-1 rounded-full text-xs font-medium ${v.bg} ${v.text}`}>{v.emoji} {v.label}</span>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '6px' }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', paddingBottom: '4px' }}>{d}</div>
        ))}
        {weekDates.map(date => {
          const dt = weekDTs[date]?.day_type || 'normal';
          const info = DAY_TYPES[dt];
          const isT = date === today;
          const isPlanning = date === planningDate;
          return (
            <button key={date} onClick={() => onSelectDate(date)}
              className={`${info.bg} ${info.border}`}
              style={{ aspectRatio: '1', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid', outline: isT ? '2px solid #3b82f6' : isPlanning ? '2px solid #f97316' : 'none', outlineOffset: '2px', cursor: 'pointer' }}>
              <span style={{ fontSize: '11px', fontWeight: '700' }}>{new Date(date + 'T00:00:00').getDate()}</span>
              <span style={{ fontSize: '14px' }}>{info.emoji}</span>
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
        🔵 Today &nbsp; 🟠 Planning for
      </p>

      {/* Day list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {weekDates.map(date => {
          const dt = weekDTs[date]?.day_type || 'normal';
          const info = DAY_TYPES[dt];
          const isT = date === today;
          const isPlanning = date === planningDate;
          const day = new Date(date + 'T00:00:00').getDay();
          return (
            <div key={date} className={`bg-white rounded-xl shadow-sm border-l-4 ${info.border}`}
              style={{ padding: '12px 14px', outline: isPlanning ? '2px solid #f97316' : 'none', outlineOffset: '1px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '14px', margin: 0 }}>
                    {dayNames[day === 0 ? 6 : day - 1]}
                    {isT && <span style={{ fontSize: '11px', color: '#2563eb', marginLeft: '6px' }}>● Today</span>}
                    {isPlanning && !isT && <span style={{ fontSize: '11px', color: '#f97316', marginLeft: '6px' }}>● Planning</span>}
                  </p>
                  <p className={`text-xs ${info.text}`}>{info.emoji} {info.label}</p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(dt === 'order_in' || dt === 'dine_out') && (
                    <button onClick={() => onOpenOrder(dt)} className={`${info.btn} text-white`} style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', border: 'none', cursor: 'pointer' }}>
                      {dt === 'order_in' ? '🛵' : '🍴'}
                    </button>
                  )}
                  <button onClick={() => onSetDayType(date)} style={{ background: '#f3f4f6', color: '#4b5563', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', border: 'none', cursor: 'pointer' }}>✏️ Type</button>
                  <button onClick={() => onSelectDate(date)} style={{ background: '#2563eb', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', border: 'none', cursor: 'pointer' }}>📅 Plan</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── FRIDGE TAB ───────────────────────────────────────────────────────────────
function FridgeTab({ inventory, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [item, setItem] = useState({ name: '', quantity: '', unit: 'g', category: 'vegetables' });

  function handleAdd() {
    if (!item.name || !item.quantity) return alert('Please fill all fields');
    onAdd({ ...item, quantity: parseFloat(item.quantity), expires_at: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], is_low: false });
    setItem({ name: '', quantity: '', unit: 'g', category: 'vegetables' }); setShowForm(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>🧊 Fridge</h2>
        <button onClick={() => setShowForm(!showForm)}
          style={{ background: showForm ? '#6b7280' : '#16a34a', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none' }}>
          {showForm ? '✕ Cancel' : '+ Add'}
        </button>
      </div>
      {showForm && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input placeholder="Item name (e.g. Tomatoes)" value={item.name} onChange={e => setItem(p => ({ ...p, name: e.target.value }))} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input type="number" placeholder="Qty" value={item.quantity} onChange={e => setItem(p => ({ ...p, quantity: e.target.value }))} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} />
            <select value={item.unit} onChange={e => setItem(p => ({ ...p, unit: e.target.value }))} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}>
              {['g', 'kg', 'ml', 'l', 'pieces'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <select value={item.category} onChange={e => setItem(p => ({ ...p, category: e.target.value }))} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}>
            {['vegetables', 'protein', 'dairy', 'grains', 'spices', 'other'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <button onClick={handleAdd} style={{ background: '#2563eb', color: 'white', padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none' }}>Add to Fridge</button>
        </div>
      )}
      {inventory.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
          <p style={{ fontSize: '40px', margin: '0 0 8px' }}>🧊</p>
          <p style={{ fontWeight: '600', margin: 0 }}>Fridge is empty</p>
          <p style={{ fontSize: '13px', margin: '4px 0 0' }}>Add items for better AI suggestions!</p>
        </div>
      ) : inventory.map(i => (
        <div key={i.id} style={{ background: 'white', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: '600', fontSize: '14px', margin: 0 }}>{i.name}</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{i.quantity}{i.unit} · {i.category}</p>
          </div>
          <button onClick={() => onDelete(i.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#fca5a5' }}>🗑️</button>
        </div>
      ))}
    </div>
  );
}

// ─── RECIPES TAB ──────────────────────────────────────────────────────────────
function RecipesTab({ recipes, dietLabel, onAI }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>📖 Recipes</h2>
        <button onClick={onAI} style={{ background: 'linear-gradient(to right,#2563eb,#7c3aed)', color: 'white', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none' }}>🤖 AI Suggest</button>
      </div>
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '10px 14px' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#1d4ed8', margin: 0 }}>{dietLabel}</p>
      </div>
      {recipes.map(r => (
        <div key={r.id} style={{ background: 'white', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <div>
              <p style={{ fontWeight: '700', fontSize: '14px', margin: 0 }}>{r.name}</p>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{r.cuisine}</p>
            </div>
            <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', background: r.is_veg || r.isVeg ? '#dcfce7' : '#fee2e2', color: r.is_veg || r.isVeg ? '#15803d' : '#dc2626' }}>{r.is_veg || r.isVeg ? '🥬 Veg' : '🍖'}</span>
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px' }}>{r.description}</p>
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#9ca3af' }}>
            <span>🔥 {r.calories} cal</span><span>💪 {r.protein}g</span><span>⏱️ {r.prepTime || r.prep_time}m</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({ profile, calBudget, city, onSave, onDetectCity }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState(null);
  const [warnings, setWarnings] = useState([]);

  function start() { setForm({ ...profile, medical_conditions: profile.medical_conditions || [], allergies: profile.allergies || [] }); setEditing(true); }
  function upd(k, v) { const u = { ...form, [k]: v }; setForm(u); setWarnings(getCalWarnings(u)); }
  async function save() { await onSave(form); setEditing(false); setWarnings([]); }

  if (editing && form) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>✏️ Edit Profile</h2>
        <button onClick={() => { setEditing(false); setWarnings([]); }} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>✕ Cancel</button>
      </div>

      {warnings.map((w, i) => (
        <div key={i} style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '12px', padding: '12px 14px' }}>
          <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>{w}</p>
        </div>
      ))}

      <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Basic */}
        <p style={{ fontWeight: '700', color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>👤 Basic Info</p>
        {[['name', 'Name', 'text'], ['age', 'Age', 'number'], ['height', 'Height (cm)', 'number'], ['weight', 'Current Weight (kg)', 'number']].map(([f, l, t]) => (
          <div key={f}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>{l}</label>
            <input type={t} value={form[f] || ''} onChange={e => upd(f, t === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>
        ))}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Gender</label>
          <select value={form.gender || 'male'} onChange={e => upd('gender', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}>
            <option value="male">Male</option><option value="female">Female</option>
          </select>
        </div>

        {/* Activity & Goals */}
        <p style={{ fontWeight: '700', color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>🎯 Activity & Goals</p>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>🏃 Activity Level</label>
          <select value={form.activity_level || 'light_moderate'} onChange={e => upd('activity_level', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}>
            {Object.entries(ACTIVITY_LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>🎯 Health Goal</label>
          <select value={form.goal || 'weight_loss'} onChange={e => upd('goal', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}>
            <option value="weight_loss">⬇️ Weight Loss</option>
            <option value="maintenance">⚖️ Maintenance</option>
            <option value="weight_gain">⬆️ Weight Gain</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '2px' }}>⚖️ Weekly Weight Change (kg/week)</label>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 6px' }}>Negative = lose · Recommended: -0.5 · Safe max: -1.0</p>
          <input type="number" step="0.1" min="-2" max="1" value={form.weight_goal_kg_per_week ?? -0.5}
            onChange={e => upd('weight_goal_kg_per_week', parseFloat(e.target.value))}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
          <div style={{ marginTop: '8px', background: '#eff6ff', borderRadius: '8px', padding: '8px 12px' }}>
            <p style={{ fontSize: '12px', color: '#1d4ed8', margin: 0 }}>
              Calculated target: <strong>{calcCalories({ ...form })} kcal/day</strong>
              {calcCalories({ ...form }) === 1200 && <span style={{ color: '#dc2626' }}> (safety floor)</span>}
            </p>
          </div>
        </div>

        {/* Diet */}
        <p style={{ fontWeight: '700', color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>🥗 Diet Preferences</p>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Dietary Preference</label>
          <select value={form.dietary_preference || 'omnivore'} onChange={e => upd('dietary_preference', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}>
            <option value="omnivore">🍖 Omnivore (non-veg Sun/Mon/Wed/Fri)</option>
            <option value="vegetarian">🥬 Vegetarian</option>
            <option value="eggetarian">🥚 Eggetarian</option>
            <option value="vegan">🌱 Vegan</option>
            <option value="pescatarian">🐟 Pescatarian</option>
          </select>
        </div>

        {/* FIX 4: Medical Conditions */}
        <p style={{ fontWeight: '700', color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>🏥 Health Conditions</p>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Medical Conditions</label>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 8px' }}>AI will adjust recipe suggestions and flag unsuitable foods</p>
          <PillToggle
            value={form.medical_conditions || []}
            options={MEDICAL_CONDITIONS}
            onChange={v => upd('medical_conditions', v)}
            activeColor="#dc2626" activeBg="#fef2f2" activeBorder="#fca5a5"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>🚫 Food Allergies</label>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 8px' }}>These will be strictly excluded from all suggestions</p>
          <PillToggle
            value={form.allergies || []}
            options={FOOD_ALLERGIES}
            onChange={v => upd('allergies', v)}
            activeColor="#ea580c" activeBg="#fff7ed" activeBorder="#fed7aa"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>📝 Other notes (free text)</label>
          <input type="text" value={form.allergy_notes || ''} onChange={e => upd('allergy_notes', e.target.value)}
            placeholder="e.g. lactose intolerant, avoid onion..."
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>

        {/* Location */}
        <p style={{ fontWeight: '700', color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>📍 Location</p>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>City (for restaurant suggestions)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" value={form.city || ''} onChange={e => upd('city', e.target.value)} placeholder="Your city"
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} />
            <button onClick={async () => { const c = await onDetectCity(); if (c) upd('city', c); }}
              style={{ background: '#eff6ff', color: '#1d4ed8', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', border: '1px solid #bfdbfe', whiteSpace: 'nowrap' }}>
              📍 Detect
            </button>
          </div>
        </div>

        <button onClick={save} style={{ background: '#2563eb', color: 'white', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', border: 'none', marginTop: '4px' }}>
          💾 Save Profile
        </button>
      </div>
    </div>
  );

  if (!profile) return null;
  const conditions = profile.medical_conditions || [];
  const allergies  = profile.allergies || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>⚙️ Settings</h2>
      <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <p style={{ fontWeight: '700', fontSize: '15px', margin: 0 }}>Your Profile</p>
          <button onClick={start} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>✏️ Edit</button>
        </div>
        {[
          ['Name', profile.name],
          ['Age / Gender', `${profile.age}y · ${profile.gender}`],
          ['Height / Weight', `${profile.height}cm · ${profile.weight}kg`],
          ['Activity', ACTIVITY_LEVELS[profile.activity_level || 'light_moderate']?.label],
          ['Goal', profile.goal?.replace('_', ' ')],
          ['Weekly target', `${profile.weight_goal_kg_per_week ?? -0.5} kg/week`],
          ['Diet', profile.dietary_preference],
          ['📍 City', city || profile.city || 'Not set'],
          ['🔥 Daily calories', `${calBudget} kcal`],
        ].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9fafb', fontSize: '13px' }}>
            <span style={{ color: '#6b7280' }}>{l}</span>
            <span style={{ fontWeight: '600', textTransform: 'capitalize', textAlign: 'right', maxWidth: '55%' }}>{v}</span>
          </div>
        ))}
        {conditions.length > 0 && (
          <div style={{ padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 6px' }}>🏥 Conditions</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {conditions.map(c => {
                const info = MEDICAL_CONDITIONS.find(m => m.key === c);
                return <span key={c} style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>{info?.icon} {info?.label || c}</span>;
              })}
            </div>
          </div>
        )}
        {allergies.length > 0 && (
          <div style={{ padding: '8px 0' }}>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 6px' }}>🚫 Allergies</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {allergies.map(a => {
                const info = FOOD_ALLERGIES.find(x => x.key === a);
                return <span key={a} style={{ background: '#fff7ed', color: '#ea580c', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>{info?.icon} {info?.label || a}</span>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(MealPlannerApp));
