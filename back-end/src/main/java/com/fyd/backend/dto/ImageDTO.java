package com.fyd.backend.dto;

import com.fyd.backend.entity.ProductImage;

public class ImageDTO {
    private Long id;
    private String imageUrl;
    private String altText;
    private Boolean isPrimary;
    private Integer sortOrder;

    public static ImageDTO fromEntity(ProductImage img) {
        ImageDTO dto = new ImageDTO();
        dto.setId(img.getId());
        dto.setImageUrl(img.getImageUrl());
        dto.setAltText(img.getAltText());
        dto.setIsPrimary(img.getIsPrimary());
        dto.setSortOrder(img.getSortOrder());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getAltText() { return altText; }
    public void setAltText(String altText) { this.altText = altText; }
    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}

