import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: req.headers.authorization } } }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    switch (req.method) {
      case 'GET': {
        const { date } = req.query;
        const { data, error } = await supabase
          .from('meal_slots')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', date);
        if (error) throw error;
        return res.status(200).json({ slots: data || [] });
      }
      case 'POST': {
        const { date, slot_type, slot_mode, recipe_name, recipe_calories, recipe_protein, notes } = req.body;
        const { data, error } = await supabase
          .from('meal_slots')
          .upsert({
            user_id: user.id, date, slot_type, slot_mode,
            recipe_name, recipe_calories, recipe_protein, notes,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,date,slot_type' })
          .select().single();
        if (error) throw error;
        return res.status(200).json({ slot: data });
      }
      case 'DELETE': {
        const { date, slot_type } = req.query;
        const { error } = await supabase.from('meal_slots').delete()
          .eq('user_id', user.id).eq('date', date).eq('slot_type', slot_type);
        if (error) throw error;
        return res.status(200).json({ success: true });
      }
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
