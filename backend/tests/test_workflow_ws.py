import json
import shutil
from pathlib import Path
from fastapi.testclient import TestClient
from api import app
from config import get_user_data_dir

def test_workflow_websocket_e2e():
    user_id = "test_ws_e2e_user"
    data_dir = get_user_data_dir(user_id)
    fixture_path = Path(__file__).parent / "fixtures" / "test_sales_data.csv"
    shutil.copy(fixture_path, data_dir / "test_sales_data.csv")

    client = TestClient(app)
    with client.websocket_connect(f"/ws/workflow?user_id={user_id}") as ws:
        ws.send_text(json.dumps({
            "dataset_name": "test_sales_data.csv",
            "question": "Analyze sales performance",
            "model": "openrouter/openrouter/free",
            "openrouter_api_key": None,
            "ollama_base_url": None
        }))
        
        completed = False
        steps_seen = []
        while True:
            try:
                msg = ws.receive_text()
                data = json.loads(msg)
                if data.get("type") == "step":
                    steps_seen.append((data.get("step"), data.get("status")))
                elif data.get("type") == "complete":
                    completed = True
                    results = data.get("results", {})
                    assert "quality" in results
                    assert "charts" in results
                    assert len(results["charts"]) > 0
                    assert "reports" in results
                    break
                elif data.get("type") == "error":
                    raise AssertionError(f"Workflow error: {data.get('message')}")
            except Exception as exc:
                if completed:
                    break
                raise exc

    assert completed, "Workflow did not send complete event"
    # Ensure all 6 steps reached 'done'
    done_steps = {s[0] for s in steps_seen if s[1] == "done"}
    assert done_steps == {1, 2, 3, 4, 5, 6}, f"Missing completed steps: {done_steps}"
