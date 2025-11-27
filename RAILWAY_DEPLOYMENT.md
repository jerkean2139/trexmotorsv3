# Railway Deployment Guide for T-Rex Motors

## Overview
This application is configured for deployment on Railway with a unified frontend and backend.

## Quick Deploy

### 1. Connect GitHub Repository
1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Railway will auto-detect the Node.js app

### 2. Add PostgreSQL Database
1. In your Railway project dashboard, click **Create** → **Database** → **PostgreSQL**
2. Wait for the database to deploy
3. Click on your web service → **Variables**
4. Click **Add Variable** and select `DATABASE_URL` from the dropdown (references `${{Postgres.DATABASE_URL}}`)

### 3. Set Environment Variables
Add these variables in Railway dashboard (Settings → Variables):

```
NODE_ENV=production
SESSION_SECRET=your-secure-random-string
VITE_ENABLE_ADMIN=true
```

### 4. Generate Public Domain
1. Go to your service → **Settings** → **Networking**
2. Click **Generate Domain**
3. Your app will be live at `https://your-app.up.railway.app`

## Database Migration

### Push Schema to Railway PostgreSQL
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run database migration using Railway's environment
railway run npm run db:push
```

### Or migrate from local/Replit database:
```bash
# Export from source database
pg_dump $DATABASE_URL > backup.sql

# Import to Railway (get connection string from Railway dashboard)
psql "your-railway-database-url" < backup.sql
```

## Build Configuration

Railway uses the following from `railway.toml`:
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Health Check**: `/api/health`

## Local Development with Railway Database

```bash
# Run locally but connect to Railway's PostgreSQL
railway run npm run dev
```

## Admin Access

Admin login is available at `/admin`:
- Username: `admin`
- Password: Set via environment or use default `trex2025!`

## Troubleshooting

### App Not Starting
- Check Railway logs in the Deployments tab
- Verify `DATABASE_URL` is set correctly
- Ensure `NODE_ENV=production` is set

### Database Connection Issues
- Verify `DATABASE_URL` variable references `${{Postgres.DATABASE_URL}}`
- Check that PostgreSQL service is running

### CORS Issues
- Not applicable - frontend and backend are on the same domain

## File Structure

```
/
├── client/           # React frontend (builds to dist/)
├── server/           # Express backend
├── shared/           # Shared TypeScript schemas
├── railway.toml      # Railway configuration
└── package.json      # Build scripts
```

## Pricing

- Railway Free Tier: $5/month credit included
- PostgreSQL included in all tiers
- Usage-based pricing for additional resources
