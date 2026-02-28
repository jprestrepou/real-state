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
