package com.fyd.backend.controller;

import com.fyd.backend.entity.Order;
import com.fyd.backend.repository.OrderRepository;
import com.fyd.backend.service.GHTKService;
import com.fyd.backend.annotation.Loggable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/shipping")
@CrossOrigin(origins = "*")
public class ShippingController {

    @Autowired
    private GHTKService ghtkService;

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/ghtk/push/{orderId}")
    @Loggable(action = "UPDATE", entityType = "Shipping")
    public ResponseEntity<?> pushToGHTK(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Order not found"));
        }

        Map<String, Object> result = ghtkService.createShippingOrder(order);
        if (result != null && Boolean.TRUE.equals(result.get("success"))) {
            Map<String, Object> orderData = (Map<String, Object>) result.get("order");
            String labelId = (String) orderData.get("label");
            
            order.setTrackingNumber(labelId);
            order.setCarrier("GHTK");
            order.setStatus("SHIPPING"); // Update to SHIPPING once pushed
            orderRepository.save(order);
            
            return ResponseEntity.ok(result);
        }

        return ResponseEntity.badRequest().body(Map.of(
            "message", result != null && result.get("message") != null ? result.get("message") : "Failed to push to GHTK",
            "details", result != null ? result : "No response from GHTK"
        ));
    }

    @GetMapping("/tracking/{orderId}")
    public ResponseEntity<?> getTracking(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null || order.getTrackingNumber() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tracking info not available"));
        }

        Map<String, Object> trackingInfo = ghtkService.getTrackingInfo(order.getTrackingNumber());
        if (trackingInfo != null) {
            return ResponseEntity.ok(trackingInfo);
        }

        return ResponseEntity.badRequest().body(Map.of("message", "Failed to fetch tracking info"));
    }
}
