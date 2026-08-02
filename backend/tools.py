from __future__ import annotations

import warnings
# Backup the clean built-in warnings.warn before crewai monkey-patches it
_original_warn = warnings.warn

import json
import math
import re
from datetime import datetime
from pathlib import Path
from typing import Any

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from crewai.tools import tool

# Restore warnings.warn
warnings.warn = _original_warn

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer

from config import ANALYSIS_DIR, CHARTS_DIR, DATA_DIR, REPORTS_DIR, ensure_directories, COLUMN_OVERRIDES


ensure_directories()
sns.set_theme(style="whitegrid")


def _timestamp() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def _safe_json(data: Any) -> str:
    return json.dumps(data, indent=2, ensure_ascii=False, default=str)


def _resolve_input(file_path: str | Path) -> Path:
    path = Path(file_path)
    if not path.is_absolute():
        path = DATA_DIR / path
    return path


def load_dataset(file_path: str | Path) -> pd.DataFrame:
    path = _resolve_input(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")
    if path.suffix.lower() == ".csv":
        return pd.read_csv(path)
    if path.suffix.lower() in {".xlsx", ".xls"}:
        return pd.read_excel(path)
    raise ValueError(f"Unsupported dataset format: {path.suffix}")


def validate_dataset(df: pd.DataFrame) -> dict[str, Any]:
    return {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "missing_cells": int(df.isna().sum().sum()),
        "duplicate_rows": int(df.duplicated().sum()),
        "dtypes": {column: str(dtype) for column, dtype in df.dtypes.items()},
    }


def clean_dataset(df: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, Any]]:
    cleaned = df.copy()
    before_rows = len(cleaned)
    before_missing = int(cleaned.isna().sum().sum())

    cleaned.columns = [str(column).strip().lower().replace(" ", "_") for column in cleaned.columns]
    cleaned = cleaned.drop_duplicates().reset_index(drop=True)

    for column in cleaned.columns:
        if cleaned[column].dtype == object or cleaned[column].dtype.name in ("string", "str"):
            parsed = pd.to_datetime(cleaned[column], errors="coerce")
            if parsed.notna().mean() >= 0.8:
                cleaned[column] = parsed

    for column in cleaned.columns:
        if pd.api.types.is_numeric_dtype(cleaned[column]):
            cleaned[column] = cleaned[column].fillna(cleaned[column].median())
        elif pd.api.types.is_datetime64_any_dtype(cleaned[column]):
            cleaned[column] = cleaned[column].ffill().bfill()
        else:
            modes = cleaned[column].mode(dropna=True)
            fill_value = modes.iloc[0] if not modes.empty else "Unknown"
            cleaned[column] = cleaned[column].fillna(fill_value)

    summary = {
        "rows_before": before_rows,
        "rows_after": int(len(cleaned)),
        "rows_removed": int(before_rows - len(cleaned)),
        "missing_before": before_missing,
        "missing_after": int(cleaned.isna().sum().sum()),
        "columns": list(cleaned.columns),
    }
    return cleaned, summary


def generate_data_quality_report(df: pd.DataFrame, source_path: str | Path | None = None) -> dict[str, Any]:
    report = {
        "source_path": str(source_path) if source_path else None,
        "shape": [int(df.shape[0]), int(df.shape[1])],
        "missing_by_column": df.isna().sum().sort_values(ascending=False).to_dict(),
        "validation": validate_dataset(df),
    }
    ANALYSIS_DIR.mkdir(parents=True, exist_ok=True)
    (ANALYSIS_DIR / "data_quality_summary.json").write_text(_safe_json(report), encoding="utf-8")
    return report


def calculate_statistics(df: pd.DataFrame) -> dict[str, Any]:
    numeric = df.select_dtypes(include=[np.number])
    categorical = df.select_dtypes(exclude=[np.number])
    return {
        "numeric_summary": numeric.describe().replace({np.nan: None}).to_dict() if not numeric.empty else {},
        "categorical_summary": {
            column: {
                "unique": int(categorical[column].nunique(dropna=True)),
                "missing": int(categorical[column].isna().sum()),
                "top_value": categorical[column].mode(dropna=True).iloc[0] if not categorical[column].mode(dropna=True).empty else None,
            }
            for column in categorical.columns
        },
        "row_count": int(df.shape[0]),
        "column_count": int(df.shape[1]),
    }


