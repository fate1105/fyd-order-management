import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../css/shop.css";
import { productsSeed, formatVND } from "../js/mock.js";

const CATEGORIES = ["Tất cả", "Hoodie", "T-shirt", "Accessories"];

function StockTag({ stock }) {
  if (stock <= 0) return <span className="stockTag out">Hết hàng</span>;
  if (stock <= 6) return <span className="stockTag low">Còn {stock}</span>;
  return <span className="stockTag">Còn hàng</span>;
}

function CartDrawer({ open, cart, onClose, onUpdateQty, onRemove, onCheckout }) {
  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  if (!open) return null;

  return (
    <>
      <div className="cartBackdrop" onClick={onClose} />
      <aside className="cartDrawer">
        <div className="cartHead">
          <div className="cartTitle">Giỏ hàng ({cart.length})</div>
          <button className="iconBtn" type="button" onClick={onClose}>✕</button>
        </div>

        <div className="cartList">
          {cart.length === 0 ? (
            <div className="cartEmpty">
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
              <div>Giỏ hàng trống</div>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cartItem" key={item.id}>
                <div className="cartItemImg" />
                <div className="cartItemInfo">
                  <div className="cartItemName">{item.name}</div>
                  <div className="cartItemPrice">{formatVND(item.price)}</div>
                  <div className="cartItemQty">
                    <button
                      className="qtyBtn"
                      type="button"
                      onClick={() => onUpdateQty(item.id, item.qty - 1)}
                    >
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button
                      className="qtyBtn"
                      type="button"
                      onClick={() => onUpdateQty(item.id, item.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="cartItemRemove"
                  type="button"
                  onClick={() => onRemove(item.id)}
                >
                  Xóa
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cartFooter">
            <div className="cartTotal">
              <span className="cartTotalLabel">Tổng cộng</span>
              <span className="cartTotalValue">{formatVND(total)}</span>
            </div>
            <button className="checkoutBtn" type="button" onClick={onCheckout}>
              Thanh toán
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default function Shop() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [sort, setSort] = useState("default");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const products = useMemo(() => {
    let list = [...productsSeed];

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (category !== "Tất cả") {
      list = list.filter((p) => p.category === category);
    }

    // Sort
    if (sort === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [search, category, sort]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, qty } : item))
      );
    }
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const checkout = () => {
    alert("Demo: Chuyển đến trang thanh toán");
    setCartOpen(false);
  };

  return (
    <div className="shopPage">
      {/* Header */}
      <header className="shopHeader">
        <Link to="/" className="shopBrand">
          <div className="shopLogo">FYD</div>
          <div className="shopBrandName">FYD Store</div>
        </Link>

        <nav className="shopNav">
          <button className="shopNavLink active">Sản phẩm</button>
          <button className="shopNavLink">Khuyến mãi</button>
          <button className="shopNavLink">Về chúng tôi</button>
        </nav>

        <div className="shopActions">
          <button
            className="cartBtn"
            type="button"
            onClick={() => setCartOpen(true)}
          >
            🛒
            {cartCount > 0 && <span className="cartBadge">{cartCount}</span>}
          </button>
          <Link to="/login" className="btnPrimary">
            Đăng nhập
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="shopContent">
        {/* Hero */}
        <section className="shopHero">
          <h1 className="shopHeroTitle">Chào mừng đến FYD Store</h1>
          <p className="shopHeroDesc">
            Khám phá bộ sưu tập thời trang streetwear chất lượng cao với giá tốt nhất
          </p>
        </section>

        {/* Filter Bar */}
        <div className="filterBar">
          <div className="filterLeft">
            <input
              className="searchInput"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="chips">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`chip ${category === cat ? "on" : ""}`}
                  type="button"
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="filterRight">
            <select
              className="miniSelect"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="default">Mặc định</option>
              <option value="price-asc">Giá: Thấp → Cao</option>
              <option value="price-desc">Giá: Cao → Thấp</option>
              <option value="name">Tên A-Z</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="productGrid">
          {products.map((product) => (
            <div className="productCard" key={product.id}>
              <div className="productImg">📦</div>
              <div className="productBody">
                <div className="productCategory">{product.category}</div>
                <div className="productName">{product.name}</div>
                <div className="productPrice">{formatVND(product.price)}</div>
                <div className="productFooter">
                  <StockTag stock={product.stock} />
                  <button
                    className="addCartBtn"
                    type="button"
                    disabled={product.stock <= 0}
                    onClick={() => addToCart(product)}
                  >
                    + Thêm
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
            Không tìm thấy sản phẩm nào
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        cart={cart}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateQty}
        onRemove={removeFromCart}
        onCheckout={checkout}
      />
    </div>
  );
}
