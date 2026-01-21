package com.fyd.backend.controller;

import com.fyd.backend.entity.Notification;
import com.fyd.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    // Get all notifications
    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean unreadOnly) {
        
        List<Notification> notifications;
        
        if (unreadOnly != null && unreadOnly) {
            notifications = notificationRepository.findByIsReadFalseOrderByTimestampDesc();
        } else if (type != null && !type.isEmpty() && !type.equals("all")) {
            notifications = notificationRepository.findByTypeOrderByTimestampDesc(type);
        } else {
            notifications = notificationRepository.findAllByOrderByTimestampDesc();
        }

        // Convert to DTOs
        List<Map<String, Object>> notificationDTOs = notifications.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        // Calculate counts
        Map<String, Long> counts = new HashMap<>();
        List<Notification> all = notificationRepository.findAll();
        counts.put("all", (long) all.size());
        counts.put("unread", all.stream().filter(n -> !n.getIsRead()).count());
        counts.put("order", all.stream().filter(n -> "order".equals(n.getType())).count());
        counts.put("inventory", all.stream().filter(n -> "inventory".equals(n.getType())).count());
        counts.put("customer", all.stream().filter(n -> "customer".equals(n.getType())).count());
        counts.put("system", all.stream().filter(n -> "system".equals(n.getType())).count());

        Map<String, Object> response = new HashMap<>();
        response.put("notifications", notificationDTOs);
        response.put("counts", counts);
        response.put("unreadCount", counts.get("unread"));

        return ResponseEntity.ok(response);
    }

    // Mark single notification as read
    @PatchMapping("/{id}/read")
    @Transactional
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id) {
        return notificationRepository.findById(id)
                .map(notification -> {
                    notification.setIsRead(true);
                    notificationRepository.save(notification);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("notification", toDTO(notification));
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Mark all notifications as read
    @PatchMapping("/read-all")
    @Transactional
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        int updated = notificationRepository.markAllAsRead();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("updatedCount", updated);
        return ResponseEntity.ok(response);
    }

    // Delete notification
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteNotification(@PathVariable Long id) {
        if (!notificationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        notificationRepository.deleteById(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    // Create notification (for internal use or testing)
    @PostMapping
    @Transactional
    public ResponseEntity<Map<String, Object>> createNotification(@RequestBody Map<String, Object> request) {
        Notification notification = new Notification();
        notification.setType((String) request.getOrDefault("type", "system"));
        notification.setPriority((String) request.getOrDefault("priority", "medium"));
        notification.setTitle((String) request.get("title"));
        notification.setDescription((String) request.get("description"));
        notification.setActionType((String) request.getOrDefault("actionType", "none"));
        notification.setActionUrl((String) request.get("actionUrl"));
        
        if (request.containsKey("metadata")) {
            notification.setMetadata(request.get("metadata").toString());
        }

        Notification saved = notificationRepository.save(notification);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("notification", toDTO(saved));
        return ResponseEntity.ok(response);
    }

    // Convert entity to DTO
    private Map<String, Object> toDTO(Notification n) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", n.getId().toString());
        dto.put("type", n.getType());
        dto.put("priority", n.getPriority());
        dto.put("title", n.getTitle());
        dto.put("description", n.getDescription());
        dto.put("timestamp", n.getTimestamp().toString());
        dto.put("isRead", n.getIsRead());
        
        Map<String, Object> action = new HashMap<>();
        action.put("type", n.getActionType());
        action.put("url", n.getActionUrl());
        dto.put("action", action);
        
        dto.put("metadata", n.getMetadata());
        return dto;
    }
}
