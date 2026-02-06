/**
 * Utility for the "Fly to Cart" animation
 * @param {HTMLElement} sourceEl - The element to start from (e.g. product image)
 * @param {string} targetSelector - CSS selector for the target (e.g. '.cart-btn')
 */
export const flyToCart = (sourceEl, targetSelector = '.cart-btn') => {
    if (!sourceEl) return;

    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) return;

    const sourceRect = sourceEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    // Create a clone of the source element
    const clone = document.createElement('img');
    clone.src = sourceEl.src || (sourceEl.querySelector('img')?.src);
    if (!clone.src) return;

    // Set initial styles
    const size = Math.min(sourceRect.width, sourceRect.height, 120);
    clone.classList.add('flying-product');
    clone.style.width = `${size}px`;
    clone.style.height = `${size}px`;
    clone.style.top = `${sourceRect.top}px`;
    clone.style.left = `${sourceRect.left}px`;
    clone.style.position = 'fixed';
    clone.style.zIndex = '99999';

    document.body.appendChild(clone);

    // Forced reflow
    clone.offsetWidth;

    // Phase 1: Small scale up and stay for a tiny moment
    clone.style.transform = 'scale(1.2)';
    clone.style.boxShadow = '0 0 30px rgba(0,0,0,0.5)';

    // Phase 2: Fly to target
    setTimeout(() => {
        clone.classList.add('animating');
        clone.style.top = `${targetRect.top + 10}px`;
        clone.style.left = `${targetRect.left + 10}px`;
        clone.style.width = '10px';
        clone.style.height = '10px';
        clone.style.transform = 'scale(0.1) rotate(720deg)';
        clone.style.opacity = '0.5';
    }, 100);

    // Cleanup
    setTimeout(() => {
        clone.remove();

        // Optional: Add a small bump to the cart icon
        targetEl.classList.add('cart-bump');
        setTimeout(() => targetEl.classList.remove('cart-bump'), 300);
    }, 900);
};
