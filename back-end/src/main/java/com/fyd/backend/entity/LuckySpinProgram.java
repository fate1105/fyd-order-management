package com.fyd.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity for lucky_spin_programs table.
 * Represents a Lucky Spin campaign/program.
 */
@Entity
@Table(name = "lucky_spin_programs")
public class LuckySpinProgram {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "daily_free_spins")
    private Integer dailyFreeSpins = 1;

    @Column(name = "points_per_spin")
    private Integer pointsPerSpin = 50;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Check if program is currently active and within date range
     */
    public boolean isCurrentlyActive() {
        if (!isActive) return false;
        
        LocalDateTime now = LocalDateTime.now();
        return now.isAfter(startDate) && now.isBefore(endDate);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    
    public Integer getDailyFreeSpins() { return dailyFreeSpins; }
    public void setDailyFreeSpins(Integer dailyFreeSpins) { this.dailyFreeSpins = dailyFreeSpins; }
    
    public Integer getPointsPerSpin() { return pointsPerSpin; }
    public void setPointsPerSpin(Integer pointsPerSpin) { this.pointsPerSpin = pointsPerSpin; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
