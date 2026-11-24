# Planet Quiz: Synopsis

## 1. Problem, users, purpose and MVP scope

**Problem.** Quiz material for school astronomy is tedious to write and check by hand. A general chatbot answers from memory, names no source, and its numbers drift: asked how many moons Saturn has, our local model said 83 in one run and 146 in another. A wrong reference answer teaches a wrong fact.

**Purpose and role of the LLM.** Planet Quiz is a solar-system trivia web app. Retrieval supplies the facts; the local model writes questions from them, answers free questions and grades free-text answers, and every answer shows its source passage. The sources are the NASA educator lithograph set (42 pages, per-body sheets with FAST FACTS tables) and a German Aerospace Center (DLR) brochure (100 pages), both from 2013.

**Users.** Students aged about 12-18 and their teachers; the NASA set is an educator product for grades K-12. Students get feedback they can check against the source; teachers get source-backed questions without writing them.

**MVP scope.** One web page, two modes:

- *Quiz*: the player picks one of 15 topics; the model writes a question and reference answer from retrieved passages; the player answers in free text; the app grades it (correct, partial or incorrect, plus feedback), shows the source passages and keeps a score.
- *Ask*: a free question, with a "Use retrieved sources (RAG)" checkbox and a "Compare with and without RAG" button that shows both answers side by side.

**Out of scope.** User accounts, persistence of quiz state (in memory, lost on restart), streaming, multi-turn chat, re-ranking, automated evaluation, deployment.

## 2. Architecture and implementation

Ollama 0.40.18 runs both models locally; nothing leaves the machine. The app is Python 3.12 (uv) with FastAPI (JSON API plus one static HTML page), LangChain and Chroma.

```mermaid
flowchart LR
  UI[Browser] --> API[FastAPI]
  API --> RET[Retrieve top-k from Chroma]
  RET --> PR[4T system prompt + numbered passages]
  PR --> LLM[gemma3:4b via Ollama]
  LLM --> API
  API --> UI
```

*Ask.* `/api/ask` embeds the question, takes the top 4 passages, numbers them and sends them with the question to the model; the answer returns with the passages. With RAG off, retrieval is skipped.

*Quiz.* `/api/quiz/question` takes the top 8 passages for the topic and samples 2, so repeated questions differ. The model returns FACT, QUESTION and ANSWER lines, parsed in `rag.py` (3 attempts, then HTTP 503 asking the player to try again). The server keeps the reference answer under a random `quiz_id`; the browser gets only the question. `/api/quiz/grade` skips retrieval: its prompt holds only the question, reference answer and player's answer.

**Local LLM.** `gemma3:4b` (3.4 GB) through `ChatOllama`, temperature 0.2. A 4B model fits a 16 GB laptop (Apple M2) beside the embedding model `nomic-embed-text` (274 MB) and answers in about 3-25 s without a GPU; the price is weaker instruction following and less knowledge. Models are environment settings.

**RAG with LangChain.**

| Component | What it does here |
| --- | --- |
| `PyMuPDFLoader` | One `Document` per PDF page |
| `RecursiveCharacterTextSplitter` | Chunks of 1000 characters, overlap 150; copies source and page to each chunk |
| `OllamaEmbeddings` | Calls `nomic-embed-text`; our subclass `PrefixedEmbeddings` adds the task prefixes |
| `Chroma` | Persistent cosine vector store; `similarity_search_with_relevance_scores` gives the top-k |
| `ChatPromptTemplate`, `ChatOllama` | Message templates; client for the chat model |
| LCEL chains | `prompt \| llm \| parser`; `with_retry` for quiz question and grade |

## 3. How the 4T's are applied

`_system()` in `app/prompts.py` joins four labelled sections (TRAITS, TASK, TONE, TARGET) into every system prompt, so the 4T's are visible text. Traits and Task vary by prompt; Tone and Target are shared.

| T | Wording in `app/prompts.py` | Constant |
| --- | --- | --- |
| Traits | "You are a careful planetary-science tutor in a trivia app. You rely only on the numbered source passages you are given and never add facts from memory. The sources were published in 2013: when a passage disagrees with what you remember, the passage wins." Without RAG: "you answer from your own knowledge only". Grader: "You judge answers only against the reference answer you are given, never against your own memory." | `TRAITS_WITH_SOURCES`, `TRAITS_WITHOUT_SOURCES`, `TRAITS_GRADER` |
| Task | Ask: "Answer the player's question using only the numbered passages in the user message. Start with the direct answer, then cite the passages you used like [1] or [2]." Grade: "A true statement that does not answer the question is 'incorrect'." | `ASK_WITH_CONTEXT`, `QUIZ_QUESTION`, `QUIZ_GRADE` |
| Tone | "Encouraging and concise. Use plain language and no unexplained jargon. Never invent facts. Give the reply itself only: no greeting and no follow-up questions or offers." | `TONE` |
| Target | "Your readers are students aged about 12 to 18 with no astronomy background. [...] Keep every reply short: at most 4 sentences." | `TARGET` |

