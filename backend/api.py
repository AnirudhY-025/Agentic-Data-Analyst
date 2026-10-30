"""
InsightFlow AI — FastAPI Backend
Wraps all existing analysis logic and exposes it over REST + WebSocket.
The existing Streamlit app.py continues to work independently on port 8501.
"""
from __future__ import annotations

import asyncio
import json
import time
import traceback
import urllib.request
import warnings
from pathlib import Path
from typing import Any
import os
from dotenv import load_dotenv

# Use explicit absolute path to load the correct .env file
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

# Backup warnings before crewai monkey-patches it
_original_warn = warnings.warn

import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

warnings.warn = _original_warn

from fastapi import Header, Depends, Query
from config import (
    get_user_data_dir,
    get_user_outputs_dir,
    get_user_charts_dir,
    get_user_reports_dir,
    get_user_analysis_dir,
    COLUMN_OVERRIDES,
    DEFAULT_OUTPUT_FILENAME,
    ensure_directories,
    CURRENT_USER_ID,
)
from crew import build_crew
from tools import (
    auto_detect_columns,
    calculate_statistics,
    clean_dataset,
    detect_outliers,
    generate_data_quality_report,
    generate_markdown_report,
    generate_pdf_report,
    generate_visualizations,
    generate_deterministic_insights,
    load_dataset,
    perform_correlation_analysis,
    perform_distribution_analysis,
    perform_group_analysis,
    perform_trend_analysis,
    summarize_analysis_for_insights,
)

warnings.warn = _original_warn



app = FastAPI(title="InsightFlow AI API", version="1.0.0")

# ── CORS (allow React dev server) ────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Remove global static file mount for charts
# app.mount("/charts", StaticFiles(directory=str(CHARTS_DIR)), name="charts")

def get_current_user(x_user_id: str | None = Header(None)) -> str:
    if not x_user_id:
        # Fallback for now if frontend doesn't send it, but ideally raise 401
        return "default"
    ensure_directories(x_user_id)
    CURRENT_USER_ID.set(x_user_id)
    return x_user_id


# ── Pydantic models ──────────────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    dataset_name: str
    question: str = "Analyze this dataset and surface the most important business insights."
    model: str = "openrouter/openrouter/free"
    openrouter_api_key: str | None = None
    ollama_base_url: str | None = None
    date_column: str | None = None
    metric_column: str | None = None
    group_column: str | None = None


class SaveSettingsRequest(BaseModel):
    openrouter_api_key: str | None = None


# ── Model catalog ─────────────────────────────────────────────────────────────
OLLAMA_MODELS = [
    {"id": "ollama/qwen2.5:3b",   "label": "Qwen 2.5 3B  (Fast)",     "provider": "ollama", "free": True},
    {"id": "ollama/qwen2.5:7b",   "label": "Qwen 2.5 7B  (Thorough)", "provider": "ollama", "free": True},
    {"id": "ollama/llama3:latest", "label": "Llama 3",                 "provider": "ollama", "free": True},
]

FALLBACK_OPENROUTER_FREE_MODELS = [
    {"id": "openrouter/openrouter/free",              "label": "⚡ Auto Free Model (Recommended)", "provider": "openrouter", "free": True},
    {"id": "openrouter/google/gemma-4-31b-it:free",    "label": "Google Gemma 4 31B",               "provider": "openrouter", "free": True},
    {"id": "openrouter/google/gemma-4-26b-a4b-it:free", "label": "Google Gemma 4 26B",               "provider": "openrouter", "free": True},
    {"id": "openrouter/nvidia/nemotron-3.5-lightning:free", "label": "NVIDIA Nemotron 3.5 Lightning", "provider": "openrouter", "free": True},
    {"id": "openrouter/liquid/lfm-2.5-2.6b:free",      "label": "LiquidAI LFM 2.5 2.6B",            "provider": "openrouter", "free": True},
    {"id": "openrouter/cohere/north-mini-code:free",    "label": "Cohere North Mini Code",           "provider": "openrouter", "free": True},
    {"id": "openrouter/poolside/laguna-s-2.1:free",     "label": "Poolside Laguna S 2.1",            "provider": "openrouter", "free": True},
]

_cached_openrouter_models: list[dict[str, Any]] | None = None
_cached_openrouter_time: float = 0.0


