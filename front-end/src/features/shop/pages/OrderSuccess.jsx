import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import ShopHeader from "../components/ShopHeader.jsx";
import ShopFooter from "../components/ShopFooter.jsx";
import { getCustomer } from "@shared/utils/customerSession.js";
import { orderAPI, fetchCategories, formatVND, formatDate } from "@shared/utils/api.js";
import "../styles/fyd-shop.css";
import "../styles/checkout.css";

const PAYMENT_LABELS = {
    COD: "Thanh toán khi nhận hàng",
    BANK_TRANSFER: "Chuyển khoản ngân hàng",
    QR_CODE: "Thanh toán QR"
};

export default function OrderSuccess() {
    const { orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [categories, setCategories] = useState([]);
    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!location.state?.order);

    useEffect(() => {
        const savedCustomer = getCustomer();
        if (!savedCustomer) {
            navigate("/shop");
            return;
        }
        setCustomer(savedCustomer);
        fetchCategories().then(setCategories);

        // Fetch order if not passed via state
        if (!order && orderId) {
            setLoading(true);
            orderAPI.getById(orderId)
                .then(data => {
                    setOrder(data);
                })
                .catch(err => {
                    console.error("Failed to fetch order:", err);
                })
                .finally(() => setLoading(false));
        }
    }, [orderId, navigate, order]);

    if (loading) {
        return (
            <div className="shop-page">
                <div className="loading-spinner"><div className="spinner"></div></div>
            </div>
        );
    }

    return (
        <div className="shop-page">
            <ShopHeader
                customer={customer}
                categories={categories}
                onShowAll={() => navigate('/shop')}
            />

            <main className="checkout-page">
                <div className="order-success-container">
                    <div className="success-icon">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>

                    <h1 className="success-title">Đặt hàng thành công!</h1>
                    <p className="success-message">
                        Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được ghi nhận và sẽ được xử lý trong thời gian sớm nhất.
                    </p>

                    {order && (
                        <div className="order-info-card">
                            <div className="order-header-row">
                                <div className="order-code">
                                    <span className="label">Mã đơn hàng</span>
                                    <span className="value">#{order.orderNumber}</span>
                                </div>
                                <div className="order-status">
                                    <span className={`status-badge pending`}>Chờ xử lý</span>
                                </div>
                            </div>

                            <div className="order-details-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Ngày đặt</span>
                                    <span className="detail-value">{formatDate(order.createdAt)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Phương thức thanh toán</span>
                                    <span className="detail-value">
                                        {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Trạng thái thanh toán</span>
                                    <span className="detail-value payment-pending">
                                        {order.paymentStatus === 'PENDING' ? 'Chưa thanh toán' : 'Đã thanh toán'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Địa chỉ giao hàng</span>
                                    <span className="detail-value">
                                        {order.fullAddress || `${order.shippingAddress}, ${order.shippingWard}, ${order.shippingDistrict}, ${order.shippingProvince}`}
                                    </span>
                                </div>
                            </div>

                            <div className="order-total-row">
                                <span>Tổng thanh toán</span>
                                <span className="total-amount">{formatVND(order.totalAmount)}</span>
                            </div>

                            {(order.paymentMethod === 'BANK_TRANSFER' || order.paymentMethod === 'QR_CODE') && (
                                <div className="payment-reminder">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                    <p>
                                        Vui lòng hoàn tất thanh toán để đơn hàng được xử lý nhanh hơn.
                                        Nội dung chuyển khoản: <strong>#{order.orderNumber}</strong>
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="success-actions">
                        <Link to="/shop/profile" className="btn-secondary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            Xem đơn hàng
                        </Link>
                        <Link to="/shop" className="btn-primary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </main>

            <ShopFooter />
        </div>
    );
}
