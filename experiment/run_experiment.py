"""Linear regression versus a local LLM with RAG on one numerical task.

Task: predict a body's orbital period (Earth years) from its mean distance from the Sun (AU).
Run from the project root: uv run python -m experiment.run_experiment

The script reads the data from the NASA PDF, fits two regressions, asks the local LLM with and
without retrieved examples, and writes experiment/results.json and experiment/results.md.
"""

import csv
import json
import re
import shutil

import numpy as np
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama, OllamaEmbeddings
from pydantic import BaseModel, Field
from pypdf import PdfReader
from sklearn.linear_model import LinearRegression

from app.config import CHAT_MODEL, EMBED_MODEL, OLLAMA_BASE_URL, ROOT, SOURCES_DIR

EXPERIMENT_DIR = ROOT / "experiment"
PDF_NAME = "nasa_solar_system_lithographs_2013.pdf"
CSV_PATH = EXPERIMENT_DIR / "data" / "bodies.csv"
CHROMA_DIR = EXPERIMENT_DIR / "chroma"
JSON_PATH = EXPERIMENT_DIR / "results.json"
MD_PATH = EXPERIMENT_DIR / "results.md"

# Page (1-based) of each body's FAST FACTS table in the NASA PDF.
FAST_FACTS_PAGES = {
    "Mercury": 8, "Venus": 10, "Earth": 12, "Mars": 16, "Jupiter": 24,
    "Saturn": 28, "Uranus": 32, "Neptune": 34, "Pluto": 36,
}
# Mars and Uranus lie inside the training range (interpolation) and are held out as real test cases.
TEST_BODIES = {"Mars", "Uranus"}
# The PDF itself defines 1 AU as Earth's mean distance (149.60 million km) and gives Earth's orbit
# period as 365.26 days; these two numbers convert km to AU and days to years.
AU_MILLION_KM = 149.60
EARTH_YEAR_DAYS = 365.26
# Made-up body: the LLM cannot have memorised its period, but Kepler's law gives the true one.
SYNTHETIC_NAME = "Hypothetical body"
SYNTHETIC_AU = 15.0
K = 4  # documents retrieved per test case

BACKGROUND_NOTE = (
    "Bodies that are farther from the Sun take longer to orbit it, and the increase in "
    "orbital period is faster than proportional to the increase in distance."
)
# The same prompt is used with and without retrieved examples; the body is never named.
PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You estimate orbital periods. Answer with a single number: the orbital period in Earth years."),
    ("human",
     "A body orbits the Sun at a mean distance of {distance} AU.\n\n"
     "Reference examples:\n{examples}\n\n"
     "Predict the orbital period of this body in Earth years. Use the reference examples if any are given."),
])
NO_EXAMPLES = "(no reference examples available)"

APPROACHES = [
    ("loglog", "Linear regression (log-log)"),
    ("raw", "Linear regression (raw)"),
    ("llm_rag", "LLM + RAG"),
    ("llm_no_rag", "LLM, no RAG"),
]


class Prediction(BaseModel):
    """Structured LLM reply: exactly one number."""

    period_years: float = Field(description="Predicted orbital period in Earth years")


def find(pattern: str, text: str, body: str) -> re.Match:
    """Regex search that fails loudly, so a changed PDF layout cannot silently drop a value."""
    match = re.search(pattern, text)
    if match is None:
        raise ValueError(f"{body}: pattern {pattern!r} not found on its FAST FACTS page")
    return match