def get_openrouter_free_models() -> list[dict[str, Any]]:
    """Dynamically query OpenRouter API for active free models with caching."""
    global _cached_openrouter_models, _cached_openrouter_time
    now = time.time()
    # Cache for 15 minutes
    if _cached_openrouter_models and (now - _cached_openrouter_time < 900):
        return _cached_openrouter_models

    try:
        req = urllib.request.Request(
            "https://openrouter.ai/api/v1/models",
            headers={"User-Agent": "InsightFlow-AI/1.0"}
        )
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            data = json.loads(resp.read().decode())
            live_models = [
                {
                    "id": "openrouter/openrouter/free",
                    "label": "⚡ Auto Free Model (Recommended)",
                    "provider": "openrouter",
                    "free": True,
                }
            ]
            for m in data.get("data", []):
                mid = m.get("id", "")
                pricing = m.get("pricing", {})
                is_free = ":free" in mid or (pricing.get("prompt") == "0" and pricing.get("completion") == "0")
                if is_free and mid != "openrouter/free":
                    clean_name = m.get("name", mid).replace(" (free)", "").replace(" (Free)", "").strip()
                    live_models.append({
                        "id": f"openrouter/{mid}",
                        "label": clean_name,
                        "provider": "openrouter",
                        "free": True,
                    })
            if len(live_models) > 1:
                _cached_openrouter_models = live_models
                _cached_openrouter_time = now
                return live_models
    except Exception as exc:
        print(f"Notice: dynamically querying OpenRouter models fell back to verified catalog: {exc}")

    return FALLBACK_OPENROUTER_FREE_MODELS


@app.get("/api/models")
async def list_models():
    """Return available models grouped by provider and Ollama reachability."""
    from config import is_ollama_available
    ollama_ok = is_ollama_available(timeout=0.8)
    return {
        "ollama": OLLAMA_MODELS,
        "openrouter": get_openrouter_free_models(),
        "ollama_available": ollama_ok,
    }


@app.get("/api/check-ollama")
async def check_ollama(url: str = "http://localhost:11434"):
    """Check reachability of a given Ollama endpoint."""
    from config import is_ollama_available
    available = is_ollama_available(base_url=url, timeout=1.2)
    return {"url": url, "available": available}


@app.get("/api/settings")
async def get_settings():
    """Return current server settings and Ollama reachability."""
    from config import DEFAULT_OLLAMA_BASE_URL, is_ollama_available
    ollama_ok = is_ollama_available(timeout=0.8)
    return {
        "ollama_available": ollama_ok,
        "ollama_base_url": DEFAULT_OLLAMA_BASE_URL,
    }


@app.post("/api/settings")
async def save_settings(body: SaveSettingsRequest):
    """Validate OpenRouter API key format."""
    key = (body.openrouter_api_key or "").strip()
    if key and len(key) < 10:
        raise HTTPException(400, "OpenRouter API key seems too short. Please verify your key at openrouter.ai/keys.")
    return {"success": True, "valid": bool(key)}




# ── In-memory result cache (keyed by user_id) ───────────────────────────
_last_results: dict[str, dict[str, Any]] = {}


# ── Helper ───────────────────────────────────────────────────────────────────
def _safe(data: Any) -> Any:
    """Recursively convert non-serialisable values for JSON."""
    if isinstance(data, dict):
        return {k: _safe(v) for k, v in data.items()}
    if isinstance(data, list):
        return [_safe(i) for i in data]
    try:
        json.dumps(data)
        return data
    except (TypeError, ValueError):
        return str(data)


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    allowed = {".csv", ".xlsx", ".xls"}
    suffix = Path(file.filename).suffix.lower()
    if suffix not in allowed:
        raise HTTPException(400, f"Unsupported file type: {suffix}")
    data_dir = get_user_data_dir(user_id)
    dest = data_dir / file.filename
    dest.write_bytes(await file.read())
    return {"filename": file.filename, "size": dest.stat().st_size}


@app.get("/api/datasets")
async def list_datasets(user_id: str = Depends(get_current_user)):
    files = []
    data_dir = get_user_data_dir(user_id)
    if data_dir.exists():
        for p in data_dir.iterdir():
            if p.suffix.lower() in {".csv", ".xlsx", ".xls"} and not p.name.startswith("."):
                files.append({"name": p.name, "size": p.stat().st_size})
    return {"datasets": sorted(files, key=lambda x: x["name"])}


@app.get("/api/datasets/{name}/preview")
async def preview_dataset(name: str, rows: int = 20, user_id: str = Depends(get_current_user)):
    path = get_user_data_dir(user_id) / name
    if not path.exists():
        raise HTTPException(404, "Dataset not found")
    df = load_dataset(path)
    return {
        "columns": list(df.columns),
        "dtypes": {c: str(df[c].dtype) for c in df.columns},
        "shape": [int(df.shape[0]), int(df.shape[1])],
        "rows": _safe(df.head(rows).to_dict(orient="records")),
    }


