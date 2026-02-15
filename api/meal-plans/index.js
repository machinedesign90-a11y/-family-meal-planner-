import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: req.headers.authorization
        }
      }
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const { data: plans, error: getError } = await supabase
          .from('meal_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (getError) throw getError;
        return res.status(200).json({ plans });

      case 'POST':
        const { plan } = req.body;
        
        // Upsert meal plan (update if exists, insert if not)
        const { data: saved, error: saveError } = await supabase
          .from('meal_plans')
          .upsert({
            user_id: user.id,
            ...plan
          }, {
            onConflict: 'user_id,day,meal_type'
          })
          .select()
          .single();

        if (saveError) throw saveError;
        return res.status(200).json({ plan: saved });

      case 'DELETE':
        const { day, mealType } = req.query;
        const { error: deleteError } = await supabase
          .from('meal_plans')
          .delete()
          .eq('user_id', user.id)
          .eq('day', day)
          .eq('meal_type', mealType);

        if (deleteError) throw deleteError;
        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
