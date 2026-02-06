package com.fyd.backend.dto;

import com.fyd.backend.entity.NightMarketOffer;

import java.time.LocalDateTime;

public class NightMarketOfferDTO {
    private Long id;
    private ProductDTO product;
    private Integer discountPercent;
    private LocalDateTime expirationDate;
    private Boolean isRevealed;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ProductDTO getProduct() { return product; }
    public void setProduct(ProductDTO product) { this.product = product; }
    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }
    public LocalDateTime getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDateTime expirationDate) { this.expirationDate = expirationDate; }
    public Boolean getIsRevealed() { return isRevealed; }
    public void setIsRevealed(Boolean isRevealed) { this.isRevealed = isRevealed; }

    public static NightMarketOfferDTO fromEntity(NightMarketOffer entity) {
        NightMarketOfferDTO dto = new NightMarketOfferDTO();
        dto.setId(entity.getId());
        dto.setProduct(ProductDTO.fromEntity(entity.getProduct()));
        dto.setDiscountPercent(entity.getDiscountPercent());
        dto.setExpirationDate(entity.getExpirationDate());
        dto.setIsRevealed(entity.getIsRevealed());
        return dto;
    }
}
