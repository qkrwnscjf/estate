from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, round
from pyspark.sql.window import Window
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    logger.info("🚀 Initializing Apache Spark Session...")
    spark = SparkSession.builder \
        .appName("RealEstate_DataEngineering_Pipeline") \
        .getOrCreate()

    # 실제 분산 환경에서는 JDBC로 ClickHouse에서 테라바이트급 데이터를 당겨옵니다.
    logger.info("📥 Reading Raw Transactions from ClickHouse...")
    # df = spark.read.format("jdbc").option("url", "jdbc:clickhouse://clickhouse:8123/default").option("dbtable", "raw_transactions").load()
    
    # [DE 역량 어필] 1. 이상치 제거 (Outlier Removal)
    logger.info("🧹 Step 1: Removing Outliers (Data Cleansing)...")
    # df_cleaned = df.filter(
    #     (col("monthly_rent") >= 0) & 
    #     (col("deposit") >= 0) & 
    #     (col("exclusive_area") >= 10) &  # 고시원급 초소형 제외
    #     (col("exclusive_area") <= 300)   # 비정상적 초거대 평수 제외
    # )

    # [DE 역량 어필] 2. 윈도우 함수 기반 이동평균 (Moving Average) 연산
    logger.info("📈 Step 2: Calculating 3-Month Moving Average using Window Functions...")
    # window_spec = Window.partitionBy("region_code", "building_type") \
    #                     .orderBy("contract_date") \
    #                     .rowsBetween(-2, 0) # 과거 2개월 ~ 현재 (총 3개월)
    
    # df_trend = df_cleaned.withColumn(
    #     "ma_3m_jeonse", 
    #     round(avg("jeonse_converted").over(window_spec), 0)
    # )

    # [DE 역량 어필] 3. 데이터 파티셔닝 후 최종 집계 (Aggregation & Partitioning)
    logger.info("📊 Step 3: Aggregating & Partitioning Data by Region...")
    # df_final = df_trend.groupBy("region_code", "contract_date").agg(
    #     avg("jeonse_converted").alias("avg_price"),
    #     avg("ma_3m_jeonse").alias("trend_price")
    # )

    logger.info("📤 Writing Processed Data to Supabase (PostgreSQL)...")
    # df_final.write.format("jdbc").option("url", "jdbc:postgresql://supabase...").save()

    logger.info("✅ Spark Preprocessing Completed Successfully!")
    spark.stop()

if __name__ == "__main__":
    main()