def perform_correlation_analysis(df: pd.DataFrame) -> dict[str, Any]:
    numeric = df.select_dtypes(include=[np.number])
    if numeric.shape[1] < 2:
        return {"correlation_matrix": {}, "strongest_pairs": []}
    corr = numeric.corr(numeric_only=True)
    pairs: list[dict[str, Any]] = []
    cols = list(corr.columns)
    for i, left in enumerate(cols):
        for right in cols[i + 1 :]:
            value = corr.loc[left, right]
            if pd.notna(value):
                pairs.append({"feature_a": left, "feature_b": right, "correlation": float(value)})
    pairs.sort(key=lambda item: abs(item["correlation"]), reverse=True)
    return {"correlation_matrix": corr.replace({np.nan: None}).to_dict(), "strongest_pairs": pairs[:10]}


def auto_detect_columns(df: pd.DataFrame) -> dict[str, str | None]:
    cols = list(df.columns)
    date_col = None
    metric_col = None
    group_col = None
    
    # 1. Detect Date Column
    datetime_cols = [c for c in cols if pd.api.types.is_datetime64_any_dtype(df[c])]
    if datetime_cols:
        date_col = datetime_cols[0]
    else:
        date_keywords = ["date", "time", "year", "month", "day", "timestamp", "created"]
        for c in cols:
            c_lower = str(c).lower()
            if any(k in c_lower for k in date_keywords):
                date_col = c
                break
                
    # 2. Detect Metric Column
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if numeric_cols:
        metric_keywords = ["sales", "profit", "revenue", "cost", "amount", "price", "quantity", "discount"]
        for k in metric_keywords:
            for c in numeric_cols:
                if k in str(c).lower():
                    metric_col = c
                    break
            if metric_col:
                break
        if not metric_col:
            metric_col = numeric_cols[0]
            
    # 3. Detect Group Column
    group_candidates = [c for c in cols if c != date_col and c != metric_col]
    if group_candidates:
        group_keywords = ["category", "segment", "region", "product", "country", "state", "city", "group", "department", "type", "status"]
        for k in group_keywords:
            for c in group_candidates:
                if k in str(c).lower():
                    group_col = c
                    break
            if group_col:
                break
        if not group_col:
            non_numeric = [c for c in group_candidates if not pd.api.types.is_numeric_dtype(df[c])]
            if non_numeric:
                group_col = non_numeric[0]
            else:
                group_col = group_candidates[0]
                
    return {
        "date_column": date_col,
        "metric_column": metric_col,
        "group_column": group_col,
    }


def perform_trend_analysis(df: pd.DataFrame, date_column: str | None = None, metric_column: str | None = None) -> dict[str, Any]:
    if not date_column:
        date_column = COLUMN_OVERRIDES.get("date_column")
    if not metric_column:
        metric_column = COLUMN_OVERRIDES.get("metric_column")
        
    cols = list(df.columns)
    
    if not date_column or date_column not in cols:
        detected = auto_detect_columns(df)
        date_column = detected["date_column"]
        
    if not metric_column or metric_column not in cols:
        detected = auto_detect_columns(df)
        metric_column = detected["metric_column"]
        
    if not date_column or not metric_column:
        return {"date_column": None, "metric_column": None, "trend_points": []}
        
    trend = df[[date_column, metric_column]].dropna().copy()
    if not pd.api.types.is_datetime64_any_dtype(trend[date_column]):
        trend[date_column] = pd.to_datetime(trend[date_column], errors="coerce")
        trend = trend.dropna(subset=[date_column])
        
    if trend.empty:
        return {"date_column": date_column, "metric_column": metric_column, "trend_points": []}
        
    trend = trend.sort_values(date_column)
    trend["period"] = trend[date_column].dt.to_period("M").astype(str)
    grouped = trend.groupby("period")[metric_column].mean().reset_index()
    return {
        "date_column": date_column,
        "metric_column": metric_column,
        "trend_points": [
            {"period": row["period"], "value": float(row[metric_column])}
            for _, row in grouped.iterrows()
        ],
    }


