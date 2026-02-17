// Family Meal Planner v3 - overflow fix, 5-slot meal planner, GPS, calorie guardrails
const { useState, useEffect } = React;

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

const ACTIVITY_LEVELS = {
  sedentary: { label: 'Sedentary (desk job, no exercise)', factor: 1.2   },
  light:     { label: 'Light (1-3 days/week)',              factor: 1.375 },
  moderate:  { label: 'Moderate (yoga 6x/week)',            factor: 1.55  },
  active:    { label: 'Very Active (intense daily)',         factor: 1.725 }
};

function calcCalories(p) {
  if (!p?.weight || !p?.height || !p?.age) return 2000;
  const bmr = p.gender === 'female'
    ? 10*p.weight + 6.25*p.height - 5*p.age - 161
    : 10*p.weight + 6.25*p.height - 5*p.age + 5;
  const tdee = Math.round(bmr * (ACTIVITY_LEVELS[p.activity_level||'moderate'].factor));
  const adj  = Math.round((parseFloat(p.weight_goal_kg_per_week||-0.5) * 7700) / 7);
  return Math.max(1200, tdee + adj);
}

function getWarnings(p) {
  if (!p?.weight || !p?.height || !p?.age) return [];
  const bmr = p.gender === 'female'
    ? 10*p.weight + 6.25*p.height - 5*p.age - 161
    : 10*p.weight + 6.25*p.height - 5*p.age + 5;
  const tdee = Math.round(bmr * (ACTIVITY_LEVELS[p.activity_level||'moderate'].factor));
  const goal = parseFloat(p.weight_goal_kg_per_week||-0.5);
  const raw  = tdee + Math.round((goal*7700)/7);
  const w = [];
  if (raw < 1200) w.push(`⚠️ Target (${raw} kcal) is below 1200. Floor applied for safety.`);
  if (goal < -1)  w.push('⚠️ Losing >1 kg/week risks muscle loss and nutrient deficiencies.');
  if (goal < -0.5 && goal >= -1) w.push('💡 0.5 kg/week is the most sustainable weight-loss rate.');
  return w;
}

function todayStr() { return new Date().toISOString().split('T')[0]; }

function getWeekDates() {
  const t = new Date(), d = t.getDay();
  const mon = new Date(t); mon.setDate(t.getDate() - (d===0?6:d-1));
  return Array.from({length:7},(_,i)=>{ const x=new Date(mon); x.setDate(mon.getDate()+i); return x.toISOString().split('T')[0]; });
}

