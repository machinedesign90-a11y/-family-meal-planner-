import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: { Authorization: req.headers.authorization }
      }
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        // Get day types for a date range
        const { startDate, endDate } = req.query;
        const { data, error } = await supabase
          .from('day_types')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true });

        if (error) throw error;
        return res.status(200).json({ dayTypes: data });
      }

      case 'POST': {
        // Set day type (upsert)
        const { date, day_type, notes, restaurant_name, order_platform } = req.body;
        const { data, error } = await supabase
          .from('day_types')
          .upsert({
            user_id: user.id,
            date,
            day_type,
            notes,
            restaurant_name,
            order_platform,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,date' })
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json({ dayType: data });
      }

      case 'DELETE': {
        const { date } = req.query;
        const { error } = await supabase
          .from('day_types')
          .delete()
          .eq('user_id', user.id)
          .eq('date', date);

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