def perform_distribution_analysis(df: pd.DataFrame) -> dict[str, Any]:
    numeric = df.select_dtypes(include=[np.number])
    distributions: list[dict[str, Any]] = []
    for column in numeric.columns:
        series = numeric[column].dropna()
        if series.empty:
            continue
        distributions.append(
            {
                "column": column,
                "mean": float(series.mean()),
                "median": float(series.median()),
                "std": float(series.std()) if not pd.isna(series.std()) else None,
                "skew": float(series.skew()) if not pd.isna(series.skew()) else None,
                "kurtosis": float(series.kurtosis()) if not pd.isna(series.kurtosis()) else None,
            }
        )
    return {"distributions": distributions}


def perform_group_analysis(df: pd.DataFrame, group_column: str | None = None, metric_column: str | None = None) -> dict[str, Any]:
    if not group_column:
        group_column = COLUMN_OVERRIDES.get("group_column")
    if not metric_column:
        metric_column = COLUMN_OVERRIDES.get("metric_column")
        
    cols = list(df.columns)
    
    if not group_column or group_column not in cols:
        detected = auto_detect_columns(df)
        group_column = detected["group_column"]
        
    if not metric_column or metric_column not in cols:
        detected = auto_detect_columns(df)
        metric_column = detected["metric_column"]
        
    if not group_column or not metric_column:
        return {"group_column": None, "metric_column": None, "groups": []}
        
    grouped = df.groupby(group_column, dropna=False)[metric_column].agg(["count", "mean", "median", "sum"]).reset_index()
    grouped = grouped.sort_values("sum", ascending=False)
    return {
        "group_column": group_column,
        "metric_column": metric_column,
        "groups": grouped.head(15).replace({np.nan: None}).to_dict(orient="records"),
    }


def detect_outliers(df: pd.DataFrame) -> dict[str, Any]:
    numeric = df.select_dtypes(include=[np.number])
    outlier_summary: list[dict[str, Any]] = []
    for column in numeric.columns:
        series = numeric[column].dropna()
        if series.empty:
            continue
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        if math.isclose(float(iqr), 0.0):
            continue
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        mask = (numeric[column] < lower) | (numeric[column] > upper)
        outlier_summary.append(
            {
                "column": column,
                "lower_bound": float(lower),
                "upper_bound": float(upper),
                "outlier_count": int(mask.sum()),
                "outlier_rate": round(float(mask.sum() / len(df) * 100), 2) if len(df) else 0.0,
            }
        )
    return {"outlier_summary": outlier_summary}


def _slugify(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9]+", "_", value).strip("_")
    return value.lower() or "chart"


def generate_visualizations(df: pd.DataFrame, analysis_summary: dict[str, Any]) -> dict[str, Any]:
    charts: list[dict[str, str]] = []
    numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_columns = [column for column in df.columns if column not in numeric_columns]
    datetime_columns = [column for column in df.columns if pd.api.types.is_datetime64_any_dtype(df[column])]

    def save_chart(filename: str) -> Path:
        path = CHARTS_DIR / f"{filename}_{_timestamp()}.png"
        plt.tight_layout()
        plt.savefig(path, dpi=160, bbox_inches="tight")
        plt.close()
        return path

    if numeric_columns:
        for column in numeric_columns[:3]:
            plt.figure(figsize=(8, 5))
            sns.histplot(df[column].dropna(), kde=True, bins=20, color="#0F766E")
            plt.title(f"Distribution of {column}")
            path = save_chart(f"hist_{_slugify(column)}")
            charts.append({"chart_type": "histogram", "title": f"Distribution of {column}", "path": path.as_posix()})

        plt.figure(figsize=(8, 5))
        sns.boxplot(data=df[numeric_columns[:5]], orient="h")
        plt.title("Numeric spread and outliers")
        path = save_chart("boxplot_numeric")
        charts.append({"chart_type": "box_plot", "title": "Numeric spread and outliers", "path": path.as_posix()})

    if len(numeric_columns) >= 2:
        plt.figure(figsize=(8, 6))
        sns.scatterplot(data=df, x=numeric_columns[0], y=numeric_columns[1], hue=categorical_columns[0] if categorical_columns else None, legend=False)
        plt.title(f"{numeric_columns[0]} vs {numeric_columns[1]}")
        path = save_chart(f"scatter_{_slugify(numeric_columns[0])}_{_slugify(numeric_columns[1])}")
        charts.append({"chart_type": "scatter_plot", "title": f"{numeric_columns[0]} vs {numeric_columns[1]}", "path": path.as_posix()})

        plt.figure(figsize=(8, 6))
        sns.heatmap(df[numeric_columns].corr(numeric_only=True), cmap="RdBu_r", center=0)
        plt.title("Correlation heatmap")
        path = save_chart("heatmap_correlation")
        charts.append({"chart_type": "heatmap", "title": "Correlation heatmap", "path": path.as_posix()})

    if categorical_columns and numeric_columns:
        group_column = categorical_columns[0]
        metric_column = numeric_columns[0]
        grouped = df.groupby(group_column, dropna=False)[metric_column].mean().sort_values(ascending=False).head(10)
        plt.figure(figsize=(9, 6))
        sns.barplot(x=grouped.values, y=grouped.index, palette="viridis")
        plt.title(f"Average {metric_column} by {group_column}")
        path = save_chart(f"bar_{_slugify(group_column)}_{_slugify(metric_column)}")
        charts.append({"chart_type": "bar_chart", "title": f"Average {metric_column} by {group_column}", "path": path.as_posix()})

    if datetime_columns and numeric_columns:
        date_column = datetime_columns[0]
        metric_column = numeric_columns[0]
        timeline = df[[date_column, metric_column]].dropna().sort_values(date_column)
        if not timeline.empty:
            plt.figure(figsize=(10, 5))
            sns.lineplot(data=timeline, x=date_column, y=metric_column, marker="o")
            plt.title(f"Monthly trend of {metric_column}")
            path = save_chart(f"line_{_slugify(date_column)}_{_slugify(metric_column)}")
            charts.append({"chart_type": "line_chart", "title": f"Monthly trend of {metric_column}", "path": path.as_posix()})

    return {"chart_paths": [chart["path"] for chart in charts], "charts": charts, "summary": analysis_summary}


