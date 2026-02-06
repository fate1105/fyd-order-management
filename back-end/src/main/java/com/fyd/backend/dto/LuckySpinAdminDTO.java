package com.fyd.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class LuckySpinAdminDTO {

    public static class AdminProgramInfo {
        private Long id;
        private String name;
        private String description;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private Integer dailyFreeSpins;
        private Integer pointsPerSpin;
        private Boolean isActive;
        private List<AdminRewardInfo> rewards;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
        public LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
        public Integer getDailyFreeSpins() { return dailyFreeSpins; }
        public void setDailyFreeSpins(Integer dailyFreeSpins) { this.dailyFreeSpins = dailyFreeSpins; }
        public Integer getPointsPerSpin() { return pointsPerSpin; }
        public void setPointsPerSpin(Integer pointsPerSpin) { this.pointsPerSpin = pointsPerSpin; }
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
        public List<AdminRewardInfo> getRewards() { return rewards; }
        public void setRewards(List<AdminRewardInfo> rewards) { this.rewards = rewards; }
    }

    public static class AdminRewardInfo {
        private Long id;
        private String name;
        private String rewardType;
        private BigDecimal rewardValue;
        private BigDecimal baseProbability;
        private BigDecimal multiplierSilver;
        private BigDecimal multiplierGold;
        private BigDecimal multiplierPlatinum;
        private String color;
        private Boolean isActive;
        private Integer sortOrder;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getRewardType() { return rewardType; }
        public void setRewardType(String rewardType) { this.rewardType = rewardType; }
        public BigDecimal getRewardValue() { return rewardValue; }
        public void setRewardValue(BigDecimal rewardValue) { this.rewardValue = rewardValue; }
        public BigDecimal getBaseProbability() { return baseProbability; }
        public void setBaseProbability(BigDecimal baseProbability) { this.baseProbability = baseProbability; }
        public BigDecimal getMultiplierSilver() { return multiplierSilver; }
        public void setMultiplierSilver(BigDecimal multiplierSilver) { this.multiplierSilver = multiplierSilver; }
        public BigDecimal getMultiplierGold() { return multiplierGold; }
        public void setMultiplierGold(BigDecimal multiplierGold) { this.multiplierGold = multiplierGold; }
        public BigDecimal getMultiplierPlatinum() { return multiplierPlatinum; }
        public void setMultiplierPlatinum(BigDecimal multiplierPlatinum) { this.multiplierPlatinum = multiplierPlatinum; }
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
        public Integer getSortOrder() { return sortOrder; }
        public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    }
}
