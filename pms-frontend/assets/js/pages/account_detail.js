/**
 * Account Detail Page — History, charts, and detailed transactions.
 */
import { api } from '../api.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

let accountDetailChart = null;
let balanceHistoryChart = null;

export async function renderAccountDetail(container) {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const accountId = urlParams.get('id');

    if (!accountId) {
        container.innerHTML = `<div class="p-8 text-center text-rose-500">Error: No se proporcionó ID de cuenta.</div>`;
        return;
    }

    // Initial loading state
    container.innerHTML = `
        <div class="flex items-center justify-center py-20">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
        </div>
    `;

    try {
        await loadAccountData(container, accountId);
    } catch (err) {
        container.innerHTML = `<div class="p-8 text-center text-rose-500">Error al cargar datos de la cuenta: ${err.message}</div>`;
    }
}

async function loadAccountData(container, accountId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    if (filters.tx_type) params.set('tx_type', filters.tx_type);
    params.set('months', 12);

    const data = await api.get(`/accounts/${accountId}/history?${params.toString()}`);
    if (!data) return;

    const { account, monthly_cashflow, recent_transactions, balance_history } = data;

    container.innerHTML = `
        <div class="flex flex-col gap-6 animate-fade-in">
            <!-- Header & Balance -->
            <div class="flex flex-col md:flex-row gap-6 items-center glass-card-static p-6 border-white/40 shadow-sm relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -translate-y-16 translate-x-16"></div>
                <div class="text-center md:text-left flex-1 z-10">
                    <div class="flex items-center gap-3 mb-2">
                        <a href="#/financials" class="p-2 rounded-xl bg-white/50 hover:bg-white text-surface-400 hover:text-primary-600 transition shadow-sm border border-white/20">
                            <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        </a>
                        <h2 class="text-2xl font-black text-surface-900">${account.account_name}</h2>
                    </div>
                    <p class="text-surface-500 text-sm ml-11">${account.bank_name || 'Sin Banco'} • ${account.account_type} • ${account.currency}</p>
                </div>
                <div class="bg-white/80 backdrop-blur-md px-8 py-4 rounded-2xl shadow-xl shadow-primary-500/5 border border-white text-center z-10 group transition-transform hover:scale-105">
                    <p class="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-1">Saldo Disponible</p>
                    <p class="text-3xl font-black ${account.current_balance >= 0 ? 'text-accent-600' : 'text-rose-600'}">
                        ${formatCurrency(account.current_balance)}
                    </p>
                </div>
            </div>

            <!-- Filters Row -->
            <div class="flex flex-wrap items-end gap-4 p-5 glass-card-static border-white/40 shadow-sm">
                <div class="flex-1 min-w-[150px]">
                    <label class="block text-[10px] font-bold text-surface-400 uppercase mb-2 tracking-wider ml-1">Desde</label>
                    <div class="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl border border-white/20 shadow-sm">
                        <i data-lucide="calendar" class="w-4 h-4 text-surface-400"></i>
                        <input type="date" id="filter-date-from" class="bg-transparent text-sm font-medium focus:outline-none w-full" value="${filters.date_from || ''}">
                    </div>
                </div>
                <div class="flex-1 min-w-[150px]">
                    <label class="block text-[10px] font-bold text-surface-400 uppercase mb-2 tracking-wider ml-1">Hasta</label>
                    <div class="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl border border-white/20 shadow-sm">
                        <i data-lucide="calendar" class="w-4 h-4 text-surface-400"></i>
                        <input type="date" id="filter-date-to" class="bg-transparent text-sm font-medium focus:outline-none w-full" value="${filters.date_to || ''}">
                    </div>
                </div>
                <div class="flex-1 min-w-[150px]">
                    <label class="block text-[10px] font-bold text-surface-400 uppercase mb-2 tracking-wider ml-1">Tipo de Transacción</label>
                    <div class="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl border border-white/20 shadow-sm">
                        <i data-lucide="list-filter" class="w-4 h-4 text-surface-400"></i>
                        <select id="filter-tx-type" class="bg-transparent text-sm font-medium focus:outline-none w-full appearance-none">
                            <option value="">Cualquier tipo</option>
                            <option value="Ingreso" ${filters.tx_type === 'Ingreso' ? 'selected' : ''}>Ingreso</option>
                            <option value="Gasto" ${filters.tx_type === 'Gasto' ? 'selected' : ''}>Gasto</option>
                            <option value="Transferencia" ${filters.tx_type === 'Transferencia' ? 'selected' : ''}>Transferencia</option>
                        </select>
                    </div>
                </div>
                <button id="btn-apply-filters" class="btn-primary !rounded-xl shadow-lg shadow-primary-500/10 py-2.5 px-6 flex items-center gap-2 hover:-translate-y-0.5 transition-transform">
                    <i data-lucide="filter" class="w-4 h-4"></i> Aplicar Filtros
                </button>
            </div>

            <!-- Charts Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="glass-card-static p-6 border-white/40 shadow-sm">
                    <h4 class="text-sm font-black text-surface-800 mb-6 flex items-center gap-2">
                        <span class="w-2.5 h-6 bg-primary-500 rounded-full"></span> 
                        Flujo de Caja Mensual (12M)
                    </h4>
                    <div class="h-[280px]"><canvas id="account-history-chart"></canvas></div>
                </div>
                <div class="glass-card-static p-6 border-white/40 shadow-sm">
                    <h4 class="text-sm font-black text-surface-800 mb-6 flex items-center gap-2">
                        <span class="w-2.5 h-6 bg-accent-500 rounded-full"></span> 
                        Evolución Histórica del Saldo
                    </h4>
                    <div class="h-[280px]"><canvas id="account-balance-chart"></canvas></div>
                </div>
            </div>

            <!-- Transactions List -->
            <div class="glass-card-static border-white/40 shadow-sm overflow-hidden mb-10">
                <div class="p-5 border-b border-white/20 bg-white/30 backdrop-blur-sm flex items-center justify-between">
                    <h4 class="text-sm font-black text-surface-800 flex items-center gap-2">
                        <i data-lucide="table-properties" class="w-5 h-5 text-primary-500"></i> 
                        Registro de Movimientos
                    </h4>
                    <span class="badge badge-blue !rounded-full text-[10px] py-1 px-3">
                        ${recent_transactions.length} registros en periodo
                    </span>
                </div>
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th class="!bg-transparent">Fecha</th>
                                <th class="!bg-transparent">Descripción</th>
                                <th class="!bg-transparent">Categoría</th>
                                <th class="!bg-transparent text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recent_transactions.length > 0 ? recent_transactions.map(tx => `
                                <tr class="hover:bg-white/50 transition-colors group">
                                    <td class="text-xs text-surface-400 font-medium italic">${formatDate(tx.transaction_date)}</td>
                                    <td>
                                        <div class="font-bold text-surface-900 text-sm group-hover:text-primary-600 transition-colors">${tx.description}</div>
                                        <div class="text-[10px] text-surface-400 flex items-center gap-1 mt-0.5">
                                            <i data-lucide="map-pin" class="w-2.5 h-2.5"></i>
                                            ${tx.property_name || 'Gasto General Corporativo'}
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge badge-gray !rounded-lg text-[10px] font-semibold">${tx.category}</span>
                                    </td>
                                    <td class="text-right font-black text-sm ${tx.direction === 'Debit' ? 'text-accent-600' : 'text-rose-600'}">
                                        <div class="flex items-center justify-end gap-1">
                                            <span>${tx.direction === 'Debit' ? '+' : '-'}</span>
                                            <span>${formatCurrency(tx.amount)}</span>
                                        </div>
                                    </td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="4" class="text-center py-20">
                                        <div class="flex flex-col items-center gap-3">
                                            <i data-lucide="ghost" class="w-10 h-10 text-surface-200"></i>
                                            <p class="text-surface-400 font-medium">No se encontraron movimientos con los filtros actuales</p>
                                        </div>
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Attach filters
    document.getElementById('btn-apply-filters').addEventListener('click', () => {
        const newFilters = {
            date_from: document.getElementById('filter-date-from').value,
            date_to: document.getElementById('filter-date-to').value,
            tx_type: document.getElementById('filter-tx-type').value
        };
        loadAccountData(container, accountId, newFilters);
    });

    // Render Charts
    renderCharts(monthly_cashflow, balance_history);
}

