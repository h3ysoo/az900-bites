"""SQLite helpers for AZ-900 Bites.

The database lives at backend/az900.db. The `audio_url` column is reserved
for the future TTS integration (Level 2) and stays NULL for now.
"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "az900.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT NOT NULL,
    topic TEXT NOT NULL,
    persona TEXT NOT NULL,
    content TEXT NOT NULL,
    quiz_question TEXT NOT NULL,
    quiz_answer TEXT NOT NULL,
    audio_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(SCHEMA)
