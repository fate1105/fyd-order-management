package com.fyd.backend.controller;

import com.fyd.backend.entity.Customer;
import com.fyd.backend.entity.CustomerTier;
import com.fyd.backend.repository.CustomerRepository;
import com.fyd.backend.repository.CustomerTierRepository;
import com.fyd.backend.service.PointsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/points")
@CrossOrigin(origins = "*")
public class PointsController {

    @Autowired
    private PointsService pointsService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CustomerTierRepository tierRepository;

    // Get customer points balance and tier info
    @GetMapping("/balance/{customerId}")
    public ResponseEntity<Map<String, Object>> getPointsBalance(@PathVariable Long customerId) {
        return customerRepository.findById(customerId)
                .map(customer -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("points", customer.getPoints());
                    response.put("totalPoints", customer.getTotalPoints());
                    
                    if (customer.getTier() != null) {
                        Map<String, Object> tierInfo = new HashMap<>();
                        tierInfo.put("id", customer.getTier().getId());
                        tierInfo.put("name", customer.getTier().getName());
                        tierInfo.put("discountPercent", customer.getTier().getDiscountPercent());
                        tierInfo.put("benefits", customer.getTier().getBenefits());
                        response.put("tier", tierInfo);
                    }
                    
                    // Get next tier info
                    List<CustomerTier> tiers = tierRepository.findAllByOrderBySortOrderAsc();
                    int totalPoints = customer.getTotalPoints() != null ? customer.getTotalPoints() : 0;
                    for (CustomerTier tier : tiers) {
                        int minPoints = tier.getMinPoints() != null ? tier.getMinPoints() : 0;
                        if (totalPoints < minPoints) {
                            Map<String, Object> nextTier = new HashMap<>();
                            nextTier.put("name", tier.getName());
                            nextTier.put("minPoints", minPoints);
                            nextTier.put("pointsNeeded", minPoints - totalPoints);
                            response.put("nextTier", nextTier);
                            break;
                        }
                    }
                    
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Calculate points preview for checkout
    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculatePoints(@RequestBody Map<String, Object> request) {
        BigDecimal orderAmount = new BigDecimal(request.get("orderAmount").toString());
        Long customerId = Long.valueOf(request.get("customerId").toString());
        Integer pointsToUse = request.containsKey("pointsToUse") ? 
                Integer.valueOf(request.get("pointsToUse").toString()) : 0;

        Map<String, Object> response = new HashMap<>();
        
        Customer customer = customerRepository.findById(customerId).orElse(null);
        if (customer == null) {
            response.put("error", "Customer not found");
            return ResponseEntity.badRequest().body(response);
        }

        // Points to be earned
        int pointsEarned = pointsService.calculatePointsEarned(orderAmount);
        response.put("pointsEarned", pointsEarned);

        // Available points
        int availablePoints = customer.getPoints() != null ? customer.getPoints() : 0;
        response.put("availablePoints", availablePoints);

        // Max usable points
        int maxUsable = pointsService.getMaxUsablePoints(customer, orderAmount);
        response.put("maxUsablePoints", maxUsable);

        // Points discount
        if (pointsToUse > 0) {
            int actualPointsToUse = Math.min(pointsToUse, maxUsable);
            BigDecimal pointsDiscount = pointsService.calculatePointsDiscount(actualPointsToUse);
            response.put("pointsDiscount", pointsDiscount);
            response.put("actualPointsUsed", actualPointsToUse);
        }

        // Tier discount
        BigDecimal tierDiscount = pointsService.calculateTierDiscount(customer, orderAmount);
        response.put("tierDiscount", tierDiscount);
        response.put("tierDiscountPercent", pointsService.getTierDiscountPercent(customer));

        return ResponseEntity.ok(response);
    }

    // Get all tiers (for display)
    @GetMapping("/tiers")
    public ResponseEntity<List<CustomerTier>> getAllTiers() {
        return ResponseEntity.ok(tierRepository.findAllByOrderBySortOrderAsc());
    }

    // Get tier statistics with member counts
    @GetMapping("/tiers/stats")
    public ResponseEntity<List<Map<String, Object>>> getTierStats() {
        List<CustomerTier> tiers = tierRepository.findAllByOrderBySortOrderAsc();
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        
        for (CustomerTier tier : tiers) {
            Map<String, Object> tierData = new HashMap<>();
            tierData.put("id", tier.getId());
            tierData.put("name", tier.getName());
            tierData.put("minPoints", tier.getMinPoints());
            tierData.put("minSpent", tier.getMinSpent());
            tierData.put("discountPercent", tier.getDiscountPercent());
            tierData.put("benefits", tier.getBenefits());
            tierData.put("sortOrder", tier.getSortOrder());
            // Get member count for this tier
            Long memberCount = customerRepository.countByTierName(tier.getName());
            tierData.put("memberCount", memberCount != null ? memberCount : 0);
            result.add(tierData);
        }
        
        return ResponseEntity.ok(result);
    }

    // Update a tier
    @PutMapping("/tiers/{id}")
    public ResponseEntity<?> updateTier(@PathVariable Long id, @RequestBody CustomerTier tierData) {
        return tierRepository.findById(id)
                .map(tier -> {
                    tier.setMinPoints(tierData.getMinPoints());
                    tier.setDiscountPercent(tierData.getDiscountPercent());
                    tier.setBenefits(tierData.getBenefits());
                    tier.setSortOrder(tierData.getSortOrder());
                    // Tier name is usually fixed, but we could allow updating it too if needed
                    if (tierData.getName() != null) {
                        tier.setName(tierData.getName());
                    }
                    return ResponseEntity.ok(tierRepository.save(tier));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
