/**
 * Contracts Page — lease management.
 */
import { api } from '../api.js';
import { formatCurrency, formatDate, statusBadge } from '../utils/formatters.js';
import { showToast, showModal } from '../components/modal.js';

export async function renderContracts(container) {
  const [contractsData, propertiesData] = await Promise.all([
    api.get('/contracts?limit=50'),
    api.get('/properties?limit=100')
  ]);
  const contracts = contractsData.items || [];
  const properties = propertiesData.items || [];

  container.innerHTML = `
    <div class="space-y-6 animate-fade-in">
        <div class="flex border-b border-surface-200 mb-4">
            <button class="tab-btn active px-4 py-2 text-primary-600 border-b-2 border-primary-600 font-medium" data-tab="list">Contratos</button>
            <button class="tab-btn px-4 py-2 text-surface-500 hover:text-surface-700 font-medium" data-tab="tenants">Inquilinos</button>
        </div>
        <div id="contracts-tab-content">
            <!-- Content -->
        </div>
    </div>
  `;

  const tabContent = container.querySelector('#contracts-tab-content');
  const tabs = container.querySelectorAll('.tab-btn');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active', 'text-primary-600', 'border-primary-600', 'border-b-2'); t.classList.add('text-surface-500'); });
      tab.classList.remove('text-surface-500');
      tab.classList.add('active', 'text-primary-600', 'border-primary-600', 'border-b-2');
      if (tab.dataset.tab === 'list') {
        renderContractsList(tabContent, contracts, properties);
      } else {
        renderTenantsList(tabContent, contracts);
      }
    });
  });

  renderContractsList(tabContent, contracts, properties);
}

