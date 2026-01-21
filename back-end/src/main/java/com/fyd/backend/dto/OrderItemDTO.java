package com.fyd.backend.dto;

import com.fyd.backend.entity.OrderItem;
import java.math.BigDecimal;

public class OrderItemDTO {
    private Long id;
    private Long productId;
    private Long variantId;
    private String productName;
    private String variantInfo;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
    private String productImage;

    public static OrderItemDTO fromEntity(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
        dto.setVariantId(item.getVariant() != null ? item.getVariant().getId() : null);
        dto.setProductName(item.getProductName());
        
        // Use stored variantInfo, or build from variant if null (for older orders)
        String variantInfo = item.getVariantInfo();
        if ((variantInfo == null || variantInfo.isEmpty()) && item.getVariant() != null) {
            StringBuilder sb = new StringBuilder();
            if (item.getVariant().getSize() != null && item.getVariant().getSize().getName() != null) {
                sb.append(item.getVariant().getSize().getName());
            }
            if (item.getVariant().getColor() != null && item.getVariant().getColor().getName() != null) {
                if (sb.length() > 0) sb.append(" / ");
                sb.append(item.getVariant().getColor().getName());
            }
            variantInfo = sb.length() > 0 ? sb.toString() : null;
        }
        dto.setVariantInfo(variantInfo);
        
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setLineTotal(item.getLineTotal());
        
        // Get product image from product's images
        if (item.getProduct() != null && item.getProduct().getImages() != null 
                   && !item.getProduct().getImages().isEmpty()) {
            dto.setProductImage(item.getProduct().getImages().get(0).getImageUrl());
        }
        
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getVariantInfo() { return variantInfo; }
    public void setVariantInfo(String variantInfo) { this.variantInfo = variantInfo; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }
}
