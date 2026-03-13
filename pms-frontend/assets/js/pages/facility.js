import { api } from '../api.js';
import { showToast, showModal } from '../components/modal.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export async function renderFacility(container, state) {
    const [assets, inspections, propertiesData] = await Promise.all([
        api.get('/assets'),
        api.get('/inspections'),
        api.get('/properties?limit=100')
    ]);

    const properties = propertiesData.items || [];

    container.innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <!-- Tabs -->
            <div class="flex border-b border-surface-200">
                <button class="tab-btn active" data-tab="assets">Inventario de Activos</button>
                <button class="tab-btn" data-tab="inspections">Inspecciones</button>
                <button class="tab-btn" data-tab="maintenance">Mantenimiento</button>
                <button class="tab-btn" data-tab="providers">Proveedores</button>
            </div>

            <div id="tab-content" class="min-h-[400px]">
                <!-- Content will be rendered here -->
            </div>
        </div>
    `;

    const tabContent = container.querySelector('#tab-content');
    const tabs = container.querySelectorAll('.tab-btn');

    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            await renderTab(tab.dataset.tab, tabContent, { assets, inspections, properties });
        });
    });

    // Default tab
    await renderTab('assets', tabContent, { assets, inspections, properties });
}

async function renderTab(tab, container, data) {
    // Clear container and show loader
    container.innerHTML = `
        <div class="flex items-center justify-center py-20">
            <div class="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    `;

    try {
        switch (tab) {
            case 'assets':
                renderAssetsTab(container, data);
                break;
            case 'inspections':
                renderInspectionsTab(container, data);
                break;
            case 'providers':
                await renderProvidersTab(container, data);
                break;
            case 'maintenance':
                await renderMaintenanceTab(container, data);
                break;
        }
    } catch (err) {
        console.error(`Error rendering tab ${tab}:`, err);
        container.innerHTML = `
            <div class="text-center py-20">
                <i data-lucide="alert-circle" class="w-12 h-12 text-rose-400 mx-auto mb-4"></i>
                <h3 class="text-lg font-semibold text-surface-700 mb-2">No se pudo cargar la información</h3>
                <p class="text-surface-500 text-sm">${err.message}</p>
                <button onclick="window.location.reload()" class="btn-primary btn-sm mt-4">Reintentar</button>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
    }
}

function renderAssetsTab(container, { assets, properties }) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-surface-700">Equipos y Mobiliario</h4>
            <button id="add-asset-btn" class="btn-primary btn-sm px-3 py-1.5"><i data-lucide="plus" class="w-4 h-4"></i> Nuevo Activo</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${assets.length ? assets.map(asset => `
                <div class="glass-card-static p-4 space-y-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">${asset.category}</span>
                            <h5 class="font-bold text-surface-900 mt-1">${asset.name}</h5>
                        </div>
                        <span class="badge ${asset.status === 'Operativo' ? 'badge-green' : 'badge-amber'}">${asset.status}</span>
                    </div>
                    <div class="text-xs text-surface-500 space-y-1">
                        <p><span class="font-medium">Marca:</span> ${asset.brand || 'N/A'}</p>
                        <p><span class="font-medium">Modelo:</span> ${asset.model || 'N/A'}</p>
                        <p><span class="font-medium">Serial:</span> ${asset.serial_number || 'N/A'}</p>
                    </div>
                    <div class="pt-2 border-t border-surface-100 flex justify-between items-center">
                        <span class="text-[10px] text-surface-400">Propiedad: ${asset.property_id.slice(0, 8)}</span>
                        <button class="text-primary-600 hover:text-primary-700 text-xs font-semibold">Detalles</button>
                    </div>
                </div>
            `).join('') : '<p class="text-surface-400 text-center py-20 col-span-full">No hay activos registrados.</p>'}
        </div>
    `;

    document.getElementById('add-asset-btn').addEventListener('click', () => openAssetModal(properties));
    if (window.lucide) lucide.createIcons();
}

