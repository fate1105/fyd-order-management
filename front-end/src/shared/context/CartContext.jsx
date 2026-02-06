import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "./ToastContext";
import { trackAddToCart } from "@shared/utils/analytics.js";

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const { showToast } = useToast();

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("fyd-cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("fyd-cart", JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    const addToCart = (product, variant = null, quantity = 1, overridePrice = null) => {
        const itemId = variant ? `${product.id}-${variant.id}` : `${product.id}`;

        setCart((prev) => {
            const existing = prev.find((item) => String(item.itemId) === String(itemId));

            // Stock check
            const currentQty = existing ? existing.qty : 0;
            const totalRequested = currentQty + quantity;
            const stock = variant?.stockQuantity ?? product.totalStock ?? 999;

            if (totalRequested > stock) {
                showToast(`Không đủ hàng trong kho. Chỉ còn ${stock} sản phẩm.`, "warning");
                return prev;
            }

            if (existing) {
                return prev.map((item) =>
                    String(item.itemId) === String(itemId) ? { ...item, qty: item.qty + quantity } : item
                );
            }

            // New item
            const primaryImage = product.images?.find((img) => img.isPrimary)?.imageUrl ||
                product.images?.[0]?.imageUrl ||
                product.thumbnail ||
                null;

            const itemPrice = overridePrice || product.salePrice || product.basePrice || 0;

            const newItem = {
                itemId,
                productId: product.id,
                variantId: variant?.id || null,
                name: product.name,
                price: itemPrice,
                image: primaryImage,
                variantInfo: variant ? `${variant.color || ''} - ${variant.size || ''}`.trim() : null,
                size: variant?.size,
                color: variant?.color,
                qty: quantity,
                stock: stock
            };

            // Track Add to Cart
            trackAddToCart(product, quantity);

            return [...prev, newItem];
        });
    };

    const updateCartQty = (itemId, newQty) => {
        if (newQty < 1) {
            removeFromCart(itemId);
            return;
        }

        setCart((prev) =>
            prev.map((item) => {
                if (String(item.itemId) === String(itemId)) {
                    if (item.stock !== undefined && newQty > item.stock) {
                        showToast(`Chỉ còn ${item.stock} sản phẩm trong kho.`, "warning");
                        return item;
                    }
                    return { ...item, qty: newQty };
                }
                return item;
            })
        );
    };

    const removeFromCart = (itemId) => {
        setCart((prev) => prev.filter((item) => String(item.itemId) !== String(itemId)));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((total, item) => total + item.qty, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);

    const value = {
        cart,
        cartCount,
        cartTotal,
        cartOpen,
        setCartOpen,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
