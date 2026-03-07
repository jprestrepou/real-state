/**
 * Budgets Page — Table view with filters and traffic-light tracking.
 */
import { api } from '../api.js';
import { formatCurrency, formatPercent, semaphoreClass } from '../utils/formatters.js';
import { showToast, showModal } from '../components/modal.js';

export async function renderBudgets(container) {
  // Initial UI structure with filters
  container.innerHTML = `
    <div class="flex flex-col gap-6 animate-fade-in">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-surface-900">Gestión de Presupuestos</h3>
        <button id="add-budget-btn" class="btn-primary"><i data-lucide="plus" class="w-4 h-4"></i> Nuevo Presupuesto</button>
      </div>

      <!-- Filters -->
      <div class="glass-card-static p-4 flex flex-wrap items-end gap-4">
        <div class="flex-1 min-w-[200px]">
          <label class="label text-xs">Propiedad</label>
          <select id="filter-property" class="select text-sm">
            <option value="">Todas las propiedades</option>
            <option value="GENERAL">Gastos Generales</option>
          </select>
        </div>
        <div class="w-32">
          <label class="label text-xs">Año</label>
          <input type="number" id="filter-year" class="input text-sm" value="${new Date().getFullYear()}" />
        </div>
        <div class="w-32">
          <label class="label text-xs">Mes</label>
          <select id="filter-month" class="select text-sm">
            <option value="">Todos</option>
            ${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">${new Date(0, i).toLocaleString('es', { month: 'long' })}</option>`).join('')}
          </select>
        </div>
        <div class="w-40">
          <label class="label text-xs">Estado</label>
          <select id="filter-status" class="select text-sm">
            <option value="">Cualquier estado</option>
            <option value="Verde">Verde (Saludable)</option>
            <option value="Amarillo">Amarillo (Alerta)</option>
            <option value="Rojo">Rojo (Excedido)</option>
          </select>
        </div>
        <button id="apply-filters" class="btn-ghost px-4 h-10 border border-surface-200 hover:bg-surface-50">
          <i data-lucide="filter" class="w-4 h-4 mr-2"></i> Filtrar
        </button>
      </div>

      <!-- Table Container -->
      <div id="budgets-table-container" class="glass-card-static overflow-hidden">
        <div class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  const propertiesData = await api.get('/properties?limit=100');
  const properties = propertiesData.items || [];

  // Fill property filter
  const propFilter = document.getElementById('filter-property');
  properties.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    propFilter.appendChild(opt);
  });

  // Load budgets function
  const loadContent = async () => {
    const tableContainer = document.getElementById('budgets-table-container');
    const property_id = document.getElementById('filter-property').value;
    const year = document.getElementById('filter-year').value;
    const month = document.getElementById('filter-month').value;
    const status = document.getElementById('filter-status').value;

    let query = `/budgets?limit=100`;
    if (property_id) query += `&property_id=${property_id}`;
    if (year) query += `&year=${year}`;
    if (month) query += `&month=${month}`;

    try {
      const budgets = await api.get(query);

      // Filter by status if selected
      let filtered = budgets;
      if (status) {
        filtered = budgets.filter(b => b.semaphore === status);
      }

      renderTable(tableContainer, filtered, properties);
    } catch (err) {
      tableContainer.innerHTML = `<div class="p-8 text-center text-rose-500">Error al cargar presupuestos: ${err.message}</div>`;
    }
  };

  document.getElementById('apply-filters').addEventListener('click', loadContent);
  document.getElementById('add-budget-btn').addEventListener('click', () => openBudgetModal(properties, loadContent));

  // Initial load
  loadContent();
}

