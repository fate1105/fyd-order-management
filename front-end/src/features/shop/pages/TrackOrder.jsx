import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "@shared/context/CartContext.jsx";
import { orderAPI, formatVND, formatDate, fetchCategories } from "@shared/utils/api.js";
import { getCustomer, logout as customerLogout } from "@shared/utils/customerSession.js";
import ShopHeader from "../components/ShopHeader.jsx";
import ShopFooter from "../components/ShopFooter.jsx";
import CartDrawer from "../components/CartDrawer.jsx";
import "../styles/track-order.css";
import "../styles/fyd-shop.css";

// Status timeline configuration
const ORDER_STATUSES = [
    { key: "PENDING", label: "Chờ xác nhận", icon: "📋" },
    { key: "CONFIRMED", label: "Đã xác nhận", icon: "✅" },
    { key: "PROCESSING", label: "Đang chuẩn bị", icon: "📦" },
    { key: "SHIPPING", label: "Đang giao hàng", icon: "🚚" },
    { key: "DELIVERED", label: "Đã giao hàng", icon: "🎉" },
];

const CANCELLED_STATUS = { key: "CANCELLED", label: "Đã hủy", icon: "❌" };

export default function TrackOrder() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [orderCode, setOrderCode] = useState("");
    const [phone, setPhone] = useState("");
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState([]);
    const [customer, setCustomer] = useState(null);

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
            try {
                const cats = await fetchCategories();
                setCategories(cats || []);
                setCustomer(getCustomer());
            } catch (error) {
                console.error('Failed to load initial data:', error);
            }
        };
        loadInitialData();
    }, []);

    const handleTrack = async (e) => {
        e.preventDefault();

        if (!orderCode.trim() || !phone.trim()) {
            setError("Vui lòng nhập đầy đủ mã đơn hàng và số điện thoại");
            return;
        }

        setLoading(true);
        setError("");
        setOrder(null);

        try {
            const result = await orderAPI.track(orderCode.trim(), phone.trim());

            if (result.error) {
                setError(result.error);
            } else {
                setOrder(result);
            }
        } catch (err) {
            setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusIndex = (status) => {
        if (status === "CANCELLED") return -1;
        return ORDER_STATUSES.findIndex(s => s.key === status);
    };

    const getCurrentStatusLabel = (status) => {
        if (status === "CANCELLED") return CANCELLED_STATUS.label;
        if (status === "PENDING_CANCEL") return "Chờ duyệt hủy";
        const found = ORDER_STATUSES.find(s => s.key === status);
        return found ? found.label : status;
    };

    return (
        <div className="shop-page">
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

            <div className="track-order-page">
                <div className="track-order-container">
                    {/* Header */}
                    <div className="track-order-header">
                        <div className="track-order-icon">📦</div>
                        <h1>Tra cứu đơn hàng</h1>
                        <p>Nhập mã đơn hàng và số điện thoại để theo dõi trạng thái giao hàng</p>
                    </div>

                    {/* Search Form */}
                    <form className="track-order-form" onSubmit={handleTrack}>
                        <div className="form-group">
                            <label htmlFor="orderCode">Mã đơn hàng</label>
                            <input
                                type="text"
                                id="orderCode"
                                placeholder="VD: FYD-20260204-ABC123"
                                value={orderCode}
                                onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Số điện thoại</label>
                            <input
                                type="tel"
                                id="phone"
                                placeholder="0912345678"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            className="track-order-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Đang tra cứu...
                                </>
                            ) : (
                                <>
                                    <span>🔍</span>
                                    Tra cứu
                                </>
                            )}
                        </button>
                    </form>

                    {/* Error Message */}
                    {error && (
                        <div className="track-order-error">
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}

                    {/* Order Result */}
                    {order && (
                        <div className="track-order-result">
                            {/* Order Header */}
                            <div className="order-result-header">
                                <div className="order-code-badge">
                                    <span className="label">Mã đơn hàng</span>
                                    <span className="code">{order.orderCode}</span>
                                </div>
                                <div className={`order-status-badge ${order.status.toLowerCase()}`}>
                                    {getCurrentStatusLabel(order.status)}
                                </div>
                            </div>

                            {/* Status Timeline */}
                            {order.status !== "CANCELLED" && (
                                <div className="status-timeline">
                                    {ORDER_STATUSES.map((status, index) => {
                                        const currentIndex = getStatusIndex(order.status);
                                        const isCompleted = index <= currentIndex;
                                        const isCurrent = index === currentIndex;

                                        return (
                                            <div
                                                key={status.key}
                                                className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                                            >
                                                <div className="timeline-icon">
                                                    {isCompleted ? "✓" : status.icon}
                                                </div>
                                                <div className="timeline-label">{status.label}</div>
                                                {index < ORDER_STATUSES.length - 1 && (
                                                    <div className={`timeline-line ${isCompleted && index < currentIndex ? 'completed' : ''}`}></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Cancelled Status */}
                            {order.status === "CANCELLED" && (
                                <div className="order-cancelled-banner">
                                    <span>❌</span>
                                    Đơn hàng này đã bị hủy
                                </div>
                            )}

                            {/* Order Details */}
                            <div className="order-details-grid">
                                <div className="detail-card">
                                    <h4>📍 Địa chỉ giao hàng</h4>
                                    <p className="customer-name">{order.shippingName}</p>
                                    <p>{order.shippingAddress}</p>
                                    <p>{order.shippingDistrict}, {order.shippingProvince}</p>
                                </div>
                                <div className="detail-card">
                                    <h4>💳 Thanh toán</h4>
                                    <p>Phương thức: <strong>{order.paymentMethod}</strong></p>
                                    <p>Trạng thái: <span className={`payment-status ${order.paymentStatus?.toLowerCase()}`}>
                                        {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                                    </span></p>
                                    <p className="total-amount">Tổng tiền: <strong>{formatVND(order.totalAmount)}</strong></p>
                                </div>
                                <div className="detail-card">
                                    <h4>📅 Thời gian</h4>
                                    <p>Đặt hàng: {formatDate(order.createdAt)}</p>
                                    {order.confirmedAt && <p>Xác nhận: {formatDate(order.confirmedAt)}</p>}
                                    {order.deliveredAt && <p>Giao hàng: {formatDate(order.deliveredAt)}</p>}
                                </div>
                            </div>

                            {/* Order Items */}
                            {order.items && order.items.length > 0 && (
                                <div className="order-items-section">
                                    <h4>🛍️ Sản phẩm ({order.itemCount} sản phẩm)</h4>
                                    <div className="order-items-list">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="order-item">
                                                <div className="item-info">
                                                    <span className="item-name">{item.name}</span>
                                                    {item.variant && <span className="item-variant">{item.variant}</span>}
                                                </div>
                                                <div className="item-qty">x{item.quantity}</div>
                                                <div className="item-price">{formatVND(item.price)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Help Section */}
                            <div className="order-help">
                                <p>Cần hỗ trợ? Liên hệ hotline: <strong>1900 1234</strong> hoặc email: <strong>support@fyd.vn</strong></p>
                            </div>
                        </div>
                    )}

                </div> {/* track-order-container */}
            </div> {/* track-order-page */}

            <CartDrawer
                open={cartOpen}
                onClose={() => setCartOpen(false)}
                cart={cart}
                total={cartTotal}
                onUpdateQty={updateCartQty}
                onRemove={removeFromCart}
                onCheckout={() => {
                    setCartOpen(false);
                    navigate('/shop/checkout');
                }}
            />

            <ShopFooter />
        </div>
    );
}
