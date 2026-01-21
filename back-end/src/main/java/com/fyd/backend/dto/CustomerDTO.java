package com.fyd.backend.dto;

import com.fyd.backend.entity.Customer;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CustomerDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private String gender;
    private String tier;
    private Long tierId;
    private BigDecimal totalSpent;
    private Integer totalOrders;
    private Integer points;
    private String status;
    private LocalDateTime createdAt;

    public static CustomerDTO fromEntity(Customer c) {
        if (c == null) {
            return null;
        }
        
        CustomerDTO dto = new CustomerDTO();
        dto.setId(c.getId());
        dto.setEmail(c.getEmail());
        dto.setFullName(c.getFullName());
        dto.setPhone(c.getPhone());
        dto.setAvatarUrl(c.getAvatarUrl());
        dto.setGender(c.getGender());
        
        // Safely handle tier
        try {
            if (c.getTier() != null) {
                dto.setTier(c.getTier().getName());
                dto.setTierId(c.getTier().getId());
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not load tier for customer " + c.getId() + ": " + e.getMessage());
            dto.setTier(null);
            dto.setTierId(null);
        }
        
        dto.setTotalSpent(c.getTotalSpent() != null ? c.getTotalSpent() : BigDecimal.ZERO);
        dto.setTotalOrders(c.getTotalOrders() != null ? c.getTotalOrders() : 0);
        dto.setPoints(c.getPoints() != null ? c.getPoints() : 0);
        dto.setStatus(c.getStatus());
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }
    public Long getTierId() { return tierId; }
    public void setTierId(Long tierId) { this.tierId = tierId; }
    public BigDecimal getTotalSpent() { return totalSpent; }
    public void setTotalSpent(BigDecimal totalSpent) { this.totalSpent = totalSpent; }
    public Integer getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Integer totalOrders) { this.totalOrders = totalOrders; }
    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
