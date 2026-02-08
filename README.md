# 🍽️ Family Meal Planner - Vercel Deployment

Production-ready meal planning app with inventory management, nutrition tracking, and personalized health profiles.

---

## 📦 **Files Included**

```
vercel-deployment/
├── index.html          # Entry point with React/Tailwind CDN
├── app.jsx            # Main React application (2200+ lines)
├── vercel.json        # Vercel configuration for SPA routing
└── README.md          # This file
```

---

## 🚀 **Quick Deploy to Vercel**

### **Option 1: Vercel CLI (Recommended)**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to deployment folder:**
   ```bash
   cd vercel-deployment
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   
4. **Follow prompts:**
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name? `family-meal-planner` (or your choice)
   - Directory? `./` (current directory)
   - Override settings? **No**

5. **Production deployment:**
   ```bash
   vercel --prod
   ```

### **Option 2: GitHub + Vercel Dashboard**

1. **Create GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Family Meal Planner"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/meal-planner.git
   git push -u origin main
   ```

2. **Deploy via Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Deploy"

### **Option 3: Vercel Dashboard (Manual Upload)**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Choose "Deploy without Git"
4. Drag and drop the entire `vercel-deployment` folder
5. Click "Deploy"

---

## 🔐 **Default Credentials**

- **Default PIN:** `1234`
- **Users:**
  - Me (Nikhel) - Main account
  - Kiran - Spouse account  
  - Little One - Child account
  - House Help - Helper account

**⚠️ IMPORTANT:** Change the PIN immediately after first login via Settings!

---

## ✨ **Features**

### **Core Features:**
- ✅ PIN authentication with session management
- ✅ Multi-user profiles (4 family members)
- ✅ AI-powered fridge inventory with image recognition
- ✅ 27 pre-loaded recipes (Indian & Continental)
- ✅ Weekly meal planner with diet tracking
- ✅ Automatic inventory deduction at scheduled meal times
- ✅ Personalized nutrition tracking (BMI, BMR, calorie targets)
- ✅ Deep-link grocery shopping (Swiggy/Blinkit/Zepto)
- ✅ House help view with family meal plan

### **Health Tracking:**
- BMI calculation from weight/height
- BMR calculation (Mifflin-St Jeor equation)
- Personalized calorie targets based on health goals
- Macro tracking (protein/carbs/fats)
- Goal-based nutrition (weight loss/gain/maintenance/growth)

### **User Roles:**
1. **Family Members** (Me, Kiran, Little One):
   - Full access to all features
   - Personalized health profiles
   - Meal planning and scheduling
   - Inventory management
   - Recipe library access

2. **House Help**:
   - View family meal plan (read-only)
   - See scheduled meals with ingredients
   - Cooking notes and reminders
   - NO access to inventory or recipe management

---

## 🎯 **Post-Deployment Checklist**

### **Immediate Actions:**
- [ ] Test PIN login with `1234`
- [ ] Change default PIN via Settings
- [ ] Update user profiles with real data
- [ ] Add your own recipes
- [ ] Set up weekly meal plan
- [ ] Test inventory management

### **Customization:**
- [ ] Update user names in code (search for "Little One", "Kiran", etc.)
- [ ] Adjust health metrics (age, weight, height)
- [ ] Modify diet days (non-veg/veg schedule)
- [ ] Customize meal times
- [ ] Add more recipes

### **Optional Enhancements:**
- [ ] Connect to real backend API for data persistence
- [ ] Integrate actual Google Vision API for image recognition
- [ ] Add push notifications for meal reminders
- [ ] Implement shopping list sync with grocery apps
- [ ] Add meal history and analytics

---

## 🔧 **Configuration**

### **Diet Schedule (Default):**
- **Non-Veg Days:** Sunday, Monday, Wednesday, Friday
- **Veg Days:** Tuesday, Thursday, Saturday

### **Meal Times:**
- Breakfast: 9:00 AM
- Lunch: 12:30 PM
- Snack: 4:00 PM
- Dinner: 8:00 PM
- **Eating Cutoff:** 8:30 PM

### **Health Profiles (Default):**

**Nikhel (Me):**
- Age: 36 | Height: 175cm | Weight: 85kg
- Goal: Weight Loss | Target: 1260 cal/day

**Kiran:**
- Age: 34 | Height: 165cm | Weight: 65kg
- Goal: Maintenance | Target: 1800 cal/day

