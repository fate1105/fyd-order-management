import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatVND } from "@shared/utils/api.js";

export default function ProductCard({ product, onQuickView, onAddToCart, onToggleWishlist, isWishlisted }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get all images
  const allImages = product.images || [];
  const displayImages = allImages.slice(0, 4);
  const hasMoreImages = allImages.length > 4;

  // Get current image
  const currentImage = allImages[selectedImageIndex]?.imageUrl ||
    product.thumbnail ||
    'https://via.placeholder.com/400x400?text=No+Image';

  // Get hover image (next image in list)
  const hoverImage = allImages[selectedImageIndex + 1]?.imageUrl ||
    allImages[(selectedImageIndex + 1) % allImages.length]?.imageUrl ||
    currentImage;

  // Calculate price
  const price = product.salePrice || product.basePrice;
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
  const discountPercent = hasDiscount ? Math.round((1 - product.salePrice / product.basePrice) * 100) : 0;
  const isNew = product.isNew;
  const isOutOfStock = product.totalStock !== undefined && product.totalStock !== null && product.totalStock <= 0;

  // Get unique colors from variants
  const uniqueColors = product.variants
    ? [...new Set(product.variants.map(v => v.colorHex).filter(Boolean))].slice(0, 4)
    : [];

  const handleThumbnailClick = (e, index) => {
    e.stopPropagation();
    setSelectedImageIndex(index);
  };

  return (
    <div
      className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
      data-product-id={product.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/shop/product/${product.id}`)}
    >
      <div className="product-image-wrapper">
        <img
          src={isHovered && hoverImage !== currentImage ? hoverImage : currentImage}
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
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {!isOutOfStock && (
          <button
            className={`quick-add-btn ${isHovered ? 'visible' : ''}`}
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
          >
            THÊM VÀO GIỎ
          </button>
        )}
      </div>

      {/* Thumbnails - shown on hover when there are multiple images */}
      {displayImages.length > 1 && (
        <div className="product-thumbnails">
          {displayImages.map((img, index) => (
            <button
              key={img.id || index}
              className={`product-thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
              onClick={(e) => handleThumbnailClick(e, index)}
            >
              <img src={img.imageUrl} alt={`${product.name} - ${index + 1}`} loading="lazy" />
            </button>
          ))}
          {hasMoreImages && (
            <span className="more-thumbnails">+{allImages.length - 4}</span>
          )}
        </div>
      )}

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
        <p className="product-category">{product.category || 'Sản phẩm'}</p>

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

