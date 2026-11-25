# Planet Quiz

Planet Quiz is a solar-system trivia web app that runs entirely on your own machine. It has two modes. In **Quiz** mode the app writes a question from passages it retrieved from two NASA/DLR PDFs, the player answers in free text, and the app grades the answer against a reference answer and shows the source passages. In **Ask** mode the player types any question and gets an answer written from the retrieved passages; a "Compare with and without RAG" button shows that answer next to one the model gives from memory alone. The language model is a local Ollama model, the retrieval is a local Chroma vector store, and no online service is called.

This file is the setup guide. It was written for the exam project "LLM for Developers" (see `exam.md`). The synopsis is a separate document: `docs/synopsis.md`.

## Prerequisites

- **Ollama** (https://ollama.com), running locally. Developed with Ollama 0.40.18.
- **uv** (https://docs.astral.sh/uv/), the Python package manager. Developed with uv 0.9.7. `pyproject.toml` requires Python 3.12; uv uses a Python 3.12 it finds or installs one.
- **About 4 GB of free disk space for the models** with the default profile: the chat model `gemma3:4b` is 3.4 GB and the embedding model `nomic-embed-text` is 274 MB. The RTX 4080 Super profiles need more (see [Hardware profiles](#hardware-profiles)).
- An internet connection for the one-time download of the models and Python packages. After that the app works offline.

The default settings were developed and measured on an Apple M2 with 16 GB of memory. The commands in this guide are the same on macOS, Linux and Windows (PowerShell). Where a command differs, the difference is noted next to it.

## Installation

Open a terminal in the project root, the folder that contains `pyproject.toml`. Every command below is run from there.

```bash
uv sync
```

This creates `.venv/` and installs the pinned dependencies from `uv.lock` (FastAPI, uvicorn, LangChain, langchain-chroma, langchain-ollama, PyMuPDF, scikit-learn and others). You do not need to activate the virtual environment; the commands below use `uv run`.

## Model setup

Start Ollama. If the Ollama desktop app or a system service is already running, skip this step.

```bash
ollama serve
```

Pull the two default models (about 3.7 GB in total) and check that both are listed:

```bash
ollama pull gemma3:4b
ollama pull nomic-embed-text
ollama list
```

`gemma3:4b` writes answers, quiz questions and grades. `nomic-embed-text` turns text into vectors for retrieval.

## Configuration

The defaults need no configuration. To change anything, copy the example file and edit the copy:

```bash
cp .env.example .env
```

On Windows cmd use `copy .env.example .env`; in PowerShell `cp` works. `.env.example` lists every variable with its default value, so copying it without editing changes nothing. `.env` is git-ignored. The settings are read once when the app starts, so restart the server after changing them. A variable that is already set in your shell takes precedence over `.env`.

| Variable | Default | Meaning |
| --- | --- | --- |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Address of the Ollama server, used for chat, embeddings and the health check. |
| `CHAT_MODEL` | `gemma3:4b` | Ollama model that writes answers, quiz questions and grades. |
| `EMBED_MODEL` | `nomic-embed-text` | Ollama model that embeds the chunks and the queries. |
| `EMBED_DOC_PREFIX` | `search_document: ` | Task prefix added to each chunk before it is embedded (embedding time only, it is not stored in the chunk text). |
| `EMBED_QUERY_PREFIX` | `search_query: ` | Task prefix added to each query before it is embedded. Write a line break as `\n` (see `configs/rtx4080s-single.env`). |
| `SOURCES_DIR` | `data/sources` | Folder whose `*.pdf` files are ingested (not searched recursively). Relative paths are relative to the project root. |
| `CHROMA_DIR` | `data/chroma` | Folder where the Chroma vector store is saved. Relative paths are relative to the project root. |
| `CHUNK_SIZE` | `1000` | Maximum characters per chunk. |
| `CHUNK_OVERLAP` | `150` | Characters shared by neighbouring chunks. |
| `TOP_K` | `4` | Number of passages retrieved for an Ask question. Quiz questions always take the 8 best passages for the topic and sample 2 of them (`QUIZ_POOL` and `QUIZ_PASSAGES` in `app/rag.py`, not configurable through the environment). |
| `TEMPERATURE` | `0.2` | Sampling temperature of the chat model. |

Changing `EMBED_MODEL`, `EMBED_DOC_PREFIX`, `EMBED_QUERY_PREFIX`, `CHUNK_SIZE`, `CHUNK_OVERLAP` or `SOURCES_DIR` requires running ingestion again. Use a separate `CHROMA_DIR` for each embedding model, because vectors from different models are not comparable.

## Hardware profiles

The default profile is the one the app was developed and measured on. The two RTX 4080 Super profiles are **untested**: no such GPU was available. The model sizes come from the Ollama catalog.

| Profile | Config file | Chat model | Embedding model | `CHROMA_DIR` | Status |
| --- | --- | --- | --- | --- | --- |
| Mac M2, 16 GB (default) | none, the built-in defaults (same values as `.env.example`) | `gemma3:4b` (3.4 GB) | `nomic-embed-text` (274 MB) | `data/chroma` | Tested |
| RTX 4080 Super, 16 GB VRAM, one model in VRAM at a time | `configs/rtx4080s-single.env` | `gemma4:12b-it-q8_0` (13 GB) | `qwen3-embedding:8b-q8_0` (8 GB) | `data/chroma-qwen3-embedding-8b` | Untested |
| RTX 4080 Super, 16 GB VRAM, both models loaded | `configs/rtx4080s-concurrent.env` | `gemma4:12b-it-qat` (7.2 GB) | `qwen3-embedding:4b-q8_0` (4.3 GB) | `data/chroma-qwen3-embedding-4b` | Untested |

The single-model profile gives each model the whole card but reloads a model on every question, so it is slower and aims at answer quality. The concurrent profile keeps both models resident (7.2 GB + 4.3 GB = 11.5 GB) and aims at responsiveness. If `ollama ps` shows less than 100% GPU for the 13 GB chat model of the single-model profile, the file's header suggests falling back to `gemma4:12b-it-qat`.

To switch to a profile (example: concurrent):

1. Copy the config file to `.env`. In cmd use `copy configs\rtx4080s-concurrent.env .env`.

   ```bash
   cp configs/rtx4080s-concurrent.env .env
   ```

2. Pull the two models named in the file:

   ```bash
   ollama pull gemma4:12b-it-qat
   ollama pull qwen3-embedding:4b-q8_0
   ```

   For the single-model profile pull `gemma4:12b-it-q8_0` and `qwen3-embedding:8b-q8_0`.

3. Set the Ollama **server** variables from the file header where `ollama serve` runs. The app does not read them. Restart Ollama afterwards.

   | Profile | Ollama server variables |
   | --- | --- |
   | `rtx4080s-single.env` | `OLLAMA_MAX_LOADED_MODELS=1`, `OLLAMA_NUM_PARALLEL=1`, `OLLAMA_CONTEXT_LENGTH=8192` |
   | `rtx4080s-concurrent.env` | `OLLAMA_MAX_LOADED_MODELS=2`, `OLLAMA_KEEP_ALIVE=30m`, `OLLAMA_CONTEXT_LENGTH=8192` |

   Started from a terminal on macOS or Linux:

   ```bash
   OLLAMA_MAX_LOADED_MODELS=2 OLLAMA_KEEP_ALIVE=30m OLLAMA_CONTEXT_LENGTH=8192 ollama serve
   ```

   In PowerShell:

   ```powershell
   $env:OLLAMA_MAX_LOADED_MODELS = "2"; $env:OLLAMA_KEEP_ALIVE = "30m"; $env:OLLAMA_CONTEXT_LENGTH = "8192"; ollama serve
   ```

   If Ollama runs as a desktop app or service, set the variables the way the Ollama documentation describes for your platform.

4. Re-ingest, because the embedding model changed (the new profile writes to its own `CHROMA_DIR`), then restart the web server:

   ```bash
   uv run python -m app.ingest
   ```

The header of the web page shows the chat and embedding model in use. To go back to the default profile, delete `.env` and restart the server; the default index in `data/chroma` is untouched.

## Loading the RAG material

The source material is two PDFs from 2013, included in the repository:

- `data/sources/nasa_solar_system_lithographs_2013.pdf`: NASA educator lithograph set, 42 pages, one sheet per body with a "FAST FACTS" table.
- `data/sources/dlr_our_solar_system_2013.pdf`: brochure of the German Aerospace Center (DLR), 100 pages.

The vector store is not in the repository (`data/chroma*/` is git-ignored), so build it once. Ollama must be running with the embedding model pulled.

```bash
uv run python -m app.ingest
```

Expected output with the default settings (takes about 30 s on the M2):

```text
Pages kept: 119, dropped (almost no text): 23
Chunks stored: 532 in <seconds> s
```

What the script does:

1. Reads every page of every `*.pdf` in `SOURCES_DIR` with PyMuPDF (`PyMuPDFLoader`) and cleans the text (joins words hyphenated at line ends, collapses spaces and blank lines).
2. Drops pages with fewer than 500 characters (covers, captions, image-only pages). 142 pages in total: 119 kept, 23 dropped.
3. Splits the pages into chunks of up to 1000 characters with 150 characters of overlap (`RecursiveCharacterTextSplitter`). Each chunk keeps its file name and page number. Result: 532 chunks.
4. Embeds each chunk with `nomic-embed-text` (with the `search_document: ` prefix) and stores vector, text and metadata in a Chroma collection that uses cosine distance.

At question time the question is embedded with the `search_query: ` prefix, the `TOP_K` (4) nearest chunks are retrieved, and each gets a relevance score of 1 minus the cosine distance. The chunks are put into the prompt as numbered passages.

The script rebuilds the collection from scratch on every run, so it is safe to run again. **Restart the web server after re-ingesting**; a running server keeps the old collection open.

### Adding another PDF

1. Copy the PDF into `data/sources/` (or point `SOURCES_DIR` at another folder). It must be a text PDF directly inside that folder; there is no OCR.
2. Run `uv run python -m app.ingest`.
3. Restart the web server.

The quiz topic list is fixed in `TOPICS` in `app/main.py`, and the prompts in `app/prompts.py` describe a planetary-science tutor. Material on another subject would need those edited. Do not remove or replace the NASA PDF: `experiment/run_experiment.py` reads it by file name and page number.

## Starting the app

```bash
uv run uvicorn app.main:app --port 8000
```

Open http://127.0.0.1:8000 in a browser. The API and the web page are served by the same process. Stop the server with Ctrl+C. If port 8000 is taken, use another port in the command and in the URL.

## Testing the app

Manual script, about five minutes. Times were measured on the M2: an Ask answer takes about 3-25 s, a quiz question about 10 s and grading about 10-25 s. The first request after Ollama has been idle is slower because the model is loaded into memory.

1. **Health line.** The header of the page reads `Chat model: gemma3:4b | Embedding model: nomic-embed-text | Indexed chunks: 532`. A warning below it means Ollama is not reachable or the store is empty (see [Troubleshooting](#troubleshooting)).
2. **Quiz round.** On the Quiz tab pick a topic (for example Saturn) and click "New question". After about 10 s a question appears. Type an answer and click "Check answer" (or press Ctrl/Cmd+Enter). The result shows a verdict (Correct, Partially correct or Incorrect), short feedback, the reference answer and the source passages used, with file, page and relevance. The score next to the "New question" button updates. Try three answers to the same question. Expected: the reference answer is graded correct, a true but unrelated statement incorrect, and "I do not know" incorrect. Questions are sometimes obscure, because the passages are sampled at random from the 8 best for the topic; click "New question" for another one.
3. **Retrieval effect.** On the Ask tab type `How many moons does Saturn have?` and click "Compare with and without RAG". Two answers appear one after the other.
   - With retrieved sources: the answer is "Saturn has 53 known moons (plus 9 awaiting official confirmation)" with a citation to a numbered passage. The sources listed include `dlr_our_solar_system_2013.pdf` page 56 and `nasa_solar_system_lithographs_2013.pdf` pages 30 and 22. The 2013 NASA sheet says 53.
   - Without RAG: the model answers from memory and gives a different number. In the measured run it said 83 confirmed moons; an earlier run of the same question said 146.

   Wording and, without RAG, the number vary between runs. The point is that the RAG answer follows the source and the plain answer does not.
4. **Plain ask.** Untick "Use retrieved sources (RAG)" and click "Ask" to get a single answer without retrieval; tick it for a single RAG answer.

The same checks through the API (macOS/Linux; on Windows PowerShell use `curl.exe` instead of `curl`, and put the JSON in a file and send it with `-d @body.json`):

```bash
curl -s http://127.0.0.1:8000/api/health
```

Expected: `{"ollama":true,"chat_model":"gemma3:4b","embed_model":"nomic-embed-text","chunks":532}`

```bash
curl -s http://127.0.0.1:8000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "How many moons does Saturn have?", "use_rag": true}' \
  | uv run python -m json.tool
```

The reply has `answer`, `use_rag` and the four retrieved `sources` (`source`, `page`, `score`, `text`). Run it again with `"use_rag": false` to compare: `sources` is then an empty list and the answer comes from the model's memory.

## Running the regression experiment

The separate experiment compares linear regression with the local LLM plus RAG on one numerical task: predicting a body's orbital period in Earth years from its mean distance from the Sun in AU. It needs Ollama running with the two models of the active profile pulled. It does not need the app's ingestion or the web server.

```bash
uv run python -m experiment.run_experiment
```

The script reads distance and orbit period from the FAST FACTS tables of the NASA PDF, adds one synthetic body (15 AU, period 15^1.5), fits the regressions on the train bodies only, and asks the LLM with and without retrieved train examples at temperature 0. Test cases are Mars, Uranus and the synthetic body. It prints the report and writes these files:

| File | Content |
| --- | --- |
| `experiment/results.md` | Report: data, split, method, fitted coefficients, predictions, errors, retrieved documents, prompts and raw LLM replies. |
| `experiment/results.json` | The same results as data. |
| `experiment/data/bodies.csv` | The dataset extracted from the PDF, with the train/test split. |
| `experiment/chroma/` | Scratch vector store with the train examples only, rebuilt on every run (git-ignored). |

Every run overwrites the result files and uses `CHAT_MODEL` and `EMBED_MODEL` from the active configuration. The committed results were produced with the default profile (`gemma3:4b`, `nomic-embed-text`). Their headline numbers, mean absolute error over the three test cases:

| Approach | MAE (years) |
| --- | --- |
| Linear regression, log-log | 0.02 |
| Linear regression, raw | 17.24 |
| LLM + RAG | 38.73 |
| LLM, no RAG | 44.83 |

The discussion is in the synopsis; the full tables are in `experiment/results.md`.

## Explainer videos

Two narrated videos of about 7 minutes each are in `docs/video/`, with subtitles in the `.srt` files next to them:

- `planet-quiz-rag-explained.mp4`, for people who are new to RAG: what RAG is, the two phases of the pipeline, and where each step lives in this project.
- `planet-quiz-regression-explained.mp4`, for people who are new to machine learning: what linear regression is, the regression experiment, its code in `experiment/run_experiment.py`, and the results.

The videos are built from code in `video/`:

| File | Purpose |
| --- | --- |
| `script.json` | The narration of the RAG video, split into chapters and beats (one or two sentences each) |
| `src/` | Shared look and timeline code, and the RAG video's pictures: one HTML/CSS/JS scene per chapter, animated with GSAP and rendered by Hyperframes |
| `regression/` | The regression video's own `script.json` and `scenes/` |
| `audio/` | Generated, git-ignored: one WAV per beat, spoken by Kokoro (a local text-to-speech model) |
| `capture.ts` | Takes the real app screenshots used in the demo chapter |
| `build.ts` | Measures the audio, times the pictures to it, renders and adds the sound |

To rebuild them you need Bun, `ffmpeg` and uv:

```bash
cd video
bun install
uv venv --python 3.12 .tts-venv
uv pip install --python .tts-venv/bin/python kokoro-onnx soundfile
bun build.ts                      # the RAG video
bun build.ts --video=regression   # the regression video
```

Only beats whose text changed are spoken again, and the picture timing follows the new audio automatically.

## Project layout

```text
.
├── README.md                       this setup guide
├── exam.md                         the exam assignment
├── docs/
│   ├── synopsis.md                 the synopsis (maximum 5 pages)
│   └── video/                      explainer videos (MP4) and their subtitles (SRT)
├── pyproject.toml                  project metadata and dependencies (Python 3.12)
├── uv.lock                         pinned dependency versions
├── .env.example                    every setting with its default; copy to .env
├── .gitignore                      ignores .venv, .env, data/chroma*/ and experiment/chroma/
├── app/
│   ├── __init__.py                 marks the package
│   ├── config.py                   reads settings from the environment and .env
│   ├── ingest.py                   PDF -> clean text -> chunks -> embeddings -> Chroma
│   ├── rag.py                      retrieval, LCEL chains, quiz question and grading logic
│   ├── prompts.py                  all prompt text, built from the 4T's
│   ├── main.py                     FastAPI app: JSON API and static file serving
│   └── static/
│       └── index.html              the whole web UI (Quiz and Ask tabs)
├── configs/
│   ├── rtx4080s-single.env         RTX 4080 Super profile, one model in VRAM (untested)
│   └── rtx4080s-concurrent.env     RTX 4080 Super profile, both models loaded (untested)
├── data/
│   ├── sources/                    the two source PDFs
│   └── chroma/                     vector store created by ingestion (git-ignored)
├── experiment/
│   ├── __init__.py                 marks the package
│   ├── run_experiment.py           regression vs. LLM + RAG experiment
│   ├── results.md                  generated report
│   ├── results.json                generated results as data
│   ├── data/bodies.csv             generated dataset
│   └── chroma/                     generated scratch vector store (git-ignored)
└── video/                          sources of the explainer videos (see "Explainer videos")
```

## API reference

All endpoints are served by `app/main.py`. Bodies and replies are JSON.

| Method and path | Request body | Reply |
| --- | --- | --- |
| `GET /api/health` | none | `{"ollama": bool, "chat_model": str, "embed_model": str, "chunks": int}`. `ollama` is true if `OLLAMA_BASE_URL/api/tags` answers within 2 s. `chunks` is the number of vectors in the store; 0 means nothing was ingested. |
| `GET /api/topics` | none | `{"topics": [str, ...]}`, the 15 quiz topics the page offers. |
| `POST /api/ask` | `{"question": str, "use_rag": bool}`. `question` must not be empty; `use_rag` defaults to `true`. | `{"answer": str, "use_rag": bool, "sources": [{"source": str, "page": int, "score": float, "text": str}, ...]}`. `source` is the PDF file name, `page` is 1-based, `score` is the cosine relevance (1 minus cosine distance, 3 decimals). With `use_rag` false, `sources` is `[]`. |
| `POST /api/quiz/question` | `{"topic": str}`. Any non-empty string; it is used as the retrieval query. | `{"quiz_id": str, "topic": str, "question": str}`. The reference answer and passages stay on the server. |
| `POST /api/quiz/grade` | `{"quiz_id": str, "answer": str}`. `answer` must not be empty. | `{"verdict": "correct" or "partial" or "incorrect", "feedback": str, "reference_answer": str, "sources": [...]}`. `sources` has the same shape as in `/api/ask`. |
| `GET /` | none | The web page (`app/static/index.html`). |

Errors:

| Status | When | Body |
| --- | --- | --- |
| 404 | `quiz_id` unknown, for example after a server restart | `{"detail": "Unknown quiz_id. Ask for a new question."}` |
| 422 | A required field is missing or an empty string (FastAPI validation) | FastAPI's validation detail |
| 503 | Ollama is unreachable | `{"detail": "Cannot reach Ollama at <OLLAMA_BASE_URL>. Is it running?"}` |
| 503 | A model is missing in Ollama | `{"detail": <Ollama's error message>}` |
| 503 | The store is empty | `{"detail": "The document store is empty. Run: uv run python -m app.ingest"}` |
| 503 | Quiz question or grading: the model's reply was malformed on all 3 attempts | `detail` says to try again; send the request again |

Open quiz questions are kept in memory only and are lost when the server restarts.

## Where the 4T's are implemented

All in `app/prompts.py`. `_system()` joins the four parts into one system prompt with the labelled sections `TRAITS`, `TASK`, `TONE` and `TARGET`, so they are visible in the text the model receives. Retrieved passages go in the user message as numbered blocks `[1] (file, page N)`, because they are data and not instructions.

- **Traits** (`TRAITS_WITH_SOURCES`, `TRAITS_WITHOUT_SOURCES`): a careful planetary-science tutor in a trivia app; with sources it may use only the numbered passages, the passages win over its own memory because they are from 2013, and it says so when they do not contain the answer; without sources it answers from memory and admits uncertainty. (Calling the persona a "quiz master" made the model append its own quiz questions to answers, so the wording is "tutor in a trivia app".)
- **Task** (the second argument of `_system()`, different in each prompt): `ASK_WITH_CONTEXT` answers from the passages and cites them, `ASK_WITHOUT_CONTEXT` answers from memory, `QUIZ_QUESTION` writes one question as labelled lines `FACT`, `QUESTION`, `ANSWER`, and `QUIZ_GRADE` returns `PLAYER`, `VERDICT`, `FEEDBACK` lines that `app/rag.py` parses.
- **Tone** (`TONE`): encouraging and concise, plain language, no invented facts, and the reply only, with no greeting or follow-up question.
- **Target** (`TARGET`): students aged about 12 to 18 without astronomy background; units such as the astronomical unit are explained in a few words and every reply is at most 4 sentences.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| The page header says "Warning: Ollama is not reachable", or the API returns 503 "Cannot reach Ollama at ... Is it running?" | Ollama is not running or `OLLAMA_BASE_URL` is wrong. Start it with `ollama serve` (or open the Ollama app) and reload the page. |
| 503 with an Ollama error message about a model | `CHAT_MODEL` or `EMBED_MODEL` is not pulled. Run `ollama list`, then `ollama pull <model>` for the missing one. |
| The page header says "the document store is empty", `chunks` is 0, or 503 "The document store is empty. Run: uv run python -m app.ingest" | Ingestion has not run for the current `CHROMA_DIR`. Run `uv run python -m app.ingest`, then restart the server. |
| You changed `EMBED_MODEL`, a prefix or the chunk settings | The index no longer matches the settings. Re-run `uv run python -m app.ingest` and restart the server. Give each embedding model its own `CHROMA_DIR`, because vectors from different models are not comparable. |
| The first answer takes much longer than later ones | Ollama loads the model into memory on the first request, and again after it has been unloaded while idle. With the single-model profile a model is reloaded on every question by design. |
| "Unknown quiz_id. Ask for a new question." | The server was restarted since the question was created. Click "New question". |
| A quiz question or grade fails with "unusable reply three times in a row" | The small model returned a malformed reply on all 3 attempts. Try again. |
| The new documents or settings have no effect | The server reads the store and the settings at start-up. Restart `uvicorn`. |

## Known limitations

- The sources are from 2013. Facts have changed, and the prompts tell the model to prefer the passages over its memory. For "How many moons does Saturn have?" the answer is 53, as in the sources, not the current count.
- `gemma3:4b` is small and sometimes inconsistent. For "Has a spacecraft visited Pluto?" the RAG answer opens with "Yes" while quoting passages that say New Horizons is scheduled to arrive in 2015, and it cites a passage number 6 although only 4 passages are supplied.
- Grading is done by the model. The grader sees only the question, the reference answer and the player's answer, not the passages, because with the passages it accepted true statements that did not answer the question. In a check of 9 verdicts across 3 questions all were right, but the feedback wording is sometimes odd.
- Quiz questions are sometimes obscure, because passages are sampled at random from the 8 best for the topic.
- Retrieval uses embedding similarity only. In the regression experiment it did not return the numerically nearest bodies, and the model did not interpolate between the examples it was shown. The experiment has three test cases and is a comparison, not an evaluation.
- Text extraction has no OCR; pages with under 500 characters (23 of 142) are not indexed, and the NASA fact tables arrive as lines of text.
- The quiz topics are a fixed list in `app/main.py` and the app is built around the solar-system sources.
- The two RTX 4080 Super profiles are untested.
- Out of scope: user accounts, persistence of quiz state (it is an in-memory dictionary), streaming responses, multi-turn chat, re-ranking, automated evaluation and deployment.
