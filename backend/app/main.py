"""AZ-900 Bites API."""
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from .db import get_connection, init_db

app = FastAPI(title="AZ-900 Bites API")

# Expo Go fetches from a LAN IP that changes between networks, so allow all
# origins during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/")
def root() -> dict:
    return {
        "app": "AZ-900 Bites API",
        "endpoints": [
            "/health",
            "/modules",
            "/personas",
            "/cards?module=&persona=",
            "/docs",
        ],
    }


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/modules")
def list_modules() -> list:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT module, COUNT(*) AS card_count FROM cards GROUP BY module"
        ).fetchall()
    return [dict(row) for row in rows]


@app.get("/personas")
def list_personas() -> list:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT persona, COUNT(*) AS card_count FROM cards "
            "GROUP BY persona ORDER BY persona"
        ).fetchall()
    return [dict(row) for row in rows]


@app.get("/cards")
def list_cards(
    module: Optional[str] = Query(default=None),
    persona: Optional[str] = Query(default=None),
) -> list:
    query = "SELECT * FROM cards"
    clauses = []
    params: list = []
    if module:
        clauses.append("module = ?")
        params.append(module)
    if persona:
        clauses.append("persona = ?")
        params.append(persona)
    if clauses:
        query += " WHERE " + " AND ".join(clauses)
    query += " ORDER BY topic, persona, id"
    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
    return [dict(row) for row in rows]
