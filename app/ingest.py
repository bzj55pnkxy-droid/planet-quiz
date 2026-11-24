"""Build the vector store: PDF pages -> clean text -> chunks -> embeddings -> Chroma.

Run once, and again whenever the PDFs or the chunk settings change:

    uv run python -m app.ingest

The collection is rebuilt from scratch every time, so the script is idempotent.
Restart the web server after re-ingesting so it opens the new collection.
"""

import re
import time

from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import CHUNK_OVERLAP, CHUNK_SIZE, SOURCES_DIR
from app.rag import store

# Below this a page is a cover, a caption or an image-only page: nothing to retrieve.
MIN_PAGE_CHARS = 500


def clean(text: str) -> str:
    """Remove PDF extraction artefacts that hurt retrieval and make chunks hard to read.

    Single newlines are kept: in prose they are line wraps, but in the NASA
    "FAST FACTS" tables they separate rows, and the two cannot be told apart cheaply.
    """
    # "plan-\netary" -> "planetary"; \xad is the invisible soft hyphen PDFs use for the same thing
    text = re.sub(r"(\w)[-\xad] ?\n([a-z])", r"\1\2", text)
    text = re.sub(r"[ \t]+", " ", text)  # collapse runs of spaces and tabs
    text = re.sub(r" ?\n ?", "\n", text)  # no spaces around line breaks
    text = re.sub(r"\n{3,}", "\n\n", text)  # at most one blank line
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)  # "star\n, the Sun" -> "star, the Sun"
    return text.strip()


def load_pages() -> tuple[list, int]:
    """Load every PDF page as a cleaned Document; return (kept pages, dropped count)."""
    kept, dropped = [], 0
    for pdf in sorted(SOURCES_DIR.glob("*.pdf")):
        # PyMuPDF, not pypdf: pypdf garbles the DLR brochure's small capitals
        # ("ne ptune", "tombaugh"), which hurts both retrieval and readability.
        for page in PyMuPDFLoader(str(pdf)).load():  # one Document per page
            text = clean(page.page_content)
            if len(text) < MIN_PAGE_CHARS:
                dropped += 1
                continue
            page.page_content = text
            page.metadata = {"source": pdf.name, "page": page.metadata["page"] + 1}
            kept.append(page)
    return kept, dropped


def main() -> None:
    start = time.time()
    pages, dropped = load_pages()
    print(f"Pages kept: {len(pages)}, dropped (almost no text): {dropped}")

    splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    chunks = splitter.split_documents(pages)  # metadata (source, page) is copied to every chunk

    store.reset_collection()  # delete the old collection, start empty
    store.add_documents(chunks)  # embeds each chunk, then stores vector + text + metadata
    print(f"Chunks stored: {len(chunks)} in {time.time() - start:.1f} s")


if __name__ == "__main__":
    main()
