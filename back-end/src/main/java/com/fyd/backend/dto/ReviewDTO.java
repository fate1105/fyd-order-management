package com.fyd.backend.dto;

import com.fyd.backend.entity.Review;
import java.time.LocalDateTime;

public class ReviewDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private Long customerId;
    private String customerName;
    private String customerAvatar;
    private Integer rating;
    private String title;
    private String content;
    private String imageUrls;
    private String status;
    private String adminReply;
    private LocalDateTime adminReplyAt;
    private Boolean isVerifiedPurchase;
    private Integer helpfulCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Static factory method
    public static ReviewDTO fromEntity(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        
        if (review.getProduct() != null) {
            dto.setProductId(review.getProduct().getId());
            dto.setProductName(review.getProduct().getName());
            dto.setProductSku(review.getProduct().getSku());
        }
        
        if (review.getCustomer() != null) {
            dto.setCustomerId(review.getCustomer().getId());
            dto.setCustomerName(review.getCustomer().getFullName());
            dto.setCustomerAvatar(review.getCustomer().getAvatarUrl());
        }
        
        dto.setRating(review.getRating());
        dto.setTitle(review.getTitle());
        dto.setContent(review.getContent());
        dto.setImageUrls(review.getImageUrls());
        dto.setStatus(review.getStatus());
        dto.setAdminReply(review.getAdminReply());
        dto.setAdminReplyAt(review.getAdminReplyAt());
        dto.setIsVerifiedPurchase(review.getIsVerifiedPurchase());
        dto.setHelpfulCount(review.getHelpfulCount());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());
        
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getProductSku() { return productSku; }
    public void setProductSku(String productSku) { this.productSku = productSku; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerAvatar() { return customerAvatar; }
    public void setCustomerAvatar(String customerAvatar) { this.customerAvatar = customerAvatar; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getImageUrls() { return imageUrls; }
    public void setImageUrls(String imageUrls) { this.imageUrls = imageUrls; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAdminReply() { return adminReply; }
    public void setAdminReply(String adminReply) { this.adminReply = adminReply; }
    public LocalDateTime getAdminReplyAt() { return adminReplyAt; }
    public void setAdminReplyAt(LocalDateTime adminReplyAt) { this.adminReplyAt = adminReplyAt; }
    public Boolean getIsVerifiedPurchase() { return isVerifiedPurchase; }
    public void setIsVerifiedPurchase(Boolean isVerifiedPurchase) { this.isVerifiedPurchase = isVerifiedPurchase; }
    public Integer getHelpfulCount() { return helpfulCount; }
    public void setHelpfulCount(Integer helpfulCount) { this.helpfulCount = helpfulCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
