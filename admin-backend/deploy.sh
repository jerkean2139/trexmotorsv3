#!/bin/bash

# Deploy admin-backend to Vercel
echo "Deploying T-Rex Motors Admin Backend to Vercel..."

# Ensure we're in the admin-backend directory
cd "$(dirname "$0")"

# Build the project
echo "Building project..."
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
npx vercel --prod --yes

echo "Deployment complete!"
echo "Test your deployment at: https://YOUR-NEW-VERCEL-URL/api/public/vehicles"