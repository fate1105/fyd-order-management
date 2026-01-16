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
        
        // Return rate (mock for now)
        dashboard.setReturnRate(BigDecimal.valueOf(1.7));
        dashboard.setReturnRateChange(BigDecimal.valueOf(-0.3));
        
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
            point.put("value", row[1] != null ? ((BigDecimal) row[1]).longValue() : 0);
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
            product.put("revenue", ((BigDecimal) row[3]).longValue());
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
}
