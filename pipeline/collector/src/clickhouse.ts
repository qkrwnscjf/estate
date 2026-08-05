import { createClient } from '@clickhouse/client';

export const chClient = createClient({
  url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
});

export async function initClickHouseSchema() {
  await chClient.exec({
    query: `
      CREATE TABLE IF NOT EXISTS raw_transactions (
        region_code String, region_name String, building_type String,
        contract_date Date, deposit UInt32, monthly_rent UInt32,
        jeonse_converted UInt32, exclusive_area Float32,
        collected_at DateTime DEFAULT now()
      ) ENGINE = MergeTree() ORDER BY (region_code, contract_date);
    `
  });

  await chClient.exec({
    query: `
      CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_region_agg
      ENGINE = AggregatingMergeTree() ORDER BY (region_code, month, building_type)
      AS SELECT region_code, toStartOfMonth(contract_date) AS month, building_type,
        avgState(jeonse_converted) AS avg_price_state, countState() AS txn_count_state
      FROM raw_transactions GROUP BY region_code, month, building_type;
    `
  });

  await chClient.exec({
    query: `
      CREATE VIEW IF NOT EXISTS region_trend_view AS
      SELECT region_code, month, building_type,
             avgMerge(avg_price_state) AS avg_price,
             countMerge(txn_count_state) AS txn_count
      FROM monthly_region_agg GROUP BY region_code, month, building_type;
    `
  });
}
