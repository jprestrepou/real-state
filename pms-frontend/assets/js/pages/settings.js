import { api } from '../api.js';
import { showToast } from '../components/modal.js';

export async function renderSettings(container, state) {
    // Only Admin should access this
    if (state.user?.role !== 'Admin') {
        container.innerHTML = `
            <div class="text-center py-20">
                <i data-lucide="shield-alert" class="w-12 h-12 text-rose-500 mx-auto mb-4"></i>
                <h3 class="text-xl font-bold text-surface-900 mb-2">Acceso Denegado</h3>
                <p class="text-surface-500">Solo los administradores pueden modificar la configuración del sistema.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-8">
            
            <!-- Email Configuration -->
            <div class="glass-card p-6">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <i data-lucide="mail" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-surface-900">Configuración de Correo Electrónico</h3>
                        <p class="text-sm text-surface-500">Credenciales SMTP para el envío de notificaciones y reportes.</p>
                    </div>
                </div>

                <form id="email-config-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="label text-sm" for="smtp_host">Servidor SMTP (Host)</label>
                            <input type="text" id="smtp_host" name="SMTP_HOST" class="input" placeholder="ej. smtp.gmail.com">
                        </div>
                        <div>
                            <label class="label text-sm" for="smtp_port">Puerto SMTP</label>
                            <input type="number" id="smtp_port" name="SMTP_PORT" class="input" placeholder="ej. 587">
                        </div>
                        <div>
                            <label class="label text-sm" for="smtp_user">Usuario (Correo)</label>
                            <input type="email" id="smtp_user" name="SMTP_USER" class="input" placeholder="correo@empresa.com">
                        </div>
                        <div>
                            <label class="label text-sm" for="smtp_pass">Contraseña / App Password</label>
                            <input type="password" id="smtp_pass" name="SMTP_PASS" class="input" placeholder="••••••••">
                        </div>
                    </div>
                    <div class="flex justify-end pt-4">
                        <button type="submit" class="btn-primary" id="btn-save-email">Guardar Correo</button>
                    </div>
                </form>
            </div>

            <!-- Telegram Configuration -->
            <div class="glass-card p-6">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                        <i data-lucide="send" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-surface-900">Bot de Telegram</h3>
                        <p class="text-sm text-surface-500">Token de acceso proporcionado por BotFather para recibir daños.</p>
                    </div>
                </div>

                <form id="telegram-config-form" class="space-y-4">
                    <div>
                        <label class="label text-sm" for="telegram_token">Telegram Bot Token</label>
                        <input type="text" id="telegram_token" name="TELEGRAM_BOT_TOKEN" class="input font-mono text-sm" placeholder="123456789:ABCdefGHIjklmnoPQR_stuVwxyz12345">
                        <p class="text-xs text-surface-400 mt-2">Asegúrate de configurar el Webhook en tu hosting después de agregar este token.</p>
                    </div>
                    <div class="flex justify-end pt-4">
                        <button type="submit" class="btn-primary" id="btn-save-telegram">Guardar Telegram</button>
                    </div>
                </form>
            </div>

        </div>
    `;

    // Load configs
    try {
        const configs = await api.get('/config');
        
        // Map configs to inputs
        configs.forEach(conf => {
            const input = container.querySelector(`[name="${conf.key}"]`);
            if (input) {
                input.value = conf.value;
            }
        });
    } catch (error) {
        showToast('Error cargando la configuración: ' + error.message, 'error');
    }

    // Handle Email Form Submit
    container.querySelector('#email-config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = container.querySelector('#btn-save-email');
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 mr-2 animate-spin"></i> Guardando...';

        const formData = new FormData(e.target);
        const updates = {};
        formData.forEach((value, key) => {
            if (value.trim() !== '') updates[key] = value.trim();
        });

        try {
            await api.post('/config/batch', updates);
            showToast('Configuración de correo guardada exitosamente.', 'success');
        } catch (error) {
            showToast('Error al guardar: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Guardar Correo';
        }
    });

    // Handle Telegram Form Submit
    container.querySelector('#telegram-config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = container.querySelector('#btn-save-telegram');
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 mr-2 animate-spin"></i> Guardando...';

        const token = e.target.elements['TELEGRAM_BOT_TOKEN'].value.trim();
        if (!token) {
            showToast('El token no puede estar vacío', 'warning');
            btn.disabled = false;
            btn.textContent = 'Guardar Telegram';
            return;
        }

        try {
            await api.post('/config/batch', {
                "TELEGRAM_BOT_TOKEN": token
            });
            showToast('Token de Telegram guardado.', 'success');
        } catch (error) {
            showToast('Error al guardar: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Guardar Telegram';
        }
    });
}
