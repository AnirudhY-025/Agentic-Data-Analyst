import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import sys

# Add backend to sys path so we can import api
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from api import app, get_current_user

# Mock the dependency to return a test user
app.dependency_overrides[get_current_user] = lambda: "test_user_123"

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_upload_dataset():
    fixture_path = Path(__file__).parent / "fixtures" / "test_sales_data.csv"
    with open(fixture_path, "rb") as f:
        response = client.post(
            "/api/upload",
            files={"file": ("test_sales_data.csv", f, "text/csv")}
        )
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test_sales_data.csv"
    
def test_list_datasets():
    response = client.get("/api/datasets")
    assert response.status_code == 200
    data = response.json()
    assert "datasets" in data
    filenames = [d["name"] for d in data["datasets"]]
    assert "test_sales_data.csv" in filenames

def test_models_endpoint_has_ollama_availability():
    response = client.get("/api/models")
    assert response.status_code == 200
    data = response.json()
    assert "ollama" in data
    assert "openrouter" in data
    assert "ollama_available" in data
    assert isinstance(data["ollama_available"], bool)

def test_settings_byok_endpoints():
    # GET settings returns ollama status
    get_res = client.get("/api/settings")
    assert get_res.status_code == 200
    assert "ollama_available" in get_res.json()

    # POST valid key
    post_res = client.post("/api/settings", json={"openrouter_api_key": "sk-or-v1-abcdef1234567890"})
    assert post_res.status_code == 200
    assert post_res.json()["valid"] is True

    # POST short key should be rejected
    bad_res = client.post("/api/settings", json={"openrouter_api_key": "short"})
    assert bad_res.status_code == 400
