// Product utility functions
import { getAssetUrl } from './api';

const PLACEHOLDER_IMG = "https://placehold.co/400x400/f5f5f5/999?text=No+Image";

export function getProductImage(product, index = 0) {
  if (product.images && product.images.length > index) {
    return getAssetUrl(product.images[index].imageUrl);
  }
  if (product.images && product.images.length > 0) {
    return getAssetUrl(product.images[0].imageUrl);
  }
  if (product.thumbnail) return getAssetUrl(product.thumbnail);
  return PLACEHOLDER_IMG;
}

export function getPrice(product) {
  return product.salePrice || product.basePrice || product.price || 0;
}

export function getHoverImage(product) {
  // Try to get is_hover image first
  const hoverImg = product.images?.find(img => img.isHover);
  if (hoverImg) return getAssetUrl(hoverImg.imageUrl);

  // Otherwise get second image
  return getProductImage(product, 1);
}

export function getPrimaryImage(product) {
  // Try to get is_primary image first
  const primaryImg = product.images?.find(img => img.isPrimary);
  if (primaryImg) return getAssetUrl(primaryImg.imageUrl);

  // Otherwise get first image
  return getProductImage(product, 0);
}
