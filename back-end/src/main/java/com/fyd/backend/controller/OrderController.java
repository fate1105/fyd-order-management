package com.fyd.backend.controller;

import com.fyd.backend.dto.OrderDTO;
import com.fyd.backend.entity.Order;
import com.fyd.backend.entity.OrderItem;
import com.fyd.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ProductVariantRepository variantRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getOrders(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Order> orderPage;
        if (status != null && !status.isEmpty() && !status.equals("all")) {
            orderPage = orderRepository.findByStatus(status, pageRequest);
        } else if (!q.isEmpty()) {
            orderPage = orderRepository.search(q, pageRequest);
        } else {
            orderPage = orderRepository.findAll(pageRequest);
        }
        
        List<OrderDTO> orders = orderPage.getContent().stream()
            .map(OrderDTO::fromEntity)
            .collect(Collectors.toList());
        
        // Count by status
        Map<String, Long> statusCounts = new HashMap<>();
        statusCounts.put("all", orderRepository.count());
        statusCounts.put("PENDING", orderRepository.countByStatus("PENDING"));
        statusCounts.put("CONFIRMED", orderRepository.countByStatus("CONFIRMED"));
        statusCounts.put("PROCESSING", orderRepository.countByStatus("PROCESSING"));
        statusCounts.put("SHIPPING", orderRepository.countByStatus("SHIPPING"));
        statusCounts.put("DELIVERED", orderRepository.countByStatus("DELIVERED"));
        statusCounts.put("COMPLETED", orderRepository.countByStatus("COMPLETED"));
        statusCounts.put("CANCELLED", orderRepository.countByStatus("CANCELLED"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("orders", orders);
        response.put("currentPage", orderPage.getNumber());
        response.put("totalItems", orderPage.getTotalElements());
        response.put("totalPages", orderPage.getTotalPages());
        response.put("statusCounts", statusCounts);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable Long id) {
        return orderRepository.findById(id)
            .map(OrderDTO::fromEntity)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{orderCode}")
    public ResponseEntity<OrderDTO> getOrderByCode(@PathVariable String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
            .map(OrderDTO::fromEntity)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return orderRepository.findById(id)
            .map(order -> {
                order.setStatus(status);
                order.setUpdatedAt(LocalDateTime.now());
                Order saved = orderRepository.save(order);
                return ResponseEntity.ok(OrderDTO.fromEntity(saved));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        if (orderRepository.existsById(id)) {
            orderRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