function renderTable(container, budgets, properties) {
  if (!budgets.length) {
    container.innerHTML = `<div class="py-20 text-center text-surface-400">No se encontraron presupuestos con los filtros seleccionados.</div>`;
    return;
  }

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Propiedad</th>
          <th>Periodo</th>
          <th>Estado</th>
          <th>Presupuesto</th>
          <th>Ejecutado</th>
          <th>% Ejecución</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${budgets.map(b => {
    const prop = properties.find(p => p.id === b.property_id);
    const propName = b.property_id === (properties.find(p => p.name === 'Gastos Generales')?.id || 'GENERAL') ? 'Gastos Generales' : (prop ? prop.name : 'Unidad Borrada');
    return `
          <tr class="hover:bg-surface-50 transition-colors">
            <td>
              <div class="font-semibold text-surface-900">${propName}</div>
              <div class="text-[10px] text-surface-400 italic">${b.property_id.slice(0, 8)}...</div>
            </td>
            <td>
              <span class="text-sm font-medium text-surface-700">${b.year} - ${new Date(0, b.month - 1).toLocaleString('es', { month: 'short' }).toUpperCase()}</span>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <span class="semaphore ${semaphoreClass(b.semaphore)}"></span>
                <span class="text-xs font-semibold ${b.semaphore === 'Verde' ? 'text-green-600' : b.semaphore === 'Amarillo' ? 'text-amber-600' : 'text-red-600'}">${b.semaphore}</span>
              </div>
            </td>
            <td class="text-sm font-medium text-surface-900">${formatCurrency(b.total_budget)}</td>
            <td class="text-sm font-medium text-surface-600">${formatCurrency(b.total_executed)}</td>
            <td class="w-48">
              <div class="flex items-center gap-3">
                <div class="flex-1 bg-surface-100 rounded-full h-1.5 overflow-hidden">
                  <div class="h-full rounded-full ${b.semaphore === 'Verde' ? 'bg-green-500' : b.semaphore === 'Amarillo' ? 'bg-amber-500' : 'bg-red-500'}" 
                    style="width: ${Math.min(b.execution_pct, 100)}%"></div>
                </div>
                <span class="text-xs font-bold w-10">${formatPercent(b.execution_pct)}</span>
              </div>
            </td>
            <td>
              <div class="flex justify-end gap-2">
                <a href="#/budget-report?property_id=${b.property_id}&year=${b.year}&month=${b.month}" 
                  class="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition" title="Ver Reporte Detallado">
                  <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
                </a>
                <button class="duplicate-btn p-2 rounded-lg hover:bg-surface-100 text-surface-500 transition" 
                  data-id="${b.id}" title="Duplicar Presupuesto">
                  <i data-lucide="copy" class="w-4 h-4"></i>
                </button>
                <button class="delete-budget-btn p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition" 
                  data-id="${b.id}" title="Eliminar">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
  }).join('')}
      </tbody>
    </table>
  `;

  if (window.lucide) lucide.createIcons();

  // Attach event listeners
  container.querySelectorAll('.duplicate-btn').forEach(btn => {
    btn.addEventListener('click', () => openDuplicateModal(btn.dataset.id, () => renderBudgets(container.parentElement.parentElement)));
  });

  container.querySelectorAll('.delete-budget-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      showModal('¿Eliminar Presupuesto?', `Esta acción borrará el presupuesto de este periodo y sus categorías.`, {
        confirmText: 'Eliminar',
        onConfirm: async () => {
          await api.delete(`/budgets/${btn.dataset.id}`);
          showToast('Presupuesto eliminado', 'success');
          // Reload through the flow
          document.getElementById('apply-filters').click();
        }
      });
    });
  });
}

