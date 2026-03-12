import { api } from '../api.js';
import { showToast, showModal } from '../components/modal.js';
import { formatDate } from '../utils/formatters.js';

export async function renderWorkGroups(container, state) {
    // Fetch work groups, properties, and users in parallel
    const [workGroups, propertiesData, usersData] = await Promise.all([
        api.get('/work-groups'),
        api.get('/properties?limit=100'),
        api.get('/users?limit=100').catch(() => ({ items: [] }))
    ]);
    const properties = propertiesData.items || [];
    const users = usersData.items || [];

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6 animate-fade-in">
            <div>
                <h3 class="text-xl font-bold text-surface-900">Grupos de Trabajo</h3>
                <p class="text-sm text-surface-500">Gestione equipos para mantenimiento e inspecciones</p>
            </div>
            <button id="add-wg-btn" class="btn-primary">
                <i data-lucide="folder-plus" class="w-4 h-4 mr-2"></i> Nuevo Grupo
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            ${workGroups.length ? workGroups.map(wg => `
                <div class="glass-card-static p-5 flex flex-col space-y-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-bold text-surface-900 text-lg">${wg.name}</h4>
                            <p class="text-xs text-surface-500">${wg.description || 'Sin descripción'}</p>
                        </div>
                        <span class="badge badge-blue">ID: ${wg.id.slice(0, 4)}</span>
                    </div>

                    <div class="space-y-2 flex-grow">
                        <div class="flex justify-between text-sm">
                            <span class="text-surface-600 font-medium">Miembros</span>
                            <span class="font-bold text-surface-900">${wg.members?.length || 0}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-surface-600 font-medium">Propiedades Asignadas</span>
                            <span class="font-bold text-surface-900">${wg.assigned_properties?.length || 0}</span>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-surface-100 flex gap-2">
                        <button class="btn-secondary btn-sm flex-1" onclick="window.addMemberModal('${wg.id}')">
                            <i data-lucide="user-plus" class="w-4 h-4 mr-1"></i> Miembro
                        </button>
                        <button class="btn-secondary btn-sm flex-1" onclick="window.addPropertyModal('${wg.id}')">
                            <i data-lucide="home" class="w-4 h-4 mr-1"></i> Propiedad
                        </button>
                    </div>
                </div>
            `).join('') : '<div class="col-span-full py-12 text-center text-surface-500">No hay grupos de trabajo creados.</div>'}
        </div>
    `;

    document.getElementById('add-wg-btn').addEventListener('click', () => {
        showModal('Nuevo Grupo de Trabajo', `
            <form id="wg-form" class="space-y-4">
                <div>
                    <label class="label">Nombre del Grupo *</label>
                    <input class="input" type="text" name="name" required placeholder="Ej. Equipo Mantenimiento Norte" />
                </div>
                <div>
                    <label class="label">Descripción</label>
                    <textarea class="input" name="description" rows="3" placeholder="Descripción breve del propósito"></textarea>
                </div>
            </form>
        `, {
            confirmText: 'Crear',
            onConfirm: async () => {
                const fd = new FormData(document.getElementById('wg-form'));
                const payload = Object.fromEntries(fd);
                await api.post('/work-groups', payload);
                showToast('Grupo creado', 'success');
                renderWorkGroups(container, state);
            }
        });
    });

    // Attach to window so onclick works
    window.addMemberModal = async (wgId) => {
        const userOptions = users.length
            ? users.map(u => `<option value="${u.id}">${u.full_name || u.email} (${u.role})</option>`).join('')
            : '<option value="" disabled>No se encontraron usuarios</option>';

        showModal('Añadir Miembro', `
            <form id="wm-form" class="space-y-4">
                <div>
                    <label class="label">Usuario *</label>
                    <select class="select" name="user_id" required>
                        <option value="">Seleccione un usuario...</option>
                        ${userOptions}
                    </select>
                </div>
                <div>
                    <label class="label">Rol en el grupo *</label>
                    <select class="select" name="role">
                        <option value="Admin">Admin</option>
                        <option value="Analista">Analista</option>
                    </select>
                </div>
            </form>
        `, {
            confirmText: 'Añadir',
            onConfirm: async () => {
                const fd = new FormData(document.getElementById('wm-form'));
                const payload = Object.fromEntries(fd);
                if (!payload.user_id) {
                    showToast('Seleccione un usuario', 'error');
                    return;
                }
                await api.post(`/work-groups/${wgId}/members`, payload);
                showToast('Miembro añadido', 'success');
                renderWorkGroups(container, state);
            }
        });
    };

    window.addPropertyModal = async (wgId) => {
        const propOptions = properties.length
            ? properties.map(p => `<option value="${p.id}">${p.name} (${p.property_type})</option>`).join('')
            : '<option value="" disabled>No se encontraron propiedades</option>';

        showModal('Asignar Propiedad', `
            <form id="wp-form" class="space-y-4">
                <div>
                    <label class="label">Propiedad *</label>
                    <select class="select" name="property_id" required>
                        <option value="">Seleccione una propiedad...</option>
                        ${propOptions}
                    </select>
                </div>
            </form>
        `, {
            confirmText: 'Asignar',
            onConfirm: async () => {
                const fd = new FormData(document.getElementById('wp-form'));
                const payload = Object.fromEntries(fd);
                if (!payload.property_id) {
                    showToast('Seleccione una propiedad', 'error');
                    return;
                }
                await api.post(`/work-groups/${wgId}/properties`, payload);
                showToast('Propiedad asignada', 'success');
                renderWorkGroups(container, state);
            }
        });
    };

    if (window.lucide) lucide.createIcons();
}
