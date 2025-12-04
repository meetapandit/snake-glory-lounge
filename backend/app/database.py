from typing import Dict, List, Optional
from app.models import User, LeaderboardEntry, GameMode, GameState, ActivePlayer, Direction, Position
from datetime import date
import random

# Mock Data Storage
users: Dict[str, dict] = {} # email -> {user: User, password: str}
leaderboard: List[LeaderboardEntry] = []
active_players: List[ActivePlayer] = []

# Initialize with some mock data
def init_db():
    # Mock Users - 10 test accounts
    mock_users = [
        ("player1@test.com", "1", "SnakeMaster", "password123"),
        ("player2@test.com", "2", "VenomStrike", "password123"),
        ("player3@test.com", "3", "CobraKing", "password123"),
        ("player4@test.com", "4", "PythonPro", "password123"),
        ("player5@test.com", "5", "Slither99", "password123"),
        ("player6@test.com", "6", "ViperVenom", "password123"),
        ("player7@test.com", "7", "Anaconda", "password123"),
        ("player8@test.com", "8", "RattleSnake", "password123"),
        ("player9@test.com", "9", "BlackMamba", "password123"),
        ("player10@test.com", "10", "Sidewinder", "password123"),
    ]
    
    for email, user_id, username, password in mock_users:
        users[email] = {
            "user": User(id=user_id, username=username, email=email),
            "password": password
        }

    # Mock Leaderboard - 20 entries with varied scores
    leaderboard.extend([
        LeaderboardEntry(id="1", username="SnakeMaster", score=2450, mode=GameMode.WALLS, date=date(2024, 1, 15)),
        LeaderboardEntry(id="2", username="VenomStrike", score=2100, mode=GameMode.PASS_THROUGH, date=date(2024, 1, 14)),
        LeaderboardEntry(id="3", username="CobraKing", score=1890, mode=GameMode.WALLS, date=date(2024, 1, 13)),
        LeaderboardEntry(id="4", username="PythonPro", score=1750, mode=GameMode.PASS_THROUGH, date=date(2024, 1, 12)),
        LeaderboardEntry(id="5", username="Slither99", score=1620, mode=GameMode.WALLS, date=date(2024, 1, 11)),
        LeaderboardEntry(id="6", username="ViperVenom", score=1500, mode=GameMode.PASS_THROUGH, date=date(2024, 1, 10)),
        LeaderboardEntry(id="7", username="Anaconda", score=1350, mode=GameMode.WALLS, date=date(2024, 1, 9)),
        LeaderboardEntry(id="8", username="RattleSnake", score=1200, mode=GameMode.PASS_THROUGH, date=date(2024, 1, 8)),
        LeaderboardEntry(id="9", username="BlackMamba", score=1100, mode=GameMode.WALLS, date=date(2024, 1, 7)),
        LeaderboardEntry(id="10", username="Sidewinder", score=950, mode=GameMode.PASS_THROUGH, date=date(2024, 1, 6)),
        LeaderboardEntry(id="11", username="SnakeMaster", score=2300, mode=GameMode.PASS_THROUGH, date=date(2024, 1, 5)),
        LeaderboardEntry(id="12", username="CobraKing", score=1800, mode=GameMode.PASS_THROUGH, date=date(2024, 1, 4)),
        LeaderboardEntry(id="13", username="VenomStrike", score=1950, mode=GameMode.WALLS, date=date(2024, 1, 3)),
        LeaderboardEntry(id="14", username="PythonPro", score=1650, mode=GameMode.WALLS, date=date(2024, 1, 2)),
        LeaderboardEntry(id="15", username="Slither99", score=1400, mode=GameMode.PASS_THROUGH, date=date(2024, 1, 1)),
        LeaderboardEntry(id="16", username="ViperVenom", score=1250, mode=GameMode.WALLS, date=date(2023, 12, 31)),
        LeaderboardEntry(id="17", username="Anaconda", score=1150, mode=GameMode.PASS_THROUGH, date=date(2023, 12, 30)),
        LeaderboardEntry(id="18", username="RattleSnake", score=1050, mode=GameMode.WALLS, date=date(2023, 12, 29)),
        LeaderboardEntry(id="19", username="BlackMamba", score=900, mode=GameMode.PASS_THROUGH, date=date(2023, 12, 28)),
        LeaderboardEntry(id="20", username="Sidewinder", score=800, mode=GameMode.WALLS, date=date(2023, 12, 27)),
    ])

    # Mock Active Players - 5 players currently playing
    active_players.extend([
        ActivePlayer(
            id="101",
            username="LiveSnaker",
            score=340,
            mode=GameMode.WALLS,
            gameState=generate_mock_game_state(GameMode.WALLS, 340)
        ),
        ActivePlayer(
            id="102",
            username="ProGamer99",
            score=520,
            mode=GameMode.PASS_THROUGH,
            gameState=generate_mock_game_state(GameMode.PASS_THROUGH, 520)
        ),
        ActivePlayer(
            id="103",
            username="NightCrawler",
            score=180,
            mode=GameMode.WALLS,
            gameState=generate_mock_game_state(GameMode.WALLS, 180)
        ),
        ActivePlayer(
            id="104",
            username="SpeedDemon",
            score=720,
            mode=GameMode.PASS_THROUGH,
            gameState=generate_mock_game_state(GameMode.PASS_THROUGH, 720)
        ),
        ActivePlayer(
            id="105",
            username="SteelFang",
            score=450,
            mode=GameMode.WALLS,
            gameState=generate_mock_game_state(GameMode.WALLS, 450)
        )
    ])

def generate_mock_game_state(mode: GameMode, score: int) -> GameState:
    snake_length = (score // 10) + 3
    snake = []
    start_x = random.randint(5, 15)
    start_y = random.randint(5, 15)
    
    for i in range(snake_length):
        snake.append(Position(x=start_x - i, y=start_y))
        
    return GameState(
        snake=snake,
        food=Position(x=random.randint(0, 19), y=random.randint(0, 19)),
        direction=Direction.RIGHT,
        score=score,
        status="playing",
        mode=mode,
        speed=150
    )

init_db()