def build_dataset() -> list[dict]:
    """Read distance and orbit period from each FAST FACTS table, add the synthetic body, write the CSV."""
    reader = PdfReader(SOURCES_DIR / PDF_NAME)
    rows = []
    for body, page in FAST_FACTS_PAGES.items():
        text = reader.pages[page - 1].extract_text()
        distance_km = find(r"Mean Distance from the Sun\s+([\d,.]+) million km", text, body).group(1)
        period, unit = find(r"Orbit Period\s+([\d,.]+)\s+(?:Earth )?(days|years)", text, body).groups()
        period = float(period.replace(",", ""))
        rows.append({
            "body": body,
            "distance_au": round(float(distance_km.replace(",", "")) / AU_MILLION_KM, 4),
            "period_years": round(period / EARTH_YEAR_DAYS if unit == "days" else period, 4),
            "split": "test" if body in TEST_BODIES else "train",
            "source_page": page,
        })
    rows.append({
        "body": SYNTHETIC_NAME,
        "distance_au": SYNTHETIC_AU,
        "period_years": round(SYNTHETIC_AU**1.5, 4),
        "split": "test",
        "source_page": "",
    })
    CSV_PATH.parent.mkdir(parents=True, exist_ok=True)
    with CSV_PATH.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["body", "distance_au", "period_years", "split", "source_page"])
        writer.writeheader()
        writer.writerows(rows)
    return rows


def fit_regressions(train: list[dict], test: list[dict]) -> tuple[dict, dict]:
    """Fit on train rows only. The log-log model matches the power-law shape; the raw line is the baseline."""
    x_train = np.array([[r["distance_au"]] for r in train])
    y_train = np.array([r["period_years"] for r in train])
    x_test = np.array([[r["distance_au"]] for r in test])

    loglog = LinearRegression().fit(np.log10(x_train), np.log10(y_train))
    raw = LinearRegression().fit(x_train, y_train)
    predictions = {
        "loglog": (10 ** loglog.predict(np.log10(x_test))).tolist(),
        "raw": raw.predict(x_test).tolist(),
    }
    fits = {
        "loglog": {"slope": float(loglog.coef_[0]), "intercept": float(loglog.intercept_)},
        "raw": {"slope": float(raw.coef_[0]), "intercept": float(raw.intercept_)},
    }
    return predictions, fits


def build_store(train: list[dict], test: list[dict]) -> Chroma:
    """One short document per TRAIN body plus a background note; rebuilt from scratch on every run."""
    shutil.rmtree(CHROMA_DIR, ignore_errors=True)
    docs = [
        Document(
            page_content=(
                f"{r['body']} orbits the Sun at a mean distance of {r['distance_au']:g} AU "
                f"and takes {r['period_years']:g} Earth years to complete one orbit."
            ),
            metadata={"body": r["body"]},
        )
        for r in train
    ]
    docs.append(Document(page_content=BACKGROUND_NOTE, metadata={"body": "background"}))
    store = Chroma.from_documents(
        docs,
        OllamaEmbeddings(model=EMBED_MODEL, base_url=OLLAMA_BASE_URL),
        collection_name="orbits",
        persist_directory=str(CHROMA_DIR),
        collection_configuration={"hnsw": {"space": "cosine"}},
    )

    # The guarantee the exercise asks for: no test body or test answer is in the collection.
    stored = store.get()
    assert sorted(m["body"] for m in stored["metadatas"]) == sorted([r["body"] for r in train] + ["background"])
    for text in stored["documents"]:
        for r in test:
            assert r["body"] not in text and f"{r['period_years']:g}" not in text, f"test data leaked: {text}"
    return store


def ask_llm(chain, distance_au: float, examples: str) -> dict:
    """Ask for one number; keep the exact prompt and the model's raw reply for the report."""
    variables = {"distance": f"{distance_au:g}", "examples": examples}
    result = chain.invoke(variables)
    if result["parsed"] is None:
        raise RuntimeError(f"LLM reply could not be parsed: {result['raw'].content!r}")
    return {
        "prediction": result["parsed"].period_years,
        "raw_reply": result["raw"].content,
        "prompt": PROMPT.invoke(variables).to_string(),
    }


