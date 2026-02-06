package com.fyd.backend.dto;

import java.time.LocalDateTime;

/**
 * DTO for activity log list view
 */
public class ActivityLogDTO {
    private Long id;
    private UserBasicDTO user;
    private String action;
    private String entityType;
    private Long entityId;
    private String entityName;
    private LocalDateTime createdAt;
    
    public ActivityLogDTO() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public UserBasicDTO getUser() { return user; }
    public void setUser(UserBasicDTO user) { this.user = user; }
    
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    
    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
    
    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    /**
     * Nested DTO for user basic info
     */
    public static class UserBasicDTO {
        private Long id;
        private String fullName;
        private String email;
        private String avatarUrl;
        
        public UserBasicDTO() {}
        
        public UserBasicDTO(Long id, String fullName, String email, String avatarUrl) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
            this.avatarUrl = avatarUrl;
        }
        
        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }
}
