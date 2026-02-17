import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return res.status(401).json({ error: 'Unauthorized' });

    // ✅ Always fetch fresh profile from DB
    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('*').eq('id', user.id).single();
    if (profileError) return res.status(500).json({ error: 'Failed to fetch profile' });

    const { inventory, type, city, slotKey } = req.body;

    // ── RESTAURANT SUGGESTIONS ──────────────────────────────────────────────
    if (type === 'restaurants') {
      const dietPref = profile.dietary_preference || 'omnivore';
      const goal = profile.goal || 'maintenance';
      const targetCals = profile.target_calories || 2000;
      const slotPcts = { breakfast: 0.25, morning_snack: 0.10, lunch: 0.35, evening_snack: 0.10, dinner: 0.20 };
      const mealCal = slotKey ? Math.round(targetCals * (slotPcts[slotKey] || 0.3)) : Math.round(targetCals / 3);
      const cityName = city || profile.city || 'Hyderabad';

      // Build medical context
      const conditions = profile.medical_conditions || [];
      const allergies = profile.allergies || [];
      const medContext = conditions.length > 0
        ? `Medical conditions: ${conditions.join(', ')}. ` : '';
      const allergyContext = allergies.length > 0
        ? `Allergies (AVOID): ${allergies.join(', ')}. ` : '';

      const prompt = `Suggest 4 ${type === 'restaurants' && req.body.orderType === 'dine_out' ? 'dineout restaurant' : 'food delivery (Swiggy/Zomato)'} options in ${cityName}, India.
User profile: ${dietPref} diet, goal: ${goal}, ~${mealCal} calories for this meal.
${medContext}${allergyContext}
STRICTLY follow dietary preference: ${dietPref}.
${allergies.length > 0 ? `MUST AVOID these allergens: ${allergies.join(', ')}.` : ''}
Respond ONLY with valid JSON (no markdown):
{"suggestions":[{"name":"string","cuisine":"string","dish":"string","calories":400,"isVeg":true,"price":"₹200-350","reason":"string","swiggySearch":"string"}]}`;

      const geminiResp = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );

      if (!geminiResp.ok) throw new Error(`Gemini error: ${geminiResp.status}`);
      const geminiData = await geminiResp.json();
      const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(clean);
      return res.status(200).json({ success: true, suggestions: parsed.suggestions || [] });
    }

    // ── RECIPE GENERATION ───────────────────────────────────────────────────
    const availableIngredients = inventory && inventory.length > 0
      ? inventory.map(i => `${i.name} (${i.quantity}${i.unit})`).join(', ')
      : 'Basic Indian pantry staples';

    const dietaryInfo = {
      omnivore: 'can eat all food including meat, fish, eggs, dairy',
      vegetarian: 'vegetarian - no meat or fish, eats dairy and eggs',
      eggetarian: 'eggetarian - vegetarian plus eggs',
      vegan: 'vegan - no animal products',
      pescatarian: 'pescatarian - vegetarian plus fish/seafood'
    };

    const conditions = profile.medical_conditions || [];
    const allergies = profile.allergies || [];

    // Build medical dietary rules
    const medRules = [];
    if (conditions.includes('diabetes_t2') || conditions.includes('prediabetes'))
      medRules.push('low glycemic index foods, avoid refined sugar and white rice, prefer complex carbs, high fiber');
    if (conditions.includes('hypertension'))
      medRules.push('low sodium (avoid pickles, papads, processed foods), include potassium-rich foods like banana and spinach');
    if (conditions.includes('hypothyroid') || conditions.includes('hyperthyroid'))
      medRules.push('limit raw cruciferous vegetables (always cook broccoli/cauliflower/cabbage), include selenium-rich foods, avoid excess soy');
    if (conditions.includes('hyperacidity'))
      medRules.push('avoid spicy, fried and acidic foods, no citrus or tomato-heavy dishes, prefer small frequent meals, include cooling foods like cucumber, coconut water, banana, oats, avoid empty stomach');
    if (conditions.includes('pcod'))
      medRules.push('low glycemic index, high fiber, anti-inflammatory foods, limit dairy and refined carbs, include omega-3 rich foods like flaxseed and walnuts');

    const targetCalsPerMeal = Math.round((profile.target_calories || 2000) / 3);
    const targetProteinPerMeal = Math.round(profile.weight * 1.6 / 3);
    const dietPref = profile.dietary_preference || 'omnivore';

    const prompt = `You are a professional nutritionist and chef specializing in Indian cuisine. Generate 3 healthy, practical recipe suggestions.

**Available Ingredients:** ${availableIngredients}

**User Profile:**
- Age: ${profile.age} years, Weight: ${profile.weight}kg
- Health Goal: ${profile.goal?.replace('_', ' ')}
- Target Calories per meal: ~${targetCalsPerMeal} calories
- Protein Goal per meal: ~${targetProteinPerMeal}g
- Dietary Preference: ${dietPref} - ${dietaryInfo[dietPref] || dietaryInfo.omnivore}
${medRules.length > 0 ? `- Medical dietary rules: ${medRules.join('; ')}` : ''}
${allergies.length > 0 ? `- ALLERGIES (STRICTLY AVOID): ${allergies.join(', ')}` : ''}

IMPORTANT RULES:
1. STRICTLY follow dietary preference: ${dietaryInfo[dietPref] || dietaryInfo.omnivore}
2. ${allergies.length > 0 ? `NEVER include these allergens: ${allergies.join(', ')}` : 'No allergy restrictions'}
3. ${medRules.length > 0 ? `Follow medical guidelines: ${medRules.join('; ')}` : 'No medical restrictions'}
4. Suggest one breakfast, one lunch/dinner, one snack

Respond ONLY with valid JSON:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "calories": 400,
      "protein": 35,
      "prepTime": 25,
      "ingredients": [{"name": "Ingredient", "amount": 200, "unit": "g"}],
      "mealType": "breakfast",
      "isVeg": true,
      "cuisine": "Indian",
      "description": "Brief description and why it fits user goals.",
      "instructions": "Step by step instructions.",
      "nutrition": {"carbs": 45, "fat": 12}
    }
  ]
}`;

    const geminiResp = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    if (!geminiResp.ok) {
      const errText = await geminiResp.text();
      console.error('Gemini error:', errText);
      return res.status(geminiResp.status).json({ error: `Gemini API error: ${geminiResp.status}` });
    }

    const geminiData = await geminiResp.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(500).json({ error: 'No response from Gemini' });

    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean);
    const recipes = (parsed.recipes || []).map((r, i) => ({
      ...r, id: `ai-${Date.now()}-${i}`, isAI: true, createdAt: new Date().toISOString()
    }));

    return res.status(200).json({
      success: true, recipes,
      profileUsed: { name: profile.name, dietaryPreference: profile.dietary_preference, goal: profile.goal, medicalConditions: conditions }
    });

  } catch (error) {
    console.error('AI Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
