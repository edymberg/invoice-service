# Invoice API

## Installation

```bash
nvm use
npm ci
```

## Setup

### 1. Start Dependencies

```bash
docker-compose up -d
```

### 2. Configure Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your values:
- `API_KEY`: Your API key
- `ARCA_ACCESS_TOKEN`: ARCA/AFIP access token
- `ARCA_CUIT`: Your CUIT

### 3. Run Development Server

```bash
npm run dev
```

The server will start on port 3000 (or the port specified in `.env`).

## Docker Commands

```bash
# Start MongoDB
docker-compose up -d

# Stop MongoDB
docker-compose down

# View MongoDB logs
docker-compose logs -f mongodb

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```
