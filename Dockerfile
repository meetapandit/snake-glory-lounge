# Frontend build stage
FROM node:20-alpine as frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
ENV VITE_API_BASE_URL=/api
RUN npm run build

# Production stage
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend and install
COPY backend/pyproject.toml .
# Install dependencies directly from pyproject.toml
RUN pip install --no-cache-dir .

# Copy application code
COPY backend/app ./app

# Copy frontend build to static directory
COPY --from=frontend-builder /frontend/dist ./static

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
