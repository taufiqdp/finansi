# Build stage
FROM python:3.12-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --no-warn-script-location --user -r requirements.txt

# Final stage
FROM python:3.12-slim

WORKDIR /app

COPY --from=builder /root/.local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages

COPY . .

EXPOSE 8000

CMD ["python3", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
