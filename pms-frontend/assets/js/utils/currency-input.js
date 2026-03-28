/**
 * Currency Input Formatter — Adds live thousand separators (dots) to money inputs.
 * 
 * Usage: 
 *   import { initCurrencyInputs } from '../utils/currency-input.js';
 *   initCurrencyInputs(containerElement);
 * 
 * Mark any monetary input with the class "currency-input" or data-currency="true":
 *   <input class="input currency-input" data-currency="true" ...>
 * 
 * On form submission, use parseCurrencyValue(inputElement) to get the raw number.
 */

/**
 * Format a raw number string with dot separators (Colombian style).
 * E.g., "1500000" → "1.500.000"
 */
export function formatWithDots(value) {
    if (!value && value !== 0) return '';
    const str = String(value).replace(/[^\d]/g, '');
    if (!str) return '';
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parse a formatted currency string back to a float.
 * E.g., "1.500.000" → 1500000
 */
export function parseCurrencyValue(inputOrValue) {
    const val = typeof inputOrValue === 'string' 
        ? inputOrValue 
        : (inputOrValue?.value || '');
    return parseFloat(val.replace(/\./g, '').replace(',', '.') || '0');
}

/**
 * Apply currency formatting to an input element (attach event listeners).
 */
function attachCurrencyFormatter(input) {
    if (input.dataset._currencyBound) return; // Avoid double-binding
    input.dataset._currencyBound = 'true';
    
    // Change type to text so dots are visible
    input.type = 'text';
    input.inputMode = 'numeric';
    
    // Format existing value if any
    if (input.value && !isNaN(parseFloat(input.value))) {
        input.value = formatWithDots(Math.round(parseFloat(input.value)));
    }

    input.addEventListener('input', (e) => {
        const cursorPos = e.target.selectionStart;
        const oldLen = e.target.value.length;
        const raw = e.target.value.replace(/[^\d]/g, '');
        const formatted = formatWithDots(raw);
        e.target.value = formatted;
        
        // Adjust cursor position
        const newLen = formatted.length;
        const diff = newLen - oldLen;
        const newPos = Math.max(0, cursorPos + diff);
        e.target.setSelectionRange(newPos, newPos);
    });
    
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text');
        const clean = pasted.replace(/[^\d]/g, '');
        input.value = formatWithDots(clean);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

/**
 * Initialize currency formatting on all inputs with class "currency-input"
 * or data-currency="true" within the given container.
 * Call this after rendering any page/modal with money inputs.
 */
export function initCurrencyInputs(container = document) {
    const inputs = container.querySelectorAll('.currency-input, [data-currency="true"]');
    inputs.forEach(input => attachCurrencyFormatter(input));
}

/**
 * Helper: Get a numeric value from a currency-formatted input for API submission.
 * Handles both formatted ("1.500.000") and raw ("1500000") values.
 */
export function getCurrencyValue(selector) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return 0;
    return parseCurrencyValue(el.value);
}

/**
 * Auto-initialize: observe DOM for dynamically added currency inputs.
 * This uses MutationObserver so even modals get currency formatting.
 */
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) {
                // Check if the added node itself is a currency input
                if (node.matches?.('.currency-input, [data-currency="true"]')) {
                    attachCurrencyFormatter(node);
                }
                // Check children
                const inputs = node.querySelectorAll?.('.currency-input, [data-currency="true"]');
                if (inputs?.length) {
                    inputs.forEach(input => attachCurrencyFormatter(input));
                }
            }
        }
    }
});

// Start observing the document body
if (typeof document !== 'undefined' && document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
}
