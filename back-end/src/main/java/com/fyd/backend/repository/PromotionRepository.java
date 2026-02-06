package com.fyd.backend.repository;

import com.fyd.backend.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    
    Optional<Promotion> findByCode(String code);
    
    Optional<Promotion> findByCodeIgnoreCase(String code);
    
    List<Promotion> findByIsActiveTrue();
    
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
           "(p.startDate IS NULL OR p.startDate <= CURRENT_TIMESTAMP) AND " +
           "(p.endDate IS NULL OR p.endDate >= CURRENT_TIMESTAMP) AND " +
           "(p.usageLimit IS NULL OR p.usedCount < p.usageLimit)")
    List<Promotion> findAllValidPromotions();

    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND p.isFlashSale = true AND " +
           "(p.startDate IS NULL OR p.startDate <= CURRENT_TIMESTAMP) AND " +
           "(p.endDate IS NULL OR p.endDate >= CURRENT_TIMESTAMP) AND " +
           "(p.usageLimit IS NULL OR p.usedCount < p.usageLimit)")
    List<Promotion> findActiveFlashSales();
    
    boolean existsByCode(String code);
}
