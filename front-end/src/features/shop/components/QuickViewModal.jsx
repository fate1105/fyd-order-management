import { useState, useRef } from "react";
import { useToast } from "@shared/context/ToastContext";
import { formatVND, getAssetUrl, flyToCart } from "@shared/index.js";
import { getProductImage, getPrice } from "@shared/utils/productImages.js";

const decodeUTF8 = (str) => {
  if (!str) return "";
  try {
    // Basic fix for common Vietnamese encoding issues (Mojibake)
    return decodeURIComponent(escape(str));
  } catch (e) {
    return str;
  }
};

export default function QuickViewModal({ product, onClose, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { showToast } = useToast();
  const mainImgRef = useRef(null);

  if (!product) return null;

  const images = product.images || [];
  const variants = product.variants || [];
  const uniqueColors = [...new Map(variants.filter(v => v.colorId != null).map(v => [v.colorId, { id: v.colorId, name: v.color, hex: v.colorHex }])).values()];
  const uniqueSizes = [...new Map(variants.filter(v => v.sizeId != null).map(v => [v.sizeId, { id: v.sizeId, name: v.size }])).values()];

  const selectedVariant = variants.find(v =>
    (!selectedColor || v.colorId === selectedColor) &&
    (!selectedSize || v.sizeId === selectedSize)
  );
  const stock = selectedVariant?.stockQuantity || product.totalStock || 0;
  const price = getPrice(product);
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice;

  const handleAddToCart = () => {
    if (uniqueSizes.length > 0 && !selectedSize) {
      showToast('Vui lòng chọn kích cỡ', "warning");
      return;
    }

    // Trigger animation before closing
    if (mainImgRef.current) {
      flyToCart(mainImgRef.current);
    }

    onAddToCart(product, selectedVariant, quantity);

    // Slight delay before closing modal to ensure animation source stays in DOM
    setTimeout(() => {
      onClose();
    }, 450);
  };

  return (
    <>
      <div className="modal-backdrop cyber-glass" onClick={onClose} />
      <div className="quick-view-modal cyber-glass-modal">
        <button className="modal-close-neon" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="modal-content-premium">
          <div className="modal-gallery-premium">
            <div className="gallery-main-premium">
              <div className="image-glow-ring"></div>
              <img
                ref={mainImgRef}
                src={images[currentImageIndex]?.imageUrl ? getAssetUrl(images[currentImageIndex].imageUrl) : getProductImage(product)}
                alt={product.name}
              />
            </div>
            {images.length > 1 && (
              <div className="gallery-thumbs-premium">
                {images.slice(0, 6).map((img, i) => (
                  <button
                    key={i}
                    className={`thumb-premium ${i === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(i)}
                  >
                    <img src={getAssetUrl(img.imageUrl)} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="modal-details-premium">
            <div className="detail-entry-animation" style={{ "--delay": "0.1s" }}>
              <div className="modal-category-badge">{product.category?.name || product.category || "FYD SPORT"}</div>
              <h2 className="modal-title-premium">{product.name}</h2>
            </div>

            <div className="detail-entry-animation" style={{ "--delay": "0.2s" }}>
              <div className="modal-price-premium">
                <span className="price-current-neon">{formatVND(price)}</span>
                {hasDiscount && (
                  <span className="price-original-dim">{formatVND(product.basePrice)}</span>
                )}
              </div>
            </div>

            <div className="detail-entry-animation" style={{ "--delay": "0.3s" }}>
              {product.description && (
                <div className="modal-description-premium">
                  {decodeUTF8(product.description)}
                </div>
              )}
            </div>

            <div className="modal-selections-premium">
              {uniqueColors.length > 0 && (
                <div className="modal-option-neon detail-entry-animation" style={{ "--delay": "0.4s" }}>
                  <label>Màu sắc: <span>{uniqueColors.find(c => c.id === selectedColor)?.name || 'Chọn màu'}</span></label>
                  <div className="color-options-grid">
                    {uniqueColors.map(color => (
                      <button
                        key={color.id}
                        className={`color-neon-item ${selectedColor === color.id ? 'selected' : ''}`}
                        style={{ backgroundColor: color.hex || '#ccc' }}
                        onClick={() => setSelectedColor(color.id)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {uniqueSizes.length > 0 && (
                <div className="modal-option-neon detail-entry-animation" style={{ "--delay": "0.5s" }}>
                  <label>Kích cỡ: <span>{uniqueSizes.find(s => s.id === selectedSize)?.name || 'Chọn size'}</span></label>
                  <div className="size-options-grid">
                    {uniqueSizes.map(size => {
                      const variantForSize = variants.find(v =>
                        v.sizeId === size.id && (!selectedColor || v.colorId === selectedColor)
                      );
                      const available = variantForSize && variantForSize.stockQuantity > 0;
                      return (
                        <button
                          key={size.id}
                          className={`size-neon-item ${selectedSize === size.id ? 'selected' : ''} ${!available ? 'unavailable' : ''}`}
                          onClick={() => available && setSelectedSize(size.id)}
                          disabled={!available}
                        >
                          {size.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer-premium detail-entry-animation" style={{ "--delay": "0.6s" }}>
              <div className="purchase-controls">
                <div className="quantity-neon-selector">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span className="qty-val">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(stock, quantity + 1))}>+</button>
                </div>
                <div className="stock-neon-status">
                  <span className="status-dot"></span>
                  Còn {stock} sản phẩm
                </div>
              </div>

              <button
                className={`btn-shop-black btn-shop-full ${stock <= 0 ? 'disabled' : ''}`}
                onClick={handleAddToCart}
                disabled={stock <= 0}
              >
                {stock <= 0 ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ HÀNG'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
