/**
 * Maintenance Page — work orders, status management.
 */
import { api } from '../api.js';
import { formatCurrency, formatDate, statusBadge } from '../utils/formatters.js';
import { showToast, showModal } from '../components/modal.js';

export async function renderMaintenance(container) {
    const data = await api.get('/maintenance?limit=50');
    const orders = data.items || [];

    container.innerHTML = `
    <div class="flex items-center justify-between mb-6 animate-fade-in">
      <div class="flex items-center gap-3">
        <select id="fm-status" class="select text-sm py-2 w-44">
          <option value="">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En Progreso">En Progreso</option>
          <option value="Completado">Completado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>
      <button id="add-maint-btn" class="btn-primary"><i data-lucide="plus" class="w-4 h-4"></i> Nueva Orden</button>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in">
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-amber-500">${orders.filter(o => o.status === 'Pendiente').length}</p>
        <p class="text-xs text-surface-500 mt-1">Pendientes</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-primary-500">${orders.filter(o => o.status === 'En Progreso').length}</p>
        <p class="text-xs text-surface-500 mt-1">En Progreso</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-accent-500">${orders.filter(o => o.status === 'Completado').length}</p>
        <p class="text-xs text-surface-500 mt-1">Completados</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-rose-500">${formatCurrency(orders.reduce((s, o) => s + (o.actual_cost || 0), 0))}</p>
        <p class="text-xs text-surface-500 mt-1">Costo Total</p>
      </div>
    </div>
    <div class="glass-card-static overflow-hidden animate-fade-in">
      <table class="data-table"><thead><tr>
        <th>Título</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Costo Est.</th><th>Fecha</th><th></th>
      </tr></thead><tbody>
      ${orders.length ? orders.map(o => `<tr>
        <td><div class="font-semibold text-sm">${o.title}</div>${o.supplier_name ? `<div class="text-xs text-surface-400">${o.supplier_name}</div>` : ''}</td>
        <td><span class="badge badge-gray text-xs">${o.maintenance_type}</span></td>
        <td><span class="badge ${o.priority === 'Urgente' ? 'badge-red' : o.priority === 'Alta' ? 'badge-amber' : 'badge-gray'} text-xs">${o.priority}</span></td>
        <td><span class="badge ${statusBadge(o.status)} text-xs">${o.status}</span></td>
        <td class="text-sm">${formatCurrency(o.estimated_cost)}</td>
        <td class="text-xs text-surface-500">${formatDate(o.scheduled_date)}</td>
        <td>${o.status !== 'Completado' && o.status !== 'Cancelado' ? `<button class="btn-ghost text-xs py-1 px-2 status-btn" data-id="${o.id}"><i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></button>` : ''}</td>
      </tr>`).join('') : '<tr><td colspan="7" class="text-center py-12 text-surface-400">No hay órdenes</td></tr>'}
      </tbody></table>
    </div>`;
    if (window.lucide) lucide.createIcons();
    document.getElementById('add-maint-btn').addEventListener('click', () => openMaintModal());
    document.querySelectorAll('.status-btn').forEach(b => b.addEventListener('click', () => openStatusModal(b.dataset.id)));
}

function openMaintModal() {
    showModal('Nueva Orden', `<form id="mf" class="space-y-4">
    <div><label class="label">Propiedad ID *</label><input class="input" name="property_id" required /></div>
    <div><label class="label">Título *</label><input class="input" name="title" required placeholder="Reparación tubería" /></div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Tipo *</label><select class="select" name="maintenance_type"><option value="Correctivo">Correctivo</option><option value="Preventivo">Preventivo</option><option value="Mejora">Mejora</option></select></div>
      <div><label class="label">Prioridad</label><select class="select" name="priority"><option value="Media">Media</option><option value="Baja">Baja</option><option value="Alta">Alta</option><option value="Urgente">Urgente</option></select></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Costo Est.</label><input class="input" name="estimated_cost" type="number" step="0.01" /></div>
      <div><label class="label">Fecha</label><input class="input" name="scheduled_date" type="date" /></div>
    </div>
    <div><label class="label">Proveedor</label><input class="input" name="supplier_name" /></div>
    <div><label class="label">Notas</label><textarea class="input" name="notes" rows="2"></textarea></div>
  </form>`, {
        confirmText: 'Crear', onConfirm: async () => {
            const fd = new FormData(document.getElementById('mf')); const p = {};
            fd.forEach((v, k) => { if (!v) return; p[k] = k === 'estimated_cost' ? parseFloat(v) : v; });
            await api.post('/maintenance', p); showToast('Orden creada', 'success');
            await renderMaintenance(document.getElementById('page-content'));
        }
    });
}

function openStatusModal(id) {
    showModal('Cambiar Estado', `<form id="sf" class="space-y-4">
    <div><label class="label">Estado *</label><select class="select" name="status">
      <option value="Pendiente">Pendiente</option><option value="En Progreso">En Progreso</option>
      <option value="Esperando Factura">Esperando Factura</option><option value="Completado">Completado</option>
      <option value="Cancelado">Cancelado</option></select></div>
    <div><label class="label">Notas</label><textarea class="input" name="notes" rows="2"></textarea></div>
  </form>`, {
        confirmText: 'Actualizar', onConfirm: async () => {
            const fd = new FormData(document.getElementById('sf'));
            const p = { status: fd.get('status') }; if (fd.get('notes')) p.notes = fd.get('notes');
            await api.put(`/maintenance/${id}/status`, p); showToast('Estado actualizado', 'success');
            await renderMaintenance(document.getElementById('page-content'));
        }
    });
}
