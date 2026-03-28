import { api } from '../api.js';
import { showToast } from '../components/modal.js';

export async function renderSettings(container, state) {
    if (state.user?.role !== 'Admin') {
        container.innerHTML = `<div class="p-8 text-center text-surface-500">Acceso denegado. Se requieren permisos de Administrador.</div>`;
        return;
    }

    container.innerHTML = `
    <div class="max-w-xl mx-auto animate-fade-in cursor-default">
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

        <!-- Contratos Config -->
        <div class="glass-card-static p-6 border-t-4 border-t-emerald-500 mt-6">
            <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <i data-lucide="percent" class="w-6 h-6"></i>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-surface-900">Finanzas y Contratos</h3>
                    <p class="text-sm text-surface-500">Parámetros globales de indexación automatizada</p>
                </div>
            </div>
            
            <form id="contracts-config-form" class="space-y-4">
                <div>
                    <label class="label text-sm" for="global_inflation_rate">Tasa de Inflación Anual / IPC (%)</label>
                    <input type="number" step="0.0001" id="global_inflation_rate" name="global_inflation_rate" class="input font-mono text-sm" placeholder="Ej: 0.05 para 5%">
                    <p class="text-xs text-surface-400 mt-1">Este valor (ej: 0.05) será utilizado para la indexación y aumento automático del canon en los contratos que cumplen 1 año de vigencia.</p>
                </div>
                <div class="flex justify-end pt-4 border-t border-surface-100">
                    <button type="submit" class="btn-primary" id="btn-save-contracts">
                        <i data-lucide="save" class="w-4 h-4 mr-2"></i> Guardar Ajustes
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
        const contractsForm = document.getElementById('contracts-config-form');
        configs.forEach(conf => {
            if (tgForm.elements[conf.key]) tgForm.elements[conf.key].value = conf.value;
            if (contractsForm.elements[conf.key]) contractsForm.elements[conf.key].value = conf.value;
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

    document.getElementById('btn-activate-webhook').addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        btn.disabled = true;
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'https://real-state-xd5o.onrender.com';
            await api.post('/telegram/register-webhook', { domain: baseUrl });
            showToast('Webhook activado correctamente', 'success');
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            showToast('Error en Webhook: ' + err.message, 'error');
        } finally { btn.disabled = false; }
    });

    document.getElementById('contracts-config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-contracts');
        btn.disabled = true;
        const rate = e.target.elements['global_inflation_rate'].value.trim();
        try {
            await api.post('/config/batch', { "global_inflation_rate": rate });
            showToast('Ajustes de contratos guardados exitosamente', 'success');
        } catch (error) {
            showToast('Error al guardar: ' + error.message, 'error');
        } finally { btn.disabled = false; }
    });
}
