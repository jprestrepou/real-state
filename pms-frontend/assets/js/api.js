/**
 * API Client — HTTP client with JWT interceptor and auto-refresh.
 */

const API_BASE = (import.meta.env.VITE_API_URL || 'https://real-state-xd5o.onrender.com') + '/api/v1';

class ApiClient {
    constructor() {
        this._accessToken = localStorage.getItem('pms_access_token');
        this._refreshToken = localStorage.getItem('pms_refresh_token');
        this._onUnauthorized = null;
    }

    /** Base URL of the API (e.g. https://host/api/v1) — used to construct upload URLs. */
    get baseUrl() {
        return API_BASE;
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

        let response;
        try {
            response = await fetch(`${API_BASE}${url}`, { ...options, headers });
        } catch (fetchError) {
            console.error(`[ApiClient] Network Error (Failed to fetch) at ${url}:`, fetchError);
            throw new Error(`Error de conexión al servidor (Verifica tu internet o si el servidor está activo). ${fetchError.message}`);
        }

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
            let detail = 'Error del servidor';
            try {
                const error = await response.json();
                if (typeof error.detail === 'string') {
                    detail = error.detail;
                } else if (Array.isArray(error.detail)) {
                    detail = error.detail.map(e => e.msg).join(', ');
                } else if (error.detail) {
                    detail = JSON.stringify(error.detail);
                }
            } catch (e) {
                detail = `Error ${response.status}`;
            }
            throw new Error(detail);
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
    patch(url, data) { return this._fetch(url, { method: 'PATCH', body: JSON.stringify(data) }); }
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

    // ── Descargas Nativas ───────────────────────────────
    /**
     * Helper to make authenticated download requests and trigger browser download
     */
    async download(url, defaultFilename = 'documento.pdf') {
        const headers = {};
        if (this._accessToken) {
            headers['Authorization'] = `Bearer ${this._accessToken}`;
        }

        let response;
        try {
            response = await fetch(`${API_BASE}${url}`, { headers });
        } catch (fetchError) {
            throw new Error(`Error de conexión al servidor al descargar. ${fetchError.message}`);
        }

        // Handle Token Refresh flow on downloads
        if (response.status === 401 && this._refreshToken) {
            const refreshed = await this._tryRefresh();
            if (refreshed) {
                headers['Authorization'] = `Bearer ${this._accessToken}`;
                response = await fetch(`${API_BASE}${url}`, { headers });
            } else {
                this.clearTokens();
                if (this._onUnauthorized) this._onUnauthorized();
                throw new Error('Sesión expirada. Inicie sesión nuevamente.');
            }
        }

        if (!response.ok) {
            let detail = 'Error del servidor al generar archivo';
            try {
                const error = await response.json();
                if (typeof error.detail === 'string') detail = error.detail;
            } catch (e) {
                // fall back to default string
            }
            throw new Error(detail);
        }

        const blob = await response.blob();
        let filename = defaultFilename;
        
        // Tratar de obtener el nombre original recomendado desde el header Content-Disposition si existe
        const disposition = response.headers.get('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) { 
                filename = matches[1].replace(/['"]/g, '');
            }
        }

        // Disparar descarga en el navegador
        const urlBlob = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlBlob;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup para evitar bloqueos de memoria (memory leak)
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(urlBlob);
        }, 100);
    }
}

export const api = new ApiClient();