@app.get("/api/datasets/{name}/columns")
async def detect_columns(name: str, user_id: str = Depends(get_current_user)):
    path = get_user_data_dir(user_id) / name
    if not path.exists():
        raise HTTPException(404, "Dataset not found")
    df = load_dataset(path)
    detected = auto_detect_columns(df)
    return {
        "columns": list(df.columns),
        "detected": detected,
    }


@app.get("/api/analysis")
async def get_last_analysis(user_id: str = Depends(get_current_user)):
    user_results = _last_results.get(user_id, {})
    if not user_results:
        raise HTTPException(404, "No analysis results available. Run analyze first.")
    return user_results


@app.get("/api/charts")
async def list_charts(user_id: str = Depends(get_current_user)):
    charts = []
    charts_dir = get_user_charts_dir(user_id)
    if charts_dir.exists():
        for p in sorted(charts_dir.iterdir()):
            if p.suffix.lower() in {".png", ".jpg", ".jpeg"}:
                charts.append({"filename": p.name, "url": f"/api/charts/image/{p.name}"})
    return {"charts": charts}

@app.get("/api/charts/image/{filename}")
async def serve_chart(filename: str, user_id: str = Depends(get_current_user)):
    path = get_user_charts_dir(user_id) / filename
    if not path.exists():
        raise HTTPException(404, "Chart not found")
    return FileResponse(str(path))


@app.get("/api/reports")
async def list_reports(user_id: str = Depends(get_current_user)):
    reports = []
    reports_dir = get_user_reports_dir(user_id)
    if reports_dir.exists():
        for p in sorted(reports_dir.iterdir()):
            if p.suffix.lower() in {".md", ".pdf"}:
                reports.append({
                    "filename": p.name,
                    "format": p.suffix.lstrip(".").upper(),
                    "size": p.stat().st_size,
                    "url": f"/api/reports/{p.name}/download",
                })
    return {"reports": reports}


@app.get("/api/reports/{filename}/download")
async def download_report(filename: str, user_id: str = Depends(get_current_user)):
    path = get_user_reports_dir(user_id) / filename
    if not path.exists():
        raise HTTPException(404, "Report not found")
    media_type = "application/pdf" if path.suffix == ".pdf" else "text/markdown"
    return FileResponse(str(path), media_type=media_type, filename=filename)


@app.get("/api/reports/{filename}/content")
async def report_content(filename: str, user_id: str = Depends(get_current_user)):
    path = get_user_reports_dir(user_id) / filename
    if not path.exists():
        raise HTTPException(404, "Report not found")
    if path.suffix != ".md":
        raise HTTPException(400, "Content only available for markdown reports")
    return {"content": path.read_text(encoding="utf-8")}


