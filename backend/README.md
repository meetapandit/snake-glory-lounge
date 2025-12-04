# Snake Glory Lounge Backend

This is the FastAPI backend for the Snake Glory Lounge game.

## Setup

1.  Ensure you have `uv` installed.
2.  Install dependencies:
    ```bash
    uv sync
    ```

## Running the Server

### Using Makefile (Recommended)

```bash
make dev
```

### Using uv directly

To run the development server:

```bash
cd backend
uv run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
Documentation is available at `http://localhost:8000/docs`.

## Running Tests

### Using Makefile

```bash
make test              # Run all tests
make test-verbose      # Run with verbose output
make test-integration  # Run integration tests only
```

### Using uv directly

```bash
uv run pytest
```

## Other Commands

```bash
make help     # Show all available commands
make install  # Install dependencies
make clean    # Remove cache files
```

## Test Data

The backend includes comprehensive mock data for testing:

### Test Accounts
10 user accounts are available for testing (all use password `password123`):
- `player1@test.com` - SnakeMaster
- `player2@test.com` - VenomStrike
- `player3@test.com` - CobraKing
- `player4@test.com` - PythonPro
- `player5@test.com` - Slither99
- `player6@test.com` - ViperVenom
- `player7@test.com` - Anaconda
- `player8@test.com` - RattleSnake
- `player9@test.com` - BlackMamba
- `player10@test.com` - Sidewinder

### Leaderboard
- 20 pre-populated leaderboard entries
- Mix of both game modes (walls and pass-through)
- Scores ranging from 800 to 2450

### Active Players
- 5 simulated active players currently "playing"
- Available for spectator mode testing
