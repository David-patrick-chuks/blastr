# GAIA Backend - Docker Deployment Guide

## Quick Start

### Development with Docker Compose

1. **Create `.env` file** in the backend directory with your environment variables:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/gaia_db
PORT=5000
NODE_ENV=production
```

1. **Start the services**:

```bash
cd backend
docker-compose up -d
```

1. **View logs**:

```bash
docker-compose logs -f backend
```

1. **Stop services**:

```bash
docker-compose down
```

### Production Deployment

#### Build the Docker image

```bash
npm run docker:build
```

#### Run the container

```bash
docker run -d \
  --name gaia-backend \
  -p 5000:5000 \
  --env-file .env \
  gaia-backend
```

### Using Docker Compose Scripts

```bash
# Build and start all services
npm run docker:up

# View backend logs
npm run docker:logs

# Stop all services
npm run docker:down
```

## Environment Variables

Required environment variables:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GEMINI_API_KEY` - Google Gemini API key
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (production/development)

## Health Check

The backend includes a health check endpoint at `/health` that returns:

```json
{
  "status": "OK",
  "timestamp": "2026-01-27T10:15:35.000Z"
}
```

## Database Initialization

After starting the services, initialize the database:

```bash
docker-compose exec backend npm run init:db
```

## Troubleshooting

### Check container status

```bash
docker ps
```

### View all logs

```bash
docker-compose logs
```

### Restart services

```bash
docker-compose restart
```

### Remove volumes and start fresh

```bash
docker-compose down -v
docker-compose up -d
```
