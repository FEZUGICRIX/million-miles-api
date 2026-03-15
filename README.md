# 🚗 CarSensor Scraper API

Automated system for collecting car data from the Japanese website
[CarSensor.net](https://www.carsensor.net) with REST API for accessing collected
data.

## 📋 Project Description

This backend application:

- **Automatically collects** car data from CarSensor.net every hour
- **Translates** Japanese brand names to English
- **Normalizes** prices (万円 → JPY) and mileage
- **Provides REST API** for data access with pagination, filtering, and sorting
- **Protected by JWT authentication** and rate limiting

## 🛠 Technology Stack

### Backend Framework

- **NestJS** - progressive Node.js framework
- **TypeScript** - typed JavaScript

### Database

- **PostgreSQL** - relational database
- **Prisma ORM** - modern ORM with type-safety

### Scraping

- **Playwright** - browser automation
- **Playwright-Extra** + **Stealth Plugin** - anti-bot protection bypass

### Queues and Scheduler

- **BullMQ** - task queues on Redis
- **@nestjs/schedule** - cron jobs

### Security and Validation

- **Passport.js** + **JWT** - authentication
- **class-validator** - DTO validation
- **@nestjs/throttler** - rate limiting

### Monitoring

- **@nestjs/terminus** - health checks

## 📁 Project Structure

```
src/
├── core/                    # Application core
│   ├── config/             # Configuration
│   ├── filters/            # Global error filters
│   └── prisma/             # Prisma service
├── modules/                # Business modules
│   ├── auth/              # JWT authentication
│   ├── cars/              # Cars API
│   ├── scraper/           # CarSensor scraping
│   └── health/            # Health checks
└── main.ts                # Entry point

prisma/
├── models/                # Prisma models (separated)
│   ├── car.prisma
│   ├── user.prisma
│   └── scrape-log.prisma
└── schema.prisma          # Main schema
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL >= 14
- Redis >= 6

### Installation

```bash
# Clone repository
git clone <repository-url>
cd test-task-backend

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env file

# Start PostgreSQL and Redis (via Docker)
docker-compose up -d

# Apply migrations
pnpm prisma migrate dev

# Start in development mode
pnpm start:dev
```

### Environment Variables

```env
# PostgreSQL
POSTGRES_URL="postgresql://user:password@localhost:5432/db?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=123456

# Application
PORT=4200

# JWT
JWT_SECRET=your-secret-key-change-in-production
```

## 📡 API Endpoints

### Authentication

#### POST `/auth/login`

Get JWT token

**Request:**

```json
{
	"username": "admin",
	"password": "admin123"
}
```

**Response:**

```json
{
	"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET `/auth/me`

Get current user information (requires JWT)

---

### Cars

> ⚠️ All endpoints require JWT token in `Authorization: Bearer <token>` header

#### GET `/cars`

Get list of cars with pagination and filtering

**Query parameters:**

- `page` (number, default: 1) - page number
- `limit` (number, default: 20, max: 100) - items per page
- `brand` (string, optional) - filter by brand
- `minPrice` (number, optional) - minimum price
- `maxPrice`(number, optional) - maximum price
- `sort` (enum, optional) - sorting:
  - `price_asc` - by price (ascending)
  - `price_desc` - by price (descending)
  - `year_desc` - by year (newest first)
  - `mileage_asc` - by mileage (lowest first)

**Example request:**

```bash
curl "http://localhost:4200/cars?page=1&limit=10&brand=Toyota&sort=price_asc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
	"data": [
		{
			"id": "uuid",
			"externalId": "ABC123",
			"brand": "Toyota",
			"model": "Corolla",
			"year": 2020,
			"mileage": 50000,
			"price": 2500000,
			"currency": "JPY",
			"images": ["https://..."],
			"sourceUrl": "https://www.carsensor.net/...",
			"createdAt": "2024-01-01T00:00:00Z",
			"updatedAt": "2024-01-01T00:00:00Z"
		}
	],
	"meta": {
		"total": 150,
		"page": 1,
		"lastPage": 15,
		"hasNextPage": true
	}
}
```

#### GET `/cars/:id`

Get detailed car information

**Response:**

```json
{
	"id": "uuid",
	"externalId": "ABC123",
	"brand": "Toyota",
	"model": "Corolla",
	"year": 2020,
	"mileage": 50000,
	"price": 2500000,
	"currency": "JPY",
	"images": ["https://..."],
	"sourceUrl": "https://www.carsensor.net/...",
	"createdAt": "2024-01-01T00:00:00Z",
	"updatedAt": "2024-01-01T00:00:00Z"
}
```

---

### Scraper

#### POST `/scraper/trigger`

Manually trigger scraping

**Response:**

```json
{
	"message": "Scrape completed",
	"success": true,
	"carsFound": 42
}
```

---

### Health Check

#### GET `/health`

Check service status

**Response:**

```json
{
	"status": "ok",
	"info": {
		"database": {
			"status": "up"
		}
	},
	"error": {},
	"details": {
		"database": {
			"status": "up"
		}
	}
}
```

## ⚙️ Automatic Scraping

The scraper runs automatically **every hour** (cron: `0 * * * *`) via BullMQ.

### Scraping Process:

1. Opens CarSensor.net with Stealth Plugin
2. Extracts car data:
   - Brand (translates from Japanese)
   - Model
   - Year
   - Mileage
   - Price (converts 万円 → JPY)
   - Images
   - Source URL
3. Saves/updates in DB via `upsert`
4. Logs result to `scrape_logs`

### Supported Brands:

| Japanese           | English       |
| ------------------ | ------------- |
| 日産               | Nissan        |
| トヨタ             | Toyota        |
| ホンダ             | Honda         |
| マツダ             | Mazda         |
| スバル             | Subaru        |
| スズキ             | Suzuki        |
| ダイハツ           | Daihatsu      |
| 三菱               | Mitsubishi    |
| レクサス           | Lexus         |
| メルセデス・ベンツ | Mercedes-Benz |
| アウディ           | Audi          |
| フォルクスワーゲン | Volkswagen    |
| ポルシェ           | Porsche       |
| フォード           | Ford          |
| シボレー           | Chevrolet     |
| テスラ             | Tesla         |

## 🔒 Security

### JWT Authentication

- All `/cars` endpoints are JWT protected
- Token valid for 24 hours
- Hardcoded credentials: `admin:admin123`

### Rate Limiting

- 10 requests per minute per IP
- Applied globally

### Exception Handling

- Automatic conversion of Prisma errors to HTTP statuses
- 404 for non-existent records
- 409 for uniqueness conflicts

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:cov
```

## 📊 Database

### Prisma Studio

```bash
pnpm db:studio
```

### Migrations

```bash
# Create migration
pnpm prisma migrate dev --name migration_name

# Apply migrations
pnpm prisma migrate deploy

# Generate Prisma Client
pnpm prisma generate
```

## 🐳 Docker

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f
```

## 📝 Scripts

```bash
# Development
pnpm start:dev          # Start with hot-reload
pnpm start:debug        # Start with debugger

# Production
pnpm build              # Build
pnpm start:prod         # Run production build

# Code Quality
pnpm lint               # ESLint
pnpm format             # Prettier

# Database
pnpm db:studio          # Prisma Studio UI
```

## 🏗 Architectural Decisions

### FSD-like Structure

- `core/` - infrastructure code
- `modules/` - business logic
- `shared/` - common utilities

### Modular Architecture

- Each module is independent
- Dependency Injection via NestJS
- Clear separation of concerns

### Error Handling

- Global exception filters
- DTO-level validation
- All errors logged

## 🔧 Troubleshooting

### Scraper doesn't find cars

- Check selectors in `scraper.service.ts`
- CarSensor may have changed HTML structure
- Check logs: `docker-compose logs -f`

### JWT token doesn't work

- Check `JWT_SECRET` in `.env`
- Ensure token hasn't expired (24 hours)
- Check header format: `Authorization: Bearer <token>`

### Rate limiting blocks requests

- Wait 60 seconds
- Change limits in `app.module.ts`

## 📄 License

UNLICENSED - Private project

## 👤 Author

Million Miles Test Task

---

**Version:** 0.0.1 **Node.js:** >= 18 **Package Manager:** pnpm
