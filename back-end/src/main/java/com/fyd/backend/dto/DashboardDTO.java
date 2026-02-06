package com.fyd.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardDTO {
    private BigDecimal todayRevenue;
    private BigDecimal todayRevenueChange;
    private Long pendingOrders;
    private BigDecimal returnRate;
    private BigDecimal returnRateChange;
    private Long lowStockProducts;
    private List<OrderDTO> recentOrders;
    private List<KpiDTO> kpis;

    public static class KpiDTO {
        private String id;
        private String title;
        private String value;
        private String trendType;
        private String trendLabel;

        public KpiDTO(String id, String title, String value, String trendType, String trendLabel) {
            this.id = id;
            this.title = title;
            this.value = value;
            this.trendType = trendType;
            this.trendLabel = trendLabel;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
        public String getTrendType() { return trendType; }
        public void setTrendType(String trendType) { this.trendType = trendType; }
        public String getTrendLabel() { return trendLabel; }
        public void setTrendLabel(String trendLabel) { this.trendLabel = trendLabel; }
    }

    // Getters and Setters
    public BigDecimal getTodayRevenue() { return todayRevenue; }
    public void setTodayRevenue(BigDecimal todayRevenue) { this.todayRevenue = todayRevenue; }
    public BigDecimal getTodayRevenueChange() { return todayRevenueChange; }
    public void setTodayRevenueChange(BigDecimal todayRevenueChange) { this.todayRevenueChange = todayRevenueChange; }
    public Long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(Long pendingOrders) { this.pendingOrders = pendingOrders; }
    public BigDecimal getReturnRate() { return returnRate; }
    public void setReturnRate(BigDecimal returnRate) { this.returnRate = returnRate; }
    public BigDecimal getReturnRateChange() { return returnRateChange; }
    public void setReturnRateChange(BigDecimal returnRateChange) { this.returnRateChange = returnRateChange; }
    public Long getLowStockProducts() { return lowStockProducts; }
    public void setLowStockProducts(Long lowStockProducts) { this.lowStockProducts = lowStockProducts; }
    public List<OrderDTO> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<OrderDTO> recentOrders) { this.recentOrders = recentOrders; }
    public List<KpiDTO> getKpis() { return kpis; }
    public void setKpis(List<KpiDTO> kpis) { this.kpis = kpis; }
}
