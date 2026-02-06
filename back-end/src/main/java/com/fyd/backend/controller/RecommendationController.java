package com.fyd.backend.controller;

import com.fyd.backend.entity.Product;
import com.fyd.backend.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for AI-powered product recommendations.
 * Provides endpoints for similar products, frequently bought together,
 * and personalized recommendations.
 */
@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "https://fydvn.vercel.app"})
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    /**
     * Get products similar to the specified product.
     * Used for "You may also like" section on product detail page.
     */
    @GetMapping("/similar/{productId}")
    public ResponseEntity<Map<String, Object>> getSimilarProducts(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "6") int limit) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            List<Product> products = recommendationService.getSimilarProducts(productId, limit);
            response.put("success", true);
            response.put("products", products.stream().map(this::mapProductToDto).collect(Collectors.toList()));
            response.put("type", "similar");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting recommendations: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get products frequently bought together with the specified product.
     * Used for "Customers also bought" section.
     */
    @GetMapping("/bought-together/{productId}")
    public ResponseEntity<Map<String, Object>> getFrequentlyBoughtTogether(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "4") int limit) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            List<Product> products = recommendationService.getFrequentlyBoughtTogether(productId, limit);
            response.put("success", true);
            response.put("products", products.stream().map(this::mapProductToDto).collect(Collectors.toList()));
            response.put("type", "bought_together");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting recommendations: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get popular products across the store.
     * Used for homepage and empty cart recommendations.
     */
    @GetMapping("/popular")
    public ResponseEntity<Map<String, Object>> getPopularProducts(
            @RequestParam(defaultValue = "8") int limit) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            List<Product> products = recommendationService.getPopularProducts(limit);
            response.put("success", true);
            response.put("products", products.stream().map(this::mapProductToDto).collect(Collectors.toList()));
            response.put("type", "popular");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting recommendations: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get personalized recommendations for a customer.
     * Based on their purchase history.
     */
    @GetMapping("/personalized/{customerId}")
    public ResponseEntity<Map<String, Object>> getPersonalizedRecommendations(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "8") int limit) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            List<Product> products = recommendationService.getPersonalizedRecommendations(customerId, limit);
            response.put("success", true);
            response.put("products", products.stream().map(this::mapProductToDto).collect(Collectors.toList()));
            response.put("type", "personalized");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting recommendations: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get "Customers also viewed" products.
     */
    @GetMapping("/also-viewed/{productId}")
    public ResponseEntity<Map<String, Object>> getCustomersAlsoViewed(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "4") int limit) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            List<Product> products = recommendationService.getCustomersAlsoViewed(productId, limit);
            response.put("success", true);
            response.put("products", products.stream().map(this::mapProductToDto).collect(Collectors.toList()));
            response.put("type", "also_viewed");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting recommendations: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Map Product entity to a lightweight DTO for frontend.
     */
    private Map<String, Object> mapProductToDto(Product product) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", product.getId());
        dto.put("name", product.getName());
        dto.put("sku", product.getSku());
        dto.put("basePrice", product.getBasePrice());
        dto.put("salePrice", product.getSalePrice());
        dto.put("categoryId", product.getCategory() != null ? product.getCategory().getId() : null);
        dto.put("soldCount", product.getSoldCount());
        dto.put("viewCount", product.getViewCount());
        
        // Include variants for "Add to Cart" functionality
        if (product.getVariants() != null) {
            List<Map<String, Object>> variants = product.getVariants().stream().map(v -> {
                Map<String, Object> vMap = new HashMap<>();
                vMap.put("id", v.getId());
                vMap.put("size", v.getSize() != null ? v.getSize().getName() : null);
                vMap.put("sizeId", v.getSize() != null ? v.getSize().getId() : null);
                vMap.put("color", v.getColor() != null ? v.getColor().getName() : null);
                vMap.put("colorId", v.getColor() != null ? v.getColor().getId() : null);
                vMap.put("stockQuantity", v.getStockQuantity());
                return vMap;
            }).collect(Collectors.toList());
            dto.put("variants", variants);
        }
        
        // Get primary image
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            product.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .ifPresentOrElse(
                            img -> dto.put("image", img.getImageUrl()),
                            () -> dto.put("image", product.getImages().iterator().next().getImageUrl())
                    );
        } else {
            dto.put("image", null);
        }

        // Calculate discount percentage if on sale
        if (product.getSalePrice() != null && product.getBasePrice() != null 
                && product.getSalePrice().compareTo(product.getBasePrice()) < 0) {
            BigDecimal discount = product.getBasePrice().subtract(product.getSalePrice())
                    .divide(product.getBasePrice(), 2, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            dto.put("discountPercent", discount.intValue());
        } else {
            dto.put("discountPercent", 0);
        }

        return dto;
    }

}
