/**
 * Contacts Page — Directory for providers, tenants, clients, and others.
 */
import { api } from '../api.js';
import { showToast, showModal, closeModal } from '../components/modal.js';
import { formatDate } from '../utils/formatters.js';

export async function renderContacts(container) {
  container.innerHTML = `
    <div class="flex flex-col gap-6 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-bold text-surface-900">Directorio de Contactos</h3>
          <p class="text-sm text-surface-500">Gestione proveedores, inquilinos y clientes de su cartera</p>
        </div>
        <button id="add-contact-btn" class="btn-primary"><i data-lucide="user-plus" class="w-4 h-4"></i> Nuevo Contacto</button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-4 p-4 glass-card-static !rounded-2xl border-white/40 shadow-sm">
        <div class="flex-1 min-w-[200px]">
          <div class="relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400"></i>
            <input type="text" id="filter-search" placeholder="Buscar por nombre, email o especialidad..." class="w-full bg-white/50 pl-10 pr-4 py-2 rounded-xl border border-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
        </div>
        
        <div class="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm w-48">
          <i data-lucide="filter" class="w-3.5 h-3.5 text-surface-400"></i>
          <select id="filter-type" class="bg-transparent text-sm font-medium focus:outline-none w-full appearance-none">
            <option value="">Todos los tipos</option>
            <option value="Proveedor">Proveedor</option>
            <option value="Arrendatario">Arrendatario</option>
            <option value="Cliente">Cliente</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <button id="apply-filters" class="btn-primary !rounded-xl shadow-lg py-2 px-4 flex items-center gap-2">
           Buscar
        </button>
      </div>

      <!-- Table Container -->
      <div id="contacts-table-container" class="glass-card-static overflow-hidden min-h-[400px]">
        <div class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  const loadContent = async () => {
    const tableContainer = document.getElementById('contacts-table-container');
    const search = document.getElementById('filter-search').value;
    const type = document.getElementById('filter-type').value;

    let query = `/contacts?limit=100`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    if (type) query += `&contact_type=${encodeURIComponent(type)}`;

    try {
      const data = await api.get(query);
      renderTable(tableContainer, data.items || [], loadContent);
    } catch (err) {
      tableContainer.innerHTML = `<div class="p-8 text-center text-rose-500">Error al cargar contactos: ${err.message}</div>`;
    }
  };

  document.getElementById('apply-filters').addEventListener('click', loadContent);
  document.getElementById('filter-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadContent();
  });
  
  document.getElementById('add-contact-btn').addEventListener('click', () => openContactModal(null, loadContent));
  
  // Initial load
  loadContent();
}

function getBadgeColor(type) {
  switch (type) {
    case 'Proveedor': return 'badge-amber';
    case 'Arrendatario': return 'badge-green';
    case 'Cliente': return 'badge-blue';
    default: return 'bg-surface-100 text-surface-600';
  }
}

function renderTable(container, contacts, onReload) {
  if (!contacts.length) {
    container.innerHTML = `
      <div class="py-20 text-center flex flex-col items-center">
        <div class="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4">
           <i data-lucide="users" class="w-8 h-8 text-surface-400"></i>
        </div>
        <h4 class="text-surface-600 font-medium mb-1">No hay contactos registrados</h4>
        <p class="text-sm text-surface-400 mb-4">Añade tu primer contacto o ajusta los filtros de búsqueda.</p>
        <button class="btn-primary-outline text-sm" onclick="document.getElementById('add-contact-btn').click()">
          Crear Contacto
        </button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Contacto</th>
          <th>Contacto / Ubicación</th>
          <th>Especialidad</th>
          <th>Estado</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${contacts.map(c => `
          <tr class="hover:bg-surface-50 transition-colors">
            <td>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex justify-center items-center text-white font-bold text-sm shadow-sm">
                  ${c.name.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <div class="font-bold text-surface-900">${c.name}</div>
                  <span class="badge ${getBadgeColor(c.contact_type)} mt-1 text-[10px]">${c.contact_type}</span>
                </div>
              </div>
            </td>
            <td>
               <div class="text-sm text-surface-700">
                  <div class="flex items-center gap-1.5"><i data-lucide="mail" class="w-3.5 h-3.5 text-surface-400"></i> ${c.email || '<span class="text-surface-300 italic">No registrado</span>'}</div>
                  <div class="flex items-center gap-1.5 mt-1"><i data-lucide="phone" class="w-3.5 h-3.5 text-surface-400"></i> ${c.phone || '<span class="text-surface-300 italic">No registrado</span>'}</div>
               </div>
            </td>
            <td>
               <div class="text-sm text-surface-800 font-medium">${c.specialty || '—'}</div>
               <div class="text-xs text-surface-400 truncate max-w-[150px]" title="${c.address || ''}">${c.address || ''}</div>
            </td>
            <td>
               <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.is_active ? 'bg-green-50 text-green-700' : 'bg-surface-100 text-surface-500'}">
                  <span class="w-1.5 h-1.5 rounded-full ${c.is_active ? 'bg-green-500' : 'bg-surface-400'}"></span>
                  ${c.is_active ? 'Activo' : 'Inactivo'}
               </span>
            </td>
            <td>
              <div class="flex justify-end gap-1">
                ${c.contact_type === 'Proveedor' ? `
                <button class="stats-btn p-2 rounded-lg hover:bg-teal-50 text-teal-600 transition" data-id="${c.id}" title="Ver Estadísticas">
                  <i data-lucide="activity" class="w-4 h-4"></i>
                </button>
                ` : ''}
                <button class="edit-btn p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition" data-id="${c.id}" title="Editar">
                  <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
                <button class="delete-btn p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition" data-id="${c.id}" title="Eliminar">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  if (window.lucide) lucide.createIcons();

  // Attach events
  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const contact = contacts.find(x => x.id === btn.dataset.id);
      openContactModal(contact, onReload);
    });
  });

  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showModal('¿Eliminar Contacto?', 'Esta acción no se puede deshacer.', {
        confirmText: 'Eliminar',
        onConfirm: async () => {
          try {
            await api.delete(`/contacts/${btn.dataset.id}`);
            showToast('Contacto eliminado', 'success');
            onReload();
          } catch(err) {
            showToast(err.message, 'error');
          }
        }
      });
    });
  });
  
  container.querySelectorAll('.stats-btn').forEach(btn => {
     btn.addEventListener('click', async () => {
        try {
            const stats = await api.get(`/contacts/${btn.dataset.id}/supplier-stats`);
            showModal('Estadísticas del Proveedor', `
                <div class="grid grid-cols-2 gap-4 mb-4">
                   <div class="bg-surface-50 rounded-xl p-4 border border-surface-200">
                      <p class="text-surface-500 text-xs">Trabajos Asignados</p>
                      <h4 class="text-xl font-bold text-surface-900">${stats.total_jobs}</h4>
                   </div>
                   <div class="bg-primary-50 rounded-xl p-4 border border-primary-100">
                      <p class="text-primary-600 text-xs text-opacity-80">Total Facturado</p>
                      <h4 class="text-xl font-bold text-primary-700">$${(stats.total_billed || 0).toLocaleString()}</h4>
                   </div>
                </div>
            `, { confirmText: 'Cerrar', showCancel: false });
        } catch(e) {
            showToast('No se pudieron cargar las estadísticas', 'error');
        }
     });
  });
}

function openContactModal(existingData = null, onSuccess) {
  const isEdit = !!existingData;

  showModal(isEdit ? 'Editar Contacto' : 'Nuevo Contacto', `
    <form id="contact-form" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
            <label class="label">Nombre completo / Empresa *</label>
            <input class="input" type="text" name="name" value="${isEdit ? existingData.name : ''}" required />
        </div>
        <div>
            <label class="label">Tipo *</label>
            <select class="select" name="contact_type" required>
               <option value="Proveedor" ${isEdit && existingData.contact_type === 'Proveedor' ? 'selected' : ''}>Proveedor</option>
               <option value="Arrendatario" ${isEdit && existingData.contact_type === 'Arrendatario' ? 'selected' : ''}>Arrendatario</option>
               <option value="Cliente" ${isEdit && existingData.contact_type === 'Cliente' ? 'selected' : ''}>Cliente</option>
               <option value="Otro" ${isEdit && existingData.contact_type === 'Otro' ? 'selected' : ''}>Otro</option>
            </select>
        </div>
        <div>
            <label class="label">Especialidad</label>
            <input class="input" type="text" name="specialty" value="${isEdit && existingData.specialty ? existingData.specialty : ''}" placeholder="Ej. Plomería, Abogado..." />
        </div>
        <div>
            <label class="label">Email</label>
            <input class="input" type="email" name="email" value="${isEdit && existingData.email ? existingData.email : ''}" />
        </div>
        <div>
            <label class="label">Teléfono</label>
            <input class="input" type="text" name="phone" value="${isEdit && existingData.phone ? existingData.phone : ''}" />
        </div>
        <div class="col-span-2">
            <label class="label">Dirección</label>
            <input class="input" type="text" name="address" value="${isEdit && existingData.address ? existingData.address : ''}" />
        </div>
        <div class="col-span-2">
            <label class="label">Notas adicionales</label>
            <textarea class="input" name="notes" rows="2">${isEdit && existingData.notes ? existingData.notes : ''}</textarea>
        </div>
        ${isEdit ? `
        <div class="col-span-2 flex items-center gap-2 mt-2">
           <input type="checkbox" name="is_active" id="ca" class="w-4 h-4 text-primary-600 rounded" ${existingData.is_active ? 'checked' : ''} />
           <label for="ca" class="text-sm font-medium text-surface-700">Contacto activo</label>
        </div>
        ` : ''}
      </div>
    </form>
  `, {
    confirmText: isEdit ? 'Guardar Cambios' : 'Crear Contacto',
    onConfirm: async () => {
      const form = document.getElementById('contact-form');
      if (!form.reportValidity()) return false;
      const fd = new FormData(form);
      
      const payload = {
        name: fd.get('name'),
        contact_type: fd.get('contact_type'),
        email: fd.get('email') || null,
        phone: fd.get('phone') || null,
        address: fd.get('address') || null,
        specialty: fd.get('specialty') || null,
        notes: fd.get('notes') || null
      };

      if (isEdit && fd.has('is_active')) {
         payload.is_active = document.getElementById('ca').checked;
      }

      try {
        if (!isEdit) {
          await api.post('/contacts', payload);
          showToast('Contacto creado', 'success');
        } else {
          await api.patch(`/contacts/${existingData.id}`, payload);
          showToast('Contacto actualizado', 'success');
        }
        if (onSuccess) onSuccess();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  });
}
