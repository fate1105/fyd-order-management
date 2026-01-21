import { formatVND } from "@shared/utils/api.js";
import { getProductImage, getPrice } from "@shared/utils/productImages.js";

export default function WishlistDrawer({ open, products, onClose, onRemove, onAddToCart }) {
  if (!open) return null;

  return (
    <>
      <div className="cart-backdrop" onClick={onClose} />
      <div className="wishlist-drawer">
        <div className="cart-header">
          <h3 className="cart-title">YÊU THÍCH ({products.length})</h3>
          <button className="cart-close" onClick={onClose}>×</button>
        </div>

        <div className="cart-items">
          {products.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <p>Chưa có sản phẩm yêu thích</p>
            </div>
          ) : (
            products.map(product => {
              const price = getPrice(product);
              const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
              
              return (
                <div key={product.id} className="cart-item">
                  <div className="cart-item-image">
                    <img src={getProductImage(product)} alt={product.name} />
                  </div>
                  <div className="cart-item-details">
                    <h4 className="cart-item-name">{product.name}</h4>
                    <p className="cart-item-variant">{product.category?.name || product.category}</p>
                    <p className="cart-item-price">
                      {hasDiscount ? (
                        <>
                          <span style={{ color: 'var(--shop-sale)' }}>{formatVND(price)}</span>
                          <span style={{ textDecoration: 'line-through', color: '#767677', marginLeft: 8, fontSize: 12 }}>
                            {formatVND(product.basePrice)}
                          </span>
                        </>
                      ) : (
                        formatVND(price)
                      )}
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button 
                        className="qty-btn"
                        style={{ flex: 1, padding: '8px 12px' }}
                        onClick={() => onAddToCart(product)}
                      >
                        Thêm vào giỏ
                      </button>
                      <button 
                        className="cart-item-remove"
                        onClick={() => onRemove(product.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
