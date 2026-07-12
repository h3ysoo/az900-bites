"""Generate AZ-900 flashcards with Claude and store them in SQLite.

Usage:
    python -m scripts.generate_cards                # calls the Anthropic API
    python -m scripts.generate_cards --offline      # loads seed_cards.json
    python -m scripts.generate_cards --reset        # clears the module first

Requires ANTHROPIC_API_KEY in the environment (or backend/.env) unless
--offline is used. Personas are defined as system prompt files under
backend/prompts/ — drop a new .md file there to add one.
"""
import argparse
import json
import os
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.db import get_connection, init_db  # noqa: E402

PROMPTS_DIR = BACKEND_DIR / "prompts"
SEED_PATH = Path(__file__).resolve().parent / "seed_cards.json"

MODULES = {
    "Cloud Concepts": [
        "What is cloud computing and its key benefits",
        "Shared Responsibility Model",
        "Public, Private and Hybrid Cloud",
        "IaaS, PaaS and SaaS",
        "High Availability and Scalability",
        "Regions and Availability Zones",
    ],
    "Architecture & Management": [
        "Resource, Resource Group and Subscription hierarchy",
        "Azure compute: VMs, App Service and Functions",
        "Azure Storage services",
        "Microsoft Entra ID and identity management",
    ],
    "Pricing & Support": [
        "Pricing Calculator and TCO Calculator",
        "Cost factors and Cost Management",
        "SLA (Service Level Agreement)",
        "Azure support plans",
    ],
}

USER_PROMPT_TEMPLATE = """Topic: {topic} (AZ-900 module: {module})

Produce a single learning card for this topic. Reply with ONLY the following
JSON format, nothing else:

{{
  "content": "the card content (following your style rules)",
  "quiz_question": "a short question testing this concept",
  "quiz_answer": "the short, clear correct answer (one sentence)"
}}"""


def load_personas() -> dict:
    personas = {}
    for path in sorted(PROMPTS_DIR.glob("*.md")):
        personas[path.stem] = path.read_text(encoding="utf-8")
    if not personas:
        raise SystemExit(f"No persona prompts found in {PROMPTS_DIR}")
    return personas


def generate_with_api(personas: dict, modules: dict) -> list:
    from anthropic import Anthropic
    from dotenv import load_dotenv

    load_dotenv(BACKEND_DIR / ".env")
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise SystemExit(
            "ANTHROPIC_API_KEY is not set. Add it to backend/.env or use --offline."
        )

    client = Anthropic()
    cards = []
    for module, topics in modules.items():
        for topic in topics:
            for persona, system_prompt in personas.items():
                print(f"  generating: {module} / {topic} / {persona}")
                message = client.messages.create(
                    model="claude-sonnet-5",
                    max_tokens=500,
                    system=system_prompt,
                    messages=[
                        {
                            "role": "user",
                            "content": USER_PROMPT_TEMPLATE.format(
                                topic=topic, module=module
                            ),
                        }
                    ],
                )
                raw = message.content[0].text.strip()
                if raw.startswith("```"):
                    raw = raw.strip("`").removeprefix("json").strip()
                data = json.loads(raw)
                cards.append(
                    {
                        "module": module,
                        "topic": topic,
                        "persona": persona,
                        "content": data["content"],
                        "quiz_question": data["quiz_question"],
                        "quiz_answer": data["quiz_answer"],
                    }
                )
    return cards


def load_offline_seed() -> list:
    return json.loads(SEED_PATH.read_text(encoding="utf-8"))


def save_cards(cards: list, reset: bool) -> None:
    init_db()
    with get_connection() as conn:
        if reset:
            for module in {card["module"] for card in cards}:
                conn.execute("DELETE FROM cards WHERE module = ?", (module,))
        conn.executemany(
            """INSERT INTO cards
               (module, topic, persona, content, quiz_question, quiz_answer)
               VALUES (:module, :topic, :persona, :content,
                       :quiz_question, :quiz_answer)""",
            cards,
        )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--offline", action="store_true",
                        help="load seed_cards.json instead of calling the API")
    parser.add_argument("--reset", action="store_true",
                        help="delete existing cards for the affected modules first")
    parser.add_argument("--module", choices=sorted(MODULES),
                        help="only generate cards for this module")
    args = parser.parse_args()

    modules = {args.module: MODULES[args.module]} if args.module else MODULES

    if args.offline:
        cards = [c for c in load_offline_seed() if c["module"] in modules]
    else:
        cards = generate_with_api(load_personas(), modules)

    save_cards(cards, reset=args.reset)
    counts = sorted({c["module"] for c in cards})
    print(f"Saved {len(cards)} cards for: {', '.join(counts)}.")


if __name__ == "__main__":
    main()
