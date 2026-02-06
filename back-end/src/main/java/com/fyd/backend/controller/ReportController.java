package com.fyd.backend.controller;

import com.fyd.backend.entity.Order;
import com.fyd.backend.entity.ProductVariant;
import com.fyd.backend.repository.OrderRepository;
import com.fyd.backend.repository.ProductVariantRepository;
import com.fyd.backend.service.ExcelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ExcelService excelService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    private static final DateTimeFormatter FILENAME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Export Orders Report
     */
    @GetMapping("/orders/export")
    public ResponseEntity<byte[]> exportOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        try {
            List<Order> orders;
            
            if (status != null && !status.isEmpty()) {
                orders = orderRepository.findByStatus(status);
            } else {
                orders = orderRepository.findAll();
            }
            
            // Filter by date range if provided
            if (from != null || to != null) {
                LocalDateTime fromDate = from != null ? LocalDate.parse(from).atStartOfDay() : LocalDateTime.MIN;
                LocalDateTime toDate = to != null ? LocalDate.parse(to).atTime(23, 59, 59) : LocalDateTime.MAX;
                
                orders = orders.stream()
                    .filter(o -> {
                        LocalDateTime created = o.getCreatedAt();
                        return created != null && !created.isBefore(fromDate) && !created.isAfter(toDate);
                    })
                    .toList();
            }
            
            List<Map<String, Object>> data = orders.stream()
                .map(this::orderToMap)
                .toList();
            
            String title = "Báo cáo đơn hàng" + (status != null ? " - " + translateStatus(status) : "");
            byte[] excelBytes = excelService.generateOrdersReport(data, title);
            
            String filename = "don-hang-" + LocalDate.now().format(FILENAME_FORMAT) + ".xlsx";
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelBytes);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Export Revenue Report
     */
    @GetMapping("/revenue/export")
    public ResponseEntity<byte[]> exportRevenue(
            @RequestParam(defaultValue = "30") int days) {
        try {
            LocalDateTime fromDate = LocalDateTime.now().minusDays(days);
            
            // Get daily revenue
            List<Object[]> dailyData = orderRepository.getDailyRevenue(fromDate);
            List<Map<String, Object>> dailyList = dailyData.stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", row[0] != null ? row[0].toString() : "");
                    map.put("revenue", row[1] != null ? ((Number) row[1]).doubleValue() : 0);
                    // Count orders per day would need another query, skip for now
                    map.put("orders", 0);
                    return map;
                })
                .toList();
            
            // Summary
            BigDecimal totalRevenue = orderRepository.getRevenueFrom(fromDate);
            Long totalOrders = orderRepository.countFrom(fromDate);
            
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalRevenue", totalRevenue != null ? totalRevenue.doubleValue() : 0);
            summary.put("totalOrders", totalOrders != null ? totalOrders : 0);
            
            byte[] excelBytes = excelService.generateRevenueReport(dailyList, summary);
            
            String filename = "doanh-thu-" + days + "-ngay-" + LocalDate.now().format(FILENAME_FORMAT) + ".xlsx";
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelBytes);
                
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Export Inventory Report
     */
    @GetMapping("/inventory/export")
    public ResponseEntity<byte[]> exportInventory(
            @RequestParam(required = false) Boolean lowStock) {
        try {
            List<ProductVariant> variants = productVariantRepository.findAll();
            
            // Filter low stock if requested
            if (Boolean.TRUE.equals(lowStock)) {
                variants = variants.stream()
                    .filter(v -> v.getStockQuantity() != null && v.getStockQuantity() < 10)
                    .toList();
            }
            
            List<Map<String, Object>> data = variants.stream()
                .map(this::variantToMap)
                .toList();
            
            byte[] excelBytes = excelService.generateInventoryReport(data);
            
            String filename = "ton-kho-" + LocalDate.now().format(FILENAME_FORMAT) + ".xlsx";
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelBytes);
                
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // ============ HELPERS ============

    private Map<String, Object> orderToMap(Order order) {
        Map<String, Object> map = new HashMap<>();
        map.put("orderCode", order.getOrderCode());
        map.put("customerName", order.getShippingName());
        map.put("shippingPhone", order.getShippingPhone());
        map.put("totalAmount", order.getTotalAmount());
        map.put("status", order.getStatus());
        map.put("createdAt", order.getCreatedAt());
        map.put("shippingAddress", buildAddress(order));
        return map;
    }

    private String buildAddress(Order order) {
        StringBuilder sb = new StringBuilder();
        if (order.getShippingAddress() != null) sb.append(order.getShippingAddress());
        if (order.getShippingWard() != null) sb.append(", ").append(order.getShippingWard());
        if (order.getShippingDistrict() != null) sb.append(", ").append(order.getShippingDistrict());
        if (order.getShippingProvince() != null) sb.append(", ").append(order.getShippingProvince());
        return sb.toString();
    }

    private Map<String, Object> variantToMap(ProductVariant variant) {
        Map<String, Object> map = new HashMap<>();
        map.put("sku", variant.getSkuVariant());
        map.put("productName", variant.getProduct() != null ? variant.getProduct().getName() : "");
        
        String variantName = "";
        if (variant.getColor() != null) variantName += variant.getColor().getName();
        if (variant.getSize() != null) variantName += (variantName.isEmpty() ? "" : " / ") + variant.getSize().getName();
        map.put("variant", variantName);
        
        map.put("quantity", variant.getStockQuantity() != null ? variant.getStockQuantity() : 0);
        return map;
    }

    private String translateStatus(String status) {
        if (status == null) return "";
        return switch (status) {
            case "PENDING" -> "Chờ xử lý";
            case "CONFIRMED" -> "Đã xác nhận";
            case "PROCESSING" -> "Đang xử lý";
            case "SHIPPING" -> "Đang giao";
            case "DELIVERED" -> "Đã giao";
            case "COMPLETED" -> "Hoàn thành";
            case "CANCELLED" -> "Đã hủy";
            default -> status;
        };
    }
}
