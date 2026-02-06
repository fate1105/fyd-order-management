package com.fyd.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity for lucky_spin_rewards table.
 * Represents a reward slot on the spin wheel with tier-based probability multipliers.
 */
@Entity
@Table(name = "lucky_spin_rewards")
public class LuckySpinReward {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    private LuckySpinProgram program;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "reward_type", nullable = false, length = 20)
    private String rewardType; // PERCENT, FIXED, NO_REWARD

    @Column(name = "reward_value", precision = 12, scale = 2)
    private BigDecimal rewardValue = BigDecimal.ZERO;

    @Column(name = "max_discount", precision = 12, scale = 2)
    private BigDecimal maxDiscount;

    @Column(name = "min_order_amount", precision = 12, scale = 2)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(name = "coupon_validity_days")
    private Integer couponValidityDays = 7;

    // Base probability (0.0000 - 1.0000)
    @Column(name = "base_probability", precision = 5, scale = 4, nullable = false)
    private BigDecimal baseProbability;

    // Tier-based probability multipliers
    @Column(name = "probability_multiplier_silver", precision = 4, scale = 2)
    private BigDecimal probabilityMultiplierSilver = new BigDecimal("1.20");

    @Column(name = "probability_multiplier_gold", precision = 4, scale = 2)
    private BigDecimal probabilityMultiplierGold = new BigDecimal("1.50");

    @Column(name = "probability_multiplier_platinum", precision = 4, scale = 2)
    private BigDecimal probabilityMultiplierPlatinum = new BigDecimal("2.00");

    // UI properties
    @Column(length = 7)
    private String color = "#FF6B6B";

    @Column(length = 50)
    private String icon = "gift";

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * Get probability multiplier based on customer tier
     */
    public BigDecimal getMultiplierByTier(String tierName) {
        if (tierName == null) return BigDecimal.ONE;
        
        return switch (tierName.toUpperCase()) {
            case "SILVER" -> probabilityMultiplierSilver != null ? probabilityMultiplierSilver : BigDecimal.ONE;
            case "GOLD" -> probabilityMultiplierGold != null ? probabilityMultiplierGold : BigDecimal.ONE;
            case "PLATINUM" -> probabilityMultiplierPlatinum != null ? probabilityMultiplierPlatinum : BigDecimal.ONE;
            default -> BigDecimal.ONE; // Bronze or unknown
        };
    }

    /**
     * Calculate actual probability for a given tier
     */
    public double getActualProbability(String tierName) {
        BigDecimal multiplier = getMultiplierByTier(tierName);
        double prob = baseProbability.multiply(multiplier).doubleValue();
        return Math.max(0, Math.min(1, prob)); // Clamp between 0 and 1
    }

    /**
     * Check if this is a "no reward" slot
     */
    public boolean isNoReward() {
        return "NO_REWARD".equals(rewardType);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LuckySpinProgram getProgram() { return program; }
    public void setProgram(LuckySpinProgram program) { this.program = program; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRewardType() { return rewardType; }
    public void setRewardType(String rewardType) { this.rewardType = rewardType; }

    public BigDecimal getRewardValue() { return rewardValue; }
    public void setRewardValue(BigDecimal rewardValue) { this.rewardValue = rewardValue; }

    public BigDecimal getMaxDiscount() { return maxDiscount; }
    public void setMaxDiscount(BigDecimal maxDiscount) { this.maxDiscount = maxDiscount; }

    public BigDecimal getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(BigDecimal minOrderAmount) { this.minOrderAmount = minOrderAmount; }

    public Integer getCouponValidityDays() { return couponValidityDays; }
    public void setCouponValidityDays(Integer couponValidityDays) { this.couponValidityDays = couponValidityDays; }

    public BigDecimal getBaseProbability() { return baseProbability; }
    public void setBaseProbability(BigDecimal baseProbability) { this.baseProbability = baseProbability; }

    public BigDecimal getProbabilityMultiplierSilver() { return probabilityMultiplierSilver; }
    public void setProbabilityMultiplierSilver(BigDecimal probabilityMultiplierSilver) { this.probabilityMultiplierSilver = probabilityMultiplierSilver; }

    public BigDecimal getProbabilityMultiplierGold() { return probabilityMultiplierGold; }
    public void setProbabilityMultiplierGold(BigDecimal probabilityMultiplierGold) { this.probabilityMultiplierGold = probabilityMultiplierGold; }

    public BigDecimal getProbabilityMultiplierPlatinum() { return probabilityMultiplierPlatinum; }
    public void setProbabilityMultiplierPlatinum(BigDecimal probabilityMultiplierPlatinum) { this.probabilityMultiplierPlatinum = probabilityMultiplierPlatinum; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
