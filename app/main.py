"""FastAPI app: the JSON API of Planet Quiz plus the static web UI.

Start with: uv run uvicorn app.main:app --port 8000
"""

import uuid
from pathlib import Path

import httpx
import ollama
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app import rag
from app.config import CHAT_MODEL, EMBED_MODEL, OLLAMA_BASE_URL

TOPICS = [
    "Sun",
    "Mercury",
    "Venus",
    "Earth",
    "Moon",
    "Mars",
    "Asteroids",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto and dwarf planets",
    "Comets",
    "Kuiper Belt",
    "Space missions",
]

# Reference answer and passages of each open quiz question stay on the server, so the
# browser never sees the answer before grading. In memory only: lost on restart.
quizzes: dict[str, dict] = {}

app = FastAPI(title="Planet Quiz")


class AskRequest(BaseModel):
    question: str = Field(min_length=1)
    use_rag: bool = True


class QuizQuestionRequest(BaseModel):
    topic: str = Field(min_length=1)


class QuizGradeRequest(BaseModel):
    quiz_id: str
    answer: str = Field(min_length=1)


def unavailable(request, exc: Exception) -> JSONResponse:
    """Ollama down, model missing or nothing ingested: tell the UI with a 503."""
    if isinstance(exc, (ConnectionError, httpx.HTTPError)):
        detail = f"Cannot reach Ollama at {OLLAMA_BASE_URL}. Is it running?"
    elif isinstance(exc, ValueError):  # raised by rag.parse_fields after the retries
        detail = "The model gave an unusable reply three times in a row. Please try again."
    else:
        detail = str(exc)  # missing model or empty store: the message already says what to do
    return JSONResponse(status_code=503, content={"detail": detail})


for exc_type in (ConnectionError, httpx.HTTPError, ollama.ResponseError, rag.StoreEmpty, ValueError):
    app.add_exception_handler(exc_type, unavailable)


@app.get("/api/health")
def health() -> dict:
    try:
        httpx.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=2).raise_for_status()
        ollama_up = True
    except httpx.HTTPError:
        ollama_up = False
    return {
        "ollama": ollama_up,
        "chat_model": CHAT_MODEL,
        "embed_model": EMBED_MODEL,
        "chunks": rag.chunk_count(),
    }


@app.get("/api/topics")
def topics() -> dict:
    return {"topics": TOPICS}


@app.post("/api/ask")
def ask(body: AskRequest) -> dict:
    return rag.ask(body.question, body.use_rag)


@app.post("/api/quiz/question")
def quiz_question(body: QuizQuestionRequest) -> dict:
    quiz = rag.make_quiz_question(body.topic)
    quiz_id = uuid.uuid4().hex
    quizzes[quiz_id] = quiz
    return {"quiz_id": quiz_id, "topic": body.topic, "question": quiz["question"]}


@app.post("/api/quiz/grade")
def quiz_grade(body: QuizGradeRequest) -> dict:
    quiz = quizzes.get(body.quiz_id)
    if quiz is None:
        raise HTTPException(status_code=404, detail="Unknown quiz_id. Ask for a new question.")
    return rag.grade(quiz, body.answer)


# Last, so the API routes above win. html=True serves index.html at "/".
app.mount("/", StaticFiles(directory=Path(__file__).parent / "static", html=True), name="static")
