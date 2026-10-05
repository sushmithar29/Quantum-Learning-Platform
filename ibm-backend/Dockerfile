FROM python:3.11-slim

WORKDIR /app

# Install build tools for Qiskit C extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ libgomp1 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Remove the GPU extra line for Cloud Run (no CUDA)
RUN sed 's/\[gpu\]//' requirements.txt > requirements_docker.txt && \
    pip install --no-cache-dir -r requirements_docker.txt

COPY main.py .

# Non-root user for security
RUN useradd -m appuser
USER appuser

# Cloud Run injects PORT; default to 8001 locally
ENV PORT=8001
EXPOSE 8001

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT --log-level info"]
