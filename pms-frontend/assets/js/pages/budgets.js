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
      <div class="flex flex-wrap items-center gap-4 p-4 glass-card-static !rounded-2xl border-white/40 shadow-sm">
        <div class="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm flex-1 min-w-[200px]">
          <i data-lucide="home" class="w-3.5 h-3.5 text-surface-400"></i>
          <select id="filter-property" class="bg-transparent text-sm font-medium focus:outline-none w-full appearance-none">
            <option value="">Todas las propiedades</option>
            <option value="GENERAL">Gastos Generales (Distribuible)</option>
          </select>
        </div>
        
        <div class="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm w-32">
          <i data-lucide="calendar" class="w-3.5 h-3.5 text-surface-400"></i>
          <input type="number" id="filter-year" class="bg-transparent text-sm font-medium focus:outline-none w-full" value="${new Date().getFullYear()}" />
        </div>

        <div class="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm w-40">
          <i data-lucide="calendar-days" class="w-3.5 h-3.5 text-surface-400"></i>
          <select id="filter-month" class="bg-transparent text-sm font-medium focus:outline-none w-full appearance-none">
            <option value="">Todos los meses</option>
            ${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">${new Date(0, i).toLocaleString('es', { month: 'long' })}</option>`).join('')}
          </select>
        </div>

        <div class="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm w-44">
          <i data-lucide="activity" class="w-3.5 h-3.5 text-surface-400"></i>
          <select id="filter-status" class="bg-transparent text-sm font-medium focus:outline-none w-full appearance-none">
            <option value="">Cualquier estado</option>
            <option value="Verde">Verde (Saludable)</option>
            <option value="Amarillo">Amarillo (Alerta)</option>
            <option value="Rojo">Rojo (Excedido)</option>
          </select>
        </div>

        <button id="apply-filters" class="btn-primary !rounded-xl shadow-lg shadow-primary-500/10 py-2 px-4 flex items-center gap-2">
          <i data-lucide="search" class="w-4 h-4"></i> Buscar
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

  const [propertiesData, generalPropId] = await Promise.all([
    api.get('/properties?limit=100'),
    api.get('/properties?limit=1').then(res => res.items.find(p => p.name === 'Gastos Generales')?.id || 'GENERAL')
  ]);
  const properties = propertiesData.items || [];

  // Fill property filter
  const propFilter = document.getElementById('filter-property');
  properties.filter(p => p.id !== generalPropId).forEach(p => {
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

      renderTable(tableContainer, filtered, properties, generalPropId, loadContent);
    } catch (err) {
      tableContainer.innerHTML = `<div class="p-8 text-center text-rose-500">Error al cargar presupuestos: ${err.message}</div>`;
    }
  };

  document.getElementById('apply-filters').addEventListener('click', loadContent);
  document.getElementById('add-budget-btn').addEventListener('click', () => openBudgetModal(properties, null, loadContent));

  // Initial load
  loadContent();
}

