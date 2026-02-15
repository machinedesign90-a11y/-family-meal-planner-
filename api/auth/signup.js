import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name, profile } = req.body;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        email,
        name,
        age: profile.age || 30,
        height: profile.height || 170,
        weight: profile.weight || 70,
        gender: profile.gender || 'male',
        goal: profile.goal || 'maintenance',
        dietary_preference: profile.dietary_preference || 'omnivore',
        target_calories: profile.target_calories || 2000
      }]);

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    res.status(200).json({ 
      success: true, 
      user: authData.user 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
