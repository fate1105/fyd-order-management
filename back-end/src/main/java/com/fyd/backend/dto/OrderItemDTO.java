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
    private BigDecimal discountAmount;
    private BigDecimal lineTotal;

    public static OrderItemDTO fromEntity(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
        dto.setVariantId(item.getVariant() != null ? item.getVariant().getId() : null);
        dto.setProductName(item.getProductName());
        dto.setVariantInfo(item.getVariantInfo());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setDiscountAmount(item.getDiscountAmount());
        dto.setLineTotal(item.getLineTotal());
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
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
}
