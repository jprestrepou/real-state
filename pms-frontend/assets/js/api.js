/**
 * API Client — HTTP client with JWT interceptor and auto-refresh.
 */

const API_BASE = 'http://localhost:8000/api/v1';

class ApiClient {
    constructor() {
        this._accessToken = localStorage.getItem('pms_access_token');
        this._refreshToken = localStorage.getItem('pms_refresh_token');
        this._onUnauthorized = null;
    }

    /** Set callback for 401 responses (logout). */
    onUnauthorized(callback) {
        this._onUnauthorized = callback;
    }

    /** Store tokens after login. */
    setTokens(accessToken, refreshToken) {
        this._accessToken = accessToken;
        this._refreshToken = refreshToken;
        localStorage.setItem('pms_access_token', accessToken);
        localStorage.setItem('pms_refresh_token', refreshToken);
    }

    /** Clear tokens on logout. */
    clearTokens() {
        this._accessToken = null;
        this._refreshToken = null;
        localStorage.removeItem('pms_access_token');
        localStorage.removeItem('pms_refresh_token');
    }

    /** Check if user is authenticated. */
    isAuthenticated() {
        return !!this._accessToken;
    }

    /** Make authenticated fetch request. */
    async _fetch(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this._accessToken) {
            headers['Authorization'] = `Bearer ${this._accessToken}`;
        }

        // Remove Content-Type for FormData
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        let response = await fetch(`${API_BASE}${url}`, { ...options, headers });

        // If 401, try refresh
        if (response.status === 401 && this._refreshToken) {
            const refreshed = await this._tryRefresh();
            if (refreshed) {
                headers['Authorization'] = `Bearer ${this._accessToken}`;
                response = await fetch(`${API_BASE}${url}`, { ...options, headers });
            } else {
                this.clearTokens();
                if (this._onUnauthorized) this._onUnauthorized();
                throw new Error('Sesión expirada. Inicie sesión nuevamente.');
            }
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Error del servidor' }));
            throw new Error(error.detail || `Error ${response.status}`);
        }

        if (response.status === 204) return null;
        return response.json();
    }

    /** Try to refresh the access token. */
    async _tryRefresh() {
        try {
            const res = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: this._refreshToken }),
            });
            if (!res.ok) return false;
            const data = await res.json();
            this.setTokens(data.access_token, data.refresh_token);
            return true;
        } catch {
            return false;
        }
    }

    // ── Convenience Methods ─────────────────────────────
    get(url) { return this._fetch(url); }
    post(url, data) { return this._fetch(url, { method: 'POST', body: JSON.stringify(data) }); }
    put(url, data) { return this._fetch(url, { method: 'PUT', body: JSON.stringify(data) }); }
    delete(url) { return this._fetch(url, { method: 'DELETE' }); }

    upload(url, formData) {
        return this._fetch(url, { method: 'POST', body: formData });
    }

    // ── Auth ────────────────────────────────────────────
    async login(email, password) {
        const data = await this.post('/auth/login', { email, password });
        this.setTokens(data.access_token, data.refresh_token);
        return data;
    }

    async register(userData) {
        return this.post('/auth/register', userData);
    }

    async getProfile() {
        return this.get('/auth/me');
    }
}

export const api = new ApiClient();
