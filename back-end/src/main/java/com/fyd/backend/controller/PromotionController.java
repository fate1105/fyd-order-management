package com.fyd.backend.controller;

import com.fyd.backend.entity.Promotion;
import com.fyd.backend.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "*")
public class PromotionController {

    @Autowired
    private PromotionRepository promotionRepository;

    // Get all promotions (admin)
    @GetMapping
    public ResponseEntity<List<Promotion>> getAllPromotions() {
        return ResponseEntity.ok(promotionRepository.findAll());
    }

    // Get active promotions
    @GetMapping("/list/active")
    public ResponseEntity<List<Promotion>> getActivePromotions() {
        return ResponseEntity.ok(promotionRepository.findAllValidPromotions());
    }

    // Get active flash sales
    @GetMapping("/list/flash-sale")
    public ResponseEntity<List<Promotion>> getFlashSales() {
        return ResponseEntity.ok(promotionRepository.findActiveFlashSales());
    }

    // Get promotion by ID
    @GetMapping("/{id}")
    public ResponseEntity<Promotion> getPromotion(@PathVariable Long id) {
        return promotionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create promotion (admin)
    @PostMapping
    public ResponseEntity<Promotion> createPromotion(@RequestBody Promotion promotion) {
        if (promotionRepository.existsByCode(promotion.getCode())) {
            return ResponseEntity.badRequest().build();
        }
        Promotion saved = promotionRepository.save(promotion);
        return ResponseEntity.ok(saved);
    }

    // Update promotion (admin)
    @PutMapping("/{id}")
    public ResponseEntity<Promotion> updatePromotion(@PathVariable Long id, @RequestBody Promotion promotion) {
        return promotionRepository.findById(id)
                .map(existing -> {
                    existing.setName(promotion.getName());
                    existing.setDescription(promotion.getDescription());
                    existing.setDiscountType(promotion.getDiscountType());
                    existing.setDiscountValue(promotion.getDiscountValue());
                    existing.setMinOrderAmount(promotion.getMinOrderAmount());
                    existing.setMaxDiscount(promotion.getMaxDiscount());
                    existing.setUsageLimit(promotion.getUsageLimit());
                    existing.setStartDate(promotion.getStartDate());
                    existing.setEndDate(promotion.getEndDate());
                    existing.setIsActive(promotion.getIsActive());
                    existing.setIsFlashSale(promotion.getIsFlashSale());
                    return ResponseEntity.ok(promotionRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete promotion (admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromotion(@PathVariable Long id) {
        if (promotionRepository.existsById(id)) {
            promotionRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Validate promotion code (shop)
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validatePromotion(@RequestBody Map<String, Object> request) {
        String code = (String) request.get("code");
        BigDecimal orderSubtotal = new BigDecimal(request.get("subtotal").toString());

        Map<String, Object> response = new HashMap<>();
        
        Optional<Promotion> promoOpt = promotionRepository.findByCodeIgnoreCase(code);
        
        if (promoOpt.isEmpty()) {
            response.put("valid", false);
            response.put("message", "Ma khuyen mai khong ton tai");
            return ResponseEntity.ok(response);
        }

        Promotion promotion = promoOpt.get();
        
        if (!promotion.isValid()) {
            response.put("valid", false);
            response.put("message", "Ma khuyen mai da het han hoac da su dung het");
            return ResponseEntity.ok(response);
        }

        if (orderSubtotal.compareTo(promotion.getMinOrderAmount()) < 0) {
            response.put("valid", false);
            response.put("message", "Don hang chua dat gia tri toi thieu " + promotion.getMinOrderAmount() + " VND");
            return ResponseEntity.ok(response);
        }

        BigDecimal discount = promotion.calculateDiscount(orderSubtotal);
        
        response.put("valid", true);
        response.put("code", promotion.getCode());
        response.put("name", promotion.getName());
        response.put("discountType", promotion.getDiscountType());
        response.put("discountValue", promotion.getDiscountValue());
        response.put("discountAmount", discount);
        response.put("message", "Ap dung thanh cong!");
        
        return ResponseEntity.ok(response);
    }

    // Apply promotion (increment used count)
    @PostMapping("/apply")
    public ResponseEntity<Void> applyPromotion(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        
        return promotionRepository.findByCodeIgnoreCase(code)
                .map(promotion -> {
                    promotion.setUsedCount(promotion.getUsedCount() + 1);
                    promotionRepository.save(promotion);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
