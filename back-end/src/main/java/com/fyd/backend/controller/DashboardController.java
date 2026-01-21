package com.fyd.backend.controller;

import com.fyd.backend.dto.DashboardDTO;
import com.fyd.backend.dto.OrderDTO;
import com.fyd.backend.entity.Order;
import com.fyd.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductVariantRepository variantRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private com.fyd.backend.service.AiInsightService aiInsightService;

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboard() {
        DashboardDTO dashboard = new DashboardDTO();
        
        LocalDateTime todayStart = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime yesterdayStart = todayStart.minusDays(1);
        
        // Today's revenue
        BigDecimal todayRevenue = orderRepository.getRevenueFrom(todayStart);
        if (todayRevenue == null) todayRevenue = BigDecimal.ZERO;
        dashboard.setTodayRevenue(todayRevenue);
        
        // Yesterday's revenue for comparison
        BigDecimal yesterdayRevenue = orderRepository.getRevenueBetween(yesterdayStart, todayStart);
        if (yesterdayRevenue == null || yesterdayRevenue.compareTo(BigDecimal.ZERO) == 0) {
            dashboard.setTodayRevenueChange(BigDecimal.ZERO);
        } else {
            BigDecimal change = todayRevenue.subtract(yesterdayRevenue)
                .divide(yesterdayRevenue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
            dashboard.setTodayRevenueChange(change);
        }
        
        // Pending orders
        dashboard.setPendingOrders(orderRepository.countByStatus("PENDING"));
        
        // Return rate (last 30 days)
        LocalDateTime last30Days = todayStart.minusDays(30);
        Long totalOrders30 = orderRepository.countFrom(last30Days);
        Long returnedOrders30 = orderRepository.countByStatusFrom("RETURNED", last30Days);
        
        if (totalOrders30 > 0) {
            BigDecimal rate = BigDecimal.valueOf(returnedOrders30)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalOrders30), 1, RoundingMode.HALF_UP);
            dashboard.setReturnRate(rate);
        } else {
            dashboard.setReturnRate(BigDecimal.ZERO);
        }
        dashboard.setReturnRateChange(BigDecimal.ZERO); // Baseline comparison would need 60 days of data
        
        // Low stock products
        dashboard.setLowStockProducts((long) variantRepository.findLowStock(6).size());
        
        // Recent orders
        List<Order> recentOrders = orderRepository.findRecentOrders(todayStart.minusDays(7));
        dashboard.setRecentOrders(recentOrders.stream()
            .limit(5)
            .map(OrderDTO::fromEntity)
            .collect(Collectors.toList()));
        
        // KPIs
        NumberFormat vndFormat = NumberFormat.getInstance(new Locale("vi", "VN"));
        List<DashboardDTO.KpiDTO> kpis = new ArrayList<>();
        kpis.add(new DashboardDTO.KpiDTO(
            "Doanh thu hôm nay",
            vndFormat.format(todayRevenue) + "₫",
            dashboard.getTodayRevenueChange().compareTo(BigDecimal.ZERO) >= 0 ? "up" : "down",
            (dashboard.getTodayRevenueChange().compareTo(BigDecimal.ZERO) >= 0 ? "+" : "") 
                + dashboard.getTodayRevenueChange().setScale(1, RoundingMode.HALF_UP) + "%"
        ));
        kpis.add(new DashboardDTO.KpiDTO(
            "Đơn chờ xử lý",
            String.valueOf(dashboard.getPendingOrders()),
            "warn",
            "Ưu tiên"
        ));
        kpis.add(new DashboardDTO.KpiDTO(
            "Tỉ lệ hoàn",
            dashboard.getReturnRate() + "%",
            "down",
            dashboard.getReturnRateChange() + "%"
        ));
        kpis.add(new DashboardDTO.KpiDTO(
            "Sản phẩm sắp hết",
            String.valueOf(dashboard.getLowStockProducts()),
            "warn",
            "Cảnh báo"
        ));
        dashboard.setKpis(kpis);
        
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenue(@RequestParam(defaultValue = "7") int days) {
        LocalDateTime from = LocalDateTime.now().minusDays(days).with(LocalTime.MIN);
        
        // Get daily revenue
        List<Object[]> dailyRevenue = orderRepository.getDailyRevenue(from);
        List<Map<String, Object>> chartData = new ArrayList<>();
        
        for (Object[] row : dailyRevenue) {
            Map<String, Object> point = new HashMap<>();
            point.put("date", row[0].toString());
            point.put("value", row[1] != null ? ((Number) row[1]).longValue() : 0);
            chartData.add(point);
        }
        
        // Get top products
        List<Object[]> topProducts = orderItemRepository.getTopProductsByRevenueFrom(from);
        List<Map<String, Object>> topProductsData = new ArrayList<>();
        
        int limit = Math.min(6, topProducts.size());
        for (int i = 0; i < limit; i++) {
            Object[] row = topProducts.get(i);
            Map<String, Object> product = new HashMap<>();
            product.put("id", row[0]);
            product.put("name", row[1]);
            product.put("qty", ((Number) row[2]).intValue());
            product.put("revenue", ((Number) row[3]).longValue());
            topProductsData.add(product);
        }
        
        // Stats
        BigDecimal totalRevenue = orderRepository.getRevenueFrom(from);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        
        Long completedCount = orderRepository.countByStatus("DELIVERED") + orderRepository.countByStatus("COMPLETED");
        Long shippingCount = orderRepository.countByStatus("SHIPPING");
        Long pendingCount = orderRepository.countByStatus("PENDING");
        
        Map<String, Object> response = new HashMap<>();
        response.put("chartData", chartData);
        response.put("topProducts", topProductsData);
        response.put("totalRevenue", totalRevenue);
        response.put("completedOrders", completedCount);
        response.put("shippingOrders", shippingCount);
        response.put("pendingOrders", pendingCount);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ai-suggestions")
    public ResponseEntity<List<com.fyd.backend.dto.AiInsight>> getAiSuggestions() {
        List<com.fyd.backend.dto.AiInsight> insights = aiInsightService.generateAllInsights();
        return ResponseEntity.ok(insights);
    }
    
    @PostMapping("/ai-action/apply")
    public ResponseEntity<com.fyd.backend.dto.AiActionResult> applyAiAction(
            @RequestBody Map<String, Object> request) {
        
        String insightId = request.get("insightId") != null ? request.get("insightId").toString() : "";
        String category = request.get("category") != null ? request.get("category").toString() : "";
        
        @SuppressWarnings("unchecked")
        Map<String, Object> data = request.get("data") != null 
            ? (Map<String, Object>) request.get("data") 
            : new HashMap<>();
        
        // Route to appropriate action handler based on category
        com.fyd.backend.dto.AiActionResult result;
        
        if ("inventory_warning".equals(category)) {
            result = aiInsightService.applyInventoryAction(insightId, data);
        } else {
            // Default fallback for other categories
            result = com.fyd.backend.dto.AiActionResult.builder()
                .success(true)
                .title("Hành động đã ghi nhận")
                .summary("Gợi ý đã được ghi nhận. Vui lòng thực hiện thủ công các bước tiếp theo.")
                .reasoning("Hành động tự động cho danh mục này chưa được hỗ trợ đầy đủ.")
                .timestamp(java.time.LocalDateTime.now())
                .build();
        }
        
        return ResponseEntity.ok(result);
    }
}
