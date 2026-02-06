import { formatVND } from "@shared/utils/api.js";
import { getProductImage, getPrice } from "@shared/utils/productImages.js";
import { useTranslation } from "react-i18next";

export default function WishlistDrawer({ open, products, onClose, onRemove, onAddToCart, onShare }) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <>
      <div className="cart-backdrop" onClick={onClose} />
      <div className="wishlist-drawer">
        <div className="cart-header">
          <h3 className="cart-title">{t('shop.wishlist_title', 'YÊU THÍCH')} ({products.length})</h3>
          <button className="cart-close" onClick={onClose}>×</button>
        </div>

        <div className="cart-items">
          {products.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <p>{t('shop.wishlist_empty', 'Chưa có sản phẩm yêu thích')}</p>
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
                    <h4 className="cart-item-name">{product.name || t('shop.product', 'Sản phẩm')}</h4>
                    <p className="cart-item-variant">{product.category?.name || product.category || ''}</p>
                    <p className="cart-item-price">
                      {hasDiscount ? (
                        <>
                          <span style={{ color: 'var(--shop-sale)' }}>{formatVND(price || 0)}</span>
                          <span style={{ textDecoration: 'line-through', color: '#767677', marginLeft: 8, fontSize: 12 }}>
                            {formatVND(product.basePrice || 0)}
                          </span>
                        </>
                      ) : (
                        formatVND(price || 0)
                      )}
                    </p>
                    <div className="cart-item-actions">
                      <button
                        className="btn-shop-black"
                        style={{ flex: 1, padding: '10px 12px', fontSize: '11px' }}
                        onClick={() => onAddToCart(product)}
                      >
                        {t('shop.select_size_add', 'CHỌN SIZE & THÊM')}
                      </button>
                      <button
                        className="btn-shop-outline"
                        style={{ padding: '10px 12px', fontSize: '11px', borderSize: '1px' }}
                        onClick={() => onRemove(product.id)}
                      >
                        {t('common.remove', 'XÓA')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Share Button */}
        {products.length > 0 && (
          <div className="wishlist-footer" style={{ padding: '16px 20px', borderTop: '1px solid var(--shop-gray-200, #eee)' }}>
            <button
              className="share-wishlist-btn"
              onClick={onShare}
              style={{
                width: '100%',
                padding: '14px',
                background: 'none',
                border: '2px solid var(--shop-black, #000)',
                fontSize: '12px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {t('shop.share_wishlist', 'Chia sẻ danh sách')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

