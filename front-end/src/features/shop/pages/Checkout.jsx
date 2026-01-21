import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShopHeader from "../components/ShopHeader.jsx";
import ShopFooter from "../components/ShopFooter.jsx";
import { getCustomer } from "@shared/utils/customerSession.js";
import { orderAPI, fetchCategories, formatVND, promotionAPI, pointsAPI } from "@shared/utils/api.js";
import "../styles/fyd-shop.css";
import "../styles/checkout.css";

// Bank info for transfer
const BANK_INFO = {
    bankName: "Vietcombank",
    bankId: "VCB",
    accountNumber: "1234567890",
    accountName: "FYD FASHION CO LTD"
};

export default function Checkout() {
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [cart, setCart] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [showQR, setShowQR] = useState(false);

    const [formData, setFormData] = useState({
        shippingName: "",
        shippingPhone: "",
        shippingProvince: "",
        shippingDistrict: "",
        shippingWard: "",
        shippingAddress: "",
        notes: ""
    });

    const [errors, setErrors] = useState({});

    // Promotion & Points State
    const [promoCode, setPromoCode] = useState("");
    const [promoResult, setPromoResult] = useState(null);
    const [promoLoading, setPromoLoading] = useState(false);

    const [pointsInfo, setPointsInfo] = useState(null);
    const [usePoints, setUsePoints] = useState(false);
    const [pointsToUse, setPointsToUse] = useState(0);
    const [pointsDiscount, setPointsDiscount] = useState(0);
    const [tierDiscount, setTierDiscount] = useState(0);

    // Shipping fee
    const SHIPPING_FEE = 30000;

    useEffect(() => {
        const savedCustomer = getCustomer();
        if (!savedCustomer) {
            navigate("/shop");
            return;
        }
        setCustomer(savedCustomer);

        // Pre-fill customer info
        setFormData(prev => ({
            ...prev,
            shippingName: savedCustomer.fullName || "",
            shippingPhone: savedCustomer.phone || ""
        }));

        // Load cart
        const savedCart = localStorage.getItem("fyd-cart");
        if (savedCart) {
            const cartItems = JSON.parse(savedCart);
            if (cartItems.length === 0) {
                navigate("/shop");
                return;
            }
            setCart(cartItems);
        } else {
            navigate("/shop");
        }

        // Load categories for header
        fetchCategories().then(setCategories);
    }, [navigate]);

    // Fetch points and tier discount when customer or cart changes
    useEffect(() => {
        if (!customer || cart.length === 0) return;

        const currentSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

        const fetchPointsAndDiscount = async () => {
            try {
                const [pointsData, calcData] = await Promise.all([
                    pointsAPI.getBalance(customer.id),
                    pointsAPI.calculate(customer.id, currentSubtotal)
                ]);
                setPointsInfo(pointsData);
                setTierDiscount(Number(calcData.tierDiscount || 0));
            } catch (err) {
                console.error("Failed to fetch points/discount:", err);
            }
        };

        fetchPointsAndDiscount();
    }, [customer, cart]);

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const promoDiscount = promoResult?.discountAmount || 0;
    const totalDiscount = promoDiscount + tierDiscount + pointsDiscount;
    const total = Math.max(0, subtotal + SHIPPING_FEE - totalDiscount);

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        try {
            const result = await promotionAPI.validate(promoCode.trim(), subtotal);
            if (result.valid) {
                setPromoResult(result);
                alert(result.message);
            } else {
                setPromoResult(null);
                alert(result.message);
            }
        } catch (err) {
            console.error("Promo error:", err);
            alert("Lỗi khi kiểm tra mã khuyến mãi");
        } finally {
            setPromoLoading(false);
        }
    };

    const handleTogglePoints = async (e) => {
        const checked = e.target.checked;
        setUsePoints(checked);
        if (checked) {
            try {
                const result = await pointsAPI.calculate(customer.id, subtotal, pointsInfo.points);
                setPointsToUse(result.actualPointsUsed);
                setPointsDiscount(Number(result.pointsDiscount));
            } catch (err) {
                console.error("Points calculation error:", err);
                setUsePoints(false);
            }
        } else {
            setPointsToUse(0);
            setPointsDiscount(0);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.shippingName.trim()) newErrors.shippingName = "Vui lòng nhập họ tên";
        if (!formData.shippingPhone.trim()) newErrors.shippingPhone = "Vui lòng nhập số điện thoại";
        if (!formData.shippingProvince.trim()) newErrors.shippingProvince = "Vui lòng nhập tỉnh/thành phố";
        if (!formData.shippingDistrict.trim()) newErrors.shippingDistrict = "Vui lòng nhập quận/huyện";
        if (!formData.shippingWard.trim()) newErrors.shippingWard = "Vui lòng nhập phường/xã";
        if (!formData.shippingAddress.trim()) newErrors.shippingAddress = "Vui lòng nhập địa chỉ chi tiết";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const orderData = {
                customerId: customer.id,
                shippingName: formData.shippingName,
                shippingPhone: formData.shippingPhone,
                shippingProvince: formData.shippingProvince,
                shippingDistrict: formData.shippingDistrict,
                shippingWard: formData.shippingWard,
                shippingAddress: formData.shippingAddress,
                paymentMethod: paymentMethod,
                notes: formData.notes,
                shippingFee: SHIPPING_FEE,
                promotionCode: promoResult ? promoResult.code : null,
                pointsUsed: pointsToUse,
                items: cart.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    productName: item.name,
                    variantInfo: item.variantInfo,
                    quantity: item.qty,
                    unitPrice: item.price
                }))
            };

            const result = await orderAPI.create(orderData);

            // Clear cart
            localStorage.removeItem("fyd-cart");

            // Navigate to success page
            navigate(`/shop/order-success/${result.id}`, {
                state: { order: result, paymentMethod }
            });
        } catch (error) {
            console.error("Failed to create order:", error);
            // Show specific error from backend if available
            const errorMsg = error.message || "Đặt hàng thất bại. Vui lòng thử lại.";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Generate VietQR URL
    const getQRCodeUrl = () => {
        const content = `FYD ORDER ${Date.now()}`;
        return `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNumber}-compact2.png?amount=${total}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;
    };

    if (!customer) {
        return <div className="loading-spinner"><div className="spinner"></div></div>;
    }

    return (
        <div className="shop-page">
            <ShopHeader
                customer={customer}
                categories={categories}
                onShowAll={() => navigate('/shop')}
            />

            <main className="checkout-page">
                <div className="checkout-container">
                    <h1 className="checkout-title">THANH TOÁN</h1>

                    <div className="checkout-layout">
                        {/* Left: Shipping Form */}
                        <div className="checkout-form-section">
                            <div className="checkout-card">
                                <h2 className="card-title">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    Thông tin giao hàng
                                </h2>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Họ và tên *</label>
                                        <input
                                            type="text"
                                            name="shippingName"
                                            value={formData.shippingName}
                                            onChange={handleInputChange}
                                            placeholder="Nhập họ và tên"
                                            className={errors.shippingName ? 'error' : ''}
                                        />
                                        {errors.shippingName && <span className="error-text">{errors.shippingName}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Số điện thoại *</label>
                                        <input
                                            type="tel"
                                            name="shippingPhone"
                                            value={formData.shippingPhone}
                                            onChange={handleInputChange}
                                            placeholder="Nhập số điện thoại"
                                            className={errors.shippingPhone ? 'error' : ''}
                                        />
                                        {errors.shippingPhone && <span className="error-text">{errors.shippingPhone}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Tỉnh/Thành phố *</label>
                                        <input
                                            type="text"
                                            name="shippingProvince"
                                            value={formData.shippingProvince}
                                            onChange={handleInputChange}
                                            placeholder="Ví dụ: Hồ Chí Minh"
                                            className={errors.shippingProvince ? 'error' : ''}
                                        />
                                        {errors.shippingProvince && <span className="error-text">{errors.shippingProvince}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Quận/Huyện *</label>
                                        <input
                                            type="text"
                                            name="shippingDistrict"
                                            value={formData.shippingDistrict}
                                            onChange={handleInputChange}
                                            placeholder="Ví dụ: Quận 1"
                                            className={errors.shippingDistrict ? 'error' : ''}
                                        />
                                        {errors.shippingDistrict && <span className="error-text">{errors.shippingDistrict}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Phường/Xã *</label>
                                        <input
                                            type="text"
                                            name="shippingWard"
                                            value={formData.shippingWard}
                                            onChange={handleInputChange}
                                            placeholder="Ví dụ: Phường Bến Nghé"
                                            className={errors.shippingWard ? 'error' : ''}
                                        />
                                        {errors.shippingWard && <span className="error-text">{errors.shippingWard}</span>}
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Địa chỉ chi tiết *</label>
                                        <input
                                            type="text"
                                            name="shippingAddress"
                                            value={formData.shippingAddress}
                                            onChange={handleInputChange}
                                            placeholder="Số nhà, tên đường..."
                                            className={errors.shippingAddress ? 'error' : ''}
                                        />
                                        {errors.shippingAddress && <span className="error-text">{errors.shippingAddress}</span>}
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Ghi chú</label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                                            rows="3"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="checkout-card">
                                <h2 className="card-title">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                        <line x1="1" y1="10" x2="23" y2="10"></line>
                                    </svg>
                                    Phương thức thanh toán
                                </h2>

                                <div className="payment-methods">
                                    <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={paymentMethod === 'COD'}
                                            onChange={(e) => { setPaymentMethod(e.target.value); setShowQR(false); }}
                                        />
                                        <div className="payment-icon cod">💵</div>
                                        <div className="payment-info">
                                            <span className="payment-name">Thanh toán khi nhận hàng (COD)</span>
                                            <span className="payment-desc">Thanh toán bằng tiền mặt khi nhận hàng</span>
                                        </div>
                                    </label>

                                    <label className={`payment-option ${paymentMethod === 'BANK_TRANSFER' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="BANK_TRANSFER"
                                            checked={paymentMethod === 'BANK_TRANSFER'}
                                            onChange={(e) => { setPaymentMethod(e.target.value); setShowQR(false); }}
                                        />
                                        <div className="payment-icon bank">🏦</div>
                                        <div className="payment-info">
                                            <span className="payment-name">Chuyển khoản ngân hàng</span>
                                            <span className="payment-desc">Chuyển khoản trực tiếp đến tài khoản ngân hàng</span>
                                        </div>
                                    </label>

                                    <label className={`payment-option ${paymentMethod === 'QR_CODE' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="QR_CODE"
                                            checked={paymentMethod === 'QR_CODE'}
                                            onChange={(e) => { setPaymentMethod(e.target.value); setShowQR(true); }}
                                        />
                                        <div className="payment-icon qr">📱</div>
                                        <div className="payment-info">
                                            <span className="payment-name">Quét mã QR (VietQR)</span>
                                            <span className="payment-desc">Quét mã QR bằng ứng dụng ngân hàng</span>
                                        </div>
                                    </label>
                                </div>

                                {/* Bank Transfer Info */}
                                {paymentMethod === 'BANK_TRANSFER' && (
                                    <div className="bank-info-box">
                                        <h4>Thông tin chuyển khoản</h4>
                                        <div className="bank-details">
                                            <div className="bank-row">
                                                <span>Ngân hàng:</span>
                                                <strong>{BANK_INFO.bankName}</strong>
                                            </div>
                                            <div className="bank-row">
                                                <span>Số tài khoản:</span>
                                                <strong>{BANK_INFO.accountNumber}</strong>
                                            </div>
                                            <div className="bank-row">
                                                <span>Chủ tài khoản:</span>
                                                <strong>{BANK_INFO.accountName}</strong>
                                            </div>
                                            <div className="bank-row">
                                                <span>Số tiền:</span>
                                                <strong className="amount">{formatVND(total)}</strong>
                                            </div>
                                        </div>
                                        <p className="bank-note">
                                            Sau khi chuyển khoản, đơn hàng sẽ được xử lý trong vòng 24h
                                        </p>
                                    </div>
                                )}

                                {/* QR Code */}
                                {paymentMethod === 'QR_CODE' && (
                                    <div className="qr-code-box">
                                        <h4>Quét mã để thanh toán</h4>
                                        <div className="qr-wrapper">
                                            <img
                                                src={getQRCodeUrl()}
                                                alt="VietQR Payment"
                                                className="qr-image"
                                            />
                                        </div>
                                        <p className="qr-note">
                                            Mở ứng dụng ngân hàng và quét mã QR để thanh toán
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Order Summary */}
                        <div className="checkout-summary-section">
                            <div className="checkout-card sticky">
                                <h2 className="card-title">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                                    </svg>
                                    Đơn hàng của bạn
                                </h2>

                                <div className="order-items">
                                    {cart.map(item => (
                                        <div key={item.itemId} className="order-item">
                                            <div className="item-image">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} />
                                                ) : (
                                                    <div className="no-image">📦</div>
                                                )}
                                                <span className="item-qty">{item.qty}</span>
                                            </div>
                                            <div className="item-details">
                                                <span className="item-name">{item.name}</span>
                                                {item.variantInfo && (
                                                    <span className="item-variant">{item.variantInfo}</span>
                                                )}
                                            </div>
                                            <span className="item-price">{formatVND(item.price * item.qty)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Promotion Code */}
                                <div className="promo-section">
                                    <h3 className="section-title">Khuyến mãi</h3>
                                    <div className="promo-input-group">
                                        <input
                                            type="text"
                                            placeholder="Nhập mã giảm giá..."
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                            disabled={promoResult !== null}
                                        />
                                        {promoResult ? (
                                            <button className="promo-remove-btn" onClick={() => setPromoResult(null)}>Hủy</button>
                                        ) : (
                                            <button className="promo-apply-btn" onClick={handleApplyPromo} disabled={promoLoading || !promoCode}>
                                                {promoLoading ? '...' : 'Áp dụng'}
                                            </button>
                                        )}
                                    </div>
                                    {promoResult && (
                                        <p className="promo-msg success">✓ Đã áp dụng mã {promoResult.code}</p>
                                    )}
                                </div>

                                {/* Loyalty Points */}
                                {pointsInfo && pointsInfo.points > 0 && (
                                    <div className="points-section">
                                        <label className="points-toggle">
                                            <input
                                                type="checkbox"
                                                checked={usePoints}
                                                onChange={handleTogglePoints}
                                            />
                                            <span className="toggle-label">
                                                Dùng {pointsInfo.points.toLocaleString()} điểm (giảm {formatVND(pointsInfo.points * 1000)})
                                            </span>
                                        </label>
                                        {usePoints && (
                                            <p className="points-msg">Hệ thống sẽ dùng {pointsToUse.toLocaleString()} điểm cho đơn này.</p>
                                        )}
                                    </div>
                                )}

                                <div className="order-totals">
                                    <div className="total-row">
                                        <span>Tạm tính</span>
                                        <span>{formatVND(subtotal)}</span>
                                    </div>
                                    <div className="total-row">
                                        <span>Phí vận chuyển</span>
                                        <span>{formatVND(SHIPPING_FEE)}</span>
                                    </div>

                                    {tierDiscount > 0 && (
                                        <div className="total-row discount">
                                            <span>Giảm giá thành viên ({pointsInfo?.tier?.name})</span>
                                            <span>-{formatVND(tierDiscount)}</span>
                                        </div>
                                    )}

                                    {promoDiscount > 0 && (
                                        <div className="total-row discount">
                                            <span>Mã giảm giá ({promoResult?.code})</span>
                                            <span>-{formatVND(promoDiscount)}</span>
                                        </div>
                                    )}

                                    {pointsDiscount > 0 && (
                                        <div className="total-row discount">
                                            <span>Dùng điểm thưởng</span>
                                            <span>-{formatVND(pointsDiscount)}</span>
                                        </div>
                                    )}

                                    <div className="total-row grand-total">
                                        <span>Tổng cộng</span>
                                        <span>{formatVND(total)}</span>
                                    </div>

                                    <div className="points-preview">
                                        <span>+ Nhận {Math.floor(total / 10000).toLocaleString()} điểm sau khi hoàn tất</span>
                                    </div>
                                </div>

                                <button
                                    className="place-order-btn"
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-small"></span>
                                            ĐANG XỬ LÝ...
                                        </>
                                    ) : (
                                        <>ĐẶT HÀNG</>
                                    )}
                                </button>

                                <p className="order-note">
                                    Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng của FYD
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <ShopFooter />
        </div>
    );
}
