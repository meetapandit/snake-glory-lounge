.PHONY: help install dev test test-verbose clean lint format

help:
	@echo "Snake Glory Lounge Backend - Available commands:"
	@echo ""
	@echo "  make install        - Install dependencies"
	@echo "  make dev            - Run development server with auto-reload"
	@echo "  make test           - Run all tests"
	@echo "  make test-verbose   - Run tests with verbose output"
	@echo "  make test-integration - Run integration tests only"
	@echo "  make clean          - Remove cache and temporary files"
	@echo "  make lint           - Run linter (if configured)"
	@echo "  make format         - Format code (if configured)"
	@echo ""

install:
	uv sync

dev:
	uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test:
	uv run pytest

test-verbose:
	uv run pytest -v

test-integration:
	uv run pytest tests/test_integration.py -v

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete

lint:
	@echo "Linting not configured yet"

format:
	@echo "Formatting not configured yet"
