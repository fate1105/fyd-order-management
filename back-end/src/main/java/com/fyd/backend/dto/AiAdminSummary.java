package com.fyd.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public class AiAdminSummary {
    private String summaryText;
    private BigDecimal todayRevenue;
    private int todayOrders;
    private int pendingOrders;
    private String revenueChange;
    private List<String> topProducts;
    private List<String> inventoryAlerts;

    public String getSummaryText() {
        return summaryText;
    }

    public void setSummaryText(String summaryText) {
        this.summaryText = summaryText;
    }

    public BigDecimal getTodayRevenue() {
        return todayRevenue;
    }

    public void setTodayRevenue(BigDecimal todayRevenue) {
        this.todayRevenue = todayRevenue;
    }

    public int getTodayOrders() {
        return todayOrders;
    }

    public void setTodayOrders(int todayOrders) {
        this.todayOrders = todayOrders;
    }

    public int getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(int pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public String getRevenueChange() {
        return revenueChange;
    }

    public void setRevenueChange(String revenueChange) {
        this.revenueChange = revenueChange;
    }

    public List<String> getTopProducts() {
        return topProducts;
    }

    public void setTopProducts(List<String> topProducts) {
        this.topProducts = topProducts;
    }

    public List<String> getInventoryAlerts() {
        return inventoryAlerts;
    }

    public void setInventoryAlerts(List<String> inventoryAlerts) {
        this.inventoryAlerts = inventoryAlerts;
    }
}
