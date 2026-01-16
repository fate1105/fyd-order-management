package com.fyd.backend.dto;

import com.fyd.backend.entity.ProductVariant;
import java.math.BigDecimal;

public class VariantDTO {
    private Long id;
    private String skuVariant;
    private String color;
    private String colorHex;
    private Long colorId;
    private String size;
    private Long sizeId;
    private BigDecimal priceAdjustment;
    private Integer stockQuantity;
    private String status;

    public static VariantDTO fromEntity(ProductVariant v) {
        VariantDTO dto = new VariantDTO();
        dto.setId(v.getId());
        dto.setSkuVariant(v.getSkuVariant());
        dto.setColor(v.getColor() != null ? v.getColor().getName() : null);
        dto.setColorHex(v.getColor() != null ? v.getColor().getHexCode() : null);
        dto.setColorId(v.getColor() != null ? v.getColor().getId() : null);
        dto.setSize(v.getSize() != null ? v.getSize().getName() : null);
        dto.setSizeId(v.getSize() != null ? v.getSize().getId() : null);
        dto.setPriceAdjustment(v.getPriceAdjustment());
        dto.setStockQuantity(v.getStockQuantity());
        dto.setStatus(v.getStatus());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSkuVariant() { return skuVariant; }
    public void setSkuVariant(String skuVariant) { this.skuVariant = skuVariant; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getColorHex() { return colorHex; }
    public void setColorHex(String colorHex) { this.colorHex = colorHex; }
    public Long getColorId() { return colorId; }
    public void setColorId(Long colorId) { this.colorId = colorId; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public Long getSizeId() { return sizeId; }
    public void setSizeId(Long sizeId) { this.sizeId = sizeId; }
    public BigDecimal getPriceAdjustment() { return priceAdjustment; }
    public void setPriceAdjustment(BigDecimal priceAdjustment) { this.priceAdjustment = priceAdjustment; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
