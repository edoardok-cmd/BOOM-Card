.PHONY: help install dev build test lint format clean deploy-staging deploy-production docker-build docker-up docker-down db-migrate db-seed setup-env check-env

# Variables
NODE_ENV ?= development
PORT ?= 3000
DATABASE_URL ?= postgresql://postgres:postgres@localhost:5432/boom_card
REDIS_URL ?= redis://localhost:6379
DOCKER_COMPOSE = docker-compose
NPM = npm

# Colors for terminal output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
NC = \033[0m

# Default target
help:
	@echo "$(GREEN)BOOM Card Platform - Available Commands$(NC)"
	@echo "========================================"
	@echo "$(YELLOW)Development:$(NC)"
	@echo "  make install          - Install all dependencies"
	@echo "  make dev             - Start development servers"
	@echo "  make build           - Build production assets"
	@echo "  make test            - Run all tests"
	@echo "  make lint            - Run linting checks"
	@echo "  make format          - Format code with prettier"
	@echo ""
	@echo "$(YELLOW)Database:$(NC)"
	@echo "  make db-migrate      - Run database migrations"
	@echo "  make db-seed         - Seed database with sample data"
	@echo "  make db-reset        - Reset database (drop, create, migrate, seed)"
	@echo ""
	@echo "$(YELLOW)Docker:$(NC)"
	@echo "  make docker-build    - Build Docker containers"
	@echo "  make docker-up       - Start Docker containers"
	@echo "  make docker-down     - Stop Docker containers"
	@echo "  make docker-logs     - Show Docker container logs"
	@echo ""
	@echo "$(YELLOW)Deployment:$(NC)"
	@echo "  make deploy-staging  - Deploy to staging environment"
	@echo "  make deploy-production - Deploy to production environment"
	@echo ""
	@echo "$(YELLOW)Utilities:$(NC)"
	@echo "  make clean           - Remove build artifacts and node_modules"
	@echo "  make setup-env       - Setup environment files"
	@echo "  make check-env       - Verify environment configuration"

# Install dependencies
install:
	@echo "$(GREEN)Installing dependencies...$(NC)"
	cd frontend && $(NPM) ci
	cd backend && $(NPM) ci
	cd shared && $(NPM) ci
	@echo "$(GREEN)Dependencies installed successfully!$(NC)"

# Development commands
dev:
	@echo "$(GREEN)Starting development servers...$(NC)"
	@make check-env
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml up -d postgres redis
	@sleep 3
	@make db-migrate
	@echo "$(YELLOW)Starting backend server...$(NC)"
	cd backend && $(NPM) run dev &
	@echo "$(YELLOW)Starting frontend server...$(NC)"
	cd frontend && $(NPM) run dev &
	@echo "$(GREEN)Development servers running!$(NC)"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:4000"
	@echo "API Docs: http://localhost:4000/api-docs"

# Build for production
build:
	@echo "$(GREEN)Building for production...$(NC)"
	cd shared && $(NPM) run build
	cd backend && $(NPM) run build
	cd frontend && $(NPM) run build
	@echo "$(GREEN)Build completed!$(NC)"

# Testing
test:
	@echo "$(GREEN)Running tests...$(NC)"
	cd shared && $(NPM) run test
	cd backend && $(NPM) run test
	cd frontend && $(NPM) run test
	@echo "$(GREEN)All tests completed!$(NC)"

test-watch:
	@echo "$(GREEN)Running tests in watch mode...$(NC)"
	cd backend && $(NPM) run test:watch &
	cd frontend && $(NPM) run test:watch &

test-coverage:
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	cd backend && $(NPM) run test:coverage
	cd frontend && $(NPM) run test:coverage

# Code quality
lint:
	@echo "$(GREEN)Running linters...$(NC)"
	cd shared && $(NPM) run lint
	cd backend && $(NPM) run lint
	cd frontend && $(NPM) run lint
	@echo "$(GREEN)Linting completed!$(NC)"

format:
	@echo "$(GREEN)Formatting code...$(NC)"
	cd shared && $(NPM) run format
	cd backend && $(NPM) run format
	cd frontend && $(NPM) run format
	@echo "$(GREEN)Code formatted!$(NC)"

# Database commands
db-migrate:
	@echo "$(GREEN)Running database migrations...$(NC)"
	cd backend && $(NPM) run migrate:latest
	@echo "$(GREEN)Migrations completed!$(NC)"

db-migrate-rollback:
	@echo "$(YELLOW)Rolling back last migration...$(NC)"
	cd backend && $(NPM) run migrate:rollback
	@echo "$(GREEN)Rollback completed!$(NC)"

db-seed:
	@echo "$(GREEN)Seeding database...$(NC)"
	cd backend && $(NPM) run seed:run
	@echo "$(GREEN)Database seeded!$(NC)"

db-reset:
	@echo "$(RED)Resetting database...$(NC)"
	cd backend && $(NPM) run db:reset
	@make db-migrate
	@make db-seed
	@echo "$(GREEN)Database reset completed!$(NC)"

# Docker commands
docker-build:
	@echo "$(GREEN)Building Docker containers...$(NC)"
	$(DOCKER_COMPOSE) build --no-cache
	@echo "$(GREEN)Docker build completed!$(NC)"

docker-up:
	@echo "$(GREEN)Starting Docker containers...$(NC)"
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)Docker containers started!$(NC)"

docker-down:
	@echo "$(YELLOW)Stopping Docker containers...$(NC)"
	$(DOCKER_COMPOSE) down
	@echo "$(GREEN)Docker containers stopped!$(NC)"

docker-logs:
	$(DOCKER_COMPOSE) logs -f

