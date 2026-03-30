/**
 * Budgets Page — Table view with filters and traffic-light tracking.
 */
import { api } from '../api.js';
import { formatCurrency, formatPercent, formatDate, semaphoreClass, statusBadge } from '../utils/formatters.js';
import { parseCurrencyValue } from '../utils/currency-input.js';
import { showToast, showModal, closeModal } from '../components/modal.js';

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

  const [propertiesData, accountsData] = await Promise.all([
    api.get('/properties?limit=100'),
    api.get('/accounts')
  ]);
  const properties = propertiesData.items || [];
  const accounts = accountsData || [];
  const generalPropId = null; // Backend now uses null for General

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

      renderTable(tableContainer, filtered, properties, accounts, generalPropId, loadContent);
    } catch (err) {
      tableContainer.innerHTML = `<div class="p-8 text-center text-rose-500">Error al cargar presupuestos: ${err.message}</div>`;
    }
  };

  document.getElementById('apply-filters').addEventListener('click', loadContent);
  document.getElementById('add-budget-btn').addEventListener('click', () => openBudgetModal(properties, accounts, null, loadContent));
  
  // Add Export to Excel Button next to filters
  const filtersContainer = document.querySelector('.glass-card-static.flex.flex-wrap');
  const exportBtn = document.createElement('button');
  exportBtn.className = 'btn-secondary !rounded-xl shadow-sm py-2 px-4 flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 ml-auto';
  exportBtn.innerHTML = '<i data-lucide="download" class="w-4 h-4"></i> Exportar a Excel';
  exportBtn.addEventListener('click', () => {
    const prop_id = document.getElementById('filter-property').value;
    const year = document.getElementById('filter-year').value;
    let url = `${api.baseURL}/budgets/export/excel`;
    const params = new URLSearchParams();
    if (prop_id) params.append('property_id', prop_id === 'GENERAL' ? '' : prop_id);
    if (year) {
       params.append('start_year', parseInt(year) - 2); // default export recent years
       params.append('end_year', parseInt(year) + 2);
    }
    if ([...params].length) url += '?' + params.toString();
    
    // Auth token
    const token = localStorage.getItem('token');
    fetch(url, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} })
    .then(async res => {
      if (!res.ok) throw new Error('Error limitando exportación');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Presupuestos_${year || 'Todos'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Exportación exitosa', 'success');
    }).catch(err => {
      showToast('Error exportando Excel', 'error');
      console.error(err);
    });
  });
  filtersContainer.appendChild(exportBtn);

  // Initial load
  loadContent();
}

