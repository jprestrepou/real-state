from fastapi.testclient import TestClient
from app.main import app
from app.utils.security import get_current_user, require_role

client = TestClient(app)

class MockUser:
    id = 'test-admin-id'
    role = 'Admin'

app.dependency_overrides[get_current_user] = lambda: MockUser()

response = client.post('/api/v1/accounts', json={
    'account_name': 'Test Checking',
    'account_type': 'Corriente',
    'currency': 'COP',
    'initial_balance': 1000.0
})
print('Status:', response.status_code)
print('Response:', response.json())

