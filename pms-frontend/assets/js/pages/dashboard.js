/**
 * Dashboard Page — KPIs, Map, Charts, Alerts Timeline.
 */

import { api } from '../api.js';
import { formatCurrency, formatCurrencyShort, formatPercent } from '../utils/formatters.js';
import { createBarChart, createDoughnutChart, createCashFlowChart } from '../utils/charts.js';
import { initMap, updateMarkers, invalidateMap } from '../utils/map.js';

export async function renderDashboard(container) {
    // Fetch all data in parallel
    const [summaryRes, mapData, cashflow] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/properties/map'),
        api.get('/reports/cashflow?months=12'),
    ]);

    const summary = summaryRes;

    container.innerHTML = `
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 animate-fade-in">
      <div class="kpi-card kpi-blue">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Total Propiedades</span>
          <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <i data-lucide="home" class="w-5 h-5 text-primary-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${summary.total_properties}</p>
      </div>

      <div class="kpi-card kpi-green">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Ocupación</span>
          <div class="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
            <i data-lucide="users" class="w-5 h-5 text-accent-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${formatPercent(summary.occupancy_rate)}</p>
      </div>

      <div class="kpi-card kpi-green">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Ingresos</span>
          <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <i data-lucide="trending-up" class="w-5 h-5 text-green-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${formatCurrencyShort(summary.total_income)}</p>
      </div>

      <div class="kpi-card kpi-red">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Gastos</span>
          <div class="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <i data-lucide="trending-down" class="w-5 h-5 text-rose-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${formatCurrencyShort(summary.total_expenses)}</p>
      </div>
    </div>

    <!-- Map + Doughnut Chart Row -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
      <div class="xl:col-span-2 glass-card-static p-6 animate-fade-in">
        <h3 class="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <i data-lucide="map-pin" class="w-5 h-5 text-primary-500"></i>
          Mapa de Propiedades
        </h3>
        <div id="dashboard-map" style="height: 380px; border-radius: 12px;"></div>
      </div>

      <div class="glass-card-static p-6 animate-fade-in">
        <h3 class="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <i data-lucide="pie-chart" class="w-5 h-5 text-primary-500"></i>
          Distribución por Tipo
        </h3>
        <div style="height: 340px; display: flex; align-items: center; justify-content: center;">
          <canvas id="type-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
      <div class="glass-card-static p-6 animate-fade-in">
        <h3 class="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <i data-lucide="bar-chart-3" class="w-5 h-5 text-primary-500"></i>
          Ingresos vs Gastos
        </h3>
        <div style="height: 300px;">
          <canvas id="income-expense-chart"></canvas>
        </div>
      </div>

      <div class="glass-card-static p-6 animate-fade-in">
        <h3 class="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <i data-lucide="activity" class="w-5 h-5 text-primary-500"></i>
          Cash Flow (12 meses)
        </h3>
        <div style="height: 300px;">
          <canvas id="cashflow-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Accounts Summary -->
    <div class="glass-card-static p-6 animate-fade-in">
      <h3 class="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
        <i data-lucide="credit-card" class="w-5 h-5 text-primary-500"></i>
        Cuentas Bancarias
      </h3>
      ${summary.accounts.length > 0 ? `
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          ${summary.accounts.map(acc => `
            <div class="p-4 rounded-xl border border-surface-200 bg-surface-50/50 hover:border-primary-200 transition-colors">
              <p class="text-sm font-medium text-surface-600">${acc.account_name}</p>
              <p class="text-sm text-surface-400 mb-2">${acc.account_type} • ${acc.currency}</p>
              <p class="text-xl font-bold ${acc.current_balance >= 0 ? 'text-accent-600' : 'text-rose-600'}">${formatCurrency(acc.current_balance)}</p>
            </div>
          `).join('')}
        </div>
      ` : `
        <p class="text-center text-surface-400 py-8">No hay cuentas registradas aún</p>
      `}
    </div>
  `;

    // Re-init icons
    if (window.lucide) lucide.createIcons();

    // Init Map
    setTimeout(() => {
        initMap('dashboard-map');
        updateMarkers(mapData);
        invalidateMap();
    }, 100);

    // Type distribution doughnut
    if (mapData.length > 0) {
        const typeCounts = {};
        mapData.forEach(p => { typeCounts[p.property_type] = (typeCounts[p.property_type] || 0) + 1; });
        const typeLabels = Object.keys(typeCounts);
        const typeData = Object.values(typeCounts);
        createDoughnutChart(document.getElementById('type-chart'), typeLabels, typeData);
    }

    // Income vs Expenses bar chart
    const cfMonths = cashflow.months || [];
    if (cfMonths.length > 0) {
        const last6 = cfMonths.slice(-6);
        createBarChart(
            document.getElementById('income-expense-chart'),
            last6.map(m => m.month),
            last6.map(m => m.income),
            last6.map(m => m.expenses),
        );

        // Cash flow line chart
        createCashFlowChart(
            document.getElementById('cashflow-chart'),
            cfMonths.map(m => m.month),
            cfMonths.map(m => m.income),
            cfMonths.map(m => m.expenses),
            cfMonths.map(m => m.net),
        );
    }
}
