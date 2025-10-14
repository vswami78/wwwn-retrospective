#!/bin/bash

# WWWN Cloud Run Deployment Script
# Usage: ./deploy.sh [project-id] [region]

set -e

# Configuration
PROJECT_ID="${1:-your-project-id}"
REGION="${2:-us-west1}"
SERVICE_BACKEND="wwwn-backend"
SERVICE_FRONTEND="wwwn-frontend"

echo "🚀 Deploying WWWN to Google Cloud Run"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Set the project
echo "📦 Setting GCP project..."
gcloud config set project $PROJECT_ID

# Deploy backend
echo ""
echo "🔨 Building and deploying backend..."
cd server
gcloud run deploy $SERVICE_BACKEND \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --port 8080 \
  --set-env-vars "NODE_ENV=production,PORT=8080,DEFAULT_BOARD_TTL_DAYS=7"

# Get backend URL
BACKEND_URL=$(gcloud run services describe $SERVICE_BACKEND --region $REGION --format 'value(status.url)')
echo "✅ Backend deployed at: $BACKEND_URL"

cd ..

# Deploy frontend with backend URL
echo ""
echo "🔨 Building and deploying frontend..."
cd client
gcloud run deploy $SERVICE_FRONTEND \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --memory 256Mi \
  --cpu 1 \
  --port 8080 \
  --set-build-env-vars "VITE_API_URL=$BACKEND_URL/api"

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe $SERVICE_FRONTEND --region $REGION --format 'value(status.url)')
echo "✅ Frontend deployed at: $FRONTEND_URL"

cd ..

# Update backend CORS to allow frontend
echo ""
echo "🔧 Updating backend CORS configuration..."
cd server
gcloud run services update $SERVICE_BACKEND \
  --region $REGION \
  --update-env-vars "CORS_ORIGIN=$FRONTEND_URL"

cd ..

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Backend URL:  $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo "🌐 Open your app: $FRONTEND_URL"