function openBudgetModal(properties, onSuccess) {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  const propertyOptions = properties.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

  showModal('Nuevo Presupuesto', `
    <form id="bf" class="space-y-4">
      <div>
        <label class="label">Propiedad *</label>
        <select class="select" name="property_id" required>
          <option value="GENERAL">Gastos Generales (Distribuible)</option>
          ${propertyOptions}
        </select>
      </div>
      <div class="grid grid-cols-3 gap-4 items-end">
        <div><label class="label">Año *</label><input class="input" name="year" type="number" value="${year}" required /></div>
        <div><label class="label">Mes *</label><input class="input" name="month" type="number" min="1" max="12" value="${month}" required /></div>
        <div><label class="label">Presupuesto *</label><input class="input" name="total_budget" type="number" step="0.01" required /></div>
      </div>
      <div class="flex items-center gap-2 bg-primary-50 p-3 rounded-xl border border-primary-100">
        <input type="checkbox" id="is_annual" name="is_annual" class="w-4 h-4 rounded text-primary-600" />
        <div class="flex-1">
          <label for="is_annual" class="text-sm font-bold text-primary-900 cursor-pointer">Presupuesto Anualizado</label>
          <p class="text-[10px] text-primary-600">Se crearán 12 registros dividiendo el total automáticamente.</p>
        </div>
      </div>
      <div id="cats-container" class="pt-4 border-t border-surface-100">
        <div class="flex items-center justify-between mb-2">
          <label class="label mb-0">Categorías Detalladas</label>
          <button type="button" id="add-cat-btn" class="text-xs text-primary-600 font-bold hover:underline">+ Agregar</button>
        </div>
        <div class="space-y-2 max-h-40 overflow-y-auto pr-2" id="cats-list"></div>
      </div>
    </form>
  `, {
    confirmText: 'Crear Presupuesto',
    onConfirm: async () => {
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
      showToast(payload.is_annual ? 'Ciclo anual creado' : 'Presupuesto creado', 'success');
      if (onSuccess) onSuccess();
    }
  });

  document.getElementById('add-cat-btn').addEventListener('click', () => {
    const list = document.getElementById('cats-list');
    const row = document.createElement('div');
    row.className = 'cat-row flex gap-2 items-center animate-fade-in';
    row.innerHTML = `
      <input class="input text-sm py-1.5 flex-1" name="cat_name" placeholder="Ej: Mantenimiento" />
      <input class="input text-sm py-1.5 w-24" name="cat_amount" type="number" step="0.01" placeholder="$" />
      <div class="flex items-center gap-1">
        <input type="checkbox" name="cat_dist" class="w-4 h-4" />
        <span class="text-[10px] text-surface-400">Dist.</span>
      </div>
      <button type="button" class="p-1.5 text-rose-400 hover:text-rose-600" onclick="this.parentElement.remove()"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
    `;
    list.appendChild(row);
    if (window.lucide) lucide.createIcons();
  });
}

function openDuplicateModal(budgetId, onSuccess) {
  const year = new Date().getFullYear();
  showModal('Duplicar Periodo', `
    <form id="df" class="space-y-4">
      <div class="bg-indigo-50 p-3 rounded-xl border border-indigo-100 mb-4 flex gap-3 items-center">
        <i data-lucide="copy" class="w-5 h-5 text-indigo-600"></i>
        <p class="text-xs text-indigo-700">Copia este presupuesto a un nuevo mes/año con un ajuste opcional.</p>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Año Destino *</label><input class="input" name="target_year" type="number" value="${year}" required /></div>
        <div><label class="label">Mes Destino *</label><input class="input" name="target_month" type="number" min="1" max="12" value="1" required /></div>
      </div>
      <div>
        <label class="label">Incremento Porcentual (%)</label>
        <div class="relative">
          <input class="input pl-8" name="percentage_increase" type="number" step="0.1" value="0" />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 font-bold">%</span>
        </div>
      </div>
    </form>
  `, {
    confirmText: 'Procesar Duplicación',
    onConfirm: async () => {
      const fd = new FormData(document.getElementById('df'));
      const payload = {
        target_year: parseInt(fd.get('target_year')),
        target_month: parseInt(fd.get('target_month')),
        percentage_increase: parseFloat(fd.get('percentage_increase') || 0)
      };
      await api.post(`/budgets/${budgetId}/duplicate`, payload);
      showToast('Presupuesto duplicado', 'success');
      if (onSuccess) onSuccess();
    }
  });
  if (window.lucide) lucide.createIcons();
}
