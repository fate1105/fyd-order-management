package com.fyd.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Entity representing an activity log entry for audit trail
 * Tracks all important CRUD operations performed by users
 */
@Entity
@Table(name = "activity_logs", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_entity", columnList = "entity_type, entity_id"),
    @Index(name = "idx_created_at", columnList = "created_at"),
    @Index(name = "idx_action", columnList = "action")
})
public class ActivityLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false, length = 20)
    private String action; // CREATE, UPDATE, DELETE, LOGIN, LOGOUT
    
    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType; // Product, Order, Customer, User, etc.
    
    @Column(name = "entity_id")
    private Long entityId;
    
    @Column(name = "entity_name", length = 255)
    private String entityName;
    
    @Column(name = "old_data", columnDefinition = "JSON")
    private String oldData;
    
    @Column(name = "new_data", columnDefinition = "JSON")
    private String newData;
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(name = "user_agent", length = 500)
    private String userAgent;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    
    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
    
    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }
    
    public String getOldData() { return oldData; }
    public void setOldData(String oldData) { this.oldData = oldData; }
    
    public String getNewData() { return newData; }
    public void setNewData(String newData) { this.newData = newData; }
    
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
