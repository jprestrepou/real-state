/**
 * Properties Page — list, create, edit, detail.
 */

import { api } from '../api.js';
import { formatCurrency, formatDate, statusBadge, formatPercent } from '../utils/formatters.js';
import { parseCurrencyValue } from '../utils/currency-input.js';
import { showToast, showModal } from '../components/modal.js';
import { renderRentEstimator } from './rent_estimator.js';

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
                  <button class="btn-ghost text-xs py-1 px-2 evaluate-property text-emerald-600 hover:bg-emerald-50" data-id="${p.id}" title="Simular Arriendo (Mercado)">
                    <i data-lucide="bar-chart" class="w-3.5 h-3.5"></i>
                  </button>
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
    const evalBtn = e.target.closest('.evaluate-property');

    if (viewBtn) openPropertyDetailModal(viewBtn.dataset.id);
    
    if (evalBtn) {
      const id = evalBtn.dataset.id;
      const property = await api.get(`/properties/${id}`);
      openValuationModal(property);
    }

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
        <div class="flex items-center gap-1">
          <button class="btn-ghost text-xs py-1 px-2 evaluate-property text-emerald-600 hover:bg-emerald-50" data-id="${p.id}" title="Simular Arriendo (Mercado)">
            <i data-lucide="bar-chart" class="w-3.5 h-3.5"></i>
          </button>
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
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="label">Ciudad *</label>
          <input class="input" name="city" required value="${property?.city || ''}" placeholder="Bogotá" />
        </div>
        <div>
          <label class="label">Estrato</label>
          <select class="select" name="stratum">
            <option value="">No definido</option>
            ${[1, 2, 3, 4, 5, 6].map(s => `<option value="${s}" ${property?.stratum == s ? 'selected' : ''}>Estrato ${s}</option>`).join('')}
          </select>
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
      <div class="grid grid-cols-4 gap-4 p-3 bg-surface-50 rounded-xl border border-surface-100">
        <label class="flex items-center gap-2 text-xs font-medium cursor-pointer">
          <input type="checkbox" name="has_parking" ${property?.has_parking ? 'checked' : ''} class="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
          Parqueadero
        </label>
        <label class="flex items-center gap-2 text-xs font-medium cursor-pointer">
          <input type="checkbox" name="has_elevator" ${property?.has_elevator ? 'checked' : ''} class="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
          Ascensor
        </label>
        <label class="flex items-center gap-2 text-xs font-medium cursor-pointer">
          <input type="checkbox" name="has_pool" ${property?.has_pool ? 'checked' : ''} class="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
          Piscina
        </label>
        <label class="flex items-center gap-2 text-xs font-medium cursor-pointer">
          <input type="checkbox" name="has_gym" ${property?.has_gym ? 'checked' : ''} class="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
          Gimnasio
        </label>
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
          <input class="input currency-input" name="commercial_value" type="text" value="${property?.commercial_value ?? ''}" placeholder="350.000.000" />
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
      <div class="p-4 bg-primary-50/50 rounded-xl border border-primary-100 space-y-4">
        <h4 class="text-sm font-bold text-primary-700 flex items-center gap-2">
          <i data-lucide="credit-card" class="w-4 h-4"></i> Parámetros de Administración
        </h4>
        <div class="flex items-center gap-2 mb-2">
          <input type="checkbox" name="pays_administration" id="pays_administration" class="w-4 h-4 rounded text-primary-600" ${property?.pays_administration !== false ? 'checked' : ''} />
          <label for="pays_administration" class="text-sm font-medium cursor-pointer">Paga Administración</label>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Día de Pago (1-31)</label>
            <input class="input" name="administration_day" type="number" min="1" max="31" value="${property?.administration_day || ''}" placeholder="5" />
          </div>
          <div>
            <label class="label">Valor Administración</label>
            <input class="input currency-input" name="administration_fee" type="text" value="${property?.administration_fee || ''}" placeholder="250.000" />
          </div>
        </div>
        <div>
          <label class="label">Método de Pago</label>
          <input class="input" name="administration_payment_method" value="${property?.administration_payment_method || ''}" placeholder="Transferencia Bancaria, Link de Pago, etc." />
        </div>
        <div>
          <label class="label">Cuenta o Link de Pago</label>
          <textarea class="input" name="administration_payment_info" rows="2" placeholder="Número de cuenta o URL de pago...">${property?.administration_payment_info || ''}</textarea>
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
        if (val === '' && key !== 'pays_administration') return;
        if (['area_sqm', 'latitude', 'longitude'].includes(key)) {
          payload[key] = parseFloat(val);
        } else if (['commercial_value', 'administration_fee'].includes(key)) {
          payload[key] = parseCurrencyValue(val);
        } else if (['bedrooms', 'bathrooms', 'administration_day', 'stratum'].includes(key)) {
          payload[key] = val ? parseInt(val) : null;
        } else if (key === 'pays_administration') {
            payload[key] = document.getElementById('pays_administration').checked;
        } else {
          payload[key] = val;
        }
      });

      // Handle checkboxes explicitly since FormData only includes checked ones
      ['has_parking', 'has_elevator', 'has_pool', 'has_gym'].forEach(key => {
        const el = document.querySelector(`[name="${key}"]`);
        if (el) payload[key] = el.checked;
      });
      if (!payload.hasOwnProperty('pays_administration')) {
          payload['pays_administration'] = document.getElementById('pays_administration').checked;
      }

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
          <hr class="my-3 border-surface-100" />
          <h5 class="text-xs font-bold text-surface-400 uppercase mb-2">Administración</h5>
          <p class="text-sm"><strong>Paga:</strong> ${property.pays_administration ? 'Sí' : 'No'}</p>
          ${property.pays_administration ? `
            <p class="text-sm"><strong>Valor:</strong> ${formatCurrency(property.administration_fee)}</p>
            <p class="text-sm"><strong>Día pago:</strong> ${property.administration_day || 'No definido'}</p>
            <p class="text-sm"><strong>Método:</strong> ${property.administration_payment_method || 'No definido'}</p>
            ${property.administration_payment_info ? `
              <p class="text-sm"><strong>Info Pago:</strong> <span class="text-xs break-all text-primary-600">${property.administration_payment_info}</span></p>
            ` : ''}
          ` : ''}
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

