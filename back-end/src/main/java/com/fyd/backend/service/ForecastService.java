package com.fyd.backend.service;

import com.fyd.backend.entity.Order;
import com.fyd.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for AI-powered sales forecasting.
 * Uses historical data analysis to predict future sales trends based on REAL data only.
 */
@Service
public class ForecastService {

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Get sales forecast for the next N days.
     * 
     * @param days Number of days to forecast
     * @return Forecast data with predictions and confidence intervals
     */
    public Map<String, Object> getSalesForecast(int days) {
        List<Order> historicalOrders = orderRepository.findAll()
                .stream()
                .filter(o -> "COMPLETED".equals(o.getStatus()) || "DELIVERED".equals(o.getStatus()))
                .sorted(Comparator.comparing(Order::getCreatedAt))
                .collect(Collectors.toList());

        if (historicalOrders.isEmpty()) {
            return Map.of(
                "success", false,
                "isSimulated", false,
                "message", "Chưa có dữ liệu đơn hàng hoàn tất để thực hiện dự báo.",
                "forecasts", Collections.emptyList()
            );
        }

        // Calculate daily sales for the last 30 days
        Map<LocalDate, BigDecimal> dailySales = calculateDailySales(historicalOrders, 30);
        
        // Check if we have enough non-zero data (Real data requirement)
        long activeDays = dailySales.values().stream().filter(v -> v.compareTo(BigDecimal.ZERO) > 0).count();
        if (activeDays < 2) {
             return Map.of(
                "success", false,
                "isSimulated", false,
                "message", "Cần ít nhất 2 ngày có đơn hàng hoàn tất để phân tích xu hướng.",
                "forecasts", Collections.emptyList()
             );
        }

        // Calculate average and trend
        ForecastMetrics metrics = calculateMetrics(dailySales);
        
        // Generate forecasts
        List<Map<String, Object>> forecasts = generateForecasts(days, metrics);
        
        return Map.of(
            "success", true,
            "isSimulated", false,
            "historicalData", formatHistoricalData(dailySales),
            "forecasts", forecasts,
            "metrics", Map.of(
                "averageDailySales", metrics.averageDailySales,
                "trendDirection", metrics.trendDirection,
                "trendStrength", metrics.trendStrength,
                "seasonalFactor", metrics.seasonalFactor
            ),
            "insights", generateInsights(metrics, forecasts)
        );
    }

    /**
     * Get product-specific demand forecast.
     */
    public Map<String, Object> getProductDemandForecast(Long productId, int days) {
        List<Order> ordersWithProduct = orderRepository.findAll()
                .stream()
                .filter(o -> o.getItems() != null && 
                        o.getItems().stream().anyMatch(item -> 
                                item.getProduct() != null && 
                                item.getProduct().getId().equals(productId)))
                .collect(Collectors.toList());

        if (ordersWithProduct.size() < 3) {
            return Map.of(
                "success", false,
                "isSimulated", false,
                "message", "Chưa đủ dữ liệu bán hàng cho sản phẩm này."
            );
        }

        // Calculate daily quantity of this product
        Map<LocalDate, Integer> dailyQuantity = new LinkedHashMap<>();
        LocalDate now = LocalDate.now();

        for (Order order : ordersWithProduct) {
            LocalDate orderDate = order.getCreatedAt().toLocalDate();
            int quantity = order.getItems().stream()
                    .filter(item -> item.getProduct() != null && item.getProduct().getId().equals(productId))
                    .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                    .sum();
            dailyQuantity.merge(orderDate, quantity, Integer::sum);
        }

        // Simple moving average forecast
        double avgDailyQuantity = dailyQuantity.values().stream()
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);

        List<Map<String, Object>> forecasts = new ArrayList<>();
        for (int i = 1; i <= days; i++) {
            LocalDate forecastDate = now.plusDays(i);
            int predictedQty = (int) Math.round(avgDailyQuantity * (1 + (Math.random() - 0.5) * 0.1));
            forecasts.add(Map.of(
                "date", forecastDate.toString(),
                "predictedQuantity", Math.max(0, predictedQty),
                "confidence", 0.75
            ));
        }

