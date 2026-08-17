import { createClient } from '@supabase/supabase-js';
import { chClient, initClickHouseSchema } from './clickhouse';
import dotenv from 'dotenv';
dotenv.config();

import WebSocket from 'ws';
(globalThis as any).WebSocket = WebSocket;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TARGET_REGIONS = [
  { code: "11620", name: "관악구", tier: "서울 Tier 1" },
  { code: "11290", name: "성북구", tier: "서울 Tier 1" },
  { code: "11410", name: "서대문구", tier: "서울 Tier 1" },
  { code: "11215", name: "광진구", tier: "서울 Tier 1" },
  { code: "11230", name: "동대문구", tier: "서울 Tier 1" },
  { code: "11440", name: "마포구", tier: "서울 Tier 2" },
  { code: "11680", name: "강남구", tier: "서울 Tier 2" },
  { code: "11650", name: "서초구", tier: "서울 Tier 2" },
  { code: "11560", name: "영등포구", tier: "서울 Tier 2" },
  { code: "11710", name: "송파구", tier: "서울 Tier 2" },
  { code: "41110", name: "수원시", tier: "경기" },
  { code: "41460", name: "용인시", tier: "경기" },
  { code: "41130", name: "성남시", tier: "경기" },
  { code: "41170", name: "안양시", tier: "경기" }
];

async function seed() {
  console.log('Initializing ClickHouse Schema...');
  await initClickHouseSchema();

  console.log('Seeding ClickHouse region_reference...');
  await chClient.exec({
    query: `
      CREATE TABLE IF NOT EXISTS region_reference (
        region_code String, region_name String, tier String
      ) ENGINE = MergeTree() ORDER BY region_code;
    `
  });
  
  await chClient.insert({
    table: 'region_reference',
    values: TARGET_REGIONS,
    format: 'JSONEachRow'
  });

  console.log('Seeding Supabase region_reference...');
  const { error } = await supabase.from('region_reference').upsert(TARGET_REGIONS);
  if (error) {
    console.error('Supabase seed error:', error);
  } else {
    console.log('Seeding completed successfully!');
  }
}

seed().catch(console.error);
