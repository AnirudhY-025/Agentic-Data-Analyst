# 🧠 Agentic Data Analyst (InsightFlow AI)

An enterprise-ready, AI-powered autonomous data analysis platform that orchestrates a multi-agent system to automate data cleaning, exploratory data analysis (EDA), visualization generation, and executive PDF reporting for real-world datasets.

---

## 🌟 Overview

Agentic Data Analyst acts as an autonomous data science team. Instead of manually writing Pandas scripts, data cleaning pipelines, or configuring BI dashboards, users simply upload any tabular dataset (CSV, Excel) and ask analytical questions in plain English.

Under the hood, it coordinates a **6-Agent Sequential Pipeline** (powered by CrewAI):
1. **Planner Agent**: Interprets business objectives and formulates an analytical roadmap.
2. **Data Prep Agent**: Cleans messy data, sanitizes schemas, and imputes missing values.
3. **Analyst Agent**: Computes summary statistics, distributions, correlations, and outliers.
4. **Visualization Agent**: Dynamically generates publication-ready Matplotlib and Seaborn charts.
5. **Insight Agent**: Extracts actionable business takeaways and strategic recommendations.
6. **Reporter Agent**: Compiles findings into interactive dashboards, Markdown, and downloadable executive PDFs.

---

## 🛡️ Production & Real-World Data Capabilities

The system is engineered to handle messy, real-world datasets without manual pre-formatting:
* **Multi-Encoding & Delimiter Autodetection**: Automatically handles `utf-8`, `utf-8-sig` (Excel BOM), `latin1`, `cp1252`, and auto-sniffs delimiters (`,`, `;`, `\t`, `|`).
* **Schema Sanitization**: Strips corrupted characters, drops empty rows/columns, removes auto-generated index columns (`Unnamed: 0`), and normalizes column headers into clean snake_case.
* **Large Dataset Downsampling**: High-volume datasets (>10k rows) are safely downsampled for visualizations to ensure snappy render times without out-of-memory errors.
* **High-Cardinality Protection**: Categorical charts automatically limit groupings to top categories to avoid unreadable visualization clutter.
* **Multi-Tenant Isolation**: Uses Python `ContextVar` tied to Firebase Authentication headers to guarantee isolated storage per workspace.
* **Dual LLM Architecture**: Supports cloud models (OpenRouter) and 100% private local models (Ollama) so sensitive corporate data never leaves the network.

---

## 🚀 Quick Start (Development)

### Option 1: 1-Click Launcher (Windows)
Double-click `start.bat` or run in PowerShell:
```powershell
.\start.bat
```
*Spins up both the FastAPI backend and Vite frontend simultaneously and opens your browser.*

### Option 2: Manual Start
```bash
# Backend (Port 8000)
cd backend
.venv\Scripts\activate
python -m uvicorn api:app --reload --port 8000

# Frontend (Port 5173)
cd frontend
npm run dev
```

---

## 🐳 Production Deployment (Docker & Cloud)

The entire full-stack application (FastAPI backend + compiled React frontend + WebSocket engine) is containerized into a single deployable image:

```bash
docker compose up --build
```
> The entire platform will be live at `http://localhost:8000` with persistent storage for datasets and reports mounted at `./data` and `./outputs`.

### Cloud Deployment (AWS ECS / GCP Cloud Run / Render)
1. Build and push the Docker image:
   ```bash
   docker build -t your-registry/agentic-data-analyst:latest .
   docker push your-registry/agentic-data-analyst:latest
   ```
2. Deploy the container with environment variables from `.env.example`.

---

## 🧪 Automated QA & Testing Suite

Run the automated deterministic testing framework:
```bash
cd backend
.venv\Scripts\activate
pytest tests/ -v
```