**Key design decisions.**

- *Labelled lines instead of JSON.* JSON mode with `gemma3:4b` sometimes produced a malformed string and hung for minutes. The quiz prompts now ask for FACT/QUESTION/ANSWER and PLAYER/VERDICT/FEEDBACK lines, and a malformed reply is requested again.
- *Grading against the reference answer only.* With the passages in the grading prompt, the model marked "It takes about 248 years to orbit the Sun" correct for "What year was Pluto discovered?" (true, but not an answer). The grader now sees only question, reference answer and player answer. Afterwards 17 of 18 checked verdicts were right (6 questions; reference answer, off-topic true statement, "I do not know"). The miss: "The Sun is a star at the centre of the solar system" was accepted for a reference answer about Earth once being thought "the central object". The sample is small, and feedback wording is still sometimes odd ("You are right to say you do not know").
- *Passages as numbered data in the human message.* Instructions stay in the system message; retrieved text is data, formatted `[1] (file, page N)`, so the model can cite `[1]` and the UI shows the same numbers.
- *Passages win over memory.* The sources are from 2013, and a small model likes to "correct" them with half-remembered numbers. When nothing matches it must say "The sources I have do not say.", so the RAG effect is visible.
- *Low temperature (0.2).* Factual answers and grading should vary little. The no-RAG runs still differed (section 4).
- *No-RAG mode keeps the 4T's.* Persona, tone, target and length limit are identical; only the sentences about sources change, so the comparison isolates retrieval.
- *Persona wording matters.* An early Traits text called the model a "quiz master" and the Target section mentioned quiz questions. The model then appended its own "Quiz question: ..." to plain answers. Changing Traits to "tutor in a trivia app" and removing the cue fixed it. We read this as a small model acting on every word of its persona.

## 4. Machine learning concepts, data preparation and retrieval

**Data preparation** (`app/ingest.py`). PyMuPDF extracts one `Document` per page. `clean()` repairs hyphenated line breaks and whitespace but keeps single newlines: they separate rows in the FAST FACTS tables and cannot cheaply be told from line wraps. Pages under 500 characters (covers, captions, image-only pages) are dropped: 119 kept, 23 dropped. The splitter yields 532 chunks. Bigger chunks keep a fact with its context but blur the embedding and fill the prompt; smaller chunks match precisely but can separate a value from its label. The 150-character overlap keeps a sentence cut at a boundary whole in one chunk. We did not tune chunk size, overlap or k.

**Embeddings and cosine similarity.** An embedding model maps text to a vector so that similar meanings lie close together. We compare vectors by cosine similarity:

$$\cos(\mathbf{a},\mathbf{b}) = \frac{\mathbf{a}\cdot\mathbf{b}}{\lVert\mathbf{a}\rVert\,\lVert\mathbf{b}\rVert}$$

Chroma uses cosine distance, $1-\cos$; the app shows relevance as $1-\text{distance}$. Cosine compares direction and ignores vector length, so a short and a long chunk on one topic can still match. `nomic-embed-text` was trained with task markers, so chunks get `search_document: ` and questions `search_query: `, added only at embedding time. Retrieval returns the top k = 4 chunks: more add distractors and prompt length for a 4B model, fewer risk missing the fact.

**Weights are fixed; RAG changes the input.** The model's knowledge stops at its training cutoff, so three points in time are involved: the cutoff, the 2013 sources and today. RAG retrains nothing; passages only sit in one prompt. With RAG, "How many moons does Saturn have?" gave "Saturn has 53 known moons (plus 9 awaiting official confirmation). Passage [4] states this directly." The 2013 source says 53. Without RAG the model said "Saturn has 83 confirmed moons!", and an earlier run said 146: without passages it produces plausible numbers (hallucination), and at temperature 0.2 it samples, so they change between runs (nondeterminism).

**Data quality.** `pypdf` garbled the DLR brochure's small capitals ("ne ptune", "ur anus", "tombaugh"). Switching to PyMuPDF changed the index from 502 chunks over 100 pages to 532 chunks over 119 pages. The 2013 sources are stale by design and the app faithfully repeats them: correct for a grounded app, a limitation for a reader who wants today's facts.

## 5. Results and reflection: linear regression vs. local LLM + RAG

