import { api } from '../api.js';
import { formatDate } from '../utils/formatters.js';

export async function renderAudits(container, state) {
    const audits = await api.get('/audits?limit=50');

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6 animate-fade-in">
            <div>
                <h3 class="text-xl font-bold text-surface-900">Registro de Auditoría</h3>
                <p class="text-sm text-surface-500">Historial de acciones y eventos del sistema</p>
            </div>
        </div>

        <div class="glass-card-static overflow-hidden animate-fade-in">
            <div class="overflow-x-auto">
                <table class="data-table w-full">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Usuario (ID)</th>
                            <th>Acción</th>
                            <th>Entidad</th>
                            <th>ID Entidad</th>
                            <th>Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${audits.length ? audits.map(audit => `
                            <tr class="hover:bg-surface-50">
                                <td class="whitespace-nowrap">${formatDate(audit.timestamp)}</td>
                                <td class="text-xs text-surface-600 font-mono">${audit.user_id ? audit.user_id.slice(0, 8) : 'Sistema'}</td>
                                <td>
                                    <span class="px-2 py-1 bg-surface-100 text-surface-700 rounded text-xs font-semibold">
                                        ${audit.action}
                                    </span>
                                </td>
                                <td class="font-medium text-surface-800">${audit.entity_type}</td>
                                <td class="text-xs text-surface-500 font-mono">${audit.entity_id || '-'}</td>
                                <td class="text-xs text-surface-500 max-w-xs truncate" title="${audit.details || ''}">
                                    ${audit.details || '-'}
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="6" class="text-center py-10 text-surface-500">No hay registros de auditoría.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();
}
