from __future__ import annotations

import warnings
# Backup the clean built-in warnings.warn before crewai/tools monkey-patches it
_original_warn = warnings.warn

from pathlib import Path

import pandas as pd
import streamlit as st

from config import DATA_DIR, DEFAULT_OUTPUT_FILENAME, REPORTS_DIR, ensure_directories, COLUMN_OVERRIDES
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
    load_dataset,
    perform_correlation_analysis,
    perform_distribution_analysis,
    perform_group_analysis,
    perform_trend_analysis,
    summarize_analysis_for_insights,
)

# Restore the original warnings.warn to bypass the buggy CrewAI warning monkey-patch
warnings.warn = _original_warn

ensure_directories()

st.set_page_config(
    page_title="Agentic AI Data Analyst",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─────────────────────────────────────────────────────────────────────────────
#  GLOBAL CSS  ·  Dark premium theme + Inter font
# ─────────────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

/* ── Base ──────────────────────────────────────────── */
html, body, [class*="css"], .stApp {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
}
.stApp {
    background: #070D1A !important;
}

/* ── Hide chrome ────────────────────────────────────── */
#MainMenu, footer { visibility: hidden; }
[data-testid="stDecoration"] { display: none !important; }
.stDeployButton { display: none !important; }

/* ── Scrollbar ──────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
::-webkit-scrollbar-thumb { background: rgba(6,182,212,0.35); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(6,182,212,0.6); }

/* ── Sidebar ────────────────────────────────────────── */
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0B1120 0%, #0E1525 100%) !important;
    border-right: 1px solid rgba(6,182,212,0.1) !important;
}
[data-testid="stSidebarContent"] { padding: 1.25rem 1.2rem !important; }
[data-testid="stSidebar"] p,
[data-testid="stSidebar"] li,
[data-testid="stSidebar"] span,
[data-testid="stSidebar"] small,
[data-testid="stSidebar"] label { color: #94A3B8 !important; font-size: 0.88rem !important; }
[data-testid="stSidebar"] h1,
[data-testid="stSidebar"] h2,
[data-testid="stSidebar"] h3,
[data-testid="stSidebar"] h4,
[data-testid="stSidebar"] strong { color: #E2E8F0 !important; }
[data-testid="stSidebar"] hr { border-color: rgba(255,255,255,0.07) !important; margin: 1rem 0 !important; }

/* ── Primary button ─────────────────────────────────── */
.stButton > button {
    font-family: 'Inter', sans-serif !important;
    border-radius: 12px !important;
    font-weight: 600 !important;
    transition: all 0.22s cubic-bezier(0.4,0,0.2,1) !important;
    border: none !important;
    letter-spacing: 0.01em !important;
}
.stButton > button[kind="primary"] {
    background: linear-gradient(135deg, #0891B2 0%, #06B6D4 55%, #38BDF8 100%) !important;
    color: #020D14 !important;
    font-size: 0.97rem !important;
    font-weight: 700 !important;
    padding: 0.75rem 1.75rem !important;
    box-shadow: 0 4px 20px rgba(6,182,212,0.3), 0 0 0 0 rgba(6,182,212,0.5) !important;
}
.stButton > button[kind="primary"]:hover {
    transform: translateY(-2px) scale(1.01) !important;
    box-shadow: 0 8px 32px rgba(6,182,212,0.45), 0 0 0 3px rgba(6,182,212,0.12) !important;
}
.stButton > button[kind="primary"]:active { transform: translateY(0) scale(1) !important; }
.stButton > button[kind="secondary"] {
    background: rgba(255,255,255,0.05) !important;
    color: #CBD5E1 !important;
    border: 1px solid rgba(255,255,255,0.12) !important;
}
.stButton > button[kind="secondary"]:hover {
    background: rgba(255,255,255,0.09) !important;
    border-color: rgba(6,182,212,0.35) !important;
    color: #E2E8F0 !important;
}

/* ── File uploader ──────────────────────────────────── */
[data-testid="stFileUploader"] {
    background: rgba(6,182,212,0.04) !important;
    border: 1.5px dashed rgba(6,182,212,0.32) !important;
    border-radius: 16px !important;
    transition: border-color 0.2s ease, background 0.2s ease !important;
}
[data-testid="stFileUploader"]:hover {
    border-color: rgba(6,182,212,0.6) !important;
    background: rgba(6,182,212,0.07) !important;
}
[data-testid="stFileDropzoneInstructions"] > div > span { color: #64748B !important; }
[data-testid="stFileDropzoneInstructions"] > div > small { color: #475569 !important; }

/* ── Text area ──────────────────────────────────────── */
.stTextArea textarea {
    background: rgba(15,23,42,0.65) !important;
    border: 1px solid rgba(255,255,255,0.09) !important;
    border-radius: 13px !important;
    color: #CBD5E1 !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 0.9rem !important;
    line-height: 1.65 !important;
    resize: none !important;
    caret-color: #06B6D4 !important;
}
.stTextArea textarea:focus {
    border-color: rgba(6,182,212,0.45) !important;
    box-shadow: 0 0 0 3px rgba(6,182,212,0.1) !important;
    outline: none !important;
}
.stTextArea label,
.stFileUploader label { color: #475569 !important; font-size: 0.78rem !important; font-weight: 700 !important; letter-spacing: 0.08em !important; text-transform: uppercase !important; }

/* ── Tabs ───────────────────────────────────────────── */
.stTabs [data-baseweb="tab-list"] {
    background: rgba(255,255,255,0.03) !important;
    border: 1px solid rgba(255,255,255,0.06) !important;
    border-radius: 12px !important;
    padding: 3px !important;
    gap: 2px !important;
}
.stTabs [data-baseweb="tab"] {
    background: transparent !important;
    color: #475569 !important;
    border-radius: 9px !important;
    font-size: 0.81rem !important;
    font-weight: 600 !important;
    padding: 0.38rem 0.8rem !important;
    border: none !important;
    transition: all 0.15s ease !important;
}
.stTabs [aria-selected="true"] {
    background: linear-gradient(135deg, #0891B2, #06B6D4) !important;
    color: #020D14 !important;
    font-weight: 700 !important;
}

/* ── Dataframe ──────────────────────────────────────── */
[data-testid="stDataFrame"] {
    border: 1px solid rgba(255,255,255,0.07) !important;
    border-radius: 14px !important;
    overflow: hidden !important;
}

/* ── Status ─────────────────────────────────────────── */
[data-testid="stStatusContainer"] {
    background: rgba(6,182,212,0.05) !important;
    border: 1px solid rgba(6,182,212,0.18) !important;
    border-radius: 16px !important;
}

/* ── JSON viewer ────────────────────────────────────── */
.stJson > div {
    background: rgba(10,18,36,0.85) !important;
    border: 1px solid rgba(255,255,255,0.07) !important;
    border-radius: 12px !important;
}

/* ── Info/warning/error ─────────────────────────────── */
[data-testid="stAlert"] {
    border-radius: 13px !important;
    border: none !important;
}

/* ── Metric ─────────────────────────────────────────── */
[data-testid="stMetric"] {
    background: rgba(255,255,255,0.03) !important;
    border: 1px solid rgba(255,255,255,0.07) !important;
    border-radius: 14px !important;
    padding: 1rem 1.1rem !important;
}
[data-testid="stMetricLabel"] { color: #475569 !important; font-size: 0.75rem !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.08em !important; }
[data-testid="stMetricValue"] { color: #F1F5F9 !important; font-size: 1.65rem !important; font-weight: 800 !important; }

/* ── Caption ────────────────────────────────────────── */
.stCaption { color: #334155 !important; font-size: 0.78rem !important; }

/* ── HR ─────────────────────────────────────────────── */
hr { border-color: rgba(255,255,255,0.06) !important; }

/* ── Image captions ─────────────────────────────────── */
[data-testid="stImage"] > small { color: #475569 !important; font-size: 0.78rem !important; }

/* ═══════════════════════════════════════════════════════
   CUSTOM COMPONENT CLASSES
   ═══════════════════════════════════════════════════════ */

/* ── Hero ───────────────────────────────────────────── */
.hero-wrap {
    position: relative;
    overflow: hidden;
    border-radius: 26px;
    padding: 2.75rem 2.75rem 2.25rem;
    margin-bottom: 2rem;
    background: linear-gradient(135deg, #04091A 0%, #071628 40%, #061422 100%);
    border: 1px solid rgba(6,182,212,0.15);
    box-shadow:
        0 0 0 1px rgba(255,255,255,0.025),
        0 36px 80px rgba(0,0,0,0.65),
        inset 0 1px 0 rgba(255,255,255,0.055);
}
.hero-orb-1 {
    position: absolute; top: -80px; right: -60px;
    width: 320px; height: 320px; border-radius: 50%;
    background: radial-gradient(circle, rgba(6,182,212,0.16) 0%, transparent 65%);
    pointer-events: none;
}
.hero-orb-2 {
    position: absolute; bottom: -100px; left: 30%;
    width: 280px; height: 280px; border-radius: 50%;
    background: radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 65%);
    pointer-events: none;
}
.hero-orb-3 {
    position: absolute; top: 20px; left: -40px;
    width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 65%);
    pointer-events: none;
}
.hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(6,182,212,0.1);
    border: 1px solid rgba(6,182,212,0.28);
    border-radius: 100px; padding: 5px 15px 5px 11px;
    font-size: 0.74rem; font-weight: 700; color: #22D3EE;
    letter-spacing: 0.1em; text-transform: uppercase;
    margin-bottom: 1.15rem; position: relative; z-index: 1;
}
.hero-badge-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #06B6D4;
    box-shadow: 0 0 8px rgba(6,182,212,0.8), 0 0 16px rgba(6,182,212,0.4);
    animation: hbdot 2s ease-in-out infinite;
}
@keyframes hbdot {
    0%,100% { opacity:1; transform:scale(1); }
    50% { opacity:0.55; transform:scale(0.8); }
}
.hero-title {
    font-size: 2.8rem; font-weight: 900;
    line-height: 1.1; color: #F8FAFC;
    letter-spacing: -0.05em;
    margin: 0 0 0.85rem;
    position: relative; z-index: 1;
}
.hero-title .accent {
    background: linear-gradient(90deg, #06B6D4 0%, #38BDF8 55%, #7DD3FC 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
}
.hero-sub {
    font-size: 1.02rem; color: #64748B;
    line-height: 1.72; max-width: 660px;
    margin: 0 0 1.6rem;
    position: relative; z-index: 1;
}
.hero-pills { display: flex; flex-wrap: wrap; gap: 7px; position: relative; z-index: 1; }
.hero-pill {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(255,255,255,0.045);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 100px; padding: 5px 12px;
    font-size: 0.77rem; color: #94A3B8; font-weight: 500;
}

/* ── Section header ─────────────────────────────────── */
.sec-hdr {
    display: flex; align-items: center; gap: 11px;
    margin: 1.6rem 0 0.85rem;
}
.sec-hdr-ico {
    width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(6,182,212,0.18), rgba(14,165,233,0.18));
    border: 1px solid rgba(6,182,212,0.28);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.92rem;
}
.sec-hdr-body { display: flex; flex-direction: column; gap: 1px; }
.sec-hdr-title { font-size: 1.05rem; font-weight: 700; color: #E2E8F0; letter-spacing: -0.02em; }
.sec-hdr-sub { font-size: 0.8rem; color: #475569; }

/* ── KPI card ───────────────────────────────────────── */
.kpi-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 1.2rem 1.15rem;
    position: relative; overflow: hidden;
    transition: transform 0.2s ease, border-color 0.2s ease;
}
.kpi-card:hover { transform: translateY(-1px); border-color: rgba(6,182,212,0.2); }
.kpi-top { position:absolute; top:0; left:0; right:0; height:2px; border-radius:16px 16px 0 0; }
.kpi-icon { font-size: 1.35rem; margin-bottom: 0.55rem; display: block; }
.kpi-lbl { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.11em; color: #475569; margin-bottom: 0.2rem; }
.kpi-val { font-size: 1.55rem; font-weight: 800; color: #F1F5F9; line-height: 1.15; }
.kpi-note { font-size: 0.74rem; color: #334155; margin-top: 0.2rem; }

/* ── Feature item ───────────────────────────────────── */
.feat-item {
    display: flex; align-items: flex-start; gap: 11px;
    padding: 0.65rem 0; border-bottom: 1px solid rgba(255,255,255,0.04);
}
.feat-ico {
    width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.88rem; margin-top: 1px;
}
.feat-txt { font-size: 0.84rem; color: #94A3B8; line-height: 1.5; }
.feat-bold { font-weight: 700; color: #CBD5E1; display: block; margin-bottom: 1px; }

/* ── Sidebar brand ──────────────────────────────────── */
.sb-brand {
    display: flex; align-items: center; gap: 11px;
    padding: 0.15rem 0 1.25rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    margin-bottom: 1.1rem;
}
.sb-brand-ico {
    width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
    background: linear-gradient(135deg, #0891B2 0%, #06B6D4 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem;
    box-shadow: 0 0 20px rgba(6,182,212,0.28);
}
.sb-brand-name { font-size: 0.94rem; font-weight: 800; color: #F1F5F9 !important; }
.sb-brand-sub { font-size: 0.71rem; color: #475569 !important; margin-top: 2px; }

/* ── Sidebar config pills ───────────────────────────── */
.cfg-pills { display: flex; flex-wrap: wrap; gap: 5px; margin: 0.5rem 0 0.25rem; }
.cfg-pill {
    display: inline-flex; align-items: center; gap: 4px;
    background: rgba(255,255,255,0.045);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px; padding: 3px 8px;
    font-size: 0.73rem; font-weight: 600; color: #94A3B8 !important;
}

/* ── Sidebar step ───────────────────────────────────── */
.sb-step { display: flex; align-items: flex-start; gap: 10px; padding: 0.48rem 0; }
.sb-step-n {
    width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
    background: rgba(6,182,212,0.12); border: 1px solid rgba(6,182,212,0.3);
    color: #22D3EE; font-size: 0.65rem; font-weight: 800;
    display: flex; align-items: center; justify-content: center; margin-top: 1px;
}
.sb-step-t { font-size: 0.82rem; color: #94A3B8 !important; line-height: 1.42; }
.sb-step-b { font-weight: 700; color: #CBD5E1 !important; }

/* ── Empty state ────────────────────────────────────── */
.empty-state {
    text-align: center; padding: 4.5rem 2rem;
    border-radius: 22px;
    background: rgba(255,255,255,0.018);
    border: 1.5px dashed rgba(6,182,212,0.2);
    margin: 0.5rem 0 1.5rem;
}
.es-icon { font-size: 4.5rem; margin-bottom: 1.1rem; display: block; }
.es-title { font-size: 1.4rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.45rem; }
.es-sub { font-size: 0.9rem; color: #475569; line-height: 1.7; max-width: 400px; margin: 0 auto; }

/* ── Dataset stat card ──────────────────────────────── */
.stat-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 13px; padding: 0.85rem 1rem;
    margin-bottom: 0.7rem;
}
.sc-lbl { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #475569; margin-bottom: 0.2rem; }
.sc-val { font-size: 1.12rem; font-weight: 700; color: #E2E8F0; }
.sc-val.mono { font-family: 'JetBrains Mono','Fira Code','Courier New',monospace; font-size: 0.88rem; word-break: break-all; color: #CBD5E1; }

/* ── Artifact item ──────────────────────────────────── */
.artifact-item {
    display: flex; align-items: center; gap: 13px;
    background: rgba(6,182,212,0.05);
    border: 1px solid rgba(6,182,212,0.14);
    border-radius: 13px; padding: 0.95rem 1.1rem;
    margin-bottom: 0.65rem;
}
.art-ico { font-size: 1.5rem; flex-shrink: 0; }
.art-lbl { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; }
.art-path { font-size: 0.83rem; color: #CBD5E1; word-break: break-all; margin-top: 2px; }

/* ── Crew output ────────────────────────────────────── */
.crew-out {
    background: rgba(6,182,212,0.04);
    border: 1px solid rgba(6,182,212,0.14);
    border-radius: 15px; padding: 1.5rem 1.6rem;
    color: #CBD5E1; font-size: 0.9rem; line-height: 1.75;
}
.crew-warn {
    background: rgba(251,191,36,0.06);
    border: 1px solid rgba(251,191,36,0.18);
    border-radius: 13px; padding: 1rem 1.25rem;
    color: #FCD34D; font-size: 0.87rem; line-height: 1.65;
}

/* ── Divider line ───────────────────────────────────── */
.div-line { border:none; border-top:1px solid rgba(255,255,255,0.06); margin:1.8rem 0; }

/* ── Report wrapper ─────────────────────────────────── */
.report-wrap {
    background: rgba(255,255,255,0.022);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; padding: 2rem 2.5rem;
    color: #CBD5E1; line-height: 1.8; margin-top: 0.75rem;
}
.report-wrap h1, .report-wrap h2, .report-wrap h3,
.report-wrap h4, .report-wrap h5 { color: #F1F5F9; }
.report-wrap code { background: rgba(255,255,255,0.07); border-radius:5px; padding:2px 6px; font-size:0.85em; }
.report-wrap table { border-collapse:collapse; width:100%; margin:1rem 0; }
.report-wrap th { background:rgba(6,182,212,0.12); color:#E2E8F0; padding:0.5rem 0.75rem; text-align:left; font-size:0.85rem; }
.report-wrap td { padding:0.45rem 0.75rem; border-bottom:1px solid rgba(255,255,255,0.06); font-size:0.85rem; }
</style>
""", unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────────────────────
#  HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────
def save_uploaded_file(uploaded_file) -> Path:
    target_path = DATA_DIR / uploaded_file.name
    target_path.write_bytes(uploaded_file.getbuffer())
    return target_path


def build_report_payload(
    dataset_path: Path,
    dataframe: pd.DataFrame,
    cleaned_df: pd.DataFrame,
    clean_summary: dict[str, object],
    quality_report: dict[str, object],
    statistics: dict[str, object],
    correlation: dict[str, object],
    trend: dict[str, object],
    distribution: dict[str, object],
    grouping: dict[str, object],
    outliers: dict[str, object],
    visualizations: dict[str, object],
) -> dict[str, object]:
    evidence = summarize_analysis_for_insights(quality_report, statistics, correlation, outliers, grouping)
    return {
        "report_title": DEFAULT_OUTPUT_FILENAME.replace("_", " ").title(),
        "executive_summary": "This report should be finalized by the insight agent after the crew run.",
        "dataset_overview": {
            "rows": int(dataframe.shape[0]),
            "columns": int(dataframe.shape[1]),
            "cleaned_rows": int(cleaned_df.shape[0]),
            "cleaned_columns": int(cleaned_df.shape[1]),
            "source": str(dataset_path),
            "cleaning_summary": clean_summary,
        },
        "data_quality_summary": quality_report,
        "statistical_analysis": {
            "evidence": evidence,
            "trend": trend,
            "distribution": distribution,
        },
        "visualizations": visualizations.get("charts", []),
        "business_insights": [],
        "recommendations": [],
    }


# ─────────────────────────────────────────────────────────────────────────────
#  SIDEBAR
# ─────────────────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("""
    <div class="sb-brand">
        <div class="sb-brand-ico">📊</div>
        <div>
            <div class="sb-brand-name">DataAnalyst AI</div>
            <div class="sb-brand-sub">Powered by CrewAI + Ollama</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="cfg-pills" style="margin-bottom: 0.6rem;">
        <span class="cfg-pill">🔁 Sequential</span>
        <span class="cfg-pill">📄 Markdown</span>
        <span class="cfg-pill">📑 PDF</span>
    </div>
    """, unsafe_allow_html=True)
    
    model_option = st.selectbox(
        "Ollama LLM Model",
        ["qwen2.5:3b (Fast)", "qwen2.5:7b (Thorough)", "llama3:latest"],
        index=0,
        help="qwen2.5:3b is highly recommended for faster local generation."
    )
    model_mapping = {
        "qwen2.5:3b (Fast)": "ollama/qwen2.5:3b",
        "qwen2.5:7b (Thorough)": "ollama/qwen2.5:7b",
        "llama3:latest": "ollama/llama3:latest"
    }
    selected_model = model_mapping[model_option]

    st.divider()

    st.markdown("**Workflow Steps**")
    st.markdown("""
    <div style="margin-top:0.4rem">
        <div class="sb-step">
            <div class="sb-step-n">1</div>
            <div class="sb-step-t"><span class="sb-step-b">Plan</span> — Design the analytical execution order</div>
        </div>
        <div class="sb-step">
            <div class="sb-step-n">2</div>
            <div class="sb-step-t"><span class="sb-step-b">Prepare</span> — Load, validate &amp; clean the dataset</div>
        </div>
        <div class="sb-step">
            <div class="sb-step-n">3</div>
            <div class="sb-step-t"><span class="sb-step-b">Analyse</span> — Statistics, correlations &amp; patterns</div>
        </div>
        <div class="sb-step">
            <div class="sb-step-n">4</div>
            <div class="sb-step-t"><span class="sb-step-b">Visualize</span> — Auto-generate the most relevant charts</div>
        </div>
        <div class="sb-step">
            <div class="sb-step-n">5</div>
            <div class="sb-step-t"><span class="sb-step-b">Insights</span> — Evidence-based business findings</div>
        </div>
        <div class="sb-step">
            <div class="sb-step-n">6</div>
            <div class="sb-step-t"><span class="sb-step-b">Report</span> — Professional Markdown &amp; PDF output</div>
        </div>
    </div>
    """, unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────────────────────
#  HERO
# ─────────────────────────────────────────────────────────────────────────────
st.markdown("""
<div class="hero-wrap">
    <div class="hero-orb-1"></div>
    <div class="hero-orb-2"></div>
    <div class="hero-orb-3"></div>
    <div class="hero-badge">
        <span class="hero-badge-dot"></span>
        Agentic AI &nbsp;·&nbsp; Six-Agent CrewAI Pipeline
    </div>
    <div class="hero-title">
        Turn raw data into<br><span class="accent">actionable insights</span>
    </div>
    <div class="hero-sub">
        Upload a CSV or Excel file, ask a business question, and let a six-agent CrewAI
        pipeline automatically clean your data, run statistical analysis, generate charts,
        and deliver a polished professional report.
    </div>
    <div class="hero-pills">
        <span class="hero-pill">🧹 Auto data cleaning</span>
        <span class="hero-pill">📈 Smart visualizations</span>
        <span class="hero-pill">🔍 Outlier detection</span>
        <span class="hero-pill">📊 Correlation analysis</span>
        <span class="hero-pill">💡 AI-powered insights</span>
        <span class="hero-pill">📄 Markdown &amp; PDF reports</span>
    </div>
</div>
""", unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────────────────────
#  UPLOAD + INFO
# ─────────────────────────────────────────────────────────────────────────────
upload_col, info_col = st.columns([1.05, 0.95], gap="large")

with upload_col:
    st.markdown("""
    <div class="sec-hdr">
        <div class="sec-hdr-ico">📂</div>
        <div class="sec-hdr-body">
            <div class="sec-hdr-title">Upload Dataset</div>
            <div class="sec-hdr-sub">CSV, XLS or XLSX accepted</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    uploaded_file = st.file_uploader(
        "Choose a CSV or Excel file",
        type=["csv", "xlsx", "xls"],
        label_visibility="collapsed",
    )

    dataframe = None
    saved_path = None
    if uploaded_file is not None:
        saved_path = save_uploaded_file(uploaded_file)
        dataframe = load_dataset(saved_path)

    st.markdown("""
    <div class="sec-hdr" style="margin-top:1.35rem">
        <div class="sec-hdr-ico">💬</div>
        <div class="sec-hdr-body">
            <div class="sec-hdr-title">Analysis Objective</div>
            <div class="sec-hdr-sub">Guide the agents with your business question</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    question = st.text_area(
        "Ask a question",
        value="Analyze this dataset and surface the most important business insights.",
        height=110,
        help="e.g. Why did profit decrease? Show customer trends. Generate an executive report.",
        label_visibility="collapsed",
    )

    if uploaded_file is not None and dataframe is not None:
        detected = auto_detect_columns(dataframe)
        original_cols = list(dataframe.columns)
        
        def clean_col_name(c):
            return str(c).strip().lower().replace(" ", "_")
            
        cleaned_to_orig = {clean_col_name(c): c for c in original_cols}
        
        st.markdown("<div style='height:0.6rem'></div>", unsafe_allow_html=True)
        with st.expander("🛠️ Advanced Analysis Settings (Optional Overrides)"):
            st.markdown(
                "<div style='font-size:0.8rem; color:#888; margin-bottom:0.8rem'>"
                "Override the columns used for analysis. 'Auto-detect' will use system defaults."
                "</div>",
                unsafe_allow_html=True,
            )
            
            # Date Column
            date_default = "Auto-detect"
            if detected["date_column"] in original_cols:
                date_default = detected["date_column"]
            elif clean_col_name(detected["date_column"]) in cleaned_to_orig:
                date_default = cleaned_to_orig[clean_col_name(detected["date_column"])]
                
            if not detected["date_column"]:
                st.warning("⚠️ Could not auto-detect a date column. Trend analysis might be skipped. Please select a Date column manually below.")
                
            date_options = ["Auto-detect"] + original_cols
            selected_date = st.selectbox(
                "Date Column (for trends)",
                options=date_options,
                index=date_options.index(date_default) if date_default in date_options else 0,
                key="override_date_col"
            )
            
            # Metric Column
            metric_default = "Auto-detect"
            if detected["metric_column"] in original_cols:
                metric_default = detected["metric_column"]
            elif clean_col_name(detected["metric_column"]) in cleaned_to_orig:
                metric_default = cleaned_to_orig[clean_col_name(detected["metric_column"])]
                
            metric_options = ["Auto-detect"] + original_cols
            selected_metric = st.selectbox(
                "Metric Column (statistics/trends)",
                options=metric_options,
                index=metric_options.index(metric_default) if metric_default in metric_options else 0,
                key="override_metric_col"
            )
            
            # Group Column
            group_default = "Auto-detect"
            if detected["group_column"] in original_cols:
                group_default = detected["group_column"]
            elif clean_col_name(detected["group_column"]) in cleaned_to_orig:
                group_default = cleaned_to_orig[clean_col_name(detected["group_column"])]
                
            group_options = ["Auto-detect"] + original_cols
            selected_group = st.selectbox(
                "Grouping Column (categories)",
                options=group_options,
                index=group_options.index(group_default) if group_default in group_options else 0,
                key="override_group_col"
            )

    st.markdown("<div style='height:0.4rem'></div>", unsafe_allow_html=True)
    run_button = st.button(
        "🚀  Run Agentic Workflow",
        type="primary",
        use_container_width=True,
    )

with info_col:
    st.markdown("""
    <div class="sec-hdr">
        <div class="sec-hdr-ico">⚡</div>
        <div class="sec-hdr-body">
            <div class="sec-hdr-title">Pipeline Capabilities</div>
        </div>
    </div>
    <div style="margin-bottom:1.1rem">
        <div class="feat-item">
            <div class="feat-ico" style="background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.25)">🧹</div>
            <div class="feat-txt">
                <span class="feat-bold">Smart Data Cleaning</span>
                Missing values, duplicates, type coercion &amp; date parsing handled automatically.
            </div>
        </div>
        <div class="feat-item">
            <div class="feat-ico" style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.25)">📊</div>
            <div class="feat-txt">
                <span class="feat-bold">Statistical Analysis</span>
                Descriptive stats, correlations, distributions, trends &amp; group breakdowns.
            </div>
        </div>
        <div class="feat-item">
            <div class="feat-ico" style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25)">📈</div>
            <div class="feat-txt">
                <span class="feat-bold">Auto Visualizations</span>
                Charts chosen based on detected data types and analytical patterns.
            </div>
        </div>
        <div class="feat-item">
            <div class="feat-ico" style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.25)">💡</div>
            <div class="feat-txt">
                <span class="feat-bold">AI-Powered Insights</span>
                Six specialized agents synthesize findings into actionable recommendations.
            </div>
        </div>
        <div class="feat-item" style="border-bottom:none">
            <div class="feat-ico" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25)">📄</div>
            <div class="feat-txt">
                <span class="feat-bold">Professional Reports</span>
                Export polished Markdown &amp; PDF reports ready for business stakeholders.
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    k1, k2, k3 = st.columns(3)
    with k1:
        st.markdown("""
        <div class="kpi-card">
            <div class="kpi-top" style="background:linear-gradient(90deg,#0891B2,#06B6D4)"></div>
            <span class="kpi-icon">🤖</span>
            <div class="kpi-lbl">Agents</div>
            <div class="kpi-val">6</div>
            <div class="kpi-note">Sequential</div>
        </div>
        """, unsafe_allow_html=True)
    with k2:
        st.markdown("""
        <div class="kpi-card">
            <div class="kpi-top" style="background:linear-gradient(90deg,#7C3AED,#8B5CF6)"></div>
            <span class="kpi-icon">📊</span>
            <div class="kpi-lbl">Analyses</div>
            <div class="kpi-val">7</div>
            <div class="kpi-note">Types run</div>
        </div>
        """, unsafe_allow_html=True)
    with k3:
        st.markdown("""
        <div class="kpi-card">
            <div class="kpi-top" style="background:linear-gradient(90deg,#059669,#10B981)"></div>
            <span class="kpi-icon">📑</span>
            <div class="kpi-lbl">Outputs</div>
            <div class="kpi-val">2</div>
            <div class="kpi-note">MD + PDF</div>
        </div>
        """, unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────────────────────
#  GUARD: no file uploaded
# ─────────────────────────────────────────────────────────────────────────────
if uploaded_file is None:
    st.markdown("""
    <hr class="div-line">
    <div class="empty-state">
        <span class="es-icon">📂</span>
        <div class="es-title">No dataset uploaded yet</div>
        <div class="es-sub">
            Upload a CSV or Excel file above to begin. The agents will automatically
            clean, analyse, and visualize your data — then produce a full report.
        </div>
    </div>
    """, unsafe_allow_html=True)
    st.stop()


# ─────────────────────────────────────────────────────────────────────────────
#  DATASET PREVIEW
# ─────────────────────────────────────────────────────────────────────────────
# Reuse saved_path and dataframe loaded above

st.markdown("<hr class='div-line'>", unsafe_allow_html=True)

preview_col, snap_col = st.columns([1.45, 0.55], gap="large")

with preview_col:
    st.markdown("""
    <div class="sec-hdr">
        <div class="sec-hdr-ico">🔍</div>
        <div class="sec-hdr-body">
            <div class="sec-hdr-title">Dataset Preview</div>
            <div class="sec-hdr-sub">Showing first 20 rows</div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    st.dataframe(dataframe.head(20), use_container_width=True)

with snap_col:
    st.markdown("""
    <div class="sec-hdr">
        <div class="sec-hdr-ico">📋</div>
        <div class="sec-hdr-body">
            <div class="sec-hdr-title">Dataset Snapshot</div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    st.markdown(
        f"""
        <div class="stat-card">
            <div class="sc-lbl">File Name</div>
            <div class="sc-val mono">{uploaded_file.name}</div>
        </div>
        <div class="stat-card">
            <div class="sc-lbl">Total Rows</div>
            <div class="sc-val">{dataframe.shape[0]:,}</div>
        </div>
        <div class="stat-card">
            <div class="sc-lbl">Total Columns</div>
            <div class="sc-val">{dataframe.shape[1]}</div>
        </div>
        <div class="stat-card">
            <div class="sc-lbl">Missing Cells</div>
            <div class="sc-val">{int(dataframe.isna().sum().sum()):,}</div>
        </div>
        <div class="stat-card">
            <div class="sc-lbl">Saved To</div>
            <div class="sc-val mono">{saved_path.name}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


# ─────────────────────────────────────────────────────────────────────────────
#  RUN WORKFLOW
# ─────────────────────────────────────────────────────────────────────────────
if run_button:
    if not question.strip():
        st.error("Please enter a question or analysis objective.")
        st.stop()

    # Set COLUMN_OVERRIDES based on user choice in UI
    if "override_date_col" in st.session_state and st.session_state.override_date_col != "Auto-detect":
        COLUMN_OVERRIDES["date_column"] = str(st.session_state.override_date_col).strip().lower().replace(" ", "_")
    else:
        COLUMN_OVERRIDES["date_column"] = None

    if "override_metric_col" in st.session_state and st.session_state.override_metric_col != "Auto-detect":
        COLUMN_OVERRIDES["metric_column"] = str(st.session_state.override_metric_col).strip().lower().replace(" ", "_")
    else:
        COLUMN_OVERRIDES["metric_column"] = None

    if "override_group_col" in st.session_state and st.session_state.override_group_col != "Auto-detect":
        COLUMN_OVERRIDES["group_column"] = str(st.session_state.override_group_col).strip().lower().replace(" ", "_")
    else:
        COLUMN_OVERRIDES["group_column"] = None

    st.markdown("<hr class='div-line'>", unsafe_allow_html=True)
    st.markdown("""
    <div class="sec-hdr">
        <div class="sec-hdr-ico">⚙️</div>
        <div class="sec-hdr-body">
            <div class="sec-hdr-title">Running Agentic Workflow</div>
            <div class="sec-hdr-sub">Six agents collaborating sequentially…</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    with st.status("Running the agentic workflow", expanded=True) as status:
        try:
            status.write("🧹  Step 1 / 6 — Cleaning and validating the dataset…")
            cleaned_df, clean_summary = clean_dataset(dataframe)
            status.write(f"   ✔ Cleaned: {cleaned_df.shape[0]:,} rows × {cleaned_df.shape[1]} columns")

            status.write("📊  Step 2 / 6 — Generating data quality report…")
            quality_report = generate_data_quality_report(cleaned_df, saved_path)

            status.write("🔢  Step 3 / 6 — Computing statistics…")
            statistics = calculate_statistics(cleaned_df)
            correlation = perform_correlation_analysis(cleaned_df)
            trend = perform_trend_analysis(cleaned_df)
            distribution = perform_distribution_analysis(cleaned_df)
            grouping = perform_group_analysis(cleaned_df)
            outliers = detect_outliers(cleaned_df)
            status.write("   ✔ Statistics, correlation, trend, distribution, grouping, outliers — done")

            status.write("📈  Step 4 / 6 — Generating visualizations…")
            visualizations = generate_visualizations(
                cleaned_df,
                {
                    "statistics": statistics,
                    "correlation": correlation,
                    "trend": trend,
                    "distribution": distribution,
                    "grouping": grouping,
                    "outliers": outliers,
                    "question": question,
                },
            )
            num_charts = len(visualizations.get("charts", []))
            status.write(f"   ✔ {num_charts} chart(s) generated")

            status.write("📄  Step 5 / 6 — Building Markdown and PDF reports…")
            report_payload = build_report_payload(
                dataset_path=saved_path,
                dataframe=dataframe,
                cleaned_df=cleaned_df,
                clean_summary=clean_summary,
                quality_report=quality_report,
                statistics=statistics,
                correlation=correlation,
                trend=trend,
                distribution=distribution,
                grouping=grouping,
                outliers=outliers,
                visualizations=visualizations,
            )
            markdown_path = generate_markdown_report(
                report_payload, REPORTS_DIR / f"{DEFAULT_OUTPUT_FILENAME}.md"
            )
            pdf_path = generate_pdf_report(
                markdown_path, REPORTS_DIR / f"{DEFAULT_OUTPUT_FILENAME}.pdf"
            )
            status.write(f"   ✔ Reports saved")

            status.write("🤖  Step 6 / 6 — Attempting CrewAI LLM run…")
            crew_result = None
            crew_error = None
            try:
                crew = build_crew(model_name=selected_model)
                crew_result = crew.kickoff(
                    inputs={"dataset_path": str(saved_path), "question": question}
                )
                status.write("   ✔ CrewAI run complete")
            except Exception as exc:
                crew_error = exc
                status.write(f"   ⚠ CrewAI LLM step skipped — {type(exc).__name__}: {exc}")

            status.update(label="✅  Workflow completed", state="complete")

        except Exception as exc:
            import traceback
            tb = traceback.format_exc()
            status.write(f"❌  Error: **{type(exc).__name__}** — `{exc}`")
            status.write("Full traceback:")
            status.write(f"```\n{tb}\n```")
            status.update(label="❌  Workflow failed", state="error")
            st.error(f"**{type(exc).__name__}**: {exc}")
            with st.expander("🐛  Full traceback", expanded=True):
                st.code(tb, language="python")
            st.stop()

    # ── Crew output + Artifacts ───────────────────────────────────────────────
    st.markdown("<div style='height:1rem'></div>", unsafe_allow_html=True)
    result_col, artifact_col = st.columns([1.05, 0.95], gap="large")

    with result_col:
        st.markdown("""
        <div class="sec-hdr">
            <div class="sec-hdr-ico">🤖</div>
            <div class="sec-hdr-body">
                <div class="sec-hdr-title">Crew AI Output</div>
                <div class="sec-hdr-sub">Synthesized agent response</div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        if crew_result is not None:
            st.markdown(
                f'<div class="crew-out">{crew_result}</div>',
                unsafe_allow_html=True,
            )
        elif crew_error is not None:
            st.markdown(
                f"""
                <div class="crew-warn">
                    ⚠️ <strong>CrewAI LLM step could not complete</strong> — the deterministic
                    analysis outputs below are still fully available.<br>
                    <small style="opacity:0.7">{crew_error}</small>
                </div>
                """,
                unsafe_allow_html=True,
            )
        else:
            st.info("Crew output was not produced.")

    with artifact_col:
        st.markdown("""
        <div class="sec-hdr">
            <div class="sec-hdr-ico">📁</div>
            <div class="sec-hdr-body">
                <div class="sec-hdr-title">Saved Artifacts</div>
                <div class="sec-hdr-sub">Files written to disk</div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        st.markdown(
            f"""
            <div class="artifact-item">
                <span class="art-ico">📝</span>
                <div>
                    <div class="art-lbl">Markdown Report</div>
                    <div class="art-path">{markdown_path}</div>
                </div>
            </div>
            <div class="artifact-item">
                <span class="art-ico">📑</span>
                <div>
                    <div class="art-lbl">PDF Report</div>
                    <div class="art-path">{pdf_path}</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        # Post-clean dataset metrics
        st.markdown("<div style='height:0.5rem'></div>", unsafe_allow_html=True)
        m1, m2 = st.columns(2)
        with m1:
            st.metric("Rows after clean", f"{cleaned_df.shape[0]:,}")
        with m2:
            st.metric("Rows removed", f"{dataframe.shape[0] - cleaned_df.shape[0]:,}")

    # ── Analysis tabs ─────────────────────────────────────────────────────────
    st.markdown("<hr class='div-line'>", unsafe_allow_html=True)
    st.markdown("""
    <div class="sec-hdr">
        <div class="sec-hdr-ico">🔬</div>
        <div class="sec-hdr-body">
            <div class="sec-hdr-title">Analysis Summary</div>
            <div class="sec-hdr-sub">Explore all computed outputs by category</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    summary_tabs = st.tabs([
        "📋 Quality", "📊 Statistics", "🔗 Correlation",
        "📉 Trend", "🔔 Distribution", "👥 Grouping",
        "⚠️ Outliers", "🖼️ Charts",
    ])

    with summary_tabs[0]:
        st.json(quality_report)
    with summary_tabs[1]:
        st.json(statistics)
    with summary_tabs[2]:
        st.json(correlation)
    with summary_tabs[3]:
        st.json(trend)
    with summary_tabs[4]:
        st.json(distribution)
    with summary_tabs[5]:
        st.json(grouping)
    with summary_tabs[6]:
        st.json(outliers)
    with summary_tabs[7]:
        chart_paths = [chart["path"] for chart in visualizations.get("charts", [])]
        if not chart_paths:
            st.info("No charts were generated for this dataset.")
        else:
            # 2-column gallery
            num_charts = len(chart_paths)
            for row_start in range(0, num_charts, 2):
                cols = st.columns(2, gap="medium")
                for col_idx, chart_path in enumerate(chart_paths[row_start: row_start + 2]):
                    path = Path(chart_path)
                    if path.exists():
                        with cols[col_idx]:
                            st.image(
                                str(path),
                                caption=path.stem.replace("_", " ").title(),
                                use_container_width=True,
                            )

    # ── Markdown report ───────────────────────────────────────────────────────
    st.markdown("<hr class='div-line'>", unsafe_allow_html=True)
    st.markdown("""
    <div class="sec-hdr">
        <div class="sec-hdr-ico">📄</div>
        <div class="sec-hdr-body">
            <div class="sec-hdr-title">Full Markdown Report</div>
            <div class="sec-hdr-sub">Generated report — ready to copy or export</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    markdown_text = Path(markdown_path).read_text(encoding="utf-8")
    with st.expander("📖  View full report", expanded=False):
        st.markdown(markdown_text)