function renderTable(container, budgets, properties, accounts, generalPropId, onReload, sortField = '', sortDir = 1) {
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
    const propName = b.property_id === null ? 'Gastos Generales' : (prop ? prop.name : 'Unidad Borrada');
    return `
          <tr class="hover:bg-surface-50 transition-colors">
            <td>
              <div class="font-semibold text-surface-900">${propName}</div>
              <div class="text-[10px] text-surface-400 italic">${b.property_id ? b.property_id.slice(0, 8) + '...' : 'General'}</div>
            </td>
            <td>
              <div class="flex items-center gap-1">
                <span class="text-sm font-medium text-surface-700">${b.year} - ${new Date(0, b.month - 1).toLocaleString('es', { month: 'short', year: 'numeric' }).toUpperCase()}</span>
                ${b.is_closed ? '<i data-lucide="lock" class="w-3 h-3 text-surface-400" title="Presupuesto Cerrado"></i>' : ''}
              </div>
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
                <span class="text-xs font-bold w-14 text-right">${formatPercent(b.execution_pct)}</span>
              </div>
            </td>
            <td>
              <div class="flex justify-end gap-1">
                <button class="projects-btn p-2 rounded-lg hover:bg-teal-50 text-teal-600 transition" 
                  data-id="${b.id}" title="Proyectos y Cotizaciones">
                  <i data-lucide="folder-kanban" class="w-4 h-4"></i>
                </button>

                <a href="#/budget-report?property_id=${b.property_id}&year=${b.year}&month=${b.month}" 
                  class="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition" title="Ver Reporte Detallado">
                  <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
                </a>
                
                ${b.period_type === 'Anual' ? `
                <button class="breakdown-btn p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition" 
                  data-id="${b.id}" title="Ver Desglose Mensual">
                  <i data-lucide="calendar-days" class="w-4 h-4"></i>
                </button>
                ` : ''}
                
                <button class="export-pdf-btn p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition" 
                  data-id="${b.id}" data-ym="${b.year}_${b.month}" title="Exportar PDF de Asamblea">
                  <i data-lucide="file-text" class="w-4 h-4"></i>
                </button>

                <button class="history-btn p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition" 
                  data-id="${b.id}" title="Ver Historial de Cambios">
                  <i data-lucide="history" class="w-4 h-4"></i>
                </button>
                
                ${!b.is_closed ? `
                <button class="close-budget-btn p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition" 
                  data-id="${b.id}" title="Cerrar Mes (Congelar Distribución)">
                  <i data-lucide="lock" class="w-4 h-4"></i>
                </button>
                <button class="edit-btn p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition" 
                  data-id="${b.id}" title="Editar">
                  <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
                ` : ''}
                
                <button class="duplicate-btn p-2 rounded-lg hover:bg-surface-100 text-surface-500 transition" 
                  data-id="${b.id}" title="Duplicar">
                  <i data-lucide="copy" class="w-4 h-4"></i>
                </button>
                
                ${!b.is_closed ? `
                <button class="delete-budget-btn p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition" 
                  data-id="${b.id}" title="Eliminar">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
                ` : ''}
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
      renderTable(container, sorted, properties, accounts, generalPropId, onReload, field, sortDir);
    });
  });

  // Attach event listeners
  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const budget = budgets.find(x => x.id === btn.dataset.id);
      openBudgetModal(properties, accounts, budget, onReload);
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

  container.querySelectorAll('.close-budget-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      showModal('¿Cerrar y Congelar Presupuesto?', `Esta acción calculará y guardará irreversiblemente los porcentajes de distribución de este mes. El presupuesto quedará bloqueado y no podrá ser editado ni eliminado en el futuro.`, {
        confirmText: 'Cerrar Presupuesto',
        onConfirm: async () => {
          try {
            await api.post(`/budgets/${btn.dataset.id}/close`);
            showToast('Presupuesto cerrado exitosamente', 'success');
            onReload();
          } catch (err) {
            showToast(err.message || 'Error al cerrar presupuesto', 'error');
          }
        }
      });
    });
  });

  container.querySelectorAll('.export-pdf-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const budgetId = btn.dataset.id;
      const ym = btn.dataset.ym;
      showToast('Generando PDF...', 'info');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${api.baseURL}/budgets/${budgetId}/export/pdf`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error('Error al generar PDF');
        const blob = await res.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Presupuesto_${ym}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast('PDF generado exitosamente', 'success');
      } catch (err) {
        showToast(err.message || 'Error al exportar PDF', 'error');
      }
    });
  });

  container.querySelectorAll('.history-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const budget = budgets.find(x => x.id === btn.dataset.id);
      openHistoryModal(budget);
    });
  });

  container.querySelectorAll('.projects-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openProjectsPanel(btn.dataset.id, properties);
    });
  });
}

function openHistoryModal(budget) {
  if (!budget.revisions || budget.revisions.length === 0) {
    showModal('Historial de Cambios', '<p class="text-surface-500 py-4 text-center">No hay revisiones registradas para este presupuesto.</p>', { confirmText: 'Cerrar' });
    return;
  }

  const listHtml = budget.revisions.map(rev => {
    return `
      <div class="p-4 bg-surface-50 rounded-xl border border-surface-200 mb-3 animate-fade-in">
        <div class="flex justify-between items-start mb-2">
          <div>
            <span class="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-md border border-primary-100">${new Date(rev.created_at).toLocaleString()}</span>
          </div>
          <span class="text-xs text-surface-500 italic">Usuario ID: ${rev.user_id?.slice(0,8) || 'Sistema'}</span>
        </div>
        <div class="flex items-center gap-3 text-sm font-medium text-surface-700 my-2">
          <span class="text-surface-500 line-through">${formatCurrency(rev.old_amount)}</span>
          <i data-lucide="arrow-right" class="w-4 h-4 text-surface-400"></i>
          <span class="text-emerald-600">${formatCurrency(rev.new_amount)}</span>
        </div>
        ${rev.justification ? `<div class="text-xs text-surface-600 bg-white p-2 border border-surface-200 rounded-lg mt-2 font-medium"><b>Justificación:</b> ${rev.justification}</div>` : ''}
      </div>
    `;
  }).join('');

  showModal('Historial de Modificaciones', `
    <div class="max-h-96 overflow-y-auto pr-2">
      ${listHtml}
    </div>
  `, { confirmText: 'Cerrar' });
  if (window.lucide) lucide.createIcons();
}

