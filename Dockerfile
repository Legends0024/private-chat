# STAGE 1: Build the React Frontend
FROM node:18-alpine AS build-stage
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# STAGE 2: Run the Flask Backend
FROM python:3.10-slim
WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy built frontend from Stage 1
COPY --from=build-stage /app/frontend/dist ./frontend/dist

# Copy backend code
COPY backend/ ./backend/

# Set environment variables
ENV PORT=10000
EXPOSE 10000

# Start Gunicorn from the backend directory
WORKDIR /app/backend
CMD ["gunicorn", "-k", "eventlet", "-w", "1", "--bind", "0.0.0.0:10000", "app:app"]
