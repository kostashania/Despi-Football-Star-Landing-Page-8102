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

// Create required tables if they don't exist
const createRequiredTables = async () => {
  try {
    // Create admin_settings table if it doesn't exist
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS admin_settings_despi_9a7b3c4d2e (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `).catch(err => console.error('Error creating admin_settings table:', err));
    
    // Enable RLS on admin_settings
    await supabase.query(`
      ALTER TABLE admin_settings_despi_9a7b3c4d2e ENABLE ROW LEVEL SECURITY;
    `).catch(() => {});
    
    await supabase.query(`
      DROP POLICY IF EXISTS "Enable all operations for all users" ON admin_settings_despi_9a7b3c4d2e;
      CREATE POLICY "Enable all operations for all users" ON admin_settings_despi_9a7b3c4d2e USING (true);
    `).catch(() => {});
    
    // Create gallery_images table with approval system
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS gallery_images_despi_9a7b3c4d2e (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        alt_text TEXT,
        image_url TEXT NOT NULL,
        is_featured BOOLEAN DEFAULT false,
        is_approved BOOLEAN DEFAULT false,
        uploaded_by TEXT DEFAULT 'admin',
        upload_status TEXT DEFAULT 'pending',
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `).catch(err => console.error('Error creating gallery_images table:', err));
    
    // Enable RLS on gallery_images
    await supabase.query(`
      ALTER TABLE gallery_images_despi_9a7b3c4d2e ENABLE ROW LEVEL SECURITY;
    `).catch(() => {});
    
    await supabase.query(`
      DROP POLICY IF EXISTS "Enable read access for approved images" ON gallery_images_despi_9a7b3c4d2e;
      CREATE POLICY "Enable read access for approved images" ON gallery_images_despi_9a7b3c4d2e FOR SELECT USING (is_approved = true);
    `).catch(() => {});
    
    await supabase.query(`
      DROP POLICY IF EXISTS "Enable all operations for all users" ON gallery_images_despi_9a7b3c4d2e;
      CREATE POLICY "Enable all operations for all users" ON gallery_images_despi_9a7b3c4d2e USING (true);
    `).catch(() => {});

    // Create contact_messages table if it doesn't exist
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS contact_messages_despi_9a7b3c4d2e (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `).catch(err => console.error('Error creating contact_messages table:', err));
    
    // Enable RLS on contact_messages
    await supabase.query(`
      ALTER TABLE contact_messages_despi_9a7b3c4d2e ENABLE ROW LEVEL SECURITY;
    `).catch(() => {});
    
    await supabase.query(`
      DROP POLICY IF EXISTS "Enable all operations for all users" ON contact_messages_despi_9a7b3c4d2e;
      CREATE POLICY "Enable all operations for all users" ON contact_messages_despi_9a7b3c4d2e USING (true);
    `).catch(() => {});

    // Create videos table if it doesn't exist
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS videos_despi_9a7b3c4d2e (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        youtube_id TEXT,
        thumbnail_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `).catch(err => console.error('Error creating videos table:', err));
    
    // Enable RLS on videos
    await supabase.query(`
      ALTER TABLE videos_despi_9a7b3c4d2e ENABLE ROW LEVEL SECURITY;
    `).catch(() => {});
    
    await supabase.query(`
      DROP POLICY IF EXISTS "Enable read access for all users" ON videos_despi_9a7b3c4d2e;
      CREATE POLICY "Enable read access for all users" ON videos_despi_9a7b3c4d2e FOR SELECT USING (true);
    `).catch(() => {});
    
    await supabase.query(`
      DROP POLICY IF EXISTS "Enable all operations for all users" ON videos_despi_9a7b3c4d2e;
      CREATE POLICY "Enable all operations for all users" ON videos_despi_9a7b3c4d2e USING (true);
    `).catch(() => {});

    // Create hero_content table if it doesn't exist
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS hero_content_despi_9a7b3c4d2e (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        subtitle TEXT,
        buttonText TEXT DEFAULT 'Watch Highlights',
        buttonLink TEXT DEFAULT '#videos',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `).catch(err => console.error('Error creating hero_content table:', err));
    
    // Enable RLS on hero_content
    await supabase.query(`
      ALTER TABLE hero_content_despi_9a7b3c4d2e ENABLE ROW LEVEL SECURITY;
    `).catch(() => {});
    
    await supabase.query(`
      DROP POLICY IF EXISTS "Enable read access for all users" ON hero_content_despi_9a7b3c4d2e;
      CREATE POLICY "Enable read access for all users" ON hero_content_despi_9a7b3c4d2e FOR SELECT USING (true);
    `).catch(() => {});
    
    await supabase.query(`
      DROP POLICY IF EXISTS "Enable all operations for all users" ON hero_content_despi_9a7b3c4d2e;
      CREATE POLICY "Enable all operations for all users" ON hero_content_despi_9a7b3c4d2e USING (true);
    `).catch(() => {});

    // Create admin_users table if it doesn't exist
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS admin_users_despi_9a7b3c4d2e (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `).catch(err => console.error('Error creating admin_users table:', err));
    
    // Enable RLS on admin_users
    await supabase.query(`
      ALTER TABLE admin_users_despi_9a7b3c4d2e ENABLE ROW LEVEL SECURITY;
    `).catch(() => {});
    
    await supabase.query(`
      DROP POLICY IF EXISTS "Enable all operations for all users" ON admin_users_despi_9a7b3c4d2e;
      CREATE POLICY "Enable all operations for all users" ON admin_users_despi_9a7b3c4d2e USING (true);
    `).catch(() => {});

    // Create admin_sessions table if it doesn't exist
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS admin_sessions_despi_9a7b3c4d2e (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES admin_users_despi_9a7b3c4d2e(id) ON DELETE CASCADE,
        session_token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `).catch(err => console.error('Error creating admin_sessions table:', err));
    
    // Enable RLS on admin_sessions
    await supabase.query(`
      ALTER TABLE admin_sessions_despi_9a7b3c4d2e ENABLE ROW LEVEL SECURITY;
    `).catch(() => {});
    
    await supabase.query(`
      DROP POLICY IF EXISTS "Enable all operations for all users" ON admin_sessions_despi_9a7b3c4d2e;
      CREATE POLICY "Enable all operations for all users" ON admin_sessions_despi_9a7b3c4d2e USING (true);
    `).catch(() => {});

    // Insert default admin user if it doesn't exist
    await supabase.query(`
      INSERT INTO admin_users_despi_9a7b3c4d2e (email, password_hash)
      VALUES ('admin@despi.com', 'YWRtaW4xMjNkZXNwaV9zYWx0XzIwMjQ=')
      ON CONFLICT (email) DO NOTHING;
    `).catch(() => {});

    // Create storage bucket for image uploads if it doesn't exist
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'despi-gallery');
      
      if (!bucketExists) {
        await supabase.storage.createBucket('despi-gallery', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 5242880 // 5MB
        });
      }
    } catch (error) {
      console.error('Error creating storage bucket:', error);
    }
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Initialize database when supabase client is created
createRequiredTables();

export default supabase;