def run_cases(train: list[dict], test: list[dict], regression: dict) -> list[dict]:
    """Predict every test case with all four approaches and compute the errors."""
    store = build_store(train, test)
    llm = ChatOllama(model=CHAT_MODEL, base_url=OLLAMA_BASE_URL, temperature=0, seed=0)
    chain = PROMPT | llm.with_structured_output(Prediction, method="json_schema", include_raw=True)

    cases = []
    for i, row in enumerate(test):
        query = f"A body orbits the Sun at a mean distance of {row['distance_au']:g} AU."
        hits = store.similarity_search_with_relevance_scores(query, k=K)
        examples = "\n".join(f"- {doc.page_content}" for doc, _ in hits)
        with_rag = ask_llm(chain, row["distance_au"], examples)
        without_rag = ask_llm(chain, row["distance_au"], NO_EXAMPLES)

        predictions = {
            "loglog": regression["loglog"][i],
            "raw": regression["raw"][i],
            "llm_rag": with_rag["prediction"],
            "llm_no_rag": without_rag["prediction"],
        }
        actual = row["period_years"]
        abs_error = {key: abs(value - actual) for key, value in predictions.items()}
        nearest = sorted(train, key=lambda r: abs(r["distance_au"] - row["distance_au"]))[:K]
        cases.append({
            "body": row["body"],
            "distance_au": row["distance_au"],
            "actual_years": actual,
            "predictions": predictions,
            "abs_error": abs_error,
            "abs_pct_error": {key: 100 * err / actual for key, err in abs_error.items()},
            "query": query,
            "retrieved": [
                {"score": float(score), "body": doc.metadata["body"], "text": doc.page_content}
                for doc, score in hits
            ],
            "numerically_nearest_bodies": [r["body"] for r in nearest],
            "llm_rag": {"prompt": with_rag["prompt"], "raw_reply": with_rag["raw_reply"]},
            "llm_no_rag": {"prompt": without_rag["prompt"], "raw_reply": without_rag["raw_reply"]},
        })
    return cases


def table(header: list[str], rows: list[list]) -> str:
    """Markdown table."""
    lines = ["| " + " | ".join(header) + " |", "|" + " --- |" * len(header)]
    lines += ["| " + " | ".join(str(cell) for cell in row) + " |" for row in rows]
    return "\n".join(lines)


