import supabase from '../lib/supabase';

/**
 * Creates test tables and inserts sample data
 */
export const createTestTables = async () => {
  try {
    console.log("Creating test tables...");
    
    // Create contact_messages table if it doesn't exist
    const createMessagesTableQuery = `
      CREATE TABLE IF NOT EXISTS contact_messages_despi_9a7b3c4d2e (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Enable Row Level Security
      ALTER TABLE contact_messages_despi_9a7b3c4d2e ENABLE ROW LEVEL SECURITY;
      
      -- Create policies for authenticated users (admins)
      DROP POLICY IF EXISTS "Allow select for authenticated users" ON contact_messages_despi_9a7b3c4d2e;
      CREATE POLICY "Allow select for authenticated users" 
        ON contact_messages_despi_9a7b3c4d2e FOR SELECT 
        USING (auth.role() = 'authenticated');
        
      DROP POLICY IF EXISTS "Allow update for authenticated users" ON contact_messages_despi_9a7b3c4d2e;
      CREATE POLICY "Allow update for authenticated users" 
        ON contact_messages_despi_9a7b3c4d2e FOR UPDATE 
        USING (auth.role() = 'authenticated')
        WITH CHECK (auth.role() = 'authenticated');
        
      DROP POLICY IF EXISTS "Allow delete for authenticated users" ON contact_messages_despi_9a7b3c4d2e;
      CREATE POLICY "Allow delete for authenticated users" 
        ON contact_messages_despi_9a7b3c4d2e FOR DELETE 
        USING (auth.role() = 'authenticated');
      
      -- Create policy for anonymous users to insert messages
      DROP POLICY IF EXISTS "Allow insert for anonymous users" ON contact_messages_despi_9a7b3c4d2e;
      CREATE POLICY "Allow insert for anonymous users" 
        ON contact_messages_despi_9a7b3c4d2e FOR INSERT 
        WITH CHECK (true);
    `;
    
    await supabase.rpc('execute_sql', { query: createMessagesTableQuery });
    console.log("Contact messages table created successfully!");
    
    // Add sample data
    const sampleData = {
      messages: [
        {
          name: "John Smith",
          email: "john@example.com",
          message: "I'm interested in learning more about Despi's training schedule.",
          is_read: false
        },
        {
          name: "Maria Papadopoulos",
          email: "maria@example.com",
          message: "We would like to invite Despi to our football tournament next month.",
          is_read: false
        }
      ]
    };
    
    // Insert sample messages
    await supabase
      .from('contact_messages_despi_9a7b3c4d2e')
      .insert(sampleData.messages);
    
    console.log("Sample data inserted successfully!");
    
    return { success: true, message: "Test tables and data created successfully" };
  } catch (error) {
    console.error("Error creating test tables:", error);
    return { 
      success: false, 
      message: "Error creating test tables", 
      error: error.message || JSON.stringify(error)
    };
  }
};

export default createTestTables;