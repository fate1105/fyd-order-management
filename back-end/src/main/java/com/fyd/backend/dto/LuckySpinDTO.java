package com.fyd.backend.dto;

import com.fyd.backend.entity.CustomerCoupon;
import com.fyd.backend.entity.LuckySpinProgram;
import com.fyd.backend.entity.LuckySpinReward;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs for Lucky Spin feature.
 */
public class LuckySpinDTO {

    /**
     * Response for spin info (wheel data)
     */
    public static class SpinInfoResponse {
        private boolean hasActiveProgram;
        private ProgramInfo program;
        private List<RewardInfo> rewards;
        private SpinStatus spinStatus;

        public static SpinInfoResponse noProgram() {
            SpinInfoResponse response = new SpinInfoResponse();
            response.hasActiveProgram = false;
            return response;
        }

        // Getters and Setters
        public boolean isHasActiveProgram() { return hasActiveProgram; }
        public void setHasActiveProgram(boolean hasActiveProgram) { this.hasActiveProgram = hasActiveProgram; }
        
        public ProgramInfo getProgram() { return program; }
        public void setProgram(ProgramInfo program) { this.program = program; }
        
        public List<RewardInfo> getRewards() { return rewards; }
        public void setRewards(List<RewardInfo> rewards) { this.rewards = rewards; }
        
        public SpinStatus getSpinStatus() { return spinStatus; }
        public void setSpinStatus(SpinStatus spinStatus) { this.spinStatus = spinStatus; }
    }

    /**
     * Program information
     */
    public static class ProgramInfo {
        private Long id;
        private String name;
        private String description;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private int dailyFreeSpins;
        private int pointsPerSpin;

        public static ProgramInfo fromEntity(LuckySpinProgram program) {
            ProgramInfo info = new ProgramInfo();
            info.id = program.getId();
            info.name = program.getName();
            info.description = program.getDescription();
            info.startDate = program.getStartDate();
            info.endDate = program.getEndDate();
            info.dailyFreeSpins = program.getDailyFreeSpins();
            info.pointsPerSpin = program.getPointsPerSpin();
            return info;
        }

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
        
        public int getDailyFreeSpins() { return dailyFreeSpins; }
        public void setDailyFreeSpins(int dailyFreeSpins) { this.dailyFreeSpins = dailyFreeSpins; }
        
        public int getPointsPerSpin() { return pointsPerSpin; }
        public void setPointsPerSpin(int pointsPerSpin) { this.pointsPerSpin = pointsPerSpin; }
    }

    /**
     * Reward slot information (for displaying wheel)
     */
    public static class RewardInfo {
        private Long id;
        private String name;
        private String rewardType;
        private BigDecimal rewardValue;
        private String color;
        private String icon;
        private int sortOrder;

        public static RewardInfo fromEntity(LuckySpinReward reward) {
            RewardInfo info = new RewardInfo();
            info.id = reward.getId();
            info.name = reward.getName();
            info.rewardType = reward.getRewardType();
            info.rewardValue = reward.getRewardValue();
            info.color = reward.getColor();
            info.icon = reward.getIcon();
            info.sortOrder = reward.getSortOrder();
            return info;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getRewardType() { return rewardType; }
        public void setRewardType(String rewardType) { this.rewardType = rewardType; }
        
        public BigDecimal getRewardValue() { return rewardValue; }
        public void setRewardValue(BigDecimal rewardValue) { this.rewardValue = rewardValue; }
        
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
        
        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
        
        public int getSortOrder() { return sortOrder; }
        public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
    }

    /**
     * Customer's spin status
     */
    public static class SpinStatus {
        private int remainingFreeSpins;
        private int totalSpinsToday;
        private int customerPoints;
        private int pointsPerSpin;
        private boolean canExchangePoints;

        // Getters and Setters
        public int getRemainingFreeSpins() { return remainingFreeSpins; }
        public void setRemainingFreeSpins(int remainingFreeSpins) { this.remainingFreeSpins = remainingFreeSpins; }
        
        public int getTotalSpinsToday() { return totalSpinsToday; }
        public void setTotalSpinsToday(int totalSpinsToday) { this.totalSpinsToday = totalSpinsToday; }
        
        public int getCustomerPoints() { return customerPoints; }
        public void setCustomerPoints(int customerPoints) { this.customerPoints = customerPoints; }
        
        public int getPointsPerSpin() { return pointsPerSpin; }
        public void setPointsPerSpin(int pointsPerSpin) { this.pointsPerSpin = pointsPerSpin; }
        
        public boolean isCanExchangePoints() { return canExchangePoints; }
        public void setCanExchangePoints(boolean canExchangePoints) { this.canExchangePoints = canExchangePoints; }
    }

    /**
     * Response after spinning
     */
    public static class SpinResultResponse {
        private boolean success;
        private String message;
        private RewardInfo reward;
        private CustomerCouponDTO coupon;
        private int rewardIndex; // Index on wheel for animation
        private SpinStatus spinStatus;

        public static SpinResultResponse success(LuckySpinReward reward, CustomerCoupon coupon, int rewardIndex, SpinStatus status) {
            SpinResultResponse response = new SpinResultResponse();
            response.success = true;
            response.message = "Chúc mừng bạn đã quay trúng: " + reward.getName();
            response.reward = RewardInfo.fromEntity(reward);
            if (coupon != null) {
                response.coupon = CustomerCouponDTO.fromEntity(coupon);
            }
            response.rewardIndex = rewardIndex;
            response.spinStatus = status;
            return response;
        }

