import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import "../styles/fyd-shop.css";
import "../styles/product-detail.css";

// Components
import ShopHeader from "../components/ShopHeader.jsx";
import ShopFooter from "../components/ShopFooter.jsx";
import AiChatBubble from "../components/AiChatBubble.jsx";
import LoginModal from "../components/LoginModal.jsx";
import CartDrawer from "../components/CartDrawer.jsx";

// Utils
import { productAPI, formatVND, fetchProducts, fetchCategories } from "@shared/utils/api.js";
import { getCustomerSession, logout as customerLogout } from "@shared/utils/customerSession.js";

export default function ProductDetail() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Product state
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);


    // Selection state
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    // UI state
    const [activeTab, setActiveTab] = useState("description");
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Cart & Customer state
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [customer, setCustomer] = useState(null);
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    // Related products
    const [relatedProducts, setRelatedProducts] = useState([]);

    // Load product data and categories
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const [productData, categoriesData] = await Promise.all([
                    productAPI.getById(productId),
                    fetchCategories()
                ]);
                setProduct(productData);
                setCategories(categoriesData);

                // Set initial selections
                if (productData.variants && productData.variants.length > 0) {
                    const firstVariant = productData.variants[0];
                    setSelectedVariant(firstVariant);
                    setSelectedSize(firstVariant.sizeId);
                    setSelectedColor(firstVariant.colorId);
                }

                // Load related products
                if (productData.categoryId) {
                    const allProducts = await fetchProducts();
                    const related = allProducts
                        .filter(p => p.categoryId === productData.categoryId && p.id !== productData.id)
                        .slice(0, 6);
                    setRelatedProducts(related);
                }

                setError(null);
            } catch (err) {
                console.error("Failed to load data:", err);
                setError("Không thể tải thông tin sản phẩm");
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
        window.scrollTo(0, 0);
    }, [productId]);

    // Load customer session
    useEffect(() => {
        const session = getCustomerSession();
        if (session?.customer) setCustomer(session.customer);
    }, []);

    // Load cart from localStorage
    const [cartLoaded, setCartLoaded] = useState(false);
    useEffect(() => {
        const savedCart = localStorage.getItem("fyd-cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart:", e);
            }
        }
        setCartLoaded(true);
    }, []);

    // Save cart to localStorage (only after initial load)
    useEffect(() => {
        if (cartLoaded) {
            localStorage.setItem("fyd-cart", JSON.stringify(cart));
        }
    }, [cart, cartLoaded]);

    // Check wishlist
    useEffect(() => {
        const savedWishlist = localStorage.getItem("fyd-wishlist");
        if (savedWishlist) {
            try {
                const wishlist = JSON.parse(savedWishlist);
                setIsWishlisted(wishlist.includes(parseInt(productId)));
            } catch (e) {
                console.error("Failed to parse wishlist:", e);
            }
        }
    }, [productId]);

    // Get unique sizes and colors from variants (filter out null/undefined)
    const uniqueSizes = product?.variants
        ? [...new Map(product.variants.filter(v => v.sizeId != null && v.size).map(v => [v.sizeId, { id: v.sizeId, name: v.size }])).values()]
        : [];

    const uniqueColors = product?.variants
        ? [...new Map(product.variants.filter(v => v.colorId != null && v.color).map(v => [v.colorId, { id: v.colorId, name: v.color, hex: v.colorHex }])).values()]
        : [];

    // Find variant based on size and color selection
    const findVariant = useCallback((sizeId, colorId) => {
        if (!product?.variants) return null;
        return product.variants.find(v => v.sizeId === sizeId && v.colorId === colorId);
    }, [product]);

    // Handle size selection
    const handleSizeSelect = (sizeId) => {
        setSelectedSize(sizeId);
        const variant = findVariant(sizeId, selectedColor);
        if (variant) {
            setSelectedVariant(variant);
        }
    };

    // Handle color selection
    const handleColorSelect = (colorId) => {
        setSelectedColor(colorId);
        const variant = findVariant(selectedSize, colorId);
        if (variant) {
            setSelectedVariant(variant);
        }
    };

    // Handle image zoom
    const handleMouseMove = (e) => {
        if (!isZoomed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x, y });
    };

    // Add to cart
    const handleAddToCart = () => {
        if (!selectedVariant) {
            alert("Vui lòng chọn size và màu sắc");
            return;
        }

        const itemId = `${product.id}-${selectedVariant.id}`;
        const existingItem = cart.find(item => item.itemId === itemId);
        const currentQty = existingItem ? existingItem.qty : 0;
        const totalRequested = currentQty + quantity;

        if (selectedVariant.stockQuantity <= 0) {
            alert("Sản phẩm đã hết hàng");
            return;
        }

        if (totalRequested > selectedVariant.stockQuantity) {
            alert(`Không thể thêm vào giỏ. Chỉ còn ${selectedVariant.stockQuantity} sản phẩm trong kho.`);
            return;
        }

        const primaryImage = product.images?.find(img => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;

        setCart(prev => {
            const existing = prev.find(item => item.itemId === itemId);
            if (existing) {
                return prev.map(item =>
                    item.itemId === itemId ? { ...item, qty: item.qty + quantity } : item
                );
            }
            return [...prev, {
                itemId,
                productId: product.id,
                variantId: selectedVariant.id,
                name: product.name,
                price: product.salePrice || product.basePrice,
                image: primaryImage,
                size: selectedVariant.size,
                color: selectedVariant.color,
                variantInfo: [selectedVariant.size, selectedVariant.color].filter(Boolean).join(' / ') || null,
                qty: quantity,
                stock: selectedVariant.stockQuantity
            }];
        });

        setCartOpen(true);
    };

    // Toggle wishlist
    const handleToggleWishlist = () => {
        const savedWishlist = localStorage.getItem("fyd-wishlist");
        let wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];

        if (isWishlisted) {
            wishlist = wishlist.filter(id => id !== parseInt(productId));
        } else {
            wishlist.push(parseInt(productId));
        }

        localStorage.setItem("fyd-wishlist", JSON.stringify(wishlist));
        setIsWishlisted(!isWishlisted);
    };

    // Handle logout
    const handleLogout = useCallback(() => {
        customerLogout();
        setCustomer(null);
    }, []);

    // Header handlers - Navigate back to Shop with filters
    const handleSelectCategory = useCallback((categoryId, type) => {
        if (type === 'parent') {
            navigate(`/shop?parentCategory=${categoryId}`);
        } else {
            navigate(`/shop?category=${categoryId}`);
        }
    }, [navigate]);

    const handleShowAll = useCallback(() => {
        navigate('/shop');
    }, [navigate]);

    const handleShowSale = useCallback(() => {
        navigate('/shop?sale=true');
    }, [navigate]);

    const handleSearch = useCallback((value) => {
        navigate(`/shop?search=${encodeURIComponent(value)}`);
    }, [navigate]);

    if (loading) {
        return (
            <div className="shop-page">
                <ShopHeader
                    cartCount={cart.reduce((sum, item) => sum + item.qty, 0)}
                    onCartClick={() => setCartOpen(true)}
                    onLoginClick={() => setLoginModalOpen(true)}
                    customer={customer}
                    onLogout={handleLogout}
                />
                <div className="product-detail-loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="shop-page">
                <ShopHeader
                    cartCount={cart.reduce((sum, item) => sum + item.qty, 0)}
                    onCartClick={() => setCartOpen(true)}
                    onLoginClick={() => setLoginModalOpen(true)}
                    customer={customer}
                    onLogout={handleLogout}
                />
                <div className="product-detail-error">
                    <h2>Không tìm thấy sản phẩm</h2>
                    <p>{error || "Sản phẩm không tồn tại hoặc đã bị xóa."}</p>
                    <button onClick={() => navigate('/shop')} className="back-to-shop-btn">
                        Quay lại cửa hàng
                    </button>
                </div>
            </div>
        );
    }

    const currentImage = product.images?.[selectedImageIndex]?.imageUrl ||
        product.images?.[0]?.imageUrl ||
        'https://via.placeholder.com/600x600?text=No+Image';

    const price = product.salePrice || product.basePrice;
    const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
    const discountPercent = hasDiscount ? Math.round((1 - product.salePrice / product.basePrice) * 100) : 0;

    return (
        <div className="shop-page">
            <ShopHeader
                cartCount={cart.reduce((sum, item) => sum + item.qty, 0)}
                onCartClick={() => setCartOpen(true)}
                onLoginClick={() => setLoginModalOpen(true)}
                customer={customer}
                onLogoutClick={handleLogout}
                categories={categories}
                onSelectCategory={handleSelectCategory}
                onShowAll={handleShowAll}
                onShowSale={handleShowSale}
                onSearchChange={handleSearch}
                wishlistCount={0} // Can be connected if needed
                onWishlistClick={() => navigate('/shop')} // Temporary fallback
            />

            <main className="product-detail-main">
                {/* Breadcrumbs */}
                <nav className="product-breadcrumbs">
                    <Link to="/shop">Trang chủ</Link>
                    <span>/</span>
                    <Link to="/shop">Sản phẩm</Link>
                    <span>/</span>
                    <span className="current">{product.name}</span>
                </nav>

                {/* Hero Section - Two Column Layout */}
                <div className="product-detail-hero">
                    {/* Left Column - Image Gallery */}
                    <div className="product-gallery">
                        {/* Thumbnails */}
                        <div className="gallery-thumbnails">
                            {product.images?.map((img, index) => (
                                <button
                                    key={img.id || index}
                                    className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImageIndex(index)}
                                >
                                    <img src={img.imageUrl} alt={`${product.name} - ${index + 1}`} />
                                </button>
                            ))}
                        </div>

                        {/* Main Image */}
                        <div
                            className={`gallery-main ${isZoomed ? 'zoomed' : ''}`}
                            onMouseEnter={() => setIsZoomed(true)}
                            onMouseLeave={() => setIsZoomed(false)}
                            onMouseMove={handleMouseMove}
                        >
                            <img
                                src={currentImage}
                                alt={product.name}
                                style={isZoomed ? {
                                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                                } : {}}
                            />
                            {hasDiscount && (
                                <span className="product-badge sale">-{discountPercent}%</span>
                            )}
                            {product.isNew && !hasDiscount && (
                                <span className="product-badge new">MỚI</span>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Product Info */}
                    <div className="product-info-panel">
                        <div className="product-info-sticky">
                            {/* Title & SKU */}
                            <h1 className="product-title">{product.name}</h1>
                            <p className="product-sku">Mã sản phẩm: {product.sku}</p>

                            {/* Price */}
                            <div className="product-price-section">
                                {hasDiscount ? (
                                    <>
                                        <span className="current-price sale">{formatVND(price)}</span>
                                        <span className="original-price">{formatVND(product.basePrice)}</span>
                                        <span className="discount-badge">-{discountPercent}%</span>
                                    </>
                                ) : (
                                    <span className="current-price">{formatVND(price)}</span>
                                )}
                            </div>

                            {/* Color Selector */}
                            {uniqueColors.length > 0 && (
                                <div className="color-selector">
                                    <label>Màu sắc: <span className="selected-value">{uniqueColors.find(c => c.id === selectedColor)?.name}</span></label>
                                    <div className="color-options">
                                        {uniqueColors.map(color => (
                                            <button
                                                key={color.id}
                                                className={`color-option ${selectedColor === color.id ? 'active' : ''}`}
                                                style={{ backgroundColor: color.hex || '#ccc' }}
                                                onClick={() => handleColorSelect(color.id)}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size Selector */}
                            {uniqueSizes.length > 0 && (
                                <div className="size-selector">
                                    <div className="size-header">
                                        <label>Kích cỡ: <span className="selected-value">{uniqueSizes.find(s => s.id === selectedSize)?.name}</span></label>
                                        <button className="size-guide-link">Hướng dẫn chọn kích cỡ</button>
                                    </div>
                                    <div className="size-options">
                                        {uniqueSizes.map(size => {
                                            const variant = findVariant(size.id, selectedColor);
                                            const isOutOfStock = !variant || variant.stockQuantity <= 0;
                                            return (
                                                <button
                                                    key={size.id}
                                                    className={`size-option ${selectedSize === size.id ? 'active' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                                                    onClick={() => !isOutOfStock && handleSizeSelect(size.id)}
                                                    disabled={isOutOfStock}
                                                >
                                                    {size.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Stock Status */}
                            {selectedVariant && (
                                <div className={`stock-status ${selectedVariant.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                    {selectedVariant.stockQuantity > 0 ? (
                                        <>
                                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                            </svg>
                                            Còn hàng ({selectedVariant.stockQuantity} sản phẩm)
                                        </>
                                    ) : (
                                        <>
                                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                            </svg>
                                            Hết hàng
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="quantity-selector">
                                <label>Số lượng:</label>
                                <div className="quantity-controls">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        min="1"
                                    />
                                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="product-actions">
                                <button
                                    className="add-to-cart-btn"
                                    onClick={handleAddToCart}
                                    disabled={!selectedVariant || selectedVariant.stockQuantity <= 0}
                                >
                                    THÊM VÀO GIỎ
                                </button>
                                <button
                                    className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                                    onClick={handleToggleWishlist}
                                >
                                    <svg viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Shipping Info */}
                            <div className="shipping-info">
                                <div className="info-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 18H3a2 2 0 01-2-2V8a2 2 0 012-2h3.19M15 6h4a2 2 0 012 2v8a2 2 0 01-2 2h-2M9 18h6" />
                                        <circle cx="7" cy="18" r="2" />
                                        <circle cx="17" cy="18" r="2" />
                                        <path d="M8.25 6H19l-2 8H10.25l-2-8z" />
                                    </svg>
                                    <span>Miễn phí vận chuyển cho đơn từ 500.000₫</span>
                                </div>
                                <div className="info-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    <span>Đổi trả miễn phí trong 30 ngày</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <div className="product-details-section">
                    <div className="tabs-header">
                        <button
                            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            MÔ TẢ SẢN PHẨM
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                            onClick={() => setActiveTab('specs')}
                        >
                            CHI TIẾT
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
                            onClick={() => setActiveTab('shipping')}
                        >
                            VẬN CHUYỂN & ĐỔI TRẢ
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'description' && (
                            <div className="description-content">
                                <p>{product.shortDescription}</p>
                                <div className="full-description" dangerouslySetInnerHTML={{ __html: product.fullDescription }} />
                            </div>
                        )}

                        {activeTab === 'specs' && (
                            <div className="specs-content">
                                <ul>
                                    <li><strong>Mã sản phẩm:</strong> {product.sku}</li>
                                    <li><strong>Danh mục:</strong> {product.category}</li>
                                    {product.variants && (
                                        <>
                                            <li><strong>Màu sắc có sẵn:</strong> {uniqueColors.map(c => c.name).join(', ')}</li>
                                            <li><strong>Kích cỡ có sẵn:</strong> {uniqueSizes.map(s => s.name).join(', ')}</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        )}

                        {activeTab === 'shipping' && (
                            <div className="shipping-content">
                                <h4>Chính sách vận chuyển</h4>
                                <ul>
                                    <li>Miễn phí vận chuyển cho đơn hàng từ 500.000₫</li>
                                    <li>Giao hàng nhanh 2-3 ngày với nội thành</li>
                                    <li>Giao hàng 5-7 ngày với các tỉnh thành khác</li>
                                </ul>

                                <h4>Chính sách đổi trả</h4>
                                <ul>
                                    <li>Đổi trả miễn phí trong vòng 30 ngày</li>
                                    <li>Sản phẩm phải còn nguyên tem, nhãn mác</li>
                                    <li>Hoàn tiền trong 7 ngày làm việc</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="related-products-section">
                        <h2>SẢN PHẨM LIÊN QUAN</h2>
                        <div className="related-products-grid">
                            {relatedProducts.map(p => {
                                const img = p.images?.find(i => i.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl;
                                return (
                                    <div
                                        key={p.id}
                                        className="related-product-card"
                                        onClick={() => navigate(`/shop/product/${p.id}`)}
                                    >
                                        <div className="related-product-image">
                                            <img src={img} alt={p.name} />
                                        </div>
                                        <h4>{p.name}</h4>
                                        <p className="related-price">{formatVND(p.salePrice || p.basePrice)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            <ShopFooter />

            {/* Modals & Drawers */}
            <CartDrawer
                open={cartOpen}
                onClose={() => setCartOpen(false)}
                cart={cart}
                total={cart.reduce((sum, item) => sum + item.price * item.qty, 0)}
                onUpdateQty={(itemId, qty) => {
                    if (qty <= 0) {
                        setCart(prev => prev.filter(item => item.itemId !== itemId));
                    } else {
                        setCart(prev => prev.map(item => {
                            if (item.itemId === itemId) {
                                if (item.stock !== undefined && qty > item.stock) {
                                    alert(`Không thể tăng thêm. Chỉ còn ${item.stock} sản phẩm trong kho.`);
                                    return item;
                                }
                                return { ...item, qty };
                            }
                            return item;
                        }));
                    }
                }}
                onRemove={(itemId) => {
                    setCart(prev => prev.filter(item => item.itemId !== itemId));
                }}
                onCheckout={() => {
                    setCartOpen(false);
                    navigate('/shop/checkout');
                }}
            />

            <LoginModal
                isOpen={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
                onLoginSuccess={(customerData) => {
                    setCustomer(customerData);
                    setLoginModalOpen(false);
                }}
            />

            <AiChatBubble />
        </div>
    );
}
