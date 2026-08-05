FROM apache/airflow:2.9.2

USER root
# Install docker cli to run collector container via DockerOperator/BashOperator
RUN apt-get update && \
    apt-get install -y docker.io && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
RUN usermod -aG docker airflow

USER airflow
RUN pip install apache-airflow-providers-docker requests
