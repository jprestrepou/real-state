/**
 * Budgets Page — traffic-light budget tracking.
 */
import { api } from '../api.js';
import { formatCurrency, formatPercent, semaphoreClass } from '../utils/formatters.js';
import { showToast, showModal } from '../components/modal.js';

export async function renderBudgets(container) {
    const budgets = await api.get('/budgets');

    container.innerHTML = `
    <div class="flex items-center justify-between mb-6 animate-fade-in">
      <h3 class="text-lg font-semibold text-surface-700">Presupuestos por Propiedad</h3>
      <button id="add-budget-btn" class="btn-primary"><i data-lucide="plus" class="w-4 h-4"></i> Nuevo Presupuesto</button>
    </div>
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
      ${budgets.length ? budgets.map(b => `
        <div class="glass-card-static p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h4 class="font-bold text-surface-900">Año ${b.year}</h4>
              <p class="text-xs text-surface-400">Propiedad: ${b.property_id.slice(0, 8)}...</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="semaphore ${semaphoreClass(b.semaphore)}"></span>
              <span class="text-sm font-semibold ${b.semaphore === 'Verde' ? 'text-green-600' : b.semaphore === 'Amarillo' ? 'text-amber-600' : 'text-red-600'}">${b.semaphore}</span>
            </div>
          </div>
          <div class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-surface-500">Ejecutado: ${formatCurrency(b.total_executed)}</span>
              <span class="font-medium">${formatPercent(b.execution_pct)}</span>
            </div>
            <div class="w-full bg-surface-200 rounded-full h-2.5">
              <div class="h-2.5 rounded-full transition-all ${b.semaphore === 'Verde' ? 'bg-green-500' : b.semaphore === 'Amarillo' ? 'bg-amber-500' : 'bg-red-500'}" style="width:${Math.min(b.execution_pct, 100)}%"></div>
            </div>
            <p class="text-xs text-surface-400 mt-1">de ${formatCurrency(b.total_budget)} presupuestado</p>
          </div>
          ${b.categories && b.categories.length ? `
            <div class="space-y-2 mt-4 pt-4 border-t border-surface-100">
              ${b.categories.map(c => `
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-2">
                    <span class="semaphore ${semaphoreClass(c.semaphore)}" style="width:10px;height:10px;"></span>
                    <span class="text-surface-700">${c.category_name}</span>
                  </div>
                  <div class="text-right">
                    <span class="font-medium">${formatPercent(c.execution_pct)}</span>
                    <span class="text-xs text-surface-400 ml-1">(${formatCurrency(c.executed_amount)} / ${formatCurrency(c.budgeted_amount)})</span>
                  </div>
                </div>
              `).join('')}
            </div>
          `: ''}
        </div>
      `).join('') : '<p class="text-surface-400 col-span-2 text-center py-12">No hay presupuestos. Cree uno para empezar.</p>'}
    </div>`;
    if (window.lucide) lucide.createIcons();
    document.getElementById('add-budget-btn').addEventListener('click', () => openBudgetModal());
}

function openBudgetModal() {
    const year = new Date().getFullYear();
    showModal('Nuevo Presupuesto', `<form id="bf" class="space-y-4">
    <div><label class="label">Propiedad ID *</label><input class="input" name="property_id" required /></div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Año *</label><input class="input" name="year" type="number" value="${year}" required /></div>
      <div><label class="label">Presupuesto Total *</label><input class="input" name="total_budget" type="number" step="0.01" required /></div>
    </div>
    <div id="cats-container">
      <label class="label">Categorías</label>
      <div class="space-y-2" id="cats-list"></div>
      <button type="button" id="add-cat-btn" class="btn-ghost text-xs mt-2"><i data-lucide="plus" class="w-3 h-3"></i> Agregar Categoría</button>
    </div>
  </form>`, {
        confirmText: 'Crear', onConfirm: async () => {
            const fd = new FormData(document.getElementById('bf'));
            const cats = [];
            document.querySelectorAll('.cat-row').forEach(r => {
                const n = r.querySelector('[name="cat_name"]').value;
                const a = r.querySelector('[name="cat_amount"]').value;
                if (n && a) cats.push({ category_name: n, budgeted_amount: parseFloat(a) });
            });
            await api.post('/budgets', { property_id: fd.get('property_id'), year: parseInt(fd.get('year')), total_budget: parseFloat(fd.get('total_budget')), categories: cats });
            showToast('Presupuesto creado', 'success');
            await renderBudgets(document.getElementById('page-content'));
        }
    });
    if (window.lucide) lucide.createIcons();
    document.getElementById('add-cat-btn').addEventListener('click', () => {
        const list = document.getElementById('cats-list');
        const row = document.createElement('div');
        row.className = 'cat-row grid grid-cols-2 gap-2';
        row.innerHTML = `<input class="input text-sm py-1.5" name="cat_name" placeholder="Mantenimiento" /><input class="input text-sm py-1.5" name="cat_amount" type="number" step="0.01" placeholder="5000000" />`;
        list.appendChild(row);
    });
}