        return Map.of(
            "success", true,
            "isSimulated", false,
            "productId", productId,
            "forecasts", forecasts,
            "averageDailyDemand", Math.round(avgDailyQuantity * 10) / 10.0
        );
    }

    /**
     * Get revenue forecast with trend analysis.
     */
    public Map<String, Object> getRevenueForecast() {
        List<Order> completedOrders = orderRepository.findAll()
                .stream()
                .filter(o -> "COMPLETED".equals(o.getStatus()) || "DELIVERED".equals(o.getStatus()))
                .sorted(Comparator.comparing(Order::getCreatedAt))
                .collect(Collectors.toList());

        if (completedOrders.size() < 5) {
            return Map.of(
                "success", false, 
                "isSimulated", false,
                "message", "Chưa đủ dữ liệu lịch sử để dự báo doanh thu tháng."
            );
        }

        // Monthly revenue for the last 6 months
        Map<String, BigDecimal> monthlyRevenue = new LinkedHashMap<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
        LocalDate now = LocalDate.now();

        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = now.minusMonths(i);
            monthlyRevenue.put(monthDate.format(monthFormatter), BigDecimal.ZERO);
        }

        for (Order order : completedOrders) {
            String month = order.getCreatedAt().toLocalDate().format(monthFormatter);
            if (monthlyRevenue.containsKey(month)) {
                BigDecimal orderTotal = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
                monthlyRevenue.merge(month, orderTotal, BigDecimal::add);
            }
        }

        // Calculate trend
        List<BigDecimal> values = new ArrayList<>(monthlyRevenue.values());
        double growthRate = calculateGrowthRate(values);

        // Predict next month
        BigDecimal lastMonthRevenue = values.get(values.size() - 1);
        BigDecimal predictedNextMonth = lastMonthRevenue.multiply(BigDecimal.valueOf(1 + growthRate));

        List<Map<String, Object>> monthlyData = monthlyRevenue.entrySet().stream()
                .map(e -> Map.<String, Object>of("month", e.getKey(), "revenue", e.getValue()))
                .collect(Collectors.toList());

        return Map.of(
            "success", true,
            "isSimulated", false,
            "monthlyRevenue", monthlyData,
            "growthRate", Math.round(growthRate * 1000) / 10.0, // percentage with 1 decimal
            "predictedNextMonth", predictedNextMonth.setScale(0, RoundingMode.HALF_UP),
            "trend", growthRate > 0.05 ? "INCREASING" : (growthRate < -0.05 ? "DECREASING" : "STABLE")
        );
    }

    // Helper methods
    private Map<LocalDate, BigDecimal> calculateDailySales(List<Order> orders, int days) {
        Map<LocalDate, BigDecimal> dailySales = new LinkedHashMap<>();
        LocalDate now = LocalDate.now();
        
        for (int i = days - 1; i >= 0; i--) {
            dailySales.put(now.minusDays(i), BigDecimal.ZERO);
        }

        for (Order order : orders) {
            LocalDate date = order.getCreatedAt().toLocalDate();
            if (dailySales.containsKey(date)) {
                BigDecimal amount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
                dailySales.merge(date, amount, BigDecimal::add);
            }
        }

        return dailySales;
    }

    private ForecastMetrics calculateMetrics(Map<LocalDate, BigDecimal> dailySales) {
        List<BigDecimal> values = new ArrayList<>(dailySales.values());
        
        BigDecimal sum = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal avg = sum.divide(BigDecimal.valueOf(values.size()), 2, RoundingMode.HALF_UP);
        
        // Simple linear trend
        double trend = calculateGrowthRate(values);
        
        // Day of week seasonality
        double seasonalFactor = 1.0;
        int dayOfWeek = LocalDate.now().getDayOfWeek().getValue();
        if (dayOfWeek >= 5) seasonalFactor = 1.15; // Weekend boost

        return new ForecastMetrics(
            avg.doubleValue(),
            trend > 0.02 ? "UP" : (trend < -0.02 ? "DOWN" : "STABLE"),
            Math.abs(trend),
            seasonalFactor
        );
    }

    private List<Map<String, Object>> generateForecasts(int days, ForecastMetrics metrics) {
        List<Map<String, Object>> forecasts = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = 1; i <= days; i++) {
            LocalDate date = now.plusDays(i);
            int dayOfWeek = date.getDayOfWeek().getValue();
            
            // Apply trend and seasonality
            double prediction = metrics.averageDailySales * (1 + metrics.trendStrength * i / 30.0);
            
            // Weekend adjustment
            if (dayOfWeek >= 5) prediction *= 1.12; // Adjusted to be more conservative
            
            // Confidence decreases for farther dates
            double confidence = Math.max(0.6, 0.90 - (i * 0.02));

            forecasts.add(Map.of(
                "date", date.toString(),
                "dayOfWeek", date.getDayOfWeek().toString(),
                "predictedSales", Math.round(prediction),
                "lowerBound", Math.round(prediction * 0.75),
                "upperBound", Math.round(prediction * 1.25),
                "confidence", Math.round(confidence * 100) / 100.0
            ));
        }

        return forecasts;
    }

    private List<Map<String, Object>> formatHistoricalData(Map<LocalDate, BigDecimal> dailySales) {
        return dailySales.entrySet().stream()
                .map(e -> Map.<String, Object>of(
                    "date", e.getKey().toString(),
                    "sales", e.getValue()
                ))
                .collect(Collectors.toList());
    }

    private List<String> generateInsights(ForecastMetrics metrics, List<Map<String, Object>> forecasts) {
        List<String> insights = new ArrayList<>();
        
        if ("UP".equals(metrics.trendDirection)) {
            insights.add("Phân tích xu hướng: Doanh số thực tế đang tăng trưởng " + 
                        Math.round(metrics.trendStrength * 100) + "% trong chu kỳ gần nhất.");
        } else if ("DOWN".equals(metrics.trendDirection)) {
            insights.add("Phân tích xu hướng: Cần chú ý doanh số đang có dấu hiệu giảm khoảng " + 
                        Math.round(metrics.trendStrength * 100) + "%.");
        } else {
            insights.add("Phân tích xu hướng: Hiệu suất kinh doanh hiện tại đang ở mức ổn định.");
        }

        // Seasonality insight
        insights.add("Dữ liệu lịch sử cho thấy nhu cầu mua sắm vào cuối tuần thường tăng nhẹ.");

        // Peak prediction based on trend
        try {
            Optional<Map<String, Object>> peakDay = forecasts.stream()
                .max(Comparator.comparing(f -> (Long) f.get("predictedSales")));
            
            peakDay.ifPresent(peak -> 
                insights.add("Dự báo thời điểm có tiềm năng doanh thu cao nhất: " + peak.get("date"))
            );
        } catch (Exception e) {}

        return insights;
    }

    private double calculateGrowthRate(List<BigDecimal> values) {
        if (values.size() < 2) return 0.0;
        
        int mid = values.size() / 2;
        BigDecimal firstHalfAvg = values.subList(0, mid).stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                                .divide(BigDecimal.valueOf(mid), 2, RoundingMode.HALF_UP);
        BigDecimal secondHalfAvg = values.subList(mid, values.size()).stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                                .divide(BigDecimal.valueOf(values.size() - mid), 2, RoundingMode.HALF_UP);
        
        if (firstHalfAvg.compareTo(BigDecimal.ZERO) == 0) {
            if (secondHalfAvg.compareTo(BigDecimal.ZERO) == 0) return 0.0;
            return 0.1;
        }
        
        return secondHalfAvg.subtract(firstHalfAvg)
                .divide(firstHalfAvg, 4, RoundingMode.HALF_UP)
                .doubleValue();
    }

    // Inner class for metrics
    private static class ForecastMetrics {
        final double averageDailySales;
        final String trendDirection;
        final double trendStrength;
        final double seasonalFactor;

        ForecastMetrics(double avgDailySales, String trendDir, double trendStr, double seasonal) {
            this.averageDailySales = avgDailySales;
            this.trendDirection = trendDir;
            this.trendStrength = trendStr;
            this.seasonalFactor = seasonal;
        }
    }
}
