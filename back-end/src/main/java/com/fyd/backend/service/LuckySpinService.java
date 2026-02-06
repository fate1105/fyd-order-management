package com.fyd.backend.service;

import com.fyd.backend.dto.LuckySpinAdminDTO.*;
import com.fyd.backend.dto.LuckySpinDTO.*;
import com.fyd.backend.entity.*;
import com.fyd.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for Lucky Spin feature with tier-based probability.
 */
@Service
public class LuckySpinService {

    private static final String COUPON_PREFIX = "SPIN";
    private static final String COUPON_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int COUPON_LENGTH = 8;
    private static final SecureRandom random = new SecureRandom();

    @Autowired
    private LuckySpinProgramRepository programRepository;

    @Autowired
    private LuckySpinRewardRepository rewardRepository;

    @Autowired
    private LuckySpinHistoryRepository historyRepository;

    @Autowired
    private CustomerCouponRepository couponRepository;

    @Autowired
    private CustomerRepository customerRepository;

    /**
     * Get Lucky Spin info for a customer
     */
    public SpinInfoResponse getSpinInfo(Long customerId) {
        // Find active program
        Optional<LuckySpinProgram> programOpt = programRepository.findActiveProgram(LocalDateTime.now());
        
        if (programOpt.isEmpty()) {
            return SpinInfoResponse.noProgram();
        }

        LuckySpinProgram program = programOpt.get();
        Customer customer = customerRepository.findById(customerId).orElse(null);
        
        if (customer == null) {
            return SpinInfoResponse.noProgram();
        }

        // Get rewards
        List<LuckySpinReward> rewards = rewardRepository
                .findByProgramIdAndIsActiveTrueOrderBySortOrderAsc(program.getId());

        // Build response
        SpinInfoResponse response = new SpinInfoResponse();
        response.setHasActiveProgram(true);
        response.setProgram(ProgramInfo.fromEntity(program));
        response.setRewards(rewards.stream().map(RewardInfo::fromEntity).collect(Collectors.toList()));
        response.setSpinStatus(buildSpinStatus(customer, program));

        return response;
    }

    /**
     * Perform a spin (transactional with serializable isolation)
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public SpinResultResponse play(Long customerId, String spinType) {
        // Validate customer
        Customer customer = customerRepository.findById(customerId).orElse(null);
        if (customer == null) {
            return SpinResultResponse.error("Không tìm thấy thông tin khách hàng");
        }

        // Find active program
        Optional<LuckySpinProgram> programOpt = programRepository.findActiveProgram(LocalDateTime.now());
        if (programOpt.isEmpty()) {
            return SpinResultResponse.error("Chương trình vòng quay hiện không hoạt động");
        }

        LuckySpinProgram program = programOpt.get();

        // Check spin eligibility
        if ("FREE".equals(spinType)) {
            int freeSpinsUsed = historyRepository.countByCustomerIdAndProgramIdAndSpinDateAndSpinType(
                    customerId, program.getId(), LocalDate.now(), "FREE");
            
            if (freeSpinsUsed >= program.getDailyFreeSpins()) {
                return SpinResultResponse.error("Bạn đã hết lượt quay miễn phí hôm nay. Hãy dùng điểm để đổi thêm lượt!");
            }
        } else if ("POINTS_EXCHANGE".equals(spinType)) {
            int customerPoints = customer.getPoints() != null ? customer.getPoints() : 0;
            if (customerPoints < program.getPointsPerSpin()) {
                return SpinResultResponse.error("Bạn không đủ điểm để đổi lượt quay");
            }
            
            // Deduct points
            customer.setPoints(customerPoints - program.getPointsPerSpin());
            customerRepository.save(customer);
        } else {
            return SpinResultResponse.error("Loại quay không hợp lệ");
        }

        // Get rewards
        List<LuckySpinReward> rewards = rewardRepository
                .findByProgramIdAndIsActiveTrueOrderBySortOrderAsc(program.getId());
        
        if (rewards.isEmpty()) {
            return SpinResultResponse.error("Không có phần thưởng nào được cấu hình");
        }

        // Random reward based on tier
        String tierName = customer.getTier() != null ? customer.getTier().getName() : "Bronze";
        int rewardIndex = randomRewardIndex(rewards, tierName);
        LuckySpinReward wonReward = rewards.get(rewardIndex);

        // Create coupon if not NO_REWARD
        CustomerCoupon coupon = null;
        if (!wonReward.isNoReward()) {
            coupon = createCoupon(customer, program, wonReward);
            couponRepository.save(coupon);
        }

        // Save history
        LuckySpinHistory history = new LuckySpinHistory();
        history.setCustomer(customer);
        history.setProgram(program);
        history.setReward(wonReward);
        history.setCoupon(coupon);
        history.setSpinType(spinType);
        history.setPointsUsed("POINTS_EXCHANGE".equals(spinType) ? program.getPointsPerSpin() : 0);
        history.setSpinDate(LocalDate.now());
        historyRepository.save(history);

        // Build spin status
        SpinStatus status = buildSpinStatus(customer, program);

        // Return result
        if (wonReward.isNoReward()) {
            return SpinResultResponse.noReward(wonReward, rewardIndex, status);
        } else {
            return SpinResultResponse.success(wonReward, coupon, rewardIndex, status);
        }
    }

    /**
     * Exchange points for spin
     */
    @Transactional
    public SpinResultResponse exchangePointsAndSpin(Long customerId) {
        return play(customerId, "POINTS_EXCHANGE");
    }

