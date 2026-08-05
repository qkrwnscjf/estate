import { createClient } from '@supabase/supabase-js';
import { chClient } from './clickhouse';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sync() {
  console.log('Fetching aggregated data from ClickHouse region_trend_view...');
  const resultSet = await chClient.query({
    query: 'SELECT * FROM region_trend_view',
    format: 'JSONEachRow'
  });
  const rows = await resultSet.json() as any[];

  console.log(`Syncing ${rows.length} rows to Supabase...`);
  let synced = 0;
  let status = 'SUCCESS';
  let errorMsg = null;

  if (rows.length > 0) {
    const { error } = await supabase.from('region_trend').upsert(rows);
    if (error) {
      console.error('Supabase upsert error:', error);
      status = 'FAILED';
      errorMsg = error.message;
    } else {
      synced = rows.length;
    }
  }

  console.log('Writing pipeline_logs...');
  await supabase.from('pipeline_logs').insert([{
    status, records_synced: synced, error_message: errorMsg
  }]);

  console.log('Sync completed.');
}

sync().catch(console.error);
