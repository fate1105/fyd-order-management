package com.fyd.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity for event-based voucher rules.
 * Defines rules for automatic coupon generation based on customer events.
 */
@Entity
@Table(name = "event_voucher_rules")
public class EventVoucherRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Event type that triggers coupon generation:
     * BIRTHDAY - Customer's birthday
     * NEW_USER - New customer registration (within X days)
     * INACTIVE - Customer hasn't ordered for X days
     * VIP_TIER - Customer reaches specific tier
     * FIRST_ORDER - After first order completion
     * HOLIDAY - Specific date (Tết, 8/3, 20/10, etc.)
     */
    @Column(name = "event_type", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private EventType eventType;

    @Column(name = "discount_type", nullable = false, length = 20)
    private String discountType; // PERCENT or FIXED

    @Column(name = "discount_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "max_discount", precision = 12, scale = 2)
    private BigDecimal maxDiscount;

    @Column(name = "min_order_amount", precision = 12, scale = 2)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    /**
     * How many days the generated coupon is valid for
     */
    @Column(name = "validity_days", nullable = false)
    private Integer validityDays = 30;

    /**
     * For INACTIVE event: minimum days since last order
     */
    @Column(name = "inactive_days")
    private Integer inactiveDays;

    /**
     * For NEW_USER event: within how many days of registration
     */
    @Column(name = "new_user_days")
    private Integer newUserDays;

    /**
     * For HOLIDAY event: specific date (MM-DD format, year ignored)
     * Example: 01-01 for New Year, 03-08 for Women's Day
     */
    @Column(name = "holiday_date", length = 10)
    private String holidayDate;

    /**
     * For HOLIDAY event: holiday name
     */
    @Column(name = "holiday_name", length = 100)
    private String holidayName;

    /**
     * For VIP_TIER event: target tier ID
     */
    @Column(name = "target_tier_id")
    private Long targetTierId;

    /**
     * Comma-separated tier IDs that are eligible (null = all tiers)
     */
    @Column(name = "eligible_tier_ids", length = 200)
    private String eligibleTierIds;

    @Column(name = "is_active")
    private Boolean isActive = true;

    /**
     * Prevent duplicate coupons for same event per customer per year
     */
    @Column(name = "once_per_year")
    private Boolean oncePerYear = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum EventType {
        BIRTHDAY,
        NEW_USER,
        INACTIVE,
        VIP_TIER,
        FIRST_ORDER,
        HOLIDAY
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public EventType getEventType() { return eventType; }
    public void setEventType(EventType eventType) { this.eventType = eventType; }

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
}
