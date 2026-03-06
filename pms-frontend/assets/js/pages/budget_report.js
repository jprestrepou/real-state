/**
 * Budget Report Page — Detailed allocation view.
 */
import { api } from '../api.js';
import { formatCurrency, formatPercent } from '../utils/formatters.js';

export async function renderBudgetReport(container) {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const propertyId = params.get('property_id');
    const year = params.get('year');
    const month = params.get('month');

    if (!propertyId || !year || !month) {
        container.innerHTML = `<div class="p-12 text-center text-surface-500">Faltan parámetros para el reporte.</div>`;
        return;
    }

    const report = await api.get(`/budgets/report/${propertyId}?year=${year}&month=${month}`);

    // Extract all sub-properties found in any row's distribution
    const subPropertyIds = new Set();
    report.rows.forEach(row => {
        Object.keys(row.distribution).forEach(id => subPropertyIds.add(id));
    });
    const subPropList = Array.from(subPropertyIds);

    container.innerHTML = `
    <div class="mb-6 flex items-center justify-between">
      <a href="#/budgets" class="btn-ghost text-sm"><i data-lucide="arrow-left" class="w-4 h-4 mr-1"></i> Volver</a>
      <div class="text-right">
        <h4 class="font-bold text-surface-900">Periodo: ${month}/${year}</h4>
      </div>
    </div>

    <div class="glass-card overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-50 border-b border-surface-200">
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Categoría</th>
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Presupuestado</th>
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Ejecutado Total</th>
            ${subPropList.map(id => `<th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">${id.slice(0, 8)}...</th>`).join('')}
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Diferencia</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-100">
          ${report.rows.length ? report.rows.map(row => {
        const diff = row.budgeted - row.actual;
        const diffColor = diff >= 0 ? 'text-green-600' : 'text-red-600';

        return `
              <tr class="hover:bg-surface-50/50 transition-colors">
                <td class="p-4 font-medium text-surface-700">
                  <div class="flex flex-col">
                    <span>${row.category}</span>
                    ${row.is_distributable ? '<span class="text-[10px] text-primary-500 font-bold uppercase">Distribuible</span>' : ''}
                  </div>
                </td>
                <td class="p-4 text-surface-600 font-mono text-sm">${formatCurrency(row.budgeted)}</td>
                <td class="p-4 text-surface-900 font-bold font-mono text-sm">${formatCurrency(row.actual)}</td>
                ${subPropList.map(id => `
                  <td class="p-4 text-surface-500 font-mono text-xs">
                    ${row.distribution[id] ? formatCurrency(row.distribution[id]) : '--'}
                  </td>
                `).join('')}
                <td class="p-4 font-bold font-mono text-sm ${diffColor}">${formatCurrency(diff)}</td>
              </tr>
            `;
    }).join('') : `<tr><td colspan="${4 + subPropList.length}" class="p-8 text-center text-surface-400">Sin datos para este periodo</td></tr>`}
        </tbody>
      </table>
    </div>

    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Total Presupuesto</p>
        <p class="text-xl font-bold text-surface-900 font-mono">${formatCurrency(report.rows.reduce((a, b) => a + b.budgeted, 0))}</p>
      </div>
      <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Total Ejecutado</p>
        <p class="text-xl font-bold text-primary-600 font-mono">${formatCurrency(report.rows.reduce((a, b) => a + b.actual, 0))}</p>
      </div>
       <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Cumpimiento</p>
        <p class="text-xl font-bold text-surface-900 font-mono">
          ${formatPercent(report.rows.reduce((a, b) => a + b.actual, 0) / (report.rows.reduce((a, b) => a + b.budgeted, 0) || 1) * 100)}
        </p>
      </div>
    </div>
  `;

    if (window.lucide) lucide.createIcons();
}
