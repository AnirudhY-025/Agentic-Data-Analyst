from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(override=True)


PROJECT_ROOT = Path(__file__).resolve().parent
DATA_DIR = PROJECT_ROOT / "data"
OUTPUTS_DIR = PROJECT_ROOT / "outputs"
CHARTS_DIR = OUTPUTS_DIR / "charts"
REPORTS_DIR = OUTPUTS_DIR / "reports"
ANALYSIS_DIR = OUTPUTS_DIR / "analysis"

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


def ensure_directories() -> None:
    for directory in [DATA_DIR, OUTPUTS_DIR, CHARTS_DIR, REPORTS_DIR, ANALYSIS_DIR]:
        directory.mkdir(parents=True, exist_ok=True)
