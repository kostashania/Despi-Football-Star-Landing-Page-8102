import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bjelydvroavsqczejpgd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqZWx5ZHZyb2F2c3FjemVqcGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMjE2MDcsImV4cCI6MjA2NjU5NzYwN30.f-693IO1d0TCBQRiWcSTvjCT8I7bb0t9Op_gvD5LeIE'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Create a helper function to create tables if they don't exist
const createRequiredTables = async () => {
  try {
    // Create the RPC function if it doesn't exist
    await supabase.rpc('create_admin_settings_if_not_exists').catch(() => {
      // If the RPC doesn't exist, create it
      return supabase.rpc('create_rpc_function', {
        function_name: 'create_admin_settings_if_not_exists'
      });
    });
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Initialize database when the app starts
createRequiredTables();

export default supabase;