package com.fyd.backend.dto;

import java.time.LocalDateTime;

/**
 * DTO for activity log detail view
 * Includes full data (old_data and new_data)
 */
public class ActivityLogDetailDTO {
    private Long id;
    private ActivityLogDTO.UserBasicDTO user;
    private String action;
    private String entityType;
    private Long entityId;
    private String entityName;
    private String oldData;
    private String newData;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;
    
    public ActivityLogDetailDTO() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public ActivityLogDTO.UserBasicDTO getUser() { return user; }
    public void setUser(ActivityLogDTO.UserBasicDTO user) { this.user = user; }
    
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
