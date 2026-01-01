import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlayerCSVRow {
  name: string;
  employee_number: string;
  location: string;
  designation: string;
  age: string;
  gender: string;
  category: string;
  team?: string;
  phone: string;
  email?: string;
}

function parseCSV(csvText: string): PlayerCSVRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have a header row and at least one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  console.log('CSV Headers:', headers);

  const players: PlayerCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    if (values.length < headers.length) {
      console.warn(`Skipping row ${i + 1}: insufficient columns`);
      continue;
    }

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    // Validate required fields
    if (!row.name || !row.employee_number || !row.phone) {
      console.warn(`Skipping row ${i + 1}: missing required fields (name, employee_number, or phone)`);
      continue;
    }

    players.push({
      name: row.name,
      employee_number: row.employee_number,
      location: row.location || 'Unknown',
      designation: row.designation || 'Employee',
      age: row.age || '25',
      gender: row.gender || 'Male',
      category: row.category || 'Mens Singles',
      team: row.team || undefined,
      phone: row.phone,
      email: row.email || undefined,
    });
  }

  return players;
}

function mapGender(gender: string): 'Male' | 'Female' | 'Other' {
  const normalized = gender.toLowerCase().trim();
  if (normalized === 'male' || normalized === 'm') return 'Male';
  if (normalized === 'female' || normalized === 'f') return 'Female';
  return 'Other';
}

function mapCategory(category: string): string {
  const normalized = category.toLowerCase().trim();
  if (normalized.includes('mens') && normalized.includes('single')) return 'Mens Singles';
  if (normalized.includes('womens') && normalized.includes('single')) return 'Womens Singles';
  if (normalized.includes('mens') && normalized.includes('double')) return 'Mens Doubles';
  if (normalized.includes('womens') && normalized.includes('double')) return 'Womens Doubles';
  if (normalized.includes('mixed')) return 'Mixed Doubles';
  // Default based on gender if category is just a gender indicator
  if (normalized === 'male' || normalized === 'm') return 'Mens Singles';
  if (normalized === 'female' || normalized === 'f') return 'Womens Singles';
  return 'Mens Singles';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify requester is admin or moderator
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAnon = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requester }, error: authError } = await supabaseAnon.auth.getUser(token);
    
    if (authError || !requester) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if requester is admin or moderator
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requester.id)
      .in('role', ['admin', 'moderator'])
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('Role check failed:', roleError);
      return new Response(
        JSON.stringify({ error: 'Admin or Moderator access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { csvContent, autoApprove = false } = await req.json();
    
    if (!csvContent) {
      return new Response(
        JSON.stringify({ error: 'CSV content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Parsing CSV content...');
    const parsedPlayers = parseCSV(csvContent);
    console.log(`Parsed ${parsedPlayers.length} players from CSV`);

    if (parsedPlayers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid player data found in CSV' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare players for insertion
    const playersToInsert = parsedPlayers.map(player => ({
      name: player.name,
      employee_number: player.employee_number,
      location: player.location,
      designation: player.designation,
      age: parseInt(player.age) || 25,
      gender: mapGender(player.gender),
      category: mapCategory(player.category),
      team: player.team || null,
      phone: player.phone,
      email: player.email || null,
      status: autoApprove ? 'APPROVED' : 'PENDING',
    }));

    console.log(`Inserting ${playersToInsert.length} players...`);

    // Insert players in batches of 50
    const batchSize = 50;
    const results = { inserted: 0, failed: 0, errors: [] as string[] };

    for (let i = 0; i < playersToInsert.length; i += batchSize) {
      const batch = playersToInsert.slice(i, i + batchSize);
      
      const { data, error } = await supabaseAdmin
        .from('players')
        .insert(batch)
        .select('id');

      if (error) {
        console.error(`Batch insert error at index ${i}:`, error);
        results.failed += batch.length;
        results.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        results.inserted += data?.length || 0;
      }
    }

    console.log(`Bulk upload complete: ${results.inserted} inserted, ${results.failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        inserted: results.inserted,
        failed: results.failed,
        errors: results.errors.length > 0 ? results.errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