    /**
     * Random reward index using weighted probability based on tier
     */
    private int randomRewardIndex(List<LuckySpinReward> rewards, String tierName) {
        // Calculate actual probabilities
        List<Double> probabilities = new ArrayList<>();
        double totalProbability = 0;

        for (LuckySpinReward reward : rewards) {
            double prob = reward.getActualProbability(tierName);
            probabilities.add(prob);
            totalProbability += prob;
        }

        // Normalize probabilities
        if (totalProbability > 0) {
            for (int i = 0; i < probabilities.size(); i++) {
                probabilities.set(i, probabilities.get(i) / totalProbability);
            }
        }

        // Weighted random selection
        double randomValue = random.nextDouble();
        double cumulative = 0;

        for (int i = 0; i < probabilities.size(); i++) {
            cumulative += probabilities.get(i);
            if (randomValue <= cumulative) {
                return i;
            }
        }

        // Fallback to last reward
        return rewards.size() - 1;
    }

    /**
     * Create a coupon from reward
     */
    private CustomerCoupon createCoupon(Customer customer, LuckySpinProgram program, LuckySpinReward reward) {
        CustomerCoupon coupon = new CustomerCoupon();
        coupon.setCustomer(customer);
        coupon.setProgram(program);
        coupon.setReward(reward);
        coupon.setCode(generateUniqueCouponCode());
        coupon.setDiscountType(reward.getRewardType());
        coupon.setDiscountValue(reward.getRewardValue());
        coupon.setMaxDiscount(reward.getMaxDiscount());
        coupon.setMinOrderAmount(reward.getMinOrderAmount());
        coupon.setExpiredAt(LocalDateTime.now().plusDays(reward.getCouponValidityDays()));
        coupon.setStatus("ACTIVE");
        return coupon;
    }

