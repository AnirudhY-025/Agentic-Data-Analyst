from __future__ import annotations

from crewai import Crew, Process

from agents import build_agents
from tasks import build_tasks


def build_crew(model_name: str | None = None) -> Crew:
    agents = build_agents(model_name)
    tasks = build_tasks(agents)
    return Crew(
        agents=list(agents.values()),
        tasks=tasks,
        process=Process.sequential,
        verbose=True,
    )
