package com.fyd.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity for lucky_spin_history table.
 * Tracks customer spin history for daily limit enforcement.
 */
@Entity
@Table(name = "lucky_spin_history")
public class LuckySpinHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    private LuckySpinProgram program;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_id", nullable = false)
    private LuckySpinReward reward;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    private CustomerCoupon coupon; // NULL if NO_REWARD

    @Column(name = "spin_type", length = 20)
    private String spinType = "FREE"; // FREE, POINTS_EXCHANGE

    @Column(name = "points_used")
    private Integer pointsUsed = 0;

    @Column(name = "spin_date", nullable = false)
    private LocalDate spinDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (spinDate == null) {
            spinDate = LocalDate.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public LuckySpinProgram getProgram() { return program; }
    public void setProgram(LuckySpinProgram program) { this.program = program; }

    public LuckySpinReward getReward() { return reward; }
    public void setReward(LuckySpinReward reward) { this.reward = reward; }

    public CustomerCoupon getCoupon() { return coupon; }
    public void setCoupon(CustomerCoupon coupon) { this.coupon = coupon; }

    public String getSpinType() { return spinType; }
    public void setSpinType(String spinType) { this.spinType = spinType; }

    public Integer getPointsUsed() { return pointsUsed; }
    public void setPointsUsed(Integer pointsUsed) { this.pointsUsed = pointsUsed; }

    public LocalDate getSpinDate() { return spinDate; }
    public void setSpinDate(LocalDate spinDate) { this.spinDate = spinDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