async function detectCity() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      async ({coords}) => {
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,{headers:{'Accept-Language':'en'}});
          const d = await r.json();
          resolve(d.address?.city || d.address?.town || d.address?.village || 'your city');
        } catch { resolve(null); }
      },
      () => resolve(null), {timeout:8000}
    );
  });
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
function Modal({title, onClose, children}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col" style={{maxHeight:'90vh'}}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        <div className="overflow-y-auto p-5 flex-1">{children}</div>
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
function MealPlannerApp() {
  const [loading, setLoading]         = useState(true);
  const [profile, setProfile]         = useState(null);
  const [inventory, setInventory]     = useState([]);
  const [recipes, setRecipes]         = useState([]);
  const [weekDTs, setWeekDTs]         = useState({});
  const [slots, setSlots]             = useState({});
  const [activeTab, setActiveTab]     = useState('home');
  const [selDate, setSelDate]         = useState(todayStr());
  const [city, setCity]               = useState('');

  // modals
  const [dtModal, setDtModal]         = useState(false);
  const [slotModal, setSlotModal]     = useState(null);
  const [orderModal, setOrderModal]   = useState(null); // {type, slotKey}
  const [orderData, setOrderData]     = useState({suggestions:[], loading:false});
  const [aiModal, setAiModal]         = useState(null); // slotKey or null
  const [aiData, setAiData]           = useState({suggestions:[], loading:false, error:null});

  useEffect(()=>{ initApp(); },[]);

  async function initApp() {
    try {
      const u = await window.authHelpers.getUser();
      if (!u) { window.location.href='/login.html'; return; }
      const [pd,inv,rec] = await Promise.all([window.api.getProfile(), window.api.getInventory(), window.api.getRecipes()]);
      setProfile(pd.profile);
      setInventory(inv.items||[]);
      setRecipes(rec.recipes||[]);
      if (pd.profile?.city) setCity(pd.profile.city);
      await Promise.all([loadWeekDTs(), loadSlots()]);
      setLoading(false);
    } catch(e) { window.location.href='/login.html'; }
  }

  async function loadWeekDTs() {
    const dates = getWeekDates();
    const h = await window.api.getAuthHeader();
    const r = await fetch(`/api/day-types?startDate=${dates[0]}&endDate=${dates[6]}`,{headers:{...h,'Content-Type':'application/json'}});
    const {dayTypes} = await r.json();
    const m={}; (dayTypes||[]).forEach(d=>{ m[d.date]=d; }); setWeekDTs(m);
  }

  async function loadSlots() {
    const h = await window.api.getAuthHeader();
    const r = await fetch(`/api/meal-slots?date=${todayStr()}`,{headers:{...h,'Content-Type':'application/json'}});
    const {slots:s} = await r.json();
    const m={}; (s||[]).forEach(x=>{ m[x.slot_type]=x; }); setSlots(m);
  }

  async function saveDayType(date, day_type) {
    const h = await window.api.getAuthHeader();
    const r = await fetch('/api/day-types',{method:'POST',headers:{...h,'Content-Type':'application/json'},body:JSON.stringify({date,day_type})});
    const {dayType} = await r.json();
    setWeekDTs(p=>({...p,[date]:dayType}));
    setDtModal(false);
  }

  async function saveSlot(slotKey, mode, recipe=null) {
    const h = await window.api.getAuthHeader();
    const r = await fetch('/api/meal-slots',{method:'POST',headers:{...h,'Content-Type':'application/json'},body:JSON.stringify({date:todayStr(),slot_type:slotKey,slot_mode:mode,recipe_name:recipe?.name||null,recipe_calories:recipe?.calories||null,recipe_protein:recipe?.protein||null})});
    const {slot} = await r.json();
    setSlots(p=>({...p,[slotKey]:slot}));
    setSlotModal(null);
  }

  async function clearSlot(slotKey) {
    const h = await window.api.getAuthHeader();
    await fetch(`/api/meal-slots?date=${todayStr()}&slot_type=${slotKey}`,{method:'DELETE',headers:{...h,'Content-Type':'application/json'}});
    setSlots(p=>{ const n={...p}; delete n[slotKey]; return n; });
  }

  async function openOrderModal(type, slotKey=null) {
    setOrderModal({type, slotKey});
    setOrderData({suggestions:[], loading:true});
    let currentCity = city;
    if (!currentCity) { currentCity = await detectCity()||'Hyderabad'; setCity(currentCity); }
    const dp = profile?.dietary_preference||'omnivore';
    const budget = calcCalories(profile);
    const slot = MEAL_SLOTS.find(s=>s.key===slotKey);
    const mealCal = slotKey ? Math.round(budget*(slot?.pct||0.3)) : Math.round(budget/3);
    const prompt = `Suggest 4 ${type==='order_in'?'Swiggy/Zomato food delivery':'dineout restaurant'} options in ${currentCity}, India. User: ${dp} diet, ~${mealCal} cal per meal. STRICTLY follow: ${dp}. JSON only: {"suggestions":[{"name":"str","cuisine":"str","dish":"str","calories":400,"isVeg":true,"price":"₹200-350","reason":"str","swiggySearch":"str"}]}`;
    try {
      const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':window._gKey||''},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})});
      if (resp.ok) {
        const d = await resp.json();
        const text = d.candidates?.[0]?.content?.parts?.[0]?.text||'';
        const clean = text.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
        setOrderData({suggestions:JSON.parse(clean).suggestions||[], loading:false});
      } else throw new Error();
    } catch(e) {
      const veg = ['vegetarian','vegan','eggetarian'].includes(profile?.dietary_preference);
      setOrderData({loading:false, suggestions: veg ? [
        {name:'Saravanaa Bhavan',cuisine:'South Indian',dish:'Masala Dosa',calories:380,isVeg:true,price:'₹120-180',reason:'High-protein veg',swiggySearch:'saravanaa bhavan'},
        {name:'Chutneys',cuisine:'South Indian',dish:'Pesarattu',calories:350,isVeg:true,price:'₹150-220',reason:'Light & nutritious',swiggySearch:'chutneys restaurant'},
        {name:'Eat Fit',cuisine:'Healthy',dish:'Paneer Bowl',calories:420,isVeg:true,price:'₹250-350',reason:'Calorie-tracked',swiggySearch:'eat fit healthy'},
        {name:'Govindas',cuisine:'Veg Thali',dish:'Full Thali',calories:450,isVeg:true,price:'₹100-150',reason:'Balanced meal',swiggySearch:'govindas'}
      ] : [
        {name:'Paradise',cuisine:'Hyderabadi',dish:'Chicken Biryani',calories:520,isVeg:false,price:'₹250-350',reason:'Protein-rich',swiggySearch:'paradise biryani'},
        {name:'Eat Fit',cuisine:'Healthy',dish:'Grilled Chicken Bowl',calories:380,isVeg:false,price:'₹280-380',reason:'Calorie-tracked',swiggySearch:'eat fit chicken'},
        {name:'Barbeque Nation',cuisine:'BBQ',dish:'Grilled Chicken',calories:450,isVeg:false,price:'₹400-600',reason:'Grilled = healthier',swiggySearch:'barbeque nation'},
        {name:'Absolute Barbecues',cuisine:'Grill',dish:'Fish Tikka',calories:400,isVeg:false,price:'₹350-500',reason:'Lean protein',swiggySearch:'absolute barbecues'}
      ]});
    }
  }

  async function openAIModal(slotKey=null) {
    setAiModal(slotKey);
    setAiData({suggestions:[],loading:true,error:null});
    try {
      const result = await window.api.generateRecipes(null, inventory);
      if (!result.success) throw new Error(result.error);
      setAiData({suggestions:result.recipes, loading:false, error:null});
    } catch(e) { setAiData({suggestions:[],loading:false,error:e.message}); }
  }

  async function pickAIRecipe(recipe) {
    if (aiModal) {
      await saveSlot(aiModal, 'recipe', {name:recipe.name, calories:recipe.calories, protein:recipe.protein});
    } else {
      await window.api.createRecipe({name:recipe.name,calories:recipe.calories,protein:recipe.protein,prep_time:recipe.prepTime,is_veg:recipe.isVeg,cuisine:recipe.cuisine,description:recipe.description,meal_type:recipe.mealType});
      setRecipes(p=>[...p,{...recipe,id:'r'+Date.now()}]);
      alert('Added to recipes!');
    }
    setAiModal(null);
  }

  async function handleSaveProfile(updated) {
    const {profile:p} = await window.api.updateProfile(updated);
    setProfile(p); if(p.city) setCity(p.city);
  }

  const DEF_RECIPES = [
    {id:'d1',name:'Palak Paneer',calories:380,protein:28,prepTime:25,meal_type:'lunch',is_veg:true,cuisine:'Indian',description:'Spinach & cottage cheese curry'},
    {id:'d2',name:'Dal Tadka',calories:320,protein:22,prepTime:30,meal_type:'dinner',is_veg:true,cuisine:'Indian',description:'Lentil curry with tempering'},
    {id:'d3',name:'Butter Chicken',calories:520,protein:42,prepTime:40,meal_type:'dinner',is_veg:false,cuisine:'Indian',description:'Creamy tomato chicken curry'},
    {id:'d4',name:'Grilled Chicken Salad',calories:380,protein:45,prepTime:20,meal_type:'lunch',is_veg:false,cuisine:'Continental',description:'High-protein healthy salad'},
    {id:'d5',name:'Oats Upma',calories:280,protein:12,prepTime:15,meal_type:'breakfast',is_veg:true,cuisine:'Indian',description:'Healthy savory oatmeal'},
    {id:'d6',name:'Boiled Egg Whites',calories:140,protein:24,prepTime:10,meal_type:'morning_snack',is_veg:false,cuisine:'General',description:'High protein snack'},
    {id:'d7',name:'Mixed Nuts',calories:180,protein:6,prepTime:0,meal_type:'evening_snack',is_veg:true,cuisine:'General',description:'Healthy fats & protein'},
    {id:'d8',name:'Veg Biryani',calories:450,protein:18,prepTime:45,meal_type:'lunch',is_veg:true,cuisine:'Indian',description:'Fragrant rice with veggies'}
  ];

  function allRecipes() {
    const dp = profile?.dietary_preference||'omnivore';
    const nvDay = [0,1,3,5].includes(new Date().getDay());
    const all = [...DEF_RECIPES, ...recipes];
    if (['vegetarian','eggetarian','vegan'].includes(dp)) return all.filter(r=>r.is_veg||r.isVeg);
    if (dp==='omnivore') return nvDay ? all : all.filter(r=>r.is_veg||r.isVeg);
    return all.filter(r=>r.is_veg||r.isVeg);
  }

  function dietLabel() {
    const dp=profile?.dietary_preference||'omnivore', nvDay=[0,1,3,5].includes(new Date().getDay());
    if(dp==='vegetarian') return '🥬 Vegetarian';
    if(dp==='eggetarian') return '🥚 Eggetarian';
    if(dp==='vegan') return '🌱 Vegan';
    return nvDay ? '🍗 Non-Veg Day' : '🥬 Veg Day';
  }

  const calBudget   = calcCalories(profile);
  const todayDT     = weekDTs[todayStr()]?.day_type||'normal';
  const dtInfo      = DAY_TYPES[todayDT];
  const plannedCals = Object.values(slots).reduce((s,x)=>s+(x.recipe_calories||0),0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#f9fafb',paddingBottom:'72px',boxSizing:'border-box',overflowX:'hidden',width:'100%',maxWidth:'100vw'}}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div style={{maxWidth:'480px',margin:'0 auto',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <p className="font-bold text-lg">🍽️ Meal Planner</p>
            <p style={{fontSize:'12px',color:'#bfdbfe'}}>{dtInfo.emoji} {dtInfo.label} · {dietLabel()}</p>
          </div>
          <button onClick={()=>{ window.authHelpers.signOut(); window.location.href='/login.html'; }}
            style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',padding:'6px 12px',borderRadius:'8px',fontSize:'13px',cursor:'pointer'}}>
            Logout
          </button>
        </div>
      </div>

      <div style={{maxWidth:'480px',margin:'0 auto',padding:'16px'}}>
        <div style={{display:activeTab==='home'?'block':'none'}}>
          <HomeTab calBudget={calBudget} plannedCals={plannedCals} dtInfo={dtInfo} todayDT={todayDT}
            slots={slots} recipes={allRecipes()} onSetDayType={()=>{setSelDate(todayStr());setDtModal(true);}}
            onOpenOrder={openOrderModal} onOpenSlot={k=>setSlotModal(k)} onClearSlot={clearSlot} />
        </div>
        <div style={{display:activeTab==='calendar'?'block':'none'}}>
          <CalendarTab weekDates={getWeekDates()} weekDTs={weekDTs} selDate={selDate}
            onSelect={d=>{setSelDate(d);setDtModal(true);}} onOpenOrder={openOrderModal} />
        </div>
        <div style={{display:activeTab==='fridge'?'block':'none'}}>
          <FridgeTab inventory={inventory}
            onAdd={async i=>{ const {item:x}=await window.api.addInventoryItem(i); setInventory(p=>[...p,x]); }}
            onDelete={async id=>{ await window.api.deleteInventoryItem(id); setInventory(p=>p.filter(i=>i.id!==id)); }} />
        </div>
        <div style={{display:activeTab==='recipes'?'block':'none'}}>
          <RecipesTab recipes={allRecipes()} dietLabel={dietLabel()} onAI={()=>openAIModal(null)} />
        </div>
        <div style={{display:activeTab==='settings'?'block':'none'}}>
          <SettingsTab profile={profile} calBudget={calBudget} city={city}
            onSave={handleSaveProfile}
            onDetectCity={async()=>{ const c=await detectCity(); if(c) setCity(c); return c; }} />
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'white',borderTop:'1px solid #e5e7eb',zIndex:40}}>
        <div style={{maxWidth:'480px',margin:'0 auto',display:'flex',justifyContent:'space-around',padding:'8px 0'}}>
          {[{k:'home',e:'🏠',l:'Today'},{k:'calendar',e:'📅',l:'Week'},{k:'fridge',e:'🧊',l:'Fridge'},{k:'recipes',e:'📖',l:'Recipes'},{k:'settings',e:'⚙️',l:'Settings'}].map(t=>(
            <button key={t.k} onClick={()=>setActiveTab(t.k)}
              style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',padding:'4px 8px',background:'none',border:'none',cursor:'pointer',color:activeTab===t.k?'#2563eb':'#9ca3af'}}>
              <span style={{fontSize:'20px'}}>{t.e}</span>
              <span style={{fontSize:'11px'}}>{t.l}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Day Type Modal */}
      {dtModal && (
        <Modal title="📅 How are you eating?" onClose={()=>setDtModal(false)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
            {Object.entries(DAY_TYPES).map(([key,dt])=>(
              <button key={key} onClick={()=>saveDayType(selDate,key)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${weekDTs[selDate]?.day_type===key?`${dt.bg} ${dt.border}`:'border-gray-200 bg-white'}`}
                style={{cursor:'pointer'}}>
                <p style={{fontSize:'28px',marginBottom:'4px'}}>{dt.emoji}</p>
                <p className={`font-semibold text-sm ${dt.text}`}>{dt.label}</p>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Slot Modal */}
      {slotModal && (
        <SlotModal slotKey={slotModal} slot={slots[slotModal]} recipes={allRecipes()} calBudget={calBudget}
          onPickRecipe={r=>saveSlot(slotModal,'recipe',r)}
          onOrderIn={()=>{ setSlotModal(null); openOrderModal('order_in',slotModal); }}
          onDineOut={()=>{ setSlotModal(null); openOrderModal('dine_out',slotModal); }}
          onAI={()=>{ setSlotModal(null); openAIModal(slotModal); }}
          onSkip={()=>saveSlot(slotModal,'skip')}
          onClose={()=>setSlotModal(null)} />
      )}

      {/* Order Modal */}
      {orderModal && (
        <Modal title={orderModal.type==='order_in'?'🛵 Order In':'🍴 Dine Out'} onClose={()=>setOrderModal(null)}>
          <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="text-sm text-yellow-800">💡 Budget: {calBudget} kcal/day{city&&` · 📍 ${city}`}</p>
          </div>
          {orderData.loading ? (
            <div style={{textAlign:'center',padding:'32px'}}>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" style={{margin:'0 auto 12px'}}></div>
              <p style={{color:'#6b7280',fontSize:'14px'}}>Finding options near you...</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {orderData.suggestions.map((s,i)=>(
                <div key={i} className="border border-gray-200 rounded-xl p-4">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'4px'}}>
                    <p className="font-bold text-sm">{s.name}</p>
                    <span className={`px-2 py-0.5 rounded text-xs ${s.isVeg?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{s.isVeg?'🥬 Veg':'🍖'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">🍽️ {s.dish}</p>
                  <div style={{display:'flex',gap:'12px',fontSize:'12px',color:'#9ca3af',marginBottom:'8px'}}>
                    <span>🔥 ~{s.calories} cal</span><span>💰 {s.price}</span>
                  </div>
                  <p style={{fontSize:'12px',color:'#15803d',marginBottom:'10px'}}>✅ {s.reason}</p>
                  <div style={{display:'flex',gap:'8px'}}>
                    {orderModal.type==='order_in' ? (
                      <>
                        <a href={`https://www.swiggy.com/search?query=${encodeURIComponent(s.swiggySearch)}`} target="_blank" rel="noopener noreferrer" style={{flex:1,background:'#f97316',color:'white',padding:'8px',borderRadius:'8px',fontSize:'12px',fontWeight:'600',textAlign:'center',textDecoration:'none'}}>🛵 Swiggy</a>
                        <a href={`https://www.zomato.com/search?q=${encodeURIComponent(s.swiggySearch)}`} target="_blank" rel="noopener noreferrer" style={{flex:1,background:'#ef4444',color:'white',padding:'8px',borderRadius:'8px',fontSize:'12px',fontWeight:'600',textAlign:'center',textDecoration:'none'}}>🍕 Zomato</a>
                      </>
                    ) : (
                      <>
                        <a href={`https://www.swiggy.com/dineout/search?query=${encodeURIComponent(s.swiggySearch)}`} target="_blank" rel="noopener noreferrer" style={{flex:1,background:'#7c3aed',color:'white',padding:'8px',borderRadius:'8px',fontSize:'12px',fontWeight:'600',textAlign:'center',textDecoration:'none'}}>🍴 Dineout</a>
                        <a href={`https://www.zomato.com/search?q=${encodeURIComponent(s.swiggySearch)}`} target="_blank" rel="noopener noreferrer" style={{flex:1,background:'#ef4444',color:'white',padding:'8px',borderRadius:'8px',fontSize:'12px',fontWeight:'600',textAlign:'center',textDecoration:'none'}}>🔍 Zomato</a>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <a href="https://www.swiggy.com/instamart" target="_blank" rel="noopener noreferrer" style={{display:'block',background:'#16a34a',color:'white',padding:'12px',borderRadius:'12px',fontSize:'14px',fontWeight:'600',textAlign:'center',textDecoration:'none'}}>🛒 Order Groceries on Instamart</a>
            </div>
          )}
        </Modal>
      )}

      {/* AI Modal */}
      {aiModal !== null && (
        <Modal title="🤖 AI Recipe Suggestions" onClose={()=>setAiModal(null)}>
          {aiModal && <p style={{background:'#eff6ff',color:'#1d4ed8',padding:'8px 12px',borderRadius:'8px',fontSize:'13px',marginBottom:'12px'}}>For: <strong>{MEAL_SLOTS.find(s=>s.key===aiModal)?.label}</strong></p>}
          {aiData.loading ? (
            <div style={{textAlign:'center',padding:'40px'}}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" style={{margin:'0 auto 12px'}}></div>
              <p style={{color:'#6b7280'}}>Generating personalized recipes...</p>
            </div>
          ) : aiData.error ? (
            <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'12px',padding:'16px'}}>
              <p style={{color:'#b91c1c',fontSize:'14px'}}>{aiData.error}</p>
              <button onClick={()=>openAIModal(aiModal)} style={{marginTop:'12px',background:'#ef4444',color:'white',padding:'8px 16px',borderRadius:'8px',fontSize:'13px',cursor:'pointer',border:'none'}}>Try Again</button>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {aiData.suggestions.map((r,i)=>(
                <div key={i} className="border border-gray-200 rounded-xl p-4">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'4px'}}>
                    <p className="font-bold text-sm">{r.name}</p>
                    <span className={`px-2 py-0.5 rounded text-xs ${r.isVeg?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{r.isVeg?'🥬 Veg':'🍖'}</span>
                  </div>
                  <p style={{fontSize:'12px',color:'#6b7280',marginBottom:'8px'}}>{r.description}</p>
                  <div style={{display:'flex',gap:'12px',fontSize:'12px',color:'#9ca3af',marginBottom:'10px'}}>
                    <span>🔥 {r.calories}</span><span>💪 {r.protein}g</span><span>⏱️ {r.prepTime}m</span>
                  </div>
                  <button onClick={()=>pickAIRecipe(r)} style={{width:'100%',background:'#2563eb',color:'white',padding:'10px',borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer',border:'none'}}>
                    {aiModal?'+ Add to This Meal':'+ Save to Recipes'}
                  </button>
                </div>
              ))}
              {aiData.suggestions.length>0 && (
                <button onClick={()=>openAIModal(aiModal)} style={{width:'100%',background:'#f3e8ff',color:'#7c3aed',padding:'10px',borderRadius:'12px',fontSize:'13px',fontWeight:'600',cursor:'pointer',border:'none'}}>🔄 Regenerate</button>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── HOME TAB ─────────────────────────────────────────────────────────────────
function HomeTab({calBudget, plannedCals, dtInfo, todayDT, slots, recipes, onSetDayType, onOpenOrder, onOpenSlot, onClearSlot}) {
  const rem = calBudget - plannedCals;
  const pct = Math.min(100, Math.round((plannedCals/calBudget)*100));
  const barCol = pct>90?'#ef4444':pct>70?'#f59e0b':'#22c55e';
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      {/* Day banner */}
      <div className={`rounded-xl p-4 border-2 ${dtInfo.bg} ${dtInfo.border}`}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
          <div>
            <p className={`font-bold ${dtInfo.text}`}>{dtInfo.emoji} {dtInfo.label}</p>
            <p className={`text-sm ${dtInfo.text}`}>Budget: {calBudget} · Planned: {plannedCals} kcal</p>
          </div>
          <button onClick={onSetDayType} className={`${dtInfo.btn} text-white px-3 py-1.5 rounded-lg text-xs font-medium`} style={{cursor:'pointer'}}>Change</button>
        </div>
        <div style={{background:'rgba(255,255,255,0.5)',borderRadius:'999px',height:'10px',overflow:'hidden'}}>
          <div style={{width:`${pct}%`,height:'100%',background:barCol,borderRadius:'999px',transition:'width 0.3s'}}></div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:'4px'}}>
          <p className={`text-xs ${dtInfo.text}`}>{pct}% used</p>
          <p className={`text-xs ${dtInfo.text}`}>{rem>=0?`${rem} remaining`:`${Math.abs(rem)} over!`}</p>
        </div>
      </div>

      {(todayDT==='order_in'||todayDT==='dine_out') && (
        <button onClick={()=>onOpenOrder(todayDT)} className={`w-full ${dtInfo.btn} text-white py-3 rounded-xl font-medium`}>
          {todayDT==='order_in'?'🛵 Find Food to Order':'🍴 Find a Restaurant'}
        </button>
      )}

      {/* Meal slots */}
      <div style={{background:'white',borderRadius:'12px',overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
        <div style={{padding:'12px 16px',borderBottom:'1px solid #f3f4f6'}}>
          <p style={{fontWeight:'700',fontSize:'16px'}}>🗓️ Today's Meal Plan</p>
          <p style={{fontSize:'12px',color:'#9ca3af'}}>Tap to plan each meal</p>
        </div>
        {MEAL_SLOTS.map(slot=>{
          const saved = slots[slot.key];
          const targetCal = Math.round(calBudget*slot.pct);
          return (
            <div key={slot.key} style={{padding:'12px 16px',borderBottom:'1px solid #f9fafb'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                    <span style={{fontSize:'18px'}}>{slot.emoji}</span>
                    <span style={{fontWeight:'600',fontSize:'14px'}}>{slot.label}</span>
                    <span style={{fontSize:'11px',color:'#9ca3af'}}>~{targetCal} kcal</span>
                  </div>
                  {saved && saved.slot_mode!=='skip' ? (
                    <div style={{paddingLeft:'26px'}}>
                      {saved.slot_mode==='recipe' && saved.recipe_name ? (
                        <p style={{fontSize:'13px',color:'#15803d'}}>✅ {saved.recipe_name} · {saved.recipe_calories} cal</p>
                      ) : saved.slot_mode==='order_in' ? (
                        <p style={{fontSize:'13px',color:'#ea580c'}}>🛵 Ordering in</p>
                      ) : saved.slot_mode==='dine_out' ? (
                        <p style={{fontSize:'13px',color:'#7c3aed'}}>🍴 Dining out</p>
                      ) : null}
                    </div>
                  ) : (
                    <p style={{fontSize:'12px',color:'#d1d5db',paddingLeft:'26px'}}>Not planned yet</p>
                  )}
                </div>
                <div style={{display:'flex',gap:'8px',marginLeft:'8px',flexShrink:0}}>
                  {saved && <button onClick={()=>onClearSlot(slot.key)} style={{background:'none',border:'none',color:'#d1d5db',cursor:'pointer',fontSize:'18px',padding:'4px'}}>✕</button>}
                  <button onClick={()=>onOpenSlot(slot.key)} style={{background:'#2563eb',color:'white',padding:'6px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:'600',cursor:'pointer',border:'none'}}>
                    {saved?'Edit':'Plan'}
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
function SlotModal({slotKey, slot, recipes, calBudget, onPickRecipe, onOrderIn, onDineOut, onAI, onSkip, onClose}) {
  const [view, setView] = useState('options');
  const info = MEAL_SLOTS.find(s=>s.key===slotKey);
  const targetCal = Math.round(calBudget*(info?.pct||0.2));
  return (
    <Modal title={`${info?.emoji} ${info?.label}`} onClose={onClose}>
      {view==='options' ? (
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          <p style={{fontSize:'13px',color:'#6b7280',marginBottom:'4px'}}>Target: ~{targetCal} cal · How are you eating?</p>
          {[
            {icon:'📖',title:'Pick from Saved Recipes',sub:`${recipes.length} recipes available`,color:'#eff6ff',border:'#bfdbfe',titleColor:'#1d4ed8',action:()=>setView('recipes')},
            {icon:'🤖',title:'AI Suggest a Recipe',sub:'Based on fridge & goals',color:'#faf5ff',border:'#e9d5ff',titleColor:'#7c3aed',action:onAI},
            {icon:'🛵',title:'Order In',sub:'Swiggy / Zomato',color:'#fff7ed',border:'#fed7aa',titleColor:'#c2410c',action:onOrderIn},
            {icon:'🍴',title:'Dine Out',sub:'Find restaurants near you',color:'#fdf4ff',border:'#e9d5ff',titleColor:'#7c3aed',action:onDineOut}
          ].map((btn,i)=>(
            <button key={i} onClick={btn.action} style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px',border:`2px solid ${btn.border}`,background:btn.color,borderRadius:'12px',cursor:'pointer',textAlign:'left',width:'100%'}}>
              <span style={{fontSize:'24px'}}>{btn.icon}</span>
              <div>
                <p style={{fontWeight:'600',color:btn.titleColor,fontSize:'14px'}}>{btn.title}</p>
                <p style={{fontSize:'12px',color:'#9ca3af'}}>{btn.sub}</p>
              </div>
            </button>
          ))}
          <button onClick={onSkip} style={{padding:'12px',border:'1px solid #e5e7eb',borderRadius:'12px',color:'#9ca3af',fontSize:'13px',cursor:'pointer',background:'white'}}>⏭️ Skip this meal</button>
        </div>
      ) : (
        <div>
          <button onClick={()=>setView('options')} style={{color:'#2563eb',fontSize:'13px',marginBottom:'12px',background:'none',border:'none',cursor:'pointer'}}>← Back</button>
          <div style={{display:'flex',flexDirection:'column',gap:'8px',maxHeight:'400px',overflowY:'auto'}}>
            {recipes.length===0 ? (
              <p style={{color:'#9ca3af',textAlign:'center',padding:'24px',fontSize:'14px'}}>No recipes yet!</p>
            ) : recipes.map(r=>(
              <button key={r.id} onClick={()=>onPickRecipe({name:r.name,calories:r.calories,protein:r.protein})}
                style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px',border:'1px solid #e5e7eb',borderRadius:'12px',cursor:'pointer',background:'white',textAlign:'left',width:'100%'}}>
                <div>
                  <p style={{fontWeight:'600',fontSize:'13px'}}>{r.name}</p>
                  <p style={{fontSize:'11px',color:'#9ca3af'}}>{r.cuisine} · {r.calories} cal · {r.protein}g protein</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ml-2 ${r.is_veg||r.isVeg?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{r.is_veg||r.isVeg?'🥬':'🍖'}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── CALENDAR TAB ─────────────────────────────────────────────────────────────
function CalendarTab({weekDates, weekDTs, selDate, onSelect, onOpenOrder}) {
  const today = todayStr();
  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      <h2 style={{fontSize:'20px',fontWeight:'700'}}>📅 This Week</h2>
      <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
        {Object.entries(DAY_TYPES).map(([k,v])=>(
          <span key={k} className={`px-2 py-1 rounded-full text-xs font-medium ${v.bg} ${v.text}`}>{v.emoji} {v.label}</span>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'6px'}}>
        {['M','T','W','T','F','S','S'].map((d,i)=><div key={i} style={{textAlign:'center',fontSize:'11px',color:'#9ca3af',padding:'4px 0'}}>{d}</div>)}
        {weekDates.map(date=>{
          const dt=weekDTs[date]?.day_type||'normal', info=DAY_TYPES[dt], isT=date===today;
          return (
            <button key={date} onClick={()=>onSelect(date)}
              className={`${info.bg} ${info.border}`}
              style={{aspectRatio:'1',borderRadius:'10px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',border:`2px solid`,outline:isT?'2px solid #3b82f6':'none',outlineOffset:'2px',cursor:'pointer'}}>
              <span style={{fontSize:'11px',fontWeight:'700'}}>{new Date(date+'T00:00:00').getDate()}</span>
              <span style={{fontSize:'14px'}}>{info.emoji}</span>
            </button>
          );
        })}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
        {weekDates.map(date=>{
          const dt=weekDTs[date]?.day_type||'normal', info=DAY_TYPES[dt], isT=date===today;
          const day=new Date(date+'T00:00:00').getDay();
          return (
            <div key={date} className={`bg-white rounded-xl p-3 shadow-sm border-l-4 ${info.border} ${isT?'ring-2 ring-blue-200':''}`}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <p style={{fontWeight:'600',fontSize:'14px'}}>{dayNames[day===0?6:day-1]} {isT&&<span style={{color:'#2563eb',fontSize:'11px'}}> ● Today</span>}</p>
                  <p className={`text-xs ${info.text}`}>{info.emoji} {info.label}</p>
                </div>
                <div style={{display:'flex',gap:'8px'}}>
                  {(dt==='order_in'||dt==='dine_out')&&(
                    <button onClick={()=>onOpenOrder(dt)} className={`${info.btn} text-white`} style={{padding:'4px 10px',borderRadius:'8px',fontSize:'12px',border:'none',cursor:'pointer'}}>
                      {dt==='order_in'?'🛵':'🍴'}
                    </button>
                  )}
                  <button onClick={()=>onSelect(date)} style={{background:'#f3f4f6',color:'#4b5563',padding:'4px 10px',borderRadius:'8px',fontSize:'12px',border:'none',cursor:'pointer'}}>✏️</button>
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
function FridgeTab({inventory, onAdd, onDelete}) {
  const [showForm, setShowForm] = useState(false);
  const [item, setItem] = useState({name:'',quantity:'',unit:'g',category:'vegetables'});
  function handleAdd() {
    if (!item.name||!item.quantity) return alert('Fill all fields');
    onAdd({...item,quantity:parseFloat(item.quantity),expires_at:new Date(Date.now()+7*86400000).toISOString().split('T')[0],is_low:false});
    setItem({name:'',quantity:'',unit:'g',category:'vegetables'}); setShowForm(false);
  }
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 style={{fontSize:'20px',fontWeight:'700'}}>🧊 Fridge</h2>
        <button onClick={()=>setShowForm(!showForm)} style={{background:showForm?'#6b7280':'#16a34a',color:'white',padding:'8px 16px',borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer',border:'none'}}>
          {showForm?'✕ Cancel':'+ Add'}
        </button>
      </div>
      {showForm && (
        <div style={{background:'white',borderRadius:'12px',padding:'16px',boxShadow:'0 1px 3px rgba(0,0,0,0.08)',display:'flex',flexDirection:'column',gap:'10px'}}>
          <input placeholder="Item name" value={item.name} onChange={e=>setItem(p=>({...p,name:e.target.value}))} style={{padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px'}} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
            <input type="number" placeholder="Qty" value={item.quantity} onChange={e=>setItem(p=>({...p,quantity:e.target.value}))} style={{padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px'}} />
            <select value={item.unit} onChange={e=>setItem(p=>({...p,unit:e.target.value}))} style={{padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px'}}>
              {['g','kg','ml','l','pieces'].map(u=><option key={u}>{u}</option>)}
            </select>
          </div>
          <select value={item.category} onChange={e=>setItem(p=>({...p,category:e.target.value}))} style={{padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px'}}>
            {['vegetables','protein','dairy','grains','spices','other'].map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
          <button onClick={handleAdd} style={{background:'#2563eb',color:'white',padding:'10px',borderRadius:'8px',fontSize:'14px',fontWeight:'600',cursor:'pointer',border:'none'}}>Add to Fridge</button>
        </div>
      )}
      {inventory.length===0 ? (
        <div style={{background:'white',borderRadius:'12px',padding:'40px',textAlign:'center',color:'#9ca3af'}}>
          <p style={{fontSize:'40px',marginBottom:'8px'}}>🧊</p>
          <p style={{fontWeight:'600'}}>Fridge is empty</p>
          <p style={{fontSize:'13px',marginTop:'4px'}}>Add items for better AI suggestions!</p>
        </div>
      ) : inventory.map(i=>(
        <div key={i.id} style={{background:'white',borderRadius:'12px',padding:'12px 16px',boxShadow:'0 1px 3px rgba(0,0,0,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <p style={{fontWeight:'600',fontSize:'14px'}}>{i.name}</p>
            <p style={{fontSize:'12px',color:'#9ca3af'}}>{i.quantity}{i.unit} · {i.category}</p>
          </div>
          <button onClick={()=>onDelete(i.id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'18px',color:'#fca5a5',padding:'4px'}}>🗑️</button>
        </div>
      ))}
    </div>
  );
}

// ─── RECIPES TAB ──────────────────────────────────────────────────────────────
function RecipesTab({recipes, dietLabel, onAI}) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 style={{fontSize:'20px',fontWeight:'700'}}>📖 Recipes</h2>
        <button onClick={onAI} style={{background:'linear-gradient(to right,#2563eb,#7c3aed)',color:'white',padding:'8px 14px',borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer',border:'none'}}>🤖 AI Suggest</button>
      </div>
      <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'12px',padding:'10px 14px'}}>
        <p style={{fontSize:'13px',fontWeight:'600',color:'#1d4ed8'}}>{dietLabel}</p>
      </div>
      {recipes.map(r=>(
        <div key={r.id} style={{background:'white',borderRadius:'12px',padding:'16px',boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'4px'}}>
            <div>
              <p style={{fontWeight:'700',fontSize:'14px'}}>{r.name}</p>
              <p style={{fontSize:'11px',color:'#9ca3af'}}>{r.cuisine}</p>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs ${r.is_veg||r.isVeg?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{r.is_veg||r.isVeg?'🥬 Veg':'🍖'}</span>
          </div>
          <p style={{fontSize:'12px',color:'#6b7280',marginBottom:'8px'}}>{r.description}</p>
          <div style={{display:'flex',gap:'12px',fontSize:'12px',color:'#9ca3af'}}>
            <span>🔥 {r.calories} cal</span><span>💪 {r.protein}g</span><span>⏱️ {r.prepTime||r.prep_time}m</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({profile, calBudget, city, onSave, onDetectCity}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState(null);
  const [warnings, setWarnings] = useState([]);

  function start() { setForm({...profile}); setEditing(true); }
  function upd(k,v) { const u={...form,[k]:v}; setForm(u); setWarnings(getWarnings(u)); }
  async function save() { await onSave(form); setEditing(false); setWarnings([]); }

  if (editing && form) return (
    <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 style={{fontSize:'20px',fontWeight:'700'}}>✏️ Edit Profile</h2>
        <button onClick={()=>{setEditing(false);setWarnings([]);}} style={{color:'#9ca3af',background:'none',border:'none',cursor:'pointer',fontSize:'14px'}}>✕ Cancel</button>
      </div>
      {warnings.map((w,i)=>(
        <div key={i} style={{background:'#fffbeb',border:'1px solid #fcd34d',borderRadius:'12px',padding:'12px 14px'}}>
          <p style={{fontSize:'13px',color:'#92400e'}}>{w}</p>
        </div>
      ))}
      <div style={{background:'white',borderRadius:'12px',padding:'16px',boxShadow:'0 1px 3px rgba(0,0,0,0.06)',display:'flex',flexDirection:'column',gap:'14px'}}>
        {[['name','Name','text'],['age','Age','number'],['height','Height (cm)','number'],['weight','Current Weight (kg)','number']].map(([f,l,t])=>(
          <div key={f}>
            <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'4px'}}>{l}</label>
            <input type={t} value={form[f]||''} onChange={e=>upd(f,t==='number'?parseFloat(e.target.value)||0:e.target.value)} style={{width:'100%',padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'}} />
          </div>
        ))}
        <div>
          <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'4px'}}>Gender</label>
          <select value={form.gender||'male'} onChange={e=>upd('gender',e.target.value)} style={{width:'100%',padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px'}}>
            <option value="male">Male</option><option value="female">Female</option>
          </select>
        </div>
        <div>
          <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'4px'}}>🏃 Activity Level</label>
          <select value={form.activity_level||'moderate'} onChange={e=>upd('activity_level',e.target.value)} style={{width:'100%',padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px'}}>
            {Object.entries(ACTIVITY_LEVELS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'4px'}}>🎯 Goal</label>
          <select value={form.goal||'weight_loss'} onChange={e=>upd('goal',e.target.value)} style={{width:'100%',padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px'}}>
            <option value="weight_loss">⬇️ Weight Loss</option>
            <option value="maintenance">⚖️ Maintenance</option>
            <option value="weight_gain">⬆️ Weight Gain</option>
          </select>
        </div>
        <div>
          <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'2px'}}>⚖️ Weekly Weight Change (kg/week)</label>
          <p style={{fontSize:'11px',color:'#9ca3af',marginBottom:'4px'}}>Negative = lose weight · Safe: -0.5 to -1.0</p>
          <input type="number" step="0.1" min="-2" max="1" value={form.weight_goal_kg_per_week??-0.5} onChange={e=>upd('weight_goal_kg_per_week',parseFloat(e.target.value))} style={{width:'100%',padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'}} />
          <div style={{marginTop:'8px',background:'#eff6ff',borderRadius:'8px',padding:'8px 12px'}}>
            <p style={{fontSize:'12px',color:'#1d4ed8'}}>Daily calorie target: <strong>{calcCalories({...form})} kcal</strong>{calcCalories({...form})===1200?' (safety floor applied)':''}</p>
          </div>
        </div>
        <div>
          <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'4px'}}>🥗 Dietary Preference</label>
          <select value={form.dietary_preference||'omnivore'} onChange={e=>upd('dietary_preference',e.target.value)} style={{width:'100%',padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px'}}>
            <option value="omnivore">🍖 Omnivore</option>
            <option value="vegetarian">🥬 Vegetarian</option>
            <option value="eggetarian">🥚 Eggetarian</option>
            <option value="vegan">🌱 Vegan</option>
            <option value="pescatarian">🐟 Pescatarian</option>
          </select>
        </div>
        <div>
          <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'4px'}}>📍 City (for restaurant suggestions)</label>
          <div style={{display:'flex',gap:'8px'}}>
            <input type="text" value={form.city||''} onChange={e=>upd('city',e.target.value)} placeholder="Your city" style={{flex:1,padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px'}} />
            <button onClick={async()=>{ const c=await onDetectCity(); if(c) upd('city',c); }} style={{background:'#eff6ff',color:'#1d4ed8',padding:'8px 12px',borderRadius:'8px',fontSize:'13px',fontWeight:'500',cursor:'pointer',border:'1px solid #bfdbfe',whiteSpace:'nowrap'}}>📍 Detect</button>
          </div>
        </div>
        <button onClick={save} style={{background:'#2563eb',color:'white',padding:'12px',borderRadius:'12px',fontSize:'15px',fontWeight:'600',cursor:'pointer',border:'none'}}>💾 Save Profile</button>
      </div>
    </div>
  );

  if (!profile) return null;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      <h2 style={{fontSize:'20px',fontWeight:'700'}}>⚙️ Settings</h2>
      <div style={{background:'white',borderRadius:'12px',padding:'16px',boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
          <p style={{fontWeight:'700',fontSize:'15px'}}>Your Profile</p>
          <button onClick={start} style={{color:'#2563eb',background:'none',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:'600'}}>✏️ Edit</button>
        </div>
        {[
          ['Name', profile.name],
          ['Age / Gender', `${profile.age}y · ${profile.gender}`],
          ['Height / Weight', `${profile.height}cm · ${profile.weight}kg`],
          ['Activity', ACTIVITY_LEVELS[profile.activity_level||'moderate']?.label],
          ['Goal', profile.goal?.replace('_',' ')],
          ['Weekly target', `${profile.weight_goal_kg_per_week??-0.5} kg/week`],
          ['Diet', profile.dietary_preference],
          ['📍 City', city||profile.city||'Not set'],
          ['🔥 Daily calories', `${calBudget} kcal`]
        ].map(([l,v])=>(
          <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f9fafb',fontSize:'13px'}}>
            <span style={{color:'#6b7280'}}>{l}</span>
            <span style={{fontWeight:'600',textTransform:'capitalize',textAlign:'right',maxWidth:'55%'}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(MealPlannerApp));
