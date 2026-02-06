package com.fyd.backend.dto;

public class ProfileStatsDTO {
    private Long todayOrders;
    private Long todayProducts;
    private Long todayCustomers;

    public ProfileStatsDTO() {}

    public ProfileStatsDTO(Long todayOrders, Long todayProducts, Long todayCustomers) {
        this.todayOrders = todayOrders;
        this.todayProducts = todayProducts;
        this.todayCustomers = todayCustomers;
    }

    public Long getTodayOrders() { return todayOrders; }
    public void setTodayOrders(Long todayOrders) { this.todayOrders = todayOrders; }

    public Long getTodayProducts() { return todayProducts; }
    public void setTodayProducts(Long todayProducts) { this.todayProducts = todayProducts; }

    public Long getTodayCustomers() { return todayCustomers; }
    public void setTodayCustomers(Long todayCustomers) { this.todayCustomers = todayCustomers; }
}
