import { api } from '../api.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { showToast, showModal } from '../components/modal.js';

export async function renderSuppliers(container, state) {
    try {
        const data = await api.get('/contacts?contact_type=Proveedor&limit=100');
        const suppliers = data.items || [];

        container.innerHTML = `
        <div class="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h2 class="text-2xl font-bold text-surface-900">Directorio de Proveedores</h2>
            <p class="text-surface-500">Gestión de tiempos, cotizaciones y facturas</p>
          </div>
          <button id="add-supplier-btn" class="btn-primary">
            <i data-lucide="plus" class="w-4 h-4 mr-2"></i> Nuevo Proveedor
          </button>
        </div>
        
        <div class="glass-card overflow-hidden animate-fade-in">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-50/50 border-b border-surface-200 text-sm font-semibold text-surface-600">
                <th class="p-4">Proveedor</th>
                <th class="p-4">Especialidad</th>
                <th class="p-4">Contacto</th>
                <th class="p-4">Estado</th>
                <th class="p-4 text-center">Desempeño</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100/50">
              ${suppliers.length === 0 ? `
                <tr><td colspan="5" class="p-8 text-center text-surface-500">No hay proveedores registrados.</td></tr>
              ` : suppliers.map(s => `
                <tr class="hover:bg-surface-50/30 transition-colors">
                  <td class="p-4">
                    <div class="font-medium text-surface-900">${s.name}</div>
                    <div class="text-xs text-surface-400 font-mono" title="${s.id}">ID: ${s.id.split('-')[0]}</div>
                  </td>
                  <td class="p-4">
                    ${s.specialty ? `<span class="badge badge-gray text-xs">${s.specialty}</span>` : '<span class="text-surface-400 text-xs">—</span>'}
                  </td>
                  <td class="p-4 text-sm text-surface-600">
                    ${s.phone || s.email ? `
                      ${s.phone ? `<div><i data-lucide="phone" class="w-3 h-3 inline mr-1"></i>${s.phone}</div>` : ''}
                      ${s.email ? `<div><i data-lucide="mail" class="w-3 h-3 inline mr-1"></i>${s.email}</div>` : ''}
                    ` : '<span class="text-surface-400">—</span>'}
                  </td>
                  <td class="p-4">
                    <span class="badge ${s.is_active ? 'badge-green' : 'badge-red'} text-xs">
                        ${s.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td class="p-4 text-center">
                    <button class="btn-secondary py-1 px-3 text-xs stats-btn" data-id="${s.id}" data-name="${s.name}">
                        <i data-lucide="bar-chart-2" class="w-3.5 h-3.5 mr-1 inline"></i> Métricas
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        `;

        if (window.lucide) lucide.createIcons();

        // Bind events
        document.querySelectorAll('.stats-btn').forEach(b => {
            b.addEventListener('click', () => openStatsModal(b.dataset.id, b.dataset.name));
        });

        document.getElementById('add-supplier-btn').addEventListener('click', () => {
             // Redirigir la creación genérica a un modal o implementarla aquí.
             showToast('La creación de proveedores se hace desde Agregar Contacto (marcalo como Proveedor)', 'info');
        });

    } catch (err) {
        container.innerHTML = `<div class="p-8 text-center text-rose-500">Error: ${err.message}</div>`;
    }
}

async function openStatsModal(id, name) {
    showModal('Métricas del Proveedor', `
      <div class="text-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto mb-4"></div>
        <p class="text-surface-600">Calculando estadísticas...</p>
      </div>
    `, { confirmText: '' });

    try {
        const stats = await api.get(`/contacts/${id}/supplier-stats`);
        const resTime = stats.average_response_days;
        let resTimeText = resTime > 0 ? (resTime < 1 ? 'Menos de 1 día' : `${resTime.toFixed(1)} días`) : 'Sin cotizaciones';
        let resColor = resTime > 0 && resTime <= 2 ? 'text-emerald-500' : (resTime > 2 ? 'text-amber-500' : 'text-surface-500');

        const cnt = `
          <div class="space-y-6">
            <h3 class="text-lg font-bold text-surface-900 mb-2 border-b border-surface-200 pb-2">${name}</h3>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-surface-50 p-4 rounded-xl border border-surface-200 text-center">
                <i data-lucide="clock" class="w-6 h-6 mx-auto mb-2 ${resColor}"></i>
                <p class="text-xs text-surface-500 uppercase tracking-widest font-semibold mb-1">Tiempo de Respuesta</p>
                <p class="text-xl font-bold text-surface-900">${resTimeText}</p>
              </div>
              
              <div class="bg-surface-50 p-4 rounded-xl border border-surface-200 text-center">
                <i data-lucide="dollar-sign" class="w-6 h-6 mx-auto mb-2 text-primary-500"></i>
                <p class="text-xs text-surface-500 uppercase tracking-widest font-semibold mb-1">Costo Promedio (Trabajo)</p>
                <p class="text-xl font-bold text-surface-900">${formatCurrency(stats.average_cost)}</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2">
                <div class="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-center">
                    <p class="text-xs text-blue-600 mb-1">Órdenes Realizadas</p>
                    <p class="text-lg font-bold text-blue-700">${stats.completed_orders}</p>
                </div>
                <div class="bg-amber-50/50 p-3 rounded-lg border border-amber-100 text-center">
                    <p class="text-xs text-amber-600 mb-1">Órdenes Totales</p>
                    <p class="text-lg font-bold text-amber-700">${stats.total_orders}</p>
                </div>
                <div class="bg-rose-50/50 p-3 rounded-lg border border-rose-100 text-center">
                    <p class="text-xs text-rose-600 mb-1">Deuda Pendiente</p>
                    <p class="text-lg font-bold text-rose-700">${formatCurrency(stats.pending_invoices_amount)}</p>
                </div>
            </div>
            
            <p class="text-xs text-surface-400 mt-4"><i data-lucide="info" class="w-3 h-3 inline mr-1"></i> El tiempo de respuesta se calcula desde el reporte del inquilino hasta la aprobación de la primera cotización PDF.</p>
          </div>
        `;
        
        showModal('Métricas del Proveedor', cnt, { confirmText: 'Cerrar' });
        if (window.lucide) lucide.createIcons();

    } catch(err) {
        showModal('Error', `<p class="text-rose-500">No se pudieron cargar las métricas: ${err.message}</p>`, { confirmText: 'Ok' });
    }
}
