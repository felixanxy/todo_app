#!/bin/bash
# deploy.sh - Deployment script for Todo App

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOCKER_IMAGE="${DOCKER_IMAGE:-devops-todo-app}"
CONTAINER_NAME="todo-app"
APP_PORT=3000

echo -e "${GREEN}🚀 Starting deployment process...${NC}"

# Function to check if container is healthy
check_health() {
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}🏥 Checking application health...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:${APP_PORT}/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Application is healthy!${NC}"
            return 0
        fi
        echo "⏳ Attempt $attempt/$max_attempts - waiting for application..."
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ Health check failed after $max_attempts attempts${NC}"
    return 1
}

# Function to rollback
rollback() {
    echo -e "${RED}⚠️  Deployment failed! Rolling back...${NC}"
    
    # Stop new container
    docker stop ${CONTAINER_NAME} 2>/dev/null || true
    docker rm ${CONTAINER_NAME} 2>/dev/null || true
    
    # Start old container if backup exists
    if docker ps -a | grep -q "${CONTAINER_NAME}-backup"; then
        echo "🔄 Restoring previous version..."
        docker start ${CONTAINER_NAME}-backup
        docker rename ${CONTAINER_NAME}-backup ${CONTAINER_NAME}
        echo -e "${GREEN}✅ Rollback completed${NC}"
    else
        echo -e "${RED}❌ No backup container found${NC}"
    fi
    
    exit 1
}

# Main deployment process
echo "📥 Pulling latest Docker image..."
if ! docker pull ${DOCKER_IMAGE}:latest; then
    echo -e "${RED}❌ Failed to pull Docker image${NC}"
    exit 1
fi

# Backup current container if exists
if docker ps | grep -q ${CONTAINER_NAME}; then
    echo "💾 Backing up current container..."
    docker stop ${CONTAINER_NAME}
    docker rename ${CONTAINER_NAME} ${CONTAINER_NAME}-backup
fi

# Start new container
echo "▶️  Starting new container..."
if ! docker run -d \
    --name ${CONTAINER_NAME} \
    --restart unless-stopped \
    -p ${APP_PORT}:${APP_PORT} \
    -e NODE_ENV=production \
    ${DOCKER_IMAGE}:latest; then
    echo -e "${RED}❌ Failed to start container${NC}"
    rollback
fi

# Health check
if ! check_health; then
    echo -e "${RED}❌ New deployment failed health check${NC}"
    docker logs ${CONTAINER_NAME}
    rollback
fi

# Cleanup old backup
if docker ps -a | grep -q "${CONTAINER_NAME}-backup"; then
    echo "🧹 Removing old backup..."
    docker rm ${CONTAINER_NAME}-backup
fi

# Cleanup old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -af --filter "until=48h"

echo -e "${GREEN}✨ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Application is running on http://localhost:${APP_PORT}${NC}"