from __future__ import annotations

from crewai import Crew, Process

from agents import build_agents
from tasks import build_tasks


def build_crew(model_name: str | None = None, api_key: str | None = None, ollama_base_url: str | None = None) -> Crew:
    agents = build_agents(model_name, api_key=api_key, ollama_base_url=ollama_base_url)
    tasks = build_tasks(agents)
    return Crew(
        agents=list(agents.values()),
        tasks=tasks,
        process=Process.sequential,
        verbose=True,
    )


def build_insight_crew(model_name: str | None = None, api_key: str | None = None, ollama_base_url: str | None = None) -> Crew:
    """Build a streamlined, ultra-fast executive synthesis crew for Step 6.
    
    Rather than re-invoking data tools, this agent consumes the empirical mathematical
    evidence pre-calculated by Python and synthesizes high-impact strategic intelligence,
    ensuring completions in 3-5s with zero tool-calling schema failures.
    """
    from agents import build_llm
    from crewai import Agent, Task
    
    llm = build_llm(model_name, api_key=api_key, ollama_base_url=ollama_base_url)
    strategy_agent = Agent(
        role="Principal Strategy & Business Intelligence Consultant",
        goal="Synthesize mathematical data evidence into executive-ready business insights and strategic recommendations.",
        backstory=(
            "You are a senior data analyst and executive strategy advisor. "
            "You transform statistical discoveries, driver correlations, anomalies, and trends "
            "into clear, high-impact executive takeaways, risk mitigations, and strategic actions."
        ),
        llm=llm,
        verbose=False,
        allow_delegation=False,
    )
    strategy_task = Task(
        description=(
            "Review the empirical analytical evidence synthesized from this dataset:\n\n"
            "{evidence_summary}\n\n"
            "Business Objective / Question: '{question}'\n\n"
            "Craft a concise executive briefing answering the business objective using the evidence above. "
            "Structure your response with:\n"
            "### 1. Executive Summary & Strategic Takeaways\n"
            "### 2. Primary Drivers & Mathematical Correlations\n"
            "### 3. Operational Risks, Anomalies & Data Hygiene\n"
            "### 4. Prioritized Recommendations (Immediate, 30-Day, Long-Term)\n"
        ),
        expected_output="A structured, executive-grade business analysis briefing with actionable recommendations.",
        agent=strategy_agent,
    )
    return Crew(
        agents=[strategy_agent],
        tasks=[strategy_task],
        process=Process.sequential,
        verbose=False,
    )
