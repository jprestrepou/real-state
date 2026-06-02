/**
 * Toast notification system.
 */

export function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md relative overflow-hidden transition-all duration-300 ease-out shadow-lg animate-[slideIn_0.3s_ease-out]`;

    const icons = {
        success: 'check-circle',
        error: 'alert-triangle',
        warning: 'alert-circle',
        info: 'info',
    };
    
    const iconName = icons[type] || 'info';

    toast.innerHTML = `
      <div class="flex-shrink-0 mt-0.5">
        <i data-lucide="${iconName}" class="w-5 h-5"></i>
      </div>
      <div class="flex-1 text-sm font-semibold pr-4 leading-snug">${message}</div>
      <button class="toast-close-btn opacity-60 hover:opacity-100 transition-opacity">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
      <div class="toast-progress-bar absolute bottom-0 left-0 h-1 w-full transition-all"></div>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    // Close button event
    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeToast();
    });

    const progressBar = toast.querySelector('.toast-progress-bar');
    progressBar.style.width = '100%';
    
    // Animate progress bar width from 100% to 0%
    setTimeout(() => {
        progressBar.style.width = '0%';
        progressBar.style.transition = `width ${duration}ms linear`;
    }, 50);

    const timer = setTimeout(() => {
        removeToast();
    }, duration);

    function removeToast() {
        clearTimeout(timer);
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }
}


/**
 * Modal component — reusable dialog.
 */
export function showModal(title, contentHTML, { onConfirm, confirmText = 'Guardar', showCancel = true, maxWidth = '' } = {}) {
    const container = document.getElementById('modal-container');

    container.innerHTML = `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-content" ${maxWidth ? `style="max-width: ${maxWidth}; width: 100%;"` : ''}>
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
