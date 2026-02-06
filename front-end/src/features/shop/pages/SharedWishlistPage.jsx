import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BASE_URL, formatVND, fetchCategories } from '@shared/utils/api.js';
import { getCustomer, logout as customerLogout } from "@shared/utils/customerSession.js";
import { useCart } from "@shared/context/CartContext";
import ShopHeader from '../components/ShopHeader.jsx';
import ShopFooter from '../components/ShopFooter.jsx';
import CartDrawer from '../components/CartDrawer.jsx';
import QuickViewModal from '../components/QuickViewModal.jsx';
import '../styles/SharedWishlistPage.css';

export default function SharedWishlistPage() {
    const { shareCode } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [wishlistData, setWishlistData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    // Cart Context
    const {
        cart,
        cartCount,
        cartTotal,
        cartOpen,
        setCartOpen,
        addToCart,
        updateCartQty,
        removeFromCart
    } = useCart();

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                // Load categories and wishlist in parallel
                const [categoriesData, wishlistRes] = await Promise.all([
                    fetchCategories(),
                    fetch(`${BASE_URL}/api/wishlist/share/${shareCode}`)
                ]);

                setCategories(categoriesData);

                if (!wishlistRes.ok) {
                    throw new Error('Wishlist not found');
                }
                const data = await wishlistRes.json();
                setWishlistData(data);

                // Load customer
                setCustomer(getCustomer());
            } catch (err) {
                setError(t('shop.wishlist_not_found', 'This wishlist could not be found or has expired.'));
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (shareCode) {
            loadInitialData();
        }
    }, [shareCode, t]);

    const handleCheckout = () => {
        setCartOpen(false);
        navigate("/shop/checkout");
    };

    if (loading) {
        return (
            <div className="shared-wishlist-page">
                <ShopHeader
                    cartCount={cartCount}
                    onCartClick={() => setCartOpen(true)}
                    categories={categories}
                    customer={customer}
                />
                <main className="shared-wishlist-loading">
                    <div className="loading-spinner"></div>
                    <p>{t('common.loading', 'Loading...')}</p>
                </main>
                <ShopFooter />
            </div>
        );
    }

    if (error) {
        return (
            <div className="shared-wishlist-page">
                <ShopHeader
                    cartCount={cartCount}
                    onCartClick={() => setCartOpen(true)}
                    categories={categories}
                    customer={customer}
                />
                <main className="shared-wishlist-error">
                    <div className="error-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h2>{t('shop.wishlist_expired_title', 'Wishlist Not Found')}</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/shop')} className="back-to-shop-btn">
                        {t('shop.back_to_shop', 'Back to Shop')}
                    </button>
                </main>
                <ShopFooter />
            </div>
        );
    }

    return (
        <div className="shared-wishlist-page">
            <ShopHeader
                cartCount={cartCount}
                onCartClick={() => setCartOpen(true)}
                categories={categories}
                customer={customer}
                onLogoutClick={() => { customerLogout(); setCustomer(null); }}
                onSelectCategory={(id, type) => navigate(`/shop?${type === 'parent' ? 'parentCategory' : 'category'}=${id}`)}
                onShowSale={() => navigate('/shop?sale=true')}
                onShowAll={() => navigate('/shop')}
            />

            <main className="shared-wishlist-content">
                <div className="shared-wishlist-header">
                    <h1>
                        {wishlistData.ownerName
                            ? t('shop.someones_wishlist', "{{name}}'s Wishlist", { name: wishlistData.ownerName })
                            : t('shop.shared_wishlist_title', 'Shared Wishlist')
                        }
                    </h1>
                    <p className="wishlist-meta">
                        {t('shop.wishlist_product_count', '{{count}} products', { count: wishlistData.products?.length || 0 })}
                        {' • '}
                        {t('shop.wishlist_views', '{{count}} views', { count: wishlistData.viewCount || 0 })}
                    </p>
                </div>

                {wishlistData.products && wishlistData.products.length > 0 ? (
                    <>
                        <div className="shared-wishlist-grid">
                            {wishlistData.products.map(product => (
                                <div key={product.id} className="shared-product-card">
                                    <div
                                        className="product-image-link"
                                        onClick={() => navigate(`/shop/product/${product.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <img
                                            src={product.thumbnail || 'https://via.placeholder.com/400x400?text=No+Image'}
                                            alt={product.name}
                                        />
                                    </div>
                                    <div className="product-info">
                                        <h3
                                            className="product-name"
                                            onClick={() => navigate(`/shop/product/${product.id}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {product.name || t('shop.product', 'Sản phẩm')}
                                        </h3>
                                        <p className="product-category">{product.categoryName || ''}</p>
                                        <div className="product-price">
                                            {product.salePrice && product.salePrice < product.basePrice ? (
                                                <>
                                                    <span className="sale-price">{formatVND(product.salePrice)}</span>
                                                    <span className="original-price">{formatVND(product.basePrice || 0)}</span>
                                                </>
                                            ) : (
                                                <span>{formatVND(product.salePrice || product.basePrice || 0)}</span>
                                            )}
                                        </div>
                                        <div className="product-stock">
                                            {product.totalStock > 0 ? (
                                                <span className="in-stock">{t('shop.in_stock', 'In Stock')}</span>
                                            ) : (
                                                <span className="out-of-stock">{t('shop.out_of_stock', 'Out of Stock')}</span>
                                            )}
                                        </div>
                                        <button
                                            className="btn-shop-black btn-shop-full"
                                            onClick={() => setQuickViewProduct(product)}
                                            disabled={product.totalStock <= 0}
                                        >
                                            {t('shop.select_size_add', 'CHỌN SIZE & THÊM')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="shared-wishlist-actions">
                            <button
                                className="btn-shop-black"
                                style={{ padding: '18px 48px' }}
                                onClick={() => {
                                    // Maybe just show a message that they should add individually
                                    // or add a more complex "add all" logic.
                                    // For now, let's keep it but maybe it should also open a multi-selector?
                                    // The user said "all must select size/color", so "add all" is tricky.
                                    // Let's just remove "Add All" for now to strictly follow the requirement.
                                    navigate('/shop');
                                }}
                            >
                                {t('shop.continue_shopping', 'TIẾP TỤC MUA SẮM')}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="empty-wishlist">
                        <p>{t('shop.wishlist_empty', 'This wishlist is empty.')}</p>
                    </div>
                )}
            </main>

            {quickViewProduct && (
                <QuickViewModal
                    product={quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                    onAddToCart={addToCart}
                    onToggleWishlist={() => { }} // No toggle in shared view usually
                    isWishlisted={false}
                />
            )}

            <CartDrawer
                open={cartOpen}
                onClose={() => setCartOpen(false)}
                cart={cart}
                total={cartTotal}
                onUpdateQty={updateCartQty}
                onRemove={removeFromCart}
                onCheckout={handleCheckout}
            />

            <ShopFooter />
        </div>
    );
}
