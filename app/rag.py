"""RAG pipeline with LangChain: retrieve passages from Chroma, let the local LLM answer.

Flow of one question: embed the question -> cosine search in Chroma -> put the best
passages into the prompt -> ChatOllama writes the answer. Each step is an LCEL chain
(prompt | llm | parser) so the pieces are easy to see and swap.
"""

import random
import re

from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import ChatOllama, OllamaEmbeddings

from app.config import (
    CHAT_MODEL,
    CHROMA_DIR,
    EMBED_DOC_PREFIX,
    EMBED_MODEL,
    EMBED_QUERY_PREFIX,
    OLLAMA_BASE_URL,
    TEMPERATURE,
    TOP_K,
)
from app.prompts import ASK_WITH_CONTEXT, ASK_WITHOUT_CONTEXT, QUIZ_GRADE, QUIZ_QUESTION

COLLECTION = "solar_system"
QUIZ_POOL = 8  # best passages for a topic that a quiz question may come from
QUIZ_PASSAGES = 2  # how many of them are sampled and shown to the model


class StoreEmpty(Exception):
    """Raised when nothing has been ingested yet."""


class PrefixedEmbeddings(Embeddings):
    """Ollama embeddings plus the task prefixes the embedding model was trained with.

    Retrieval-tuned models embed "document" and "query" text slightly differently.
    The prefix is added here, only at embedding time, so it is never stored in the
    chunk text that users see. Ingestion and retrieval share this one class so the
    two sides cannot drift apart.
    """

    def __init__(self):
        self.model = OllamaEmbeddings(model=EMBED_MODEL, base_url=OLLAMA_BASE_URL)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self.model.embed_documents([EMBED_DOC_PREFIX + t for t in texts])

    def embed_query(self, text: str) -> list[float]:
        return self.model.embed_query(EMBED_QUERY_PREFIX + text)


def open_store() -> Chroma:
    """Open (or create) the persistent Chroma collection, using cosine distance."""
    return Chroma(
        collection_name=COLLECTION,
        embedding_function=PrefixedEmbeddings(),
        persist_directory=str(CHROMA_DIR),
        collection_configuration={"hnsw": {"space": "cosine"}},
    )


store = open_store()
llm = ChatOllama(model=CHAT_MODEL, base_url=OLLAMA_BASE_URL, temperature=TEMPERATURE, reasoning=False)


# Quiz question and grade come back as labelled lines ("VERDICT: ..."), not JSON.
# JSON mode was tried first, but gemma3:4b sometimes closed a JSON string with a
# curly quote, kept writing inside it and had to be aborted by Ollama after minutes.
# Parsing a few plain lines is robust; if a reply is malformed it is simply asked again.
LABELS_QUESTION = ("fact", "question", "answer")
LABELS_GRADE = ("verdict", "feedback")
RETRY = {
    "retry_if_exception_type": (ValueError,),  # malformed reply -> ask the model again
    "stop_after_attempt": 3,
    "wait_exponential_jitter": False,
}


def parse_fields(reply: str, labels: tuple[str, ...]) -> dict[str, str]:
    """Read 'LABEL: text' lines from a reply; an unlabelled line continues the previous one."""
    fields, current = {}, None
    for line in reply.splitlines():
        label, _, value = line.partition(":")
        label = label.strip(" *#-").lower()
        if label in labels:
            current = label
            fields[current] = value.strip(" *")
        elif current and line.strip():
            fields[current] += " " + line.strip()
    missing = [label for label in labels if not fields.get(label)]
    if missing:
        raise ValueError(f"Reply lacks {missing}: {reply!r}")
    return fields


def parse_question(reply: str) -> dict:
    fields = parse_fields(reply, LABELS_QUESTION)
    # The model sometimes leaks a citation like "[2]" into the question text.
    question = re.sub(r"\s*\[\d+(, ?\d+)*\]", "", fields["question"])
    return {"question": question, "reference_answer": fields["answer"]}


def parse_grade(reply: str) -> dict:
    fields = parse_fields(reply, LABELS_GRADE)
    verdict = re.match(r"\W*(correct|partial|incorrect)\b", fields["verdict"], re.IGNORECASE)
    if verdict is None:
        raise ValueError(f"Unknown verdict: {fields['verdict']!r}")
    return {"verdict": verdict.group(1).lower(), "feedback": fields["feedback"]}


answer_chain = ASK_WITH_CONTEXT | llm | StrOutputParser()
plain_chain = ASK_WITHOUT_CONTEXT | llm | StrOutputParser()
question_chain = (QUIZ_QUESTION | llm | StrOutputParser() | parse_question).with_retry(**RETRY)
grade_chain = (QUIZ_GRADE | llm | StrOutputParser() | parse_grade).with_retry(**RETRY)


def chunk_count() -> int:
    """Number of vectors in the store (0 means ingestion has not run)."""
    return len(store.get(include=[])["ids"])


def retrieve(query: str, k: int = TOP_K) -> list[dict]:
    """Return the k passages most similar to the query, best first.

    Score is cosine relevance (1 - cosine distance): higher means closer in meaning.
    """
    hits = store.similarity_search_with_relevance_scores(query, k=k)
    if not hits:
        raise StoreEmpty("The document store is empty. Run: uv run python -m app.ingest")
    return [
        {
            "source": doc.metadata["source"],
            "page": doc.metadata["page"],
            "score": round(score, 3),
            "text": doc.page_content,
        }
        for doc, score in hits
    ]


def format_context(sources: list[dict]) -> str:
    """Number the passages so the model can cite them as [1], [2], ..."""
    return "\n\n".join(
        f"[{i}] ({s['source']}, page {s['page']})\n{s['text']}"
        for i, s in enumerate(sources, start=1)
    )


def ask(question: str, use_rag: bool) -> dict:
    """Answer a question with retrieved passages, or from the model's memory alone."""
    if not use_rag:
        answer = plain_chain.invoke({"question": question})
        return {"answer": answer, "use_rag": False, "sources": []}
    sources = retrieve(question)
    answer = answer_chain.invoke({"context": format_context(sources), "question": question})
    return {"answer": answer, "use_rag": True, "sources": sources}


def make_quiz_question(topic: str) -> dict:
    """Write one question about a topic from randomly chosen top passages.

    Sampling a few of the best QUIZ_POOL passages (instead of always the best ones)
    makes the next question for the same topic different.
    """
    pool = retrieve(topic, k=QUIZ_POOL)
    sources = random.sample(pool, min(QUIZ_PASSAGES, len(pool)))
    item = question_chain.invoke({"topic": topic, "context": format_context(sources)})
    return {**item, "sources": sources}


def grade(quiz: dict, answer: str) -> dict:
    """Grade a player's answer against the reference answer.

    The passages are returned for display but not shown to the grader: with them in
    the prompt, gemma3:4b marked any true statement from a passage as correct, even
    when it did not answer the question.
    """
    result = grade_chain.invoke(
        {
            "question": quiz["question"],
            "reference_answer": quiz["reference_answer"],
            "answer": answer,
        }
    )
    return {**result, "reference_answer": quiz["reference_answer"], "sources": quiz["sources"]}
