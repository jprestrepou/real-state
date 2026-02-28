/**
 * Financials Page — Ledger, accounts, transactions.
 */

import { api } from '../api.js';
import { formatCurrency, formatDate, statusBadge } from '../utils/formatters.js';
import { showToast, showModal } from '../components/modal.js';

export async function renderFinancials(container) {
  const [accountsData, txData, propertiesData] = await Promise.all([
    api.get('/accounts'),
    api.get('/transactions?limit=30'),
    api.get('/properties?limit=100'),
  ]);

  const accounts = accountsData || [];
  const transactions = txData.items || [];
  const properties = propertiesData.items || [];

  container.innerHTML = `
    <div class="flex items-center justify-between mb-6 animate-fade-in">
      <div class="flex items-center gap-3">
        <button id="add-account-btn" class="btn-primary">
          <i data-lucide="plus" class="w-4 h-4"></i> Nueva Cuenta
        </button>
        <button id="add-transaction-btn" class="btn-secondary">
          <i data-lucide="plus-circle" class="w-4 h-4"></i> Transacción
        </button>
        <button id="add-transfer-btn" class="btn-secondary">
          <i data-lucide="arrow-left-right" class="w-4 h-4"></i> Transferencia
        </button>
      </div>
      <div class="flex items-center gap-2">
         <button id="export-csv-btn" class="btn-secondary-outline">
          <i data-lucide="download" class="w-4 h-4"></i> Exportar
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex space-x-4 border-b border-surface-100 mb-6">
      <button class="tab-btn active" data-tab="summary">Resumen</button>
      <button class="tab-btn" data-tab="transactions">Transacciones</button>
      <button class="tab-btn" data-tab="reports">Reportes Corporativos</button>
    </div>

    <!-- Performance Analysis (Individual Properties) -->
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
          <p class="text-surface-400 font-medium">Selecciona una propiedad para ver su rendimiento individual</p>
        </div>
      </div>
    </div>

    <div id="financial-tabs-content">
      <div id="summary-tab" class="tab-content transition-all duration-300">
         <!-- Accounts Cards -->
         <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
           ${accounts.map(acc => `
             <div class="glass-card p-5">
               <div class="flex items-center justify-between mb-3">
                 <span class="badge ${acc.is_active ? 'badge-green' : 'badge-gray'}">${acc.account_type}</span>
                 <span class="text-xs text-surface-400">${acc.currency}</span>
               </div>
               <p class="text-sm font-medium text-surface-700 mb-1">${acc.account_name}</p>
               ${acc.bank_name ? `<p class="text-xs text-surface-400 mb-2">${acc.bank_name}</p>` : ''}
               <p class="text-2xl font-bold ${acc.current_balance >= 0 ? 'text-accent-600' : 'text-rose-600'}">
                 ${formatCurrency(acc.current_balance)}
               </p>
             </div>
           `).join('')}
         </div>
      </div>

      <div id="transactions-tab" class="tab-content hidden transition-all duration-300">
         <!-- Transaction Ledger -->
         <div class="glass-card-static overflow-hidden animate-fade-in">
           <table class="data-table">
             <thead>
               <tr>
                 <th>Fecha</th>
                 <th>Descripción</th>
                 <th>Categoría</th>
                 <th>Tipo</th>
                 <th>Monto</th>
                 <th>Dirección</th>
               </tr>
             </thead>
             <tbody>
               ${transactions.length > 0 ? transactions.map(tx => `
                 <tr>
                   <td class="text-xs text-surface-500">${formatDate(tx.transaction_date)}</td>
                   <td><div class="font-medium text-surface-900 text-sm">${tx.description}</div></td>
                   <td><span class="badge badge-gray text-xs">${tx.category}</span></td>
                   <td class="text-xs text-surface-500">${tx.transaction_type}</td>
                   <td class="font-semibold ${tx.direction === 'Debit' ? 'text-accent-600' : 'text-rose-600'}">
                     ${tx.direction === 'Debit' ? '+' : '-'}${formatCurrency(tx.amount)}
                   </td>
                   <td>
                     <span class="badge ${tx.direction === 'Debit' ? 'badge-green' : 'badge-red'} text-xs">
                       ${tx.direction === 'Debit' ? 'Ingreso' : 'Egreso'}
                     </span>
                   </td>
                 </tr>
               `).join('') : `
                 <tr><td colspan="6" class="text-center py-12 text-surface-400">No hay transacciones</td></tr>
               `}
             </tbody>
           </table>
         </div>
      </div>

      <div id="reports-tab" class="tab-content hidden transition-all duration-300">
         <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="glass-card p-6" id="balance-sheet-container">
              <h3 class="font-bold mb-4">Balance General</h3>
              <p class="text-surface-400 text-sm">Cargando estado...</p>
            </div>
            <div class="glass-card p-6" id="income-statement-container">
              <h3 class="font-bold mb-4">Estado de Resultados</h3>
              <p class="text-surface-400 text-sm">Cargando estado...</p>
            </div>
         </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // Add Account
  document.getElementById('add-account-btn')?.addEventListener('click', () => openAccountModal());

  // Add Transaction
  document.getElementById('add-transaction-btn')?.addEventListener('click', () => openTransactionModal(accounts, properties));

  // Add Transfer
  document.getElementById('add-transfer-btn')?.addEventListener('click', () => openTransferModal(accounts));

  // Export CSV
  document.getElementById('export-csv-btn')?.addEventListener('click', async () => {
    window.location.href = `${api.baseUrl}/reports/export`;
  });

  // Performance Selector
  document.getElementById('performance-property-select')?.addEventListener('change', (e) => loadPerformance(e.target.value));

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      document.getElementById(`${tab}-tab`).classList.remove('hidden');
      if (tab === 'reports') loadReports();
    });
  });
}

async function loadPerformance(propertyId) {
  if (!propertyId) return;
  const content = document.getElementById('performance-content');
  content.innerHTML = '<p class="animate-pulse">Calculando métricas...</p>';

  const perf = await api.get(`/properties/${propertyId}/performance`);
  if (!perf) return;

  content.innerHTML = `
    <div class="animate-fade-in">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm hover:shadow-md transition-shadow">
          <p class="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Ingresos Totales</p>
          <p class="text-2xl font-bold text-accent-600">${formatCurrency(perf.total_income)}</p>
          <div class="mt-2 text-[10px] text-accent-500 font-medium flex items-center gap-1">
            <i data-lucide="trending-up" class="w-3 h-3"></i> Acumulado histórico
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm hover:shadow-md transition-shadow">
          <p class="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Gastos Totales</p>
          <p class="text-2xl font-bold text-rose-600">${formatCurrency(perf.total_expenses)}</p>
          <div class="mt-2 text-[10px] text-rose-500 font-medium flex items-center gap-1">
            <i data-lucide="trending-down" class="w-3 h-3"></i> Acumulado histórico
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm hover:shadow-md transition-shadow">
          <p class="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Utilidad Neta</p>
          <p class="text-2xl font-bold text-primary-600">${formatCurrency(perf.net_profit)}</p>
          <div class="mt-2 text-[10px] text-primary-500 font-medium flex items-center gap-1">
            <i data-lucide="wallet" class="w-3 h-3"></i> Saldo operacional
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm hover:shadow-md transition-shadow">
          <p class="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">ROI (Retorno)</p>
          <p class="text-2xl font-bold text-indigo-600">${perf.roi}%</p>
          <div class="mt-2 text-[10px] text-indigo-500 font-medium flex items-center gap-1">
            <i data-lucide="percent" class="w-3 h-3"></i> Sobre valor comercial
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-white p-6 rounded-2xl border border-surface-100 shadow-sm">
          <h4 class="text-sm font-bold text-surface-900 mb-4 flex items-center gap-2">
            <i data-lucide="history" class="w-4 h-4 text-primary-500"></i>
            Últimos Movimientos
          </h4>
          <div class="overflow-x-auto">
            <table class="data-table text-xs">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                ${perf.last_transactions.length > 0 ? perf.last_transactions.map(tx => `
                  <tr>
                    <td class="text-surface-500">${formatDate(tx.transaction_date)}</td>
                    <td class="font-medium text-surface-800">${tx.description}</td>
                    <td class="font-bold ${tx.direction === 'Debit' ? 'text-accent-600' : 'text-rose-600'}">
                      ${tx.direction === 'Debit' ? '+' : '-'}${formatCurrency(tx.amount)}
                    </td>
                  </tr>
                `).join('') : '<tr><td colspan="3" class="text-center py-4 text-surface-400">Sin movimientos</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-2xl border border-surface-100 shadow-sm">
          <h4 class="text-sm font-bold text-surface-900 mb-4 flex items-center gap-2">
            <i data-lucide="pie-chart" class="w-4 h-4 text-primary-500"></i>
            Distribución Financiera
          </h4>
          <div class="h-[200px] flex items-center justify-center">
            <canvas id="property-mini-chart"></canvas>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-2 text-[10px] items-center">
             <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-accent-500"></span> Ingresos</div>
             <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-rose-500"></span> Gastos</div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // Mini Chart for the property
  const ctx = document.getElementById('property-mini-chart');
  if (ctx) {
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Ingresos', 'Gastos'],
        datasets: [{
          data: [perf.total_income, perf.total_expenses],
          backgroundColor: ['#20c997', '#f03e3e'],
          borderWidth: 0,
          cutout: '75%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }
}

function openTransferModal(accounts) {
  showModal('Transferencia entre Cuentas', `
    <form id="transfer-form" class="space-y-4">
      <div>
        <label class="label">Cuenta Origen *</label>
        <select class="select" name="source_account_id" required>
          ${accounts.map(a => `<option value="${a.id}">${a.account_name} (${formatCurrency(a.current_balance)})</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="label">Cuenta Destino *</label>
        <select class="select" name="destination_account_id" required>
          ${accounts.map(a => `<option value="${a.id}">${a.account_name}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="label">Monto *</label>
        <input class="input" name="amount" type="number" step="0.01" required placeholder="500000" />
      </div>
      <div>
        <label class="label">Descripción *</label>
        <input class="input" name="description" required placeholder="Traslado de fondos para nómina" />
      </div>
      <div>
        <label class="label">Fecha *</label>
        <input class="input" name="transaction_date" type="date" required value="${new Date().toISOString().split('T')[0]}" />
      </div>
    </form>
  `, {
    confirmText: 'Realizar Transferencia',
    onConfirm: async () => {
      const form = document.getElementById('transfer-form');
      const fd = new FormData(form);
      const payload = {};
      fd.forEach((v, k) => {
        if (k === 'amount') payload[k] = parseFloat(v);
        else payload[k] = v;
      });
      if (payload.source_account_id === payload.destination_account_id) {
        showToast('Las cuentas deben ser diferentes', 'error');
        return;
      }
      await api.post('/accounts/transfer', payload);
      showToast('Transferencia completada', 'success');
      await renderFinancials(document.getElementById('page-content'));
    }
  });
}

function openAccountModal() {
  showModal('Nueva Cuenta Bancaria', `
    <form id="account-form" class="space-y-4">
      <div>
        <label class="label">Nombre de la Cuenta *</label>
        <input class="input" name="account_name" required placeholder="Cuenta Corriente Principal" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Tipo *</label>
          <select class="select" name="account_type" required>
            <option value="Corriente">Corriente</option>
            <option value="Ahorros">Ahorros</option>
            <option value="Inversión">Inversión</option>
            <option value="Caja Menor">Caja Menor</option>
          </select>
        </div>
        <div>
          <label class="label">Saldo Inicial</label>
          <input class="input" name="initial_balance" type="number" step="0.01" value="0" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Banco</label>
          <input class="input" name="bank_name" placeholder="Bancolombia" />
        </div>
        <div>
          <label class="label">Moneda</label>
          <input class="input" name="currency" value="COP" maxlength="3" />
        </div>
      </div>
    </form>
  `, {
    confirmText: 'Crear Cuenta',
    onConfirm: async () => {
      const form = document.getElementById('account-form');
      const fd = new FormData(form);
      const payload = {};
      fd.forEach((v, k) => {
        if (k === 'initial_balance') payload[k] = parseFloat(v) || 0;
        else if (v) payload[k] = v;
      });

      try {
        await api.post('/accounts', payload);
        showToast('Cuenta creada correctamente', 'success');
        await renderFinancials(document.getElementById('page-content'));
      } catch (err) {
        console.error('Error al crear cuenta:', err);
        showToast(`Error: ${err.message}`, 'error');
        throw err; // Re-throw to keep modal open if onConfirm handles it
      }
    },
  });
}

function openTransactionModal(accounts, properties = []) {
  showModal('Registrar Transacción', `
    <form id="tx-form" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Cuenta *</label>
          <select class="select" name="account_id" required>
            ${accounts.map(a => `<option value="${a.id}">${a.account_name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="label">Propiedad *</label>
          <select class="select" name="property_id" required>
            <option value="">Seleccione...</option>
            ${properties.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Tipo *</label>
          <select class="select" name="transaction_type" required id="tx-type-select">
            <option value="Ingreso">Ingreso</option>
            <option value="Gasto">Gasto</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Inversión">Inversión</option>
            <option value="Interés">Interés</option>
            <option value="Abono">Abono</option>
            <option value="Crédito">Crédito</option>
            <option value="Ajuste">Ajuste</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Monto *</label>
          <input class="input" name="amount" type="number" step="0.01" min="0.01" required placeholder="1500000" />
        </div>
        <div>
          <label class="label">Categoría *</label>
          <select class="select" name="category" required>
            <option value="Ingresos por Arriendo">Ingresos por Arriendo</option>
            <option value="Gastos Mantenimiento">Gastos Mantenimiento</option>
            <option value="Impuestos y Tasas">Impuestos y Tasas</option>
            <option value="Cuotas de Administración">Cuotas de Administración</option>
            <option value="Servicios Públicos">Servicios Públicos</option>
            <option value="Honorarios Gestión">Honorarios Gestión</option>
            <option value="Seguros">Seguros</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
      </div>
      <div>
        <label class="label">Descripción *</label>
        <input class="input" name="description" required placeholder="Pago de canon mes de marzo" />
      </div>
      <div>
        <label class="label">Fecha *</label>
        <input class="input" name="transaction_date" type="date" required value="${new Date().toISOString().split('T')[0]}" />
      </div>
    </form>
  `, {
    confirmText: 'Registrar',
    onConfirm: async () => {
      const form = document.getElementById('tx-form');
      const fd = new FormData(form);
      const payload = {};
      fd.forEach((v, k) => {
        if (k === 'amount') payload[k] = parseFloat(v);
        else payload[k] = v;
      });
      // Auto-map direction
      if (payload.transaction_type === 'Ingreso') payload.direction = 'Debit';
      else if (payload.transaction_type === 'Gasto') payload.direction = 'Credit';
      await api.post('/transactions', payload);
      showToast('Transacción registrada', 'success');
      await renderFinancials(document.getElementById('page-content'));
    },
  });
}

async function loadReports() {
  const [balance, income] = await Promise.all([
    api.get('/reports/balance-sheet'),
    api.get(`/reports/income-statement?start_date=${new Date().getFullYear()}-01-01&end_date=${new Date().toISOString().split('T')[0]}`)
  ]);

  const balanceContainer = document.getElementById('balance-sheet-container');
  const incomeContainer = document.getElementById('income-statement-container');

  if (balance) {
    balanceContainer.innerHTML = `
      <h3 class="font-bold mb-4 flex items-center justify-between">
        Balance General 
        <span class="text-xs font-normal text-surface-400">${formatDate(balance.date)}</span>
      </h3>
      <div class="space-y-3">
        ${balance.accounts.map(acc => `
          <div class="flex justify-between text-sm py-2 border-b border-surface-50">
            <span class="text-surface-600">${acc.account_name}</span>
            <span class="font-semibold">${formatCurrency(acc.current_balance)}</span>
          </div>
        `).join('')}
        <div class="flex justify-between text-lg font-bold pt-4 text-primary-600">
          <span>Total Activos</span>
          <span>${formatCurrency(balance.total_assets)}</span>
        </div>
      </div>
    `;
  }

  if (income) {
    incomeContainer.innerHTML = `
      <h3 class="font-bold mb-4">Estado de Resultados (Año Actual)</h3>
      <div class="space-y-4">
        <div>
          <p class="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Ingresos</p>
          ${Object.entries(income.income).map(([cat, val]) => `
            <div class="flex justify-between text-sm mb-1">
              <span>${cat}</span>
              <span class="text-accent-600">+${formatCurrency(val)}</span>
            </div>
          `).join('')}
        </div>
        <div>
          <p class="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Egresos</p>
          ${Object.entries(income.expenses).map(([cat, val]) => `
            <div class="flex justify-between text-sm mb-1">
              <span>${cat}</span>
              <span class="text-rose-600">-${formatCurrency(val)}</span>
            </div>
          `).join('')}
        </div>
        <div class="border-t border-surface-100 pt-3 mt-4">
          <div class="flex justify-between text-lg font-bold ${income.net_income >= 0 ? 'text-accent-600' : 'text-rose-600'}">
            <span>Utilidad Neta</span>
            <span>${formatCurrency(income.net_income)}</span>
          </div>
        </div>
      </div>
    `;
  }
}
