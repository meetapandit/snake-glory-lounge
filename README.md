# Snake Glory Lounge

A full-stack Snake game with leaderboards and spectator mode.

## Access the app online on render here: https://snake-glory-lounge.onrender.com
## Quick Start

Run both frontend and backend together:

```bash
npm run dev
```

This will start:
- **Backend** on `http://localhost:8000`
- **Frontend** on `http://localhost:5173`

## Individual Commands

```bash
npm run dev:backend   # Backend only
npm run dev:frontend  # Frontend only
npm run test          # Run all tests
```

## Project Structure

```
snake-glory-lounge/
├── backend/          # FastAPI backend
├── frontend/         # React + Vite frontend
└── openapi.yaml      # API specification
```

## Test Accounts

Login with any of these accounts (password: `password123`):
- `player1@test.com` - SnakeMaster
- `player2@test.com` - VenomStrike
- `player3@test.com` - CobraKing
- ... (10 accounts total)

## Documentation

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [OpenAPI Spec](./openapi.yaml)
