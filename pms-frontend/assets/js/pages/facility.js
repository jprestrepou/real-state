import { api } from '../api.js';
import { showToast, showModal } from '../components/modal.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { parseCurrencyValue } from '../utils/currency-input.js';

export async function renderFacility(container, state) {
    let assets = [], inspections = [], propertiesData = { items: [] };
    try {
        const [a, i, p] = await Promise.all([
            api.get('/assets').catch(e => { console.error('Error fetching assets:', e); return []; }),
            api.get('/inspections').catch(e => { console.error('Error fetching inspections:', e); return []; }),
            api.get('/properties?limit=100').catch(e => { console.error('Error fetching properties:', e); return {items: []}; })
        ]);
        assets = a || [];
        inspections = i || [];
        propertiesData = p || { items: [] };
    } catch (e) {
        console.error('Unhandled error fetching facility data:', e);
    }

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

    // Restore the previously active tab from sessionStorage (persists across refresh)
    const savedTab = sessionStorage.getItem('facility_active_tab') || 'assets';

    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            sessionStorage.setItem('facility_active_tab', tab.dataset.tab);
            await renderTab(tab.dataset.tab, tabContent, { assets, inspections, properties });
        });
    });

    // Activate saved tab button
    const activeTabBtn = container.querySelector(`.tab-btn[data-tab="${savedTab}"]`);
    if (activeTabBtn) {
        tabs.forEach(t => t.classList.remove('active'));
        activeTabBtn.classList.add('active');
    }
    await renderTab(savedTab, tabContent, { assets, inspections, properties });
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

