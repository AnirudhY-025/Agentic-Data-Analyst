# 🧠 Agentic Data Analyst

An advanced, AI-powered data analysis platform that utilizes a multi-agent system to automate data cleaning, analysis, visualization, and reporting. 

![Banner](./frontend/public/favicon.svg) <!-- Replace with actual banner if available -->

## 🌟 Overview

Agentic Data Analyst acts as your personal data science team. Instead of manually writing Pandas code or configuring BI dashboards, you simply upload your dataset and ask questions in plain English. 

Under the hood, it uses a **6-Agent Sequential Pipeline** (via CrewAI) to route your request through specialized AI personas (Planner, Data Prep, Analyst, Visualization, Insight, and Reporter).

## 🏗️ Architecture

This repository is structured as a **Monorepo**, containing both the frontend and backend applications:

*   **[`/frontend`](./frontend/)**: A modern, responsive React web application built with Vite, TypeScript, and TailwindCSS. It provides a premium user interface with Firebase authentication, settings management (for LLM API keys), and interactive dashboards.
*   **[`/backend`](./backend/)**: A robust FastAPI Python server that handles file processing, routes LLM requests to local (Ollama) or cloud (OpenRouter) providers, and orchestrates the complex CrewAI agent pipeline.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   [Ollama](https://ollama.com/) (Optional: for running local privacy-first models)

### 1. Start the Backend
Navigate to the `backend` directory, install dependencies, and start the FastAPI server:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn api:app --reload
```

### 2. Start the Frontend
In a new terminal, navigate to the `frontend` directory, install dependencies, and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```

The application will now be running at `http://localhost:5173`.

## 🔒 Privacy First

This application supports both cloud models (via OpenRouter) and **fully local models** (via Ollama). By selecting a local model in the settings, you guarantee that highly sensitive corporate datasets never leave your local machine or network.
