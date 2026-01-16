import { useMemo } from "react";
import { formatVND } from "../../js/api.js";

export default function CartDrawer({ open, cart, onClose, onUpdateQty, onRemove, onCheckout }) {
  const total = useMemo(() => cart.reduce((sum, item) => sum + (item.displayPrice || 0) * item.qty, 0), [cart]);
  
  if (!open) return null;

  return (
    <>
      <div className="cart-backdrop" onClick={onClose} />
      <aside className="cart-drawer">
        <div className="cart-header">
          <h3>GIỎ HÀNG CỦA BẠN ({cart.length})</h3>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <p>Giỏ hàng của bạn đang trống</p>
              <button className="continue-shopping" onClick={onClose}>TIẾP TỤC MUA SẮM</button>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.cartId || item.id}>
                <div className="cart-item-image">
                  <img src={item.imageUrl} alt={item.displayName} />
                </div>
                <div className="cart-item-details">
                  <h4>{item.displayName}</h4>
                  {item.variantInfo && <p className="variant-info">{item.variantInfo}</p>}
                  <p className="item-price">{formatVND(item.displayPrice)}</p>
                  <div className="item-quantity">
                    <button onClick={() => onUpdateQty(item.cartId || item.id, item.qty - 1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => onUpdateQty(item.cartId || item.id, item.qty + 1)}>+</button>
                  </div>
                </div>
                <button className="remove-item" onClick={() => onRemove(item.cartId || item.id)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span>Tạm tính</span>
              <span>{formatVND(total)}</span>
            </div>
            <p className="shipping-note">Phí vận chuyển sẽ được tính khi thanh toán</p>
            <button className="checkout-btn" onClick={onCheckout}>
              THANH TOÁN - {formatVND(total)}
            </button>
            <button className="view-cart-btn" onClick={onClose}>XEM GIỎ HÀNG</button>
          </div>
        )}
      </aside>
    </>
  );
}
