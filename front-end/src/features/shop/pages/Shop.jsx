import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/fyd-shop.css";
import "../styles/shop.css";

// Components
import ShopHeader from "../components/ShopHeader.jsx";
import ShopFooter from "../components/ShopFooter.jsx";
import ProductCard from "../components/ProductCard.jsx";
import CartDrawer from "../components/CartDrawer.jsx";
import WishlistDrawer from "../components/WishlistDrawer.jsx";
import HeroBanner from "../components/HeroBanner.jsx";
import QuickViewModal from "../components/QuickViewModal.jsx";
import LoginModal from "../components/LoginModal.jsx";
import Pagination from "../components/Pagination.jsx";
import SortDropdown from "../components/SortDropdown.jsx";
import FilterSidebar from "../components/FilterSidebar.jsx";
import FeaturedProducts from "../components/FeaturedProducts.jsx";
import AiChatBubble from "../components/AiChatBubble.jsx";

// Utils
import { fetchProducts, fetchCategories, fetchColors, fetchSizes } from "@shared/utils/api.js";
import { getCustomer, logout as customerLogout } from "@shared/utils/customerSession.js";

const PRODUCTS_PER_PAGE = 12;

export default function Shop() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlightProductId, setHighlightProductId] = useState(null);

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [activeZones, setActiveZones] = useState([]); // Added for Featured Zones
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [showSaleOnly, setShowSaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(true);

  // UI states
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Customer state
  const [customer, setCustomer] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData, colorsData, sizesData, zonesData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchColors(),
          fetchSizes(),
          import("@shared/utils/api.js").then(m => m.featuredAPI.getActiveZones()) // Fetch zones
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setColors(colorsData);
        setSizes(sizesData);
        setActiveZones(zonesData || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Load customer session
  useEffect(() => {
    const savedCustomer = getCustomer();
    if (savedCustomer) {
      setCustomer(savedCustomer);
    }
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

  // Load wishlist from localStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem("fyd-wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Failed to parse wishlist:", e);
      }
    }
  }, []);

  // Save wishlist to localStorage
  useEffect(() => {
    localStorage.setItem("fyd-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Exclusion Logic: Remove products that are already in ANY active featured zone
    const featuredProductIds = new Set();
    activeZones.forEach(zone => {
      zone.products?.forEach(item => {
        if (item.productId) featuredProductIds.add(item.productId);
      });
    });

    result = result.filter(p => !featuredProductIds.has(p.id));

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((p) => p.categoryId === selectedCategory);
    } else if (selectedParentCategory) {
      const parentCat = categories.find((c) => c.id === selectedParentCategory);
      if (parentCat) {
        const childIds = parentCat.children?.map((c) => c.id) || [];
        result = result.filter(
          (p) => p.categoryId === selectedParentCategory || childIds.includes(p.categoryId)
        );
      }
    }

    // Color filter
    if (selectedColors.length > 0) {
      result = result.filter((p) => {
        if (!p.variants) return false;
        return p.variants.some((v) => selectedColors.includes(v.colorId));
      });
    }

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) => {
        if (!p.variants) return false;
        return p.variants.some((v) => selectedSizes.includes(v.sizeId));
      });
    }

    // Price filter
    if (priceRange[0] > 0 || priceRange[1] < 5000000) {
      result = result.filter((p) => {
        const price = p.salePrice || p.basePrice;
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    // Sale filter
    if (showSaleOnly) {
      result = result.filter((p) => p.salePrice && p.salePrice < p.basePrice);
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice));
        break;
      case "price-desc":
        result.sort((a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice));
        break;
      case "name-asc":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "bestseller":
        result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        break;
      case "newest":
      default:
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }

    return result;
  }, [products, search, selectedCategory, selectedParentCategory, selectedColors, selectedSizes, priceRange, showSaleOnly, sortBy, categories]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Reset page when filters change
  // Handle URL filters from navigation (e.g., from Product Detail)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const parentCategoryParam = searchParams.get('parentCategory');
    const saleParam = searchParams.get('sale');
    const searchParam = searchParams.get('search');

    if (categoryParam) {
      setSelectedCategory(parseInt(categoryParam, 10));
      setSelectedParentCategory(null);
      setShowSaleOnly(false);
    } else if (parentCategoryParam) {
      setSelectedParentCategory(parseInt(parentCategoryParam, 10));
      setSelectedCategory(null);
      setShowSaleOnly(false);
    } else if (saleParam === 'true') {
      setShowSaleOnly(true);
      setSelectedCategory(null);
      setSelectedParentCategory(null);
    }

    if (searchParam) {
      setSearch(decodeURIComponent(searchParam));
    }
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedParentCategory, selectedColors, selectedSizes, priceRange, showSaleOnly, sortBy]);

  // Handle highlight URL param from AI chat
  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    if (highlightId && products.length > 0) {
      const productId = parseInt(highlightId, 10);

      // Find product index in filtered products (with no filters to see all)
      const productIndex = products.findIndex(p => p.id === productId);

      if (productIndex !== -1) {
        // Calculate which page the product is on
        const targetPage = Math.floor(productIndex / PRODUCTS_PER_PAGE) + 1;
        setCurrentPage(targetPage);
        setHighlightProductId(productId);

        // Clear URL param
        setSearchParams({});

        // Scroll and highlight after render
        setTimeout(() => {
          const productElement = document.querySelector(`[data-product-id="${productId}"]`);
          if (productElement) {
            productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            productElement.classList.add('ai-highlight');
            setTimeout(() => {
              productElement.classList.remove('ai-highlight');
              setHighlightProductId(null);
            }, 3000);
          }
        }, 300);
      }
    }
  }, [searchParams, products, setSearchParams]);

  // Filter handlers
  const handleColorToggle = useCallback((colorId) => {
    setSelectedColors((prev) =>
      prev.includes(colorId) ? prev.filter((id) => id !== colorId) : [...prev, colorId]
    );
  }, []);

  const handleSizeToggle = useCallback((sizeId) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeId) ? prev.filter((id) => id !== sizeId) : [...prev, sizeId]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory(null);
    setSelectedParentCategory(null);
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange([0, 5000000]);
    setShowSaleOnly(false);
    setSearch("");
  }, []);

  // Cart functions
  const addToCart = useCallback((product, variant = null, quantity = 1) => {
    setCart((prev) => {
      const itemId = variant ? `${product.id}-${variant.id}` : `${product.id}`;
      const existing = prev.find((item) => item.itemId === itemId);

      // Stock check
      const currentQty = existing ? existing.qty : 0;
      const totalRequested = currentQty + quantity;

      if (variant && variant.stockQuantity !== undefined) {
        if (totalRequested > variant.stockQuantity) {
          alert(`Không thể thêm vào giỏ. Chỉ còn ${variant.stockQuantity} sản phẩm trong kho.`);
          return prev;
        }
      } else if (product.variants && product.variants.length > 0 && variant) {
        // Find variant in product.variants if variant passed doesn't have stockQuantity
        const v = product.variants.find(v => v.id === variant.id);
        if (v && v.stockQuantity !== undefined && totalRequested > v.stockQuantity) {
          alert(`Không thể thêm vào giỏ. Chỉ còn ${v.stockQuantity} sản phẩm trong kho.`);
          return prev;
        }
      }

      if (existing) {
        return prev.map((item) =>
          item.itemId === itemId ? { ...item, qty: item.qty + quantity } : item
        );
      }

      const price = product.salePrice || product.basePrice;
      const primaryImage = product.images?.find((img) => img.isPrimary)?.imageUrl ||
        product.images?.[0]?.imageUrl;

      return [...prev, {
        itemId,
        productId: product.id,
        variantId: variant?.id || null,
        name: product.name,
        price,
        image: primaryImage,
        variantInfo: variant ? `${variant.color || ''} - ${variant.size || ''}`.trim() : null,
        qty: quantity,
        stock: variant?.stockQuantity // Store stock quantity for easier limit checks in CartDrawer
      }];
    });
  }, []);

  const updateCartQty = useCallback((itemId, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.itemId !== itemId));
    } else {
      setCart((prev) =>
        prev.map((item) => {
          if (item.itemId === itemId) {
            // Check stock limit if stored
            if (item.stock !== undefined && qty > item.stock) {
              alert(`Không thể tăng thêm. Chỉ còn ${item.stock} sản phẩm trong kho.`);
              return item;
            }
            return { ...item, qty };
          }
          return item;
        })
      );
    }
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCart((prev) => prev.filter((item) => item.itemId !== itemId));
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  // Wishlist functions
  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  }, []);

  const wishlistProducts = useMemo(() => {
    return products.filter((p) => wishlist.includes(p.id));
  }, [products, wishlist]);

  // Category selection
  const handleSelectCategory = useCallback((categoryId, type) => {
    if (type === 'parent') {
      setSelectedParentCategory(categoryId);
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
      setSelectedParentCategory(null);
    }
    setShowSaleOnly(false);
  }, []);

  const handleShowAll = useCallback(() => {
    setSelectedCategory(null);
    setSelectedParentCategory(null);
    setShowSaleOnly(false);
    setSearch("");
  }, []);

  const handleShowSale = useCallback(() => {
    setSelectedCategory(null);
    setSelectedParentCategory(null);
    setShowSaleOnly(true);
  }, []);

  // Customer functions
  const handleLogout = useCallback(() => {
    customerLogout();
    setCustomer(null);
  }, []);

  const handleLoginSuccess = useCallback((customerData) => {
    setCustomer(customerData);
    setLoginModalOpen(false);
  }, []);

  // Checkout
  const handleCheckout = useCallback(() => {
    if (!customer) {
      setCartOpen(false);
      setLoginModalOpen(true);
      return;
    }
    setCartOpen(false);
    navigate("/shop/checkout");
  }, [customer, navigate]);

  // Get current filter title
  const getFilterTitle = () => {
    if (showSaleOnly) return "SALE";
    if (selectedCategory) {
      const cat = categories.flatMap(c => [c, ...(c.children || [])]).find(c => c.id === selectedCategory);
      return cat?.name?.toUpperCase() || "SẢN PHẨM";
    }
    if (selectedParentCategory) {
      const cat = categories.find(c => c.id === selectedParentCategory);
      return cat?.name?.toUpperCase() || "SẢN PHẨM";
    }
    return "TẤT CẢ SẢN PHẨM";
  };

  return (
    <div className="shop-page">
      {/* Header */}
      <ShopHeader
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        searchValue={search}
        onSearchChange={setSearch}
        categories={categories}
        onSelectCategory={handleSelectCategory}
        onShowSale={handleShowSale}
        onShowAll={handleShowAll}
        customer={customer}
        onLoginClick={() => setLoginModalOpen(true)}
        onLogoutClick={handleLogout}
        wishlistCount={wishlist.length}
        onWishlistClick={() => setWishlistOpen(true)}
      />

      {/* Hero Banner with Dynamic Slides - Only render if active zones exist for hero */}
      {activeZones.some(z => z.position === 'home_hero') && (
        <HeroBanner
          products={activeZones.find(z => z.position === 'home_hero')?.products || []}
          onExploreClick={handleShowAll}
          onProductClick={(productInfo) => {
            // Find the full product object from the master list to ensure modal has variants/images
            const fullProduct = products.find(p => p.id === (productInfo.productId || productInfo.id));
            setQuickViewProduct(fullProduct || productInfo);
          }}
        />
      )}

      {/* Home View Only Zones */}
      {!selectedCategory && !selectedParentCategory && !search && (
        <>
          <FeaturedProducts
            position="home_featured"
            onProductClick={setQuickViewProduct}
            wishlist={wishlistProducts}
            onToggleWishlist={(product) => toggleWishlist(product.id)}
          />
        </>
      )}

      {/* Category View Top Zones */}
      {(selectedCategory || selectedParentCategory) && (
        <FeaturedProducts
          position="category_top"
          onProductClick={setQuickViewProduct}
          wishlist={wishlistProducts}
          onToggleWishlist={(product) => toggleWishlist(product.id)}
        />
      )}

      {/* Products Section */}
      <section className="products-section" id="products-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">{getFilterTitle()}</h2>
            <span className="products-count">{filteredProducts.length} sản phẩm</span>
          </div>
          <div className="filter-sort-bar">
            <button
              className={`filter-toggle-btn ${filterSidebarOpen ? 'active' : ''}`}
              onClick={() => setFilterSidebarOpen(!filterSidebarOpen)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              BỘ LỌC
            </button>
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {/* Products Layout with Sidebar */}
        <div className={`products-layout ${filterSidebarOpen ? 'with-sidebar' : ''}`}>
          {/* Filter Sidebar */}
          {filterSidebarOpen && (
            <FilterSidebar
              categories={categories}
              colors={colors}
              sizes={sizes}
              selectedCategory={selectedCategory}
              selectedParentCategory={selectedParentCategory}
              selectedColors={selectedColors}
              selectedSizes={selectedSizes}
              priceRange={priceRange}
              onCategoryChange={handleSelectCategory}
              onColorToggle={handleColorToggle}
              onSizeToggle={handleSizeToggle}
              onPriceChange={setPriceRange}
              onClearFilters={handleClearFilters}
              showSaleOnly={showSaleOnly}
            />
          )}

          {/* Products Area */}
          <div className="products-area">
            {/* Loading State */}
            {loading && (
              <div className="loading-spinner">
                <div className="spinner" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="empty-state">
                <div className="empty-state-icon">⚠️</div>
                <p className="empty-state-text">{error}</p>
              </div>
            )}

            {/* Product Grid */}
            {!loading && !error && (
              <>
                {paginatedProducts.length > 0 ? (
                  <div className="product-grid">
                    {paginatedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={setQuickViewProduct}
                        onAddToCart={addToCart}
                        onToggleWishlist={toggleWishlist}
                        isWishlisted={wishlist.includes(product.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <p className="empty-state-text">Không tìm thấy sản phẩm nào</p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Category View Bottom Zones */}
      {(selectedCategory || selectedParentCategory) && (
        <FeaturedProducts
          position="category_bottom"
          onProductClick={setQuickViewProduct}
          wishlist={wishlistProducts}
          onToggleWishlist={(product) => toggleWishlist(product.id)}
        />
      )}

      {/* Home View Bottom Zones */}
      {!selectedCategory && !selectedParentCategory && !search && (
        <FeaturedProducts
          position="home_bottom"
          onProductClick={setQuickViewProduct}
          wishlist={wishlistProducts}
          onToggleWishlist={(product) => toggleWishlist(product.id)}
        />
      )}

      {/* Footer */}
      <ShopFooter />

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        cart={cart}
        total={cartTotal}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateCartQty}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        open={wishlistOpen}
        products={wishlistProducts}
        onClose={() => setWishlistOpen(false)}
        onRemove={toggleWishlist}
        onAddToCart={addToCart}
      />

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={addToCart}
          onToggleWishlist={toggleWishlist}
          isWishlisted={wishlist.includes(quickViewProduct.id)}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* AI Chat Bubble */}
      <AiChatBubble />
    </div>
  );
}
