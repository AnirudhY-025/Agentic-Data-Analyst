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