function renderInspectionsTab(container, { inspections, properties }) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-surface-700">Programación de Inspecciones</h4>
            <button id="add-insp-btn" class="btn-primary btn-sm px-3 py-1.5"><i data-lucide="calendar-plus" class="w-4 h-4"></i> Programar</button>
        </div>
        <div class="overflow-x-auto rounded-2xl border border-surface-200">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Inspector</th>
                        <th>Propiedad</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    ${inspections.length ? inspections.map(insp => `
                        <tr>
                            <td class="font-medium">${insp.inspection_type}</td>
                            <td>${formatDate(insp.scheduled_date)}</td>
                            <td><span class="badge ${insp.status === 'Realizada' ? 'badge-green' : insp.status === 'Cancelada' ? 'badge-red' : 'badge-blue'}">${insp.status}</span></td>
                            <td>${insp.inspector_name || '-'}</td>
                            <td class="text-xs text-surface-500">${insp.property_id.slice(0, 8)}</td>
                            <td class="text-right">
                                <button class="text-surface-400 hover:text-primary-600"><i data-lucide="more-horizontal" class="w-5 h-5"></i></button>
                            </td>
                        </tr>
                    `).join('') : '<tr><td colspan="6" class="text-center py-10 text-surface-400">No hay inspecciones programadas.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('add-insp-btn').addEventListener('click', () => openInspectionModal(properties));
    if (window.lucide) lucide.createIcons();
}