def generate_markdown_report(report_payload: dict[str, Any], output_path: str | Path) -> Path:
    output = Path(output_path)
    if not output.is_absolute():
        output = REPORTS_DIR / output
    output = output.with_suffix(".md")
    output.parent.mkdir(parents=True, exist_ok=True)

    lines = [
        f"# {report_payload.get('report_title', 'Agentic AI Data Analyst Report')}",
        "",
        "## Executive Summary",
        report_payload.get("executive_summary", "No executive summary available."),
        "",
        "## Dataset Overview",
        _safe_json(report_payload.get("dataset_overview", {})),
        "",
        "## Data Quality Summary",
        _safe_json(report_payload.get("data_quality_summary", {})),
        "",
        "## Statistical Analysis",
        _safe_json(report_payload.get("statistical_analysis", {})),
        "",
        "## Visualizations",
        _safe_json(report_payload.get("visualizations", [])),
        "",
        "## Business Insights",
        _safe_json(report_payload.get("business_insights", [])),
        "",
        "## Recommendations",
        _safe_json(report_payload.get("recommendations", [])),
    ]
    output.write_text("\n".join(lines), encoding="utf-8")
    return output


def generate_pdf_report(markdown_report_path: str | Path, output_path: str | Path | None = None) -> Path:
    markdown_path = Path(markdown_report_path)
    if not markdown_path.is_absolute():
        markdown_path = REPORTS_DIR / markdown_path
    if output_path is None:
        output = markdown_path.with_suffix(".pdf")
    else:
        output = Path(output_path)
        if not output.is_absolute():
            output = REPORTS_DIR / output
        output = output.with_suffix(".pdf")

    output.parent.mkdir(parents=True, exist_ok=True)
    markdown_text = markdown_path.read_text(encoding="utf-8") if markdown_path.exists() else ""

    styles = getSampleStyleSheet()
    story: list[Any] = []
    for line in markdown_text.splitlines():
        if line.startswith("# "):
            story.append(Paragraph(line[2:], styles["Title"]))
        elif line.startswith("## "):
            story.append(Paragraph(line[3:], styles["Heading2"]))
        elif line.strip():
            story.append(Paragraph(line.replace("&", "&amp;"), styles["BodyText"]))
        else:
            story.append(Spacer(1, 0.15 * inch))

    doc = SimpleDocTemplate(str(output), pagesize=A4, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    doc.build(story or [Paragraph("No content available.", styles["BodyText"])])
    return output


def summarize_analysis_for_insights(
    quality_report: dict[str, Any],
    statistics: dict[str, Any],
    correlation: dict[str, Any],
    outliers: dict[str, Any],
    grouping: dict[str, Any],
) -> dict[str, Any]:
    return {
        "quality_report": quality_report,
        "statistics": statistics,
        "correlation": correlation,
        "outliers": outliers,
        "grouping": grouping,
    }


@tool("load_dataset")
def load_dataset_tool(file_path: str) -> str:
    """Load a dataset and return a compact summary for the agent."""

    df = load_dataset(file_path)
    return _safe_json({"shape": [int(df.shape[0]), int(df.shape[1])], "columns": list(df.columns), "preview": df.head(5).to_dict(orient="records")})


@tool("validate_dataset")
def validate_dataset_tool(file_path: str) -> str:
    """Validate a dataset and return basic quality metrics."""

    return _safe_json(validate_dataset(load_dataset(file_path)))


@tool("clean_dataset")
def clean_dataset_tool(file_path: str) -> str:
    """Clean a dataset and persist the cleaned CSV to the analysis directory."""

    df = load_dataset(file_path)
    cleaned, summary = clean_dataset(df)
    cleaned_path = ANALYSIS_DIR / f"cleaned_dataset_{_timestamp()}.csv"
    cleaned.to_csv(cleaned_path, index=False)
    summary["cleaned_path"] = cleaned_path.as_posix()
    return _safe_json(summary)


@tool("generate_data_quality_report")
def generate_data_quality_report_tool(file_path: str, cleaned_path: str | None = None) -> str:
    """Build a data quality report from the source and cleaned datasets."""

    source_df = load_dataset(file_path)
    cleaned_df = load_dataset(cleaned_path) if cleaned_path else source_df
    report = generate_data_quality_report(cleaned_df, file_path)
    return _safe_json(report)


@tool("calculate_statistics")
def calculate_statistics_tool(file_path: str) -> str:
    """Calculate descriptive statistics for the dataset."""

    return _safe_json(calculate_statistics(load_dataset(file_path)))


@tool("perform_correlation_analysis")
def perform_correlation_analysis_tool(file_path: str) -> str:
    """Compute the correlation matrix and the strongest numeric relationships."""

    return _safe_json(perform_correlation_analysis(load_dataset(file_path)))


@tool("perform_trend_analysis")
def perform_trend_analysis_tool(file_path: str) -> str:
    """Analyze time-based trends in the dataset when date columns are available."""

    return _safe_json(perform_trend_analysis(load_dataset(file_path)))


@tool("perform_distribution_analysis")
def perform_distribution_analysis_tool(file_path: str) -> str:
    """Summarize the distribution of each numeric column."""

    return _safe_json(perform_distribution_analysis(load_dataset(file_path)))


@tool("perform_group_analysis")
def perform_group_analysis_tool(file_path: str) -> str:
    """Run group-by analysis for the most relevant categorical dimension."""

    return _safe_json(perform_group_analysis(load_dataset(file_path)))


@tool("detect_outliers")
def detect_outliers_tool(file_path: str) -> str:
    """Detect numeric outliers using the IQR rule."""

    return _safe_json(detect_outliers(load_dataset(file_path)))


@tool("generate_visualizations")
def generate_visualizations_tool(file_path: str, analysis_json: str) -> str:
    """Generate charts based on the dataset and prior analysis context."""

    df = load_dataset(file_path)
    analysis_summary = json.loads(analysis_json) if analysis_json else {}
    result = generate_visualizations(df, analysis_summary)
    return _safe_json(result)


@tool("generate_markdown_report")
def generate_markdown_report_tool(report_json: str) -> str:
    """Write the final report as markdown and return the saved path."""

    payload = json.loads(report_json)
    report_path = generate_markdown_report(payload, REPORTS_DIR / f"{payload.get('report_title', 'report')}.md")
    return _safe_json({"markdown_path": report_path.as_posix(), "report_title": payload.get("report_title")})


@tool("generate_pdf_report")
def generate_pdf_report_tool(markdown_path: str, output_path: str | None = None) -> str:
    """Convert the markdown report into a PDF document."""

    pdf_path = generate_pdf_report(markdown_path, output_path)
    return _safe_json({"pdf_path": pdf_path.as_posix()})
