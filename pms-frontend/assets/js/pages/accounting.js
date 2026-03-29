/**
 * Accounting Page — Detailed Yearly Financial Statement (P&L, Balance Sheet).
 */
import { api } from '../api.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export async function renderAccounting(container) {
    const currentYear = new Date().getFullYear();
    container.innerHTML = `
        <div class="flex flex-col gap-6 animate-fade-in">
            <div class="flex items-center justify-between mb-2">
                <div>
                    <h2 class="text-2xl font-black text-surface-900">Estado Financiero Consolidado</h2>
                    <p class="text-surface-500 text-sm">Análisis detallado de pérdidas, ganancias y balance general.</p>
                </div>
                <div class="flex items-center gap-3">
                    <label class="text-xs font-bold text-surface-400 uppercase">Año Fiscal:</label>
                    <select id="report-year-select" class="select w-32 shadow-sm">
                        ${[currentYear, currentYear - 1, currentYear - 2].map(y => `<option value="${y}">${y}</option>`).join('')}
                    </select>
                    <button id="btn-refresh-report" class="btn-secondary p-2.5 rounded-xl">
                        <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                    </button>
                    <button id="btn-export-excel" class="btn-primary flex items-center gap-2">
                         <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Exportar
                    </button>
                </div>
            </div>

            <div id="accounting-report-content" class="min-h-[400px]">
                <div class="flex items-center justify-center py-40">
                    <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();

    const yearSelect = document.getElementById('report-year-select');
    const refreshBtn = document.getElementById('btn-refresh-report');

    const loadReport = async () => {
        const year = yearSelect.value;
        const content = document.getElementById('accounting-report-content');
        content.innerHTML = '<div class="flex items-center justify-center py-40"><div class="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div></div>';
        
        try {
            const data = await api.get(`/accounting/yearly-report/${year}`);
            renderReportTable(content, data.report);
        } catch (err) {
            content.innerHTML = `<div class="p-10 text-center text-rose-500 bg-rose-50 rounded-2xl border border-rose-100">Error: ${err.message}</div>`;
        }
    };

    yearSelect.addEventListener('change', loadReport);
    refreshBtn.addEventListener('click', loadReport);

    // Initial load
    loadReport();
}

function renderReportTable(container, report) {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    
    // helper to get month value (0 is consolidated, 1-12 are months)
    const getVal = (section, category, month) => report[section][category][month] || 0;

    container.innerHTML = `
        <div class="glass-card-static p-0 overflow-hidden border-white/40 shadow-xl">
            <div class="overflow-x-auto">
                <table class="w-full border-collapse text-[11px]">
                    <thead class="bg-surface-900 text-white sticky top-0 z-10">
                        <tr>
                            <th class="p-3 text-left w-64 border-r border-surface-800">Concepto / Mes</th>
                            ${months.map(m => `<th class="p-3 text-center border-r border-surface-800 font-bold">${m}</th>`).join('')}
                            <th class="p-3 text-center bg-primary-600 font-black">CONSOLIDADO</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- P&L SECTION -->
                        <tr class="bg-surface-100 font-black text-surface-900 border-b border-surface-200">
                            <td colspan="14" class="p-2 px-4 uppercase tracking-widest text-[10px]">I. Pérdidas y Ganancias (P&L)</td>
                        </tr>
                        ${renderRow("Ingresos", report.pnl.Ingresos, "text-accent-700 font-semibold")}
                        ${renderRow("Costo de Ventas", report.pnl["Costo de Ventas"], "text-rose-500")}
                        <tr class="bg-surface-50 font-bold border-b border-surface-200">
                            <td class="p-3 border-r border-surface-100">UTILIDAD BRUTA</td>
                            ${renderValues(report.pnl["Utilidad Bruta"], "font-bold text-surface-900")}
                        </tr>
                        ${renderRow("Gastos Operativos", report.pnl["Gastos Operativos"])}
                        <tr class="bg-primary-50/50 font-bold border-b border-surface-200">
                            <td class="p-3 border-r border-surface-100 italic">Utilidad Operacional (EBITDA)</td>
                            ${renderValues(report.pnl["Utilidad Operacional"], "font-bold text-primary-700")}
                        </tr>
                        ${renderRow("Gastos No Operativos", report.pnl["Gastos No Operativos"])}
                        <tr class="bg-surface-900 text-white font-black">
                            <td class="p-3 border-r border-surface-800 uppercase tracking-tighter">UTILIDAD NETA FINAL</td>
                            ${renderValues(report.pnl["Utilidad Neta"], "font-black")}
                        </tr>

                        <!-- BALANCE SECTION -->
                        <tr class="bg-surface-100 font-black text-surface-900 border-b border-surface-200 mt-4">
                            <td colspan="14" class="p-2 px-4 uppercase tracking-widest text-[10px]">II. Balance General (Estado de Situación)</td>
                        </tr>
                        ${renderRow("Activos (Caja y Bancos)", report.balance["Activos (Caja/Bancos)"], "text-indigo-600 font-bold")}
                        ${renderRow("Pasivos / Deudas", report.balance["Pasivos/Deuda"], "text-amber-600")}
                        <tr class="bg-indigo-50 font-bold border-t-2 border-indigo-200">
                            <td class="p-3 border-r border-surface-100">PATRIMONIO NETO</td>
                            ${renderValues(report.balance["Activos (Caja/Bancos)"].map((v, i) => v - report.balance["Pasivos/Deuda"][i]), "font-bold text-indigo-800")}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
             <div class="glass-card p-6 bg-gradient-to-br from-white to-accent-50/20 border-accent-100">
                <h4 class="text-xs font-black text-surface-400 uppercase mb-4">Margen de Utilidad Neta</h4>
                <div class="flex items-end gap-2">
                    <span class="text-4xl font-black text-accent-600">${calculateMargin(report.pnl["Utilidad Neta"][0], report.pnl["Ingresos"][0])}%</span>
                    <span class="text-xs text-surface-400 mb-2">Anual total</span>
                </div>
                <div class="w-full bg-surface-100 h-2 rounded-full mt-4 overflow-hidden">
                    <div class="bg-accent-500 h-full" style="width: ${calculateMargin(report.pnl["Utilidad Neta"][0], report.pnl["Ingresos"][0])}%"></div>
                </div>
            </div>
             <div class="glass-card p-6 bg-gradient-to-br from-white to-primary-50/20 border-primary-100">
                <h4 class="text-xs font-black text-surface-400 uppercase mb-4">Eficiencia de Gastos</h4>
                <div class="flex items-end gap-2">
                    <span class="text-4xl font-black text-primary-600">${calculateMargin(report.pnl["Gastos Operativos"][0], report.pnl["Ingresos"][0])}%</span>
                    <span class="text-xs text-surface-400 mb-2">sobre ingresos</span>
                </div>
                <div class="w-full bg-surface-100 h-2 rounded-full mt-4 overflow-hidden">
                    <div class="bg-primary-500 h-full" style="width: ${calculateMargin(report.pnl["Gastos Operativos"][0], report.pnl["Ingresos"][0])}%"></div>
                </div>
            </div>
             <div class="glass-card p-6 bg-gradient-to-br from-white to-indigo-50/20 border-indigo-100">
                <h4 class="text-xs font-black text-surface-400 uppercase mb-4">Crecimiento Activos</h4>
                <div class="flex items-end gap-2">
                    <span class="text-4xl font-black text-indigo-600">${formatCurrency(report.balance["Activos (Caja/Bancos)"][0])}</span>
                </div>
                <p class="text-[10px] text-surface-400 mt-4 italic">Cierre de balance al finalizar el periodo seleccionado.</p>
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();
}

function renderRow(label, values, customClass = "") {
    return `
        <tr class="border-b border-surface-100 hover:bg-surface-50/50 transition-colors">
            <td class="p-3 border-r border-surface-100 font-medium text-surface-600">${label}</td>
            ${renderValues(values, customClass)}
        </tr>
    `;
}

function renderValues(values, customClass = "") {
    // values[1..12] are months, values[0] is consolidated
    let html = "";
    for (let i = 1; i <= 12; i++) {
        const v = values[i] || 0;
        html += `<td class="p-3 text-center border-r border-surface-100 ${customClass} ${v < 0 ? 'text-rose-600' : ''}">${v !== 0 ? formatCurrency(v).replace('$', '') : '-'}</td>`;
    }
    const total = values[0] || 0;
    html += `<td class="p-3 text-center bg-surface-50 font-black ${customClass} ${total < 0 ? 'text-rose-600' : ''}">${formatCurrency(total)}</td>`;
    return html;
}

function calculateMargin(utility, income) {
    if (!income || income === 0) return 0;
    return Math.round((utility / income) * 100);
}