async function renderProvidersTab(container) {
    const providers = await api.get('/contacts?type=Proveedor');
    container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-surface-700">Directorio de Proveedores</h4>
            <button id="add-prov-btn" class="btn-primary btn-sm px-3 py-1.5"><i data-lucide="user-plus" class="w-4 h-4"></i> Nuevo Proveedor</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${providers.length ? providers.map(p => `
                <div class="glass-card-static p-4 flex gap-4 items-center">
                    <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                        ${p.name.charAt(0)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h5 class="font-bold text-surface-900 truncate">${p.name}</h5>
                        <p class="text-xs text-surface-500 truncate">${p.email || 'Sin correo'}</p>
                        <p class="text-xs font-medium text-primary-600 mt-1">${p.phone || 'Sin teléfono'}</p>
                    </div>
                </div>
            `).join('') : '<p class="text-surface-400 text-center py-20 col-span-full">No se encontraron proveedores.</p>'}
        </div>
    `;
    if (window.lucide) lucide.createIcons();
}

function openAssetModal(properties) {
    const propertyOptions = properties.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

    showModal('Nuevo Activo', `
        <form id="af" class="space-y-4">
            <div>
                <label class="label">Propiedad *</label>
                <select class="select" name="property_id" required>${propertyOptions}</select>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Nombre *</label><input class="input" name="name" placeholder="Aire Acondicionado" required /></div>
                <div><label class="label">Categoría *</label><input class="input" name="category" placeholder="Climatización" required /></div>
            </div>
            <div class="grid grid-cols-3 gap-4">
                <div><label class="label">Marca</label><input class="input" name="brand" /></div>
                <div><label class="label">Modelo</label><input class="input" name="model" /></div>
                <div><label class="label">Serial</label><input class="input" name="serial_number" /></div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Fecha Compra</label><input class="input" name="purchase_date" type="date" /></div>
                <div><label class="label">Fin Garantía</label><input class="input" name="warranty_expiry" type="date" /></div>
            </div>
        </form>
    `, {
        confirmText: 'Guardar',
        onConfirm: async () => {
            const fd = new FormData(document.getElementById('af'));
            const payload = Object.fromEntries(fd);
            await api.post('/assets', payload);
            showToast('Activo registrado', 'success');
            await renderFacility(document.getElementById('page-content'));
        }
    });
}

async function renderMaintenanceTab(container, { properties }) {
    const data = await api.get('/maintenance?limit=50');
    const orders = data.items || [];

    container.innerHTML = `
    <div class="flex items-center justify-between mb-6 animate-fade-in px-4">
      <div class="flex items-center gap-3">
        <h4 class="text-lg font-semibold text-surface-700">Órdenes de Trabajo</h4>
      </div>
      <button id="add-maint-btn" class="btn-primary btn-sm"><i data-lucide="plus" class="w-4 h-4"></i> Nueva Orden</button>
    </div>
    <div class="glass-card-static overflow-hidden animate-fade-in mx-4">
      <table class="data-table">
        <thead><tr><th></th><th>Título</th><th>Tipo</th><th>Estado</th><th>Proveedor</th><th>Costo</th><th></th></tr></thead>
        <tbody>
        ${orders.length ? orders.map(o => `<tr>
          <td class="w-10">
            ${o.photos && o.photos.length > 0 ? `<img src="${api.baseUrl.replace('/api/v1', '')}/${o.photos[0].photo_path}" class="w-8 h-8 rounded object-cover cursor-pointer" onclick="viewPhotos('${o.id}')" />` : ''}
          </td>
          <td><div class="font-semibold text-sm">${o.title}</div><div class="text-[10px] text-surface-400">${formatDate(o.scheduled_date)}</div></td>
          <td><span class="badge badge-gray text-[10px]">${o.maintenance_type}</span></td>
          <td><span class="badge ${statusBadge(o.status)} text-[10px]">${o.status}</span></td>
          <td class="text-xs">${o.supplier_name || (o.supplier ? o.supplier.name : 'N/A')}</td>
          <td class="text-sm font-medium">${formatCurrency(o.actual_cost || o.estimated_cost)}</td>
          <td class="text-right">
             <button class="btn-ghost p-1 edit-maint-btn" data-id="${o.id}"><i data-lucide="edit-3" class="w-4 h-4 text-surface-400"></i></button>
          </td>
        </tr>`).join('') : '<tr><td colspan="7" class="text-center py-10 text-surface-400">No hay mantenimientos.</td></tr>'}
        </tbody>
      </table>
    </div>
    `;
    
    if (window.lucide) lucide.createIcons();
    document.getElementById('add-maint-btn').addEventListener('click', () => openMaintModal(properties));
    document.querySelectorAll('.edit-maint-btn').forEach(b => b.addEventListener('click', () => openEditMaintModal(b.dataset.id, properties)));
}

function statusBadge(status) {
    const map = { 'Pendiente': 'badge-amber', 'En Progreso': 'badge-primary', 'Completado': 'badge-green', 'Cancelado': 'badge-red' };
    return map[status] || 'badge-gray';
}

async function openMaintModal(properties) {
    const providers = await api.get('/contacts?type=Proveedor');
    const providerOptions = providers.length ? providers.map(p => `<option value="${p.id}|${p.name}">${p.name}</option>`).join('') : '<option value="">No hay proveedores</option>';
    const propertyOptions = properties.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

    showModal('Nueva Orden de Mantenimiento', `
        <form id="mf" class="space-y-4">
            <div><label class="label">Propiedad *</label><select class="select" name="property_id" required>${propertyOptions}</select></div>
            <div><label class="label">Título *</label><input class="input" name="title" required /></div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Tipo</label><select class="select" name="maintenance_type"><option value="Correctivo">Correctivo</option><option value="Preventivo">Preventivo</option><option value="Mejora">Mejora</option></select></div>
                <div><label class="label">Prioridad</label><select class="select" name="priority"><option value="Media">Media</option><option value="Alta">Alta</option><option value="Urgente">Urgente</option><option value="Baja">Baja</option></select></div>
            </div>
            <div>
                <label class="label">Proveedor Registrado</label>
                <select class="select" id="maint-supplier-select">
                    <option value="">Seleccione proveedor...</option>
                    ${providerOptions}
                </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Costo Estimado</label><input class="input" type="number" name="estimated_cost" step="0.01" /></div>
                <div><label class="label">Fecha</label><input class="input" type="date" name="scheduled_date" /></div>
            </div>
        </form>
    `, {
        confirmText: 'Crear',
        onConfirm: async () => {
            const formData = new FormData(document.getElementById('mf'));
            const payload = Object.fromEntries(formData);
            const supVal = document.getElementById('maint-supplier-select').value;
            if (supVal) {
                const [id, name] = supVal.split('|');
                payload.supplier_id = id;
                payload.supplier_name = name;
            }
            await api.post('/maintenance', payload);
            showToast('Orden creada', 'success');
            await renderFacility(document.getElementById('page-content'));
        }
    });
}

async function openEditMaintModal(id, properties) {
    const [order, providers] = await Promise.all([
        api.get(`/maintenance/${id}`),
        api.get('/contacts?type=Proveedor')
    ]);

    const providerOptions = providers.length ? providers.map(p => `<option value="${p.id}|${p.name}" ${order.supplier_id === p.id ? 'selected' : ''}>${p.name}</option>`).join('') : '<option value="">No hay proveedores</option>';

    showModal('Editar Mantenimiento', `
        <form id="e-mf" class="space-y-4">
            <div><label class="label">Título</label><input class="input" name="title" value="${order.title}" /></div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Estado</label><select class="select" name="status">
                    <option value="Pendiente" ${order.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="En Progreso" ${order.status === 'En Progreso' ? 'selected' : ''}>En Progreso</option>
                    <option value="Completado" ${order.status === 'Completado' ? 'selected' : ''}>Completado</option>
                    <option value="Cancelado" ${order.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                </select></div>
                <div><label class="label">Prioridad</label><select class="select" name="priority">
                    <option value="Baja" ${order.priority === 'Baja' ? 'selected' : ''}>Baja</option>
                    <option value="Media" ${order.priority === 'Media' ? 'selected' : ''}>Media</option>
                    <option value="Alta" ${order.priority === 'Alta' ? 'selected' : ''}>Alta</option>
                </select></div>
            </div>
            <div>
                <label class="label">Proveedor</label>
                <select class="select" id="e-maint-supplier-select">
                    <option value="">N/A</option>
                    ${providerOptions}
                </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Costo Real</label><input class="input" type="number" name="actual_cost" step="0.01" value="${order.actual_cost || ''}" /></div>
                <div><label class="label">Notas</label><textarea class="input" name="notes">${order.notes || ''}</textarea></div>
            </div>
        </form>
    `, {
        confirmText: 'Guardar',
        onConfirm: async () => {
            const formData = new FormData(document.getElementById('e-mf'));
            const payload = Object.fromEntries(formData);
            const supVal = document.getElementById('e-maint-supplier-select').value;
            if (supVal) {
                const [pid, pname] = supVal.split('|');
                payload.supplier_id = pid;
                payload.supplier_name = pname;
            }
            await api.put(`/maintenance/${id}`, payload);
            showToast('Actualizado', 'success');
            await renderFacility(document.getElementById('page-content'));
        }
    });
}

window.viewPhotos = async (id) => {
    const o = await api.get(`/maintenance/${id}`);
    if (!o.photos || o.photos.length === 0) return;
    const baseUrl = api.baseUrl.replace('/api/v1', '');
    showModal('Evidencia Fotográfica', `
      <div class="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
        ${o.photos.map(p => `
          <div class="space-y-2">
            <img src="${baseUrl}/${p.photo_path}" class="w-full rounded-lg border border-surface-200 cursor-zoom-in" onclick="window.open('${baseUrl}/${p.photo_path}', '_blank')" />
            <p class="text-[10px] text-surface-400 text-center">${formatDate(p.uploaded_at)}</p>
          </div>
        `).join('')}
      </div>
    `, { confirmText: 'Cerrar' });
};

function openInspectionModal(properties) {
    const propertyOptions = properties.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    showModal('Programar Inspección', `
        <form id="if" class="space-y-4">
            <div><label class="label">Propiedad *</label><select class="select" name="property_id" required>${propertyOptions}</select></div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Tipo *</label><select class="select" name="inspection_type" required>
                    <option value="Preventiva">Preventiva</option><option value="Entrega">Entrega</option><option value="Recibo">Recibo</option><option value="Rutinaria">Rutinaria</option>
                </select></div>
                <div><label class="label">Fecha Programada *</label><input class="input" name="scheduled_date" type="date" required /></div>
            </div>
            <div><label class="label">Inspector</label><input class="input" name="inspector_name" /></div>
        </form>
    `, {
        confirmText: 'Programar',
        onConfirm: async () => {
            const fd = new FormData(document.getElementById('if'));
            const payload = Object.fromEntries(fd);
            await api.post('/inspections', payload);
            showToast('Inspección programada', 'success');
            await renderFacility(document.getElementById('page-content'));
        }
    });
}