function renderCharts(monthly_cashflow, balance_history) {
    if (accountDetailChart) accountDetailChart.destroy();
    if (balanceHistoryChart) balanceHistoryChart.destroy();

    const ctx1 = document.getElementById('account-history-chart');
    if (ctx1 && monthly_cashflow.length > 0) {
        accountDetailChart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: monthly_cashflow.map(m => m.month),
                datasets: [
                    { label: 'Ingresos', data: monthly_cashflow.map(m => m.income), backgroundColor: '#00d084', borderRadius: 8, barThickness: 15 },
                    { label: 'Gastos', data: monthly_cashflow.map(m => m.expenses), backgroundColor: '#ff4d4f', borderRadius: 8, barThickness: 15 },
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true, font: { size: 11, weight: '600' } } } },
                scales: {
                    y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 10 }, callback: v => '$' + v.toLocaleString() } },
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                }
            }
        });
    }

    const ctx2 = document.getElementById('account-balance-chart');
    if (ctx2 && balance_history && balance_history.length > 0) {
        balanceHistoryChart = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: balance_history.map(b => formatDate(b.date)),
                datasets: [{
                    label: 'Saldo',
                    data: balance_history.map(b => b.balance),
                    borderColor: '#4d7cfe',
                    backgroundColor: 'rgba(77, 124, 254, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 6,
                    borderWidth: 4,
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
                scales: {
                    y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 10 }, callback: v => '$' + v.toLocaleString() } },
                    x: { grid: { display: false }, ticks: { font: { size: 8 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } }
                }
            }
        });
    }
}
