import { api } from '../api.js';
import { showToast, showModal } from '../components/modal.js';

export async function renderSettings(container, state) {
    // Load profile for ALL users, config tabs only for Admin
    let profile = null;
    try {
        profile = await api.get('/users/me/profile');
    } catch(e) {
        profile = state.user;
    }

    const isAdmin = state.user?.role === 'Admin';
    const BASE_URL = api.baseUrl.replace('/api/v1', '');
    const avatarSrc = profile?.avatar_url ? `${BASE_URL}/${profile.avatar_url}` : null;
    const initials = (profile?.full_name || 'U').split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase();

    container.innerHTML = `
    <div class="max-w-3xl mx-auto space-y-6 animate-fade-in">

      <!-- ── Profile Card ─────────────────── -->
      <div class="glass-card-static p-6 border-t-4 border-t-primary-500">
        <h3 class="text-lg font-bold text-surface-900 mb-6 flex items-center gap-2">
          <i data-lucide="user-circle" class="w-5 h-5 text-primary-500"></i> Mi Perfil
        </h3>
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <!-- Avatar -->
          <div class="relative group flex-shrink-0">
            <div id="avatar-wrapper" class="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center shadow-lg cursor-pointer ring-2 ring-white ring-offset-2">
              ${avatarSrc
                ? `<img id="avatar-img" src="${avatarSrc}" class="w-full h-full object-cover" />`
                : `<span id="avatar-initials" class="text-white text-3xl font-bold">${initials}</span>`}
            </div>
            <label for="avatar-input" class="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition shadow-lg" title="Cambiar foto">
              <i data-lucide="camera" class="w-4 h-4"></i>
            </label>
            <input type="file" id="avatar-input" accept="image/jpeg,image/png,image/webp" class="hidden" />
          </div>

          <!-- Profile Info Form -->
          <form id="profile-form" class="flex-1 space-y-4 w-full">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="label text-sm">Nombre completo</label>
                <input class="input" name="full_name" type="text" value="${profile?.full_name || ''}" required />
              </div>
              <div>
                <label class="label text-sm">Correo electrónico</label>
                <input class="input bg-surface-50 text-surface-400" type="email" value="${profile?.email || ''}" disabled />
                <p class="text-[10px] text-surface-400 mt-1">El email no se puede cambiar.</p>
              </div>
              <div>
                <label class="label text-sm">Teléfono</label>
                <input class="input" name="phone" type="tel" value="${profile?.phone || ''}" placeholder="+57 300..." />
              </div>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-surface-100">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100">
                  <i data-lucide="shield" class="w-3 h-3"></i> ${profile?.role || 'Usuario'}
                </span>
                <span class="text-xs text-surface-400">Miembro desde ${profile?.created_at ? new Date(profile.created_at).toLocaleDateString('es') : '—'}</span>
              </div>
              <button type="submit" class="btn-primary py-2 px-5">
                <i data-lucide="save" class="w-4 h-4 mr-1"></i> Guardar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ── Change Password ──────────────── -->
      <div class="glass-card-static p-6 border-t-4 border-t-amber-500">
        <h3 class="text-lg font-bold text-surface-900 mb-5 flex items-center gap-2">
          <i data-lucide="lock" class="w-5 h-5 text-amber-500"></i> Cambiar Contraseña
        </h3>
        <form id="password-form" class="space-y-4 max-w-md">
          <div>
            <label class="label text-sm">Contraseña actual</label>
            <input class="input" type="password" name="current_password" required placeholder="••••••••" />
          </div>
          <div>
            <label class="label text-sm">Nueva contraseña</label>
            <input class="input" type="password" name="new_password" required minlength="8" placeholder="Mínimo 8 caracteres" />
          </div>
          <div>
            <label class="label text-sm">Confirmar nueva contraseña</label>
            <input class="input" type="password" name="confirm_password" required placeholder="Repite la nueva contraseña" />
          </div>
          <div class="flex justify-end pt-2">
            <button type="submit" class="btn-primary py-2 px-5 bg-amber-500 hover:bg-amber-600 focus:ring-amber-500">
              <i data-lucide="key" class="w-4 h-4 mr-1"></i> Actualizar Contraseña
            </button>
          </div>
        </form>
      </div>

      ${isAdmin ? `
      <!-- ── Gestión de Usuarios (Admin) ─────────────── -->
      <div class="glass-card-static p-6 border-t-4 border-t-indigo-500">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <i data-lucide="users" class="w-6 h-6"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-surface-900">Gestión de Usuarios</h3>
              <p class="text-xs text-surface-500">Administración de cuentas y accesos</p>
            </div>
          </div>
          <button id="btn-new-user" class="btn-primary py-2 px-4 shadow-sm text-sm bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500">
            <i data-lucide="user-plus" class="w-4 h-4 mr-1"></i> Nuevo Usuario
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr class="bg-surface-50 text-surface-500 font-medium border-b border-surface-100">
                <th class="px-4 py-3 rounded-l-lg">Usuario</th>
                <th class="px-4 py-3">Rol</th>
                <th class="px-4 py-3">Estado</th>
                <th class="px-4 py-3">Último Acceso</th>
                <th class="px-4 py-3 rounded-r-lg text-right">Acciones</th>
              </tr>
            </thead>
            <tbody id="users-table-body" class="divide-y divide-surface-100">
              <tr>
                <td colspan="5" class="px-4 py-8 text-center text-surface-500">
                  <i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500"></i>
                  Cargando usuarios...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Telegram Config ─────────────── -->
      <div class="glass-card-static p-6 border-t-4 border-t-sky-500">
        <div class="flex items-center justify-between gap-3 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
              <i data-lucide="bot" class="w-6 h-6"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-surface-900">Telegram Bot</h3>
              <p class="text-xs text-surface-500">Configuración para notificaciones y alertas</p>
            </div>
          </div>
          <div id="webhook-status-badge" class="badge badge-gray flex items-center gap-1">
            <i data-lucide="loader" class="w-3 h-3 animate-spin"></i> Verificando...
          </div>
        </div>
        <form id="telegram-config-form" class="space-y-4">
          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="label text-sm mb-0">Telegram Bot Token</label>
              <button type="button" id="btn-edit-token" class="text-xs text-primary-600 hover:text-primary-700 font-medium hidden">
                <i data-lucide="edit-2" class="w-3 h-3 inline"></i> Editar
              </button>
            </div>
            <input type="password" id="telegram_token" name="TELEGRAM_BOT_TOKEN" class="input font-mono text-sm" placeholder="123456789:ABC...XYZ">
          </div>
          <div>
            <label class="label text-sm">Chat ID (Admin/Grupo)</label>
            <input type="text" id="telegram_chat_id" name="TELEGRAM_CHAT_ID" class="input font-mono text-sm" placeholder="-100123456789">
          </div>
          <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-surface-100">
            <button type="button" class="btn-outline flex-1 mt-0" id="btn-activate-webhook">
              <i data-lucide="link" class="w-4 h-4 mr-2"></i> Activar Webhook
            </button>
            <button type="submit" class="btn-primary flex-1 mt-0">
              <i data-lucide="save" class="w-4 h-4 mr-2"></i> Guardar Ajustes
            </button>
          </div>
        </form>
      </div>

      <!-- ── Finanzas Config ─────────────── -->
      <div class="glass-card-static p-6 border-t-4 border-t-emerald-500">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <i data-lucide="percent" class="w-6 h-6"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-surface-900">Finanzas y Contratos</h3>
            <p class="text-xs text-surface-500">Parámetros globales de indexación</p>
          </div>
        </div>
        <form id="contracts-config-form" class="space-y-4 max-w-md">
          <div>
            <label class="label text-sm">Tasa de Inflación Anual / IPC (%)</label>
            <input type="number" step="0.0001" id="global_inflation_rate" name="global_inflation_rate" class="input font-mono text-sm" placeholder="0.0575 para 5.75%">
            <p class="text-[10px] text-surface-400 mt-1">Valor decimal: 0.05 = 5% anual.</p>
          </div>
          <div class="flex justify-end pt-2 border-t border-surface-100">
            <button type="submit" class="btn-primary py-2 px-5">
              <i data-lucide="save" class="w-4 h-4 mr-1"></i> Guardar
            </button>
          </div>
        </form>
      </div>
      ` : ''}
    </div>
    `;

    if (window.lucide) lucide.createIcons();

    // ── Avatar upload ────────────────────────────────────────
    document.getElementById('avatar-input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            showToast('Subiendo foto...', 'info');
            const res = await api.upload('/users/me/avatar', formData);
            const newSrc = `${BASE_URL}/${res.avatar_url}`;
            const wrapper = document.getElementById('avatar-wrapper');
            wrapper.innerHTML = `<img id="avatar-img" src="${newSrc}?t=${Date.now()}" class="w-full h-full object-cover" />`;
            // Also update sidebar avatar
            const userAvatar = document.getElementById('user-avatar');
            if (userAvatar) userAvatar.style.backgroundImage = `url(${newSrc})`;
            showToast('✅ Foto de perfil actualizada', 'success');
        } catch(err) {
            showToast('Error al subir la foto: ' + err.message, 'error');
        }
    });

    // ── Profile form ─────────────────────────────────────────
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
            await api.patch('/users/me/profile', {
                full_name: fd.get('full_name'),
                phone: fd.get('phone') || null
            });
            showToast('✅ Perfil actualizado', 'success');
            // Update sidebar name
            const nameEl = document.getElementById('user-name');
            if (nameEl) nameEl.textContent = fd.get('full_name');
        } catch(err) {
            showToast('Error: ' + err.message, 'error');
        }
    });

    // ── Password form ────────────────────────────────────────
    document.getElementById('password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const newPass = fd.get('new_password');
        const confirmPass = fd.get('confirm_password');
        if (newPass !== confirmPass) {
            showToast('Las contraseñas no coinciden', 'error');
            return;
        }
        try {
            await api.post('/users/me/change-password', {
                current_password: fd.get('current_password'),
                new_password: newPass
            });
            e.target.reset();
            showToast('✅ Contraseña actualizada exitosamente', 'success');
        } catch(err) {
            showToast('Error: ' + err.message, 'error');
        }
    });

    if (!isAdmin) return;

    // ── Admin: Load configs ──────────────────────────────────
    try {
        const configs = await api.get('/config');
        const tgForm = document.getElementById('telegram-config-form');
        const contractsForm = document.getElementById('contracts-config-form');
        configs.forEach(conf => {
            if (tgForm?.elements[conf.key]) tgForm.elements[conf.key].value = conf.value;
            if (contractsForm?.elements[conf.key]) contractsForm.elements[conf.key].value = conf.value;
        });

        const webhookBadge = document.getElementById('webhook-status-badge');
        const tokenInput = document.getElementById('telegram_token');
        const btnEditToken = document.getElementById('btn-edit-token');
        try {
            const whStatus = await api.get('/telegram/webhook-status');
            if (whStatus.ok && whStatus.result?.url) {
                webhookBadge.className = 'badge badge-green flex items-center gap-1';
                webhookBadge.innerHTML = '<i data-lucide="check-circle" class="w-3 h-3"></i> Conectado';
                tokenInput.disabled = true;
                btnEditToken.classList.remove('hidden');
            } else {
                webhookBadge.className = 'badge badge-gray flex items-center gap-1';
                webhookBadge.innerHTML = '<i data-lucide="x-circle" class="w-3 h-3"></i> Inactivo';
            }
        } catch(e) {
            webhookBadge.className = 'badge badge-red flex items-center gap-1';
            webhookBadge.innerHTML = '<i data-lucide="alert-circle" class="w-3 h-3"></i> Error Webhook';
        }
        if (window.lucide) lucide.createIcons();
    } catch(e) {
        showToast('Error al cargar configuración', 'error');
    }

    document.getElementById('btn-edit-token')?.addEventListener('click', () => {
        if (confirm('Si editas el token, deberás volver a activar el webhook. ¿Deseas editarlo?')) {
            document.getElementById('telegram_token').disabled = false;
            document.getElementById('telegram_token').focus();
        }
    });

    document.getElementById('telegram-config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = e.target.elements['TELEGRAM_BOT_TOKEN'].value.trim();
        const chat_id = e.target.elements['TELEGRAM_CHAT_ID'].value.trim();
        try {
            await api.post('/config/batch', { "TELEGRAM_BOT_TOKEN": token, "TELEGRAM_CHAT_ID": chat_id });
            showToast('✅ Ajustes de Telegram guardados', 'success');
        } catch(error) {
            showToast('Error al guardar: ' + error.message, 'error');
        }
    });

    document.getElementById('btn-activate-webhook').addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        btn.disabled = true;
        try {
            const baseUrl = import.meta.env?.VITE_API_URL || 'https://real-state-xd5o.onrender.com';
            await api.post('/telegram/register-webhook', { domain: baseUrl });
            showToast('✅ Webhook activado correctamente', 'success');
            setTimeout(() => window.location.reload(), 1500);
        } catch(err) {
            showToast('Error en Webhook: ' + err.message, 'error');
        } finally { btn.disabled = false; }
    });

    document.getElementById('contracts-config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const rate = e.target.elements['global_inflation_rate'].value.trim();
        try {
            await api.post('/config/batch', { "global_inflation_rate": rate });
            showToast('✅ Ajustes financieros guardados', 'success');
        } catch(error) {
            showToast('Error al guardar: ' + error.message, 'error');
        }
    });

    // ── Admin: Init Users Table ─────────────────────────────
    loadUsers(state);
    
    document.getElementById('btn-new-user')?.addEventListener('click', () => {
        showModal('Nuevo Usuario', `
          <form id="create-user-form" class="space-y-4">
            <div>
              <label class="label text-sm">Nombre completo</label>
              <input class="input" type="text" name="full_name" required minlength="2" placeholder="Juan Pérez" />
            </div>
            <div>
              <label class="label text-sm">Correo electrónico</label>
              <input class="input" type="email" name="email" required placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label class="label text-sm">Contraseña</label>
              <input class="input" type="password" name="password" required minlength="8" placeholder="Mínimo 8 caracteres" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label text-sm">Rol</label>
                <select class="select" name="role">
                  <option value="Propietario">Propietario</option>
                  <option value="Gestor" selected>Gestor</option>
                  <option value="Admin">Administrador</option>
                </select>
              </div>
              <div>
                <label class="label text-sm">Teléfono (Opcional)</label>
                <input class="input" type="tel" name="phone" placeholder="+57..." />
              </div>
            </div>
          </form>
        `, {
            confirmText: 'Crear Usuario',
            onConfirm: async () => {
                const fd = new FormData(document.getElementById('create-user-form'));
                await api.post('/users', Object.fromEntries(fd));
                showToast('✅ Usuario creado exitosamente', 'success');
                loadUsers(state);
            }
        });
    });
}

