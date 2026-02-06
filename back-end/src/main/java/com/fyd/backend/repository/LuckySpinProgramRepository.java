package com.fyd.backend.repository;

import com.fyd.backend.entity.LuckySpinProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository for LuckySpinProgram entity.
 */
@Repository
public interface LuckySpinProgramRepository extends JpaRepository<LuckySpinProgram, Long> {

    /**
     * Find the currently active program
     */
    @Query("SELECT p FROM LuckySpinProgram p WHERE p.isActive = true " +
           "AND p.startDate <= :now AND p.endDate >= :now")
    Optional<LuckySpinProgram> findActiveProgram(LocalDateTime now);

    /**
     * Find active program with simplified query
     */
    Optional<LuckySpinProgram> findFirstByIsActiveTrueAndStartDateBeforeAndEndDateAfterOrderByCreatedAtDesc(
            LocalDateTime startDate, LocalDateTime endDate);
}