docker-clean:
	@echo "$(RED)Cleaning Docker resources...$(NC)"
	$(DOCKER_COMPOSE) down -v --remove-orphans
	docker system prune -f
	@echo "$(GREEN)Docker cleanup completed!$(NC)"

# Deployment commands
deploy-staging:
	@echo "$(YELLOW)Deploying to staging environment...$(NC)"
	@make check-env
	@make test
	@make build
	./scripts/deploy-staging.sh
	@echo "$(GREEN)Staging deployment completed!$(NC)"

deploy-production:
	@echo "$(RED)Deploying to PRODUCTION environment...$(NC)"
	@echo "$(YELLOW)Are you sure? [y/N]$(NC)"
	@read -r REPLY; \
	if [ "$$REPLY" = "y" ]; then \
		make check-env; \
		make test; \
		make build; \
		./scripts/deploy-production.sh; \
		echo "$(GREEN)Production deployment completed!$(NC)"; \
	else \
		echo "$(YELLOW)Deployment cancelled.$(NC)"; \
	fi

# Environment setup
setup-env:
	@echo "$(GREEN)Setting up environment files...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env from .env.example"; \
	fi
	@if [ ! -f frontend/.env.local ]; then \
		cp frontend/.env.example frontend/.env.local; \
		echo "Created frontend/.env.local"; \
	fi
	@if [ ! -f backend/.env ]; then \
		cp backend/.env.example backend/.env; \
		echo "Created backend/.env"; \
	fi
	@echo "$(GREEN)Environment files created!$(NC)"
	@echo "$(YELLOW)Please update the environment files with your configuration.$(NC)"

check-env:
	@echo "$(GREEN)Checking environment configuration...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(RED)Error: .env file not found!$(NC)"; \
		echo "Run 'make setup-env' to create it."; \
		exit 1; \
	fi
	@if [ ! -f frontend/.env.local ]; then \
		echo "$(RED)Error: frontend/.env.local not found!$(NC)"; \
		exit 1; \
	fi
	@if [ ! -f backend/.env ]; then \
		echo "$(RED)Error: backend/.env not found!$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Environment configuration OK!$(NC)"

# Utility commands
clean:
	@echo "$(RED)Cleaning build artifacts...$(NC)"
	rm -rf frontend/.next frontend/out frontend/node_modules
	rm -rf backend/dist backend/node_modules
	rm -rf shared/dist shared/node_modules
	rm -rf .turbo
	@echo "$(GREEN)Cleanup completed!$(NC)"

clean-cache:
	@echo "$(YELLOW)Clearing caches...$(NC)"
	rm -rf frontend/.next/cache
	$(NPM) cache clean --force
	@echo "$(GREEN)Cache cleared!$(NC)"

# Development utilities
generate-types:
	@echo "$(GREEN)Generating TypeScript types...$(NC)"
	cd backend && $(NPM) run generate:types
	@echo "$(GREEN)Types generated!$(NC)"

analyze-bundle:
	@echo "$(GREEN)Analyzing bundle size...$(NC)"
	cd frontend && $(NPM) run analyze
	@echo "$(GREEN)Bundle analysis completed!$(NC)"

# Security commands
security-check:
	@echo "$(GREEN)Running security audit...$(NC)"
	cd frontend && $(NPM) audit
	cd backend && $(NPM) audit
	cd shared && $(NPM) audit
	@echo "$(GREEN)Security audit completed!$(NC)"

security-fix:
	@echo "$(YELLOW)Attempting to fix security vulnerabilities...$(NC)"
	cd frontend && $(NPM) audit fix
	cd backend && $(NPM) audit fix
	cd shared && $(NPM) audit fix
	@echo "$(GREEN)Security fixes applied!$(NC)"

# Performance monitoring
lighthouse:
	@echo "$(GREEN)Running Lighthouse audit...$(NC)"
	cd frontend && $(NPM) run lighthouse
	@echo "$(GREEN)Lighthouse audit completed!$(NC)"

# Monitoring and logs
logs-backend:
	tail -f backend/logs/app.log

logs-frontend:
	cd frontend && $(NPM) run logs

monitor:
	@echo "$(GREEN)Starting monitoring dashboard...$(NC)"
	cd backend && $(NPM) run monitor

# CI/CD helpers
ci-test:
	@make lint
	@make test
	@make build
	@echo "$(GREEN)CI tests passed!$(NC)"

pre-commit:
	@make format
	@make lint
	@make test
	@echo "$(GREEN)Pre-commit checks passed!$(NC)"

# Documentation
docs:
	@echo "$(GREEN)Generating documentation...$(NC)"
	cd backend && $(NPM) run docs:generate
	cd frontend && $(NPM) run docs:generate
	@echo "$(GREEN)Documentation generated!$(NC)"
	@echo "API Docs: http://localhost:4000/api-docs"
	@echo "Frontend Docs: http://localhost:3000/docs"

# Backup commands
backup-db:
	@echo "$(GREEN)Creating database backup...$(NC)"
	./scripts/backup-db.sh
	@echo "$(GREEN)Database backup completed!$(NC)"

restore-db:
	@echo "$(YELLOW)Restoring database from backup...$(NC)"
	@echo "Enter backup filename:"
	@read -r BACKUP_FILE; \
	./scripts/restore-db.sh $$BACKUP_FILE
	@echo "$(GREEN)Database restored!$(NC)"

# Local development helpers
setup-local:
	@make setup-env
	@make install
	@make docker-build
	@make docker-up
	@make db-migrate
	@make db-seed
	@echo "$(GREEN)Local development environment ready!$(NC)"

reset-local:
	@make docker-down
	@make clean
	@make setup-local
	@echo "$(GREEN)Local environment reset completed!$(NC)"
