#!/bin/bash

# Chalk Fitness App - Quick Deployment Script
# This script helps you deploy the Chalk app quickly

set -e

echo "🏋️‍♂️ Chalk Fitness App Deployment Script"
echo "=========================================="

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is required but not installed."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is required but not installed."
        exit 1
    fi
    
    echo "✅ Requirements check passed"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
}

# Build the application
build_app() {
    echo "🔨 Building application..."
    npm run build
    echo "✅ Build completed successfully"
}

# Run tests
run_tests() {
    echo "🧪 Running tests..."
    npm run test -- --run
    echo "✅ All tests passed"
}

# Deploy to Vercel (Frontend)
deploy_frontend() {
    echo "🚀 Deploying frontend to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    cd client
    vercel --prod
    cd ..
    echo "✅ Frontend deployed to Vercel"
}

# Deploy to Railway (Backend)
deploy_backend() {
    echo "🚂 Deploying backend to Railway..."
    
    if ! command -v railway &> /dev/null; then
        echo "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    cd server
    railway login
    railway up
    cd ..
    echo "✅ Backend deployed to Railway"
}

# Docker deployment
deploy_docker() {
    echo "🐳 Deploying with Docker..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is required for this deployment method."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is required for this deployment method."
        exit 1
    fi
    
    echo "Building and starting containers..."
    docker-compose up --build -d
    echo "✅ Application deployed with Docker"
}

# Main menu
show_menu() {
    echo ""
    echo "Choose deployment method:"
    echo "1) Vercel + Railway (Recommended)"
    echo "2) Docker Compose"
    echo "3) Build only (no deployment)"
    echo "4) Run tests only"
    echo "5) Exit"
    echo ""
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            check_requirements
            install_dependencies
            build_app
            run_tests
            deploy_frontend
            deploy_backend
            echo "🎉 Deployment completed! Check your Vercel and Railway dashboards."
            ;;
        2)
            check_requirements
            deploy_docker
            echo "🎉 Docker deployment completed! App running at http://localhost"
            ;;
        3)
            check_requirements
            install_dependencies
            build_app
            echo "✅ Build completed successfully"
            ;;
        4)
            check_requirements
            install_dependencies
            run_tests
            ;;
        5)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Please try again."
            show_menu
            ;;
    esac
}

# Environment setup reminder
setup_reminder() {
    echo ""
    echo "🔧 Before deploying, make sure you have:"
    echo "   1. Set up your environment variables (.env files)"
    echo "   2. Configured Clerk authentication"
    echo "   3. Set up your database"
    echo "   4. Reviewed the DEPLOYMENT_GUIDE.md"
    echo ""
    read -p "Have you completed the setup? (y/n): " setup_done
    
    if [[ $setup_done != "y" && $setup_done != "Y" ]]; then
        echo "📖 Please review DEPLOYMENT_GUIDE.md and complete the setup first."
        exit 0
    fi
}

# Start the script
setup_reminder
show_menu
