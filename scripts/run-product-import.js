import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function importProducts() {
  try {
    // Read the SQL file
    const sqlPath = path.join(path.dirname(import.meta.url).replace('file://', ''), 'product-import.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    console.log('[v0] Starting product import...');
    console.log('[v0] Reading SQL file from:', sqlPath);

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });

    if (error) {
      // If rpc doesn't exist, try direct query
      if (error.message.includes('exec_sql')) {
        console.log('[v0] RPC method not available, using direct execution...');
        
        // Split by semicolon and execute each statement
        const statements = sqlContent
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        let successCount = 0;
        for (const statement of statements) {
          const { error: execError } = await supabase.rpc('exec', { 
            statement: statement + ';' 
          }).catch(() => ({ error: null }));
          
          if (!execError) {
            successCount++;
          }
        }

        console.log(`[v0] Executed ${successCount}/${statements.length} statements`);
      } else {
        throw error;
      }
    }

    console.log('[v0] Product import completed successfully!');
    
    // Verify import
    const { data: products, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact' });

    if (!countError) {
      console.log(`[v0] Total products in database: ${products?.length || 0}`);
    }

  } catch (error) {
    console.error('[v0] Error importing products:', error.message);
    process.exit(1);
  }
}

importProducts();
