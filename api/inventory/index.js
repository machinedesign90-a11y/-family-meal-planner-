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
        const { data: items, error: getError } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (getError) throw getError;
        return res.status(200).json({ items });

      case 'POST':
        const { item } = req.body;
        const { data: newItem, error: createError } = await supabase
          .from('inventory_items')
          .insert([{
            user_id: user.id,
            ...item
          }])
          .select()
          .single();

        if (createError) throw createError;
        return res.status(201).json({ item: newItem });

      case 'PUT':
        const { id, updates } = req.body;
        const { data: updated, error: updateError } = await supabase
          .from('inventory_items')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return res.status(200).json({ item: updated });

      case 'DELETE':
        const { id: deleteId } = req.query;
        const { error: deleteError } = await supabase
          .from('inventory_items')
          .delete()
          .eq('id', deleteId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;
        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
