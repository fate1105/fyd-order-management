import { formatVND } from "@shared/utils/api.js";
import { trackBeginCheckout } from "@shared/utils/analytics.js";

export default function CartDrawer({ open, cart, total, onClose, onUpdateQty, onRemove, onCheckout }) {
  if (!open) return null;

  return (
    <>
      <div className="cart-backdrop" onClick={onClose} />
      <aside className="cart-drawer">
        <div className="cart-header">
          <h3 className="cart-title">GIỎ HÀNG ({cart.length})</h3>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p>Giỏ hàng của bạn đang trống</p>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.itemId}>
                <div className="cart-item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div style={{ background: '#f5f5f5', width: '100%', height: '100%' }} />
                  )}
                </div>
                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.name || 'Sản phẩm'}</h4>
                  {item.variantInfo && <p className="cart-item-variant">{item.variantInfo}</p>}
                  <p className="cart-item-price">{formatVND(item.price || 0)}</p>
                  <div className="cart-item-actions">
                    <div className="cart-item-qty">
                      <button className="qty-btn" onClick={() => onUpdateQty(item.itemId, item.qty - 1)}>−</button>
                      <span className="qty-value">{item.qty}</span>
                      <button
                        className={`qty-btn ${item.stock !== undefined && item.qty >= item.stock ? 'disabled' : ''}`}
                        onClick={() => onUpdateQty(item.itemId, item.qty + 1)}
                        disabled={item.stock !== undefined && item.qty >= item.stock}
                        title={item.stock !== undefined && item.qty >= item.stock ? `Chỉ còn ${item.stock} sản phẩm` : ""}
                      >+</button>
                    </div>
                    <button className="cart-item-remove" onClick={() => onRemove(item.itemId)}>Xóa</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span className="cart-subtotal-label">Tạm tính</span>
              <span className="cart-subtotal-value">{formatVND(total)}</span>
            </div>
            <button className="btn-shop-black btn-shop-full" onClick={() => {
              trackBeginCheckout(cart.map(item => ({
                productId: item.productId,
                productName: item.name,
                unitPrice: item.price,
                quantity: item.qty
              })), total);
              onCheckout();
            }}>
              THANH TOÁN
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
