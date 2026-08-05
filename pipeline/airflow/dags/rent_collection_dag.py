from datetime import datetime, timedelta
from airflow import DAG
from airflow.providers.docker.operators.docker import DockerOperator
from airflow.operators.python import PythonOperator
import requests
import os

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=10),
}

dag = DAG(
    'rent_collection_pipeline',
    default_args=default_args,
    description='Collect rent data, sync to Supabase, and revalidate Vercel cache',
    schedule_interval='@weekly', # 매주 실행
    start_date=datetime(2026, 1, 1),
    catchup=False, # 밀린 스케줄 무시 (로컬 환경의 불안정성 방어)
)

building_types = ["오피스텔", "연립다세대", "단독다가구"]
collect_tasks = []

env_vars = {
    'OPEN_API_KEY': os.environ.get('OPEN_API_KEY', ''),
    'CLICKHOUSE_URL': 'http://clickhouse:8123',
    'SUPABASE_URL': os.environ.get('SUPABASE_URL', ''),
    'SUPABASE_SERVICE_ROLE_KEY': os.environ.get('SUPABASE_SERVICE_ROLE_KEY', ''),
}

for b_type in building_types:
    task = DockerOperator(
        task_id=f'collect_{b_type}',
        image='estate-collector:latest',
        # --months 제거: collect.ts 내부에서 동적으로 계산함
        command=f'node dist/collect.js --buildingType="{b_type}"',
        network_mode='pipeline_data-pipeline',
        environment=env_vars,
        docker_url='unix://var/run/docker.sock',
        auto_remove=True,
        dag=dag,
    )
    collect_tasks.append(task)

sync_to_supabase = DockerOperator(
    task_id='sync_to_supabase',
    image='estate-collector:latest',
    command='node dist/sync-to-supabase.js',
    network_mode='pipeline_data-pipeline',
    environment=env_vars,
    docker_url='unix://var/run/docker.sock',
    auto_remove=True,
    dag=dag,
)

def revalidate_vercel():
    url = os.environ.get('VERCEL_REVALIDATE_URL')
    secret = os.environ.get('REVALIDATE_SECRET')
    if url and secret:
        response = requests.post(
            url, 
            headers={'x-revalidate-secret': secret}, # 새 명세 적용
            timeout=30
        )
        response.raise_for_status()
        print(f"Revalidation triggered successfully: {response.status_code}")
    else:
        print("Vercel Revalidate URL or Secret not set. Skipping.")

trigger_revalidate = PythonOperator(
    task_id='trigger_vercel_revalidate',
    python_callable=revalidate_vercel,
    dag=dag,
)

# Set dependencies
for task in collect_tasks:
    task >> sync_to_supabase

sync_to_supabase >> trigger_revalidate
