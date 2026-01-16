import { formatVND } from "../../js/api.js";
import { getProductImage, getPrice } from "./ProductCard.jsx";

export default function WishlistDrawer({ open, wishlist, products, onClose, onRemove, onAddToCart, onViewProduct }) {
  if (!open) return null;

  // Lấy thông tin sản phẩm từ wishlist IDs
  const wishlistProducts = wishlist
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  return (
    <>
      <div className="cart-backdrop" onClick={onClose} />
      <div className="cart-drawer wishlist-drawer">
        <div className="cart-header">
          <h3>Sản phẩm yêu thích ({wishlistProducts.length})</h3>
          <button className="cart-close" onClick={onClose}>×</button>
        </div>

        <div className="cart-items">
          {wishlistProducts.length === 0 ? (
            <div className="cart-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <p>Chưa có sản phẩm yêu thích</p>
              <button className="continue-shopping" onClick={onClose}>
                Khám phá ngay
              </button>
            </div>
          ) : (
            wishlistProducts.map(product => {
              const price = getPrice(product);
              const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
              
              return (
                <div key={product.id} className="wishlist-item">
                  <div 
                    className="wishlist-item-image" 
                    onClick={() => { onViewProduct(product); onClose(); }}
                  >
                    <img src={getProductImage(product)} alt={product.name} />
                  </div>
                  <div className="wishlist-item-details">
                    <h4 onClick={() => { onViewProduct(product); onClose(); }}>
                      {product.name}
                    </h4>
                    <p className="wishlist-category">{product.category}</p>
                    <div className="wishlist-price">
                      {hasDiscount ? (
                        <>
                          <span className="price-sale">{formatVND(price)}</span>
                          <span className="price-original">{formatVND(product.basePrice)}</span>
                        </>
                      ) : (
                        <span className="price-normal">{formatVND(price)}</span>
                      )}
                    </div>
                    <div className="wishlist-actions">
                      <button 
                        className="wishlist-add-cart"
                        onClick={() => onAddToCart(product)}
                      >
                        Thêm vào giỏ
                      </button>
                      <button 
                        className="wishlist-remove"
                        onClick={() => onRemove(product.id)}
                        title="Xóa khỏi yêu thích"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {wishlistProducts.length > 0 && (
          <div className="wishlist-footer">
            <button className="wishlist-add-all" onClick={() => {
              wishlistProducts.forEach(p => onAddToCart(p));
              onClose();
            }}>
              Thêm tất cả vào giỏ
            </button>
          </div>
        )}
      </div>
    </>
  );
}
