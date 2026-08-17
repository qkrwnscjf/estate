import { program } from 'commander';
import { createClient } from '@supabase/supabase-js';
import { chClient, initClickHouseSchema } from './clickhouse';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });

// pipeline_logs 조회를 위한 Supabase 클라이언트
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
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


async function fetchMolitData(regionCode: string, yearMonth: string, buildingType: string) {
  // 공공데이터포털 국토교통부 오피스텔/아파트 실거래가 API 엔드포인트
  const MOLIT_API_KEY = process.env.OPEN_API_KEY;
  if (!MOLIT_API_KEY) throw new Error("OPEN_API_KEY is missing in .env");

  // 오피스텔 전월세 API (예시)
  const url = 'http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcOffiRent';
  
  const response = await axios.get(url, {
    proxy: false, // 로컬 환경의 프록시 설정 무시
    params: {
      serviceKey: decodeURIComponent(MOLIT_API_KEY),
      LAWD_CD: regionCode,
      DEAL_YMD: yearMonth
    }
  });

  const items = response.data?.response?.body?.items?.item;
  if (!items) return [];

  // XML-to-JSON 자동 변환된 결과가 배열이 아닐 수 있음 (1건일 경우)
  const itemList = Array.isArray(items) ? items : [items];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return itemList.map((item: any) => ({
    region_code: regionCode,
    region_name: item.sggNm || "알수없음", // API 응답에 따라 필드명 다름
    building_type: buildingType,
    contract_date: `${yearMonth}-${String(item.조일 || '01').padStart(2, '0')}`,
    deposit: Number(item.보증금액?.replace(/,/g, '') || 0),
    monthly_rent: Number(item.월세금액?.replace(/,/g, '') || 0),
    jeonse_converted: Number(item.보증금액?.replace(/,/g, '') || 0) + (Number(item.월세금액?.replace(/,/g, '') || 0) * 100), // 임의의 전세환산 로직
    exclusive_area: Number(item.전용면적 || 0)
  }));
}

async function collect() {
  await initClickHouseSchema();
  const months = await getLookbackMonths();
  console.log(`Starting collection for ${options.buildingType}, dynamically looking back ${months} months...`);
  
  // 수집할 대상 지역 코드 (예: 강남구 11680, 마포구 11440 등)
  // 실제로는 DB에서 활성화된 지역 목록을 조회해옵니다.
  const targetRegions = ["11680", "11440", "11620", "41110"]; 
  
  const now = new Date();
  let totalInserted = 0;

  for (let i = 0; i < months; i++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yearMonth = `${targetDate.getFullYear()}${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
    
    for (const regionCode of targetRegions) {
      console.log(`Fetching data for region ${regionCode}, month ${yearMonth}...`);
      try {
        const transactions = await fetchMolitData(regionCode, yearMonth, options.buildingType);
        
        if (transactions.length > 0) {
          await chClient.insert({
            table: 'raw_transactions',
            values: transactions,
            format: 'JSONEachRow'
          });
          totalInserted += transactions.length;
          console.log(`Inserted ${transactions.length} records.`);
        } else {
          console.log('No data found.');
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(`Error fetching for ${regionCode} ${yearMonth}:`, err.message);
      }
      
      // 공공 API 트래픽 제한 방어 (1초 딜레이)
      await delay(1000); 
    }
  }

  console.log(`Collection finished. Total ${totalInserted} records inserted into ClickHouse.`);
}

collect().catch(console.error);
