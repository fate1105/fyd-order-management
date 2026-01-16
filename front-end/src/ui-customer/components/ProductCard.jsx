import { useState } from "react";
import { formatVND } from "../../js/api.js";

const PLACEHOLDER_IMG = "https://placehold.co/400x400/f5f5f5/999?text=No+Image";

export function getProductImage(product, index = 0) {
  if (product.images && product.images.length > index) {
    return product.images[index].imageUrl;
  }
  if (product.images && product.images.length > 0) {
    return product.images[0].imageUrl;
  }
  if (product.thumbnail) return product.thumbnail;
  return PLACEHOLDER_IMG;
}

export function getPrice(product) {
  return product.salePrice || product.basePrice || product.price || 0;
}

export default function ProductCard({ product, onQuickView, onAddToCart, onToggleWishlist, isWishlisted }) {
  const [isHovered, setIsHovered] = useState(false);
  const primaryImage = getProductImage(product, 0);
  const hoverImage = getProductImage(product, 1);
  const price = getPrice(product);
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
  const discountPercent = hasDiscount ? Math.round((1 - product.salePrice / product.basePrice) * 100) : 0;
  const isNew = product.isNew;
  // Chỉ coi là hết hàng khi totalStock được định nghĩa và = 0
  const isOutOfStock = product.totalStock !== undefined && product.totalStock !== null && product.totalStock <= 0;

  const uniqueColors = product.variants 
    ? [...new Set(product.variants.map(v => v.colorHex).filter(Boolean))].slice(0, 4)
    : [];

  return (
    <div 
      className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onQuickView(product)}
    >
      <div className="product-image-wrapper">
        <img 
          src={isHovered && hoverImage !== primaryImage ? hoverImage : primaryImage} 
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        
        {(hasDiscount || isNew) && (
          <div className="product-badges">
            {hasDiscount && <span className="badge sale">-{discountPercent}%</span>}
            {isNew && !hasDiscount && <span className="badge new">NEW</span>}
          </div>
        )}

        <button 
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
        >
          <svg viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {!isOutOfStock && (
          <button 
            className={`quick-add-btn ${isHovered ? 'visible' : ''}`}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
          >
            THÊM VÀO GIỎ
          </button>
        )}
      </div>

      <div className="product-info">
        {uniqueColors.length > 0 && (
          <div className="product-colors">
            {uniqueColors.map((hex, i) => (
              <span key={i} className="color-dot" style={{ backgroundColor: hex }} />
            ))}
            {product.variants && product.variants.length > 4 && (
              <span className="more-colors">+{product.variants.length - 4}</span>
            )}
          </div>
        )}
        
        <h3 className="product-name">{product.name}</h3>
        <p className="product-category">{product.category}</p>
        
        <div className="product-price">
          {hasDiscount ? (
            <>
              <span className="current-price sale">{formatVND(price)}</span>
              <span className="original-price">{formatVND(product.basePrice)}</span>
            </>
          ) : (
            <span className="current-price">{formatVND(price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
