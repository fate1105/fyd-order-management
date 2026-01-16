package com.fyd.backend.repository;

import com.fyd.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
    
    @Query("SELECT oi.product.id, oi.productName, SUM(oi.quantity), SUM(oi.lineTotal) " +
           "FROM OrderItem oi WHERE oi.order.status = 'DELIVERED' " +
           "GROUP BY oi.product.id, oi.productName ORDER BY SUM(oi.lineTotal) DESC")
    List<Object[]> getTopProductsByRevenue();
    
    @Query("SELECT oi.product.id, oi.productName, SUM(oi.quantity), SUM(oi.lineTotal) " +
           "FROM OrderItem oi WHERE oi.order.status = 'DELIVERED' AND oi.order.createdAt >= :from " +
           "GROUP BY oi.product.id, oi.productName ORDER BY SUM(oi.lineTotal) DESC")
    List<Object[]> getTopProductsByRevenueFrom(@Param("from") LocalDateTime from);
}
