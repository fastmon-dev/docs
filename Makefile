.PHONY: help dev build start test lint lint-prose typecheck format format-check generate-api draft-changelog

.DEFAULT: help

help:
	@echo "make dev          – Run Next.js dev server bound to 0.0.0.0 (LAN/devcontainer access)"
	@echo "make build        – Regenerate API reference + static-export to ./out"
	@echo "make start        – Serve the built ./out locally"
	@echo "make test         – Run type check, lint, and format check"
	@echo "make lint         – Run ESLint"
	@echo "make lint-prose   – Check changelog copy for banned punctuation / phrasing"
	@echo "make typecheck    – Run TypeScript type checking (fumadocs-mdx + next typegen + tsc)"
	@echo "make format       – Format code with Prettier"
	@echo "make format-check – Check formatting without changes"
	@echo "make generate-api – Regenerate the API reference from the production OpenAPI document"
	@echo "make draft-changelog – Draft changelog entries from backend/frontend/tracker + OpenAPI diff"

dev:
	npm run dev -- -H 0.0.0.0

build:
	npm run build

start:
	npm run start

test: typecheck lint lint-prose format-check

lint:
	npm run lint

lint-prose:
	npm run lint:prose

typecheck:
	npm run types:check

format:
	npm run format

format-check:
	npm run format:check

generate-api:
	npm run generate:api

draft-changelog:
	npm run draft:changelog
