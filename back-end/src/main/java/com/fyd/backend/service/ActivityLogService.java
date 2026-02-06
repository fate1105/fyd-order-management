package com.fyd.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fyd.backend.entity.ActivityLog;
import com.fyd.backend.entity.User;
import com.fyd.backend.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for managing activity logs
 * Provides async logging and query methods
 */
@Service
public class ActivityLogService {
    
    @Autowired
    private ActivityLogRepository activityLogRepository;
    
    private final ObjectMapper objectMapper;
    
    public ActivityLogService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
    
    /**
     * Log an activity asynchronously
     * This method runs in a separate thread to avoid blocking the main request
     */
    @Async
    public void logActivity(
        User user,
        String action,
        String entityType,
        Long entityId,
        String entityName,
        Object oldData,
        Object newData,
        String ipAddress,
        String userAgent
    ) {
        try {
            ActivityLog log = new ActivityLog();
            log.setUser(user);
            log.setAction(action);
            log.setEntityType(entityType);
            log.setEntityId(entityId);
            log.setEntityName(entityName);
            
            // Serialize data to JSON, excluding sensitive fields
            if (oldData != null) {
                log.setOldData(serializeData(oldData));
            }
            if (newData != null) {
                log.setNewData(serializeData(newData));
            }
            
            log.setIpAddress(ipAddress);
            log.setUserAgent(userAgent);
            log.setCreatedAt(LocalDateTime.now());
            
            activityLogRepository.save(log);
        } catch (Exception e) {
            // Log error but don't throw - we don't want logging to break the main flow
            System.err.println("Failed to log activity: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Get activity logs with filters and pagination
     */
    public Page<ActivityLog> getLogs(
        Long userId,
        String action,
        String entityType,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Pageable pageable
    ) {
        return activityLogRepository.findWithFilters(
            userId, action, entityType, startDate, endDate, pageable
        );
    }
    
    /**
     * Get a single activity log by ID
     */
    public ActivityLog getLogDetail(Long id) {
        return activityLogRepository.findById(id).orElse(null);
    }
    
    /**
     * Serialize object to JSON string, excluding sensitive fields
     */
    private String serializeData(Object data) {
        try {
            if (data == null) {
                return null;
            }
            
            // If it's already a string, return as is
            if (data instanceof String) {
                return (String) data;
            }
            
            // Convert to Map to filter sensitive fields
            @SuppressWarnings("unchecked")
            Map<String, Object> dataMap = objectMapper.convertValue(data, Map.class);
            
            // Remove sensitive fields
            Map<String, Object> filtered = new HashMap<>(dataMap);
            filtered.remove("password");
            filtered.remove("passwordHash");
            filtered.remove("token");
            filtered.remove("accessToken");
            filtered.remove("refreshToken");
            
            return objectMapper.writeValueAsString(filtered);
        } catch (Exception e) {
            System.err.println("Failed to serialize data: " + e.getMessage());
            return null;
        }
    }
}
