package com.fyd.backend.controller;

import com.fyd.backend.dto.EventVoucherRuleDTO;
import com.fyd.backend.entity.EventVoucherRule;
import com.fyd.backend.service.EventVoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin controller for managing event-based voucher rules.
 */
@RestController
@RequestMapping("/api/admin/event-vouchers")
@CrossOrigin(origins = "*")
public class EventVoucherController {

    @Autowired
    private EventVoucherService eventVoucherService;

    /**
     * Get all event voucher rules
     */
    @GetMapping
    public ResponseEntity<?> getAllRules() {
        try {
            List<EventVoucherRule> rules = eventVoucherService.getAllRules();
            List<EventVoucherRuleDTO> dtos = rules.stream()
                    .map(rule -> {
                        EventVoucherRuleDTO dto = EventVoucherRuleDTO.fromEntity(rule);
                        dto.setCouponsGenerated(eventVoucherService.getCouponsGeneratedByRule(rule.getId()));
                        return dto;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get single rule by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getRule(@PathVariable Long id) {
        try {
            EventVoucherRule rule = eventVoucherService.getAllRules().stream()
                    .filter(r -> r.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Rule not found"));

            EventVoucherRuleDTO dto = EventVoucherRuleDTO.fromEntity(rule);
            dto.setCouponsGenerated(eventVoucherService.getCouponsGeneratedByRule(id));
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create new event voucher rule
     */
    @PostMapping
    public ResponseEntity<?> createRule(@RequestBody EventVoucherRuleDTO dto) {
        try {
            EventVoucherRule rule = dto.toEntity();
            EventVoucherRule created = eventVoucherService.createRule(rule);
            return ResponseEntity.ok(EventVoucherRuleDTO.fromEntity(created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update existing rule
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRule(@PathVariable Long id, @RequestBody EventVoucherRuleDTO dto) {
        try {
            EventVoucherRule rule = dto.toEntity();
            EventVoucherRule updated = eventVoucherService.updateRule(id, rule);
            return ResponseEntity.ok(EventVoucherRuleDTO.fromEntity(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete rule
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRule(@PathVariable Long id) {
        try {
            eventVoucherService.deleteRule(id);
            return ResponseEntity.ok(Map.of("message", "Rule deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Toggle rule active status
     */
    @PostMapping("/{id}/toggle")
    public ResponseEntity<?> toggleRule(@PathVariable Long id) {
        try {
            EventVoucherRule rule = eventVoucherService.toggleRuleStatus(id);
            return ResponseEntity.ok(EventVoucherRuleDTO.fromEntity(rule));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Manually trigger a rule to generate coupons for eligible customers
     */
    @PostMapping("/{id}/trigger")
    public ResponseEntity<?> triggerRule(@PathVariable Long id) {
        try {
            int count = eventVoucherService.triggerRule(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Rule triggered successfully");
            response.put("couponsGenerated", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get available event types
     */
    @GetMapping("/event-types")
    public ResponseEntity<?> getEventTypes() {
        List<Map<String, String>> types = List.of(
                Map.of("value", "BIRTHDAY", "label", "Sinh nhật khách hàng", "icon", "cake"),
                Map.of("value", "NEW_USER", "label", "Khách hàng mới", "icon", "user-plus"),
                Map.of("value", "INACTIVE", "label", "Khách lâu không mua", "icon", "clock"),
                Map.of("value", "VIP_TIER", "label", "Đạt hạng VIP", "icon", "crown"),
                Map.of("value", "FIRST_ORDER", "label", "Đơn hàng đầu tiên", "icon", "shopping-bag"),
                Map.of("value", "HOLIDAY", "label", "Ngày lễ", "icon", "calendar")
        );
        return ResponseEntity.ok(types);
    }

    /**
     * Manually run all event processing (for testing)
     */
    @PostMapping("/process-all")
    public ResponseEntity<?> processAllEvents() {
        try {
            eventVoucherService.processAllEvents();
            return ResponseEntity.ok(Map.of("message", "All events processed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
