from __future__ import annotations

from crewai import Agent, LLM

from config import DEFAULT_LLM_MODEL, DEFAULT_LLM_TEMPERATURE, DEFAULT_OLLAMA_BASE_URL, OPENROUTER_API_KEY, is_ollama_available
from tools import (
    calculate_statistics_tool,
    clean_dataset_tool,
    detect_outliers_tool,
    generate_data_quality_report_tool,
    generate_markdown_report_tool,
    generate_pdf_report_tool,
    generate_visualizations_tool,
    load_dataset_tool,
    perform_correlation_analysis_tool,
    perform_distribution_analysis_tool,
    perform_group_analysis_tool,
    perform_trend_analysis_tool,
    validate_dataset_tool,
)


def build_llm(model_name: str | None = None, api_key: str | None = None) -> LLM:
    """Build an LLM instance for the given model.

    - Ollama models (prefix 'ollama/'): connect to local Ollama server if running.
    - OpenRouter models (prefix 'openrouter/'): connect via OpenRouter API
      using the per-request user api_key or fallback OPENROUTER_API_KEY env var.
    """
    import os
    name = model_name or DEFAULT_LLM_MODEL

    if name.startswith("openrouter/"):
        key = (api_key or "").strip() or os.environ.get("OPENROUTER_API_KEY", "").strip() or OPENROUTER_API_KEY.strip()
        if not key:
            raise ValueError(
                "OpenRouter API key is required. Please provide your free API key in Settings or the model selector (get one free at https://openrouter.ai/keys)."
            )
        os.environ["OPENROUTER_API_KEY"] = key
        return LLM(
            model=name,
            api_key=key,
            temperature=DEFAULT_LLM_TEMPERATURE,
        )
    else:
        # Ollama or local provider
        if not is_ollama_available(DEFAULT_OLLAMA_BASE_URL, timeout=1.0):
            raise ConnectionError(
                f"Ollama is not running at {DEFAULT_OLLAMA_BASE_URL}. In cloud-hosted mode (e.g. Render), local Ollama is not accessible. Please switch to an OpenRouter model with your free API key, or install and run Ollama locally on your desktop."
            )
        return LLM(
            model=name,
            base_url=DEFAULT_OLLAMA_BASE_URL,
            temperature=DEFAULT_LLM_TEMPERATURE,
        )


def build_agents(model_name: str | None = None, api_key: str | None = None) -> dict[str, Agent]:
    llm = build_llm(model_name, api_key=api_key)
    return {
        "planner": Agent(
            role="Planner Agent",
            goal="Understand the request and design the execution order for the analysis crew.",
            backstory="You break ambiguous analytical questions into an ordered, practical workflow.",
            llm=llm,
            verbose=True,
            allow_delegation=False,
        ),
        "data_preparation": Agent(
            role="Data Preparation Agent",
            goal="Load, validate, clean, and summarize the dataset using deterministic Python tools.",
            backstory="You are meticulous about schema, missing values, duplicates, and date parsing.",
            llm=llm,
            tools=[load_dataset_tool, validate_dataset_tool, clean_dataset_tool, generate_data_quality_report_tool],
            verbose=True,
            allow_delegation=False,
        ),
        "analysis": Agent(
            role="Analysis Agent",
            goal="Perform descriptive, correlation, trend, distribution, group, and outlier analysis.",
            backstory="You rely on Python for all calculations and only interpret tool output.",
            llm=llm,
            tools=[
                calculate_statistics_tool,
                perform_correlation_analysis_tool,
                perform_trend_analysis_tool,
                perform_distribution_analysis_tool,
                perform_group_analysis_tool,
                detect_outliers_tool,
            ],
            verbose=True,
            allow_delegation=False,
        ),
        "visualization": Agent(
            role="Visualization Agent",
            goal="Automatically create the most relevant charts for the dataset.",
            backstory="You choose useful charts that make the analysis easier to understand.",
            llm=llm,
            tools=[generate_visualizations_tool],
            verbose=True,
            allow_delegation=False,
        ),
        "insight": Agent(
            role="Insight Agent",
            goal="Convert analysis into evidence-based business insights and recommendations.",
            backstory="You only make claims supported by prior analysis outputs.",
            llm=llm,
            verbose=True,
            allow_delegation=False,
        ),
        "report": Agent(
            role="Report Agent",
            goal="Produce a polished Markdown report and PDF deliverable.",
            backstory="You create professional, concise reports for business stakeholders.",
            llm=llm,
            tools=[generate_markdown_report_tool, generate_pdf_report_tool],
            verbose=True,
            allow_delegation=False,
        ),
    }