**Little One:**
- Age: 4 | Height: 105cm | Weight: 16kg
- Goal: Growth | Target: 1400 cal/day

---

## 📱 **Mobile Support**

- ✅ Fully responsive design
- ✅ Touch-friendly interface
- ✅ Numeric keyboard for PIN entry
- ✅ Mobile-optimized forms
- ✅ Works offline (after initial load)

---

## 🐛 **Troubleshooting**

### **Can't unlock with PIN:**
- Make sure you're typing exactly `1234`
- Check if Caps Lock is on (shouldn't matter, but just in case)
- Try refreshing the page
- Clear browser cache and try again

### **Page shows white screen:**
- Open browser console (F12) to check for errors
- Ensure internet connection for CDN resources
- Try different browser (Chrome, Firefox, Safari)

### **Inventory not updating:**
- Check meal schedule times are correct
- Ensure meal is marked as "Planned" in schedule
- Time-based deduction happens automatically at scheduled time

### **Mobile keyboard issues:**
- Update browser to latest version
- Try different mobile browser
- Clear browser data and retry

---

## 🔒 **Security Notes**

### **Current Security:**
- ✅ Client-side PIN authentication
- ✅ Session-based access (cleared on browser close)
- ✅ PIN change functionality
- ⚠️ Data stored in browser memory (lost on refresh)

### **Production Recommendations:**
- Add backend authentication (JWT tokens)
- Store PIN securely (hashed, never plaintext)
- Add rate limiting for login attempts
- Implement account lockout after failed attempts
- Add password/PIN recovery mechanism
- Use HTTPS (Vercel provides this automatically)
- Consider 2FA for sensitive data

---

## 📊 **Technical Stack**

- **Frontend:** React 18 (via CDN)
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState)
- **Storage:** sessionStorage (temporary)
- **Hosting:** Vercel
- **Build:** None required (CDN-based)

---

## 🎨 **Customization Guide**

### **Change User Names:**
Find and replace in `app.jsx`:
```javascript
const userProfiles = {
  me: { name: 'Your Name', ... },
  spouse: { name: 'Spouse Name', ... },
  child: { name: 'Child Name', ... },
  help: { name: 'Helper Name', ... }
}
```

### **Change Default PIN:**
Find in `app.jsx`:
```javascript
const [appPin, setAppPin] = useState('1234'); // Change here
```

### **Add More Recipes:**
Add to `recipes` array in `app.jsx`:
```javascript
{
  id: 28,
  name: 'Your Recipe Name',
  type: 'non-veg', // or 'veg'
  cuisine: 'indian', // or 'continental'
  mealType: 'dinner', // breakfast/lunch/snack/dinner
  calories: 450,
  protein: 35,
  carbs: 40,
  fats: 15,
  prepTime: '30 min',
  ingredients: [
    { name: 'Ingredient 1', amount: 200, unit: 'g' },
    // ...
  ]
}
```

### **Modify Diet Days:**
Change in `weeklyPlan` initialization:
```javascript
{ day: 'Monday', date: '...', dietType: 'non-veg' }, // Change here
```

---

## 📈 **Future Enhancements**

### **Planned Features:**
- [ ] Backend API for data persistence
- [ ] Real Google Vision API integration
- [ ] User authentication (email/password)
- [ ] Recipe sharing with family/friends
- [ ] Meal history and analytics dashboard
- [ ] Shopping list export (CSV, PDF)
- [ ] Calendar integration (Google Calendar, iCal)
- [ ] Nutrition trends and insights
- [ ] Recipe rating and favorites
- [ ] Barcode scanning for groceries
- [ ] Voice commands for hands-free cooking
- [ ] Multi-language support
- [ ] Dark mode

---

## 📞 **Support**

### **Common Issues:**
- Check the Troubleshooting section above
- Review browser console for errors
- Ensure CDN resources are loading

### **Getting Help:**
- Create issue on GitHub (if using repository)
- Check Vercel deployment logs
- Review browser developer tools

---

## 📄 **License**

This project is for personal use. Modify as needed for your family!

---

## 🙏 **Acknowledgments**

Built with:
- React 18
- Tailwind CSS
- Vercel Platform
- Lucide Icons (via Tailwind)

---

**🎉 Happy Meal Planning!**

Change the default PIN after deployment and enjoy your smart meal planner! 🍽️