async function renderProvidersTab(container, data) {
    try {
        const resp = await api.get('/contacts?contact_type=Proveedor&limit=100');
        const suppliers = resp.items || [];

        container.innerHTML = `
        <div class="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h4 class="text-lg font-semibold text-surface-700">Directorio de Proveedores</h4>
            <p class="text-xs text-surface-500">Gestión de tiempos, cotización y facturas</p>
          </div>
          <button id="add-prov-btn" class="btn-primary btn-sm px-3 py-1.5">
            <i data-lucide="user-plus" class="w-4 h-4 mr-2"></i> Nuevo Proveedor
          </button>
        </div>
        
        <div class="glass-card shadow-sm overflow-hidden animate-fade-in">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-50 text-xs font-semibold text-surface-600 uppercase tracking-wider">
                <th class="p-4 border-b border-surface-100">Proveedor</th>
                <th class="p-4 border-b border-surface-100">Especialidad</th>
                <th class="p-4 border-b border-surface-100">Contacto</th>
                <th class="p-4 border-b border-surface-100">Estado</th>
                <th class="p-4 border-b border-surface-100 text-center">Desempeño</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100/50">
              ${suppliers.length === 0 ? `
                <tr><td colspan="5" class="p-8 text-center text-surface-500">No hay proveedores registrados.</td></tr>
              ` : suppliers.map(s => `
                <tr class="hover:bg-surface-50/50 transition-colors">
                  <td class="p-4">
                    <div class="font-bold text-surface-900">${s.name}</div>
                    <div class="text-[10px] text-surface-400 font-mono" title="${s.id}">ID: ${s.id.split('-')[0]}</div>
                  </td>
                  <td class="p-4">
                    ${s.specialty ? `<span class="badge badge-gray text-[10px]">${s.specialty}</span>` : '<span class="text-surface-400 text-xs">—</span>'}
                  </td>
                  <td class="p-4 text-xs text-surface-600">
                    ${s.phone || s.email ? `
                      ${s.phone ? `<div class="flex items-center gap-1.5"><i data-lucide="phone" class="w-3 h-3"></i>${s.phone}</div>` : ''}
                      ${s.email ? `<div class="flex items-center gap-1.5 mt-0.5"><i data-lucide="mail" class="w-3 h-3"></i>${s.email}</div>` : ''}
                    ` : '<span class="text-surface-400">—</span>'}
                  </td>
                  <td class="p-4">
                    <span class="badge ${s.is_active ? 'badge-green' : 'badge-red'} text-[10px]">
                        ${s.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td class="p-4 text-center">
                    <button class="btn-ghost text-xs py-1 px-3 stats-btn text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-semibold" data-id="${s.id}" data-name="${s.name}">
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
        container.querySelectorAll('.stats-btn').forEach(b => {
            b.addEventListener('click', () => openStatsModal(b.dataset.id, b.dataset.name));
        });

        const addProvBtn = container.querySelector('#add-prov-btn');
        if (addProvBtn) {
            addProvBtn.addEventListener('click', () => {
                 showToast('La creación de proveedores se hace desde el módulo de Contactos/Mensajería de momento, o marca un contacto existente como Proveedor.', 'info');
            });
        }

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
              <div class="bg-surface-50 p-4 rounded-xl border border-surface-200 text-center shadow-sm">
                <i data-lucide="clock" class="w-6 h-6 mx-auto mb-2 ${resColor}"></i>
                <p class="text-[10px] text-surface-500 uppercase tracking-widest font-semibold mb-1">Tiempo de Respuesta</p>
                <p class="text-xl font-extrabold text-surface-900">${resTimeText}</p>
              </div>
              
              <div class="bg-surface-50 p-4 rounded-xl border border-surface-200 text-center shadow-sm">
                <i data-lucide="dollar-sign" class="w-6 h-6 mx-auto mb-2 text-primary-500"></i>
                <p class="text-[10px] text-surface-500 uppercase tracking-widest font-semibold mb-1">Costo Promedio (Trabajo)</p>
                <p class="text-xl font-extrabold text-surface-900">${formatCurrency(stats.average_cost)}</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2">
                <div class="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-center">
                    <p class="text-[10px] text-blue-600 font-bold mb-1">Órdenes Ok</p>
                    <p class="text-lg font-extrabold text-blue-700">${stats.completed_orders}</p>
                </div>
                <div class="bg-amber-50/50 p-3 rounded-lg border border-amber-100 text-center">
                    <p class="text-[10px] text-amber-600 font-bold mb-1">Órdenes Totales</p>
                    <p class="text-lg font-extrabold text-amber-700">${stats.total_orders}</p>
                </div>
                <div class="bg-rose-50/50 p-3 rounded-lg border border-rose-100 text-center">
                    <p class="text-[10px] text-rose-600 font-bold mb-1">Deuda Pendiente</p>
                    <p class="text-lg font-extrabold text-rose-700">${formatCurrency(stats.pending_invoices_amount)}</p>
                </div>
            </div>
            
            <p class="text-[10px] text-surface-400 mt-4 leading-relaxed"><i data-lucide="info" class="w-3.5 h-3.5 inline mr-1 text-primary-500"></i> El tiempo de respuesta se calcula desde el reporte del daño hasta la aprobación de la primera cotización PDF subida por el administrador.</p>
          </div>
        `;
        
        showModal('Métricas del Proveedor', cnt, { confirmText: 'Cerrar' });
        if (window.lucide) lucide.createIcons();

    } catch(err) {
        showModal('Error', `<p class="text-rose-500">No se pudieron cargar las métricas: ${err.message}</p>`, { confirmText: 'Ok' });
    }
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
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in px-4">
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-amber-500">${orders.filter(o => o.status === 'Pendiente').length}</p>
        <p class="text-xs text-surface-500 mt-1">Pendientes</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-primary-500">${orders.filter(o => o.status === 'En Progreso').length}</p>
        <p class="text-xs text-surface-500 mt-1">En Progreso</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-emerald-500">${orders.filter(o => o.status === 'Completado').length}</p>
        <p class="text-xs text-surface-500 mt-1">Completados</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-rose-500">${formatCurrency(orders.reduce((s, o) => s + (o.actual_cost || 0), 0))}</p>
        <p class="text-xs text-surface-500 mt-1">Costo Total</p>
      </div>
    </div>
    <div class="glass-card-static overflow-hidden animate-fade-in mx-4">
      <table class="data-table">
        <thead><tr><th></th><th>Título</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Proveedor</th><th>Costo</th><th></th></tr></thead>
        <tbody>
        ${orders.length ? orders.map(o => `<tr>
          <td class="w-12">
            ${o.photos && o.photos.length > 0 ?
              `<div class="relative group cursor-pointer" onclick="viewPhotos('${o.id}')">
                <img src="${api.baseUrl.replace('/api/v1', '')}/${o.photos[0].photo_path}" class="w-10 h-10 rounded object-cover border border-surface-200" />
                <span class="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">${o.photos.length}</span>
              </div>` :
              `<div class="w-10 h-10 rounded bg-surface-100 flex items-center justify-center text-surface-400"><i data-lucide="image" class="w-5 h-5"></i></div>`
            }
          </td>
          <td><div class="font-semibold text-sm">${o.title}</div><div class="text-[10px] text-surface-400">${formatDate(o.scheduled_date)}</div></td>
          <td><span class="badge badge-gray text-[10px]">${o.maintenance_type}</span></td>
          <td><span class="badge ${o.priority === 'Urgente' ? 'badge-red' : o.priority === 'Alta' ? 'badge-amber' : 'badge-gray'} text-[10px]">${o.priority}</span></td>
          <td><span class="badge ${statusBadge(o.status)} text-[10px]">${o.status}</span></td>
          <td class="text-xs">${o.supplier?.name || o.supplier_name || '<span class="text-surface-400">—</span>'}</td>
          <td class="text-sm font-medium">${formatCurrency(o.actual_cost || o.estimated_cost)}</td>
          <td class="text-right">
             <button class="btn-ghost p-1 edit-maint-btn" data-id="${o.id}"><i data-lucide="edit-3" class="w-4 h-4 text-surface-400"></i></button>
          </td>
        </tr>`).join('') : '<tr><td colspan="8" class="text-center py-10 text-surface-400">No hay mantenimientos.</td></tr>'}
        </tbody>
      </table>
    </div>
    `;
    
    if (window.lucide) lucide.createIcons();
    document.getElementById('add-maint-btn').addEventListener('click', () => openMaintModal(properties, container));
    document.querySelectorAll('.edit-maint-btn').forEach(b => b.addEventListener('click', () => openEditMaintModal(b.dataset.id, properties, container)));
}

function statusBadge(status) {
    const map = { 'Pendiente': 'badge-amber', 'En Progreso': 'badge-primary', 'Completado': 'badge-green', 'Cancelado': 'badge-red' };
    return map[status] || 'badge-gray';
}

async function openMaintModal(properties, tabContainer) {
    const resp = await api.get('/contacts?contact_type=Proveedor&limit=100');
    const providers = resp.items || [];
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
                <div><label class="label">Costo Estimado</label><input class="input currency-input" type="text" name="estimated_cost" /></div>
                <div><label class="label">Fecha</label><input class="input" type="date" name="scheduled_date" /></div>
            </div>
            <div><label class="label">Notas</label><textarea class="input" name="notes" rows="2"></textarea></div>
        </form>
    `, {
        confirmText: 'Crear',
        onConfirm: async () => {
            const formData = new FormData(document.getElementById('mf'));
            const payload = {};
            formData.forEach((v, k) => {
                if (k === 'estimated_cost') { payload[k] = v ? parseCurrencyValue(v) : undefined; }
                else if (v) { payload[k] = v; }
            });
            const supVal = document.getElementById('maint-supplier-select').value;
            if (supVal) {
                const [id, name] = supVal.split('|');
                payload.supplier_id = id;
                payload.supplier_name = name;
            }
            await api.post('/maintenance', payload);
            showToast('Orden creada', 'success');
            // Re-render the maintenance tab only — do NOT call renderFacility() which resets to assets tab
            if (tabContainer) {
                await renderMaintenanceTab(tabContainer, { properties });
            }
        }
    });
}

async function openEditMaintModal(id, properties, tabContainer) {
    const [order, resp] = await Promise.all([
        api.get(`/maintenance/${id}`),
        api.get('/contacts?contact_type=Proveedor&limit=100')
    ]);
    const providers = resp.items || [];

    const providerOptions = providers.length ? providers.map(p => `<option value="${p.id}|${p.name}" ${order.supplier_id === p.id ? 'selected' : ''}>${p.name}</option>`).join('') : '<option value="">No hay proveedores</option>';

    showModal('Editar Mantenimiento', `
        <form id="e-mf" class="space-y-4">
            <div><label class="label">Título</label><input class="input" name="title" value="${order.title}" /></div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Estado</label><select class="select" name="status">
                    <option value="Pendiente" ${order.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="En Progreso" ${order.status === 'En Progreso' ? 'selected' : ''}>En Progreso</option>
                    <option value="Esperando Factura" ${order.status === 'Esperando Factura' ? 'selected' : ''}>Esperando Factura</option>
                    <option value="Completado" ${order.status === 'Completado' ? 'selected' : ''}>Completado</option>
                    <option value="Cancelado" ${order.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                </select></div>
                <div><label class="label">Prioridad</label><select class="select" name="priority">
                    <option value="Baja" ${order.priority === 'Baja' ? 'selected' : ''}>Baja</option>
                    <option value="Media" ${order.priority === 'Media' ? 'selected' : ''}>Media</option>
                    <option value="Alta" ${order.priority === 'Alta' ? 'selected' : ''}>Alta</option>
                    <option value="Urgente" ${order.priority === 'Urgente' ? 'selected' : ''}>Urgente</option>
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
                <div><label class="label">Costo Estimado</label><input class="input currency-input" type="text" name="estimated_cost" value="${order.estimated_cost || ''}" /></div>
                <div><label class="label">Costo Real</label><input class="input currency-input" type="text" name="actual_cost" value="${order.actual_cost || ''}" /></div>
            </div>
            <div><label class="label">Fecha Programada</label><input class="input" type="date" name="scheduled_date" value="${order.scheduled_date || ''}" /></div>
            <div><label class="label">Notas</label><textarea class="input" name="notes" rows="3">${order.notes || ''}</textarea></div>
        </form>
    `, {
        confirmText: 'Guardar',
        onConfirm: async () => {
            const formData = new FormData(document.getElementById('e-mf'));
            const payload = {};
            formData.forEach((v, k) => {
                if (k === 'estimated_cost' || k === 'actual_cost') {
                    payload[k] = v ? parseCurrencyValue(v) : null;
                } else if (v) {
                    payload[k] = v;
                }
            });
            const supVal = document.getElementById('e-maint-supplier-select').value;
            if (supVal) {
                const [pid, pname] = supVal.split('|');
                payload.supplier_id = pid;
                payload.supplier_name = pname;
            } else {
                payload.supplier_id = null;
                payload.supplier_name = null;
            }
            await api.put(`/maintenance/${id}`, payload);
            showToast('Actualizado', 'success');
            // Re-render the maintenance tab only — do NOT call renderFacility() which resets to assets tab
            if (tabContainer) {
                await renderMaintenanceTab(tabContainer, { properties });
            }
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