        public static SpinResultResponse noReward(LuckySpinReward reward, int rewardIndex, SpinStatus status) {
            SpinResultResponse response = new SpinResultResponse();
            response.success = true;
            response.message = "Chúc bạn may mắn lần sau!";
            response.reward = RewardInfo.fromEntity(reward);
            response.rewardIndex = rewardIndex;
            response.spinStatus = status;
            return response;
        }

        public static SpinResultResponse error(String message) {
            SpinResultResponse response = new SpinResultResponse();
            response.success = false;
            response.message = message;
            return response;
        }

        // Getters and Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public RewardInfo getReward() { return reward; }
        public void setReward(RewardInfo reward) { this.reward = reward; }
        
        public CustomerCouponDTO getCoupon() { return coupon; }
        public void setCoupon(CustomerCouponDTO coupon) { this.coupon = coupon; }
        
        public int getRewardIndex() { return rewardIndex; }
        public void setRewardIndex(int rewardIndex) { this.rewardIndex = rewardIndex; }
        
        public SpinStatus getSpinStatus() { return spinStatus; }
        public void setSpinStatus(SpinStatus spinStatus) { this.spinStatus = spinStatus; }
    }

    /**
     * Customer coupon DTO
     */
    public static class CustomerCouponDTO {
        private Long id;
        private String code;
        private String discountType;
        private BigDecimal discountValue;
        private BigDecimal maxDiscount;
        private BigDecimal minOrderAmount;
        private LocalDateTime expiredAt;
        private String status;
        private LocalDateTime createdAt;
        private String description;

        public static CustomerCouponDTO fromEntity(CustomerCoupon coupon) {
            CustomerCouponDTO dto = new CustomerCouponDTO();
            dto.id = coupon.getId();
            dto.code = coupon.getCode();
            dto.discountType = coupon.getDiscountType();
            dto.discountValue = coupon.getDiscountValue();
            dto.maxDiscount = coupon.getMaxDiscount();
            dto.minOrderAmount = coupon.getMinOrderAmount();
            dto.expiredAt = coupon.getExpiredAt();
            dto.status = coupon.getStatus();
            dto.createdAt = coupon.getCreatedAt();
            
            // Generate description
            if ("PERCENT".equals(coupon.getDiscountType())) {
                dto.description = "Giảm " + coupon.getDiscountValue().intValue() + "%";
                if (coupon.getMaxDiscount() != null) {
                    dto.description += " (tối đa " + formatCurrency(coupon.getMaxDiscount()) + ")";
                }
            } else {
                dto.description = "Giảm " + formatCurrency(coupon.getDiscountValue());
            }
            
            if (coupon.getMinOrderAmount() != null && coupon.getMinOrderAmount().compareTo(BigDecimal.ZERO) > 0) {
                dto.description += " - Đơn tối thiểu " + formatCurrency(coupon.getMinOrderAmount());
            }
            
            return dto;
        }

        private static String formatCurrency(BigDecimal amount) {
            return String.format("%,.0fđ", amount);
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        
        public String getDiscountType() { return discountType; }
        public void setDiscountType(String discountType) { this.discountType = discountType; }
        
        public BigDecimal getDiscountValue() { return discountValue; }
        public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }
        
        public BigDecimal getMaxDiscount() { return maxDiscount; }
        public void setMaxDiscount(BigDecimal maxDiscount) { this.maxDiscount = maxDiscount; }
        
        public BigDecimal getMinOrderAmount() { return minOrderAmount; }
        public void setMinOrderAmount(BigDecimal minOrderAmount) { this.minOrderAmount = minOrderAmount; }
        
        public LocalDateTime getExpiredAt() { return expiredAt; }
        public void setExpiredAt(LocalDateTime expiredAt) { this.expiredAt = expiredAt; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    /**
     * Request for points exchange
     */
    public static class ExchangePointsRequest {
        private int numberOfSpins = 1;

        public int getNumberOfSpins() { return numberOfSpins; }
        public void setNumberOfSpins(int numberOfSpins) { this.numberOfSpins = numberOfSpins; }
    }

    /**
     * Response for coupon validation
     */
    public static class CouponValidationResponse {
        private boolean valid;
        private String message;
        private CustomerCouponDTO coupon;
        private BigDecimal discountAmount;

        public static CouponValidationResponse valid(CustomerCoupon coupon, BigDecimal discountAmount) {
            CouponValidationResponse response = new CouponValidationResponse();
            response.valid = true;
            response.message = "Mã giảm giá hợp lệ";
            response.coupon = CustomerCouponDTO.fromEntity(coupon);
            response.discountAmount = discountAmount;
            return response;
        }

        public static CouponValidationResponse invalid(String message) {
            CouponValidationResponse response = new CouponValidationResponse();
            response.valid = false;
            response.message = message;
            return response;
        }

        // Getters and Setters
        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public CustomerCouponDTO getCoupon() { return coupon; }
        public void setCoupon(CustomerCouponDTO coupon) { this.coupon = coupon; }
        
        public BigDecimal getDiscountAmount() { return discountAmount; }
        public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    }
}
