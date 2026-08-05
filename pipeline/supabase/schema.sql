CREATE TABLE region_reference (
  region_code TEXT PRIMARY KEY,
  region_name TEXT NOT NULL,
  tier TEXT NOT NULL
);

CREATE TABLE region_trend (
  region_code TEXT REFERENCES region_reference(region_code),
  month DATE NOT NULL,
  building_type TEXT NOT NULL,
  avg_price NUMERIC NOT NULL,
  txn_count INT NOT NULL,
  PRIMARY KEY (region_code, month, building_type)
);

CREATE TABLE pipeline_logs (
  id BIGSERIAL PRIMARY KEY,
  run_at TIMESTAMPTZ DEFAULT now(),
  status TEXT,
  records_synced INT,
  error_message TEXT
);

-- 익명 조회 권한만 허용 (Row Level Security)
ALTER TABLE region_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_trend ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON region_reference FOR SELECT USING (true);
CREATE POLICY "public read" ON region_trend FOR SELECT USING (true);
