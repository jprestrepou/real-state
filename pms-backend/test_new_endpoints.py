from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, Base
import os

client = TestClient(app)

def test_work_groups():
    # 1. Create a work group
    res = client.post("/api/v1/work-groups", json={"name": "Test Group", "description": "Test Desc"})
    assert res.status_code == 200, res.text
    group_id = res.json()["id"]

    # 2. Get work groups
    res = client.get("/api/v1/work-groups")
    assert res.status_code == 200
    assert any(g["id"] == group_id for g in res.json())

def test_audits():
    # Audits should be created dynamically or available
    res = client.get("/api/v1/audits?limit=5")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

if __name__ == "__main__":
    test_work_groups()
    test_audits()
    print("All tests passed!")