def write_markdown(results: dict) -> None:
    """Human-readable report. Every number is taken from `results`, none is typed by hand."""
    cases, summary, fits = results["cases"], results["summary"], results["fits"]
    labels = [label for _, label in APPROACHES]
    out = [
        "# Linear regression vs. local LLM + RAG",
        "",
        f"Generated by `experiment/run_experiment.py`. Chat model `{results['chat_model']}` "
        f"(temperature 0), embedding model `{results['embed_model']}`, top-k = {results['top_k']}.",
        "",
        "## Data",
        "",
        "Task: predict a body's orbital period (Earth years) from its mean distance from the Sun (AU).",
        f"Values come from the FAST FACTS tables of `{PDF_NAME}` (page in `source_page`). "
        f"Kilometres are converted to AU with 1 AU = {AU_MILLION_KM} million km and days to years with "
        f"1 year = {EARTH_YEAR_DAYS} days, both taken from the Earth sheet of the same PDF. "
        f"The row `{SYNTHETIC_NAME}` is synthetic: its period is {SYNTHETIC_AU:g}^1.5 (Kepler's third law).",
        "",
        table(
            ["body", "distance_au", "period_years", "split", "source_page"],
            [[r["body"], f"{r['distance_au']:g}", f"{r['period_years']:g}", r["split"], r["source_page"]]
             for r in results["dataset"]],
        ),
        "",
        "## Split",
        "",
        f"Train ({len(results['train_bodies'])}): {', '.join(results['train_bodies'])}.",
        f"Test ({len(results['test_bodies'])}): {', '.join(results['test_bodies'])}.",
        "Test rows are used for nothing except computing errors. The retrieval collection holds one document "
        "per train body plus one background note; the script asserts that no test body or test period is in it.",
        "",
        "## Method",
        "",
        "- Log-log regression: scikit-learn `LinearRegression` on log10(distance) -> log10(period), "
        "train rows only, predictions converted back with 10^x.",
        "- Raw regression: `LinearRegression` on the untransformed values, as a baseline.",
        f"- LLM + RAG: Chroma collection (cosine, `{results['embed_model']}` embeddings). The query states only "
        f"the distance; the top {results['top_k']} documents go into the prompt and the LLM returns one number "
        "(structured output). The body is never named.",
        "- LLM, no RAG: the same prompt without reference examples.",
        "- The LLM gets no regression model, no coefficients and no code execution.",
        "",
        "## Regression fit (train rows only)",
        "",
        table(
            ["model", "slope", "intercept"],
            [
                ["log10(period) = slope * log10(distance) + intercept",
                 f"{fits['loglog']['slope']:.4f}", f"{fits['loglog']['intercept']:.4f}"],
                ["period = slope * distance + intercept",
                 f"{fits['raw']['slope']:.4f}", f"{fits['raw']['intercept']:.4f}"],
            ],
        ),
        "",
        "## Results",
        "",
        "Predicted period (Earth years):",
        "",
        table(
            ["Test case", "Distance (AU)", "Actual"] + labels,
            [[c["body"], f"{c['distance_au']:g}", f"{c['actual_years']:.2f}"]
             + [f"{c['predictions'][key]:.2f}" for key, _ in APPROACHES] for c in cases],
        ),
        "",
        "Absolute error (years), with mean absolute error (MAE):",
        "",
        table(
            ["Test case"] + labels,
            [[c["body"]] + [f"{c['abs_error'][key]:.2f}" for key, _ in APPROACHES] for c in cases]
            + [["**MAE**"] + [f"**{summary['mae'][key]:.2f}**" for key, _ in APPROACHES]],
        ),
        "",
        "Absolute percentage error (%), with mean absolute percentage error (MAPE):",
        "",
        table(
            ["Test case"] + labels,
            [[c["body"]] + [f"{c['abs_pct_error'][key]:.2f}" for key, _ in APPROACHES] for c in cases]
            + [["**MAPE**"] + [f"**{summary['mape'][key]:.2f}**" for key, _ in APPROACHES]],
        ),
        "",
        "## Retrieved documents and raw LLM replies",
    ]
    for c in cases:
        retrieved_bodies = {r["body"] for r in c["retrieved"]}
        overlap = retrieved_bodies & set(c["numerically_nearest_bodies"])
        out += [
            "",
            f"### {c['body']} ({c['distance_au']:g} AU)",
            "",
            f"Query: `{c['query']}`",
            "",
            table(
                ["rank", "score", "document"],
                [[i, f"{r['score']:.4f}", r["text"]] for i, r in enumerate(c["retrieved"], 1)],
            ),
            "",
            f"The {results['top_k']} train bodies numerically closest in distance: "
            f"{', '.join(c['numerically_nearest_bodies'])}. "
            f"Of these, {len(overlap)} were retrieved"
            + (f" ({', '.join(sorted(overlap))})." if overlap else "."),
            "",
            f"Prompt with retrieved examples:\n\n```\n{c['llm_rag']['prompt']}\n```",
            "",
            f"Raw reply, LLM + RAG:\n\n```\n{c['llm_rag']['raw_reply']}\n```",
            "",
            f"Raw reply, LLM without RAG:\n\n```\n{c['llm_no_rag']['raw_reply']}\n```",
        ]
    MD_PATH.write_text("\n".join(out) + "\n")


def main() -> None:
    rows = build_dataset()
    train = [r for r in rows if r["split"] == "train"]
    test = [r for r in rows if r["split"] == "test"]

    regression, fits = fit_regressions(train, test)
    cases = run_cases(train, test, regression)

    summary = {
        "mae": {key: float(np.mean([c["abs_error"][key] for c in cases])) for key, _ in APPROACHES},
        "mape": {key: float(np.mean([c["abs_pct_error"][key] for c in cases])) for key, _ in APPROACHES},
    }
    results = {
        "chat_model": CHAT_MODEL,
        "embed_model": EMBED_MODEL,
        "top_k": K,
        "dataset": rows,
        "train_bodies": [r["body"] for r in train],
        "test_bodies": [r["body"] for r in test],
        "fits": fits,
        "cases": cases,
        "summary": summary,
    }
    JSON_PATH.write_text(json.dumps(results, indent=2) + "\n")
    write_markdown(results)
    print(MD_PATH.read_text())


if __name__ == "__main__":
    main()
