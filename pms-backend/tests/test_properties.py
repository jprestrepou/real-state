
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.utils.security import get_current_user
from app.models.user import User

# Mock user for testing
class MockUser:
    def __init__(self, id, role):
        self.id = id
        self.role = role

def mock_get_current_user():
    return MockUser(id="test-owner-id", role="Admin")

@pytest.mark.asyncio
async def test_list_properties():
    # Override dependency
    app.dependency_overrides[get_current_user] = mock_get_current_user
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/properties")
    
    # Cleanup overrides
    app.dependency_overrides.clear()
    
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)
