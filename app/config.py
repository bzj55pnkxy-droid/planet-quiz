"""Runtime configuration, read once from the environment (see .env.example)."""

import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")


def _path(name: str, default: str) -> Path:
    path = Path(os.getenv(name, default))
    return path if path.is_absolute() else ROOT / path


OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
CHAT_MODEL = os.getenv("CHAT_MODEL", "gemma3:4b")
EMBED_MODEL = os.getenv("EMBED_MODEL", "nomic-embed-text")
SOURCES_DIR = _path("SOURCES_DIR", "data/sources")
# Retrieval-tuned embedding models expect a task marker in front of the text,
# and the marker differs per model, so it is configuration (defaults: nomic-embed-text).
# "\n" in the value is written literally in .env files and decoded here.
EMBED_DOC_PREFIX = os.getenv("EMBED_DOC_PREFIX", "search_document: ").replace("\\n", "\n")
EMBED_QUERY_PREFIX = os.getenv("EMBED_QUERY_PREFIX", "search_query: ").replace("\\n", "\n")
CHROMA_DIR = _path("CHROMA_DIR", "data/chroma")
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "150"))
TOP_K = int(os.getenv("TOP_K", "4"))
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.2"))
