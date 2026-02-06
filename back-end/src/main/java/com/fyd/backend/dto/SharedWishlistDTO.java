package com.fyd.backend.dto;

import java.util.List;

public class SharedWishlistDTO {

    // Request DTO for creating a shared wishlist
    public static class CreateRequest {
        private List<Long> productIds;
        private String ownerName;

        public List<Long> getProductIds() { return productIds; }
        public void setProductIds(List<Long> productIds) { this.productIds = productIds; }
        public String getOwnerName() { return ownerName; }
        public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    }

    // Response DTO for share link creation
    public static class ShareResponse {
        private String shareCode;
        private String shareUrl;

        public ShareResponse(String shareCode, String shareUrl) {
            this.shareCode = shareCode;
            this.shareUrl = shareUrl;
        }

        public String getShareCode() { return shareCode; }
        public void setShareCode(String shareCode) { this.shareCode = shareCode; }
        public String getShareUrl() { return shareUrl; }
        public void setShareUrl(String shareUrl) { this.shareUrl = shareUrl; }
    }

    // Response DTO for viewing a shared wishlist
    public static class ViewResponse {
        private String shareCode;
        private String ownerName;
        private List<ProductSummary> products;
        private Integer viewCount;

        public String getShareCode() { return shareCode; }
        public void setShareCode(String shareCode) { this.shareCode = shareCode; }
        public String getOwnerName() { return ownerName; }
        public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
        public List<ProductSummary> getProducts() { return products; }
        public void setProducts(List<ProductSummary> products) { this.products = products; }
        public Integer getViewCount() { return viewCount; }
        public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }
    }

    // Simplified product info for wishlist display
    public static class ProductSummary {
        private Long id;
        private String name;
        private String slug;
        private String thumbnail;
        private java.math.BigDecimal basePrice;
        private java.math.BigDecimal salePrice;
        private String categoryName;
        private Integer totalStock;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }
        public String getThumbnail() { return thumbnail; }
        public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }
        public java.math.BigDecimal getBasePrice() { return basePrice; }
        public void setBasePrice(java.math.BigDecimal basePrice) { this.basePrice = basePrice; }
        public java.math.BigDecimal getSalePrice() { return salePrice; }
        public void setSalePrice(java.math.BigDecimal salePrice) { this.salePrice = salePrice; }
        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
        public Integer getTotalStock() { return totalStock; }
        public void setTotalStock(Integer totalStock) { this.totalStock = totalStock; }
    }
}
