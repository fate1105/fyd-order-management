package com.fyd.backend.service;

import com.fyd.backend.dto.LuckySpinDTO.CouponValidationResponse;
import com.fyd.backend.dto.LuckySpinDTO.CustomerCouponDTO;
import com.fyd.backend.entity.CustomerCoupon;
import com.fyd.backend.entity.Order;
import com.fyd.backend.repository.CustomerCouponRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for managing customer coupons.
 */
@Service
public class CustomerCouponService {

    private static final Logger logger = LoggerFactory.getLogger(CustomerCouponService.class);

    @Autowired
    private CustomerCouponRepository couponRepository;

    /**
     * Get all coupons for a customer
     */
    public List<CustomerCouponDTO> getMyCoupons(Long customerId) {
        // First, expire any that have passed expiration
        expireCustomerCoupons(customerId);
        
        return couponRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(CustomerCouponDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get active coupons for a customer
     */
    public List<CustomerCouponDTO> getActiveCoupons(Long customerId) {
        // First, expire any that have passed expiration
        expireCustomerCoupons(customerId);
        
        return couponRepository.findByCustomerIdAndStatusOrderByCreatedAtDesc(customerId, "ACTIVE")
                .stream()
                .map(CustomerCouponDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Validate a coupon for checkout
     */
    public CouponValidationResponse validateCoupon(String code, Long customerId, BigDecimal orderSubtotal) {
        // Find coupon
        Optional<CustomerCoupon> couponOpt = couponRepository.findByCode(code);
        
        if (couponOpt.isEmpty()) {
            return CouponValidationResponse.invalid("Mã giảm giá không tồn tại");
        }

        CustomerCoupon coupon = couponOpt.get();

        // Check if coupon belongs to customer
        if (!coupon.getCustomer().getId().equals(customerId)) {
            return CouponValidationResponse.invalid("Mã giảm giá này không thuộc về bạn");
        }

        // Check status
        if ("USED".equals(coupon.getStatus())) {
            return CouponValidationResponse.invalid("Mã giảm giá đã được sử dụng");
        }

        if ("EXPIRED".equals(coupon.getStatus())) {
            return CouponValidationResponse.invalid("Mã giảm giá đã hết hạn");
        }

        // Check expiry
        if (LocalDateTime.now().isAfter(coupon.getExpiredAt())) {
            coupon.markAsExpired();
            couponRepository.save(coupon);
            return CouponValidationResponse.invalid("Mã giảm giá đã hết hạn");
        }

        // Check minimum order amount
        if (!coupon.qualifiesForAmount(orderSubtotal)) {
            return CouponValidationResponse.invalid(
                    String.format("Đơn hàng tối thiểu phải từ %,.0fđ", coupon.getMinOrderAmount()));
        }

        // Calculate discount
        BigDecimal discountAmount = coupon.calculateDiscount(orderSubtotal);

        return CouponValidationResponse.valid(coupon, discountAmount);
    }

    /**
     * Use a coupon for an order
     */
    @Transactional
    public boolean useCoupon(String code, Long customerId, Order order) {
        Optional<CustomerCoupon> couponOpt = couponRepository.findByCodeAndCustomerId(code, customerId);
        
        if (couponOpt.isEmpty()) {
            return false;
        }

        CustomerCoupon coupon = couponOpt.get();

        if (!coupon.isValid()) {
            return false;
        }

        coupon.markAsUsed(order);
        couponRepository.save(coupon);
        
        return true;
    }

    /**
     * Expire coupons for a specific customer
     */
    @Transactional
    public void expireCustomerCoupons(Long customerId) {
        List<CustomerCoupon> activeCoupons = couponRepository
                .findByCustomerIdAndStatusOrderByCreatedAtDesc(customerId, "ACTIVE");
        
        LocalDateTime now = LocalDateTime.now();
        
        for (CustomerCoupon coupon : activeCoupons) {
            if (now.isAfter(coupon.getExpiredAt())) {
                coupon.markAsExpired();
                couponRepository.save(coupon);
            }
        }
    }

    /**
     * Scheduled job to expire all expired coupons
     * Runs every day at 1:00 AM
     */
    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void expireExpiredCoupons() {
        logger.info("Running scheduled job: expireExpiredCoupons");
        
        List<CustomerCoupon> expiredCoupons = couponRepository.findExpiredActiveCoupons(LocalDateTime.now());
        
        int count = 0;
        for (CustomerCoupon coupon : expiredCoupons) {
            coupon.markAsExpired();
            couponRepository.save(coupon);
            count++;
        }
        
        logger.info("Expired {} coupons", count);
    }

    /**
     * Calculate discount for a coupon
     */
    public BigDecimal calculateDiscount(CustomerCoupon coupon, BigDecimal orderSubtotal) {
        return coupon.calculateDiscount(orderSubtotal);
    }

    /**
     * Get coupon by code
     */
    public Optional<CustomerCoupon> getCouponByCode(String code) {
        return couponRepository.findByCode(code);
    }

    /**
     * Get coupon by code and customer
     */
    public Optional<CustomerCoupon> getCouponByCodeAndCustomer(String code, Long customerId) {
        return couponRepository.findByCodeAndCustomerId(code, customerId);
    }

    /**
     * Count active coupons for a customer
     */
    public int countActiveCoupons(Long customerId) {
        return couponRepository.countByCustomerIdAndStatus(customerId, "ACTIVE");
    }
}
