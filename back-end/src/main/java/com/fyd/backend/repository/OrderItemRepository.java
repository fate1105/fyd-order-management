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
    
    // Get quantity sold by variant ID since a given date
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi " +
           "WHERE oi.variant.id = :variantId AND oi.order.status = 'DELIVERED' " +
           "AND oi.order.createdAt >= :from")
    Integer getQuantitySoldByVariantFrom(@Param("variantId") Long variantId, @Param("from") LocalDateTime from);
    
    // Find products frequently bought together
    @Query("SELECT oi1.productName, oi2.productName, COUNT(DISTINCT oi1.order.id) " +
           "FROM OrderItem oi1 JOIN OrderItem oi2 ON oi1.order.id = oi2.order.id " +
           "WHERE oi1.product.id < oi2.product.id AND oi1.order.createdAt >= :from " +
           "AND oi1.order.status = 'DELIVERED' " +
           "GROUP BY oi1.productName, oi2.productName " +
           "HAVING COUNT(DISTINCT oi1.order.id) >= 2 " +
           "ORDER BY COUNT(DISTINCT oi1.order.id) DESC")
    List<Object[]> getFrequentlyBoughtTogether(@Param("from") LocalDateTime from);
}
