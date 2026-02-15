export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { profile, inventory } = req.body;

    // Build prompt
    const availableIngredients = inventory
      .map(item => `${item.name} (${item.quantity}${item.unit})`)
      .join(', ');

    const dietaryInfo = {
      'omnivore': 'can eat all types of food including meat, fish, eggs, and dairy',
      'vegetarian': 'vegetarian (no meat or fish, but eats dairy and eggs)',
      'eggetarian': 'eggetarian (vegetarian diet that includes eggs)',
      'vegan': 'vegan (no animal products at all)',
      'pescatarian': 'pescatarian (vegetarian but eats fish and seafood)'
    };

    const targetCalsPerMeal = Math.round(profile.targetCalories / 3);
    const targetProteinPerMeal = Math.round(profile.weight * 1.6 / 3);

    const prompt = `You are a professional nutritionist and chef specializing in Indian cuisine. Generate 3 healthy, practical recipe suggestions.

**Available Ingredients:** ${availableIngredients || 'Basic Indian pantry staples'}

**User Profile:**
- Name: ${profile.name}
- Age: ${profile.age} years
- Health Goal: ${profile.goal === 'weight_loss' ? 'Weight Loss' : profile.goal === 'weight_gain' ? 'Weight Gain' : profile.goal === 'growth' ? 'Growth (child)' : 'Maintenance'}
- Target Calories per meal: ~${targetCalsPerMeal} calories
- Protein Goal per meal: ~${targetProteinPerMeal}g
- Dietary Preference: ${profile.dietaryPreference || 'omnivore'} - ${dietaryInfo[profile.dietaryPreference || 'omnivore']}

Please suggest 3 diverse recipes that:
1. Use available ingredients (you can suggest 1-2 additional common items if needed)
2. Strictly match dietary preference: ${dietaryInfo[profile.dietaryPreference || 'omnivore']}
3. Fit within calorie and protein goals
4. Are suitable for Indian household cooking
5. Are practical and not overly complex
6. Include one breakfast, one lunch/dinner, and one snack option

For each recipe, provide in this EXACT JSON format:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "calories": 400,
      "protein": 35,
      "prepTime": 25,
      "ingredients": [
        {"name": "Ingredient 1", "amount": 200, "unit": "g"},
        {"name": "Ingredient 2", "amount": 100, "unit": "ml"}
      ],
      "mealType": "breakfast",
      "isVeg": true,
      "cuisine": "Indian",
      "description": "Brief 2-3 sentence description of the dish and why it's good for the user's goals.",
      "instructions": "Step by step cooking instructions.",
      "nutrition": {
        "carbs": 45,
        "fat": 12
      }
    }
  ]
}

Respond ONLY with valid JSON. No markdown, no explanations, just the JSON object.`;

    // Call Gemini API directly using the same structure as user's Postman request
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      return res.status(response.status).json({ 
        error: `Gemini API error: ${response.status}`,
        details: errorData
      });
    }

    const data = await response.json();
    
    // Extract text from Gemini response structure
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('Unexpected Gemini response structure:', JSON.stringify(data, null, 2));
      return res.status(500).json({ 
        error: 'Unexpected response from Gemini',
        rawResponse: data
      });
    }

    // Parse JSON response
    let recipes;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanText);
      recipes = parsed.recipes || [];
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        rawResponse: text.substring(0, 500)
      });
    }

    // Add IDs and timestamps
    const recipesWithIds = recipes.map((recipe, index) => ({
      ...recipe,
      id: `ai-${Date.now()}-${index}`,
      isAI: true,
      createdAt: new Date().toISOString()
    }));

    res.status(200).json({ 
      success: true,
      recipes: recipesWithIds
    });

  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ error: error.message });
  }
}
