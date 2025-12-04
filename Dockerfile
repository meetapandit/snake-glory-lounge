# Stage 1: Build frontend
FROM node:20-slim AS frontend-build

WORKDIR /app

# Copy frontend package files
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Set API URL for production build
ENV VITE_API_BASE_URL=/api

# Build the application
RUN npm run build

# Stage 2: Combined backend + frontend
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies (for psycopg2 and nginx)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/pyproject.toml ./backend/
RUN pip install --no-cache-dir ./backend

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from stage 1
COPY --from=frontend-build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx-combined.conf /etc/nginx/conf.d/default.conf

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose port
EXPOSE 80

# Start both services
CMD ["/start.sh"]