**Task and data.** We predict a body's orbital period (Earth years) from its mean distance from the Sun (AU). Nine bodies come from the FAST FACTS tables of the NASA PDF; a tenth, synthetic body at 15 AU has period 15^1.5 = 58.09 years, so the model cannot have memorised it. Train (7): Mercury, Venus, Earth, Jupiter, Saturn, Neptune, Pluto. Test (3): Mars, Uranus, the synthetic body. The script asserts that no test body or period is in the retrieval collection.

**Why log-log.** Kepler's third law gives $T = a^{1.5}$, so $\log T = 1.5\log a$ is a straight line. We fit scikit-learn `LinearRegression` on $\log_{10}$ values (train rows only), plus a raw linear fit as baseline. The log-log slope is 1.4998 (Kepler: 1.5); the raw fit is $T = 6.24a - 11.90$.

**LLM + RAG.** The collection holds one short sentence per train body (distance and period) plus one background note. The query gives only the distance. The top 4 documents go into the prompt, and the model returns one number (JSON schema, temperature 0, seed 0). The no-RAG run uses the same prompt without examples. The LLM gets no regression model, coefficients or code execution.

Predicted period (Earth years) and mean absolute error (MAE):

| Test case | Distance (AU) | Actual | Log-log regression | Raw regression | LLM + RAG | LLM, no RAG |
| --- | --- | --- | --- | --- | --- | --- |
| Mars | 1.5237 | 1.88 | 1.88 | -2.39 | 0.41 | 0.62 |
| Uranus | 19.191 | 84.02 | 84.00 | 107.85 | 14.11 | 176.35 |
| Hypothetical body | 15 | 58.09 | 58.05 | 81.70 | 13.30 | 17.20 |
| **MAE (years)** | | | **0.02** | **17.24** | **38.73** | **44.83** |

**What was retrieved.** The same four bodies came back for all three queries: Earth (always first, relevance 0.853, 0.840, 0.836), Mercury, Venus and Neptune. Of the four numerically nearest train bodies, 3, 2 and 2 were retrieved. Jupiter and Saturn were never retrieved, although Saturn is nearest to two of the test distances (`experiment/results.md` has the full lists).

**Why the approaches differ.**

- Regression fits two parameters by least squares to exactly this relation. In log-log space it is linear, so the error is rounding-level. The raw line has the wrong shape and predicts a negative period for Mars.
- The LLM predicts tokens and does no arithmetic unless it reasons it out; our schema allowed only a number. It did not interpolate: shown Neptune at 30.07 AU = 164.79 years, it answered 14.11 years for 19.19 AU. For Mars it answered 0.41 years, below Earth's 1 year, which was in the prompt.
- Embedding similarity measures similarity of text, not numeric nearness: the examples are near-identical sentences differing in digits, and the same four came back for all three distances.

**Was RAG useful?** Marginally, in one case. MAE is 6.10 years lower with RAG (38.73 vs. 44.83), but all of it comes from Uranus (error 69.91 vs. 92.33); for Mars (1.47 vs. 1.26) and the synthetic body (44.79 vs. 40.89) it was slightly worse. With three cases and one run we do not treat this as an effect. Our interpretation: RAG helps when the answer is a fact to quote, as in the app, not when the model must infer a numeric pattern from four examples.

**When a specialised model is preferable.** When the relation is numeric and the input is a number: a two-parameter model is exact here, cheap, repeatable and checkable. An LLM is preferable when the task is language: finding, quoting and grading text.

**Limitations.**

- *Grounding is not guaranteed.* The Pluto answer with RAG contradicts itself: "Yes, a spacecraft has visited Pluto. The New Horizons spacecraft is scheduled to arrive at Pluto in 2015 [2, 6]." It follows the 2013 text but opens with "Yes" and cites passage 6, though only 4 were supplied. Nothing in the code checks citations.
- Grading feedback is sometimes odd (the verdict check covered only 18 answers), quiz questions are sometimes obscure because passages are sampled at random from the top 8, and latency is 3-25 s for Ask, about 10 s for a quiz question and 10-25 s for grading.
- The GPU profiles in `configs/` (12B-class models) are untested, and the experiment has three test cases and one run.

**Possible improvements.**

- Re-ranking or hybrid keyword plus vector search, so exact names and numbers match.
- Table-aware chunking of the FAST FACTS sheets, keeping a label and its value together.
- A larger model, using the GPU profiles in `configs/`.
- Retrieval by numeric distance, or a calculator tool for the LLM, as a different experiment.
- A labelled evaluation set for grading, and a code check that cited passage numbers exist.
