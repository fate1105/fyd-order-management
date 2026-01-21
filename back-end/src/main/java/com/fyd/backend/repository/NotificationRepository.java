package com.fyd.backend.repository;

import com.fyd.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get all notifications for a user, ordered by timestamp desc (newest first)
    List<Notification> findByUserIdOrderByTimestampDesc(Long userId);

    // Get all notifications (for admin who doesn't have specific user)
    List<Notification> findAllByOrderByTimestampDesc();

    // Count unread notifications for a user
    long countByUserIdAndIsReadFalse(Long userId);

    // Count all unread notifications
    long countByIsReadFalse();

    // Mark all notifications as read for a user
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    int markAllAsReadByUserId(@Param("userId") Long userId);

    // Mark all notifications as read (global)
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.isRead = false")
    int markAllAsRead();

    // Find by type
    List<Notification> findByTypeOrderByTimestampDesc(String type);

    // Find unread notifications
    List<Notification> findByIsReadFalseOrderByTimestampDesc();
}
