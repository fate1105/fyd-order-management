package com.fyd.backend.repository;

import com.fyd.backend.entity.LuckySpinHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for LuckySpinHistory entity.
 */
@Repository
public interface LuckySpinHistoryRepository extends JpaRepository<LuckySpinHistory, Long> {

    /**
     * Count spins by customer on a specific date for a program
     * Used to check daily spin limit
     */
    int countByCustomerIdAndProgramIdAndSpinDate(Long customerId, Long programId, LocalDate spinDate);

    /**
     * Count FREE spins by customer on a specific date for a program
     */
    int countByCustomerIdAndProgramIdAndSpinDateAndSpinType(Long customerId, Long programId, LocalDate spinDate, String spinType);

    /**
     * Find spin history for a customer
     */
    List<LuckySpinHistory> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    /**
     * Find recent spin history for a customer (limited)
     */
    @Query("SELECT h FROM LuckySpinHistory h WHERE h.customer.id = :customerId ORDER BY h.createdAt DESC")
    List<LuckySpinHistory> findRecentByCustomerId(Long customerId);
}
