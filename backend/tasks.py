from __future__ import annotations

from crewai import Agent, Task


def build_tasks(agents: dict[str, Agent]) -> list[Task]:

    planning_task = Task(
        name="planning_task",
        description=(
            "Create the execution plan for analyzing the dataset at '{dataset_path}' "
            "to answer the following business objective: '{question}'."
        ),
        expected_output="A concise execution plan with ordered steps and risks.",
        agent=agents["planner"],
        markdown=True,
    )

    preparation_task = Task(
        name="data_preparation_task",
        description=(
            "Load, validate, clean, and summarize the dataset at '{dataset_path}' using your Python tools. "
            "Ensure you pass the file path '{dataset_path}' to your tools."
        ),
        expected_output="A cleaned dataset summary and data quality report.",
        agent=agents["data_preparation"],
        context=[planning_task],
        markdown=True,
    )

    analysis_task = Task(
        name="analysis_task",
        description=(
            "Perform statistical and exploratory analysis on the dataset at '{dataset_path}' "
            "using your Python tools. Focus on answering the business question: '{question}'."
        ),
        expected_output="A structured analytical summary with numerical evidence.",
        agent=agents["analysis"],
        context=[planning_task, preparation_task],
        markdown=True,
    )

    visualization_task = Task(
        name="visualization_task",
        description=(
            "Generate the most relevant charts for the dataset at '{dataset_path}' based on the analysis context. "
            "Use the generate_visualizations tool, passing the dataset path '{dataset_path}'."
        ),
        expected_output="A set of chart file paths and a short explanation of chart choices.",
        agent=agents["visualization"],
        context=[preparation_task, analysis_task],
        markdown=True,
    )

    insight_task = Task(
        name="insight_task",
        description=(
            "Turn the analytical outputs of the dataset at '{dataset_path}' into clear business insights and recommendations. "
            "Focus specifically on answering the business question: '{question}'."
        ),
        expected_output="An evidence-based executive summary, key findings, business insights, and recommendations.",
        agent=agents["insight"],
        context=[analysis_task, visualization_task],
        markdown=True,
    )

    report_task = Task(
        name="report_task",
        description=(
            "Write a polished Markdown report and PDF version using all prior outputs. "
            "Ensure the report clearly details the analysis of '{dataset_path}' and answers: '{question}'."
        ),
        expected_output="A professional report saved as Markdown and PDF.",
        agent=agents["report"],
        context=[planning_task, preparation_task, analysis_task, visualization_task, insight_task],
        markdown=True,
    )

    return [
        planning_task,
        preparation_task,
        analysis_task,
        visualization_task,
        insight_task,
        report_task,
    ]
