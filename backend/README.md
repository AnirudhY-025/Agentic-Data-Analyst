# InsightFlow AI (Agentic Data Analyst)

InsightFlow AI is a modern, premium agentic data analysis application. It features a React frontend dashboard with Firebase authentication and a FastAPI + CrewAI + Ollama backend.

---

## 🏗️ System Architecture

The application is split into two components:

1. **Backend (FastAPI REST & WebSockets)**
   - Located in: `c:\Users\yekka\Documents\Agentic-DataAnalyst`
   - Entry point: `api.py` (runs on `http://localhost:8000`)
   - Handles data cleaning, stats calculation, chart generation, and CrewAI agent orchestration.

2. **Frontend (React + Vite + TailwindCSS v4 + Firebase)**
   - Located in: `c:\Users\yekka\Documents\InsightFlow-UI`
   - Entry point: Vite dev server (runs on `http://localhost:5173`)
   - Provides authentication, dataset preview/upload, dynamic parameter tweaking, live websocket pipeline status, and interactive results dashboards.

---

## 📁 Project Structure

```text
c:\Users\yekka\Documents\
│
├── Agentic-DataAnalyst/               # Backend API
│    ├── api.py                        # FastAPI Backend entrypoint
│    ├── config.py                     # Path and environment settings
│    ├── crew.py                       # CrewAI agent team builder
│    ├── agents.py                     # LLM agent definitions
│    ├── tasks.py                      # Multi-agent task flows
│    ├── tools.py                      # Deterministic Python analysis tools
│    └── data/                         # Uploaded dataset storage
│
└── InsightFlow-UI/                    # Frontend UI Dashboard
     ├── src/
     │    ├── pages/app/               # Analyze, Dashboard, Datasets, Results pages
     │    ├── lib/                     # API client (api.ts) & Firebase config (firebase.ts)
     │    └── store/                   # Zustand global state (useStore.ts)
     ├── vite.config.ts                # Vite config (proxies /api and /ws to port 8000)
     └── package.json                  # React dependencies
```

---

## 🚀 How to Run the Application

To run the application, you need to start **both** the backend and the frontend:

### 1. Start the Backend API Server
Open a terminal in the `Agentic-DataAnalyst` folder and run:
```bash
.venv\Scripts\python.exe api.py
```
This launches the FastAPI server on **`http://localhost:8000`**.

### 2. Start the Frontend Dev Server
Open another terminal in the `InsightFlow-UI` folder and run:
```bash
npm run dev
```
This launches the React development server on **`http://localhost:5173`**.

Open your browser and navigate to **[http://localhost:5173](http://localhost:5173)** to use the application.

---

## ⚙️ Configuration & LLMs

- **Ollama:** The app uses local Ollama for the CrewAI execution. By default, it runs **`qwen2.5:3b`** for faster execution on CPU. You can change this in the UI sidebar settings.
- **Firebase:** Auth credentials are configured in `InsightFlow-UI/src/lib/firebase.ts`.
- **Environment variables:** Configured in `.env` inside the `Agentic-DataAnalyst` directory.

