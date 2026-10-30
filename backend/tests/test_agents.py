import pytest
import json
import shutil
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from crew import build_crew
from config import CURRENT_USER_ID, get_user_data_dir

@pytest.fixture
def setup_test_env():
    # Setup user context
    CURRENT_USER_ID.set("test_agent_user")
    user_dir = get_user_data_dir("test_agent_user")
    
    # Copy fixture to user dir
    fixture_path = Path(__file__).parent / "fixtures" / "test_sales_data.csv"
    dest_path = user_dir / "test_sales_data.csv"
    shutil.copy(fixture_path, dest_path)
    
    yield dest_path

def test_data_prep_and_analysis_tools(setup_test_env):
    """
    Test the deterministic Python tools that feed the CrewAI agents.
    Ensures mathematical accuracy before the LLM generates the report.
    """
    dataset_path = setup_test_env
    insights_path = Path(__file__).parent / "fixtures" / "expected_insights.json"
    with open(insights_path, "r") as f:
        expected = json.load(f)
        
    from tools import detect_outliers, perform_correlation_analysis, load_dataset
    
    df = load_dataset(str(dataset_path))
    
    # 1. Deterministic Outlier Check
    outliers = detect_outliers(df)
    
    outlier_found = False
    for col in outliers.get("outlier_summary", []):
        if col["column"] == expected["outlier_column"] and col["outlier_count"] > 0:
            outlier_found = True
    assert outlier_found, f"Failed to detect outliers in {expected['outlier_column']}"
    
    # 2. Deterministic Correlation Check
    corr = perform_correlation_analysis(df)
    
    pairs = corr.get("strongest_pairs", [])
    assert len(pairs) > 0, "No correlations found"
    
    top_pair = [pairs[0]["feature_a"], pairs[0]["feature_b"]]
    assert expected["strong_correlation_pair"][0] in top_pair
    assert expected["strong_correlation_pair"][1] in top_pair
