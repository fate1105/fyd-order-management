package com.fyd.backend.controller;

import com.fyd.backend.dto.CreateOrderRequest;
import com.fyd.backend.dto.OrderDTO;
import com.fyd.backend.entity.Notification;
import com.fyd.backend.entity.Order;
import com.fyd.backend.entity.OrderItem;
import com.fyd.backend.repository.*;
import com.fyd.backend.service.PointsService;
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

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private PointsService pointsService;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getOrders(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Order> orderPage = null;
        List<Order> orderList = null;
        
        if (customerId != null) {
            // Use eager fetch for customer orders to include items
            orderList = orderRepository.findByCustomerIdWithItems(customerId);
        } else if (status != null && !status.isEmpty() && !status.equals("all")) {
            orderPage = orderRepository.findByStatus(status, pageRequest);
            orderList = orderPage.getContent();
        } else if (!q.isEmpty()) {
            orderPage = orderRepository.search(q, pageRequest);
            orderList = orderPage.getContent();
        } else {
            orderPage = orderRepository.findAll(pageRequest);
            orderList = orderPage.getContent();
        }
        
        // Sort by createdAt descending for customer orders
        if (customerId != null && orderList != null) {
            orderList.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        }
        
        List<OrderDTO> orders = (orderList != null ? orderList : List.<Order>of()).stream()
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
        
        // Handle pagination info - for customer orders we don't have Page object
        if (customerId != null) {
            response.put("currentPage", 0);
            response.put("totalItems", orders.size());
            response.put("totalPages", 1);
        } else {
            response.put("currentPage", orderPage.getNumber());
            response.put("totalItems", orderPage.getTotalElements());
            response.put("totalPages", orderPage.getTotalPages());
        }
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
                
                // If cancelled, set cancelled timestamp
                if ("CANCELLED".equals(status)) {
                    order.setCancelledAt(LocalDateTime.now());
                }
                
                Order saved = orderRepository.save(order);

                // Create notification for status update
                createStatusNotification(saved);

                return ResponseEntity.ok(OrderDTO.fromEntity(saved));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/cancel-request")
    public ResponseEntity<?> requestCancellation(
            @PathVariable Long id,
            @RequestParam String reason) {
        return orderRepository.findById(id)
            .map(order -> {
                // Only allow cancellation request for PENDING orders
                if (!"PENDING".equals(order.getStatus())) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Chỉ có thể yêu cầu hủy đơn hàng đang chờ xử lý"));
                }
                
                order.setStatus("PENDING_CANCEL");
                order.setCancelReason(reason);
                order.setUpdatedAt(LocalDateTime.now());
                Order saved = orderRepository.save(order);

                // Create notification for cancellation request
                Notification notification = new Notification();
                notification.setType("order");
                notification.setPriority("high");
                notification.setTitle("Yêu cầu hủy đơn");
                notification.setDescription("Khách hàng @" + order.getCustomer().getFullName() + " yêu cầu hủy đơn #" + order.getOrderCode());
                notification.setActionType("navigate");
                notification.setActionUrl("/admin/orders");
                notificationRepository.save(notification);

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

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            // 1. Validate customer
            var customer = customerRepository.findById(request.getCustomerId())
                .orElse(null);
            
            if (customer == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Customer not found"));
            }

            // 2. Calculate subtotal and build items list
            BigDecimal subtotal = BigDecimal.ZERO;
            List<OrderItem> items = new java.util.ArrayList<>();

            if (request.getItems() != null) {
                // 2a. First pass: Validate stock for all items
                for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
                    if (itemReq.getVariantId() != null) {
                        var variant = variantRepository.findById(itemReq.getVariantId()).orElse(null);
                        if (variant == null) {
                            return ResponseEntity.badRequest().body(Map.of("error", "Sản phẩm không tồn tại: " + itemReq.getProductName()));
                        }
                        if (variant.getStockQuantity() < itemReq.getQuantity()) {
                            return ResponseEntity.badRequest().body(Map.of("error", 
                                String.format("Sản phẩm '%s' (%s) không đủ hàng. Hiện còn: %d", 
                                    itemReq.getProductName(), itemReq.getVariantInfo(), variant.getStockQuantity())));
                        }
                    }
                }

                // 2b. Second pass: Build items and deduct stock
                for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
                    OrderItem item = new OrderItem();
                    
                    if (itemReq.getProductId() != null) {
                        productRepository.findById(itemReq.getProductId()).ifPresent(item::setProduct);
                    }
                    
                    if (itemReq.getVariantId() != null) {
                        var variant = variantRepository.findById(itemReq.getVariantId()).orElse(null);
                        if (variant != null) {
                            item.setVariant(variant);
                            // Reduce stock
                            int oldStock = variant.getStockQuantity();
                            int newStock = oldStock - itemReq.getQuantity();
                            variant.setStockQuantity(Math.max(0, newStock));
                            variantRepository.save(variant);
                            
                            // Create inventory notification if stock drops below threshold
                            if (newStock <= 6 && oldStock > 6) {
                                Notification inventoryNotif = new Notification();
                                inventoryNotif.setType("inventory");
                                inventoryNotif.setPriority(newStock <= 0 ? "urgent" : "high");
                                inventoryNotif.setTitle(newStock <= 0 ? "Hết hàng" : "Sắp hết hàng");
                                String productName = variant.getProduct().getName() + " - " + 
                                    (variant.getSize() != null ? variant.getSize().getName() : "") + "/" +
                                    (variant.getColor() != null ? variant.getColor().getName() : "");
                                inventoryNotif.setDescription(productName + " còn " + Math.max(0, newStock) + " sản phẩm");
                                inventoryNotif.setActionType("navigate");
                                inventoryNotif.setActionUrl("/admin/inventory");
                                notificationRepository.save(inventoryNotif);
                            }
                        }
                    }
                    
                    item.setProductName(itemReq.getProductName());
                    item.setVariantInfo(itemReq.getVariantInfo());
                    item.setQuantity(itemReq.getQuantity());
                    item.setUnitPrice(itemReq.getUnitPrice());
                    
                    BigDecimal lineTotal = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                    item.setLineTotal(lineTotal);
                    items.add(item);
                    subtotal = subtotal.add(lineTotal);
                }
            }

            // 3. Calculate Discounts
            BigDecimal totalDiscount = BigDecimal.ZERO;

            // 3a. Promotion Discount
            String promoCode = request.getPromotionCode();
            BigDecimal promoDiscount = BigDecimal.ZERO;
            if (promoCode != null && !promoCode.isEmpty()) {
                var promoOpt = promotionRepository.findByCodeIgnoreCase(promoCode);
                if (promoOpt.isPresent() && promoOpt.get().isValid()) {
                    promoDiscount = promoOpt.get().calculateDiscount(subtotal);
                    totalDiscount = totalDiscount.add(promoDiscount);
                    // Update usage count
                    var promo = promoOpt.get();
                    promo.setUsedCount(promo.getUsedCount() + 1);
                    promotionRepository.save(promo);
                }
            }

            // 3b. Tier Discount
            BigDecimal tierDiscount = pointsService.calculateTierDiscount(customer, subtotal);
            totalDiscount = totalDiscount.add(tierDiscount);

            // 3c. Points Discount
            BigDecimal pointsDiscountPrice = BigDecimal.ZERO;
            int pointsUsed = request.getPointsUsed() != null ? request.getPointsUsed() : 0;
            if (pointsUsed > 0) {
                int maxUsable = pointsService.getMaxUsablePoints(customer, subtotal);
                pointsUsed = Math.min(pointsUsed, maxUsable);
                pointsDiscountPrice = pointsService.calculatePointsDiscount(pointsUsed);
                totalDiscount = totalDiscount.add(pointsDiscountPrice);
                // Deduct points from customer
                pointsService.usePoints(customer, pointsUsed);
            }

            // 4. Create and Save Order
            String orderCode = "FYD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + "-" + (int)(Math.random() * 1000);

            Order order = new Order();
            order.setOrderCode(orderCode);
            order.setCustomer(customer);
            order.setStatus("PENDING");
            order.setShippingName(request.getShippingName());
            order.setShippingPhone(request.getShippingPhone());
            order.setShippingProvince(request.getShippingProvince());
            order.setShippingDistrict(request.getShippingDistrict());
            order.setShippingWard(request.getShippingWard());
            order.setShippingAddress(request.getShippingAddress());
            order.setPaymentMethod(request.getPaymentMethod());
            order.setPaymentStatus("PENDING");
            order.setShippingFee(request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO);
            order.setNotes(request.getNotes());
            order.setSubtotal(subtotal);
            order.setDiscountAmount(totalDiscount);
            order.setPromotionCode(promoCode);
            order.setPointsUsed(pointsUsed);
            
            BigDecimal finalAmount = subtotal.add(order.getShippingFee()).subtract(totalDiscount);
            order.setTotalAmount(finalAmount.max(BigDecimal.ZERO));
            
            // Calculate points earned (on final amount)
            int pointsEarned = pointsService.calculatePointsEarned(order.getTotalAmount());
            order.setPointsEarned(pointsEarned);
            
            order.setCreatedAt(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());

            Order savedOrder = orderRepository.save(order);

            // 5. Save items
            for (OrderItem item : items) {
                item.setOrder(savedOrder);
                orderItemRepository.save(item);
            }

            // 6. Update customer balance and points earned
            // Important: pointsEarned is only added when order is COMPLETED? 
            // In many systems it is added now but "pending". 
            // Here we add it immediately for simplicity as requested "mua hàng tới điểm nhất định".
            pointsService.earnPoints(customer, pointsEarned);
            
            // Update other customer stats
            customer.setTotalOrders(customer.getTotalOrders() + 1);
            customer.setTotalSpent(customer.getTotalSpent().add(savedOrder.getTotalAmount()));
            customerRepository.save(customer);

            // 7. Create notification for new order
            Notification notification = new Notification();
            notification.setType("order");
            notification.setPriority("high");
            notification.setTitle("Đơn hàng mới");
            notification.setDescription("Đơn hàng mới #" + orderCode + " từ " + request.getShippingName());
            notification.setActionType("navigate");
            notification.setActionUrl("/admin/orders");
            notificationRepository.save(notification);
            
            return ResponseEntity.ok(OrderDTO.fromEntity(savedOrder));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to create order: " + e.getMessage()));
        }
    }

    private void createStatusNotification(Order order) {
        String status = order.getStatus();
        String title = "";
        String description = "";
        String priority = "medium";

        switch (status) {
            case "CANCELLED":
                title = "Đơn hàng đã hủy";
                description = "Đơn hàng #" + order.getOrderCode() + " đã được hủy";
                priority = "high";
                break;
            case "COMPLETED":
                title = "Đơn hàng hoàn tất";
                description = "Đơn hàng #" + order.getOrderCode() + " đã hoàn tất";
                break;
            // Add other statuses if needed
            default:
                return; // Don't notify for every minor status change if not needed
        }

        Notification notification = new Notification();
        notification.setType("order");
        notification.setPriority(priority);
        notification.setTitle(title);
        notification.setDescription(description);
        notification.setActionType("navigate");
        notification.setActionUrl("/admin/orders");
        notificationRepository.save(notification);
    }
}
