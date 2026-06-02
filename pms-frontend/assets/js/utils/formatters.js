/**
 * Formatters — currency, date, and percentage helpers.
 */

/** Format as Colombian Pesos. */
export function formatCurrency(amount, currency = 'COP') {
    if (amount == null) return '—';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/** Format as short currency (e.g., $1.2M). */
export function formatCurrencyShort(amount) {
    if (amount == null) return '—';
    if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return formatCurrency(amount);
}

/** Format date for display. */
export function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-CO', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

/** Format date relative to now (e.g., "hace 2 días"). */
export function formatRelativeDate(dateStr) {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 30) return `Hace ${days} días`;
    if (days < 365) return `Hace ${Math.floor(days / 30)} meses`;
    return `Hace ${Math.floor(days / 365)} años`;
}

/** Format percentage. */
export function formatPercent(value) {
    if (value == null) return '—';
    return `${Number(value).toFixed(1)}%`;
}

/** Get badge class for property status. */
export function statusBadge(status) {
    const map = {
        'Disponible': 'badge-green',
        'Arrendada': 'badge-blue',
        'En Mantenimiento': 'badge-amber',
        'Vendida': 'badge-gray',
        'Pendiente': 'badge-amber',
        'En Progreso': 'badge-blue',
        'Completado': 'badge-green',
        'Cancelado': 'badge-red',
        'Esperando Cotizacion': 'badge-amber',
        'Esperando Aprobacion': 'badge-indigo',
        'Esperando Factura': 'badge-amber',
        'Activo': 'badge-green',
        'Borrador': 'badge-gray',
        'Finalizado': 'badge-gray',
        'Pagado': 'badge-green',
        'Vencido': 'badge-red',
    };
    return map[status] || 'badge-gray';
}

/** Get semaphore class. */
export function semaphoreClass(semaphore) {
    const map = {
        'Verde': 'semaphore-green',
        'Amarillo': 'semaphore-amber',
        'Rojo': 'semaphore-red',
    };
    return map[semaphore] || 'semaphore-green';
}

/** Animate count up for a number inside an element. */
export function animateCountUp(element, targetValue, duration = 1000, formatter = null) {
    if (!element) return;
    const start = 0;
    const end = parseFloat(targetValue) || 0;
    if (start === end) {
        element.textContent = formatter ? formatter(end) : end.toLocaleString();
        return;
    }
    const range = end - start;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quad
        const easeProgress = progress * (2 - progress);
        const current = start + range * easeProgress;
        
        element.textContent = formatter ? formatter(current) : Math.floor(current).toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = formatter ? formatter(end) : end.toLocaleString();
        }
    }
    requestAnimationFrame(update);
}


