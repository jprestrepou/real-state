/**
 * PMS App — SPA Router + Auth + Global State.
 */

import { api } from './api.js';
import { showToast } from './components/modal.js';
import './utils/currency-input.js'; // Auto-formats inputs with class "currency-input"

// ── Page Modules (lazy-ish imports) ─────────────────────
import { renderDashboard } from './pages/dashboard.js';
import { renderProperties } from './pages/properties.js';
import { renderFinancials } from './pages/financials.js';
import { renderInvoices } from './pages/invoices.js';
import { renderMaintenance } from './pages/maintenance.js';
import { renderContracts } from './pages/contracts.js';
import { renderBudgets } from './pages/budgets.js';
import { renderBudgetReport } from './pages/budget_report.js';
import { renderFacility } from './pages/facility.js';
import { renderAccountDetail } from './pages/account_detail.js';
import { renderWorkGroups } from './pages/work_groups.js';
import { renderAudits } from './pages/audits.js';
import { renderCalendar } from './pages/calendar.js';
import { renderAccounting } from './pages/accounting.js';
import { renderSettings } from './pages/settings.js';
import { renderContacts } from './pages/contacts.js';

// ── Global State ────────────────────────────────────────
const state = {
    user: null,
    currentPage: 'dashboard',
};

// ── Page Registry ───────────────────────────────────────
const pages = {
    dashboard: { title: 'Dashboard', subtitle: 'Vista general de su cartera inmobiliaria', render: renderDashboard },
    properties: { title: 'Propiedades', subtitle: 'Gestión de su portfolio inmobiliario', render: renderProperties },
    financials: { title: 'Finanzas', subtitle: 'Ledger contable y conciliación bancaria', render: renderFinancials },
    invoices: { title: 'Cuentas por Cobrar', subtitle: 'Facturación de arriendos y cobros pendientes', render: renderInvoices },
    maintenance: { title: 'Mantenimientos', subtitle: 'Órdenes de trabajo y calendario', render: renderMaintenance },
    contracts: { title: 'Contratos', subtitle: 'Gestión de arrendamientos', render: renderContracts },
    budgets: { title: 'Presupuestos', subtitle: 'Control presupuestario y semáforo', render: renderBudgets },
    'budget-report': { title: 'Reporte de Presupuesto', subtitle: 'Distribución y cumplimiento detallado', render: renderBudgetReport },
    facility: { title: 'Facility Management', subtitle: 'Gestión de activos e inspecciones', render: renderFacility },
    'account-detail': { title: 'Detalle de Cuenta', subtitle: 'Historial de movimientos y análisis de saldo', render: renderAccountDetail },
    'work-groups': { title: 'Grupos de Trabajo', subtitle: 'Gestión de equipos de mantenimiento', render: renderWorkGroups },
    audits: { title: 'Auditoría', subtitle: 'Registro de actividades y log del sistema', render: renderAudits },
    calendar: { title: 'Calendario', subtitle: 'Eventos y fechas importantes próximas', render: renderCalendar },
    accounting: { title: 'Contabilidad Consolidada', subtitle: 'Estados financieros, P&L y Balance General', render: renderAccounting },
    settings: { title: 'Configuración', subtitle: 'Ajustes globales y de integraciones', render: renderSettings },
    contacts: { title: 'Directorio de Contactos', subtitle: 'Gestión de proveedores, inquilinos y clientes', render: renderContacts },
};

// ── Router ──────────────────────────────────────────────
function getRouteFromHash() {
    const hash = window.location.hash.replace('#/', '') || 'dashboard';
    // Remove query params and sub-routes to get the base page name
    return hash.split('?')[0].split('/')[0];
}

async function navigate(pageName) {
    const page = pages[pageName];
    if (!page) {
        window.location.hash = '#/dashboard';
        return;
    }

    state.currentPage = pageName;

    // Update page header
    document.getElementById('page-title').textContent = page.title;
    document.getElementById('page-subtitle').textContent = page.subtitle;

    // Update sidebar active state
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageName);
    });

    // Render page content
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="flex items-center justify-center py-20"><div class="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>';

    try {
        await page.render(content, state);
    } catch (err) {
        console.error(`Error rendering ${pageName}:`, err);
        content.innerHTML = `
      <div class="text-center py-20">
        <i data-lucide="alert-circle" class="w-12 h-12 text-rose-400 mx-auto mb-4"></i>
        <h3 class="text-lg font-semibold text-surface-700 mb-2">Error al cargar la página</h3>
        <p class="text-surface-500">${err.message}</p>
      </div>
    `;
    }

    // Re-init Lucide icons
    if (window.lucide) lucide.createIcons();
}

// ── Auth Logic ──────────────────────────────────────────
function showAuth() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('app-shell').classList.add('hidden');
    if (window.lucide) lucide.createIcons();
}

function showApp() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');

    // Update user info in sidebar
    if (state.user) {
        document.getElementById('user-name').textContent = state.user.full_name;
        document.getElementById('user-role').textContent = state.user.role;
        document.getElementById('user-avatar').textContent = state.user.full_name.charAt(0).toUpperCase();
    }

    if (window.lucide) lucide.createIcons();
    navigate(getRouteFromHash());
}

async function checkAuth() {
    if (!api.isAuthenticated()) {
        showAuth();
        return;
    }

    try {
        state.user = await api.getProfile();
        showApp();
    } catch {
        api.clearTokens();
        showAuth();
    }
}

// ── Init ────────────────────────────────────────────────
function init() {
    // Handle hash change
    window.addEventListener('hashchange', () => {
        if (state.user) navigate(getRouteFromHash());
    });

    // Login form
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            await api.login(email, password);
            state.user = await api.getProfile();
            showToast(`Bienvenido, ${state.user.full_name}`, 'success');
            showApp();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // Register form
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userData = {
            full_name: document.getElementById('reg-name').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            role: document.getElementById('reg-role').value,
        };
        try {
            console.log('Registrando usuario...', userData);
            await api.register(userData);
            showToast('Cuenta creada. Inicie sesión.', 'success');
            // Toggle view to login
            document.getElementById('register-form').classList.add('hidden');
            document.getElementById('login-form').classList.remove('hidden');
            // Reset fields
            e.target.reset();
        } catch (err) {
            console.error('Error en registro:', err);
            showToast(err.message, 'error');
        }
    });

    // Toggle login/register
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    });
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        api.clearTokens();
        state.user = null;
        showToast('Sesión cerrada', 'info');
        showAuth();
    });

    // API unauthorized handler
    api.onUnauthorized(() => {
        state.user = null;
        showAuth();
        showToast('Sesión expirada', 'warning');
    });

    // Start
    checkAuth();
}

document.addEventListener('DOMContentLoaded', init);
