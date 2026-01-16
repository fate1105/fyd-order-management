package com.fyd.backend.repository;

import com.fyd.backend.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderCode(String orderCode);
    
    List<Order> findByStatus(String status);
    
    List<Order> findByCustomerId(Long customerId);
    
    @Query("SELECT o FROM Order o WHERE " +
           "(LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(o.shippingName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(o.shippingPhone) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Order> search(@Param("q") String q, Pageable pageable);
    
    @Query("SELECT o FROM Order o WHERE o.status = :status")
    Page<Order> findByStatus(@Param("status") String status, Pageable pageable);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(@Param("status") String status);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED' OR o.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE (o.status = 'DELIVERED' OR o.status = 'COMPLETED') AND o.createdAt >= :from")
    BigDecimal getRevenueFrom(@Param("from") LocalDateTime from);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE (o.status = 'DELIVERED' OR o.status = 'COMPLETED') AND o.createdAt BETWEEN :from AND :to")
    BigDecimal getRevenueBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
    
    @Query("SELECT o FROM Order o WHERE o.createdAt >= :from ORDER BY o.createdAt DESC")
    List<Order> findRecentOrders(@Param("from") LocalDateTime from);
    
    @Query(value = "SELECT DATE(o.created_at) as date, SUM(o.total_amount) as total FROM orders o " +
           "WHERE (o.status = 'DELIVERED' OR o.status = 'COMPLETED') AND o.created_at >= :from " +
           "GROUP BY DATE(o.created_at) ORDER BY date", nativeQuery = true)
    List<Object[]> getDailyRevenue(@Param("from") LocalDateTime from);
}
