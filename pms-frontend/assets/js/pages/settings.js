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
            <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                    <i data-lucide="bot" class="w-6 h-6"></i>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-surface-900">Telegram Bot</h3>
                    <p class="text-sm text-surface-500">Configuración para notificaciones y recepción de reportes</p>
                </div>
            </div>

            <form id="telegram-config-form" class="space-y-4">
                <div>
                    <label class="label text-sm" for="telegram_token">Telegram Bot Token (obtenido de @BotFather)</label>
                    <input type="password" id="telegram_token" name="TELEGRAM_BOT_TOKEN" class="input font-mono text-sm" placeholder="123456789:ABC...XYZ">
                    <p class="text-xs text-surface-400 mt-1">Paso 1: Pega y guarda el token.</p>
                </div>
                <div class="flex justify-end gap-3 pt-4 border-t border-surface-100">
                    <button type="button" class="btn-outline flex-1" id="btn-activate-webhook">
                        <i data-lucide="link" class="w-4 h-4 mr-2"></i> Paso 2: Activar Webhook
                    </button>
                    <button type="submit" class="btn-primary flex-1" id="btn-save-telegram">
                        <i data-lucide="save" class="w-4 h-4 mr-2"></i> Guardar Token
                    </button>
                </div>
            </form>
        </div>

        <!-- Email Config -->
        <div class="glass-card-static p-6 border-t-4 border-t-accent-500">
            <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center text-accent-600">
                    <i data-lucide="mail" class="w-6 h-6"></i>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-surface-900">Servidor de Correo (SMTP)</h3>
                    <p class="text-sm text-surface-500">Configuración para envíos de correo del sistema</p>
                </div>
            </div>

            <form id="email-config-form" class="space-y-4">
                <div class="grid grid-cols-3 gap-4">
                    <div class="col-span-2">
                        <label class="label text-sm" for="smtp_host">SMTP Host</label>
                        <input type="text" id="smtp_host" name="SMTP_HOST" class="input text-sm" placeholder="smtp.ejemplo.com">
                    </div>
                    <div>
                        <label class="label text-sm" for="smtp_port">Puerto</label>
                        <input type="number" id="smtp_port" name="SMTP_PORT" class="input text-sm" placeholder="587">
                    </div>
                </div>
                <div>
                    <label class="label text-sm" for="smtp_user">Usuario SMTP</label>
                    <input type="text" id="smtp_user" name="SMTP_USER" class="input text-sm">
                </div>
                <div>
                    <label class="label text-sm" for="smtp_pass">Contraseña SMTP</label>
                    <input type="password" id="smtp_pass" name="SMTP_PASS" class="input text-sm">
                </div>
                <div class="flex justify-end pt-4 border-t border-surface-100">
                    <button type="submit" class="btn-primary" id="btn-save-email">
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
    } catch (e) {
        showToast('Error al cargar la configuración', 'error');
    }

    // Handlers
    document.getElementById('telegram-config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-telegram');
        btn.disabled = true;
        const token = e.target.elements['TELEGRAM_BOT_TOKEN'].value.trim();
        try {
            await api.post('/config/batch', { "TELEGRAM_BOT_TOKEN": token });
            showToast('Token guardado exitosamente', 'success');
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
        } catch (error) {
            showToast('Error al guardar: ' + error.message, 'error');
        } finally { btn.disabled = false; }
    });

    document.getElementById('btn-activate-webhook').addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        btn.disabled = true;
        try {
            // FIX: Use backend domain instead of frontend origin
            const baseUrl = import.meta.env.VITE_API_URL || 'https://real-state-xd5o.onrender.com';
            await api.post('/telegram/register-webhook', { domain: baseUrl });
            showToast('Webhook activado correctamente', 'success');
        } catch (err) {
            showToast('Error en Webhook: ' + err.message, 'error');
        } finally { btn.disabled = false; }
    });
}
