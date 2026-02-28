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
    <div class="flex items-center justify-between mb-6 animate-fade-in">
      <div class="flex items-center gap-3">
        <select id="filter-status" class="select text-sm py-2 w-40">
          <option value="">Todos los estados</option>
          <option value="Disponible">Disponible</option>
          <option value="Arrendada">Arrendada</option>
          <option value="En Mantenimiento">En Mantenimiento</option>
          <option value="Vendida">Vendida</option>
        </select>
        <select id="filter-type" class="select text-sm py-2 w-40">
          <option value="">Todos los tipos</option>
          <option value="Apartamento">Apartamento</option>
          <option value="Casa">Casa</option>
          <option value="Local">Local</option>
          <option value="Bodega">Bodega</option>
          <option value="Oficina">Oficina</option>
          <option value="Lote">Lote</option>
        </select>
      </div>
      <button id="add-property-btn" class="btn-primary">
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
            <th></th>
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
                <button class="btn-ghost text-xs py-1 px-2 edit-property" data-id="${p.id}" title="Editar">
                  <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                </button>
                <button class="btn-ghost text-xs py-1 px-2 delete-property text-rose-500 hover:bg-rose-50" data-id="${p.id}" title="Eliminar">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
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
    const editBtn = e.target.closest('.edit-property');
    const deleteBtn = e.target.closest('.delete-property');

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
        <button class="btn-ghost text-xs py-1 px-2 edit-property" data-id="${p.id}" title="Editar">
          <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
        </button>
        <button class="btn-ghost text-xs py-1 px-2 delete-property text-rose-500 hover:bg-rose-50" data-id="${p.id}" title="Eliminar">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
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
