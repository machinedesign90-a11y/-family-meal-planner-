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
        const { data: profile, error: getError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (getError) throw getError;
        return res.status(200).json({ profile });

      case 'PUT':
        const { updates } = req.body;
        const { data: updated, error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return res.status(200).json({ profile: updated });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