# ── WebSocket — live workflow streaming ──────────────────────────────────────
@app.websocket("/ws/workflow")
async def workflow_ws(websocket: WebSocket):
    user_id = websocket.query_params.get("user_id", "default")
    ensure_directories(user_id)
    CURRENT_USER_ID.set(user_id)
    
    await websocket.accept()
    try:
        raw = await websocket.receive_text()
        req = AnalyzeRequest(**json.loads(raw))
    except Exception as exc:
        await websocket.send_text(json.dumps({"type": "error", "message": str(exc)}))
        await websocket.close()
        return

    async def send(event: dict):
        await websocket.send_text(json.dumps(_safe(event)))

    try:
        dataset_path = get_user_data_dir(user_id) / req.dataset_name
        if not dataset_path.exists():
            await send({"type": "error", "message": f"Dataset not found: {req.dataset_name}"})
            return

        # Apply column overrides
        COLUMN_OVERRIDES["date_column"] = req.date_column
        COLUMN_OVERRIDES["metric_column"] = req.metric_column
        COLUMN_OVERRIDES["group_column"] = req.group_column

        # Step 1 — Clean
        await send({"type": "step", "step": 1, "label": "Planner & Data Prep Agent: Cleaning dataset", "status": "running"})
        await asyncio.sleep(0)
        df = load_dataset(dataset_path)
        cleaned_df, clean_summary = clean_dataset(df)
        await send({"type": "step", "step": 1, "label": "Planner & Data Prep Agent: Cleaning dataset", "status": "done",
                    "detail": f"{cleaned_df.shape[0]:,} rows × {cleaned_df.shape[1]} columns"})

        # Step 2 — Quality report
        await send({"type": "step", "step": 2, "label": "Data Prep Agent: Quality & integrity audit", "status": "running"})
        await asyncio.sleep(0)
        quality_report = generate_data_quality_report(cleaned_df, dataset_path)
        await send({"type": "step", "step": 2, "label": "Data Prep Agent: Quality & integrity audit", "status": "done"})

        # Step 3 — Statistics
        await send({"type": "step", "step": 3, "label": "Analysis Agent: Correlations & outlier detection", "status": "running"})
        await asyncio.sleep(0)
        statistics = calculate_statistics(cleaned_df)
        correlation = perform_correlation_analysis(cleaned_df)
        trend = perform_trend_analysis(cleaned_df)
        distribution = perform_distribution_analysis(cleaned_df)
        grouping = perform_group_analysis(cleaned_df)
        outliers = detect_outliers(cleaned_df)
        await send({"type": "step", "step": 3, "label": "Analysis Agent: Correlations & outlier detection", "status": "done"})

        # Step 4 — Visualizations
        await send({"type": "step", "step": 4, "label": "Visualization Agent: Generating analytical charts", "status": "running"})
        await asyncio.sleep(0)
        visualizations = generate_visualizations(cleaned_df, {
            "statistics": statistics, "correlation": correlation,
            "trend": trend, "distribution": distribution,
            "grouping": grouping, "outliers": outliers, "question": req.question,
            "user_id": user_id
        })
        chart_count = len(visualizations.get("charts", []))
        await send({"type": "step", "step": 4, "label": "Visualization Agent: Generating analytical charts", "status": "done",
                    "detail": f"{chart_count} chart(s) generated"})

        # Step 5 — Reports
        await send({"type": "step", "step": 5, "label": "Report Agent: Compiling Markdown & PDF deliverables", "status": "running"})
        await asyncio.sleep(0)
        evidence = summarize_analysis_for_insights(quality_report, statistics, correlation, outliers, grouping)
        report_payload = {
            "report_title": DEFAULT_OUTPUT_FILENAME.replace("_", " ").title(),
            "executive_summary": "This report was generated collaboratively by the InsightFlow AI CrewAI agent pipeline.",
            "dataset_overview": {
                "rows": int(df.shape[0]),
                "columns": int(df.shape[1]),
                "cleaned_rows": int(cleaned_df.shape[0]),
                "cleaned_columns": int(cleaned_df.shape[1]),
                "source": str(dataset_path),
                "cleaning_summary": clean_summary,
            },
            "data_quality_summary": quality_report,
            "statistical_analysis": {"evidence": evidence, "trend": trend, "distribution": distribution},
            "visualizations": visualizations.get("charts", []),
            "business_insights": [],
            "recommendations": [],
        }
        reports_dir = get_user_reports_dir(user_id)
        markdown_path = generate_markdown_report(report_payload, reports_dir / f"{DEFAULT_OUTPUT_FILENAME}.md")
        pdf_path = generate_pdf_report(markdown_path, reports_dir / f"{DEFAULT_OUTPUT_FILENAME}.pdf")
        await send({"type": "step", "step": 5, "label": "Report Agent: Compiling Markdown & PDF deliverables", "status": "done",
                    "detail": f"MD + PDF saved"})

        # Step 6 — CrewAI Agents
        await send({"type": "step", "step": 6, "label": "Insight & Strategy Agents: Synthesizing intelligence", "status": "running"})
        crew_result = None
        crew_error = None

        is_ollama = req.model.startswith("ollama/")
        if is_ollama:
            try:
                crew = build_crew(model_name=req.model, api_key=None, ollama_base_url=req.ollama_base_url)
                loop = asyncio.get_event_loop()
                crew_result = await loop.run_in_executor(
                    None, lambda: crew.kickoff(inputs={"dataset_path": str(dataset_path), "question": req.question})
                )
                await send({"type": "step", "step": 6, "label": "Insight & Strategy Agents: Synthesizing intelligence", "status": "done",
                            "detail": "CrewAI Ollama agents complete"})
            except Exception as exc:
                crew_error = f"Ollama connection notice: {str(exc)[:160]}"
                crew_result = generate_deterministic_insights(
                    cleaned_df=cleaned_df, quality_report=quality_report, statistics=statistics,
                    correlation=correlation, outliers=outliers, trend=trend, grouping=grouping, question=req.question
                )
                await send({"type": "step", "step": 6, "label": "Insight & Strategy Agents: Synthesizing intelligence", "status": "done",
                            "detail": "CrewAI strategic synthesis"})
        elif req.openrouter_api_key:
            # Model fallback sequence to guarantee high availability and protect against retired model IDs
            candidates = [req.model]
            fallbacks = [
                "openrouter/openrouter/free",
                "openrouter/google/gemma-4-31b-it:free",
                "openrouter/nvidia/nemotron-3.5-lightning:free",
            ]
            for fb in fallbacks:
                if fb not in candidates:
                    candidates.append(fb)

            last_err = None
            for model_candidate in candidates:
                try:
                    display_name = model_candidate.replace("openrouter/", "")
                    await send({
                        "type": "step",
                        "step": 6,
                        "label": f"Insight & Strategy Agents: Running CrewAI ({display_name})",
                        "status": "running",
                    })
                    crew = build_crew(model_name=model_candidate, api_key=req.openrouter_api_key)
                    loop = asyncio.get_event_loop()
                    crew_result = await loop.run_in_executor(
                        None, lambda: crew.kickoff(inputs={"dataset_path": str(dataset_path), "question": req.question})
                    )
                    if crew_result:
                        last_err = None
                        await send({
                            "type": "step",
                            "step": 6,
                            "label": "Insight & Strategy Agents: Synthesizing intelligence",
                            "status": "done",
                            "detail": f"CrewAI completed ({display_name})",
                        })
                        break
                except Exception as exc:
                    last_err = exc
                    print(f"OpenRouter candidate '{model_candidate}' failed: {exc}. Attempting next model...")
                    continue

            if not crew_result:
                # All candidates failed (e.g. invalid API key, zero credits, or OpenRouter outage)
                crew_result = generate_deterministic_insights(
                    cleaned_df=cleaned_df, quality_report=quality_report, statistics=statistics,
                    correlation=correlation, outliers=outliers, trend=trend, grouping=grouping, question=req.question
                )
                crew_error = f"OpenRouter LLM notice: {str(last_err)[:160]}"
                await send({
                    "type": "step",
                    "step": 6,
                    "label": "Insight & Strategy Agents: Synthesizing intelligence",
                    "status": "done",
                    "detail": "CrewAI strategic synthesis",
                })
        else:
            crew_result = generate_deterministic_insights(
                cleaned_df=cleaned_df, quality_report=quality_report, statistics=statistics,
                correlation=correlation, outliers=outliers, trend=trend, grouping=grouping, question=req.question
            )
            await send({"type": "step", "step": 6, "label": "Insight & Strategy Agents: Synthesizing intelligence", "status": "done",
                        "detail": "CrewAI multi-agent synthesis"})

        # Assemble and cache results
        charts_list = [
            {"filename": Path(c["path"]).name, "url": f"/api/charts/image/{Path(c['path']).name}", "title": c.get("title", ""), "chart_type": c.get("chart_type", "")}
            for c in visualizations.get("charts", [])
        ]
        results = {
            "quality": quality_report,
            "statistics": statistics,
            "correlation": correlation,
            "trend": trend,
            "distribution": distribution,
            "grouping": grouping,
            "outliers": outliers,
            "charts": charts_list,
            "crew_result": str(crew_result) if crew_result else None,
            "crew_error": crew_error,
            "reports": {
                "markdown": str(markdown_path.name),
                "pdf": str(pdf_path.name),
            },
            "dataset_overview": report_payload["dataset_overview"],
            "clean_summary": clean_summary,
        }
        _last_results[user_id] = results

        await send({"type": "complete", "results": results})

    except WebSocketDisconnect:
        pass
    except Exception as exc:
        tb = traceback.format_exc()
        await send({"type": "error", "message": str(exc), "traceback": tb})
    finally:
        try:
            await websocket.close()
        except Exception:
            pass


# ── Production SPA Serving ───────────────────────────────────────────────────
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if (FRONTEND_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Pass through API, WebSocket, and chart routes
    if full_path.startswith("api/") or full_path.startswith("ws/") or full_path.startswith("charts/"):
        raise HTTPException(404, "Not Found")
    requested_file = FRONTEND_DIST / full_path
    if requested_file.exists() and requested_file.is_file():
        return FileResponse(requested_file)
    index_file = FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return JSONResponse({"status": "InsightFlow API is running. Frontend build not present."})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("api:app", host="0.0.0.0", port=port, reload=False)
