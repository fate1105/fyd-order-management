package com.fyd.backend.controller;

import com.fyd.backend.dto.LuckySpinDTO.*;
import com.fyd.backend.dto.auth.AuthResponse;
import com.fyd.backend.entity.Customer;
import com.fyd.backend.service.CustomerAuthService;
import com.fyd.backend.service.CustomerCouponService;
import com.fyd.backend.service.LuckySpinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Controller for Lucky Spin (Vòng quay may mắn) feature.
 * All endpoints require customer authentication.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class LuckySpinController {

    @Autowired
    private LuckySpinService luckySpinService;

    @Autowired
    private CustomerCouponService couponService;

    @Autowired
    private CustomerAuthService customerAuthService;

    /**
     * Get Lucky Spin information and wheel data
     * GET /api/lucky-spin/info
     */
    @GetMapping("/lucky-spin/info")
    public ResponseEntity<?> getSpinInfo(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        Customer customer = validateAndGetCustomer(authHeader);
        if (customer == null) {
            return ResponseEntity.status(401)
                    .body(AuthResponse.error("Vui lòng đăng nhập để tham gia vòng quay"));
        }

        SpinInfoResponse response = luckySpinService.getSpinInfo(customer.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * Perform a free spin
     * POST /api/lucky-spin/play
     */
    @PostMapping("/lucky-spin/play")
    public ResponseEntity<?> play(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        Customer customer = validateAndGetCustomer(authHeader);
        if (customer == null) {
            return ResponseEntity.status(401)
                    .body(SpinResultResponse.error("Vui lòng đăng nhập để tham gia vòng quay"));
        }

        SpinResultResponse result = luckySpinService.play(customer.getId(), "FREE");
        
        if (result.isSuccess()) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Exchange points for a spin
     * POST /api/lucky-spin/exchange-points
     */
    @PostMapping("/lucky-spin/exchange-points")
    public ResponseEntity<?> exchangePointsAndSpin(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        Customer customer = validateAndGetCustomer(authHeader);
        if (customer == null) {
            return ResponseEntity.status(401)
                    .body(SpinResultResponse.error("Vui lòng đăng nhập để tham gia vòng quay"));
        }

        SpinResultResponse result = luckySpinService.exchangePointsAndSpin(customer.getId());
        
        if (result.isSuccess()) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Get customer's coupons
     * GET /api/customer/coupons
     */
    @GetMapping("/customer/coupons")
    public ResponseEntity<?> getMyCoupons(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false, defaultValue = "all") String status) {
        
        Customer customer = validateAndGetCustomer(authHeader);
        if (customer == null) {
            return ResponseEntity.status(401)
                    .body(AuthResponse.error("Unauthorized"));
        }

        List<CustomerCouponDTO> coupons;
        if ("active".equalsIgnoreCase(status)) {
            coupons = couponService.getActiveCoupons(customer.getId());
        } else {
            coupons = couponService.getMyCoupons(customer.getId());
        }

        return ResponseEntity.ok(coupons);
    }

    /**
     * Validate a coupon for checkout
     * POST /api/customer/coupons/validate
     */
    @PostMapping("/customer/coupons/validate")
    public ResponseEntity<?> validateCoupon(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> request) {
        
        Customer customer = validateAndGetCustomer(authHeader);
        if (customer == null) {
            return ResponseEntity.status(401)
                    .body(CouponValidationResponse.invalid("Unauthorized"));
        }

        String code = (String) request.get("code");
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(CouponValidationResponse.invalid("Vui lòng nhập mã giảm giá"));
        }

        BigDecimal orderSubtotal = BigDecimal.ZERO;
        Object subtotalObj = request.get("orderSubtotal");
        if (subtotalObj != null) {
            if (subtotalObj instanceof Number) {
                orderSubtotal = BigDecimal.valueOf(((Number) subtotalObj).doubleValue());
            } else if (subtotalObj instanceof String) {
                try {
                    orderSubtotal = new BigDecimal((String) subtotalObj);
                } catch (NumberFormatException e) {
                    orderSubtotal = BigDecimal.ZERO;
                }
            }
        }

        CouponValidationResponse result = couponService.validateCoupon(
                code.trim().toUpperCase(), customer.getId(), orderSubtotal);

        if (result.isValid()) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Get count of active coupons
     * GET /api/customer/coupons/count
     */
    @GetMapping("/customer/coupons/count")
    public ResponseEntity<?> getCouponCount(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        Customer customer = validateAndGetCustomer(authHeader);
        if (customer == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Unauthorized"));
        }

        int count = couponService.countActiveCoupons(customer.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Validate authorization header and get customer
     */
    private Customer validateAndGetCustomer(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authHeader.substring(7);
        return customerAuthService.getCurrentCustomer(token);
    }
}
