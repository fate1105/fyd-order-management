import { useState } from "react";
import { formatVND } from "@shared/utils/api.js";
import { getProductImage, getPrice } from "@shared/utils/productImages.js";

export default function QuickViewModal({ product, onClose, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

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
    // Only require size selection if product has size variants
    if (uniqueSizes.length > 0 && !selectedSize) {
      alert('Vui lòng chọn kích cỡ');
      return;
    }
    onAddToCart(product, selectedVariant, quantity);
    onClose();
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="quick-view-modal">
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-content">
          <div className="modal-gallery">
            <div className="gallery-main">
              <img
                src={images[currentImageIndex]?.imageUrl || getProductImage(product)}
                alt={product.name}
              />
            </div>
            {images.length > 1 && (
              <div className="gallery-thumbs">
                {images.slice(0, 6).map((img, i) => (
                  <button
                    key={i}
                    className={`thumb ${i === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(i)}
                  >
                    <img src={img.imageUrl} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="modal-details">
            <div className="modal-category">{product.category?.name || product.category}</div>
            <h2 className="modal-title">{product.name}</h2>

            <div className="modal-price">
              <span className="price-current">{formatVND(price)}</span>
              {hasDiscount && (
                <span className="price-original">{formatVND(product.basePrice)}</span>
              )}
            </div>

            {product.description && (
              <p className="modal-description">{product.description}</p>
            )}

            {uniqueColors.length > 0 && (
              <div className="modal-option">
                <label>Màu sắc: <strong>{uniqueColors.find(c => c.id === selectedColor)?.name || 'Chọn màu'}</strong></label>
                <div className="color-options">
                  {uniqueColors.map(color => (
                    <button
                      key={color.id}
                      className={`color-option ${selectedColor === color.id ? 'selected' : ''}`}
                      style={{ backgroundColor: color.hex || '#ccc' }}
                      onClick={() => setSelectedColor(color.id)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {uniqueSizes.length > 0 && (
              <div className="modal-option">
                <label>Kích cỡ: <strong>{uniqueSizes.find(s => s.id === selectedSize)?.name || 'Chọn size'}</strong></label>
                <div className="size-options">
                  {uniqueSizes.map(size => {
                    const variantForSize = variants.find(v =>
                      v.sizeId === size.id && (!selectedColor || v.colorId === selectedColor)
                    );
                    const available = variantForSize && variantForSize.stockQuantity > 0;
                    return (
                      <button
                        key={size.id}
                        className={`size-option ${selectedSize === size.id ? 'selected' : ''} ${!available ? 'unavailable' : ''}`}
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

            <div className="modal-option">
              <label>Số lượng:</label>
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(stock, quantity + 1))}>+</button>
              </div>
              <span className="stock-info">Còn {stock} sản phẩm</span>
            </div>

            <button
              className="modal-add-btn"
              onClick={handleAddToCart}
              disabled={stock <= 0}
            >
              {stock <= 0 ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ HÀNG'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
