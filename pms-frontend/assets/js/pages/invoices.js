import { api } from '../api.js';
import { showToast } from '../components/modal.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export async function renderInvoices(container, state) {
  try {
    const invoices = await api.get('/financial/invoices');
    
    let html = `
      <div class="mb-6 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-surface-900">Facturación (CxC)</h2>
          <p class="text-surface-500">Gestión de recibos y arriendos pendientes</p>
        </div>
      </div>
      
      <div class="glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-50/50 border-b border-surface-200 text-sm font-semibold text-surface-600">
                <th class="p-4">ID Factura</th>
                <th class="p-4">Emisión</th>
                <th class="p-4">Vencimiento</th>
                <th class="p-4 text-right">Monto</th>
                <th class="p-4 text-center">Estado</th>
                <th class="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100/50">
    `;
    
    if (invoices.length === 0) {
      html += `
        <tr>
          <td colspan="6" class="p-8 text-center text-surface-500">
            No hay facturas registradas.
          </td>
        </tr>
      `;
    } else {
      invoices.forEach(inv => {
        let statusBadge = '';
        if (inv.status === 'Pendiente') statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Pendiente</span>';
        else if (inv.status === 'Pagada') statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Pagada</span>';
        else if (inv.status === 'Vencida') statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">Vencida</span>';
        
        // Use exact ID output or a substring
        const shortId = inv.id.split('-')[0];
        
        html += `
          <tr class="hover:bg-surface-50/30 transition-colors">
            <td class="p-4 font-mono text-xs text-surface-500" title="${inv.id}">${shortId}</td>
            <td class="p-4 text-sm text-surface-900">${formatDate(inv.issue_date)}</td>
            <td class="p-4 text-sm text-surface-900">${formatDate(inv.due_date)}</td>
            <td class="p-4 text-sm font-medium text-right text-surface-900">${formatCurrency(inv.amount)}</td>
            <td class="p-4 text-center">${statusBadge}</td>
            <td class="p-4 text-center">
              ${inv.status !== 'Pagada' ? `
                <button class="btn-secondary py-1 px-3 text-xs pay-invoice-btn" data-id="${inv.id}"><i data-lucide="check-circle" class="w-3 h-3 mr-1 inline"></i> Pagar</button>
              ` : '<span class="text-surface-400 text-xs text-center block">-</span>'}
            </td>
          </tr>
        `;
      });
    }
    
    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    
    // Attach events
    container.querySelectorAll('.pay-invoice-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if(confirm("¿Confirma que desea marcar esta factura como pagada manualmente?")) {
            try {
                await api.post(`/financial/invoices/${id}/pay`);
                showToast('Factura registrada como pagada con éxito.', 'success');
                renderInvoices(container, state); // reload
            } catch (error) {
                showToast(error.message || 'Error al pagar la factura', 'error');
            }
        }
      });
    });
    
  } catch (err) {
    container.innerHTML = `<div class="p-8 text-center text-rose-500 shrink-0">Error: ${err.message}</div>`;
  }
}
