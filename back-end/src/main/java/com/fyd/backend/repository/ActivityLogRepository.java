package com.fyd.backend.repository;

import com.fyd.backend.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * Repository for ActivityLog entity
 * Provides methods for querying activity logs with various filters
 */
@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    
    /**
     * Find logs by user ID with pagination
     */
    Page<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    /**
     * Find logs by action type with pagination
     */
    Page<ActivityLog> findByActionOrderByCreatedAtDesc(String action, Pageable pageable);
    
    /**
     * Find logs by entity type with pagination
     */
    Page<ActivityLog> findByEntityTypeOrderByCreatedAtDesc(String entityType, Pageable pageable);
    
    /**
     * Find logs by entity type and entity ID
     */
    Page<ActivityLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
        String entityType, Long entityId, Pageable pageable
    );
    
    /**
     * Find logs within date range
     */
    Page<ActivityLog> findByCreatedAtBetweenOrderByCreatedAtDesc(
        LocalDateTime startDate, LocalDateTime endDate, Pageable pageable
    );
    
    /**
     * Complex query with multiple filters
     */
    @Query("SELECT al FROM ActivityLog al WHERE " +
           "(:userId IS NULL OR al.user.id = :userId) AND " +
           "(:action IS NULL OR al.action = :action) AND " +
           "(:entityType IS NULL OR al.entityType = :entityType) AND " +
           "(:startDate IS NULL OR al.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR al.createdAt <= :endDate) " +
           "ORDER BY al.createdAt DESC")
    Page<ActivityLog> findWithFilters(
        @Param("userId") Long userId,
        @Param("action") String action,
        @Param("entityType") String entityType,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
}
