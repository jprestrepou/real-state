/**
 * Toast notification system.
 */

export function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Modal component — reusable dialog.
 */
export function showModal(title, contentHTML, { onConfirm, confirmText = 'Guardar', showCancel = true } = {}) {
    const container = document.getElementById('modal-container');

    container.innerHTML = `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-content">
        <div class="flex items-center justify-between p-6 border-b border-surface-100">
          <h3 class="text-lg font-bold text-surface-900">${title}</h3>
          <button id="modal-close" class="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        <div class="p-6" id="modal-body">
          ${contentHTML}
        </div>
        <div class="flex items-center justify-end gap-3 p-6 border-t border-surface-100">
          ${showCancel ? '<button id="modal-cancel" class="btn-secondary">Cancelar</button>' : ''}
          ${onConfirm ? `<button id="modal-confirm" class="btn-primary">${confirmText}</button>` : ''}
        </div>
      </div>
    </div>
  `;

    // Re-init Lucide icons
    if (window.lucide) lucide.createIcons();

    // Events
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-confirm');

    const close = () => { container.innerHTML = ''; };

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    closeBtn?.addEventListener('click', close);
    cancelBtn?.addEventListener('click', close);

    if (confirmBtn && onConfirm) {
        confirmBtn.addEventListener('click', async () => {
            try {
                await onConfirm();
                close();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }

    return { close, getBody: () => document.getElementById('modal-body') };
}

/** Close any open modal. */
export function closeModal() {
    document.getElementById('modal-container').innerHTML = '';
}
