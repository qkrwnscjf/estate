import { program } from 'commander';
import { createClient } from '@supabase/supabase-js';
import { chClient } from './clickhouse';
import dotenv from 'dotenv';
dotenv.config();

// pipeline_logs 조회를 위한 Supabase 클라이언트
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

program
  .option('--buildingType <type>', 'Building type to collect', '오피스텔')
  .parse();

const options = program.opts();

async function getLookbackMonths(): Promise<number> {
  // 마지막으로 동기화(전체 데이터) 성공한 로그를 가져옵니다.
  const { data, error } = await supabase
    .from('pipeline_logs')
    .select('run_at')
    .eq('status', 'SUCCESS')
    .order('run_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    console.log('No previous success log found. Defaulting to 12 months.');
    return 12; // 한 번도 안 돌았으면 기본 1년치 수집
  }

  const lastRunAt = new Date(data[0].run_at);
  const now = new Date();
  
  const diffTime = Math.abs(now.getTime() - lastRunAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  let months = Math.ceil(diffDays / 30);
  
  // 공공데이터 지연 등록(Late Registration) 방어를 위해 최소 1개월을 겹치게 수집하고, 최대 12개월로 제한
  months = Math.max(1, Math.min(months, 12));
  return months;
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function collect() {
  const months = await getLookbackMonths();
  console.log(`Starting collection for ${options.buildingType}, dynamically looking back ${months} months...`);
  
  // 국토부 API 수집 시뮬레이션
  const dummyTransactions = [
    {
      region_code: "11680", region_name: "강남구", building_type: options.buildingType,
      contract_date: "2026-08-01", deposit: 10000, monthly_rent: 100,
      jeonse_converted: 36000, exclusive_area: 29.5
    }
  ];

  await delay(200); // 200ms delay per API requirements

  console.log(`Inserting ${dummyTransactions.length} records into ClickHouse...`);
  await chClient.insert({
    table: 'raw_transactions',
    values: dummyTransactions,
    format: 'JSONEachRow'
  });

  console.log('Collection finished.');
}

collect().catch(console.error);