function renderTable(container, budgets, properties, generalPropId, onReload, sortField = '', sortDir = 1) {
  if (!budgets.length) {
    container.innerHTML = `<div class="py-20 text-center text-surface-400">No se encontraron presupuestos con los filtros seleccionados.</div>`;
    return;
  }

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="property">
            Propiedad ${sortField === 'property' ? `<i data-lucide="chevron-${sortDir === 1 ? 'up' : 'down'}" class="w-3 h-3 inline ml-1"></i>` : '<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="date">
            Periodo ${sortField === 'date' ? `<i data-lucide="chevron-${sortDir === 1 ? 'up' : 'down'}" class="w-3 h-3 inline ml-1"></i>` : '<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="status">
            Estado ${sortField === 'status' ? `<i data-lucide="chevron-${sortDir === 1 ? 'up' : 'down'}" class="w-3 h-3 inline ml-1"></i>` : '<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="budget">
            Presupuesto ${sortField === 'budget' ? `<i data-lucide="chevron-${sortDir === 1 ? 'up' : 'down'}" class="w-3 h-3 inline ml-1"></i>` : '<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th>Ejecutado</th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="pct">
            % Ejecución ${sortField === 'pct' ? `<i data-lucide="chevron-${sortDir === 1 ? 'up' : 'down'}" class="w-3 h-3 inline ml-1"></i>` : '<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${budgets.map(b => {
    const prop = properties.find(p => p.id === b.property_id);
    const propName = b.property_id === generalPropId ? 'Gastos Generales' : (prop ? prop.name : 'Unidad Borrada');
    return `
          <tr class="hover:bg-surface-50 transition-colors">
            <td>
              <div class="font-semibold text-surface-900">${propName}</div>
              <div class="text-[10px] text-surface-400 italic">${b.property_id.slice(0, 8)}...</div>
            </td>
            <td>
              <span class="text-sm font-medium text-surface-700">${b.year} - ${new Date(0, b.month - 1).toLocaleString('es', { month: 'short', year: 'numeric' }).toUpperCase()}</span>
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
                <button class="edit-btn p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition" 
                  data-id="${b.id}" title="Editar">
                  <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
                <button class="duplicate-btn p-2 rounded-lg hover:bg-surface-100 text-surface-500 transition" 
                  data-id="${b.id}" title="Duplicar">
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

  // Sorting logic
  container.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (sortField === field) sortDir *= -1;
      else { sortField = field; sortDir = 1; }

      const sorted = [...budgets].sort((a, b) => {
        let valA, valB;
        if (field === 'property') {
          valA = properties.find(p => p.id === a.property_id)?.name || '';
          valB = properties.find(p => p.id === b.property_id)?.name || '';
        } else if (field === 'date') {
          valA = a.year * 100 + a.month;
          valB = b.year * 100 + b.month;
        } else if (field === 'status') {
          valA = a.semaphore; valB = b.semaphore;
        } else if (field === 'budget') {
          valA = a.total_budget; valB = b.total_budget;
        } else if (field === 'pct') {
          valA = a.execution_pct; valB = b.execution_pct;
        }
        return (valA > valB ? 1 : -1) * sortDir;
      });
      renderTable(container, sorted, properties, generalPropId, onReload, field, sortDir);
    });
  });

  // Attach event listeners
  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const budget = budgets.find(x => x.id === btn.dataset.id);
      openBudgetModal(properties, budget, onReload);
    });
  });

  container.querySelectorAll('.duplicate-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const budget = budgets.find(x => x.id === btn.dataset.id);
      openDuplicateModal(properties, budget, onReload);
    });
  });

  container.querySelectorAll('.delete-budget-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      showModal('¿Eliminar Presupuesto?', `Esta acción borrará el presupuesto de este periodo y sus categorías.`, {
        confirmText: 'Eliminar',
        onConfirm: async () => {
          await api.delete(`/budgets/${btn.dataset.id}`);
          showToast('Presupuesto eliminado', 'success');
          onReload();
        }
      });
    });
  });
}

function openBudgetModal(properties, existingBudget = null, onSuccess) {
  const isEdit = !!existingBudget;
  const year = isEdit ? existingBudget.year : new Date().getFullYear();
  const month = isEdit ? existingBudget.month : new Date().getMonth() + 1;

  const propertyOptions = properties.map(p => `<option value="${p.id}" ${isEdit && existingBudget.property_id === p.id ? 'selected' : ''}>${p.name}</option>`).join('');

  showModal(isEdit ? 'Editar Presupuesto' : 'Nuevo Presupuesto', `
    <form id="bf" class="space-y-4">
      <div class="${isEdit ? 'pointer-events-none opacity-60' : ''}">
        <label class="label">Propiedad *</label>
        <select class="select" name="property_id" required>
          <option value="GENERAL" ${isEdit && existingBudget.property_id === 'GENERAL' ? 'selected' : ''}>Gastos Generales (Distribuible)</option>
          ${propertyOptions}
        </select>
        ${isEdit ? '<p class="text-[10px] text-surface-400 mt-1">La propiedad y periodo no se pueden cambiar. Duplique el presupuesto si lo desea en otro lugar.</p>' : ''}
      </div>
      <div class="grid grid-cols-3 gap-4 items-end ${isEdit ? 'pointer-events-none opacity-60' : ''}">
        <div><label class="label">Año *</label><input class="input" name="year" type="number" value="${year}" required /></div>
        <div><label class="label">Mes *</label><input class="input" name="month" type="number" min="1" max="12" value="${month}" required /></div>
        <div id="total-budget-container">
           <label class="label">Presupuesto *</label>
           <input class="input" name="total_budget" id="total_budget_input" type="number" step="0.01" value="${isEdit ? existingBudget.total_budget : ''}" ${isEdit && existingBudget.auto_calculate_total ? 'disabled' : ''} />
        </div>
      </div>
      <div class="flex items-center gap-2 bg-primary-50 p-3 rounded-xl border border-primary-100">
        <input type="checkbox" id="auto_calculate_total" name="auto_calculate_total" class="w-4 h-4 rounded text-primary-600" ${isEdit && existingBudget.auto_calculate_total ? 'checked' : ''} />
        <div class="flex-1">
          <label for="auto_calculate_total" class="text-sm font-bold text-primary-900 cursor-pointer">Autocalcular total</label>
          <p class="text-[10px] text-primary-600">El total será la suma de los montos de cada categoría configurada.</p>
        </div>
      </div>

      ${!isEdit ? `
      <div class="flex items-center gap-2 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
        <input type="checkbox" id="is_annual" name="is_annual" class="w-4 h-4 rounded text-indigo-600" />
        <div class="flex-1">
          <label for="is_annual" class="text-sm font-bold text-indigo-900 cursor-pointer">Presupuesto Anualizado</label>
          <p class="text-[10px] text-indigo-600">Se crearán 12 presupuestos (uno por mes) dividiendo los montos.</p>
        </div>
      </div>
      ` : ''}
      <div id="cats-container" class="pt-4 border-t border-surface-100">
        <div class="flex items-center justify-between mb-2">
          <label class="label mb-0">Categorías Detalladas</label>
          <button type="button" id="add-cat-btn" class="text-xs text-primary-600 font-bold hover:underline">+ Agregar</button>
        </div>
        <div class="space-y-2 max-h-48 overflow-y-auto pr-2" id="cats-list">
          ${isEdit ? existingBudget.categories.map(c => renderCatRow(c.category_name, c.budgeted_amount, c.is_distributable)).join('') : ''}
        </div>
      </div>
      <div>
        <label class="label">Notas</label>
        <textarea class="textarea text-sm" name="notes" placeholder="Opcional...">${isEdit ? (existingBudget.notes || '') : ''}</textarea>
      </div>
    </form>
  `, {
    confirmText: isEdit ? 'Guardar Cambios' : 'Crear Presupuesto',
    onConfirm: async () => {
      const form = document.getElementById('bf');
      const fd = new FormData(form);
      const is_auto = document.getElementById('auto_calculate_total').checked;

      const cats = [];
      form.querySelectorAll('.cat-row').forEach(r => {
        const n = r.querySelector('[name="cat_name"]').value;
        const a = r.querySelector('[name="cat_amount"]').value;
        const d = r.querySelector('[name="cat_dist"]').checked;
        if (n && a) cats.push({ category_name: n, budgeted_amount: parseFloat(a), is_distributable: d });
      });

      const payload = {
        property_id: fd.get('property_id'),
        year: parseInt(fd.get('year')),
        month: parseInt(fd.get('month')),
        total_budget: is_auto ? 0 : (parseFloat(fd.get('total_budget')) || 0),
        categories: cats,
        auto_calculate_total: is_auto,
        notes: fd.get('notes')
      };

      if (!isEdit) {
        payload.is_annual = document.getElementById('is_annual')?.checked || false;
        await api.post('/budgets', payload);
        showToast('Presupuesto creado', 'success');
      } else {
        await api.put(`/budgets/${existingBudget.id}`, payload);
        showToast('Presupuesto actualizado', 'success');
      }

      if (onSuccess) onSuccess();
    }
  });

  // Handle auto-calculate toggle
  const checkAuto = document.getElementById('auto_calculate_total');
  const inputTotal = document.getElementById('total_budget_input');
  checkAuto.addEventListener('change', () => {
    inputTotal.disabled = checkAuto.checked;
    if (checkAuto.checked) {
      updateTotalFromCats();
    }
  });

  const updateTotalFromCats = () => {
    if (!checkAuto.checked) return;
    let sum = 0;
    document.querySelectorAll('.cat-row').forEach(r => {
      sum += parseFloat(r.querySelector('[name="cat_amount"]').value || 0);
    });
    inputTotal.value = sum;
  };

  document.getElementById('add-cat-btn').addEventListener('click', () => {
    const list = document.getElementById('cats-list');
    const temp = document.createElement('div');
    temp.innerHTML = renderCatRow();
    const row = temp.firstElementChild;
    list.appendChild(row);
    if (window.lucide) lucide.createIcons();

    // Auto update if needed
    row.querySelector('[name="cat_amount"]').addEventListener('input', updateTotalFromCats);
  });

  // Attach input listeners to initial rows
  document.querySelectorAll('.cat-row [name="cat_amount"]').forEach(inp => {
    inp.addEventListener('input', updateTotalFromCats);
  });

  if (window.lucide) lucide.createIcons();
}

function renderCatRow(name = '', amount = '', dist = false) {
  return `
    <div class="cat-row flex gap-2 items-center animate-fade-in group">
      <input class="input text-sm py-1.5 flex-1" name="cat_name" value="${name}" placeholder="Ej: Mantenimiento" />
      <input class="input text-sm py-1.5 w-40" name="cat_amount" type="number" step="0.01" value="${amount}" placeholder="$" />
      <div class="flex items-center gap-1">
        <input type="checkbox" name="cat_dist" class="w-4 h-4" ${dist ? 'checked' : ''} />
        <span class="text-[10px] text-surface-400">Dist.</span>
      </div>
      <button type="button" class="p-1.5 text-rose-300 hover:text-rose-600 transition" onclick="this.parentElement.remove(); document.dispatchEvent(new Event('catChange'));">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>
  `;
}

// Global listener for cat deletion to update total
document.addEventListener('catChange', () => {
  const checkAuto = document.getElementById('auto_calculate_total');
  if (checkAuto && checkAuto.checked) {
    let sum = 0;
    document.querySelectorAll('.cat-row').forEach(r => {
      sum += parseFloat(r.querySelector('[name="cat_amount"]').value || 0);
    });
    const inputTotal = document.getElementById('total_budget_input');
    if (inputTotal) inputTotal.value = sum;
  }
});

function openDuplicateModal(properties, sourceBudget, onSuccess) {
  const year = new Date().getFullYear();
  const propertyOptions = properties.map(p => `<option value="${p.id}" ${sourceBudget.property_id === p.id ? 'selected' : ''}>${p.name}</option>`).join('');

  showModal('Duplicar Periodo', `
    <form id="df" class="space-y-4">
      <div class="bg-indigo-50 p-3 rounded-xl border border-indigo-100 mb-4 flex gap-3 items-center">
        <i data-lucide="copy" class="w-5 h-5 text-indigo-600"></i>
        <p class="text-xs text-indigo-700">Copia este presupuesto a un nuevo mes/año con un ajuste opcional.</p>
      </div>
      
      <div>
        <label class="label">Propiedad Destino *</label>
        <select class="select" name="target_property_id" required>
          <option value="GENERAL" ${sourceBudget.property_id === 'GENERAL' ? 'selected' : ''}>Gastos Generales (Distribuible)</option>
          ${propertyOptions}
        </select>
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
        target_property_id: fd.get('target_property_id'),
        percentage_increase: parseFloat(fd.get('percentage_increase') || 0)
      };
      await api.post(`/budgets/${sourceBudget.id}/duplicate`, payload);
      showToast('Presupuesto duplicado', 'success');
      if (onSuccess) onSuccess();
    }
  });
  if (window.lucide) lucide.createIcons();
}
