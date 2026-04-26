# Invoice API

## Installation

```bash
nvm use
npm ci
```

## Setup

### 1. Configure Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your values:
- `API_KEY`: Your API key
- `ARCA_ACCESS_TOKEN`: ARCA/AFIP access token
- `ARCA_CUIT`: Your CUIT

### 2. Start Dependencies

```bash
docker-compose up -d
```

### 3. Run Development Server

```bash
npm run dev
```

The server will start on port 3000 (or the port specified in `.env`).

### Troubleshooting

1. Testing issues: If you got a different DEFAULT version of Node.js on your terminal than the one specified in `.nvmrc`, run:

```bash
nvm alias default $(cat .nvmrc)
```
IF the error persists, checko .zshrc or .bash_profile to see the configuration for NVM


## API Documentation

### Swagger UI

Access the interactive API documentation at:
```
http://localhost:3000/api-docs
```

### Generate TypeScript Types

TypeScript types are auto-generated from the OpenAPI schema. To regenerate them after modifying `schemas/openapi.yaml`:

```bash
npm run generate:api
```

Generated types are located at:
```
src/infrastructure/adapters/inbound/http/generated/api-types.ts
```

**Note**: This file is auto-generated. Do not edit manually.

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

## Available Scripts

### `npm run dev`
Runs the project in **development mode** using `tsx watch`:
- Starts the server directly from TypeScript source without compiling
- Watches for file changes and automatically restarts when modifications are detected
- Useful during development to see changes in real-time

### `npm run build`
**Compiles** the TypeScript project to JavaScript using the TypeScript compiler (`tsc`):
- Transpiles all `.ts` files to `.js` according to `tsconfig.json` configuration
- Generates compiled files in the `dist/` directory
- Does not execute the code, only compiles it
- Used before deploying to production

### `npm start`
Runs the project in **production mode**:
- Executes the compiled JavaScript code from `dist/index.js`
- Requires running `npm run build` beforehand
- Does not watch for changes or recompile automatically
- More efficient for production as it runs native JavaScript

### `npm run prod`
Complete production workflow that runs in sequence:
1. `npm run generate:api` - Generates TypeScript types from OpenAPI schema
2. `npm run build` - Compiles TypeScript to JavaScript
3. `npm run start` - Runs the compiled application
