# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

The AgriAI Decision Support System is an AI-driven agricultural platform that provides farmers with personalized crop recommendations based on soil properties, weather data, market trends, and sustainability factors. The system consists of a FastAPI backend, React Native mobile app, machine learning models, and supporting infrastructure.

## Development Commands

### Backend Development
```bash
# Setup and run backend
cd backend
pip install -r requirements.txt
python main.py

# Run backend with Docker
docker-compose up backend

# Run backend tests
cd backend
pytest

# Check backend health
curl http://localhost:8000/health
```

### Mobile App Development
```bash
# Setup mobile app
cd mobile-app
npm install

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build:android  # Android
npm run build:ios      # iOS
```

### Full System Deployment
```bash
# Deploy full system in development mode
./scripts/deploy.sh development

# Deploy in production mode
./scripts/deploy.sh production

# Stop all services
./scripts/deploy.sh stop

# View logs
./scripts/deploy.sh logs

# Run health checks
./scripts/deploy.sh health
```

### Testing and Linting
```bash
# Backend testing
cd backend && pytest

# Mobile app testing and linting
cd mobile-app && npm test && npm run lint

# Run single test (backend)
cd backend && pytest tests/test_specific_module.py

# Run specific mobile test
cd mobile-app && npm test -- --testNamePattern="specific test"
```

## Architecture Overview

### System Architecture
The system follows a microservices architecture with the following key components:

1. **FastAPI Backend** (`backend/`) - REST API server with ML integration
2. **React Native Mobile App** (`mobile-app/`) - Cross-platform mobile application
3. **Machine Learning Services** - Crop recommendation and yield prediction models
4. **Data Processing Pipeline** - Satellite, weather, and market data integration
5. **Database Layer** - PostgreSQL for persistent data, Redis for caching

### Backend Architecture
- **FastAPI Application** (`backend/main.py`) - Main application entry point with middleware setup
- **API Routes** (`app/api/api_v1/`) - RESTful API endpoints organized by feature
- **Core Services** (`app/core/`) - Configuration, database connections, security
- **ML Services** (`app/services/ml_service.py`) - Machine learning model integration
- **Data Services** (`app/services/data_service.py`) - External API integrations (weather, satellite data)
- **Background Tasks** - Celery workers for data processing and model training

### Mobile App Architecture
- **Navigation** - React Navigation with bottom tabs and stack navigation
- **State Management** - Redux Toolkit with Redux Persist for offline capabilities
- **UI Components** - React Native Paper with custom theming
- **Internationalization** - i18next for multilingual support
- **Offline Storage** - SQLite for local data persistence
- **Camera Integration** - Disease detection and image capture

### Data Flow
1. Mobile app collects user location and farm data
2. Backend fetches satellite soil data, weather forecasts, and market prices
3. ML models process combined data to generate crop recommendations
4. Results are cached in Redis and returned to mobile app
5. Background tasks continuously update models and external data

### Key Integrations
- **OpenWeatherMap API** - Weather data and forecasts
- **Bhuvan/Soil Grids APIs** - Satellite-based soil data
- **Market Data APIs** - Agricultural commodity prices
- **PostgreSQL** - User data, farm profiles, historical recommendations
- **Redis** - Caching, session storage, task queues
- **Celery** - Background task processing

## Environment Configuration

The system requires several environment variables for proper operation:

### Required API Keys
- `OPENWEATHER_API_KEY` - OpenWeatherMap API access
- `BHUVAN_API_KEY` - Indian Space Research Organisation satellite data

### Database Configuration
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

### Security Settings
- `SECRET_KEY` - JWT token signing key (must be changed in production)
- `BACKEND_CORS_ORIGINS` - Allowed CORS origins for API access

### Feature Flags
- `ENABLE_SATELLITE_DATA` - Enable/disable satellite data integration
- `ENABLE_IOT_SENSORS` - Enable/disable IoT sensor data processing
- `ENABLE_DISEASE_DETECTION` - Enable/disable crop disease detection features

## Development Workflow

### Adding New API Endpoints
1. Create new endpoint in `backend/app/api/api_v1/endpoints/`
2. Define Pydantic models for request/response validation
3. Add route to `backend/app/api/api_v1/api.py`
4. Update mobile app API client in `mobile-app/src/services/api.js`

### Adding New ML Models
1. Place model files in `ml-models/` directory
2. Update `MLService` class in `backend/app/services/ml_service.py`
3. Add model initialization to deployment script
4. Update API endpoints to use new model predictions

### Mobile App Feature Development
1. Create new screens in `mobile-app/src/screens/`
2. Add navigation routes in `mobile-app/src/navigation/`
3. Create Redux slices in `mobile-app/src/store/slices/`
4. Add internationalization strings in `mobile-app/src/locales/`

## Important Technical Details

### Database Schema
- Users and farm profiles are stored in PostgreSQL
- Recommendation history and analytics data
- Cached external API responses in Redis with TTL

### ML Model Pipeline
- Models are trained using scikit-learn, TensorFlow, and PyTorch
- Crop recommendation uses ensemble methods with soil, weather, and market features
- Yield prediction incorporates historical data and satellite imagery
- Models are retrained periodically using Celery background tasks

### Mobile App Offline Capabilities
- SQLite stores critical data for offline access
- Redux Persist maintains app state across sessions
- Background sync when connectivity is restored
- Cached images and essential data for low-connectivity regions

### Monitoring and Observability
- Prometheus metrics collection on port 9090
- Grafana dashboards on port 3000 (admin/admin123)
- Health check endpoint at `/health`
- Structured logging with Loguru

## Deployment Architecture

The system uses Docker Compose for orchestration with the following services:
- **backend** - FastAPI application server
- **postgres** - Primary database
- **redis** - Cache and task queue
- **celery_worker** - Background task processing
- **celery_beat** - Scheduled tasks
- **nginx** - Reverse proxy and static file serving
- **prometheus** - Metrics collection
- **grafana** - Monitoring dashboards

All services communicate through a dedicated Docker network (`agriai_network`) and use persistent volumes for data storage.