import { api } from '../api.js';
import { showToast } from '../components/modal.js';

export async function renderSettings(container, state) {
    if (state.user?.role !== 'Admin') {
        container.innerHTML = `<div class="p-8 text-center text-surface-500">Acceso denegado. Se requieren permisos de Administrador.</div>`;
        return;
    }

    container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in cursor-default">
        <!-- Telegram Config -->
        <div class="glass-card-static p-6 border-t-4 border-t-sky-500">
            <div class="flex items-center justify-between gap-3 mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                        <i data-lucide="bot" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-surface-900">Telegram Bot</h3>
                        <p class="text-sm text-surface-500">Configuración para notificaciones y alertas</p>
                    </div>
                </div>
                <div id="webhook-status-badge" class="badge badge-gray flex items-center gap-1">
                    <i data-lucide="loader" class="w-3 h-3 animate-spin"></i> Verificando...
                </div>
            </div>

            <form id="telegram-config-form" class="space-y-4">
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label class="label text-sm mb-0" for="telegram_token">Telegram Bot Token</label>
                        <button type="button" id="btn-edit-token" class="text-xs text-primary-600 hover:text-primary-700 font-medium hidden">
                            <i data-lucide="edit-2" class="w-3 h-3 inline"></i> Editar
                        </button>
                    </div>
                    <input type="password" id="telegram_token" name="TELEGRAM_BOT_TOKEN" class="input font-mono text-sm" placeholder="123456789:ABC...XYZ">
                    <p class="text-xs text-surface-400 mt-1">Paso 1: Pega y guarda el token.</p>
                </div>
                <div>
                    <label class="label text-sm" for="telegram_chat_id">Chat ID (Administrador/Grupo)</label>
                    <input type="text" id="telegram_chat_id" name="TELEGRAM_CHAT_ID" class="input font-mono text-sm" placeholder="-100123456789">
                    <p class="text-xs text-surface-400 mt-1">Requerido para que el Bot sepa dónde enviar las alertas.</p>
                </div>
                <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-surface-100">
                    <button type="button" class="btn-outline flex-1 mt-0" id="btn-activate-webhook">
                        <i data-lucide="link" class="w-4 h-4 mr-2"></i> Paso 2: Activar Webhook
                    </button>
                    <button type="submit" class="btn-primary flex-1 mt-0" id="btn-save-telegram">
                        <i data-lucide="save" class="w-4 h-4 mr-2"></i> Guardar Ajustes
                    </button>
                </div>
            </form>
        </div>

        <!-- Email Config -->
        <div class="glass-card-static p-6 border-t-4 border-t-accent-500">
            <div class="flex items-center justify-between gap-3 mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center text-accent-600">
                        <i data-lucide="mail" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-surface-900">Servidor de Correo (SMTP)</h3>
                        <p class="text-sm text-surface-500">Configuración para envíos de correo del sistema</p>
                    </div>
                </div>
                <div id="smtp-status-badge" class="badge badge-gray flex items-center gap-1 text-xs">
                    <i data-lucide="circle" class="w-3 h-3"></i> Sin verificar
                </div>
            </div>

            <form id="email-config-form" class="space-y-4">
                <div class="grid grid-cols-3 gap-4">
                    <div class="col-span-2">
                        <label class="label text-sm" for="smtp_host">SMTP Host</label>
                        <input type="text" id="smtp_host" name="SMTP_HOST" class="input text-sm" placeholder="smtp.gmail.com">
                    </div>
                    <div>
                        <label class="label text-sm" for="smtp_port">Puerto</label>
                        <input type="number" id="smtp_port" name="SMTP_PORT" class="input text-sm" placeholder="587">
                        <p class="text-[10px] text-surface-400 mt-0.5">587=TLS, 465=SSL</p>
                    </div>
                </div>
                <div>
                    <label class="label text-sm" for="smtp_user">Usuario SMTP (correo emisor)</label>
                    <input type="text" id="smtp_user" name="SMTP_USER" class="input text-sm" placeholder="tucorreo@gmail.com">
                </div>
                <div>
                    <label class="label text-sm" for="smtp_pass">Contraseña SMTP</label>
                    <input type="password" id="smtp_pass" name="SMTP_PASS" class="input text-sm" placeholder="Contraseña de aplicación">
                    <p class="text-[10px] text-surface-400 mt-0.5">Para Gmail usa una <a href="https://myaccount.google.com/apppasswords" target="_blank" class="text-primary-500 underline">contraseña de aplicación</a></p>
                </div>
                <div>
                    <label class="label text-sm" for="smtp_test_email">Correo para prueba (opcional)</label>
                    <input type="email" id="smtp_test_email" class="input text-sm" placeholder="destino@ejemplo.com">
                    <p class="text-[10px] text-surface-400 mt-0.5">Si ingresa un correo, al probar se enviará un email de prueba a esta dirección.</p>
                </div>

                <!-- SMTP Test Result -->
                <div id="smtp-test-result" class="hidden rounded-xl p-3 text-sm font-medium flex items-center gap-2"></div>

                <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-surface-100">
                    <button type="button" class="btn-outline flex-1 mt-0" id="btn-test-smtp">
                        <i data-lucide="plug" class="w-4 h-4 mr-2"></i> Probar Conexión
                    </button>
                    <button type="submit" class="btn-primary flex-1 mt-0" id="btn-save-email">
                        <i data-lucide="save" class="w-4 h-4 mr-2"></i> Guardar Correo
                    </button>
                </div>
            </form>
        </div>
    </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Load configs
    try {
        const configs = await api.get('/config');
        const tgForm = document.getElementById('telegram-config-form');
        const emForm = document.getElementById('email-config-form');
        configs.forEach(conf => {
            if (tgForm.elements[conf.key]) tgForm.elements[conf.key].value = conf.value;
            if (emForm.elements[conf.key]) emForm.elements[conf.key].value = conf.value;
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
                tokenInput.disabled = false;
            }
        } catch (e) {
            webhookBadge.className = 'badge badge-red flex items-center gap-1';
            webhookBadge.innerHTML = '<i data-lucide="alert-circle" class="w-3 h-3"></i> Error Webhook';
        }
        if (window.lucide) lucide.createIcons();

    } catch (e) {
        showToast('Error al cargar la configuración', 'error');
    }

    // Handlers
    document.getElementById('btn-edit-token')?.addEventListener('click', () => {
        if (confirm('Si editas el token, deberás volver a activar el webhook. ¿Deseas editarlo?')) {
            document.getElementById('telegram_token').disabled = false;
            document.getElementById('telegram_token').focus();
        }
    });

    document.getElementById('telegram-config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-telegram');
        btn.disabled = true;
        const token = e.target.elements['TELEGRAM_BOT_TOKEN'].value.trim();
        const chat_id = e.target.elements['TELEGRAM_CHAT_ID'].value.trim();
        try {
            await api.post('/config/batch', { 
                "TELEGRAM_BOT_TOKEN": token,
                "TELEGRAM_CHAT_ID": chat_id 
            });
            showToast('Ajustes guardados exitosamente', 'success');
            if (token) {
                document.getElementById('telegram_token').disabled = true;
                document.getElementById('btn-edit-token').classList.remove('hidden');
            }
        } catch (error) {
            showToast('Error al guardar: ' + error.message, 'error');
        } finally { btn.disabled = false; }
    });

    document.getElementById('email-config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-email');
        btn.disabled = true;
        const updates = {
            "SMTP_HOST": e.target.elements['SMTP_HOST'].value.trim(),
            "SMTP_PORT": e.target.elements['SMTP_PORT'].value.trim(),
            "SMTP_USER": e.target.elements['SMTP_USER'].value.trim(),
            "SMTP_PASS": e.target.elements['SMTP_PASS'].value.trim(),
        };
        try {
            await api.post('/config/batch', updates);
            showToast('Configuración SMTP guardada', 'success');
            // Reset test result
            const resultBox = document.getElementById('smtp-test-result');
            resultBox.classList.add('hidden');
            const badge = document.getElementById('smtp-status-badge');
            badge.className = 'badge badge-gray flex items-center gap-1 text-xs';
            badge.innerHTML = '<i data-lucide="circle" class="w-3 h-3"></i> Sin verificar';
            if (window.lucide) lucide.createIcons();
        } catch (error) {
            showToast('Error al guardar: ' + error.message, 'error');
        } finally { btn.disabled = false; }
    });

    // Test SMTP connection
    document.getElementById('btn-test-smtp').addEventListener('click', async () => {
        const btn = document.getElementById('btn-test-smtp');
        const resultBox = document.getElementById('smtp-test-result');
        const badge = document.getElementById('smtp-status-badge');
        const testEmail = document.getElementById('smtp_test_email').value.trim();

        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 mr-2 animate-spin"></i> Probando...';
        if (window.lucide) lucide.createIcons();
        resultBox.classList.add('hidden');

        // First save current values before testing
        const emForm = document.getElementById('email-config-form');
        const updates = {
            "SMTP_HOST": emForm.elements['SMTP_HOST'].value.trim(),
            "SMTP_PORT": emForm.elements['SMTP_PORT'].value.trim(),
            "SMTP_USER": emForm.elements['SMTP_USER'].value.trim(),
            "SMTP_PASS": emForm.elements['SMTP_PASS'].value.trim(),
        };

        try {
            // Save first
            await api.post('/config/batch', updates);

            // Then test
            const payload = testEmail ? { recipient: testEmail } : {};
            const result = await api.post('/config/test-email', payload);

            resultBox.classList.remove('hidden');
            if (result.success) {
                resultBox.className = 'rounded-xl p-3 text-sm font-medium flex items-center gap-2 bg-green-50 text-green-700 border border-green-200';
                resultBox.innerHTML = `<i data-lucide="check-circle" class="w-5 h-5 shrink-0"></i> ${result.message}`;
                badge.className = 'badge badge-green flex items-center gap-1 text-xs';
                badge.innerHTML = '<i data-lucide="check-circle" class="w-3 h-3"></i> Conectado';
                showToast('✅ Conexión SMTP verificada', 'success');
            } else {
                resultBox.className = 'rounded-xl p-3 text-sm font-medium flex items-center gap-2 bg-red-50 text-red-700 border border-red-200';
                resultBox.innerHTML = `<i data-lucide="x-circle" class="w-5 h-5 shrink-0"></i> ${result.message}`;
                badge.className = 'badge badge-red flex items-center gap-1 text-xs';
                badge.innerHTML = '<i data-lucide="x-circle" class="w-3 h-3"></i> Error';
                showToast('❌ ' + result.message, 'error');
            }
        } catch (error) {
            resultBox.classList.remove('hidden');
            resultBox.className = 'rounded-xl p-3 text-sm font-medium flex items-center gap-2 bg-red-50 text-red-700 border border-red-200';
            resultBox.innerHTML = `<i data-lucide="alert-triangle" class="w-5 h-5 shrink-0"></i> Error: ${error.message}`;
            badge.className = 'badge badge-red flex items-center gap-1 text-xs';
            badge.innerHTML = '<i data-lucide="x-circle" class="w-3 h-3"></i> Error';
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i data-lucide="plug" class="w-4 h-4 mr-2"></i> Probar Conexión';
            if (window.lucide) lucide.createIcons();
        }
    });

    document.getElementById('btn-activate-webhook').addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        btn.disabled = true;
        try {
            // FIX: Use backend domain instead of frontend origin
            const baseUrl = import.meta.env.VITE_API_URL || 'https://real-state-xd5o.onrender.com';
            await api.post('/telegram/register-webhook', { domain: baseUrl });
            showToast('Webhook activado correctamente', 'success');
            setTimeout(() => window.location.reload(), 1500); // Reload to update status badge
        } catch (err) {
            showToast('Error en Webhook: ' + err.message, 'error');
        } finally { btn.disabled = false; }
    });
}
