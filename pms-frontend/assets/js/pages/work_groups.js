import { api } from '../api.js';
import { showToast, showModal } from '../components/modal.js';
import { formatDate } from '../utils/formatters.js';

export async function renderWorkGroups(container, state) {
    const workGroups = await api.get('/work-groups');

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
        // Optionals: fetch users to select users instead of a free text ID, but for simplicity assuming free text input
        showModal('Añadir Miembro', `
            <form id="wm-form" class="space-y-4">
                <div>
                    <label class="label">ID de Usuario *</label>
                    <input class="input" type="text" name="user_id" required placeholder="UUID del usuario" />
                </div>
                <div>
                    <label class="label">Rol en el grupo</label>
                    <input class="input" type="text" name="role_in_group" value="Técnico" />
                </div>
            </form>
        `, {
            confirmText: 'Añadir',
            onConfirm: async () => {
                const fd = new FormData(document.getElementById('wm-form'));
                await api.post(`/work-groups/${wgId}/members`, Object.fromEntries(fd));
                showToast('Miembro añadido', 'success');
                renderWorkGroups(container, state);
            }
        });
    };

    window.addPropertyModal = async (wgId) => {
        showModal('Asignar Propiedad', `
            <form id="wp-form" class="space-y-4">
                <div>
                    <label class="label">ID de Propiedad *</label>
                    <input class="input" type="text" name="property_id" required placeholder="UUID de la propiedad" />
                </div>
            </form>
        `, {
            confirmText: 'Asignar',
            onConfirm: async () => {
                const fd = new FormData(document.getElementById('wp-form'));
                await api.post(`/work-groups/${wgId}/properties`, Object.fromEntries(fd));
                showToast('Propiedad asignada', 'success');
                renderWorkGroups(container, state);
            }
        });
    };

    if (window.lucide) lucide.createIcons();
}
