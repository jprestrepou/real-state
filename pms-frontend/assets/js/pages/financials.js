/**
 * Financials Page — Split into Operaciones + Análisis tabs.
 */

import { api } from '../api.js';
import { formatCurrency, formatDate, statusBadge } from '../utils/formatters.js';
import { showToast, showModal, closeModal } from '../components/modal.js';

const CATEGORIES_GENERAL = [
  'Gastos Generales', 'Gastos Administrativos', 'Mantenimiento General', 'Pago de Empleados',
  'Nómina y Personal', 'Suministros de Oficina', 'Marketing y Publicidad', 'Servicios Públicos',
  'Seguros', 'Impuestos y Tasas', 'Honorarios Gestión', 'Otros',
];
const CATEGORIES_PROPERTY = [
  'Ingresos por Arriendo', 'Gastos Mantenimiento', 'Impuestos y Tasas', 'Cuotas de Administración',
  'Servicios Públicos', 'Honorarios Gestión', 'Seguros', 'Pago Hipoteca', 'Otros',
];

let accountDetailChart = null;
let balanceHistoryChart = null;

export async function renderFinancials(container) {
  const [accountsData, txData, propertiesData] = await Promise.all([
    api.get('/accounts'),
    api.get('/transactions?limit=30'),
    api.get('/properties?limit=100'),
  ]);

  const accounts = accountsData || [];
  const transactions = txData.items || [];
  const properties = propertiesData.items || [];
  let currentPage = 1;
  let isLoading = false;
  let hasMore = transactions.length >= 30;

  container.innerHTML = `
    <div class="flex items-center justify-between mb-6 animate-fade-in">
      <div class="flex items-center gap-3">
        <button id="add-account-btn" class="btn-primary">
          <i data-lucide="plus" class="w-4 h-4"></i> Nueva Cuenta
        </button>
        <button id="add-transaction-btn" class="btn-secondary">
          <i data-lucide="plus-circle" class="w-4 h-4"></i> Transacción
        </button>
        <button id="add-general-expense-btn" class="btn-secondary bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:from-amber-600 hover:to-orange-600">
          <i data-lucide="receipt" class="w-4 h-4"></i> Gasto General
        </button>
        <button id="add-transfer-btn" class="btn-secondary">
          <i data-lucide="arrow-left-right" class="w-4 h-4"></i> Transferencia
        </button>
      </div>
      <div class="flex items-center gap-2">
         <button id="import-csv-btn" class="btn-secondary bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 hover:from-indigo-600 hover:to-purple-600">
          <i data-lucide="upload" class="w-4 h-4"></i> Importar CSV
        </button>
        <input type="file" id="import-csv-input" accept=".csv" class="hidden" />
         <button id="export-csv-btn" class="btn-secondary-outline">
          <i data-lucide="download" class="w-4 h-4"></i> Exportar
        </button>
      </div>
    </div>

    <!-- Main Tabs: Operaciones vs Análisis -->
    <div class="flex space-x-4 border-b border-surface-100 mb-6">
      <button class="tab-btn active" data-tab="operations">Operaciones</button>
      <button class="tab-btn" data-tab="analysis">Análisis</button>
    </div>

    <div id="financial-tabs-content">
      <!-- ══ OPERACIONES TAB ══ -->
      <div id="operations-tab" class="tab-content transition-all duration-300">
        <!-- Accounts Cards (clickable) -->
        <h3 class="text-sm font-bold text-surface-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <i data-lucide="landmark" class="w-4 h-4"></i> Cuentas Bancarias
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          ${accounts.map(acc => `
            <div class="glass-card p-5 cursor-pointer hover:shadow-card-hover hover:border-primary-200 transition-all group account-card" data-account-id="${acc.id}">
              <div class="flex items-center justify-between mb-3">
                <span class="badge ${acc.is_active ? 'badge-green' : 'badge-gray'}">${acc.account_type}</span>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="edit-account-btn p-1.5 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition" data-id="${acc.id}" data-name="${acc.account_name}" data-bank="${acc.bank_name || ''}" data-number="${acc.account_number || ''}" title="Editar">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                  </button>
                  <button class="delete-account-btn p-1.5 rounded-lg hover:bg-rose-50 text-surface-400 hover:text-rose-600 transition" data-id="${acc.id}" data-name="${acc.account_name}" data-balance="${acc.current_balance}" title="Eliminar">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
              <p class="text-sm font-medium text-surface-700 mb-1">${acc.account_name}</p>
              ${acc.bank_name ? `<p class="text-xs text-surface-400 mb-2">${acc.bank_name}</p>` : ''}
              <p class="text-2xl font-bold ${acc.current_balance >= 0 ? 'text-accent-600' : 'text-rose-600'}">
                ${formatCurrency(acc.current_balance)}
              </p>
              <p class="text-[10px] text-primary-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <i data-lucide="bar-chart-2" class="w-3 h-3"></i> Click para ver historial
              </p>
            </div>
          `).join('')}
        </div>

        <!-- Transaction Ledger -->
        <h3 class="text-sm font-bold text-surface-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <i data-lucide="list" class="w-4 h-4"></i> Últimas Transacciones
        </h3>
        <div class="glass-card-static overflow-hidden animate-fade-in">
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Propiedad</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Monto</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.length > 0 ? transactions.map(tx => `
                <tr>
                  <td class="text-xs text-surface-500">${formatDate(tx.transaction_date)}</td>
                  <td><div class="font-medium text-surface-900 text-sm">${tx.description}</div></td>
                  <td><span class="badge badge-gray text-xs">${tx.category}</span></td>
                  <td class="text-xs text-surface-500">
                    ${tx.property_id ? `<span class="badge badge-blue text-xs">Propiedad</span>` : `<span class="badge badge-amber text-xs">General</span>`}
                  </td>
                  <td class="text-xs text-surface-500">${tx.transaction_type}</td>
                  <td><span class="badge ${(!tx.status || tx.status === 'Completada') ? 'badge-green' : tx.status === 'Pendiente' ? 'badge-amber' : 'badge-gray'} text-xs">${tx.status || 'Completada'}</span></td>
                  <td class="font-semibold ${tx.direction === 'Debit' ? 'text-accent-600' : 'text-rose-600'}">
                    ${tx.direction === 'Debit' ? '+' : '-'}${formatCurrency(tx.amount)}
                  </td>
                  <td>
                    <span class="badge ${tx.direction === 'Debit' ? 'badge-green' : 'badge-red'} text-xs">
                      ${tx.direction === 'Debit' ? 'Ingreso' : 'Egreso'}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center gap-1">
                      <button class="edit-tx-btn p-1.5 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition" data-id="${tx.id}" data-desc="${tx.description}" data-cat="${tx.category}" data-amount="${tx.amount}" data-type="${tx.transaction_type}" data-date="${tx.transaction_date}" data-status="${tx.status || 'Completada'}" title="Editar">
                        <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                      </button>
                      <button class="delete-tx-btn p-1.5 rounded-lg hover:bg-rose-50 text-surface-400 hover:text-rose-600 transition" data-id="${tx.id}" data-desc="${tx.description}" title="Eliminar">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="8" class="text-center py-12 text-surface-400">No hay transacciones</td></tr>
              `}
            </tbody>
          </table>
          <div id="infinite-scroll-sentinel" class="h-4 w-full"></div>
          <div id="loading-spinner" class="hidden py-4 flex justify-center">
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent"></div>
          </div>
        </div>
      </div>

      <!-- ══ ANÁLISIS TAB ══ -->
      <div id="analysis-tab" class="tab-content hidden transition-all duration-300">
        <!-- Performance by Property -->
        <div class="glass-card p-6 mb-8 animate-fade-in shadow-lg border-accent-100 bg-gradient-to-br from-white to-accent-50/30">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 class="font-bold text-surface-900 flex items-center gap-2 text-lg">
                <i data-lucide="bar-chart-3" class="w-6 h-6 text-accent-500"></i>
                Análisis de Desempeño Financiero
              </h3>
              <p class="text-sm text-surface-500">Métricas detalladas por propiedad seleccionada</p>
            </div>
            <select id="performance-property-select" class="select max-w-xs shadow-sm border-surface-200">
              <option value="">Seleccione propiedad...</option>
              ${properties.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </div>
          <div id="performance-content" class="min-h-[200px] flex items-center justify-center border-2 border-dashed border-surface-200 rounded-2xl bg-white/50">
            <div class="text-center">
              <i data-lucide="building" class="w-12 h-12 text-surface-200 mx-auto mb-3"></i>
              <p class="text-surface-400 font-medium">Selecciona una propiedad para ver su rendimiento</p>
            </div>
          </div>
        </div>

        <!-- Corporate Reports -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="glass-card p-6" id="balance-sheet-container">
            <h3 class="font-bold mb-4">Balance General</h3>
            <p class="text-surface-400 text-sm">Cargando estado...</p>
          </div>
          <div class="glass-card p-6" id="income-statement-container">
            <h3 class="font-bold mb-4">Estado de Resultados</h3>
            <p class="text-surface-400 text-sm">Cargando estado...</p>
          </div>
        </div>

        <!-- PDF Button -->
        <div class="flex justify-end">
          <button id="generate-pdf-btn" class="btn-primary bg-gradient-to-r from-rose-500 to-pink-500 border-0 hover:from-rose-600 hover:to-pink-600">
            <i data-lucide="file-text" class="w-4 h-4"></i> Generar Informe PDF
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // ── Event Listeners ──────────────────────────────────

  // Create
  document.getElementById('add-account-btn')?.addEventListener('click', () => openAccountModal());
  document.getElementById('add-transaction-btn')?.addEventListener('click', () => openTransactionModal(accounts, properties, false));
  document.getElementById('add-general-expense-btn')?.addEventListener('click', () => openTransactionModal(accounts, properties, true));
  document.getElementById('add-transfer-btn')?.addEventListener('click', () => openTransferModal(accounts));

  // Import CSV
  document.getElementById('import-csv-btn')?.addEventListener('click', () => document.getElementById('import-csv-input')?.click());
  document.getElementById('import-csv-input')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) { await openImportModal(file); e.target.value = ''; }
  });

  // Export CSV
  document.getElementById('export-csv-btn')?.addEventListener('click', () => {
    window.location.href = `${api.baseUrl}/reports/export`;
  });

  // Account cards: click to view history
  document.querySelectorAll('.account-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.edit-account-btn') || e.target.closest('.delete-account-btn')) return;
      window.location.hash = `#/account-detail?id=${card.dataset.accountId}`;
    });
  });

  // Edit account buttons
  document.querySelectorAll('.edit-account-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditAccountModal(btn.dataset.id, btn.dataset.name, btn.dataset.bank, btn.dataset.number);
    });
  });

  // Delete account buttons
  document.querySelectorAll('.delete-account-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDeleteAccount(btn.dataset.id, btn.dataset.name, parseFloat(btn.dataset.balance));
    });
  });

  // Edit transaction buttons
  document.querySelectorAll('.edit-tx-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openEditTransactionModal(btn.dataset.id, btn.dataset.desc, btn.dataset.cat, btn.dataset.amount, btn.dataset.type, btn.dataset.date, btn.dataset.status);
    });
  });

  // Delete transaction buttons
  document.querySelectorAll('.delete-tx-btn').forEach(btn => {
    btn.addEventListener('click', () => confirmDeleteTransaction(btn.dataset.id, btn.dataset.desc));
  });

  // Performance selector
  document.getElementById('performance-property-select')?.addEventListener('change', (e) => loadPerformance(e.target.value));

  // PDF Global
  document.getElementById('generate-pdf-btn')?.addEventListener('click', () => {
    window.open(`${api.baseUrl}/financial/financial-summary/export/pdf`, '_blank');
  });

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      document.getElementById(`${tab}-tab`).classList.remove('hidden');
      if (tab === 'analysis') loadReports();
    });
  });

  // ── Infinite Scroll Logic ─────────────────────────────
  const sentinel = document.getElementById('infinite-scroll-sentinel');
  const spinner = document.getElementById('loading-spinner');
  const tbody = document.querySelector('#operations-tab tbody');

  const observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting && hasMore && !isLoading) {
      isLoading = true;
      spinner.classList.remove('hidden');
      currentPage++;

      try {
        const newData = await api.get(`/transactions?limit=30&page=${currentPage}`);
        const items = newData.items || [];

        if (items.length === 0) {
          hasMore = false;
        } else {
          items.forEach(tx => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td class="text-xs text-surface-500">${formatDate(tx.transaction_date)}</td>
              <td><div class="font-medium text-surface-900 text-sm">${tx.description}</div></td>
              <td><span class="badge badge-gray text-xs">${tx.category}</span></td>
              <td class="text-xs text-surface-500">
                ${tx.property_id ? `<span class="badge badge-blue text-xs">Propiedad</span>` : `<span class="badge badge-amber text-xs">General</span>`}
              </td>
              <td class="text-xs text-surface-500">${tx.transaction_type}</td>
              <td><span class="badge ${(!tx.status || tx.status === 'Completada') ? 'badge-green' : tx.status === 'Pendiente' ? 'badge-amber' : 'badge-gray'} text-xs">${tx.status || 'Completada'}</span></td>
              <td class="font-semibold ${tx.direction === 'Debit' ? 'text-accent-600' : 'text-rose-600'}">
                ${tx.direction === 'Debit' ? '+' : '-'}${formatCurrency(tx.amount)}
              </td>
              <td>
                <span class="badge ${tx.direction === 'Debit' ? 'badge-green' : 'badge-red'} text-xs">
                  ${tx.direction === 'Debit' ? 'Ingreso' : 'Egreso'}
                </span>
              </td>
              <td>
                <div class="flex items-center gap-1">
                  <button class="edit-tx-btn p-1.5 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition" 
                    data-id="${tx.id}" data-desc="${tx.description}" data-cat="${tx.category}" 
                    data-amount="${tx.amount}" data-type="${tx.transaction_type}" data-date="${tx.transaction_date}" data-status="${tx.status || 'Completada'}">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                  </button>
                  <button class="delete-tx-btn p-1.5 rounded-lg hover:bg-rose-50 text-surface-400 hover:text-rose-600 transition" 
                    data-id="${tx.id}" data-desc="${tx.description}">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </td>
            `;
            tbody.appendChild(tr);

            // Re-attach event listeners for new buttons
            tr.querySelector('.edit-tx-btn').addEventListener('click', () => {
              const btn = tr.querySelector('.edit-tx-btn');
              openEditTransactionModal(btn.dataset.id, btn.dataset.desc, btn.dataset.cat, btn.dataset.amount, btn.dataset.type, btn.dataset.date, btn.dataset.status);
            });
            tr.querySelector('.delete-tx-btn').addEventListener('click', () => {
              const btn = tr.querySelector('.delete-tx-btn');
              confirmDeleteTransaction(btn.dataset.id, btn.dataset.desc);
            });
          });
          if (window.lucide) lucide.createIcons();
          if (items.length < 30) hasMore = false;
        }
      } catch (err) {
        console.error('Error loading more transactions:', err);
      } finally {
        isLoading = false;
        spinner.classList.add('hidden');
      }
    }
  }, { threshold: 0.1 });

  if (sentinel) observer.observe(sentinel);
}

// ══════════════════════════════════════════════════════════
// Account detail modal is replaced by full page #/account-detail

// ══════════════════════════════════════════════════════════
// ── CRUD Modals ───────────────────────────────────────
// ══════════════════════════════════════════════════════════

function openAccountModal() {
  showModal('Nueva Cuenta Bancaria', `
    <form id="account-form" class="space-y-4">
      <div><label class="label">Nombre *</label><input class="input" name="account_name" required placeholder="Cuenta Corriente" /></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Tipo *</label>
          <select class="select" name="account_type" required>
            <option value="Corriente">Corriente</option><option value="Ahorros">Ahorros</option>
            <option value="Inversión">Inversión</option><option value="Caja Menor">Caja Menor</option>
          </select>
        </div>
        <div><label class="label">Saldo Inicial</label><input class="input" name="initial_balance" type="number" step="0.01" value="0" /></div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Banco</label><input class="input" name="bank_name" placeholder="Bancolombia" /></div>
        <div><label class="label">Moneda</label><input class="input" name="currency" value="COP" maxlength="3" /></div>
      </div>
    </form>
  `, {
    confirmText: 'Crear Cuenta',
    onConfirm: async () => {
      const fd = new FormData(document.getElementById('account-form'));
      const payload = {};
      fd.forEach((v, k) => { if (k === 'initial_balance') payload[k] = parseFloat(v) || 0; else if (v) payload[k] = v; });
      await api.post('/accounts', payload);
      showToast('Cuenta creada', 'success');
      await renderFinancials(document.getElementById('page-content'));
    },
  });
}

function openEditAccountModal(id, name, bank, number) {
  showModal('Editar Cuenta', `
    <form id="edit-account-form" class="space-y-4">
      <div><label class="label">Nombre *</label><input class="input" name="account_name" value="${name}" required /></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Banco</label><input class="input" name="bank_name" value="${bank}" /></div>
        <div><label class="label">Número de Cuenta</label><input class="input" name="account_number" value="${number}" /></div>
      </div>
    </form>
  `, {
    confirmText: 'Guardar Cambios',
    onConfirm: async () => {
      const fd = new FormData(document.getElementById('edit-account-form'));
      const payload = {};
      fd.forEach((v, k) => { if (v) payload[k] = v; });
      await api.put(`/accounts/${id}`, payload);
      showToast('Cuenta actualizada', 'success');
      await renderFinancials(document.getElementById('page-content'));
    },
  });
}

function confirmDeleteAccount(id, name, balance) {
  if (balance !== 0) {
    showToast(`No se puede eliminar "${name}": tiene saldo de ${formatCurrency(balance)}. Transfiera los fondos primero.`, 'error');
    return;
  }
  showModal('Eliminar Cuenta', `
    <div class="text-center py-4">
      <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i data-lucide="alert-triangle" class="w-8 h-8 text-rose-500"></i>
      </div>
      <p class="text-surface-700 font-medium mb-2">¿Eliminar la cuenta "${name}"?</p>
      <p class="text-sm text-surface-400">Esta acción desactivará la cuenta. No será visible pero sus transacciones históricas se conservan.</p>
    </div>
  `, {
    confirmText: 'Eliminar',
    onConfirm: async () => {
      await api.delete(`/accounts/${id}`);
      showToast('Cuenta eliminada', 'success');
      await renderFinancials(document.getElementById('page-content'));
    },
  });
  if (window.lucide) lucide.createIcons();
}

function openTransactionModal(accounts, properties = [], isGeneralExpense = false) {
  const title = isGeneralExpense ? 'Registrar Gasto General' : 'Registrar Transacción';
  const categories = isGeneralExpense ? CATEGORIES_GENERAL : CATEGORIES_PROPERTY;

  showModal(title, `
    <form id="tx-form" class="space-y-4">
      ${isGeneralExpense ? `<div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2"><div class="flex items-center gap-2 text-amber-700 text-sm font-medium"><i data-lucide="info" class="w-4 h-4"></i> Este gasto no está asociado a ninguna propiedad</div></div>` : ''}
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Cuenta *</label><select class="select" name="account_id" required>${accounts.map(a => `<option value="${a.id}">${a.account_name}</option>`).join('')}</select></div>
        ${isGeneralExpense ? '' : `<div><label class="label">Propiedad *</label><select class="select" name="property_id" required><option value="">Seleccione...</option>${properties.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select></div>`}
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Tipo *</label><select class="select" name="transaction_type" required>
          ${isGeneralExpense ? '<option value="Gasto">Gasto</option>' : '<option value="Ingreso">Ingreso</option><option value="Gasto">Gasto</option><option value="Transferencia">Transferencia</option><option value="Interés">Interés</option><option value="Abono">Abono</option><option value="Crédito">Crédito</option><option value="Ajuste">Ajuste</option>'}
        </select></div>
        <div><label class="label">Categoría *</label><select class="select" name="category" required>${categories.map(c => `<option value="${c}">${c}</option>`).join('')}</select></div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div><label class="label">Monto *</label><input class="input" name="amount" type="number" step="0.01" min="0.01" required placeholder="1500000" /></div>
        <div><label class="label">Fecha *</label><input class="input" name="transaction_date" type="date" required value="${new Date().toISOString().split('T')[0]}" /></div>
        <div><label class="label">Estado *</label><select class="select" name="status" required>
          <option value="Completada">Completada</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Cancelada">Cancelada</option>
        </select></div>
      </div>
      <div><label class="label">Descripción *</label><input class="input" name="description" required placeholder="${isGeneralExpense ? 'Pago servicios oficina' : 'Pago canon mes de marzo'}" /></div>
    </form>
  `, {
    confirmText: 'Registrar',
    onConfirm: async () => {
      const fd = new FormData(document.getElementById('tx-form'));
      const payload = {};
      
      const rawCat = fd.get('category');
      const [bId, cName] = rawCat.includes('|') ? rawCat.split('|') : [null, rawCat];
      
      fd.forEach((v, k) => {
        if (k === 'amount') payload[k] = parseFloat(v);
        else if (k === 'category') payload[k] = cName;
        else if (v) payload[k] = v;
      });
      payload.budget_category_id = bId || null;
      
      if (isGeneralExpense) delete payload.property_id;
      if (payload.transaction_type === 'Ingreso') payload.direction = 'Debit';
      else if (payload.transaction_type === 'Gasto') payload.direction = 'Credit';
      await api.post('/transactions', payload);
      showToast(isGeneralExpense ? 'Gasto registrado' : 'Transacción registrada', 'success');
      await renderFinancials(document.getElementById('page-content'));
    },
  });

  if (window.lucide) lucide.createIcons();

  const form = document.getElementById('tx-form');
  const propSelect = form.querySelector('[name="property_id"]');
  const dateInput = form.querySelector('[name="transaction_date"]');
  const catSelect = form.querySelector('[name="category"]');

  const updateBudgetCats = async () => {
    const propId = isGeneralExpense ? 'GENERAL' : propSelect.value;
    const dateVal = dateInput.value;
    if (!propId || !dateVal) return;

    const [year, month] = dateVal.split('-').map(Number);
    try {
      // Find property ID for general if needed
      let targetPropId = propId;
      if (propId === 'GENERAL') {
        const props = await api.get('/properties?limit=100');
        const genProp = props.items.find(p => p.name === 'Gastos Generales');
        if (genProp) targetPropId = genProp.id;
      }

      const budgets = await api.get(`/budgets?property_id=${targetPropId}&year=${year}&month=${month}`);
      if (budgets && budgets.length > 0) {
        const budget = budgets[0];
        let html = budget.categories.map(c => `<option value="${c.id}|${c.category_name}">${c.category_name} (Presupuestado)</option>`).join('');
        html += '<option disabled>──────────</option>';
        html += categories.map(c => `<option value="|${c}">${c}</option>`).join('');
        catSelect.innerHTML = html;
      } else {
        // Reset to defaults if no budget found
        catSelect.innerHTML = categories.map(c => `<option value="|${c}">${c}</option>`).join('');
      }
    } catch (err) {
      console.warn('Could not fetch budget categories:', err);
      catSelect.innerHTML = categories.map(c => `<option value="|${c}">${c}</option>`).join('');
    }
  };

  if (propSelect) propSelect.addEventListener('change', updateBudgetCats);
  dateInput.addEventListener('change', updateBudgetCats);
  form.querySelector('[name="transaction_type"]').addEventListener('change', updateBudgetCats);

  if (isGeneralExpense || (propSelect && propSelect.value)) {
    updateBudgetCats();
  }
}

function openEditTransactionModal(id, desc, cat, amount, type, txDate, status) {
  const allCats = [...new Set([...CATEGORIES_GENERAL, ...CATEGORIES_PROPERTY])];
  showModal('Editar Transacción', `
    <form id="edit-tx-form" class="space-y-4">
      <div><label class="label">Descripción</label><input class="input" name="description" value="${desc}" /></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Categoría</label><select class="select" name="category">${allCats.map(c => `<option value="${c}" ${c === cat ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
        <div><label class="label">Tipo</label><select class="select" name="transaction_type">
          ${['Ingreso', 'Gasto', 'Transferencia', 'Ajuste', 'Interés', 'Abono', 'Crédito'].map(t => `<option value="${t}" ${t === type ? 'selected' : ''}>${t}</option>`).join('')}
        </select></div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div><label class="label">Monto</label><input class="input" name="amount" type="number" step="0.01" value="${amount}" /></div>
        <div><label class="label">Fecha</label><input class="input" name="transaction_date" type="date" value="${txDate}" /></div>
        <div><label class="label">Estado</label><select class="select" name="status">
          <option value="Completada" ${(!status || status === 'Completada') ? 'selected' : ''}>Completada</option>
          <option value="Pendiente" ${status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="Cancelada" ${status === 'Cancelada' ? 'selected' : ''}>Cancelada</option>
        </select></div>
      </div>
    </form>
  `, {
    confirmText: 'Guardar',
    onConfirm: async () => {
      const fd = new FormData(document.getElementById('edit-tx-form'));
      const payload = {};
      fd.forEach((v, k) => { if (k === 'amount') payload[k] = parseFloat(v); else if (v) payload[k] = v; });
      await api.put(`/transactions/${id}`, payload);
      showToast('Transacción actualizada', 'success');
      await renderFinancials(document.getElementById('page-content'));
    },
  });
}

function confirmDeleteTransaction(id, desc) {
  showModal('Eliminar Transacción', `
    <div class="text-center py-4">
      <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i data-lucide="alert-triangle" class="w-8 h-8 text-rose-500"></i>
      </div>
      <p class="text-surface-700 font-medium mb-2">¿Eliminar esta transacción?</p>
      <p class="text-sm text-surface-400 italic mb-2">"${desc}"</p>
      <p class="text-xs text-rose-500">El saldo de la cuenta será ajustado automáticamente.</p>
    </div>
  `, {
    confirmText: 'Eliminar',
    onConfirm: async () => {
      await api.delete(`/transactions/${id}`);
      showToast('Transacción eliminada', 'success');
      await renderFinancials(document.getElementById('page-content'));
    },
  });
  if (window.lucide) lucide.createIcons();
}

function openTransferModal(accounts) {
  showModal('Transferencia entre Cuentas', `
    <form id="transfer-form" class="space-y-4">
      <div><label class="label">Cuenta Origen *</label><select class="select" name="source_account_id" required>${accounts.map(a => `<option value="${a.id}">${a.account_name} (${formatCurrency(a.current_balance)})</option>`).join('')}</select></div>
      <div><label class="label">Cuenta Destino *</label><select class="select" name="destination_account_id" required>${accounts.map(a => `<option value="${a.id}">${a.account_name}</option>`).join('')}</select></div>
      <div><label class="label">Monto *</label><input class="input" name="amount" type="number" step="0.01" required placeholder="500000" /></div>
      <div><label class="label">Descripción *</label><input class="input" name="description" required placeholder="Traslado de fondos" /></div>
      <div><label class="label">Fecha *</label><input class="input" name="transaction_date" type="date" required value="${new Date().toISOString().split('T')[0]}" /></div>
    </form>
  `, {
    confirmText: 'Transferir',
    onConfirm: async () => {
      const fd = new FormData(document.getElementById('transfer-form'));
      const payload = {};
      fd.forEach((v, k) => { if (k === 'amount') payload[k] = parseFloat(v); else payload[k] = v; });
      if (payload.source_account_id === payload.destination_account_id) { showToast('Las cuentas deben ser diferentes', 'error'); return; }
      await api.post('/accounts/transfer', payload);
      showToast('Transferencia completada', 'success');
      await renderFinancials(document.getElementById('page-content'));
    }
  });
}

// ══════════════════════════════════════════════════════════
// ── Performance Analysis ──────────────────────────────
// ══════════════════════════════════════════════════════════

async function loadPerformance(propertyId) {
  if (!propertyId) return;
  const content = document.getElementById('performance-content');
  content.innerHTML = '<div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-8 w-8 border-2 border-accent-500 border-t-transparent"></div><p class="ml-3 text-surface-500">Calculando métricas...</p></div>';

  const perf = await api.get(`/properties/${propertyId}/performance`);
  if (!perf) return;

  const hasData = perf.total_income > 0 || perf.total_expenses > 0;

  content.innerHTML = `
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-surface-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center"><i data-lucide="building-2" class="w-5 h-5 text-primary-600"></i></div>
          <div>
            <h4 class="font-bold text-surface-900">${perf.property_name}</h4>
            <span class="badge ${perf.property_status === 'Arrendada' ? 'badge-green' : 'badge-blue'} text-xs">${perf.property_status || 'Sin estado'}</span>
          </div>
        </div>
        <button id="export-prop-perf-pdf" class="btn-secondary-outline text-xs py-1.5" data-id="${propertyId}">
          <i data-lucide="file-down" class="w-4 h-4"></i> Exportar PDF Individual
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">Ingresos</p>
          <p class="text-2xl font-bold text-accent-600">${formatCurrency(perf.total_income)}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">Gastos</p>
          <p class="text-2xl font-bold text-rose-600">${formatCurrency(perf.total_expenses)}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">Utilidad</p>
          <p class="text-2xl font-bold ${perf.net_profit >= 0 ? 'text-primary-600' : 'text-rose-600'}">${formatCurrency(perf.net_profit)}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">ROI</p>
          <p class="text-2xl font-bold text-indigo-600">${perf.roi}%</p>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-surface-100">
          <h4 class="text-sm font-bold text-surface-900 mb-4">Flujo Mensual</h4>
          <div class="h-[220px]"><canvas id="property-cashflow-chart"></canvas></div>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h4 class="text-sm font-bold text-surface-900 mb-4">Distribución</h4>
          <div class="h-[200px] flex items-center justify-center"><canvas id="property-mini-chart"></canvas></div>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h4 class="text-sm font-bold text-surface-900 mb-4">Categorías</h4>
          ${hasData ? `
            ${Object.entries(perf.income_by_category || {}).map(([c, v]) => `<div class="flex justify-between text-sm mb-1"><span>${c}</span><span class="text-accent-600">+${formatCurrency(v)}</span></div>`).join('')}
            <div class="border-t border-surface-100 my-3"></div>
            ${Object.entries(perf.expense_by_category || {}).map(([c, v]) => `<div class="flex justify-between text-sm mb-1"><span>${c}</span><span class="text-rose-600">-${formatCurrency(v)}</span></div>`).join('')}
          ` : '<p class="text-surface-400 text-center py-4">Sin datos</p>'}
        </div>
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h4 class="text-sm font-bold text-surface-900 mb-4">Últimos Movimientos</h4>
          <div class="overflow-x-auto"><table class="data-table text-xs"><thead><tr><th>Fecha</th><th>Descripción</th><th>Monto</th></tr></thead><tbody>
            ${(perf.last_transactions || []).length > 0 ? perf.last_transactions.map(tx => `<tr><td class="text-surface-500">${formatDate(tx.transaction_date)}</td><td class="font-medium">${tx.description}</td><td class="font-bold ${tx.direction === 'Debit' ? 'text-accent-600' : 'text-rose-600'}">${tx.direction === 'Debit' ? '+' : '-'}${formatCurrency(tx.amount)}</td></tr>`).join('') : '<tr><td colspan="3" class="text-center py-4 text-surface-400">Sin movimientos</td></tr>'}
          </tbody></table></div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  document.getElementById('export-prop-perf-pdf')?.addEventListener('click', () => {
    window.open(`${api.baseUrl}/financial/properties/${propertyId}/performance/export/pdf`, '_blank');
  });

  const dCtx = document.getElementById('property-mini-chart');
  if (dCtx && hasData) {
    new Chart(dCtx, { type: 'doughnut', data: { labels: ['Ingresos', 'Gastos'], datasets: [{ data: [perf.total_income, perf.total_expenses], backgroundColor: ['#20c997', '#f03e3e'], borderWidth: 0, cutout: '75%' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
  }
  const cCtx = document.getElementById('property-cashflow-chart');
  if (cCtx && perf.monthly_cashflow) {
    const months = perf.monthly_cashflow;
    new Chart(cCtx, { type: 'bar', data: { labels: months.map(m => m.month), datasets: [{ label: 'Ingresos', data: months.map(m => m.income), backgroundColor: 'rgba(32,201,151,0.7)', borderRadius: 6, barPercentage: 0.6 }, { label: 'Gastos', data: months.map(m => m.expenses), backgroundColor: 'rgba(240,62,62,0.7)', borderRadius: 6, barPercentage: 0.6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { usePointStyle: true, font: { size: 10 } } } }, scales: { y: { beginAtZero: true, ticks: { font: { size: 10 }, callback: v => '$' + (v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(0) + 'K' : v) }, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { ticks: { font: { size: 9 } }, grid: { display: false } } } } });
  }
}

// ══════════════════════════════════════════════════════════
// ── Reports ───────────────────────────────────────────
// ══════════════════════════════════════════════════════════

async function loadReports() {
  const [balance, income] = await Promise.all([
    api.get('/reports/balance-sheet'),
    api.get(`/reports/income-statement?start_date=${new Date().getFullYear()}-01-01&end_date=${new Date().toISOString().split('T')[0]}`)
  ]);

  if (balance) {
    document.getElementById('balance-sheet-container').innerHTML = `
      <h3 class="font-bold mb-4 flex items-center justify-between">Balance General <span class="text-xs font-normal text-surface-400">${formatDate(balance.date)}</span></h3>
      <div class="space-y-3">
        ${balance.accounts.map(acc => `<div class="flex justify-between text-sm py-2 border-b border-surface-50"><span class="text-surface-600">${acc.account_name}</span><span class="font-semibold">${formatCurrency(acc.current_balance)}</span></div>`).join('')}
        <div class="flex justify-between text-lg font-bold pt-4 text-primary-600"><span>Total Activos</span><span>${formatCurrency(balance.total_assets)}</span></div>
      </div>
    `;
  }

  if (income) {
    document.getElementById('income-statement-container').innerHTML = `
      <h3 class="font-bold mb-4">Estado de Resultados (Año Actual)</h3>
      <div class="space-y-4">
        <div><p class="text-xs font-bold text-surface-400 uppercase mb-2">Ingresos</p>${Object.entries(income.income).map(([c, v]) => `<div class="flex justify-between text-sm mb-1"><span>${c}</span><span class="text-accent-600">+${formatCurrency(v)}</span></div>`).join('')}</div>
        <div><p class="text-xs font-bold text-surface-400 uppercase mb-2">Egresos</p>${Object.entries(income.expenses).map(([c, v]) => `<div class="flex justify-between text-sm mb-1"><span>${c}</span><span class="text-rose-600">-${formatCurrency(v)}</span></div>`).join('')}</div>
        <div class="border-t border-surface-100 pt-3"><div class="flex justify-between text-lg font-bold ${income.net_income >= 0 ? 'text-accent-600' : 'text-rose-600'}"><span>Utilidad Neta</span><span>${formatCurrency(income.net_income)}</span></div></div>
      </div>
    `;
  }
}

// ══════════════════════════════════════════════════════════
// ── PDF Generation ────────────────────────────────────
// ══════════════════════════════════════════════════════════

async function generatePDF(accounts, transactions) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Header
  doc.setFillColor(66, 99, 235);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255);
  doc.setFontSize(20);
  doc.text('PMS — Informe Financiero', 14, 20);
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 28);

  // Accounts Table
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.text('Cuentas Bancarias', 14, 45);

  doc.autoTable({
    startY: 50,
    head: [['Cuenta', 'Tipo', 'Banco', 'Moneda', 'Saldo']],
    body: accounts.map(a => [a.account_name, a.account_type, a.bank_name || '-', a.currency, formatCurrency(a.current_balance)]),
    theme: 'striped',
    headStyles: { fillColor: [66, 99, 235] },
    styles: { fontSize: 9 },
  });

  // Transactions Table
  const y = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('Últimas Transacciones', 14, y);

  doc.autoTable({
    startY: y + 5,
    head: [['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto']],
    body: transactions.map(tx => [
      tx.transaction_date,
      tx.description.substring(0, 40),
      tx.category,
      tx.transaction_type,
      `${tx.direction === 'Debit' ? '+' : '-'}${formatCurrency(tx.amount)}`,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [66, 99, 235] },
    styles: { fontSize: 8 },
  });

  // Summary
  const totalIncome = transactions.filter(t => t.direction === 'Debit').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.direction === 'Credit').reduce((s, t) => s + t.amount, 0);
  const fy = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.setTextColor(32, 201, 151);
  doc.text(`Total Ingresos: ${formatCurrency(totalIncome)}`, 14, fy);
  doc.setTextColor(240, 62, 62);
  doc.text(`Total Gastos: ${formatCurrency(totalExpense)}`, 14, fy + 8);
  doc.setTextColor(66, 99, 235);
  doc.text(`Resultado Neto: ${formatCurrency(totalIncome - totalExpense)}`, 14, fy + 16);

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`PMS — Property Management System | Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
  }

  doc.save(`informe_financiero_${new Date().toISOString().split('T')[0]}.pdf`);
  showToast('PDF generado y descargado', 'success');
}

// ══════════════════════════════════════════════════════════
// ── CSV Import Modal ──────────────────────────────────
// ══════════════════════════════════════════════════════════

async function openImportModal(file) {
  showModal('Analizando CSV...', `
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
      <p class="ml-3 text-surface-500">Analizando archivo...</p>
    </div>
  `, { showCancel: false });

  let analysis;
  try {
    const formData = new FormData();
    formData.append('file', file);
    analysis = await api.upload('/transactions/import/analyze', formData);
  } catch (err) {
    showToast(`Error al analizar: ${err.message}`, 'error');
    return;
  }

  const { total_rows, transfers_skipped, new_accounts, existing_accounts, detected_labels, category_mapping } = analysis;

  const labelsHtml = detected_labels.length > 0 ? detected_labels.map(lbl => `
    <label class="flex items-center gap-3 p-3 rounded-xl border border-surface-100 hover:bg-surface-50 transition cursor-pointer">
      <input type="checkbox" class="import-label-check w-4 h-4 rounded text-indigo-500" value="${lbl.label}" ${lbl.suggested_apartment ? 'checked' : ''} ${lbl.already_exists ? 'checked disabled' : ''} />
      <div class="flex-1 min-w-0">
        <span class="font-medium text-surface-800 text-sm">${lbl.label}</span>
        <span class="text-xs text-surface-400 ml-2">(${lbl.transaction_count} tx)</span>
      </div>
      ${lbl.already_exists ? '<span class="badge badge-green text-xs">Existe</span>' : lbl.suggested_apartment ? '<span class="badge badge-blue text-xs">Sugerido</span>' : '<span class="badge badge-amber text-xs">General</span>'}
    </label>
  `).join('') : '<p class="text-surface-400 text-sm py-4 text-center">No se detectaron labels</p>';

  showModal('Importación de Transacciones', `
    <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-indigo-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-indigo-600">${total_rows}</p><p class="text-xs text-indigo-400">Transacciones</p></div>
        <div class="bg-amber-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-amber-600">${transfers_skipped}</p><p class="text-xs text-amber-400">Omitidas</p></div>
        <div class="bg-purple-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-purple-600">${detected_labels.length}</p><p class="text-xs text-purple-400">Labels</p></div>
      </div>
      ${new_accounts.length > 0 ? `<div class="bg-blue-50 border border-blue-200 rounded-xl p-4"><p class="text-sm font-bold text-blue-700 mb-2">Cuentas nuevas (${new_accounts.length})</p>${new_accounts.map(a => `<div class="flex justify-between text-sm"><span class="text-blue-600">${a.name}</span><span class="text-blue-400">${a.transaction_count} tx</span></div>`).join('')}</div>` : ''}
      ${existing_accounts.length > 0 ? `<div class="bg-green-50 border border-green-200 rounded-xl p-4"><p class="text-sm font-bold text-green-700 mb-2">Cuentas existentes (${existing_accounts.length})</p>${existing_accounts.map(a => `<div class="flex justify-between text-sm"><span class="text-green-600">${a.name}</span><span class="text-green-400">${a.transaction_count} tx</span></div>`).join('')}</div>` : ''}
      ${Object.keys(category_mapping).length > 0 ? `<details class="bg-surface-50 border border-surface-200 rounded-xl p-4"><summary class="text-sm font-bold text-surface-700 cursor-pointer">Mapeo categorías (${Object.keys(category_mapping).length})</summary><div class="mt-3 space-y-1 max-h-40 overflow-y-auto">${Object.entries(category_mapping).map(([c, s]) => `<div class="flex justify-between text-xs py-1 border-b border-surface-100"><span>${c}</span><span class="text-indigo-600">→ ${s}</span></div>`).join('')}</div></details>` : ''}
      <div>
        <p class="text-sm font-bold text-surface-700 mb-3">¿Cuáles labels son apartamentos?</p>
        <p class="text-xs text-surface-400 mb-3">Los seleccionados se crean como propiedades.</p>
        <div class="space-y-2 max-h-60 overflow-y-auto">${labelsHtml}</div>
      </div>
    </div>
  `, {
    confirmText: 'Importar Transacciones',
    onConfirm: async () => {
      const checks = document.querySelectorAll('.import-label-check:checked');
      const confirmedLabels = Array.from(checks).map(c => c.value);
      const fd = new FormData();
      fd.append('file', file);
      const labelsParam = encodeURIComponent(confirmedLabels.join(','));
      try {
        const result = await api.upload(`/transactions/import/confirm?confirmed_labels=${labelsParam}`, fd);
        let msg = `✅ ${result.imported} transacciones importadas.`;
        if (result.accounts_created.length > 0) msg += ` 📁 Cuentas: ${result.accounts_created.join(', ')}`;
        if (result.properties_created.length > 0) msg += ` 🏠 Propiedades: ${result.properties_created.join(', ')}`;
        if (result.errors.length > 0) msg += ` ⚠️ ${result.errors.length} errores`;
        showToast(msg, 'success');
        await renderFinancials(document.getElementById('page-content'));
      } catch (err) {
        showToast(`Error al importar: ${err.message}`, 'error');
      }
    }
  });
  if (window.lucide) lucide.createIcons();
}
