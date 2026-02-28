from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Bypass auth for a sec or use a mock user
app.dependency_overrides = {}
from app.utils.security import get_current_user, require_role

def override_require_role(*roles):
    def _override():
        class MockUser:
            id = 'test-admin-id'
            role = 'Admin'
        return MockUser()
    return _override

app.dependency_overrides[require_role('Admin', 'Propietario')] = override_require_role('Admin', 'Propietario')

response = client.post('/api/v1/accounts', json={
    'account_name': 'Test Checking',
    'account_type': 'Corriente',
    'currency': 'COP',
    'initial_balance': 1000.0
})
print('Status:', response.status_code)
print('Response:', response.json())