function openValuationModal(property) {
  const defaultCity = property.city || 'Bogotá';
  const defaultStratum = property.stratum || 3;

  showModal(`Laboratorio de Rentabilidad - ${property.name}`, `
    <div class="flex gap-2 bg-surface-100 p-1 rounded-xl w-fit mb-6">
      <button id="tab-market" class="px-4 py-2 font-bold text-sm text-white bg-primary-600 rounded-lg shadow-sm transition-all focus:outline-none">
        <i data-lucide="map" class="w-4 h-4 inline-block mr-1"></i> Análisis de Mercado
      </button>
      <button id="tab-financial" class="px-4 py-2 font-semibold text-sm text-surface-600 hover:text-surface-900 rounded-lg transition-all focus:outline-none">
        <i data-lucide="calculator" class="w-4 h-4 inline-block mr-1"></i> Simulador Financiero
      </button>
    </div>

    <!-- Tab 1: Análisis de Mercado -->
    <div id="content-market" class="space-y-4 animate-fade-in block">
      <p class="text-sm text-surface-600">Simule el canon de arrendamiento y la rentabilidad esperada basados en promedios del mercado nacional.</p>
      
      <div class="grid grid-cols-2 gap-4 p-4 bg-surface-50 rounded-xl border border-surface-200">
        <div>
          <label class="label text-surface-700">Zona / Ciudad Objetivo</label>
          <select id="val-target-city" class="select bg-white">
            <optgroup label="Antioquia - Valle de Aburrá">
              <option value="Medellín" ${defaultCity === 'Medellín' ? 'selected' : ''}>Medellín</option>
              <option value="Envigado" ${defaultCity === 'Envigado' ? 'selected' : ''}>Envigado</option>
              <option value="Sabaneta" ${defaultCity === 'Sabaneta' ? 'selected' : ''}>Sabaneta</option>
              <option value="Itagüí" ${defaultCity === 'Itagüí' ? 'selected' : ''}>Itagüí</option>
              <option value="Bello" ${defaultCity === 'Bello' ? 'selected' : ''}>Bello</option>
            </optgroup>
            <optgroup label="Antioquia - Valle de San Nicolás">
              <option value="Rionegro" ${defaultCity === 'Rionegro' ? 'selected' : ''}>Rionegro / Llanogrande</option>
              <option value="La Ceja" ${defaultCity === 'La Ceja' ? 'selected' : ''}>La Ceja</option>
              <option value="Marinilla" ${defaultCity === 'Marinilla' ? 'selected' : ''}>Marinilla</option>
              <option value="El Retiro" ${defaultCity === 'El Retiro' ? 'selected' : ''}>El Retiro</option>
            </optgroup>
            <optgroup label="Bogotá y Cundinamarca">
              <option value="Bogotá" ${defaultCity === 'Bogotá' ? 'selected' : ''}>Bogotá D.C.</option>
              <option value="Chía" ${defaultCity === 'Chía' ? 'selected' : ''}>Chía</option>
              <option value="Cajicá" ${defaultCity === 'Cajicá' ? 'selected' : ''}>Cajicá</option>
            </optgroup>
            <optgroup label="Valle del Cauca">
              <option value="Cali" ${defaultCity === 'Cali' ? 'selected' : ''}>Cali</option>
              <option value="Palmira" ${defaultCity === 'Palmira' ? 'selected' : ''}>Palmira</option>
            </optgroup>
            <optgroup label="Costa Caribe">
              <option value="Barranquilla" ${defaultCity === 'Barranquilla' ? 'selected' : ''}>Barranquilla</option>
              <option value="Cartagena" ${defaultCity === 'Cartagena' ? 'selected' : ''}>Cartagena</option>
              <option value="Santa Marta" ${defaultCity === 'Santa Marta' ? 'selected' : ''}>Santa Marta</option>
            </optgroup>
            <optgroup label="Eje Cafetero">
              <option value="Pereira" ${defaultCity === 'Pereira' ? 'selected' : ''}>Pereira</option>
              <option value="Manizales" ${defaultCity === 'Manizales' ? 'selected' : ''}>Manizales</option>
              <option value="Armenia" ${defaultCity === 'Armenia' ? 'selected' : ''}>Armenia</option>
            </optgroup>
          </select>
        </div>
        <div>
          <label class="label text-surface-700">Estrato Objetivo</label>
          <select id="val-target-stratum" class="select bg-white">
            <option value="1" ${defaultStratum == 1 ? 'selected' : ''}>Estrato 1</option>
            <option value="2" ${defaultStratum == 2 ? 'selected' : ''}>Estrato 2</option>
            <option value="3" ${defaultStratum == 3 ? 'selected' : ''}>Estrato 3</option>
            <option value="4" ${defaultStratum == 4 ? 'selected' : ''}>Estrato 4</option>
            <option value="5" ${defaultStratum == 5 ? 'selected' : ''}>Estrato 5</option>
            <option value="6" ${defaultStratum == 6 ? 'selected' : ''}>Estrato 6</option>
          </select>
        </div>
      </div>

      <button id="run-valuation-btn" class="btn-primary w-full shadow-md justify-center">
        <i data-lucide="activity" class="w-4 h-4 mr-2"></i> Procesar Simulación de Mercado
      </button>

      <div id="valuation-results-container" class="hidden mt-6 space-y-4 animate-fade-in">
        <!-- Results will be injected here -->
      </div>
    </div>

    <!-- Tab 2: Simulador Financiero -->
    <div id="content-financial" class="hidden animate-fade-in w-full">
        <div id="financial-simulator-container">
           <div class="flex items-center justify-center p-12 text-surface-400">
               <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
           </div>
        </div>
    </div>

  `, { showCancel: true, confirmText: null, maxWidth: '1400px' });

  if (window.lucide) lucide.createIcons();

  // Tab Logic
  const tabMarket = document.getElementById('tab-market');
  const tabFin = document.getElementById('tab-financial');
  const contentMarket = document.getElementById('content-market');
  const contentFin = document.getElementById('content-financial');
  let financialRendered = false;

  tabMarket.addEventListener('click', () => {
      tabMarket.className = "px-4 py-2 font-bold text-sm text-white bg-primary-600 rounded-lg shadow-sm transition-all focus:outline-none";
      tabFin.className = "px-4 py-2 font-semibold text-sm text-surface-600 hover:text-surface-900 rounded-lg transition-all focus:outline-none";
      contentMarket.classList.replace('hidden', 'block');
      contentFin.classList.replace('block', 'hidden');
  });

  tabFin.addEventListener('click', async () => {
      tabFin.className = "px-4 py-2 font-bold text-sm text-white bg-primary-600 rounded-lg shadow-sm transition-all focus:outline-none";
      tabMarket.className = "px-4 py-2 font-semibold text-sm text-surface-600 hover:text-surface-900 rounded-lg transition-all focus:outline-none";
      contentFin.classList.replace('hidden', 'block');
      contentMarket.classList.replace('block', 'hidden');
      
      if (!financialRendered) {
          const container = document.getElementById('financial-simulator-container');
          await renderRentEstimator(container, property);
          financialRendered = true;
          // Re-init icons inside the simulator
          if (window.lucide) {
              setTimeout(() => lucide.createIcons(), 50);
          }
      }
  });

  // Market Valuation Logic
  document.getElementById('run-valuation-btn').addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    const city = document.getElementById('val-target-city').value;
    const stratum = parseInt(document.getElementById('val-target-stratum').value);
    const container = document.getElementById('valuation-results-container');
    
    // Loading state
    btn.disabled = true;
    btn.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div> Analizando zona...';
    
    try {
      let url = `/properties/${property.id}/valuation?`;
      const params = new URLSearchParams();
      if (city && city !== property.city) params.append('target_city', city);
      if (!isNaN(stratum)) params.append('target_stratum', stratum);
      
      const res = await api.get(url + params.toString());
      
      // Pasar el canon sugerido al properties dict para la tab financiera si el usuario cambia
      property.estimated_rent = res.estimated_monthly_rent;

      // Render bounds
      container.innerHTML = `
        <div class="bg-emerald-50 rounded-xl p-5 border border-emerald-100 flex flex-col items-center justify-center relative overflow-hidden">
          <div class="absolute -right-4 -top-4 opacity-[0.03]"><i data-lucide="trending-up" class="w-32 h-32"></i></div>
          <p class="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Canon Sugerido Mensual</p>
          <h2 class="text-3xl font-black text-emerald-800 drop-shadow-sm">${formatCurrency(res.estimated_monthly_rent)}</h2>
          <div class="flex items-center gap-2 mt-3 text-sm font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full shadow-inner">
            <span>${formatCurrency(res.range_min)}</span>
            <i data-lucide="arrow-right" class="w-3 h-3 text-emerald-500"></i>
            <span>${formatCurrency(res.range_max)}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="bg-white p-4 rounded-xl border border-surface-200 text-center shadow-sm">
            <p class="text-xs font-bold text-surface-400 uppercase mb-1">Cap Rate (Rent. Anual Ajustada)</p>
            <p class="text-lg font-bold text-indigo-600">${res.estimated_cap_rate > 0 ? formatPercent(res.estimated_cap_rate) : 'N/A'}</p>
          </div>
          <div class="bg-white p-4 rounded-xl border border-surface-200 text-center shadow-sm">
            <p class="text-xs font-bold text-surface-400 uppercase mb-1">Confianza del Algoritmo</p>
            <p class="text-lg font-bold text-primary-600">${formatPercent(res.confidence_score * 100)}</p>
          </div>
        </div>

        <div class="bg-surface-100 text-xs font-medium text-surface-500 p-3 rounded-lg border border-surface-200 flex items-start gap-2">
          <i data-lucide="info" class="w-4 h-4 shrink-0 mt-0.5 opacity-50"></i>
          <span>${res.provider}</span>
        </div>

        <div id="valuation-map" class="h-64 bg-surface-200 rounded-xl border border-surface-300 overflow-hidden relative z-0"></div>
      `;
      container.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();

      // Setup Map
      setTimeout(() => {
        // Destroy prev map if exists
        if (window._valuationMap) {
          window._valuationMap.remove();
          window._valuationMap = null;
        }

        const mapEl = document.getElementById('valuation-map');
        if (!mapEl) return;

        const CITY_COORDS = {
          "Bogotá": [4.6097, -74.0817],
          "Medellín": [6.2442, -75.5812],
          "Cali": [3.4516, -76.5320],
          "Barranquilla": [10.9639, -74.7964],
          "Cartagena": [10.3997, -75.5144], "Cartagena de Indias": [10.3997, -75.5144],
          "Bucaramanga": [7.1254, -73.1198],
          "Pereira": [4.8133, -75.6961],
          "Manizales": [5.0689, -75.5174],
          "Armenia": [4.5339, -75.6811],
          "Santa Marta": [11.2408, -74.1990],
          "Cúcuta": [7.8939, -72.5078],
          "Ibagué": [4.4389, -75.2322],
          "Neiva": [2.9273, -75.2819],
          "Villavicencio": [4.1420, -73.6266],
          "Envigado": [6.1759, -75.5917],
          "Sabaneta": [6.1515, -75.6151],
          "Itagüí": [6.1729, -75.6083],
          "Bello": [6.3373, -75.5579],
          "La Ceja": [6.0303, -75.4312],
          "Rionegro": [6.1528, -75.3725],
          "El Retiro": [6.0583, -75.5033],
          "Santa Fe de Antioquia": [6.5579, -75.8284]
        };

        const targetCity = res.city;
        let centerLat = property.latitude || 4.6097;
        let centerLng = property.longitude || -74.0817;

        // Override if a known city is hit
        if (CITY_COORDS[targetCity]) {
          centerLat = CITY_COORDS[targetCity][0];
          centerLng = CITY_COORDS[targetCity][1];
        }

        if (typeof L === 'undefined') {
          mapEl.innerHTML = `<div class="p-8 text-center text-surface-400">Error: Leaflet.js no cargado.</div>`;
          return;
        }

        try {
          const map = L.map('valuation-map').setView([centerLat, centerLng], 14);
          window._valuationMap = map;

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
        } catch (err) {
          console.error("Map init fail:", err);
          mapEl.innerHTML = `<div class="p-8 text-center text-error-500">Error al inicializar el mapa.</div>`;
          return;
        }

        // Main Marker
        const mainIcon = L.divIcon({
          className: 'bg-transparent',
          html: `<div class="w-5 h-5 bg-primary-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center animate-bounce"><div class="w-1.5 h-1.5 bg-white rounded-full"></div></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        L.marker([centerLat, centerLng], { icon: mainIcon })
          .addTo(map)
          .bindPopup(`<div class="font-bold text-sm">Zona Analizada</div><div class="text-xs text-primary-600">Simulación Central</div>`)
          .openPopup();

        // Generate Comparables (Random scattered points)
        const compIcon = L.divIcon({
          className: 'bg-transparent',
          html: `<div class="w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-md"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const numComparables = Math.floor(Math.random() * 5) + 6; // 6 to 10
        for (let i = 0; i < numComparables; i++) {
          const latOffset = (Math.random() - 0.5) * 0.025; // approx max 1-2km
          const lngOffset = (Math.random() - 0.5) * 0.025;
          const compPrice = res.estimated_monthly_rent * (1 + ((Math.random() - 0.5) * 0.2)); // +/- 10%
          
          L.marker([centerLat + latOffset, centerLng + lngOffset], { icon: compIcon })
            .addTo(map)
            .bindPopup(`<div class="font-bold text-xs text-surface-900">Comparable en el área</div>
                        <div class="text-emerald-700 font-semibold text-sm">${formatCurrency(compPrice)}</div>`);
        }
      }, 100);

    } catch (err) {
      showToast(err.message || 'Error simulando arriendo', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="activity" class="w-4 h-4 mr-2"></i> Procesar Simulación de Mercado';
      if (window.lucide) lucide.createIcons();
    }
  });
}
