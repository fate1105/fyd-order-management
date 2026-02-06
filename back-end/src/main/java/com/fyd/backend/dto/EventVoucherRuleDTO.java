package com.fyd.backend.dto;

import com.fyd.backend.entity.EventVoucherRule;
import com.fyd.backend.entity.EventVoucherRule.EventType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for EventVoucherRule
 */
public class EventVoucherRuleDTO {

    private Long id;
    private String name;
    private String description;
    private String eventType;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscount;
    private BigDecimal minOrderAmount;
    private Integer validityDays;
    private Integer inactiveDays;
    private Integer newUserDays;
    private String holidayDate;
    private String holidayName;
    private Long targetTierId;
    private String eligibleTierIds;
    private Boolean isActive;
    private Boolean oncePerYear;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer couponsGenerated;

    // Convert from entity
    public static EventVoucherRuleDTO fromEntity(EventVoucherRule entity) {
        EventVoucherRuleDTO dto = new EventVoucherRuleDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setEventType(entity.getEventType() != null ? entity.getEventType().name() : null);
        dto.setDiscountType(entity.getDiscountType());
        dto.setDiscountValue(entity.getDiscountValue());
        dto.setMaxDiscount(entity.getMaxDiscount());
        dto.setMinOrderAmount(entity.getMinOrderAmount());
        dto.setValidityDays(entity.getValidityDays());
        dto.setInactiveDays(entity.getInactiveDays());
        dto.setNewUserDays(entity.getNewUserDays());
        dto.setHolidayDate(entity.getHolidayDate());
        dto.setHolidayName(entity.getHolidayName());
        dto.setTargetTierId(entity.getTargetTierId());
        dto.setEligibleTierIds(entity.getEligibleTierIds());
        dto.setIsActive(entity.getIsActive());
        dto.setOncePerYear(entity.getOncePerYear());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    // Convert to entity
    public EventVoucherRule toEntity() {
        EventVoucherRule entity = new EventVoucherRule();
        entity.setId(this.id);
        entity.setName(this.name);
        entity.setDescription(this.description);
        if (this.eventType != null) {
            entity.setEventType(EventType.valueOf(this.eventType));
        }
        entity.setDiscountType(this.discountType);
        entity.setDiscountValue(this.discountValue);
        entity.setMaxDiscount(this.maxDiscount);
        entity.setMinOrderAmount(this.minOrderAmount);
        entity.setValidityDays(this.validityDays);
        entity.setInactiveDays(this.inactiveDays);
        entity.setNewUserDays(this.newUserDays);
        entity.setHolidayDate(this.holidayDate);
        entity.setHolidayName(this.holidayName);
        entity.setTargetTierId(this.targetTierId);
        entity.setEligibleTierIds(this.eligibleTierIds);
        entity.setIsActive(this.isActive);
        entity.setOncePerYear(this.oncePerYear);
        return entity;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }

    public BigDecimal getMaxDiscount() { return maxDiscount; }
    public void setMaxDiscount(BigDecimal maxDiscount) { this.maxDiscount = maxDiscount; }

    public BigDecimal getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(BigDecimal minOrderAmount) { this.minOrderAmount = minOrderAmount; }

    public Integer getValidityDays() { return validityDays; }
    public void setValidityDays(Integer validityDays) { this.validityDays = validityDays; }

    public Integer getInactiveDays() { return inactiveDays; }
    public void setInactiveDays(Integer inactiveDays) { this.inactiveDays = inactiveDays; }

    public Integer getNewUserDays() { return newUserDays; }
    public void setNewUserDays(Integer newUserDays) { this.newUserDays = newUserDays; }

    public String getHolidayDate() { return holidayDate; }
    public void setHolidayDate(String holidayDate) { this.holidayDate = holidayDate; }

    public String getHolidayName() { return holidayName; }
    public void setHolidayName(String holidayName) { this.holidayName = holidayName; }

    public Long getTargetTierId() { return targetTierId; }
    public void setTargetTierId(Long targetTierId) { this.targetTierId = targetTierId; }

    public String getEligibleTierIds() { return eligibleTierIds; }
    public void setEligibleTierIds(String eligibleTierIds) { this.eligibleTierIds = eligibleTierIds; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getOncePerYear() { return oncePerYear; }
    public void setOncePerYear(Boolean oncePerYear) { this.oncePerYear = oncePerYear; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Integer getCouponsGenerated() { return couponsGenerated; }
    public void setCouponsGenerated(Integer couponsGenerated) { this.couponsGenerated = couponsGenerated; }
}
