/**
 * Budgets Page — traffic-light budget tracking.
 */
import { api } from '../api.js';
import { formatCurrency, formatPercent, semaphoreClass } from '../utils/formatters.js';
import { showToast, showModal } from '../components/modal.js';

export async function renderBudgets(container) {
  const [budgets, propertiesData] = await Promise.all([
    api.get('/budgets'),
    api.get('/properties?limit=100')
  ]);

  const properties = propertiesData.items || [];

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
              <h4 class="font-bold text-surface-900">Año ${b.year} - Mes ${b.month}</h4>
              <p class="text-xs text-surface-400">Propiedad: ${b.property_id.slice(0, 8)}...</p>
              <div class="flex gap-2 mt-2">
                <a href="#/budget-report?property_id=${b.property_id}&year=${b.year}&month=${b.month}" class="text-xs text-primary-600 hover:underline inline-block">Ver Reporte</a>
                <button class="duplicate-btn text-[10px] bg-slate-100 px-2 py-0.5 rounded hover:bg-slate-200 transition" data-id="${b.id}">Duplicar</button>
              </div>
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
  
  document.getElementById('add-budget-btn').addEventListener('click', () => openBudgetModal(properties));
  
  document.querySelectorAll('.duplicate-btn').forEach(btn => {
    btn.addEventListener('click', () => openDuplicateModal(btn.dataset.id));
  });
}

function openBudgetModal(properties) {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  
  const propertyOptions = properties.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  
  showModal('Nuevo Presupuesto', `<form id="bf" class="space-y-4">
    <div>
      <label class="label">Propiedad *</label>
      <select class="select" name="property_id" required>
        <option value="GENERAL">Gastos Generales (Distribuible)</option>
        ${propertyOptions}
      </select>
    </div>
    <div class="grid grid-cols-3 gap-4">
      <div><label class="label">Año *</label><input class="input" name="year" type="number" value="${year}" required /></div>
      <div><label class="label">Mes *</label><input class="input" name="month" type="number" min="1" max="12" value="${month}" required /></div>
      <div><label class="label">Total Presupuestado *</label><input class="input" name="total_budget" type="number" step="0.01" required /></div>
    </div>
    <div class="flex items-center gap-2 bg-primary-50 p-3 rounded-xl">
      <input type="checkbox" id="is_annual" name="is_annual" class="w-4 h-4 rounded text-primary-600" />
      <div class="flex-1">
        <label for="is_annual" class="text-sm font-semibold text-primary-900 cursor-pointer">Presupuesto Anualizado</label>
        <p class="text-[10px] text-primary-600">Se crearán 12 registros mensuales dividiendo el total automáticamente.</p>
      </div>
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
        const d = r.querySelector('[name="cat_dist"]').checked;
        if (n && a) cats.push({ category_name: n, budgeted_amount: parseFloat(a), is_distributable: d });
      });
      
      const payload = { 
        property_id: fd.get('property_id'), 
        year: parseInt(fd.get('year')), 
        month: parseInt(fd.get('month')), 
        total_budget: parseFloat(fd.get('total_budget')), 
        categories: cats,
        is_annual: document.getElementById('is_annual').checked
      };

      await api.post('/budgets', payload);
      showToast(payload.is_annual ? 'Presupuestos anuales creados' : 'Presupuesto creado', 'success');
      await renderBudgets(document.getElementById('page-content'));
    }
  });

  if (window.lucide) lucide.createIcons();
  
  document.getElementById('add-cat-btn').addEventListener('click', () => {
    const list = document.getElementById('cats-list');
    const row = document.createElement('div');
    row.className = 'cat-row flex gap-2 items-center';
    row.innerHTML = `
      <input class="input text-sm py-1.5 flex-1" name="cat_name" placeholder="Mantenimiento" />
      <input class="input text-sm py-1.5 w-32" name="cat_amount" type="number" step="0.01" placeholder="Monto" />
      <div class="flex items-center gap-1">
        <input type="checkbox" name="cat_dist" class="w-4 h-4" />
        <span class="text-[10px] text-surface-500">Distribuir</span>
      </div>
    `;
    list.appendChild(row);
  });
}

function openDuplicateModal(budgetId) {
  const year = new Date().getFullYear();
  
  showModal('Duplicar Presupuesto', `
    <form id="df" class="space-y-4">
      <p class="text-sm text-surface-500">Duplica los valores de este presupuesto para un nuevo periodo, aplicando un incremento opcional.</p>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Año Destino *</label><input class="input" name="target_year" type="number" value="${year}" required /></div>
        <div><label class="label">Mes Destino *</label><input class="input" name="target_month" type="number" min="1" max="12" value="1" required /></div>
      </div>
      <div>
        <label class="label">Incremento Porcentual (%)</label>
        <input class="input" name="percentage_increase" type="number" step="0.1" value="0" />
        <p class="text-[10px] text-surface-400 mt-1">Ej: 5.5 para aumentar los valores en 5.5%</p>
      </div>
    </form>
  `, {
    confirmText: 'Duplicar',
    onConfirm: async () => {
      const fd = new FormData(document.getElementById('df'));
      const payload = {
        target_year: parseInt(fd.get('target_year')),
        target_month: parseInt(fd.get('target_month')),
        percentage_increase: parseFloat(fd.get('percentage_increase') || 0)
      };
      await api.post(`/budgets/${budgetId}/duplicate`, payload);
      showToast('Presupuesto duplicado exitosamente', 'success');
      await renderBudgets(document.getElementById('page-content'));
    }
  });
}
