"""CropDoctor AI — SQLite Database Setup.

Uses aiosqlite for async SQLite operations.
Auto-creates tables on first connection.
"""

import aiosqlite
from pathlib import Path

DB_PATH = Path("./data/cropdoctor.db")

CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS predictions (
    id TEXT PRIMARY KEY,
    image_path TEXT NOT NULL,
    image_url TEXT NOT NULL,
    top_prediction TEXT NOT NULL,
    farmer_name TEXT NOT NULL,
    confidence REAL NOT NULL,
    severity TEXT NOT NULL,
    gradcam_url TEXT,
    disease_info_json TEXT,
    predictions_json TEXT,
    is_unknown INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);
"""


async def get_db() -> aiosqlite.Connection:
    """Get a database connection. Creates tables if needed."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    db = await aiosqlite.connect(str(DB_PATH))
    db.row_factory = aiosqlite.Row
    await db.executescript(CREATE_TABLES_SQL)
    return db


async def close_db(db: aiosqlite.Connection):
    """Close a database connection."""
    await db.close()