async function loadUsers(state) {
    try {
        const res = await api.get('/users?limit=100');
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;
        
        if (!res.items || res.items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-surface-500">No hay usuarios</td></tr>';
            return;
        }

        tbody.innerHTML = res.items.map(u => `
            <tr class="hover:bg-surface-50 transition-colors">
                <td class="px-4 py-3">
                    <div class="font-medium text-surface-900">${u.full_name}</div>
                    <div class="text-xs text-surface-500">${u.email}</div>
                </td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'Admin' ? 'bg-rose-100 text-rose-700' :
                        u.role === 'Gestor' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-emerald-100 text-emerald-700'
                    }">
                        ${u.role}
                    </span>
                </td>
                <td class="px-4 py-3">
                    ${u.is_active 
                        ? '<span class="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-medium"><div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Activo</span>'
                        : '<span class="inline-flex items-center gap-1.5 text-rose-600 text-xs font-medium"><div class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div> Inactivo</span>'}
                </td>
                <td class="px-4 py-3 text-xs text-surface-500">
                    ${u.last_login ? new Date(u.last_login).toLocaleString('es') : 'Nunca'}
                </td>
                <td class="px-4 py-3 text-right space-x-1">
                    <button class="btn-edit-user p-1.5 text-surface-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" data-id="${u.id}" data-user='${JSON.stringify(u)}' title="Editar rol/estado">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                    </button>
                    <button class="btn-reset-pwd p-1.5 text-surface-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" data-id="${u.id}" data-name="${u.full_name}" title="Resetear contraseña">
                        <i data-lucide="key" class="w-4 h-4"></i>
                    </button>
                    ${u.id !== state.user?.id && u.is_active ? `
                    <button class="btn-deactivate p-1.5 text-surface-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" data-id="${u.id}" data-name="${u.full_name}" title="Desactivar cuenta">
                        <i data-lucide="user-x" class="w-4 h-4"></i>
                    </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
        
        if (window.lucide) lucide.createIcons();
        attachUserEvents(state);
    } catch (err) {
        showToast('Error cargando usuarios: ' + err.message, 'error');
    }
}

function attachUserEvents(state) {
    document.querySelectorAll('.btn-edit-user').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const u = JSON.parse(e.currentTarget.dataset.user);
            showModal('Editar Usuario', `
              <form id="edit-user-form" class="space-y-4">
                <div>
                  <label class="label text-sm">Nombre completo</label>
                  <input class="input" type="text" name="full_name" value="${u.full_name}" required minlength="2" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label text-sm">Rol</label>
                    <select class="select" name="role">
                      <option value="Propietario" ${u.role==='Propietario'?'selected':''}>Propietario</option>
                      <option value="Gestor" ${u.role==='Gestor'?'selected':''}>Gestor</option>
                      <option value="Admin" ${u.role==='Admin'?'selected':''}>Administrador</option>
                    </select>
                  </div>
                  <div>
                    <label class="label text-sm">Estado</label>
                    <div class="mt-2 flex items-center gap-2">
                      <input type="checkbox" name="is_active" id="is_active_cb" ${u.is_active?'checked':''} class="w-4 h-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500">
                      <label for="is_active_cb" class="text-sm text-surface-700">Cuenta Activa</label>
                    </div>
                  </div>
                </div>
              </form>
            `, {
                confirmText: 'Guardar Cambios',
                onConfirm: async () => {
                    const form = document.getElementById('edit-user-form');
                    const fd = new FormData(form);
                    await api.put(`/users/${u.id}`, {
                        full_name: fd.get('full_name'),
                        role: fd.get('role'),
                        is_active: form.elements['is_active'].checked
                    });
                    showToast('✅ Usuario actualizado', 'success');
                    loadUsers(state);
                }
            });
        });
    });

    document.querySelectorAll('.btn-reset-pwd').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const name = e.currentTarget.dataset.name;
            showModal('Resetear Contraseña', `
              <div class="mb-4 text-sm text-surface-600">
                Escribe la nueva contraseña para <strong>${name}</strong>.
              </div>
              <form id="reset-pwd-form">
                <label class="label text-sm">Nueva contraseña</label>
                <input class="input" type="text" name="new_password" required minlength="8" placeholder="Mínimo 8 caracteres" />
              </form>
            `, {
                confirmText: 'Aplicar',
                onConfirm: async () => {
                    const fd = new FormData(document.getElementById('reset-pwd-form'));
                    await api.post(`/users/${id}/reset-password`, {
                        new_password: fd.get('new_password')
                    });
                    showToast('✅ Contraseña reseteada', 'success');
                }
            });
        });
    });

    document.querySelectorAll('.btn-deactivate').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const name = e.currentTarget.dataset.name;
            showModal('Confirmar Desactivación', `
              <div class="text-rose-600 bg-rose-50 p-4 rounded-lg flex gap-3 text-sm">
                <i data-lucide="alert-triangle" class="w-5 h-5 flex-shrink-0"></i>
                <p>¿Estás seguro de desactivar a <strong>${name}</strong>? El usuario no podrá iniciar sesión en el sistema.</p>
              </div>
            `, {
                confirmText: 'Desactivar',
                onConfirm: async () => {
                    await api.delete(`/users/${id}`);
                    showToast('✅ Usuario desactivado', 'success');
                    loadUsers(state);
                }
            });
        });
    });
}
