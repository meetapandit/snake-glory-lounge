# Integration Tests

This directory contains integration tests for the Snake Glory Lounge backend API.

## Overview

Integration tests verify the complete flow of the application, testing multiple components working together. These tests use an in-memory SQLite database to ensure isolation and repeatability.

## Test Database

- **Database Type**: In-memory SQLite (`sqlite:///:memory:`)
- **Isolation**: Fresh database created for each test
- **Seed Data**: Automatically populated with mock data via `init_db()`

## Running Integration Tests

```bash
# Run all integration tests
uv run pytest backend/tests_integration/ -v

# Run specific test file
uv run pytest backend/tests_integration/test_integration.py -v

# Run with coverage
uv run pytest backend/tests_integration/ --cov=app --cov-report=html
```

## Test Coverage

### Complete User Journey
- User signup and authentication
- Score submission
- Leaderboard verification
- Logout flow

### Leaderboard Filtering
- Filter by game mode (walls, pass-through)
- Verify filtering accuracy

### Spectator Endpoints
- Active players listing
- Individual player game state
- Error handling for non-existent players

### Authentication & Authorization
- Invalid credentials handling
- Duplicate email prevention
- Protected endpoint access control

## Test Structure

```
tests_integration/
├── conftest.py           # Test configuration and fixtures
├── test_integration.py   # Integration test suite
└── README.md            # This file
```

## Configuration

The `conftest.py` file sets up:
- In-memory SQLite database
- Test client with database override
- Automatic database seeding
- Proper cleanup after each test
