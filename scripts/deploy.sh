#!/bin/bash

# AgriAI Decision Support System - Deployment Script
# This script automates the deployment process for the entire system

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_ENV=${1:-development}
PROJECT_NAME="agriai-decision-support"

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}AgriAI Decision Support System - Deployment${NC}"
echo -e "${BLUE}Environment: ${DEPLOY_ENV}${NC}"
echo -e "${BLUE}=================================================${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f "./config/.env" ] && [ ! -f "./.env" ]; then
        print_warning ".env file not found. Copying from .env.example"
        if [ -f "./config/.env.example" ]; then
            cp ./config/.env.example ./config/.env
        else
            print_error ".env.example file not found. Please create environment configuration."
            exit 1
        fi
    fi
    
    print_status "Prerequisites check completed."
}

# Setup directories
setup_directories() {
    print_status "Setting up directories..."
    
    mkdir -p uploads
    mkdir -p ml-models/crop_recommendation
    mkdir -p ml-models/yield_prediction
    mkdir -p ml-models/training
    mkdir -p ml-models/data
    mkdir -p database/backups
    mkdir -p logs
    mkdir -p config/ssl
    
    # Set proper permissions
    chmod 755 uploads
    chmod 755 ml-models
    chmod 755 logs
    
    print_status "Directories setup completed."
}

# Build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    case $DEPLOY_ENV in
        "development")
            docker-compose -f docker-compose.yml up -d --build
            ;;
        "production")
            if [ -f "docker-compose.prod.yml" ]; then
                docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
            else
                print_warning "Production docker-compose file not found. Using development configuration."
                docker-compose -f docker-compose.yml up -d --build
            fi
            ;;
        *)
            print_error "Unknown environment: $DEPLOY_ENV"
            exit 1
            ;;
    esac
    
    print_status "Services deployment completed."
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    echo "Waiting for PostgreSQL..."
    until docker-compose exec -T postgres pg_isready -U agriai_user -d agriai; do
        sleep 2
    done
    
    # Wait for Redis
    echo "Waiting for Redis..."
    until docker-compose exec -T redis redis-cli ping; do
        sleep 2
    done
    
    # Wait for Backend API
    echo "Waiting for Backend API..."
    for i in {1..30}; do
        if curl -f http://localhost:8000/health > /dev/null 2>&1; then
            break
        fi
        sleep 5
        if [ $i -eq 30 ]; then
            print_error "Backend API failed to start within expected time"
            exit 1
        fi
    done
    
    print_status "All services are ready."
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait a bit more for the database to be fully ready
    sleep 10
    
    # Run migrations using the backend container
    docker-compose exec -T backend python -c "
from app.core.database import create_tables
import asyncio
asyncio.run(create_tables())
"
    
    print_status "Database migrations completed."
}

# Initialize ML models
initialize_ml_models() {
    print_status "Initializing ML models..."
    
    docker-compose exec -T backend python -c "
from app.services.ml_service import MLService
ml_service = MLService()
ml_service.save_models()
print('ML models initialized successfully')
"
    
    print_status "ML models initialization completed."
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Create Prometheus configuration if it doesn't exist
    if [ ! -f "./config/prometheus.yml" ]; then
        cat > ./config/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'agriai-backend'
    static_configs:
      - targets: ['backend:8000']
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
  
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
EOF
    fi
    
    print_status "Monitoring setup completed."
}

# Health check
health_check() {
    print_status "Performing health checks..."
    
    # Check backend health
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_status "✓ Backend API is healthy"
    else
        print_error "✗ Backend API health check failed"
        return 1
    fi
    
    # Check database connection
    if docker-compose exec -T postgres pg_isready -U agriai_user -d agriai > /dev/null 2>&1; then
        print_status "✓ PostgreSQL is healthy"
    else
        print_error "✗ PostgreSQL health check failed"
        return 1
    fi
    
    # Check Redis connection
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        print_status "✓ Redis is healthy"
    else
        print_error "✗ Redis health check failed"
        return 1
    fi
    
    print_status "All health checks passed."
}

# Show deployment info
show_deployment_info() {
    echo -e "${BLUE}=================================================${NC}"
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    echo -e "${BLUE}=================================================${NC}"
    echo -e "API Documentation: ${YELLOW}http://localhost:8000/docs${NC}"
    echo -e "Health Check: ${YELLOW}http://localhost:8000/health${NC}"
    echo -e "Grafana Dashboard: ${YELLOW}http://localhost:3000${NC} (admin/admin123)"
    echo -e "Prometheus Metrics: ${YELLOW}http://localhost:9090${NC}"
    echo -e "${BLUE}=================================================${NC}"
    echo -e "To view logs: ${YELLOW}docker-compose logs -f${NC}"
    echo -e "To stop services: ${YELLOW}docker-compose down${NC}"
    echo -e "To restart services: ${YELLOW}docker-compose restart${NC}"
    echo -e "${BLUE}=================================================${NC}"
}

# Main deployment flow
main() {
    check_prerequisites
    setup_directories
    setup_monitoring
    deploy_services
    wait_for_services
    run_migrations
    initialize_ml_models
    health_check
    show_deployment_info
}

# Handle script arguments
case "${1:-help}" in
    "development"|"production")
        main
        ;;
    "stop")
        print_status "Stopping all services..."
        docker-compose down
        print_status "All services stopped."
        ;;
    "restart")
        print_status "Restarting all services..."
        docker-compose restart
        print_status "All services restarted."
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "health")
        health_check
        ;;
    "help"|*)
        echo "AgriAI Decision Support System - Deployment Script"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  development    Deploy in development mode (default)"
        echo "  production     Deploy in production mode"
        echo "  stop          Stop all services"
        echo "  restart       Restart all services"
        echo "  logs          View service logs"
        echo "  health        Run health checks"
        echo "  help          Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 development"
        echo "  $0 production"
        echo "  $0 stop"
        echo "  $0 health"
        ;;
esac