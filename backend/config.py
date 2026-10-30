from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv
from contextvars import ContextVar

load_dotenv(override=True)

CURRENT_USER_ID = ContextVar("user_id", default="default")


PROJECT_ROOT = Path(__file__).resolve().parent
def get_user_data_dir(user_id: str | None = None) -> Path:
    uid = user_id or CURRENT_USER_ID.get()
    d = PROJECT_ROOT / "data" / uid
    d.mkdir(parents=True, exist_ok=True)
    return d

def get_user_outputs_dir(user_id: str | None = None) -> Path:
    uid = user_id or CURRENT_USER_ID.get()
    d = PROJECT_ROOT / "outputs" / uid
    d.mkdir(parents=True, exist_ok=True)
    return d

def get_user_charts_dir(user_id: str | None = None) -> Path:
    uid = user_id or CURRENT_USER_ID.get()
    d = get_user_outputs_dir(uid) / "charts"
    d.mkdir(parents=True, exist_ok=True)
    return d

def get_user_reports_dir(user_id: str | None = None) -> Path:
    uid = user_id or CURRENT_USER_ID.get()
    d = get_user_outputs_dir(uid) / "reports"
    d.mkdir(parents=True, exist_ok=True)
    return d

def get_user_analysis_dir(user_id: str | None = None) -> Path:
    uid = user_id or CURRENT_USER_ID.get()
    d = get_user_outputs_dir(uid) / "analysis"
    d.mkdir(parents=True, exist_ok=True)
    return d

DEFAULT_LLM_MODEL = os.getenv("LLM_MODEL", "ollama/qwen2.5:3b")
DEFAULT_OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
DEFAULT_LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.2"))
DEFAULT_OUTPUT_FILENAME = os.getenv("DEFAULT_OUTPUT_FILENAME", "analysis_report")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")


# Runtime overrides for analysis columns
COLUMN_OVERRIDES = {
    "date_column": None,
    "metric_column": None,
    "group_column": None,
}


def ensure_directories(user_id: str | None = None) -> None:
    get_user_data_dir(user_id)
    get_user_outputs_dir(user_id)
    get_user_charts_dir(user_id)
    get_user_reports_dir(user_id)
    get_user_analysis_dir(user_id)
