/**
 * Contracts Page — lease management.
 */
import { api } from '../api.js';
import { formatCurrency, formatDate, statusBadge } from '../utils/formatters.js';
import { showToast, showModal } from '../components/modal.js';

export async function renderContracts(container) {
    const data = await api.get('/contracts?limit=50');
    const contracts = data.items || [];

    container.innerHTML = `
    <div class="flex items-center justify-between mb-6 animate-fade-in">
      <select id="fc-status" class="select text-sm py-2 w-40">
        <option value="">Todos</option>
        <option value="Activo">Activo</option>
        <option value="Borrador">Borrador</option>
        <option value="Finalizado">Finalizado</option>
      </select>
      <button id="add-contract-btn" class="btn-primary"><i data-lucide="plus" class="w-4 h-4"></i> Nuevo Contrato</button>
    </div>
    <div class="glass-card-static overflow-hidden animate-fade-in">
      <table class="data-table"><thead><tr>
        <th>Arrendatario</th><th>Tipo</th><th>Canon</th><th>Inicio</th><th>Fin</th><th>Estado</th><th></th>
      </tr></thead><tbody>
      ${contracts.length ? contracts.map(c => `<tr>
        <td><div class="font-semibold text-sm">${c.tenant_name}</div>${c.tenant_email ? `<div class="text-xs text-surface-400">${c.tenant_email}</div>` : ''}</td>
        <td><span class="badge badge-gray text-xs">${c.contract_type}</span></td>
        <td class="font-medium text-accent-600">${formatCurrency(c.monthly_rent)}</td>
        <td class="text-xs">${formatDate(c.start_date)}</td>
        <td class="text-xs">${formatDate(c.end_date)}</td>
        <td><span class="badge ${statusBadge(c.status)} text-xs">${c.status}</span></td>
        <td><div class="flex gap-1">
          ${c.status === 'Borrador' ? `<button class="btn-ghost text-xs py-1 px-2 activate-btn" data-id="${c.id}" title="Activar"><i data-lucide="check-circle" class="w-3.5 h-3.5 text-accent-500"></i></button>` : ''}
          <button class="btn-ghost text-xs py-1 px-2 payments-btn" data-id="${c.id}" title="Pagos"><i data-lucide="calendar" class="w-3.5 h-3.5"></i></button>
        </div></td>
      </tr>`).join('') : '<tr><td colspan="7" class="text-center py-12 text-surface-400">No hay contratos</td></tr>'}
      </tbody></table>
    </div>`;
    if (window.lucide) lucide.createIcons();

    document.getElementById('add-contract-btn').addEventListener('click', () => openContractModal());
    document.querySelectorAll('.activate-btn').forEach(b => b.addEventListener('click', async () => {
        await api.post(`/contracts/${b.dataset.id}/activate`, {});
        showToast('Contrato activado', 'success');
        await renderContracts(container);
    }));
    document.querySelectorAll('.payments-btn').forEach(b => b.addEventListener('click', async () => {
        const payments = await api.get(`/contracts/${b.dataset.id}/payments`);
        showModal('Cronograma de Pagos', `<div class="max-h-64 overflow-y-auto">
      <table class="data-table text-xs"><thead><tr><th>Fecha</th><th>Monto</th><th>Estado</th></tr></thead><tbody>
      ${payments.map(p => `<tr><td>${formatDate(p.due_date)}</td><td class="font-medium">${formatCurrency(p.amount)}</td>
        <td><span class="badge ${statusBadge(p.status)} text-xs">${p.status}</span></td></tr>`).join('')}
      </tbody></table></div>`, { showCancel: false });
    }));
}

function openContractModal() {
    const today = new Date().toISOString().split('T')[0];
    showModal('Nuevo Contrato', `<form id="cf" class="space-y-4">
    <div><label class="label">Propiedad ID *</label><input class="input" name="property_id" required /></div>
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
