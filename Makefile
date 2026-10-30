.DEFAULT_GOAL := help
COMPOSE ?= docker compose
NAME ?=
MODEL ?= qwen2.5-coder:7b
export NAME MODEL

.PHONY: help setup dev-up dev-down dev-logs dev-ps dev-restart dev-frontend dev-backend install check build migrate migrate-status migrate-create migrate-local migrate-status-local ai-up ai-pull ai-models

help: ## List commands
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z_-]+:.*## / {printf "  %-23s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Create .env if missing (preserve existing settings)
	node scripts/setup-env.mjs

dev-up: setup ## Build and start Docker services; API applies pending migrations
	$(COMPOSE) up --build -d

dev-down: ## Stop Docker services, preserving database and dependency volumes
	$(COMPOSE) --profile local-ai down

dev-logs: ## Follow frontend and API logs
	$(COMPOSE) logs -f frontend backend

dev-ps: ## Show service status and published ports
	$(COMPOSE) ps

dev-restart: ## Recreate frontend and API to load updated environment settings
	$(COMPOSE) up -d --force-recreate frontend backend

dev-frontend: ## Native Vite on 5175 or next available port; proxies Docker API
	npm run dev --prefix frontend

dev-backend: ## Native API (configure backend/.env first); applies migrations
	npm run dev --prefix backend

install: ## Install locked dependencies
	npm run install:all

check: ## Lint, build, and test
	npm run check

build: ## Build production frontend
	npm run build

migrate: setup ## Apply pending migrations to the Docker database
	$(COMPOSE) up -d --wait mongo
	$(COMPOSE) run --rm --no-deps --build backend npm run migrate

migrate-status: setup ## List applied and pending Docker database versions
	$(COMPOSE) up -d --wait mongo
	$(COMPOSE) run --rm --no-deps --build backend npm run migrate:status

migrate-create: ## Create a versioned migration: make migrate-create NAME=add_tags
	cd backend && node scripts/migration-create.js "$$NAME"

migrate-local: ## Apply migrations using backend/.env
	npm run migrate --prefix backend

migrate-status-local: ## Show migration status using backend/.env
	npm run migrate:status --prefix backend

ai-up: setup ## Start local Ollama
	$(COMPOSE) --profile local-ai up -d ollama

ai-pull: ai-up ## Download default local model; set MODEL to match AI_MODEL for another model
	$(COMPOSE) exec ollama ollama pull "$$MODEL"

ai-models: ## List free hosted models with JSON support from the public catalogue
	npm run ai:models --prefix backend
