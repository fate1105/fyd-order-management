package com.fyd.backend.controller;

import com.fyd.backend.dto.ActivityLogDTO;
import com.fyd.backend.dto.ActivityLogDetailDTO;
import com.fyd.backend.entity.ActivityLog;
import com.fyd.backend.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for activity log endpoints
 * Provides access to audit trail data
 */
@RestController
@RequestMapping("/api/activity-logs")
@CrossOrigin(origins = "*")
public class ActivityLogController {
    
    @Autowired
    private ActivityLogService activityLogService;
    
    /**
     * Get activity logs with filters and pagination
     * GET /api/activity-logs
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getLogs(
        @RequestParam(required = false) Long userId,
        @RequestParam(required = false) String action,
        @RequestParam(required = false) String entityType,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        try {
            // Create pageable with sort by createdAt descending
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            
            // Get logs from service
            Page<ActivityLog> logsPage = activityLogService.getLogs(
                userId, action, entityType, startDate, endDate, pageable
            );
            
            // Convert to DTOs
            Page<ActivityLogDTO> dtoPage = logsPage.map(this::convertToDTO);
            
            return ResponseEntity.ok(dtoPage);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch activity logs: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /**
     * Get activity log detail by ID
     * GET /api/activity-logs/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getLogDetail(@PathVariable Long id) {
        try {
            ActivityLog log = activityLogService.getLogDetail(id);
            
            if (log == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Activity log not found");
                return ResponseEntity.notFound().build();
            }
            
            ActivityLogDetailDTO dto = convertToDetailDTO(log);
            return ResponseEntity.ok(dto);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch activity log detail: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /**
     * Convert ActivityLog entity to DTO
     */
    private ActivityLogDTO convertToDTO(ActivityLog log) {
        ActivityLogDTO dto = new ActivityLogDTO();
        dto.setId(log.getId());
        dto.setAction(log.getAction());
        dto.setEntityType(log.getEntityType());
        dto.setEntityId(log.getEntityId());
        dto.setEntityName(log.getEntityName());
        dto.setCreatedAt(log.getCreatedAt());
        
        // Convert user info
        if (log.getUser() != null) {
            ActivityLogDTO.UserBasicDTO userDTO = new ActivityLogDTO.UserBasicDTO(
                log.getUser().getId(),
                log.getUser().getFullName(),
                log.getUser().getEmail(),
                log.getUser().getAvatarUrl()
            );
            dto.setUser(userDTO);
        }
        
        return dto;
    }
    
    /**
     * Convert ActivityLog entity to detail DTO
     */
    private ActivityLogDetailDTO convertToDetailDTO(ActivityLog log) {
        ActivityLogDetailDTO dto = new ActivityLogDetailDTO();
        dto.setId(log.getId());
        dto.setAction(log.getAction());
        dto.setEntityType(log.getEntityType());
        dto.setEntityId(log.getEntityId());
        dto.setEntityName(log.getEntityName());
        dto.setOldData(log.getOldData());
        dto.setNewData(log.getNewData());
        dto.setIpAddress(log.getIpAddress());
        dto.setUserAgent(log.getUserAgent());
        dto.setCreatedAt(log.getCreatedAt());
        
        // Convert user info
        if (log.getUser() != null) {
            ActivityLogDTO.UserBasicDTO userDTO = new ActivityLogDTO.UserBasicDTO(
                log.getUser().getId(),
                log.getUser().getFullName(),
                log.getUser().getEmail(),
                log.getUser().getAvatarUrl()
            );
            dto.setUser(userDTO);
        }
        
        return dto;
    }
}
