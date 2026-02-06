package com.fyd.backend.repository;

import com.fyd.backend.entity.LuckySpinReward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for LuckySpinReward entity.
 */
@Repository
public interface LuckySpinRewardRepository extends JpaRepository<LuckySpinReward, Long> {

    /**
     * Find all active rewards for a program, ordered by sort_order
     */
    List<LuckySpinReward> findByProgramIdAndIsActiveTrueOrderBySortOrderAsc(Long programId);

    /**
     * Find all rewards for a program, ordered by sort_order
     */
    List<LuckySpinReward> findByProgramIdOrderBySortOrderAsc(Long programId);

    /**
     * Count active rewards for a program
     */
    int countByProgramIdAndIsActiveTrue(Long programId);
}