    /**
     * Generate unique coupon code
     */
    private String generateUniqueCouponCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(COUPON_PREFIX);
            for (int i = 0; i < COUPON_LENGTH; i++) {
                sb.append(COUPON_CHARS.charAt(random.nextInt(COUPON_CHARS.length())));
            }
            code = sb.toString();
        } while (couponRepository.existsByCode(code));
        
        return code;
    }

    /**
     * Build spin status for customer
     */
    private SpinStatus buildSpinStatus(Customer customer, LuckySpinProgram program) {
        int freeSpinsUsed = historyRepository.countByCustomerIdAndProgramIdAndSpinDateAndSpinType(
                customer.getId(), program.getId(), LocalDate.now(), "FREE");
        
        int totalSpinsToday = historyRepository.countByCustomerIdAndProgramIdAndSpinDate(
                customer.getId(), program.getId(), LocalDate.now());
        
        int customerPoints = customer.getPoints() != null ? customer.getPoints() : 0;

        SpinStatus status = new SpinStatus();
        status.setRemainingFreeSpins(Math.max(0, program.getDailyFreeSpins() - freeSpinsUsed));
        status.setTotalSpinsToday(totalSpinsToday);
        status.setCustomerPoints(customerPoints);
        status.setPointsPerSpin(program.getPointsPerSpin());
        status.setCanExchangePoints(customerPoints >= program.getPointsPerSpin());
        
        return status;
    }

    /**
     * Get Lucky Spin info for Admin
     */
    public AdminProgramInfo getAdminInfo() {
        // For simplicity, we assume there's only one main program for now
        LuckySpinProgram program = programRepository.findAll().stream()
                .findFirst()
                .orElse(null);

        if (program == null) return null;

        List<LuckySpinReward> rewards = rewardRepository.findByProgramIdOrderBySortOrderAsc(program.getId());

        AdminProgramInfo info = new AdminProgramInfo();
        info.setId(program.getId());
        info.setName(program.getName());
        info.setDescription(program.getDescription());
        info.setStartDate(program.getStartDate());
        info.setEndDate(program.getEndDate());
        info.setDailyFreeSpins(program.getDailyFreeSpins());
        info.setPointsPerSpin(program.getPointsPerSpin());
        info.setIsActive(program.getIsActive());

        info.setRewards(rewards.stream().map(r -> {
            AdminRewardInfo ri = new AdminRewardInfo();
            ri.setId(r.getId());
            ri.setName(r.getName());
            ri.setRewardType(r.getRewardType());
            ri.setRewardValue(r.getRewardValue());
            ri.setBaseProbability(r.getBaseProbability());
            ri.setMultiplierSilver(r.getProbabilityMultiplierSilver());
            ri.setMultiplierGold(r.getProbabilityMultiplierGold());
            ri.setMultiplierPlatinum(r.getProbabilityMultiplierPlatinum());
            ri.setColor(r.getColor());
            ri.setIsActive(r.getIsActive());
            ri.setSortOrder(r.getSortOrder());
            return ri;
        }).collect(Collectors.toList()));

        return info;
    }

    /**
     * Update program settings
     */
    @Transactional
    public boolean updateProgram(AdminProgramInfo dto) {
        LuckySpinProgram program = programRepository.findById(dto.getId()).orElse(null);
        if (program == null) return false;

        program.setName(dto.getName());
        program.setDescription(dto.getDescription());
        program.setStartDate(dto.getStartDate());
        program.setEndDate(dto.getEndDate());
        program.setDailyFreeSpins(dto.getDailyFreeSpins());
        program.setPointsPerSpin(dto.getPointsPerSpin());
        program.setIsActive(dto.getIsActive());

        programRepository.save(program);
        return true;
    }

    /**
     * Update a reward
     */
    @Transactional
    public boolean updateReward(AdminRewardInfo dto) {
        LuckySpinReward reward = rewardRepository.findById(dto.getId()).orElse(null);
        if (reward == null) return false;

        reward.setName(dto.getName());
        reward.setRewardType(dto.getRewardType());
        reward.setRewardValue(dto.getRewardValue());
        reward.setBaseProbability(dto.getBaseProbability());
        reward.setProbabilityMultiplierSilver(dto.getMultiplierSilver());
        reward.setProbabilityMultiplierGold(dto.getMultiplierGold());
        reward.setProbabilityMultiplierPlatinum(dto.getMultiplierPlatinum());
        reward.setColor(dto.getColor());
        reward.setIsActive(dto.getIsActive());
        reward.setSortOrder(dto.getSortOrder());

        rewardRepository.save(reward);
        return true;
    }
}