function openBudgetModal(properties, accounts, existingBudget = null, onSuccess) {
  const isEdit = !!existingBudget;
  const year = isEdit ? existingBudget.year : new Date().getFullYear();
  const month = isEdit ? existingBudget.month : new Date().getMonth() + 1;

  const propertyOptions = properties.map(p => `<option value="${p.id}" ${isEdit && existingBudget.property_id === p.id ? 'selected' : ''}>${p.name}</option>`).join('');

  showModal(isEdit ? 'Editar Presupuesto' : 'Nuevo Presupuesto', `
    <form id="bf" class="space-y-4">
      <div class="${isEdit ? 'pointer-events-none opacity-60' : ''}">
        <label class="label">Propiedad *</label>
        <select class="select" name="property_id" required>
          <option value="GENERAL" ${isEdit && b_prop === null ? 'selected' : ''}>Gastos Generales (Distribuible)</option>
          ${propertyOptions}
        </select>
        ${isEdit ? '<p class="text-[10px] text-surface-400 mt-1">La propiedad y periodo no se pueden cambiar. Duplique el presupuesto si lo desea en otro lugar.</p>' : ''}
      </div>
      <div class="grid grid-cols-3 gap-4 items-end ${isEdit ? 'pointer-events-none opacity-60' : ''}">
        <div><label class="label">Año *</label><input class="input" name="year" type="number" value="${year}" required /></div>
        <div><label class="label">Mes *</label><input class="input" name="month" type="number" min="1" max="12" value="${month}" required /></div>
        <div id="total-budget-container">
           <label class="label">Presupuesto *</label>
           <input class="input currency-input" name="total_budget" id="total_budget_input" type="text" value="${isEdit ? existingBudget.total_budget : ''}" ${isEdit && existingBudget.auto_calculate_total ? 'disabled' : ''} />
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
          <p class="text-[10px] text-indigo-600">Se creará un único presupuesto anual con desglose mes a mes.</p>
        </div>
      </div>
      ` : ''}
      <div id="cats-container" class="pt-4 border-t border-surface-100">
        <div class="flex items-center justify-between mb-2">
          <label class="label mb-0">Categorías Detalladas</label>
          <button type="button" id="add-cat-btn" class="text-xs text-primary-600 font-bold hover:underline">+ Agregar</button>
        </div>
        <div class="space-y-2 max-h-48 overflow-y-auto pr-2" id="cats-list">
          ${isEdit ? existingBudget.categories.map(c => renderCatRow(c.category_name, c.budgeted_amount, c.is_distributable, c.account_id, accounts)).join('') : ''}
        </div>
      </div>
      ${isEdit ? `
      <div class="bg-amber-50 p-3 rounded-xl border border-amber-100">
        <label class="label text-amber-900">Justificación del Cambio *</label>
        <input class="input bg-white" name="justification" type="text" placeholder="Razón de la modificación (obligatorio si cambia el total)..." />
        <p class="text-[10px] text-amber-700 mt-1">Requerido por auditoría si el monto total cambia.</p>
      </div>
      ` : ''}
      <div>
      </div>
    </form>
  `, {
    maxWidth: '800px',
    confirmText: isEdit ? 'Guardar Cambios' : 'Crear Presupuesto',
    onConfirm: async () => {
      const form = document.getElementById('bf');
      const fd = new FormData(form);
      const is_auto = document.getElementById('auto_calculate_total').checked;

      const cats = [];
      form.querySelectorAll('.cat-row').forEach(r => {
        const n = r.querySelector('[name="cat_name"]').value;
        const a = parseCurrencyValue(r.querySelector('[name="cat_amount"]').value);
        const d = r.querySelector('[name="cat_dist"]').checked;
        const acc = r.querySelector('[name="cat_account"]')?.value;
        if (n && a) cats.push({ category_name: n, budgeted_amount: a, is_distributable: d, account_id: acc || null });
      });

      const payload = {
        property_id: fd.get('property_id') === 'GENERAL' ? null : fd.get('property_id'),
        year: parseInt(fd.get('year')),
        month: parseInt(fd.get('month')),
        total_budget: is_auto ? 0 : (parseCurrencyValue(fd.get('total_budget')) || 0),
        categories: cats,
        auto_calculate_total: is_auto,
        notes: fd.get('notes'),
        justification: fd.get('justification') || ''
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
      sum += parseCurrencyValue(r.querySelector('[name="cat_amount"]').value || '0');
    });
    inputTotal.value = sum;
    inputTotal.dispatchEvent(new Event('input', { bubbles: true }));
  };

  document.getElementById('add-cat-btn').addEventListener('click', () => {
    const list = document.getElementById('cats-list');
    const temp = document.createElement('div');
    temp.innerHTML = renderCatRow('', '', false, null, accounts);
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

function renderCatRow(name = '', amount = '', dist = false, accountId = null, accounts = []) {
  return `
    <div class="cat-row flex gap-2 items-center animate-fade-in group w-full">
      <input class="input text-sm py-1.5 flex-[4]" name="cat_name" value="${name}" placeholder="Categoría" />
      <input class="input currency-input text-sm py-1.5 flex-[2]" name="cat_amount" type="text" value="${amount}" placeholder="$" />
      <select class="select text-xs py-1.5 flex-[3]" name="cat_account">
        <option value="">(Sin Cuenta)</option>
        ${accounts.map(a => `<option value="${a.id}" ${accountId === a.id ? 'selected' : ''}>${a.account_name}</option>`).join('')}
      </select>
      <div class="flex items-center gap-1 w-12">
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
      sum += parseCurrencyValue(r.querySelector('[name="cat_amount"]').value || '0');
    });
    const inputTotal = document.getElementById('total_budget_input');
    if (inputTotal) {
      inputTotal.value = sum;
      inputTotal.dispatchEvent(new Event('input', { bubbles: true }));
    }
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
async function openBreakdownModal(id) {
  try {
    const data = await api.get(`/budgets/${id}/monthly-breakdown`);
    if (!data || !data.months) throw new Error('No se pudo cargar el desglose.');

    let rowsHtml = data.months.map(m => `
      <tr class="hover:bg-surface-50 transition-colors">
        <td class="p-3 text-sm font-medium text-surface-900">${m.month_name}</td>
        <td class="p-3 text-sm text-surface-600 font-mono">${formatCurrency(m.budgeted)}</td>
        <td class="p-3 text-sm text-surface-900 font-mono font-bold">${formatCurrency(m.actual)}</td>
        <td class="p-3 text-center">
            <span class="badge ${m.semaphore === 'Verde' ? 'badge-green' : m.semaphore === 'Amarillo' ? 'badge-amber' : 'badge-red'} text-xs">
              ${m.semaphore}
            </span>
        </td>
        <td class="p-3 text-sm text-right font-bold w-16 font-mono">${formatPercent(m.execution_pct)}</td>
      </tr>
    `).join('');

    showModal('Desglose Mensual: Presupuesto Anual', `
      <div class="overflow-x-auto max-h-[60vh]">
        <table class="w-full text-left border-collapse">
          <thead class="sticky top-0 bg-white z-10 shadow-sm">
            <tr class="bg-surface-50 border-b border-surface-200">
              <th class="p-3 text-xs font-bold text-surface-500 uppercase tracking-wider">Mes</th>
              <th class="p-3 text-xs font-bold text-surface-500 uppercase tracking-wider">Presupuesto</th>
              <th class="p-3 text-xs font-bold text-surface-500 uppercase tracking-wider">Ejecutado</th>
              <th class="p-3 text-xs font-bold text-surface-500 uppercase tracking-wider text-center">Estado</th>
              <th class="p-3 text-xs font-bold text-surface-500 uppercase tracking-wider text-right">% Ejec.</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            ${rowsHtml}
          </tbody>
          <tfoot class="sticky bottom-0 bg-surface-50 border-t border-surface-200 font-bold">
            <tr>
              <td class="p-3 text-sm text-surface-900">TOTAL</td>
              <td class="p-3 text-sm text-surface-900 font-mono">${formatCurrency(data.total_budget)}</td>
              <td class="p-3 text-sm text-primary-600 font-mono">${formatCurrency(data.total_actual)}</td>
              <td class="p-3 text-center">
                <span class="badge ${data.semaphore === 'Verde' ? 'badge-green' : data.semaphore === 'Amarillo' ? 'badge-amber' : 'badge-red'} text-xs">
                  ${data.semaphore}
                </span>
              </td>
              <td class="p-3 text-sm text-right w-16 font-mono">${formatPercent(data.execution_pct)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `, { showCancel: false, confirmText: 'Cerrar', maxWidth: '800px' });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ══════════════════════════════════════════════════════════════
// ══ PROJECTS & QUOTES PANEL ══════════════════════════════════
// ══════════════════════════════════════════════════════════════

const STATUS_COLORS = {
  'Borrador': { bg: 'bg-surface-100', text: 'text-surface-600', dot: 'bg-surface-400' },
  'Cotizando': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  'Aprobado': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'En Ejecución': { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  'Completado': { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  'Cancelado': { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-400' },
};

const PRIORITY_ICONS = {
  'Urgente': '🔴', 'Alta': '🟠', 'Media': '🟡', 'Baja': '🟢'
};

function projectStatusBadge(status) {
  const c = STATUS_COLORS[status] || STATUS_COLORS['Borrador'];
  return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}">
    <span class="w-1.5 h-1.5 rounded-full ${c.dot}"></span>${status}</span>`;
}

async function openProjectsPanel(budgetId, properties) {
  const refreshPanel = async () => {
    try {
      const projects = await api.get(`/budgets/${budgetId}/projects`);
      renderProjectsModal(budgetId, projects, properties);
    } catch (err) {
      showToast('Error cargando proyectos: ' + err.message, 'error');
    }
  };
  await refreshPanel();
}

function renderProjectsModal(budgetId, projects, properties) {
  const projectCards = projects.length ? projects.map(p => {
    const quotesCount = p.quotes?.length || 0;
    const selectedQuote = p.quotes?.find(q => q.is_selected);
    const propName = p.property_id
       ? (properties.find(x => x.id === p.property_id)?.name || 'Propiedad')
       : '';
    return `
    <div class="border border-surface-200 rounded-2xl p-4 hover:shadow-md transition-all duration-200 bg-white/80 group">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-sm">${PRIORITY_ICONS[p.priority] || '⚪'}</span>
            <h4 class="font-bold text-surface-900 text-sm truncate">${p.title}</h4>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            ${projectStatusBadge(p.status)}
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 text-surface-500 font-medium">${p.project_type}</span>
            ${propName ? `<span class="text-[10px] text-surface-400">📍 ${propName}</span>` : ''}
          </div>
        </div>
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button class="proj-edit-btn p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition" data-id="${p.id}" title="Editar">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          <button class="proj-delete-btn p-1.5 rounded-lg hover:bg-rose-50 text-rose-400 transition" data-id="${p.id}" title="Eliminar">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
      ${p.description ? `<p class="text-xs text-surface-500 mb-3 line-clamp-2">${p.description}</p>` : ''}
      <div class="grid grid-cols-3 gap-2 mb-3 text-[11px]">
        <div class="bg-surface-50 rounded-lg p-2">
          <div class="text-surface-400 mb-0.5">Estimado</div>
          <div class="font-bold text-surface-800">${p.estimated_cost != null ? formatCurrency(p.estimated_cost) : '—'}</div>
        </div>
        <div class="bg-blue-50 rounded-lg p-2">
          <div class="text-blue-400 mb-0.5">Aprobado</div>
          <div class="font-bold text-blue-700">${p.approved_cost != null ? formatCurrency(p.approved_cost) : '—'}</div>
        </div>
        <div class="bg-green-50 rounded-lg p-2">
          <div class="text-green-400 mb-0.5">Real</div>
          <div class="font-bold text-green-700">${p.actual_cost != null ? formatCurrency(p.actual_cost) : '—'}</div>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-[11px] text-surface-400">
            <i data-lucide="file-stack" class="w-3 h-3 inline"></i>
            ${quotesCount} cotización${quotesCount !== 1 ? 'es' : ''}
            ${selectedQuote ? `<span class="text-green-600 font-semibold"> · ✓ ${selectedQuote.supplier_name}</span>` : ''}
          </span>
        </div>
        <button class="proj-quotes-btn text-xs font-bold text-teal-600 hover:text-teal-800 hover:underline transition flex items-center gap-1" data-id="${p.id}">
          <i data-lucide="receipt" class="w-3.5 h-3.5"></i> Cotizaciones
        </button>
      </div>
      ${p.scheduled_start || p.scheduled_end ? `
      <div class="mt-2 pt-2 border-t border-surface-100 text-[10px] text-surface-400 flex items-center gap-3">
        ${p.scheduled_start ? `<span><i data-lucide="calendar" class="w-3 h-3 inline"></i> Inicio: ${formatDate(p.scheduled_start)}</span>` : ''}
        ${p.scheduled_end ? `<span><i data-lucide="calendar-check" class="w-3 h-3 inline"></i> Fin: ${formatDate(p.scheduled_end)}</span>` : ''}
      </div>` : ''}
    </div>`;
  }).join('') : `
    <div class="text-center py-12">
      <i data-lucide="folder-open" class="w-12 h-12 mx-auto text-surface-200 mb-3"></i>
      <p class="text-surface-400 text-sm">No hay proyectos en este presupuesto.</p>
      <p class="text-surface-300 text-xs mt-1">Crea uno para gestionar cotizaciones de proveedores.</p>
    </div>`;

  showModal('Proyectos y Cotizaciones', `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-xs text-surface-500">${projects.length} proyecto${projects.length !== 1 ? 's' : ''} registrado${projects.length !== 1 ? 's' : ''}</p>
        <button id="add-project-btn" class="btn-primary !text-xs !py-1.5 !px-3 flex items-center gap-1.5">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i> Nuevo Proyecto
        </button>
      </div>
      <div class="space-y-3 max-h-[55vh] overflow-y-auto pr-1" id="projects-list">
        ${projectCards}
      </div>
    </div>
  `, { showCancel: false, confirmText: 'Cerrar', maxWidth: '700px' });

  if (window.lucide) lucide.createIcons();

  // New project button
  document.getElementById('add-project-btn')?.addEventListener('click', () => {
    openProjectFormModal(budgetId, null, properties, () => openProjectsPanel(budgetId, properties));
  });

  // Edit project buttons
  document.querySelectorAll('.proj-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const project = projects.find(p => p.id === btn.dataset.id);
      openProjectFormModal(budgetId, project, properties, () => openProjectsPanel(budgetId, properties));
    });
  });

  // Delete project buttons
  document.querySelectorAll('.proj-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.dataset.id;
      showModal('¿Eliminar Proyecto?', '<p class="text-surface-600">Se eliminarán el proyecto y todas sus cotizaciones.</p>', {
        confirmText: 'Eliminar',
        onConfirm: async () => {
          await api.delete(`/budgets/${budgetId}/projects/${pid}`);
          showToast('Proyecto eliminado', 'success');
          openProjectsPanel(budgetId, properties);
        }
      });
    });
  });

  // Quotes panel buttons
  document.querySelectorAll('.proj-quotes-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const project = projects.find(p => p.id === btn.dataset.id);
      openQuotesPanel(budgetId, project, properties);
    });
  });
}

function openProjectFormModal(budgetId, existing, properties, onSuccess) {
  const isEdit = !!existing;
  const propOptions = properties.map(p =>
    `<option value="${p.id}" ${isEdit && existing.property_id === p.id ? 'selected' : ''}>${p.name}</option>`
  ).join('');

  showModal(isEdit ? 'Editar Proyecto' : 'Nuevo Proyecto', `
    <form id="pf" class="space-y-4">
      <div>
        <label class="label">Título *</label>
        <input class="input" name="title" value="${isEdit ? existing.title : ''}" required minlength="3" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Tipo *</label>
          <select class="select" name="project_type">
            ${['Mantenimiento','Mejora','Remodelación','Otro'].map(t => `<option ${isEdit && existing.project_type === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="label">Prioridad</label>
          <select class="select" name="priority">
            ${['Urgente','Alta','Media','Baja'].map(t => `<option ${isEdit && existing.priority === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
      </div>
      <div>
        <label class="label">Propiedad</label>
        <select class="select" name="property_id">
          <option value="">(General / Sin propiedad)</option>
          ${propOptions}
        </select>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Costo Estimado</label>
          <input class="input currency-input" name="estimated_cost" type="text" value="${isEdit && existing.estimated_cost != null ? existing.estimated_cost : ''}" />
        </div>
        ${isEdit ? `<div>
          <label class="label">Estado</label>
          <select class="select" name="status">
            ${['Borrador','Cotizando','Aprobado','En Ejecución','Completado','Cancelado'].map(s => `<option ${existing.status === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>` : '<div></div>'}
      </div>
      ${isEdit ? `
      <div>
        <label class="label">Costo Real</label>
        <input class="input currency-input" name="actual_cost" type="text" value="${existing.actual_cost != null ? existing.actual_cost : ''}" />
      </div>` : ''}
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Fecha Inicio</label>
          <input class="input" name="scheduled_start" type="date" value="${isEdit && existing.scheduled_start ? existing.scheduled_start : ''}" />
        </div>
        <div>
          <label class="label">Fecha Fin</label>
          <input class="input" name="scheduled_end" type="date" value="${isEdit && existing.scheduled_end ? existing.scheduled_end : ''}" />
        </div>
      </div>
      <div>
        <label class="label">Descripción</label>
        <textarea class="input" name="description" rows="2" placeholder="Descripción del proyecto...">${isEdit && existing.description ? existing.description : ''}</textarea>
      </div>
      <div>
        <label class="label">Notas</label>
        <textarea class="input" name="notes" rows="2" placeholder="Notas adicionales...">${isEdit && existing.notes ? existing.notes : ''}</textarea>
      </div>
    </form>
  `, {
    confirmText: isEdit ? 'Guardar' : 'Crear Proyecto',
    maxWidth: '600px',
    onConfirm: async () => {
      const fd = new FormData(document.getElementById('pf'));
      const payload = {
        title: fd.get('title'),
        project_type: fd.get('project_type'),
        priority: fd.get('priority'),
        property_id: fd.get('property_id') || null,
        estimated_cost: parseCurrencyValue(fd.get('estimated_cost')) || null,
        description: fd.get('description') || null,
        notes: fd.get('notes') || null,
        scheduled_start: fd.get('scheduled_start') || null,
        scheduled_end: fd.get('scheduled_end') || null,
      };
      if (isEdit) {
        payload.status = fd.get('status') || existing.status;
        const ac = parseCurrencyValue(fd.get('actual_cost'));
        if (ac) payload.actual_cost = ac;
        await api.put(`/budgets/${budgetId}/projects/${existing.id}`, payload);
        showToast('Proyecto actualizado', 'success');
      } else {
        await api.post(`/budgets/${budgetId}/projects`, payload);
        showToast('Proyecto creado', 'success');
      }
      if (onSuccess) onSuccess();
    }
  });
  if (window.lucide) lucide.createIcons();
}

// ── Quotes Panel ─────────────────────────────────────────────

async function openQuotesPanel(budgetId, project, properties) {
  // Refresh project data
  let proj;
  try {
    proj = await api.get(`/budgets/${budgetId}/projects/${project.id}`);
  } catch {
    proj = project;
  }
  const quotes = proj.quotes || [];

  const quotesHtml = quotes.length ? quotes.map(q => {
    const isWinner = q.is_selected;
    return `
    <div class="border ${isWinner ? 'border-green-300 bg-green-50/50 ring-2 ring-green-200' : 'border-surface-200 bg-white/60'} rounded-xl p-4 transition-all hover:shadow-sm group">
      <div class="flex items-start justify-between mb-2">
        <div>
          <div class="flex items-center gap-2">
            ${isWinner ? '<span class="text-green-600 text-xs font-bold bg-green-100 px-2 py-0.5 rounded-full">✓ SELECCIONADA</span>' : ''}
            <h5 class="font-bold text-sm text-surface-900">${q.supplier_name}</h5>
          </div>
          ${q.description ? `<p class="text-xs text-surface-500 mt-1">${q.description}</p>` : ''}
        </div>
        <div class="text-right">
          <div class="text-lg font-bold ${isWinner ? 'text-green-700' : 'text-surface-900'}">${formatCurrency(q.amount)}</div>
          <div class="text-[10px] text-surface-400">${q.currency}</div>
        </div>
      </div>
      <div class="flex items-center gap-3 text-[11px] text-surface-400 mb-3">
        ${q.validity_days ? `<span><i data-lucide="clock" class="w-3 h-3 inline"></i> Vigencia: ${q.validity_days} días</span>` : ''}
        ${q.submitted_date ? `<span><i data-lucide="calendar" class="w-3 h-3 inline"></i> ${formatDate(q.submitted_date)}</span>` : ''}
        ${q.quote_file ? `<a href="${q.quote_file}" target="_blank" class="text-primary-600 hover:underline font-medium"><i data-lucide="paperclip" class="w-3 h-3 inline"></i> Ver archivo</a>` : ''}
      </div>
      <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        ${!isWinner ? `<button class="quote-select-btn text-xs font-bold text-green-600 hover:text-green-800 hover:underline flex items-center gap-1" data-qid="${q.id}">
          <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Seleccionar
        </button>` : ''}
        <button class="quote-upload-btn text-xs font-medium text-primary-600 hover:underline flex items-center gap-1" data-qid="${q.id}">
          <i data-lucide="upload" class="w-3.5 h-3.5"></i> Archivo
        </button>
        <button class="quote-delete-btn text-xs font-medium text-rose-500 hover:underline flex items-center gap-1" data-qid="${q.id}">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>`;
  }).join('') : `
    <div class="text-center py-8">
      <i data-lucide="receipt" class="w-10 h-10 mx-auto text-surface-200 mb-2"></i>
      <p class="text-surface-400 text-sm">No hay cotizaciones para este proyecto.</p>
    </div>`;

  showModal(`Cotizaciones — ${proj.title}`, `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          ${projectStatusBadge(proj.status)}
          <span class="text-xs text-surface-400">${quotes.length} cotización${quotes.length !== 1 ? 'es' : ''}</span>
        </div>
        <button id="add-quote-btn" class="btn-primary !text-xs !py-1.5 !px-3 flex items-center gap-1.5">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i> Nueva Cotización
        </button>
      </div>
      <div class="space-y-3 max-h-[50vh] overflow-y-auto pr-1" id="quotes-list">
        ${quotesHtml}
      </div>
      <div class="pt-3 border-t border-surface-100">
        <button id="back-to-projects" class="text-xs font-medium text-surface-500 hover:text-surface-800 flex items-center gap-1 transition">
          <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Volver a Proyectos
        </button>
      </div>
    </div>
  `, { showCancel: false, confirmText: 'Cerrar', maxWidth: '650px' });

  if (window.lucide) lucide.createIcons();

  // Back button
  document.getElementById('back-to-projects')?.addEventListener('click', () => {
    openProjectsPanel(budgetId, properties);
  });

  // Add quote
  document.getElementById('add-quote-btn')?.addEventListener('click', () => {
    openQuoteFormModal(budgetId, proj, properties);
  });

  // Select quote
  document.querySelectorAll('.quote-select-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await api.post(`/budgets/${budgetId}/projects/${proj.id}/quotes/${btn.dataset.qid}/select`);
        showToast('Cotización seleccionada', 'success');
        openQuotesPanel(budgetId, proj, properties);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // Upload file
  document.querySelectorAll('.quote-upload-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx';
      inp.addEventListener('change', async () => {
        if (!inp.files.length) return;
        const formData = new FormData();
        formData.append('file', inp.files[0]);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${api.baseURL}/budgets/${budgetId}/projects/${proj.id}/quotes/${btn.dataset.qid}/upload`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formData
          });
          if (!res.ok) throw new Error('Error al subir archivo');
          showToast('Archivo subido', 'success');
          openQuotesPanel(budgetId, proj, properties);
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
      inp.click();
    });
  });

  // Delete quote
  document.querySelectorAll('.quote-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showModal('¿Eliminar Cotización?', '<p class="text-surface-600">Esta cotización será eliminada permanentemente.</p>', {
        confirmText: 'Eliminar',
        onConfirm: async () => {
          await api.delete(`/budgets/${budgetId}/projects/${proj.id}/quotes/${btn.dataset.qid}`);
          showToast('Cotización eliminada', 'success');
          openQuotesPanel(budgetId, proj, properties);
        }
      });
    });
  });
}

function openQuoteFormModal(budgetId, project, properties) {
  showModal('Nueva Cotización', `
    <form id="qf" class="space-y-4">
      <div>
        <label class="label">Proveedor / Empresa *</label>
        <input class="input" name="supplier_name" required minlength="2" placeholder="Nombre del proveedor" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Monto *</label>
          <input class="input currency-input" name="amount" type="text" required placeholder="$0" />
        </div>
        <div>
          <label class="label">Moneda</label>
          <select class="select" name="currency">
            <option value="COP" selected>COP</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Vigencia (días)</label>
          <input class="input" name="validity_days" type="number" min="1" placeholder="30" />
        </div>
        <div>
          <label class="label">Fecha Presentación</label>
          <input class="input" name="submitted_date" type="date" value="${new Date().toISOString().slice(0, 10)}" />
        </div>
      </div>
      <div>
        <label class="label">Descripción</label>
        <textarea class="input" name="description" rows="2" placeholder="Detalle de lo que incluye la cotización..."></textarea>
      </div>
    </form>
  `, {
    confirmText: 'Agregar Cotización',
    maxWidth: '550px',
    onConfirm: async () => {
      const fd = new FormData(document.getElementById('qf'));
      const payload = {
        supplier_name: fd.get('supplier_name'),
        amount: parseCurrencyValue(fd.get('amount')),
        currency: fd.get('currency'),
        validity_days: fd.get('validity_days') ? parseInt(fd.get('validity_days')) : null,
        submitted_date: fd.get('submitted_date') || null,
        description: fd.get('description') || null,
      };
      await api.post(`/budgets/${budgetId}/projects/${project.id}/quotes`, payload);
      showToast('Cotización agregada', 'success');
      openQuotesPanel(budgetId, project, properties);
    }
  });
  if (window.lucide) lucide.createIcons();
}