function renderContractsList(container, contracts, properties) {
  container.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6 animate-fade-in glass-card-static p-4 !rounded-2xl border-white/40 shadow-sm">
      <div class="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm">
        <i data-lucide="filter" class="w-3.5 h-3.5 text-surface-400"></i>
        <select id="fc-status" class="bg-transparent text-sm font-medium focus:outline-none min-w-[140px] appearance-none">
          <option value="">Todos los estados</option>
          <option value="Activo">Activo</option>
          <option value="Borrador">Borrador</option>
          <option value="Finalizado">Finalizado</option>
        </select>
      </div>
      <button id="add-contract-btn" class="btn-primary !rounded-xl shadow-lg shadow-primary-500/20 py-2.5 px-5">
        <i data-lucide="plus" class="w-4 h-4"></i> Nuevo Contrato
      </button>
    </div>
    <div class="glass-card-static overflow-hidden animate-fade-in shadow-sm border-white/40">
      <table class="data-table"><thead><tr>
        <th>Arrendatario</th>
        <th>Propiedad</th>
        <th>Tipo/Canon</th>
        <th>Vigencia</th>
        <th>Estado</th>
        <th class="text-right">Acciones</th>
      </tr></thead><tbody>
      ${contracts.length ? contracts.map(c => `<tr>
        <td>
          <div class="font-bold text-surface-900">${c.tenant_name}</div>
          ${c.tenant_email ? `<div class="text-[10px] text-surface-400 font-medium">${c.tenant_email}</div>` : ''}
        </td>
        <td>
          <div class="font-bold text-primary-600 text-xs">${c.property_name || 'Sin asignar'}</div>
          <div class="text-[10px] text-surface-400 italic truncate max-w-[150px]">${c.property_address || ''}</div>
        </td>
        <td>
          <span class="badge badge-gray text-[10px] mr-1">${c.contract_type}</span>
          <div class="font-black text-accent-700 mt-0.5">${formatCurrency(c.monthly_rent)}</div>
        </td>
        <td class="text-xs text-surface-500 font-medium whitespace-nowrap">
          ${formatDate(c.start_date)} <span class="text-surface-300">→</span> ${formatDate(c.end_date)}
        </td>
        <td><span class="badge ${statusBadge(c.status)} text-[10px] font-bold">${c.status}</span></td>
        <td class="text-right"><div class="flex justify-end gap-1">
          ${c.status === 'Borrador' ? `<button class="btn-ghost text-xs p-1.5 activate-btn hover:bg-accent-50 rounded-lg group" data-id="${c.id}" title="Activar"><i data-lucide="check-circle" class="w-4 h-4 text-accent-500 group-hover:scale-110 transition-transform"></i></button>` : ''}
          <button class="btn-ghost text-xs p-1.5 pdf-btn hover:bg-red-50 rounded-lg group" data-id="${c.id}" title="Generar Carta"><i data-lucide="file-text" class="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform"></i></button>
          <button class="btn-ghost text-xs p-1.5 payments-btn hover:bg-primary-50 rounded-lg group" data-id="${c.id}" title="Pagos"><i data-lucide="calendar" class="w-4 h-4 text-primary-500 group-hover:scale-110 transition-transform"></i></button>
        </div></td>
      </tr>`).join('') : '<tr><td colspan="6" class="text-center py-20 text-surface-400 font-medium italic">No hay contratos registrados</td></tr>'}
      </tbody></table>
    </div>`;
  if (window.lucide) lucide.createIcons();

  document.getElementById('add-contract-btn').addEventListener('click', () => openContractModal(properties));
  document.querySelectorAll('.activate-btn').forEach(b => b.addEventListener('click', async () => {
    await api.post(`/contracts/${b.dataset.id}/activate`, {});
    showToast('Contrato activado', 'success');
    renderContractsList(container, contracts, properties); // Simplified refresh for demonstration
  }));

  // PDF Termination Letter
  document.querySelectorAll('.pdf-btn').forEach(b => b.addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    showModal('Generar Carta de Terminación', `
        <form id="pdf-form" class="space-y-4">
            <div>
                <label class="label">Motivo</label>
                <input class="input" name="reason" value="Terminación por mutuo acuerdo" required />
            </div>
            <div>
                <label class="label">Fecha de Terminación</label>
                <input class="input" type="date" name="termination_date" value="${today}" required />
            </div>
        </form>
      `, {
      confirmText: 'Generar PDF',
      onConfirm: async () => {
        const fd = new FormData(document.getElementById('pdf-form'));
        const payload = Object.fromEntries(fd);
        const res = await api.post(`/contracts/${b.dataset.id}/termination-letter`, payload);
        showToast('PDF Generado', 'success');
        if (res.pdf_url) {
          // Reconstruct full API url if it's relative
          window.open(api.opts.baseUrl.replace('/api/v1', '') + res.pdf_url, '_blank');
        }
      }
    });
  }));

  document.querySelectorAll('.payments-btn').forEach(b => b.addEventListener('click', async () => {
    const [payments, accountsData] = await Promise.all([
      api.get(`/contracts/${b.dataset.id}/payments`),
      api.get('/accounts')
    ]);
    const accounts = accountsData.items || accountsData || [];

    showModal('Cronograma de Pagos', `
      <div class="space-y-4">
        <div class="max-h-80 overflow-y-auto border border-surface-100 rounded-xl">
          <table class="data-table text-xs">
            <thead class="sticky top-0 bg-white z-10 shadow-sm">
              <tr><th>Fecha</th><th>Monto</th><th>Estado</th><th class="text-right">Acción</th></tr>
            </thead>
            <tbody>
              ${payments.map(p => `
                <tr class="hover:bg-surface-50">
                  <td class="font-medium">${formatDate(p.due_date)}</td>
                  <td class="font-black text-accent-700">${formatCurrency(p.amount)}</td>
                  <td><span class="badge ${statusBadge(p.status)} text-[10px] uppercase font-bold">${p.status}</span></td>
                  <td class="text-right">
                    ${p.status === 'Pendiente' ? `
                      <button class="btn-primary py-1 px-3 text-[10px] pay-payment-btn" 
                        data-pid="${p.id}" data-cid="${b.dataset.id}" data-amount="${p.amount}">
                        PAGAR
                      </button>
                    ` : '<i data-lucide="check" class="w-4 h-4 text-accent-500 ml-auto"></i>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div id="payment-receipt-box" class="hidden p-4 bg-primary-50 border border-primary-100 rounded-xl animate-fade-in">
          <h5 class="text-xs font-bold text-primary-900 mb-2 uppercase tracking-tight">Confirmar Recepción de Pago</h5>
          <div class="flex flex-col gap-3">
            <div>
              <label class="block text-[10px] font-bold text-primary-700 mb-1 uppercase">Cuenta de Destino</label>
              <select id="pay-account-id" class="select text-xs py-1.5 w-full">
                ${accounts.map(a => `<option value="${a.id}">${a.account_name} (${formatCurrency(a.current_balance)})</option>`).join('')}
              </select>
            </div>
            <button id="confirm-pay-btn" class="btn-primary w-full py-2">Confirmar Pago</button>
          </div>
        </div>
      </div>
    `, { showCancel: false });

    if (window.lucide) lucide.createIcons();

    let selectedPayment = null;
    document.querySelectorAll('.pay-payment-btn').forEach(pb => pb.addEventListener('click', (e) => {
      selectedPayment = {
        pid: pb.dataset.pid,
        cid: pb.dataset.cid
      };
      document.getElementById('payment-receipt-box').classList.remove('hidden');
      pb.closest('tr').classList.add('bg-primary-50');
    }));

    document.getElementById('confirm-pay-btn')?.addEventListener('click', async () => {
      if (!selectedPayment) return;
      const accountId = document.getElementById('pay-account-id').value;
      try {
        await api.post(`/contracts/${selectedPayment.cid}/payments/${selectedPayment.pid}/pay?account_id=${accountId}`, {});
        showToast('Pago registrado correctamente', 'success');
        // Refresh view
        await renderContracts(container);
        // We could also refresh the modal, but better to just close or refresh full page
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }));
}

function openContractModal(properties = []) {
  const today = new Date().toISOString().split('T')[0];
  showModal('Nuevo Contrato', `<form id="cf" class="space-y-4">
    <div>
      <label class="label">Propiedad *</label>
      <select class="select" name="property_id" required>
        <option value="">Seleccione propiedad...</option>
        ${properties.map(p => `<option value="${p.id}">${p.name} (${p.property_type})</option>`).join('')}
      </select>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Arrendatario *</label><input class="input" name="tenant_name" required /></div>
      <div><label class="label">Email</label><input class="input" name="tenant_email" type="email" /></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Teléfono</label><input class="input" name="tenant_phone" /></div>
      <div><label class="label">Documento</label><input class="input" name="tenant_document" /></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Tipo *</label><select class="select" name="contract_type"><option value="Vivienda">Vivienda</option><option value="Comercial">Comercial</option><option value="Garaje">Garaje</option></select></div>
      <div><label class="label">Canon Mensual *</label><input class="input" name="monthly_rent" type="number" step="0.01" required /></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Inicio *</label><input class="input" name="start_date" type="date" required value="${today}" /></div>
      <div><label class="label">Fin *</label><input class="input" name="end_date" type="date" required /></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Depósito</label><input class="input" name="deposit_amount" type="number" step="0.01" /></div>
      <div><label class="label">Incremento Anual %</label><input class="input" name="annual_increment_pct" type="number" step="0.01" value="5" /></div>
    </div>
  </form>`, {
    confirmText: 'Crear', onConfirm: async () => {
      const fd = new FormData(document.getElementById('cf')); const p = {};
      fd.forEach((v, k) => { if (!v) return; p[k] = ['monthly_rent', 'deposit_amount', 'annual_increment_pct'].includes(k) ? parseFloat(v) : v; });
      p.auto_renewal = false;
      await api.post('/contracts', p); showToast('Contrato creado', 'success');
      await renderContracts(document.getElementById('page-content'));
    }
  });
}

function renderTenantsList(container, contracts) {
  // Unique tenants
  const tenantsMap = {};
  contracts.forEach(c => {
    if (!tenantsMap[c.tenant_name]) {
      tenantsMap[c.tenant_name] = {
        name: c.tenant_name,
        email: c.tenant_email,
        phone: c.tenant_phone,
        document: c.tenant_document,
        active_contracts: 0
      };
    }
    if (c.status === 'Activo') {
      tenantsMap[c.tenant_name].active_contracts++;
    }
  });

  const tenants = Object.values(tenantsMap);

  container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        ${tenants.length ? tenants.map(t => `
            <div class="glass-card-static p-5 flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg shrink-0">
                    ${t.name.charAt(0)}
                </div>
                <div class="min-w-0 flex-1">
                    <h4 class="font-bold text-surface-900 truncate">${t.name}</h4>
                    <p class="text-xs text-surface-500 mt-1"><i data-lucide="mail" class="w-3 h-3 inline mr-1"></i>${t.email || '-'}</p>
                    <p class="text-xs text-surface-500 mt-1"><i data-lucide="phone" class="w-3 h-3 inline mr-1"></i>${t.phone || '-'}</p>
                    <p class="text-xs text-surface-500 mt-1"><i data-lucide="credit-card" class="w-3 h-3 inline mr-1"></i>${t.document || '-'}</p>
                    <div class="mt-3">
                        <span class="badge ${t.active_contracts > 0 ? 'badge-green' : 'badge-gray'} text-xs">
                            ${t.active_contracts} Contratos Activos
                        </span>
                    </div>
                </div>
            </div>
        `).join('') : '<div class="col-span-full py-12 text-center text-surface-500">No hay inquilinos registrados.</div>'}
        </div>
    `;
  if (window.lucide) lucide.createIcons();
}
