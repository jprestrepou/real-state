/**
 * Properties Page — list, create, edit, detail.
 */

import { api } from '../api.js';
import { formatCurrency, formatDate, statusBadge } from '../utils/formatters.js';
import { showToast, showModal } from '../components/modal.js';

export async function renderProperties(container) {
  const data = await api.get('/properties?limit=50');
  const properties = data.items || [];

  container.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-4 mb-8 animate-fade-in glass-card-static p-4 !rounded-2xl border-white/40 shadow-sm">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm">
          <i data-lucide="filter" class="w-3.5 h-3.5 text-surface-400"></i>
          <select id="filter-status" class="bg-transparent text-sm font-medium focus:outline-none min-w-[140px] appearance-none">
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Arrendada">Arrendada</option>
            <option value="En Mantenimiento">En Mantenimiento</option>
            <option value="Vendida">Vendida</option>
          </select>
        </div>
        <div class="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm">
          <i data-lucide="home" class="w-3.5 h-3.5 text-surface-400"></i>
          <select id="filter-type" class="bg-transparent text-sm font-medium focus:outline-none min-w-[140px] appearance-none">
            <option value="">Todos los tipos</option>
            <option value="Apartamento">Apartamento</option>
            <option value="Casa">Casa</option>
            <option value="Local">Local</option>
            <option value="Bodega">Bodega</option>
            <option value="Oficina">Oficina</option>
            <option value="Lote">Lote</option>
          </select>
        </div>
      </div>
      <button id="add-property-btn" class="btn-primary !rounded-xl shadow-lg shadow-primary-500/20 py-2.5 px-5">
        <i data-lucide="plus" class="w-4 h-4"></i>
        Nueva Propiedad
      </button>
    </div>

    <div class="glass-card-static overflow-hidden animate-fade-in">
      <table class="data-table" id="properties-table">
        <thead>
          <tr>
            <th>Propiedad</th>
            <th>Tipo</th>
            <th>Ciudad</th>
            <th>Área m²</th>
            <th>Valor Comercial</th>
            <th>Estado</th>
            <th>Creada</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${properties.length > 0 ? properties.map(p => `
            <tr>
              <td>
                <div class="font-semibold text-surface-900">${p.name}</div>
                <div class="text-xs text-surface-400 truncate max-w-[200px]">${p.address}</div>
              </td>
              <td><span class="badge badge-gray">${p.property_type}</span></td>
              <td class="text-surface-600">${p.city}</td>
              <td class="text-surface-600">${p.area_sqm}</td>
              <td class="font-medium">${formatCurrency(p.commercial_value)}</td>
              <td><span class="badge ${statusBadge(p.status)}">${p.status}</span></td>
              <td class="text-surface-500 text-xs">${formatDate(p.created_at)}</td>
              <td>
                <div class="flex items-center gap-1">
                  <button class="btn-ghost text-xs py-1 px-2 view-property" data-id="${p.id}" title="Detalles">
                    <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                  </button>
                  <button class="btn-ghost text-xs py-1 px-2 edit-property" data-id="${p.id}" title="Editar">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                  </button>
                  <button class="btn-ghost text-xs py-1 px-2 delete-property text-rose-500 hover:bg-rose-50" data-id="${p.id}" title="Eliminar">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('') : `
            <tr><td colspan="8" class="text-center py-12 text-surface-400">
              <i data-lucide="home" class="w-10 h-10 mx-auto mb-3 text-surface-300"></i>
              <p class="font-medium">No hay propiedades registradas</p>
              <p class="text-sm">Haga clic en "Nueva Propiedad" para empezar</p>
            </td></tr>
          `}
        </tbody>
      </table>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // Add property button
  document.getElementById('add-property-btn').addEventListener('click', () => openPropertyModal());

  // Event Delegation for Table Actions (Edit/Delete)
  document.getElementById('properties-table').addEventListener('click', async (e) => {
    const viewBtn = e.target.closest('.view-property');
    const editBtn = e.target.closest('.edit-property');
    const deleteBtn = e.target.closest('.delete-property');

    if (viewBtn) openPropertyDetailModal(viewBtn.dataset.id);

    if (editBtn) {
      const id = editBtn.dataset.id;
      const property = await api.get(`/properties/${id}`);
      openPropertyModal(property);
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      if (confirm('¿Está seguro de que desea eliminar esta propiedad? Esta acción la desactivará del sistema.')) {
        try {
          await api.delete(`/properties/${id}`);
          showToast('Propiedad eliminada correctamente', 'success');
          const content = document.getElementById('page-content');
          await renderProperties(content);
        } catch (error) {
          showToast(error.message, 'error');
        }
      }
    }
  });

  // Filters
  document.getElementById('filter-status').addEventListener('change', async (e) => {
    const status = e.target.value;
    const type = document.getElementById('filter-type').value;
    let url = '/properties?limit=50';
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (type) url += `&property_type=${encodeURIComponent(type)}`;
    const filtered = await api.get(url);
    renderPropertiesTable(filtered.items || []);
  });

  document.getElementById('filter-type').addEventListener('change', async (e) => {
    const type = e.target.value;
    const status = document.getElementById('filter-status').value;
    let url = '/properties?limit=50';
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (type) url += `&property_type=${encodeURIComponent(type)}`;
    const filtered = await api.get(url);
    renderPropertiesTable(filtered.items || []);
  });
}

function renderPropertiesTable(properties) {
  const tbody = document.querySelector('#properties-table tbody');
  tbody.innerHTML = properties.map(p => `
    <tr>
      <td>
        <div class="font-semibold text-surface-900">${p.name}</div>
        <div class="text-xs text-surface-400 truncate max-w-[200px]">${p.address}</div>
      </td>
      <td><span class="badge badge-gray">${p.property_type}</span></td>
      <td class="text-surface-600">${p.city}</td>
      <td class="text-surface-600">${p.area_sqm}</td>
      <td class="font-medium">${formatCurrency(p.commercial_value)}</td>
      <td><span class="badge ${statusBadge(p.status)}">${p.status}</span></td>
      <td class="text-surface-500 text-xs">${formatDate(p.created_at)}</td>
      <td>
        <div class="flex items-center gap-1">
          <button class="btn-ghost text-xs py-1 px-2 view-property" data-id="${p.id}" title="Detalles">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
          </button>
          <button class="btn-ghost text-xs py-1 px-2 edit-property" data-id="${p.id}" title="Editar">
            <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
          </button>
          <button class="btn-ghost text-xs py-1 px-2 delete-property text-rose-500 hover:bg-rose-50" data-id="${p.id}" title="Eliminar">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  if (window.lucide) lucide.createIcons();
}

function openPropertyModal(property = null) {
  const isEdit = !!property;
  const title = isEdit ? 'Editar Propiedad' : 'Nueva Propiedad';

  const html = `
    <form id="property-form" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Nombre *</label>
          <input class="input" name="name" required value="${property?.name || ''}" placeholder="Mi Apartamento Centro" />
        </div>
        <div>
          <label class="label">Tipo *</label>
          <select class="select" name="property_type" required>
            ${['Apartamento', 'Casa', 'Local', 'Bodega', 'Oficina', 'Lote'].map(t =>
    `<option value="${t}" ${property?.property_type === t ? 'selected' : ''}>${t}</option>`
  ).join('')}
          </select>
        </div>
      </div>
      <div>
        <label class="label">Dirección *</label>
        <input class="input" name="address" required value="${property?.address || ''}" placeholder="Calle 100 #15-20, Bogotá" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Ciudad *</label>
          <input class="input" name="city" required value="${property?.city || ''}" placeholder="Bogotá" />
        </div>
        <div>
          <label class="label">País</label>
          <input class="input" name="country" value="${property?.country || 'Colombia'}" />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="label">Latitud *</label>
          <input class="input" name="latitude" type="number" step="any" required value="${property?.latitude || '4.711'}" />
        </div>
        <div>
          <label class="label">Longitud *</label>
          <input class="input" name="longitude" type="number" step="any" required value="${property?.longitude || '-74.072'}" />
        </div>
        <div>
          <label class="label">Área m² *</label>
          <input class="input" name="area_sqm" type="number" step="0.01" required value="${property?.area_sqm || ''}" placeholder="85.5" />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="label">Habitaciones</label>
          <input class="input" name="bedrooms" type="number" value="${property?.bedrooms ?? ''}" />
        </div>
        <div>
          <label class="label">Baños</label>
          <input class="input" name="bathrooms" type="number" value="${property?.bathrooms ?? ''}" />
        </div>
        <div>
          <label class="label">Valor Comercial</label>
          <input class="input" name="commercial_value" type="number" value="${property?.commercial_value ?? ''}" placeholder="350000000" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Matrícula Inmobiliaria</label>
          <input class="input" name="cadastral_id" value="${property?.cadastral_id || ''}" />
        </div>
        <div>
          <label class="label">Estado</label>
          <select class="select" name="status">
            ${['Disponible', 'Arrendada', 'En Mantenimiento', 'Vendida'].map(s =>
    `<option value="${s}" ${property?.status === s ? 'selected' : ''}>${s}</option>`
  ).join('')}
          </select>
        </div>
      </div>
      <div>
        <label class="label">Notas</label>
        <textarea class="input" name="notes" rows="2" placeholder="Observaciones adicionales...">${property?.notes || ''}</textarea>
      </div>
    </form>
  `;

  showModal(title, html, {
    confirmText: isEdit ? 'Guardar Cambios' : 'Crear Propiedad',
    onConfirm: async () => {
      const form = document.getElementById('property-form');
      const formData = new FormData(form);
      const payload = {};
      formData.forEach((val, key) => {
        if (val === '') return;
        if (['latitude', 'longitude', 'area_sqm', 'commercial_value'].includes(key)) {
          payload[key] = parseFloat(val);
        } else if (['bedrooms', 'bathrooms'].includes(key)) {
          payload[key] = parseInt(val);
        } else {
          payload[key] = val;
        }
      });

      if (isEdit) {
        await api.put(`/properties/${property.id}`, payload);
        showToast('Propiedad actualizada', 'success');
      } else {
        await api.post('/properties', payload);
        showToast('Propiedad creada', 'success');
      }

      // Re-render
      const content = document.getElementById('page-content');
      await renderProperties(content);
    },
  });
}

async function openPropertyDetailModal(propertyId) {
  const [property, occupants] = await Promise.all([
    api.get(`/properties/${propertyId}`),
    api.get(`/occupants?property_id=${propertyId}`)
  ]);

  const renderOccupantsList = (list) => {
    if (!list.length) return '<p class="text-sm text-surface-400 py-4 text-center">No hay ocupantes registrados.</p>';
    return `
      <div class="space-y-3 mt-4">
        ${list.map(o => `
          <div class="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-100 animate-fade-in">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                ${o.full_name.charAt(0)}
              </div>
              <div>
                <p class="text-sm font-semibold text-surface-900">${o.full_name} ${o.is_primary ? '<span class="badge badge-blue text-[10px] ml-1">Principal</span>' : ''}</p>
                <p class="text-xs text-surface-500">${o.phone || o.email || 'Sin contacto'}</p>
              </div>
            </div>
            <button class="delete-occupant-btn text-rose-400 hover:text-rose-600 p-1" data-id="${o.id}">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        `).join('')}
      </div>
    `;
  };

  showModal(`Detalle: ${property.name}`, `
    <div class="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
      <div class="grid grid-cols-2 gap-4">
        <div class="glass-card-static p-4">
          <h4 class="text-xs font-bold text-surface-400 uppercase mb-3 flex items-center gap-1"><i data-lucide="info" class="w-3 h-3"></i> Información Básica</h4>
          <p class="text-sm"><strong>Dirección:</strong> ${property.address}</p>
          <p class="text-sm"><strong>Tipo:</strong> ${property.property_type}</p>
          <p class="text-sm"><strong>Área:</strong> ${property.area_sqm} m²</p>
          <p class="text-sm"><strong>Estado:</strong> <span class="badge ${statusBadge(property.status)}">${property.status}</span></p>
        </div>
        <div class="glass-card-static p-4">
          <h4 class="text-xs font-bold text-surface-400 uppercase mb-3 flex items-center gap-1"><i data-lucide="users" class="w-3 h-3"></i> Ocupantes (Viven aquí)</h4>
          <div id="occupants-container">
            ${renderOccupantsList(occupants)}
          </div>
          <button id="add-occupant-btn" class="btn-ghost text-xs w-full mt-4 border-dashed border-2 border-surface-200 hover:border-primary-300">
            <i data-lucide="plus" class="w-3 h-3 mr-1"></i> Agregar Ocupante
          </button>
        </div>
      </div>
    </div>
  `, { showCancel: true, confirmText: null });

  if (window.lucide) lucide.createIcons();

  // Add Occupant Event
  document.getElementById('add-occupant-btn').addEventListener('click', () => {
    showModal('Nuevo Ocupante', `
      <form id="occupant-form" class="space-y-4">
        <div><label class="label">Nombre Completo *</label><input class="input" name="full_name" required /></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="label">DNI / Cédula</label><input class="input" name="dni" /></div>
          <div><label class="label">Teléfono</label><input class="input" name="phone" /></div>
        </div>
        <div><label class="label">Email</label><input class="input" name="email" type="email" /></div>
        <div class="flex items-center gap-2">
          <input type="checkbox" name="is_primary" id="is_primary" class="w-4 h-4 rounded text-primary-600" />
          <label for="is_primary" class="text-sm cursor-pointer">Es ocupante principal</label>
        </div>
      </form>
    `, {
      confirmText: 'Agregar',
      onConfirm: async () => {
        const fd = new FormData(document.getElementById('occupant-form'));
        const payload = {
          property_id: propertyId,
          full_name: fd.get('full_name'),
          dni: fd.get('dni') || null,
          phone: fd.get('phone') || null,
          email: fd.get('email') || null,
          is_primary: document.getElementById('is_primary').checked
        };
        await api.post('/occupants', payload);
        showToast('Ocupante agregado', 'success');
        // Refresh detail modal
        openPropertyDetailModal(propertyId);
      }
    });
  });

  // Delete Occupant Event
  document.querySelectorAll('.delete-occupant-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('¿Eliminar este ocupante?')) {
        await api.delete(`/occupants/${btn.dataset.id}`);
        showToast('Ocupante eliminado', 'success');
        openPropertyDetailModal(propertyId);
      }
    });
  });
}
