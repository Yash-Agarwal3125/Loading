.PHONY: dev api web ml migrate test lint

dev:            ## everything, local
	docker compose -f infra/docker-compose.yml up -d
	cd apps/operator && npm run dev

api:
	cd services/api && uvicorn app.main:app --reload

web:
	cd apps/operator && npm run dev

migrate:
	cd services/api && alembic upgrade head

test:
	cd services/api && pytest
	cd apps/operator && npm test

lint:
	cd services/api && ruff check .
	cd apps/operator && npm run lint
