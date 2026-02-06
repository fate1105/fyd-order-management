package com.fyd.backend.aspect;

import com.fyd.backend.annotation.Loggable;
import com.fyd.backend.entity.User;
import com.fyd.backend.service.ActivityLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

/**
 * AOP Aspect for automatic activity logging
 * Intercepts methods annotated with @Loggable
 */
@Aspect
@Component
public class LoggingAspect {
    
    @Autowired
    private ActivityLogService activityLogService;
    
    /**
     * Around advice for @Loggable methods
     * Captures old data, executes method, captures new data, and logs activity
     */
    @Around("@annotation(com.fyd.backend.annotation.Loggable)")
    public Object logActivity(ProceedingJoinPoint joinPoint) throws Throwable {
        System.out.println("=== LoggingAspect triggered! ===");
        
        // Get method signature and annotation
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Loggable loggable = method.getAnnotation(Loggable.class);
        
        System.out.println("Method: " + method.getName());
        System.out.println("Loggable: " + loggable);
        
        if (loggable == null) {
            return joinPoint.proceed();
        }
        
        String action = loggable.action();
        String entityType = loggable.entityType();
        
        System.out.println("Action: " + action + ", EntityType: " + entityType);
        
        // Get current user
        User user = getCurrentUser();
        if (user == null) {
            System.out.println("No user authenticated, skipping log");
            // If no user is authenticated, just proceed without logging
            return joinPoint.proceed();
        }
        
        System.out.println("User: " + user.getUsername());
        
        // Get HTTP request info
        String ipAddress = getClientIpAddress();
        String userAgent = getUserAgent();
        
        Object oldData = null;
        Object newData = null;
        Long entityId = null;
        String entityName = null;
        
        try {
            // For UPDATE and DELETE, try to capture old data
            if ("UPDATE".equals(action) || "DELETE".equals(action)) {
                oldData = captureOldData(joinPoint);
            }
            
            // Execute the actual method
            Object result = joinPoint.proceed();
            
            // For CREATE and UPDATE, capture new data
            if ("CREATE".equals(action) || "UPDATE".equals(action)) {
                newData = captureNewData(joinPoint, result);
            }
            
            // Extract entity ID and name
            entityId = extractEntityId(joinPoint, result);
            entityName = extractEntityName(joinPoint, result);
            
            // Log the activity asynchronously
            activityLogService.logActivity(
                user, action, entityType, entityId, entityName,
                oldData, newData, ipAddress, userAgent
            );
            
            return result;
            
        } catch (Exception e) {
            // If method throws exception, still try to log it
            activityLogService.logActivity(
                user, action + "_FAILED", entityType, entityId, entityName,
                oldData, null, ipAddress, userAgent
            );
            throw e;
        }
    }
    
    /**
     * Get current authenticated user
     */
    private User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                return (User) authentication.getPrincipal();
            }
        } catch (Exception e) {
            System.err.println("Failed to get current user: " + e.getMessage());
        }
        return null;
    }
    
    /**
     * Get client IP address from request
     */
    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = 
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                
                // Check for proxy headers
                String ip = request.getHeader("X-Forwarded-For");
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getHeader("Proxy-Client-IP");
                }
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getHeader("WL-Proxy-Client-IP");
                }
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getRemoteAddr();
                }
                
                // If multiple IPs, get the first one
                if (ip != null && ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                
                return ip;
            }
        } catch (Exception e) {
            System.err.println("Failed to get IP address: " + e.getMessage());
        }
        return null;
    }
    
    /**
     * Get user agent from request
     */
    private String getUserAgent() {
        try {
            ServletRequestAttributes attributes = 
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                return request.getHeader("User-Agent");
            }
        } catch (Exception e) {
            System.err.println("Failed to get user agent: " + e.getMessage());
        }
        return null;
    }
    
    /**
     * Capture old data before method execution
     * For UPDATE/DELETE operations
     */
    private Object captureOldData(ProceedingJoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            // First argument is usually the ID for update/delete
            if (args.length > 0 && args[0] instanceof Long) {
                // This is a simplified approach - in real implementation,
                // you might want to fetch the entity from database
                return null; // Will be implemented per controller
            }
        } catch (Exception e) {
            System.err.println("Failed to capture old data: " + e.getMessage());
        }
        return null;
    }
    
    /**
     * Capture new data after method execution
     * For CREATE/UPDATE operations
     */
    private Object captureNewData(ProceedingJoinPoint joinPoint, Object result) {
        try {
            Object[] args = joinPoint.getArgs();
            // For CREATE/UPDATE, the DTO is usually the last argument
            if (args.length > 0) {
                Object lastArg = args[args.length - 1];
                // Return the DTO or the result
                return lastArg != null ? lastArg : result;
            }
            return result;
        } catch (Exception e) {
            System.err.println("Failed to capture new data: " + e.getMessage());
        }
        return null;
    }
    
    /**
     * Extract entity ID from method arguments or result
     */
    private Long extractEntityId(ProceedingJoinPoint joinPoint, Object result) {
        try {
            Object[] args = joinPoint.getArgs();
            // First argument is usually the ID
            if (args.length > 0 && args[0] instanceof Long) {
                return (Long) args[0];
            }
            
            // Try to get ID from result using reflection
            if (result != null) {
                try {
                    Method getIdMethod = result.getClass().getMethod("getId");
                    Object id = getIdMethod.invoke(result);
                    if (id instanceof Long) {
                        return (Long) id;
                    }
                } catch (NoSuchMethodException e) {
                    // No getId method, that's okay
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to extract entity ID: " + e.getMessage());
        }
        return null;
    }
    
    /**
     * Extract entity name from method arguments or result
     */
    private String extractEntityName(ProceedingJoinPoint joinPoint, Object result) {
        try {
            // Try to get name from result using reflection
            if (result != null) {
                try {
                    Method getNameMethod = result.getClass().getMethod("getName");
                    Object name = getNameMethod.invoke(result);
                    if (name instanceof String) {
                        return (String) name;
                    }
                } catch (NoSuchMethodException e) {
                    // Try getSku for products
                    try {
                        Method getSkuMethod = result.getClass().getMethod("getSku");
                        Object sku = getSkuMethod.invoke(result);
                        if (sku instanceof String) {
                            return (String) sku;
                        }
                    } catch (NoSuchMethodException e2) {
                        // No name or sku method, that's okay
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to extract entity name: " + e.getMessage());
        }
        return null;
    }
}
